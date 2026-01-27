/**
 * File Upload Section
 * Drag-and-drop file upload with progress indicator
 */

import { useState, useCallback, useRef } from 'react';
import { Upload, X, File, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Progress } from '@/shared/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { cn } from '@/shared/lib/utils';

export interface FileUploadSectionProps {
  /** Accepted file types (e.g., ['.mp4', '.webm']) */
  accept?: string[];
  /** Maximum file size in bytes */
  maxSize?: number;
  /** Current upload progress (0-100) */
  progress?: number;
  /** Currently uploaded file URL */
  value?: string | null;
  /** Currently uploaded file name */
  fileName?: string | null;
  /** Callback when file is selected */
  onFileSelect?: (file: File) => void;
  /** Callback when upload completes */
  onUploadComplete?: (url: string) => void;
  /** Callback when file is removed */
  onRemove?: () => void;
  /** Upload progress callback */
  onProgress?: (progress: number) => void;
  /** Error callback */
  onError?: (error: string) => void;
  /** Section title */
  title?: string;
  /** Section description */
  description?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Whether upload is in progress */
  isUploading?: boolean;
  /** Error message */
  error?: string | null;
  /** Disabled state */
  disabled?: boolean;
}

/**
 * Format file size for display
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * File Upload Section Component
 *
 * Provides drag-and-drop file upload with:
 * - Drag-and-drop zone
 * - File type validation
 * - Size validation
 * - Upload progress indicator
 * - File preview with remove option
 *
 * @example
 * ```tsx
 * <FileUploadSection
 *   accept={['.mp4', '.webm', '.mp3']}
 *   maxSize={500 * 1024 * 1024}
 *   title="Media File"
 *   description="Upload a video or audio file"
 *   required
 *   onFileSelect={handleFileSelect}
 *   onUploadComplete={(url) => setValue('fileUrl', url)}
 *   progress={uploadProgress}
 *   isUploading={isUploading}
 * />
 * ```
 */
export function FileUploadSection({
  accept = [],
  maxSize = 100 * 1024 * 1024, // 100MB default
  progress = 0,
  value,
  fileName,
  onFileSelect,
  onUploadComplete: _onUploadComplete,
  onRemove,
  onProgress: _onProgress,
  onError,
  title = 'File Upload',
  description,
  required = false,
  isUploading = false,
  error,
  disabled = false,
}: FileUploadSectionProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const displayError = error || localError;

  const validateFile = useCallback(
    (file: File): string | null => {
      // Check file type
      if (accept.length > 0) {
        const fileExt = `.${file.name.split('.').pop()?.toLowerCase()}`;
        if (!accept.includes(fileExt)) {
          return `Invalid file type. Accepted: ${accept.join(', ')}`;
        }
      }

      // Check file size
      if (file.size > maxSize) {
        return `File too large. Maximum size: ${formatFileSize(maxSize)}`;
      }

      return null;
    },
    [accept, maxSize]
  );

  const handleFile = useCallback(
    (file: File) => {
      setLocalError(null);

      const validationError = validateFile(file);
      if (validationError) {
        setLocalError(validationError);
        onError?.(validationError);
        return;
      }

      onFileSelect?.(file);
    },
    [validateFile, onFileSelect, onError]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled && !isUploading) {
        setIsDragging(true);
      }
    },
    [disabled, isUploading]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      if (disabled || isUploading) return;

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFile(files[0]);
      }
    },
    [disabled, isUploading, handleFile]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
      // Reset input so same file can be selected again
      e.target.value = '';
    },
    [handleFile]
  );

  const handleBrowseClick = () => {
    inputRef.current?.click();
  };

  const handleRemove = () => {
    setLocalError(null);
    onRemove?.();
  };

  const acceptString = accept.join(',');

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">
          {title} {required && <span className="text-destructive">*</span>}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Zone */}
        {!value && !isUploading && (
          <div
            className={cn(
              'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
              isDragging && 'border-primary bg-primary/5',
              !isDragging && 'border-muted-foreground/25 hover:border-muted-foreground/50',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              ref={inputRef}
              type="file"
              accept={acceptString}
              onChange={handleInputChange}
              className="hidden"
              disabled={disabled}
            />

            <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />

            <p className="text-sm text-muted-foreground mb-2">
              Drag and drop your file here, or{' '}
              <Button
                type="button"
                variant="link"
                className="p-0 h-auto"
                onClick={handleBrowseClick}
                disabled={disabled}
              >
                browse
              </Button>
            </p>

            {accept.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Supported: {accept.join(', ')}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Max size: {formatFileSize(maxSize)}
            </p>
          </div>
        )}

        {/* Upload Progress */}
        {isUploading && (
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <File className="h-8 w-8 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{fileName || 'Uploading...'}</p>
                <p className="text-xs text-muted-foreground">{progress}% complete</p>
              </div>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Uploaded File */}
        {value && !isUploading && (
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{fileName || 'File uploaded'}</p>
                <p className="text-xs text-muted-foreground truncate">{value}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Error */}
        {displayError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{displayError}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

export default FileUploadSection;
