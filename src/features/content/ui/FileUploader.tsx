/**
 * File Uploader Component
 * Drag-and-drop file upload with progress tracking
 */

import React, { useState, useRef, useCallback } from 'react';
import { Upload, File, X, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Card } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Progress } from '@/shared/ui/progress';
import { cn } from '@/shared/lib/utils';

export interface FileConfig {
  accept: string[];
  maxSize: number; // in MB
  label: string;
}

export interface UploadedFile {
  file: File;
  preview?: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}

interface FileUploaderProps {
  config: FileConfig;
  multiple?: boolean;
  onFilesSelected: (files: File[]) => void;
  files: UploadedFile[];
  onRemoveFile: (index: number) => void;
  disabled?: boolean;
  className?: string;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  config,
  multiple = false,
  onFilesSelected,
  files,
  onRemoveFile,
  disabled = false,
  className,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback(
    (file: File): { valid: boolean; error?: string } => {
      // Check file size
      const maxSizeBytes = config.maxSize * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        return {
          valid: false,
          error: `File size exceeds ${config.maxSize}MB limit`,
        };
      }

      // Check file type
      const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
      const mimeType = file.type.toLowerCase();

      const isValidType = config.accept.some((acceptType) => {
        if (acceptType.startsWith('.')) {
          return fileExtension === acceptType.toLowerCase();
        }
        if (acceptType.endsWith('/*')) {
          const typePrefix = acceptType.split('/')[0];
          return mimeType.startsWith(typePrefix);
        }
        return mimeType === acceptType.toLowerCase();
      });

      if (!isValidType) {
        return {
          valid: false,
          error: `Invalid file type. Accepted: ${config.accept.join(', ')}`,
        };
      }

      return { valid: true };
    },
    [config]
  );

  const handleFiles = useCallback(
    (selectedFiles: FileList | null) => {
      if (!selectedFiles || selectedFiles.length === 0) return;

      setValidationError(null);

      const filesArray = Array.from(selectedFiles);

      // Validate all files
      for (const file of filesArray) {
        const validation = validateFile(file);
        if (!validation.valid) {
          setValidationError(validation.error || 'Invalid file');
          return;
        }
      }

      if (!multiple && filesArray.length > 1) {
        setValidationError('Only one file can be uploaded at a time');
        return;
      }

      onFilesSelected(filesArray);
    },
    [multiple, validateFile, onFilesSelected]
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      const droppedFiles = e.dataTransfer.files;
      handleFiles(droppedFiles);
    },
    [disabled, handleFiles]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files);
    },
    [handleFiles]
  );

  const handleClick = useCallback(() => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  }, [disabled]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return <File className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Drop Zone */}
      <Card
        className={cn(
          'border-2 border-dashed transition-colors',
          isDragging && !disabled && 'border-primary bg-primary/5',
          disabled && 'opacity-50 cursor-not-allowed',
          !disabled && 'cursor-pointer hover:border-primary/50'
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <div className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <div
              className={cn(
                'rounded-full p-3',
                isDragging ? 'bg-primary/10' : 'bg-muted'
              )}
            >
              <Upload className={cn('h-8 w-8', isDragging ? 'text-primary' : 'text-muted-foreground')} />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">
              {isDragging ? 'Drop files here' : 'Drag and drop files here'}
            </p>
            <p className="text-xs text-muted-foreground">or click to browse</p>
            <p className="text-xs text-muted-foreground">
              {config.label} (max {config.maxSize}MB)
            </p>
            {multiple && (
              <p className="text-xs text-muted-foreground">Multiple files allowed</p>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept={config.accept.join(',')}
            multiple={multiple}
            onChange={handleFileInputChange}
            disabled={disabled}
          />
        </div>
      </Card>

      {/* Validation Error */}
      {validationError && (
        <div className="flex items-start gap-2 text-destructive bg-destructive/10 p-3 rounded-md">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span className="text-sm">{validationError}</span>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((uploadedFile, index) => (
            <Card key={index} className="p-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {getStatusIcon(uploadedFile.status)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {uploadedFile.file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(uploadedFile.file.size)}
                      </p>
                      {uploadedFile.error && (
                        <p className="text-xs text-destructive mt-1">
                          {uploadedFile.error}
                        </p>
                      )}
                    </div>
                  </div>
                  {uploadedFile.status !== 'uploading' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveFile(index)}
                      disabled={disabled}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Progress Bar */}
                {uploadedFile.status === 'uploading' && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Uploading...</span>
                      <span className="font-medium">{uploadedFile.progress}%</span>
                    </div>
                    <Progress value={uploadedFile.progress} className="h-1.5" />
                  </div>
                )}

                {/* Preview for images */}
                {uploadedFile.preview && (
                  <div className="mt-2">
                    <img
                      src={uploadedFile.preview}
                      alt="Preview"
                      className="max-h-32 rounded border"
                    />
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
