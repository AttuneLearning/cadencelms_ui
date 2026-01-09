/**
 * Course Download Hook
 * Handles downloading courses and lessons for offline access
 */

import { useState, useCallback } from 'react';
import { db } from '@/shared/lib/storage/db';

export interface DownloadProgress {
  courseId: string;
  totalLessons: number;
  downloadedLessons: number;
  percentage: number;
  status: 'idle' | 'downloading' | 'completed' | 'error';
  error?: string;
}

export function useCourseDownload() {
  const [downloads, setDownloads] = useState<Record<string, DownloadProgress>>({});

  const downloadCourse = useCallback(async (courseId: string) => {
    setDownloads((prev) => ({
      ...prev,
      [courseId]: {
        courseId,
        totalLessons: 0,
        downloadedLessons: 0,
        percentage: 0,
        status: 'downloading',
      },
    }));

    try {
      // Fetch course data
      const course = await fetch(`/api/v2/courses/${courseId}`).then((r) => r.json());
      const lessons = await fetch(`/api/v2/courses/${courseId}/lessons`).then((r) =>
        r.json()
      );

      const totalLessons = lessons.length;
      setDownloads((prev) => ({
        ...prev,
        [courseId]: { ...prev[courseId], totalLessons },
      }));

      // Store course in IndexedDB
      await db.courses.put(course);

      // Download each lesson
      for (let i = 0; i < lessons.length; i++) {
        const lesson = lessons[i];
        await db.lessons.put(lesson);

        // Download lesson content if SCORM
        if (lesson.type === 'scorm' && lesson.scormPackageId) {
          const scormPackage = await fetch(
            `/api/v2/content/scorm/${lesson.scormPackageId}`
          ).then((r) => r.json());

          // Store SCORM package
          await db.scormPackages.put(scormPackage);
        }

        setDownloads((prev) => ({
          ...prev,
          [courseId]: {
            ...prev[courseId],
            downloadedLessons: i + 1,
            percentage: Math.round(((i + 1) / totalLessons) * 100),
          },
        }));
      }

      setDownloads((prev) => ({
        ...prev,
        [courseId]: {
          ...prev[courseId],
          status: 'completed',
          percentage: 100,
        },
      }));
    } catch (error) {
      setDownloads((prev) => ({
        ...prev,
        [courseId]: {
          ...prev[courseId],
          status: 'error',
          error: error instanceof Error ? error.message : 'Download failed',
        },
      }));
    }
  }, []);

  const deleteCourseOffline = useCallback(async (courseId: string) => {
    try {
      await db.courses.delete(courseId);
      await db.lessons.where('courseId').equals(courseId).delete();

      setDownloads((prev) => {
        const { [courseId]: _, ...rest } = prev;
        return rest;
      });
    } catch (error) {
      console.error('Failed to delete offline course:', error);
    }
  }, []);

  return {
    downloads,
    downloadCourse,
    deleteCourseOffline,
  };
}
