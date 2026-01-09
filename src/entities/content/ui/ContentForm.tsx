/**
 * Content Form Component
 * Form for uploading SCORM packages and media files
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { Progress } from '@/shared/ui/progress';
import { Upload, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useUploadScormPackage, useUploadMediaFile } from '../model/useContent';
import type { MediaType } from '../model/types';

type FormMode = 'scorm' | 'media';

interface ContentFormProps {
  mode?: FormMode;
  departmentId?: string;
  onSuccess?: (id: string) => void;
  onCancel?: () => void;
}

interface ScormFormInputs {
  title?: string;
  description?: string;
  departmentId?: string;
}

interface MediaFormInputs {
  title: string;
  description?: string;
  departmentId?: string;
  type: MediaType;
}

export function ContentForm({
  mode = 'scorm',
  departmentId,
  onSuccess,
  onCancel,
}: ContentFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedThumbnail, setSelectedThumbnail] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');

  const scormForm = useForm<ScormFormInputs>({
    defaultValues: {
      departmentId: departmentId,
    },
  });

  const mediaForm = useForm<MediaFormInputs>({
    defaultValues: {
      departmentId: departmentId,
      type: 'video',
    },
  });

  const uploadScorm = useUploadScormPackage({
    onSuccess: (data) => {
      setUploadStatus('success');
      setUploadProgress(100);
      if (onSuccess) {
        onSuccess(data.id);
      }
    },
    onError: () => {
      setUploadStatus('error');
    },
  });

  const uploadMedia = useUploadMediaFile({
    onSuccess: (data) => {
      setUploadStatus('success');
      setUploadProgress(100);
      if (onSuccess) {
        onSuccess(data.id);
      }
    },
    onError: () => {
      setUploadStatus('error');
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadStatus('idle');
      setUploadProgress(0);
    }
  };

  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedThumbnail(file);
    }
  };

  const handleScormSubmit = scormForm.handleSubmit((data) => {
    if (!selectedFile) return;

    setUploadStatus('uploading');
    setUploadProgress(0);

    uploadScorm.mutate({
      payload: {
        file: selectedFile,
        title: data.title,
        description: data.description,
        departmentId: data.departmentId,
        thumbnail: selectedThumbnail || undefined,
      },
      onProgress: (progress) => {
        setUploadProgress(progress);
      },
    });
  });

  const handleMediaSubmit = mediaForm.handleSubmit((data) => {
    if (!selectedFile) return;

    setUploadStatus('uploading');
    setUploadProgress(0);

    uploadMedia.mutate({
      payload: {
        file: selectedFile,
        title: data.title,
        description: data.description,
        departmentId: data.departmentId,
        type: data.type,
      },
      onProgress: (progress) => {
        setUploadProgress(progress);
      },
    });
  });

  const handleSubmit = mode === 'scorm' ? handleScormSubmit : handleMediaSubmit;
  const isUploading = uploadStatus === 'uploading';
  const isSuccess = uploadStatus === 'success';
  const isError = uploadStatus === 'error';

  const getAcceptedFileTypes = () => {
    if (mode === 'scorm') {
      return '.zip';
    }
    const mediaType = mediaForm.watch('type');
    switch (mediaType) {
      case 'video':
        return 'video/*,.mp4,.webm,.mov';
      case 'audio':
        return 'audio/*,.mp3,.wav,.ogg';
      case 'image':
        return 'image/*,.jpg,.jpeg,.png,.gif,.webp,.svg';
      case 'document':
        return '.pdf,.doc,.docx,.ppt,.pptx';
      default:
        return '*';
    }
  };

  const getMaxFileSize = () => {
    if (mode === 'scorm') return 100; // 100MB
    const mediaType = mediaForm.watch('type');
    switch (mediaType) {
      case 'video':
        return 500; // 500MB
      case 'audio':
        return 100; // 100MB
      case 'image':
        return 10; // 10MB
      case 'document':
        return 50; // 50MB
      default:
        return 100;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {mode === 'media' && (
        <div className="space-y-2">
          <Label htmlFor="type">Media Type</Label>
          <Select
            value={mediaForm.watch('type')}
            onValueChange={(value) => mediaForm.setValue('type', value as MediaType)}
            disabled={isUploading || isSuccess}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select media type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="video">Video</SelectItem>
              <SelectItem value="audio">Audio</SelectItem>
              <SelectItem value="image">Image</SelectItem>
              <SelectItem value="document">Document</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="file">
          {mode === 'scorm' ? 'SCORM Package (ZIP)' : 'Media File'}
        </Label>
        <div className="flex items-center gap-2">
          <Input
            id="file"
            type="file"
            accept={getAcceptedFileTypes()}
            onChange={handleFileSelect}
            disabled={isUploading || isSuccess}
            className="flex-1"
          />
          {selectedFile && (
            <div className="text-sm text-muted-foreground">
              {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Maximum file size: {getMaxFileSize()} MB
        </p>
      </div>

      {mode === 'scorm' && (
        <div className="space-y-2">
          <Label htmlFor="thumbnail">Thumbnail (Optional)</Label>
          <Input
            id="thumbnail"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleThumbnailSelect}
            disabled={isUploading || isSuccess}
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">
          Title {mode === 'scorm' && '(Optional - uses manifest title if not provided)'}
        </Label>
        <Input
          id="title"
          {...(mode === 'scorm' ? scormForm.register('title') : mediaForm.register('title'))}
          placeholder={mode === 'scorm' ? 'Override manifest title' : 'Enter title'}
          disabled={isUploading || isSuccess}
          required={mode === 'media'}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          {...(mode === 'scorm' ? scormForm.register('description') : mediaForm.register('description'))}
          placeholder="Enter description"
          disabled={isUploading || isSuccess}
          rows={3}
        />
      </div>

      {uploadProgress > 0 && uploadStatus === 'uploading' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}

      {isSuccess && (
        <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-md">
          <CheckCircle2 className="h-5 w-5" />
          <span className="text-sm font-medium">
            {mode === 'scorm' ? 'SCORM package' : 'Media file'} uploaded successfully!
          </span>
        </div>
      )}

      {isError && (
        <div className="flex items-center gap-2 text-destructive bg-destructive/10 p-3 rounded-md">
          <AlertCircle className="h-5 w-5" />
          <span className="text-sm font-medium">
            Upload failed. Please try again.
          </span>
        </div>
      )}

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isUploading}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={!selectedFile || isUploading || isSuccess}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload {mode === 'scorm' ? 'SCORM' : 'Media'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
