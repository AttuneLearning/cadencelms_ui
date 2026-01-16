/**
 * useJobPolling Hook
 * Advanced polling hook with start/stop controls and error handling
 */

import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useReportJobStatus } from '@/entities/report-job';
import { reportJobKeys } from '@/entities/report-job/model/reportJobKeys';
import {
  shouldPollJobState,
  isTerminalJobState,
  getPollingInterval,
  calculateBackoff,
  isTransientError,
} from './pollingUtils';
import type { ReportJobState } from '@/entities/report-job';

export interface UseJobPollingOptions {
  jobId: string;
  enabled?: boolean;
  onComplete?: (jobId: string, state: ReportJobState) => void;
  onError?: (jobId: string, error: any) => void;
  maxRetries?: number;
}

export interface UseJobPollingResult {
  isPolling: boolean;
  state: ReportJobState | undefined;
  progress: number;
  error: any;
  startPolling: () => void;
  stopPolling: () => void;
}

export function useJobPolling({
  jobId,
  enabled = true,
  onComplete,
  onError,
  maxRetries = 5,
}: UseJobPollingOptions): UseJobPollingResult {
  const queryClient = useQueryClient();
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const isPollingRef = useRef(false);

  // Use the existing status hook but with custom polling logic
  const {
    data: statusData,
    error,
    refetch,
  } = useReportJobStatus(jobId, {
    enabled: false, // Disable automatic polling, we'll control it manually
    retry: false, // Handle retries manually
  });

  const state = statusData?.state;
  const progress = statusData?.progress || 0;

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    isPollingRef.current = false;
  }, []);

  const poll = useCallback(async () => {
    if (!enabled || !isPollingRef.current) {
      stopPolling();
      return;
    }

    try {
      const result = await refetch();

      if (result.data?.state) {
        const currentState = result.data.state;

        // Reset retry count on successful fetch
        retryCountRef.current = 0;

        // Check if job reached terminal state
        if (isTerminalJobState(currentState)) {
          stopPolling();
          onComplete?.(jobId, currentState);
          return;
        }

        // If state no longer needs polling, stop
        if (!shouldPollJobState(currentState)) {
          stopPolling();
          return;
        }

        // Adjust polling interval based on state
        const newInterval = getPollingInterval(currentState);
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = setInterval(poll, newInterval);
        }
      }
    } catch (err: any) {
      // Handle errors with exponential backoff
      if (isTransientError(err) && retryCountRef.current < maxRetries) {
        retryCountRef.current++;
        const backoffInterval = calculateBackoff(retryCountRef.current);

        // Clear current interval and create new one with backoff
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = setInterval(poll, backoffInterval);
        }
      } else {
        // Max retries reached or non-transient error
        stopPolling();
        onError?.(jobId, err);
      }
    }
  }, [enabled, jobId, refetch, onComplete, onError, maxRetries, stopPolling]);

  const startPolling = useCallback(() => {
    if (isPollingRef.current) {
      return; // Already polling
    }

    isPollingRef.current = true;
    retryCountRef.current = 0;

    // Do initial fetch
    poll();

    // Set up interval for subsequent fetches
    const initialInterval = state ? getPollingInterval(state) : 2000;
    pollingIntervalRef.current = setInterval(poll, initialInterval);
  }, [poll, state]);

  // Auto-start polling if enabled and job is in active state
  useEffect(() => {
    if (enabled && state && shouldPollJobState(state)) {
      startPolling();
    }

    return () => {
      stopPolling();
    };
  }, [enabled, state, startPolling, stopPolling]);

  // Invalidate job query when polling stops to ensure fresh data
  useEffect(() => {
    if (!isPollingRef.current && state && isTerminalJobState(state)) {
      queryClient.invalidateQueries({ queryKey: reportJobKeys.detail(jobId) });
    }
  }, [jobId, state, queryClient]);

  return {
    isPolling: isPollingRef.current,
    state,
    progress,
    error,
    startPolling,
    stopPolling,
  };
}
