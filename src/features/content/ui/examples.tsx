/**
 * Content Uploader Usage Examples
 * Demonstrates how to use the content upload components
 */

import React from 'react';
import { FileUploader, ContentSelector, QuickContentUploader, type FileConfig } from './index';
import { Button } from '@/shared/ui/button';
import { Upload } from 'lucide-react';

/**
 * Example 1: Basic File Uploader
 * Upload SCORM packages with custom configuration
 */
export const ScormUploaderExample: React.FC = () => {
  const [files, setFiles] = React.useState<any[]>([]);

  const scormConfig: FileConfig = {
    accept: ['.zip', 'application/zip'],
    maxSize: 100,
    label: 'SCORM Package (.zip)',
  };

  const handleFilesSelected = (selectedFiles: File[]) => {
    const newFiles = selectedFiles.map((file) => ({
      file,
      status: 'pending' as const,
      progress: 0,
    }));
    setFiles(newFiles);
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Upload SCORM Package</h2>
      <FileUploader
        config={scormConfig}
        multiple={false}
        onFilesSelected={handleFilesSelected}
        files={files}
        onRemoveFile={handleRemoveFile}
      />
    </div>
  );
};

/**
 * Example 2: Multiple File Uploader
 * Upload multiple images at once
 */
export const ImageGalleryUploaderExample: React.FC = () => {
  const [files, setFiles] = React.useState<any[]>([]);

  const imageConfig: FileConfig = {
    accept: ['image/*', '.jpg', '.jpeg', '.png', '.gif'],
    maxSize: 10,
    label: 'Image files (max 10MB each)',
  };

  const handleFilesSelected = (selectedFiles: File[]) => {
    const newFiles = selectedFiles.map((file) => ({
      file,
      status: 'pending' as const,
      progress: 0,
      preview: URL.createObjectURL(file), // Create preview for images
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Upload Image Gallery</h2>
      <FileUploader
        config={imageConfig}
        multiple={true}
        onFilesSelected={handleFilesSelected}
        files={files}
        onRemoveFile={handleRemoveFile}
      />
    </div>
  );
};

/**
 * Example 3: Content Selector
 * Browse and select from content library
 */
export const ContentSelectorExample: React.FC = () => {
  const [selectedContent, setSelectedContent] = React.useState<any>(null);

  const handleContentSelect = (content: any) => {
    setSelectedContent(content);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Select Content</h2>
      <ContentSelector
        onSelect={handleContentSelect}
        selectedContentId={selectedContent?.id}
      />
      {selectedContent && (
        <div className="p-4 bg-green-50 border border-green-200 rounded">
          <p className="font-medium">Selected: {selectedContent.title}</p>
          <p className="text-sm text-muted-foreground">ID: {selectedContent.id}</p>
        </div>
      )}
    </div>
  );
};

/**
 * Example 4: Filtered Content Selector
 * Show only SCORM packages from specific department
 */
export const FilteredContentSelectorExample: React.FC = () => {
  const handleContentSelect = (content: any) => {
    // Handle SCORM content selection
    void content;
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Select SCORM Package</h2>
      <ContentSelector
        onSelect={handleContentSelect}
        filterByType="scorm"
        departmentId="dept-123"
      />
    </div>
  );
};

/**
 * Example 5: Quick Content Uploader with Default Button
 * Simple upload with minimal configuration
 */
export const QuickUploaderDefaultExample: React.FC = () => {
  const handleUploadSuccess = (_contentId: string) => {
    // Navigate or update state as needed
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Quick Upload</h2>
      <QuickContentUploader
        type="video"
        onSuccess={handleUploadSuccess}
      />
    </div>
  );
};

/**
 * Example 6: Quick Content Uploader with Custom Trigger
 * Use custom button or element as trigger
 */
export const QuickUploaderCustomTriggerExample: React.FC = () => {
  const handleUploadSuccess = (_contentId: string) => {
    // Handle upload success
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Custom Trigger Upload</h2>
      <QuickContentUploader
        type="document"
        departmentId="dept-456"
        onSuccess={handleUploadSuccess}
        trigger={
          <Button variant="outline" size="lg">
            <Upload className="h-5 w-5 mr-2" />
            Upload Document
          </Button>
        }
      />
    </div>
  );
};

/**
 * Example 7: Video Uploader with Progress Tracking
 * Track upload progress and show status
 */
export const VideoUploaderWithProgressExample: React.FC = () => {
  const [files, setFiles] = React.useState<any[]>([]);
  const [isUploading, setIsUploading] = React.useState(false);

  const videoConfig: FileConfig = {
    accept: ['video/*', '.mp4', '.webm', '.mov'],
    maxSize: 500,
    label: 'Video files (max 500MB)',
  };

  const handleFilesSelected = (selectedFiles: File[]) => {
    const newFiles = selectedFiles.map((file) => ({
      file,
      status: 'pending' as const,
      progress: 0,
    }));
    setFiles(newFiles);
  };

  const handleUpload = () => {
    setIsUploading(true);

    // Simulate upload progress
    setFiles((prev) =>
      prev.map((f) => ({ ...f, status: 'uploading' as const }))
    );

    // Simulate progress updates
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setFiles((prev) =>
        prev.map((f) => ({ ...f, progress: Math.min(progress, 100) }))
      );

      if (progress >= 100) {
        clearInterval(interval);
        setFiles((prev) =>
          prev.map((f) => ({ ...f, status: 'success' as const }))
        );
        setIsUploading(false);
      }
    }, 500);
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Video Upload with Progress</h2>
      <FileUploader
        config={videoConfig}
        multiple={false}
        onFilesSelected={handleFilesSelected}
        files={files}
        onRemoveFile={handleRemoveFile}
        disabled={isUploading}
      />
      {files.length > 0 && files[0].status === 'pending' && (
        <Button onClick={handleUpload} disabled={isUploading}>
          {isUploading ? 'Uploading...' : 'Start Upload'}
        </Button>
      )}
    </div>
  );
};

/**
 * Example 8: Combining Multiple Components
 * Upload OR select existing content
 */
export const HybridContentManagerExample: React.FC = () => {
  const [mode, setMode] = React.useState<'upload' | 'select'>('upload');
  const [selectedContent, setSelectedContent] = React.useState<any>(null);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          variant={mode === 'upload' ? 'default' : 'outline'}
          onClick={() => setMode('upload')}
        >
          Upload New
        </Button>
        <Button
          variant={mode === 'select' ? 'default' : 'outline'}
          onClick={() => setMode('select')}
        >
          Select Existing
        </Button>
      </div>

      {mode === 'upload' ? (
        <QuickContentUploader
          type="video"
          onSuccess={() => {}}
        />
      ) : (
        <ContentSelector
          onSelect={(content) => setSelectedContent(content)}
          selectedContentId={selectedContent?.id}
        />
      )}
    </div>
  );
};

/**
 * Example 9: Course Module Content Uploader
 * Upload content and link to specific module
 */
export const CourseModuleContentUploaderExample: React.FC<{
  courseId: string;
  moduleId: string;
}> = ({ courseId, moduleId }) => {
  const handleUploadSuccess = (_contentId: string) => {
    // API call to link content to module would go here
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 p-4 rounded">
        <p className="text-sm font-medium">
          Uploading content for Course: {courseId}, Module: {moduleId}
        </p>
      </div>

      <QuickContentUploader
        type="scorm"
        onSuccess={handleUploadSuccess}
      />
    </div>
  );
};

/**
 * Example 10: Batch Document Uploader
 * Upload multiple documents at once
 */
export const BatchDocumentUploaderExample: React.FC = () => {
  const [files, setFiles] = React.useState<any[]>([]);

  const documentConfig: FileConfig = {
    accept: ['.pdf', '.doc', '.docx', '.ppt', '.pptx'],
    maxSize: 50,
    label: 'Documents (PDF, Word, PowerPoint)',
  };

  const handleFilesSelected = (selectedFiles: File[]) => {
    const newFiles = selectedFiles.map((file) => ({
      file,
      status: 'pending' as const,
      progress: 0,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUploadAll = () => {
    // Upload all files
    void files;
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Batch Document Upload</h2>
      <FileUploader
        config={documentConfig}
        multiple={true}
        onFilesSelected={handleFilesSelected}
        files={files}
        onRemoveFile={handleRemoveFile}
      />
      {files.length > 0 && (
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            {files.length} file(s) selected
          </span>
          <Button onClick={handleUploadAll}>
            Upload All Documents
          </Button>
        </div>
      )}
    </div>
  );
};
