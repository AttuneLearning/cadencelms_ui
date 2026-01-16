/**
 * useReportDownload Hook
 * Handle report file downloads with progress tracking
 */

import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useReportJobDownload } from '@/entities/report-job';
import { reportJobKeys } from '@/entities/report-job/model/reportJobKeys';
import {
  generateFilename,
  triggerDownload,
  downloadFile,
  isUrlExpired,
} from './downloadUtils';
import type { ReportJob } from '@/entities/report-job';

export interface UseReportDownloadOptions {
  onSuccess?: (jobId: string) => void;
  onError?: (jobId: string, error: any) => void;
}

export interface UseReportDownloadResult {
  download: (job: ReportJob) => Promise<void>;
  isDownloading: boolean;
  downloadProgress: number;
  error: any;
}

export function useReportDownload({
  onSuccess,
  onError,
}: UseReportDownloadOptions = {}): UseReportDownloadResult {
  const queryClient = useQueryClient();
  const downloadMutation = useReportJobDownload();

  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [error, setError] = useState<any>(null);

  const download = useCallback(
    async (job: ReportJob) => {
      if (!job || !job._id) {
        const err = new Error('Invalid job');
        setError(err);
        onError?.(job._id, err);
        return;
      }

      if (job.state !== 'ready' && job.state !== 'downloaded') {
        const err = new Error('Job is not ready for download');
        setError(err);
        onError?.(job._id, err);
        return;
      }

      setIsDownloading(true);
      setDownloadProgress(0);
      setError(null);

      try {
        // Check if job already has a download URL
        let downloadUrl = job.downloadUrl;
        let isNewUrl = false;

        // If no URL or URL is expired, get a new one
        if (!downloadUrl || isUrlExpired(downloadUrl)) {
          setDownloadProgress(10);
          const response = await downloadMutation.mutateAsync(job._id);
          downloadUrl = response.downloadUrl;
          isNewUrl = true;
        }

        if (!downloadUrl) {
          throw new Error('Failed to get download URL');
        }

        setDownloadProgress(30);

        // Generate filename
        const filename = generateFilename(
          job.name || 'report',
          job.outputFormat,
          job.completedAt ? new Date(job.completedAt) : undefined
        );

        setDownloadProgress(50);

        // Trigger download
        if (downloadUrl.startsWith('http')) {
          // For remote URLs, use direct download
          await downloadFile(downloadUrl, filename);
        } else {
          // For blob URLs or data URLs
          triggerDownload(downloadUrl, filename);
        }

        setDownloadProgress(100);

        // Invalidate job query to refresh download count
        queryClient.invalidateQueries({ queryKey: reportJobKeys.detail(job._id) });

        // Success callback
        onSuccess?.(job._id);
      } catch (err: any) {
        console.error('Download failed:', err);
        setError(err);
        onError?.(job._id, err);
      } finally {
        setIsDownloading(false);
        // Reset progress after a short delay
        setTimeout(() => setDownloadProgress(0), 1000);
      }
    },
    [downloadMutation, queryClient, onSuccess, onError]
  );

  return {
    download,
    isDownloading,
    downloadProgress,
    error,
  };
}
