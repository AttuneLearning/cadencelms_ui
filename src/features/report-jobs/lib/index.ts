/**
 * Report Jobs Library Exports
 * Utilities for job polling and downloading
 */

// Polling
export { useJobPolling } from './useJobPolling';
export type { UseJobPollingOptions, UseJobPollingResult } from './useJobPolling';
export {
  shouldPollJobState,
  isTerminalJobState,
  getPollingInterval,
  calculateBackoff,
  isTransientError,
} from './pollingUtils';

// Downloading
export { useReportDownload } from './useReportDownload';
export type { UseReportDownloadOptions, UseReportDownloadResult } from './useReportDownload';
export {
  getMimeType,
  getFileExtension,
  generateFilename,
  triggerDownload,
  downloadFile,
  isUrlExpired,
  formatFileSize,
} from './downloadUtils';
