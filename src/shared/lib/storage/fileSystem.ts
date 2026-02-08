/**
 * File System API wrapper for SCORM packages
 * Handles downloading and storing SCORM packages locally using the File System Access API
 */

import { scormQueries } from './queries';

/**
 * Check if File System Access API is supported
 */
export function isFileSystemSupported(): boolean {
  return 'showDirectoryPicker' in window;
}

/**
 * File System API types
 */
interface FileSystemDirectoryHandle {
  name: string;
  kind: 'directory';
  getDirectoryHandle(name: string, options?: { create?: boolean }): Promise<FileSystemDirectoryHandle>;
  getFileHandle(name: string, options?: { create?: boolean }): Promise<FileSystemFileHandle>;
  removeEntry(name: string, options?: { recursive?: boolean }): Promise<void>;
  entries(): AsyncIterableIterator<[string, FileSystemHandle]>;
  values(): AsyncIterableIterator<FileSystemHandle>;
  keys(): AsyncIterableIterator<string>;
}

interface FileSystemFileHandle {
  name: string;
  kind: 'file';
  getFile(): Promise<File>;
  createWritable(): Promise<FileSystemWritableFileStream>;
}

type FileSystemHandle = FileSystemDirectoryHandle | FileSystemFileHandle;

interface FileSystemWritableFileStream extends WritableStream {
  write(data: BufferSource | Blob | string): Promise<void>;
  seek(position: number): Promise<void>;
  truncate(size: number): Promise<void>;
}

/**
 * SCORM package download result
 */
export interface SCORMDownloadResult {
  success: boolean;
  packageId: string;
  size: number;
  error?: string;
}

/**
 * SCORM file manager class
 */
export class SCORMFileManager {
  private rootHandle: FileSystemDirectoryHandle | null = null;
  private scormDirHandle: FileSystemDirectoryHandle | null = null;

  /**
   * Initialize file manager and request directory access
   */
  async initialize(): Promise<boolean> {
    if (!isFileSystemSupported()) {
      console.warn('[SCORMFileManager] File System Access API not supported');
      return false;
    }

    try {
      // Request directory picker
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.rootHandle = await (window as any).showDirectoryPicker({
        mode: 'readwrite',
        startIn: 'downloads',
      });

      // Create SCORM directory if it doesn't exist
      if (this.rootHandle) {
        this.scormDirHandle = await this.rootHandle.getDirectoryHandle('scorm-packages', {
          create: true,
        });
      }

      return true;
    } catch (error) {
      console.error('[SCORMFileManager] Failed to initialize:', error);
      return false;
    }
  }

  /**
   * Check if file manager is initialized
   */
  isInitialized(): boolean {
    return this.scormDirHandle !== null;
  }

  /**
   * Download SCORM package from URL
   */
  async downloadPackage(
    packageId: string,
    packageUrl: string,
    onProgress?: (progress: number) => void
  ): Promise<SCORMDownloadResult> {
    if (!this.isInitialized()) {
      return {
        success: false,
        packageId,
        size: 0,
        error: 'File manager not initialized',
      };
    }

    try {
      // Fetch the SCORM package
      const response = await fetch(packageUrl);
      if (!response.ok) {
        throw new Error(`Failed to download package: ${response.statusText}`);
      }

      const contentLength = parseInt(response.headers.get('content-length') || '0');
      const blob = await this.downloadWithProgress(response, contentLength, onProgress);

      // Create directory for this package
      const packageDir = await this.scormDirHandle!.getDirectoryHandle(packageId, {
        create: true,
      });

      // Save the package file
      await this.savePackageToDirectory(packageDir, blob, `${packageId}.zip`);

      // Update database
      await scormQueries.markDownloaded(packageId, packageId);

      return {
        success: true,
        packageId,
        size: blob.size,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[SCORMFileManager] Failed to download package ${packageId}:`, error);

      return {
        success: false,
        packageId,
        size: 0,
        error: errorMessage,
      };
    }
  }

  /**
   * Download with progress tracking
   */
  private async downloadWithProgress(
    response: Response,
    contentLength: number,
    onProgress?: (progress: number) => void
  ): Promise<Blob> {
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is null');
    }

    const chunks: Uint8Array[] = [];
    let receivedLength = 0;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      chunks.push(value);
      receivedLength += value.length;

      if (onProgress && contentLength > 0) {
        const progress = (receivedLength / contentLength) * 100;
        onProgress(progress);
      }
    }

    // Concatenate chunks into single Uint8Array
    const allChunks = new Uint8Array(receivedLength);
    let position = 0;
    for (const chunk of chunks) {
      allChunks.set(chunk, position);
      position += chunk.length;
    }

    return new Blob([allChunks]);
  }

  /**
   * Save package to directory
   */
  private async savePackageToDirectory(
    dirHandle: FileSystemDirectoryHandle,
    blob: Blob,
    fileName: string
  ): Promise<void> {
    const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(blob);
    await writable.close();
  }

  /**
   * Get SCORM package file
   */
  async getPackageFile(packageId: string): Promise<File | null> {
    if (!this.isInitialized()) {
      console.error('[SCORMFileManager] File manager not initialized');
      return null;
    }

    try {
      const packageDir = await this.scormDirHandle!.getDirectoryHandle(packageId);
      const fileHandle = await packageDir.getFileHandle(`${packageId}.zip`);
      return await fileHandle.getFile();
    } catch (error) {
      console.error(`[SCORMFileManager] Failed to get package file ${packageId}:`, error);
      return null;
    }
  }

  /**
   * Delete SCORM package
   */
  async deletePackage(packageId: string): Promise<boolean> {
    if (!this.isInitialized()) {
      console.error('[SCORMFileManager] File manager not initialized');
      return false;
    }

    try {
      await this.scormDirHandle!.removeEntry(packageId, { recursive: true });
      await scormQueries.getById(packageId).then((pkg) => {
        if (pkg) {
          scormQueries.upsert({
            ...pkg,
            isDownloaded: false,
            downloadedAt: undefined,
            fileHandleId: undefined,
          });
        }
      });

      return true;
    } catch (error) {
      console.error(`[SCORMFileManager] Failed to delete package ${packageId}:`, error);
      return false;
    }
  }

  /**
   * List all downloaded packages
   */
  async listDownloadedPackages(): Promise<string[]> {
    if (!this.isInitialized()) {
      return [];
    }

    const packages: string[] = [];
    try {
      for await (const [name] of this.scormDirHandle!.entries()) {
        packages.push(name);
      }
    } catch (error) {
      console.error('[SCORMFileManager] Failed to list packages:', error);
    }

    return packages;
  }

  /**
   * Get total size of downloaded packages
   */
  async getTotalSize(): Promise<number> {
    if (!this.isInitialized()) {
      return 0;
    }

    let totalSize = 0;

    try {
      for await (const [name] of this.scormDirHandle!.entries()) {
        const dirHandle = await this.scormDirHandle!.getDirectoryHandle(name);
        const fileHandle = await dirHandle.getFileHandle(`${name}.zip`);
        const file = await fileHandle.getFile();
        totalSize += file.size;
      }
    } catch (error) {
      console.error('[SCORMFileManager] Failed to calculate total size:', error);
    }

    return totalSize;
  }

  /**
   * Clear all SCORM packages
   */
  async clearAll(): Promise<boolean> {
    if (!this.isInitialized()) {
      return false;
    }

    try {
      const packages = await this.listDownloadedPackages();
      for (const packageId of packages) {
        await this.deletePackage(packageId);
      }

      return true;
    } catch (error) {
      console.error('[SCORMFileManager] Failed to clear packages:', error);
      return false;
    }
  }
}

/**
 * Global SCORM file manager instance
 */
let globalSCORMManager: SCORMFileManager | null = null;

/**
 * Initialize global SCORM file manager
 */
export async function initSCORMFileManager(): Promise<SCORMFileManager> {
  if (!globalSCORMManager) {
    globalSCORMManager = new SCORMFileManager();
    await globalSCORMManager.initialize();
  }
  return globalSCORMManager;
}

/**
 * Get global SCORM file manager instance
 */
export function getSCORMFileManager(): SCORMFileManager {
  if (!globalSCORMManager) {
    throw new Error('SCORM file manager not initialized. Call initSCORMFileManager() first.');
  }
  return globalSCORMManager;
}

/**
 * Format bytes to human-readable size
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
