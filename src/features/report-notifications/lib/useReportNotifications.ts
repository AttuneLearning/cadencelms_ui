/**
 * useReportNotifications Hook
 * Manage report notification preferences and delivery
 */

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/shared/ui/use-toast';
import type { ReportJob } from '@/entities/report-job';

export interface NotificationPreferences {
  emailOnComplete: boolean;
  emailOnFailure: boolean;
  inAppNotifications: boolean;
  notifyForScheduled: boolean;
  emailAddress?: string;
}

export interface UseReportNotificationsOptions {
  jobId?: string;
  onJobComplete?: (job: ReportJob) => void;
  onJobFailed?: (job: ReportJob) => void;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  emailOnComplete: true,
  emailOnFailure: true,
  inAppNotifications: true,
  notifyForScheduled: true,
};

export function useReportNotifications({
  jobId: _jobId,
  onJobComplete,
  onJobFailed,
}: UseReportNotificationsOptions = {}) {
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [lastNotifiedJob, setLastNotifiedJob] = useState<string | null>(null);

  // Load preferences from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('reportNotificationPreferences');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setPreferences({ ...DEFAULT_PREFERENCES, ...parsed });
      } catch (error) {
        console.error('Failed to parse notification preferences:', error);
      }
    }
  }, []);

  // Save preferences to localStorage
  const updatePreferences = useCallback((newPreferences: Partial<NotificationPreferences>) => {
    setPreferences((prev) => {
      const updated = { ...prev, ...newPreferences };
      localStorage.setItem('reportNotificationPreferences', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Show in-app notification
  const showNotification = useCallback(
    (job: ReportJob, type: 'complete' | 'failed') => {
      if (!preferences.inAppNotifications) return;

      // Avoid duplicate notifications
      if (lastNotifiedJob === job._id) return;
      setLastNotifiedJob(job._id);

      if (type === 'complete') {
        toast({
          title: 'Report Ready',
          description: `${job.name} is ready for download.`,
          duration: 5000,
        });
        onJobComplete?.(job);
      } else {
        toast({
          title: 'Report Failed',
          description: `${job.name} failed to generate. ${job.error?.message || ''}`,
          variant: 'destructive',
          duration: 7000,
        });
        onJobFailed?.(job);
      }
    },
    [preferences.inAppNotifications, lastNotifiedJob, toast, onJobComplete, onJobFailed]
  );

  // Monitor job state changes
  const notifyJobStateChange = useCallback(
    (job: ReportJob, previousState?: string) => {
      if (!job || !preferences.inAppNotifications) return;

      // Only notify on terminal state changes
      if (job.state === 'ready' && previousState !== 'ready') {
        showNotification(job, 'complete');
      } else if (job.state === 'failed' && previousState !== 'failed') {
        showNotification(job, 'failed');
      }
    },
    [preferences.inAppNotifications, showNotification]
  );

  // Request email notification (would call API in real implementation)
  const requestEmailNotification = useCallback(
    async (job: ReportJob, type: 'complete' | 'failed') => {
      const shouldEmail =
        (type === 'complete' && preferences.emailOnComplete) ||
        (type === 'failed' && preferences.emailOnFailure);

      if (!shouldEmail) return;

      // In real implementation, would call API endpoint
      // await api.post('/api/v2/reports/notifications/email', { jobId: job._id, type });

      console.log(`Email notification requested for job ${job._id} (${type})`);
    },
    [preferences.emailOnComplete, preferences.emailOnFailure]
  );

  return {
    preferences,
    updatePreferences,
    showNotification,
    notifyJobStateChange,
    requestEmailNotification,
  };
}
