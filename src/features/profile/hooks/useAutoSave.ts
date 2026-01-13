/**
 * useAutoSave Hook
 *
 * Provides auto-save functionality with:
 * - 2-minute debounce after typing stops
 * - Immediate save on blur
 * - Error handling with retry
 * - Save status indicators
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { useDebounce } from '@/shared/hooks/useDebounce';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface UseAutoSaveOptions<T> {
  data: T;
  onSave: (data: T) => Promise<void>;
  debounceMs?: number;
  enabled?: boolean;
}

export interface UseAutoSaveReturn {
  status: SaveStatus;
  error: Error | null;
  save: () => Promise<void>;
  reset: () => void;
}

/**
 * Auto-save hook with debounce and blur triggers
 *
 * @param options - Configuration options
 * @returns Save status and control functions
 */
export function useAutoSave<T>({
  data,
  onSave,
  debounceMs = 120000, // 2 minutes
  enabled = true,
}: UseAutoSaveOptions<T>): UseAutoSaveReturn {
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [error, setError] = useState<Error | null>(null);

  // Track if this is the initial mount
  const isInitialMount = useRef(true);
  const lastSavedData = useRef<T>(data);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced data for auto-save
  const debouncedData = useDebounce(data, debounceMs);

  /**
   * Perform the save operation
   */
  const save = useCallback(async () => {
    if (!enabled) return;

    // Don't save if data hasn't changed
    if (JSON.stringify(data) === JSON.stringify(lastSavedData.current)) {
      return;
    }

    setStatus('saving');
    setError(null);

    try {
      await onSave(data);
      lastSavedData.current = data;
      setStatus('saved');

      // Reset to idle after showing saved status for 3 seconds
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        setStatus('idle');
      }, 3000);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to save');
      setError(error);
      setStatus('error');
    }
  }, [data, onSave, enabled]);

  /**
   * Reset the save status
   */
  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
  }, []);

  /**
   * Auto-save when debounced data changes (after typing stops)
   */
  useEffect(() => {
    // Skip on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Skip if not enabled
    if (!enabled) return;

    // Trigger auto-save
    save();
  }, [debouncedData, enabled, save]);

  /**
   * Cleanup timeout on unmount
   */
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    status,
    error,
    save,
    reset,
  };
}

/**
 * Hook to create blur handler for immediate save
 */
export function useBlurSave(save: () => Promise<void>) {
  return useCallback(() => {
    save();
  }, [save]);
}
