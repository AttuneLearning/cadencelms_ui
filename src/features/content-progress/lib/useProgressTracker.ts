/**
 * Progress Tracker Hook
 * Tracks time spent and auto-saves progress
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  progressApi,
  type UpdateLessonProgressRequest,
} from '@/entities/progress/api/progressApi';

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

type LessonProgressData = UpdateLessonProgressRequest['progressData'];

interface ProgressUpdateInput extends Partial<LessonProgressData> {
  lastPosition?: number | string;
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
  const autoSaveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastSavedDataRef = useRef<Partial<LessonProgressData>>({});

  // Start tracking
  const startTracking = useCallback(() => {
    if (!enabled || state.isTracking) return;

    startTimeRef.current = Date.now();
    setState((prev) => ({ ...prev, isTracking: true }));

    // Mark lesson as started
    progressApi.startLesson({ courseId, lessonId }).catch((error) => {
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
    async (data: ProgressUpdateInput) => {
      try {
        // Calculate current time spent
        let currentTimeSpent = accumulatedTimeRef.current;
        if (startTimeRef.current) {
          currentTimeSpent += Math.floor((Date.now() - startTimeRef.current) / 1000);
        }

        const normalizedLastPosition =
          data.lastPosition !== undefined ? Number(data.lastPosition) : undefined;

        const progressData: LessonProgressData = {
          ...data,
          lastPosition:
            data.lastPosition !== undefined ? String(data.lastPosition) : undefined,
          timeSpent: currentTimeSpent,
        };

        await progressApi.updateLessonProgress({
          courseId,
          lessonId,
          progressData,
        });
        lastSavedDataRef.current = progressData;

        setState((prev) => ({
          ...prev,
          timeSpent: currentTimeSpent,
          lastPosition: Number.isFinite(normalizedLastPosition)
            ? normalizedLastPosition
            : prev.lastPosition,
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
        await progressApi.completeLesson({
          courseId,
          lessonId,
          completionData: {
            ...data,
            timeSpent,
          },
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
        await progressApi.updateLessonProgress({
          courseId,
          lessonId,
          progressData: {
            timeSpent: currentTimeSpent,
            lastPosition:
              state.lastPosition !== undefined ? String(state.lastPosition) : undefined,
          },
        });

        lastSavedDataRef.current = {
          timeSpent: currentTimeSpent,
          lastPosition:
            state.lastPosition !== undefined ? String(state.lastPosition) : undefined,
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
