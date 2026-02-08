/**
 * Offline sync process
 * Manages background synchronization between local and server data
 */

import { getSyncEngine } from '@/shared/lib/storage/sync';
import { useOnlineStatus } from '@/shared/hooks/useOnlineStatus';
import { useEffect, useRef, useState } from 'react';

/**
 * Sync status interface
 */
export interface SyncStatus {
  isRunning: boolean;
  lastSyncAt: number | null;
  nextSyncAt: number | null;
  error: string | null;
  syncCount: number;
}

/**
 * Offline sync process configuration
 */
export interface OfflineSyncConfig {
  /**
   * Auto-sync interval in milliseconds
   * @default 60000 (1 minute)
   */
  autoSyncInterval?: number;

  /**
   * Whether to sync on online event
   * @default true
   */
  syncOnOnline?: boolean;

  /**
   * Whether to sync on page visibility change
   * @default true
   */
  syncOnVisibility?: boolean;

  /**
   * Whether to sync on app mount
   * @default true
   */
  syncOnMount?: boolean;

  /**
   * Callback when sync starts
   */
  onSyncStart?: () => void;

  /**
   * Callback when sync completes
   */
  onSyncComplete?: (result: { success: boolean; error?: string }) => void;
}

const DEFAULT_CONFIG: Required<Omit<OfflineSyncConfig, 'onSyncStart' | 'onSyncComplete'>> = {
  autoSyncInterval: 60000,
  syncOnOnline: true,
  syncOnVisibility: true,
  syncOnMount: true,
};

/**
 * Hook for managing offline sync process
 */
export function useOfflineSync(config: OfflineSyncConfig = {}) {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };

  const [status, setStatus] = useState<SyncStatus>({
    isRunning: false,
    lastSyncAt: null,
    nextSyncAt: null,
    error: null,
    syncCount: 0,
  });

  const { isOnline, wasOffline } = useOnlineStatus({
    onOnline: mergedConfig.syncOnOnline
      ? () => {
          performSync();
        }
      : undefined,
  });

  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isSyncingRef = useRef(false);

  /**
   * Perform synchronization
   */
  const performSync = async () => {
    if (isSyncingRef.current) {
      return;
    }

    if (!isOnline) {
      return;
    }

    isSyncingRef.current = true;
    setStatus((prev) => ({
      ...prev,
      isRunning: true,
      error: null,
    }));

    mergedConfig.onSyncStart?.();

    try {
      const syncEngine = getSyncEngine();
      const result = await syncEngine.fullSync();

      setStatus((prev) => ({
        isRunning: false,
        lastSyncAt: Date.now(),
        nextSyncAt: Date.now() + mergedConfig.autoSyncInterval,
        error: result.success ? null : result.errors.join(', '),
        syncCount: prev.syncCount + 1,
      }));

      mergedConfig.onSyncComplete?.({
        success: result.success,
        error: result.success ? undefined : result.errors.join(', '),
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      setStatus((prev) => ({
        ...prev,
        isRunning: false,
        error: errorMessage,
      }));

      mergedConfig.onSyncComplete?.({
        success: false,
        error: errorMessage,
      });

      console.error('[OfflineSync] Sync failed:', error);
    } finally {
      isSyncingRef.current = false;
    }
  };

  /**
   * Start auto-sync interval
   */
  const startAutoSync = () => {
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
    }

    if (mergedConfig.autoSyncInterval > 0) {
      syncIntervalRef.current = setInterval(() => {
        if (isOnline) {
          performSync();
        }
      }, mergedConfig.autoSyncInterval);

      setStatus((prev) => ({
        ...prev,
        nextSyncAt: Date.now() + mergedConfig.autoSyncInterval,
      }));
    }
  };

  /**
   * Stop auto-sync interval
   */
  const stopAutoSync = () => {
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
      syncIntervalRef.current = null;
    }

    setStatus((prev) => ({
      ...prev,
      nextSyncAt: null,
    }));
  };

  /**
   * Handle page visibility change
   */
  useEffect(() => {
    if (!mergedConfig.syncOnVisibility) {
      return;
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isOnline) {
        performSync();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isOnline, mergedConfig.syncOnVisibility]);

  /**
   * Sync on mount
   */
  useEffect(() => {
    if (mergedConfig.syncOnMount && isOnline) {
      performSync();
    }
  }, []);

  /**
   * Start/stop auto-sync based on online status
   */
  useEffect(() => {
    if (isOnline) {
      startAutoSync();
    } else {
      stopAutoSync();
    }

    return () => {
      stopAutoSync();
    };
  }, [isOnline, mergedConfig.autoSyncInterval]);

  /**
   * Sync when coming back online
   */
  useEffect(() => {
    if (wasOffline && isOnline) {
      performSync();
    }
  }, [wasOffline, isOnline]);

  return {
    status,
    isOnline,
    performSync,
    startAutoSync,
    stopAutoSync,
  };
}

/**
 * Register service worker for background sync
 */
export async function registerServiceWorkerSync(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    console.warn('[OfflineSync] Service Worker not supported');
    return false;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!('sync' in (self as any).registration || {})) {
    console.warn('[OfflineSync] Background Sync not supported');
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (registration as any).sync.register('sync-offline-data');
    return true;
  } catch (error) {
    console.error('[OfflineSync] Failed to register background sync:', error);
    return false;
  }
}

/**
 * Initialize offline sync process
 */
export async function initOfflineSync(_config: OfflineSyncConfig = {}): Promise<void> {
  // Register service worker for background sync
  await registerServiceWorkerSync();
}
