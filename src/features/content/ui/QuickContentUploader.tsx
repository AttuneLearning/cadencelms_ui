/**
 * Quick Content Uploader Component
 * Compact version for inline content uploads
 */

import React, { useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Progress } from '@/shared/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { useToast } from '@/shared/ui/use-toast';
import { useUploadScormPackage, useUploadMediaFile, type MediaType } from '@/entities/content';

type UploadType = 'scorm' | 'video' | 'audio' | 'document' | 'image';

interface QuickContentUploaderProps {
  type?: UploadType;
  departmentId?: string;
  onSuccess?: (contentId: string) => void;
  trigger?: React.ReactNode;
}

export const QuickContentUploader: React.FC<QuickContentUploaderProps> = ({
  type = 'scorm',
  departmentId,
  onSuccess,
  trigger,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const { toast } = useToast();

  const uploadScorm = useUploadScormPackage({
    onSuccess: (data) => {
      toast({
        title: 'SCORM package uploaded',
        description: `${data.title} has been successfully uploaded.`,
      });
      if (onSuccess) {
        onSuccess(data.id);
      }
      handleClose();
    },
    onError: (error) => {
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload SCORM package.',
        variant: 'destructive',
      });
    },
  });

  const uploadMedia = useUploadMediaFile({
    onSuccess: (data) => {
      toast({
        title: 'Media file uploaded',
        description: `${data.title} has been successfully uploaded.`,
      });
      if (onSuccess) {
        onSuccess(data.id);
      }
      handleClose();
    },
    onError: (error) => {
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload media file.',
        variant: 'destructive',
      });
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadProgress(0);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) {
      toast({
        title: 'No file selected',
        description: 'Please select a file to upload.',
        variant: 'destructive',
      });
      return;
    }

    if (type === 'scorm') {
      uploadScorm.mutate({
        payload: {
          file: selectedFile,
          title: title || undefined,
          description: description || undefined,
          departmentId: departmentId,
        },
        onProgress: (progress) => {
          setUploadProgress(progress);
        },
      });
    } else {
      if (!title.trim()) {
        toast({
          title: 'Title required',
          description: 'Please enter a title for the media file.',
          variant: 'destructive',
        });
        return;
      }

      const mediaType: MediaType =
        type === 'video' ? 'video' :
        type === 'audio' ? 'audio' :
        type === 'image' ? 'image' : 'document';

      uploadMedia.mutate({
        payload: {
          file: selectedFile,
          title: title,
          description: description || undefined,
          departmentId: departmentId,
          type: mediaType,
        },
        onProgress: (progress) => {
          setUploadProgress(progress);
        },
      });
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedFile(null);
    setTitle('');
    setDescription('');
    setUploadProgress(0);
  };

  const getAcceptedFileTypes = () => {
    switch (type) {
      case 'scorm':
        return '.zip';
      case 'video':
        return 'video/*,.mp4,.webm,.mov';
      case 'audio':
        return 'audio/*,.mp3,.wav,.ogg';
      case 'image':
        return 'image/*,.jpg,.jpeg,.png,.gif';
      case 'document':
        return '.pdf,.doc,.docx,.ppt,.pptx';
      default:
        return '*';
    }
  };

  const getUploadLabel = () => {
    switch (type) {
      case 'scorm':
        return 'SCORM Package';
      case 'video':
        return 'Video File';
      case 'audio':
        return 'Audio File';
      case 'image':
        return 'Image File';
      case 'document':
        return 'Document';
      default:
        return 'File';
    }
  };

  const isUploading = uploadScorm.isPending || uploadMedia.isPending;

  return (
    <>
      {trigger ? (
        <div onClick={() => setIsOpen(true)}>{trigger}</div>
      ) : (
        <Button onClick={() => setIsOpen(true)}>
          <Upload className="h-4 w-4 mr-2" />
          Upload {getUploadLabel()}
        </Button>
      )}

      <Dialog open={isOpen} onOpenChange={(open) => !isUploading && setIsOpen(open)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload {getUploadLabel()}</DialogTitle>
            <DialogDescription>
              Select a file to upload to your content library
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file">
                File <span className="text-destructive">*</span>
              </Label>
              <Input
                id="file"
                type="file"
                accept={getAcceptedFileTypes()}
                onChange={handleFileSelect}
                disabled={isUploading}
              />
              {selectedFile && (
                <p className="text-xs text-muted-foreground">
                  Selected: {selectedFile.name} (
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">
                Title {type !== 'scorm' && <span className="text-destructive">*</span>}
              </Label>
              <Input
                id="title"
                placeholder={type === 'scorm' ? 'Optional - uses manifest title' : 'Enter title'}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isUploading}
                required={type !== 'scorm'}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Enter description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isUploading}
                rows={3}
              />
            </div>

            {uploadProgress > 0 && isUploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading || (type !== 'scorm' && !title.trim())}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
