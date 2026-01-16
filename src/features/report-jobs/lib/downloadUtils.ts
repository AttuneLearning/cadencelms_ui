/**
 * Download Utilities
 * Helper functions for downloading report files
 */

import type { ReportOutputFormat } from '@/shared/types/report-builder';

/**
 * Get MIME type for output format
 */
export function getMimeType(format: ReportOutputFormat): string {
  const mimeTypes: Record<ReportOutputFormat, string> = {
    pdf: 'application/pdf',
    excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    csv: 'text/csv',
    json: 'application/json',
  };

  return mimeTypes[format] || 'application/octet-stream';
}

/**
 * Get file extension for output format
 */
export function getFileExtension(format: ReportOutputFormat): string {
  const extensions: Record<ReportOutputFormat, string> = {
    pdf: '.pdf',
    excel: '.xlsx',
    csv: '.csv',
    json: '.json',
  };

  return extensions[format] || '';
}

/**
 * Generate filename for report
 */
export function generateFilename(reportName: string, format: ReportOutputFormat, timestamp?: Date): string {
  const sanitizedName = reportName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const dateStr = timestamp ? formatDateForFilename(timestamp) : formatDateForFilename(new Date());
  const extension = getFileExtension(format);

  return `${sanitizedName}_${dateStr}${extension}`;
}

/**
 * Format date for filename (YYYYMMDD_HHMMSS)
 */
function formatDateForFilename(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}${month}${day}_${hours}${minutes}${seconds}`;
}

/**
 * Trigger browser download
 */
export function triggerDownload(url: string, filename: string): void {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();

  // Cleanup
  setTimeout(() => {
    document.body.removeChild(link);
    // Revoke blob URL if it's a blob
    if (url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  }, 100);
}

/**
 * Download file from URL
 */
export async function downloadFile(url: string, filename: string): Promise<void> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    triggerDownload(blobUrl, filename);
  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
}

/**
 * Check if URL is expired (for signed URLs)
 */
export function isUrlExpired(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const expiresParam = urlObj.searchParams.get('expires') || urlObj.searchParams.get('Expires');

    if (!expiresParam) {
      return false; // No expiration set
    }

    const expiresTimestamp = parseInt(expiresParam, 10);
    const now = Math.floor(Date.now() / 1000);

    return expiresTimestamp < now;
  } catch (error) {
    return false;
  }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${Math.round(bytes / Math.pow(k, i) * 100) / 100} ${sizes[i]}`;
}
