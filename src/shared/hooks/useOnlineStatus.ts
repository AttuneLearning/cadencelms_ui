/**
 * Online/offline detection hook
 * Monitors network connectivity and provides online status
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * Online status interface
 */
export interface OnlineStatus {
  /**
   * Whether the device is currently online
   */
  isOnline: boolean;

  /**
   * Whether the device was offline and just came back online
   */
  wasOffline: boolean;

  /**
   * Timestamp of when the status last changed
   */
  lastChanged: number;

  /**
   * Manually check connectivity
   */
  checkConnectivity: () => Promise<boolean>;
}

/**
 * Options for useOnlineStatus hook
 */
export interface UseOnlineStatusOptions {
  /**
   * URL to ping for connectivity check
   * @default '/api/health'
   */
  pingUrl?: string;

  /**
   * Interval in milliseconds for periodic connectivity checks
   * Set to 0 to disable periodic checks
   * @default 30000 (30 seconds)
   */
  pingInterval?: number;

  /**
   * Timeout in milliseconds for ping requests
   * @default 5000 (5 seconds)
   */
  pingTimeout?: number;

  /**
   * Callback when online status changes
   */
  onStatusChange?: (isOnline: boolean) => void;

  /**
   * Callback when device comes back online
   */
  onOnline?: () => void;

  /**
   * Callback when device goes offline
   */
  onOffline?: () => void;
}

/**
 * Default options
 */
const DEFAULT_OPTIONS: Required<Omit<UseOnlineStatusOptions, 'onStatusChange' | 'onOnline' | 'onOffline'>> = {
  pingUrl: '/api/health',
  pingInterval: 30000,
  pingTimeout: 5000,
};

/**
 * Check connectivity by pinging a URL
 */
async function checkConnectivity(url: string, timeout: number): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      method: 'HEAD',
      cache: 'no-cache',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    // Network error or timeout
    return false;
  }
}

/**
 * Hook for monitoring online/offline status
 */
export function useOnlineStatus(options: UseOnlineStatusOptions = {}): OnlineStatus {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [wasOffline, setWasOffline] = useState<boolean>(false);
  const [lastChanged, setLastChanged] = useState<number>(Date.now());

  /**
   * Handle online event
   */
  const handleOnline = useCallback(() => {
    console.log('[useOnlineStatus] Device is online');
    setIsOnline(true);
    setWasOffline(true);
    setLastChanged(Date.now());

    mergedOptions.onStatusChange?.(true);
    mergedOptions.onOnline?.();

    // Clear wasOffline flag after a delay
    setTimeout(() => setWasOffline(false), 5000);
  }, [mergedOptions]);

  /**
   * Handle offline event
   */
  const handleOffline = useCallback(() => {
    console.log('[useOnlineStatus] Device is offline');
    setIsOnline(false);
    setWasOffline(false);
    setLastChanged(Date.now());

    mergedOptions.onStatusChange?.(false);
    mergedOptions.onOffline?.();
  }, [mergedOptions]);

  /**
   * Manually check connectivity
   */
  const checkConnectivityManual = useCallback(async (): Promise<boolean> => {
    const online = await checkConnectivity(mergedOptions.pingUrl, mergedOptions.pingTimeout);

    if (online !== isOnline) {
      if (online) {
        handleOnline();
      } else {
        handleOffline();
      }
    }

    return online;
  }, [isOnline, mergedOptions.pingUrl, mergedOptions.pingTimeout, handleOnline, handleOffline]);

  /**
   * Set up event listeners and periodic checks
   */
  useEffect(() => {
    // Listen to browser online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set up periodic connectivity checks
    let intervalId: NodeJS.Timeout | null = null;

    if (mergedOptions.pingInterval > 0) {
      intervalId = setInterval(() => {
        checkConnectivityManual();
      }, mergedOptions.pingInterval);
    }

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);

      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [handleOnline, handleOffline, mergedOptions.pingInterval, checkConnectivityManual]);

  return {
    isOnline,
    wasOffline,
    lastChanged,
    checkConnectivity: checkConnectivityManual,
  };
}

/**
 * Simple hook that only returns boolean online status
 */
export function useIsOnline(): boolean {
  const { isOnline } = useOnlineStatus({ pingInterval: 0 });
  return isOnline;
}

/**
 * Hook that triggers callbacks on status changes
 */
export function useOnlineStatusEffect(
  onOnline?: () => void,
  onOffline?: () => void
): boolean {
  const { isOnline } = useOnlineStatus({
    onOnline,
    onOffline,
    pingInterval: 0,
  });
  return isOnline;
}
