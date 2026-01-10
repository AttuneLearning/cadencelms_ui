/**
 * Progress Tracker Hook
 * Tracks time spent and auto-saves progress
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { progressApi } from '@/entities/progress/api/progressApi';
import type { UpdateProgressRequest as ProgressUpdate } from '@/entities/progress/model/types';

interface UseProgressTrackerOptions {
  courseId: string;
  lessonId: string;
  autoSaveInterval?: number; // in milliseconds, default 30 seconds
  enabled?: boolean;
}

interface ProgressTrackerState {
  timeSpent: number; // in seconds
  lastPosition?: number;
  isTracking: boolean;
}

export const useProgressTracker = ({
  courseId,
  lessonId,
  autoSaveInterval = 30000,
  enabled = true,
}: UseProgressTrackerOptions) => {
  const [state, setState] = useState<ProgressTrackerState>({
    timeSpent: 0,
    isTracking: false,
  });

  const startTimeRef = useRef<number | null>(null);
  const accumulatedTimeRef = useRef(0);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedDataRef = useRef<ProgressUpdate>({});

  // Start tracking
  const startTracking = useCallback(() => {
    if (!enabled || state.isTracking) return;

    startTimeRef.current = Date.now();
    setState((prev) => ({ ...prev, isTracking: true }));

    // Mark lesson as started
    progressApi.startLesson(courseId, lessonId).catch((error) => {
      console.error('Failed to mark lesson as started:', error);
    });
  }, [courseId, lessonId, enabled, state.isTracking]);

  // Stop tracking
  const stopTracking = useCallback(() => {
    if (!state.isTracking) return;

    if (startTimeRef.current) {
      const sessionTime = Math.floor((Date.now() - startTimeRef.current) / 1000);
      accumulatedTimeRef.current += sessionTime;
      startTimeRef.current = null;
    }

    setState((prev) => ({
      ...prev,
      timeSpent: accumulatedTimeRef.current,
      isTracking: false,
    }));
  }, [state.isTracking]);

  // Update progress
  const updateProgress = useCallback(
    async (data: ProgressUpdate) => {
      try {
        // Calculate current time spent
        let currentTimeSpent = accumulatedTimeRef.current;
        if (startTimeRef.current) {
          currentTimeSpent += Math.floor((Date.now() - startTimeRef.current) / 1000);
        }

        const progressData: ProgressUpdate = {
          ...data,
          timeSpent: currentTimeSpent,
        };

        await progressApi.updateLessonProgress(courseId, lessonId, progressData);
        lastSavedDataRef.current = progressData;

        setState((prev) => ({
          ...prev,
          timeSpent: currentTimeSpent,
          lastPosition: data.lastPosition,
        }));
      } catch (error) {
        console.error('Failed to update progress:', error);
      }
    },
    [courseId, lessonId]
  );

  // Complete lesson
  const completeLesson = useCallback(
    async (data?: { score?: number }) => {
      stopTracking();

      try {
        const timeSpent = accumulatedTimeRef.current;
        await progressApi.completeLesson(courseId, lessonId, {
          ...data,
          timeSpent,
        });
      } catch (error) {
        console.error('Failed to complete lesson:', error);
        throw error;
      }
    },
    [courseId, lessonId, stopTracking]
  );

  // Auto-save progress
  useEffect(() => {
    if (!enabled || !state.isTracking) return;

    const autoSave = async () => {
      let currentTimeSpent = accumulatedTimeRef.current;
      if (startTimeRef.current) {
        currentTimeSpent += Math.floor((Date.now() - startTimeRef.current) / 1000);
      }

      // Only save if time has changed significantly (more than 5 seconds)
      const timeDiff = currentTimeSpent - (lastSavedDataRef.current.timeSpent || 0);
      if (timeDiff < 5) return;

      try {
        await progressApi.updateLessonProgress(courseId, lessonId, {
          timeSpent: currentTimeSpent,
          lastPosition: state.lastPosition,
          status: 'in-progress',
        });

        lastSavedDataRef.current = {
          timeSpent: currentTimeSpent,
          lastPosition: state.lastPosition,
        };
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    };

    autoSaveTimerRef.current = setInterval(autoSave, autoSaveInterval);

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, [
    enabled,
    state.isTracking,
    state.lastPosition,
    courseId,
    lessonId,
    autoSaveInterval,
  ]);

  // Update time spent every second
  useEffect(() => {
    if (!state.isTracking) return;

    const timer = setInterval(() => {
      if (startTimeRef.current) {
        const sessionTime = Math.floor((Date.now() - startTimeRef.current) / 1000);
        const totalTime = accumulatedTimeRef.current + sessionTime;
        setState((prev) => ({ ...prev, timeSpent: totalTime }));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [state.isTracking]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTracking();
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, [stopTracking]);

  return {
    timeSpent: state.timeSpent,
    lastPosition: state.lastPosition,
    isTracking: state.isTracking,
    startTracking,
    stopTracking,
    updateProgress,
    completeLesson,
  };
};
