/**
 * Content Uploader Page
 * Staff interface for uploading SCORM packages, videos, documents, and media to courses
 */

import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/ui/tabs';
import { Card } from '@/shared/ui/card';
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
import { Badge } from '@/shared/ui/badge';
import { useToast } from '@/shared/ui/use-toast';
import { ArrowLeft, Package, FileVideo, FileText, Library, Upload, Loader2, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '@/shared/ui/page-header';
import {
  FileUploader,
  type FileConfig,
  type UploadedFile,
} from '@/features/content/ui/FileUploader';
import { ContentSelector } from '@/features/content/ui/ContentSelector';
import {
  useUploadScormPackage,
  useUploadMediaFile,
  type MediaType,
  type ContentListItem,
} from '@/entities/content';
import { useDepartments } from '@/entities/department';
import { useLinkContentToModule } from '@/entities/course-module';

type TabValue = 'scorm' | 'media' | 'document' | 'library';

interface ScormFormData {
  title: string;
  description: string;
  departmentId: string;
}

interface MediaFormData {
  title: string;
  description: string;
  departmentId: string;
  type: MediaType;
}

export const ContentUploaderPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  // Get courseId and moduleId from URL params if provided
  const courseId = searchParams.get('courseId');
  const moduleId = searchParams.get('moduleId');

  // State management
  const [activeTab, setActiveTab] = useState<TabValue>('scorm');
  const [selectedContent, setSelectedContent] = useState<ContentListItem | null>(null);

  // SCORM Upload State
  const [scormFiles, setScormFiles] = useState<UploadedFile[]>([]);
  const [scormFormData, setScormFormData] = useState<ScormFormData>({
    title: '',
    description: '',
    departmentId: '',
  });
  const [scormThumbnailFile, setScormThumbnailFile] = useState<File | null>(null);

  // Media Upload State (Video/Audio)
  const [mediaFiles, setMediaFiles] = useState<UploadedFile[]>([]);
  const [mediaFormData, setMediaFormData] = useState<MediaFormData>({
    title: '',
    description: '',
    departmentId: '',
    type: 'video',
  });

  // Document Upload State
  const [documentFiles, setDocumentFiles] = useState<UploadedFile[]>([]);
  const [documentFormData, setDocumentFormData] = useState<MediaFormData>({
    title: '',
    description: '',
    departmentId: '',
    type: 'document',
  });

  // Fetch departments
  const { data: departmentsData } = useDepartments({ limit: 1000 });

  // Link content mutation
  const linkContent = useLinkContentToModule();

  // Upload mutations
  const uploadScorm = useUploadScormPackage({
    onSuccess: (data) => {
      toast({
        title: 'SCORM package uploaded',
        description: `${data.title} has been successfully uploaded.`,
      });
      // Reset form
      setScormFiles([]);
      setScormFormData({ title: '', description: '', departmentId: '' });
      setScormThumbnailFile(null);
    },
    onError: (error) => {
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload SCORM package.',
        variant: 'destructive',
      });
      // Update file status
      setScormFiles((prev) =>
        prev.map((f) => ({ ...f, status: 'error', error: error.message }))
      );
    },
  });

  const uploadMedia = useUploadMediaFile({
    onSuccess: (data) => {
      toast({
        title: 'Media file uploaded',
        description: `${data.title} has been successfully uploaded.`,
      });
      // Reset appropriate form based on type
      if (data.type === 'video' || data.type === 'audio' || data.type === 'image') {
        setMediaFiles([]);
        setMediaFormData({ title: '', description: '', departmentId: '', type: 'video' });
      } else {
        setDocumentFiles([]);
        setDocumentFormData({ title: '', description: '', departmentId: '', type: 'document' });
      }
    },
    onError: (error) => {
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload media file.',
        variant: 'destructive',
      });
      // Update file status based on active tab
      if (activeTab === 'media') {
        setMediaFiles((prev) =>
          prev.map((f) => ({ ...f, status: 'error', error: error.message }))
        );
      } else {
        setDocumentFiles((prev) =>
          prev.map((f) => ({ ...f, status: 'error', error: error.message }))
        );
      }
    },
  });

  // File configurations
  const scormFileConfig: FileConfig = {
    accept: ['.zip', 'application/zip'],
    maxSize: 100,
    label: 'SCORM Package (.zip)',
  };

  const videoFileConfig: FileConfig = {
    accept: ['video/*', '.mp4', '.webm', '.mov', '.avi'],
    maxSize: 500,
    label: 'Video files (.mp4, .webm, .mov)',
  };

  const audioFileConfig: FileConfig = {
    accept: ['audio/*', '.mp3', '.wav', '.ogg', '.m4a'],
    maxSize: 100,
    label: 'Audio files (.mp3, .wav, .ogg)',
  };

  const imageFileConfig: FileConfig = {
    accept: ['image/*', '.jpg', '.jpeg', '.png', '.gif', '.webp'],
    maxSize: 10,
    label: 'Image files (.jpg, .png, .gif)',
  };

  const documentFileConfig: FileConfig = {
    accept: ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx'],
    maxSize: 50,
    label: 'Documents (.pdf, .doc, .ppt)',
  };

  // Get appropriate file config based on media type
  const getMediaFileConfig = (): FileConfig => {
    switch (mediaFormData.type) {
      case 'video':
        return videoFileConfig;
      case 'audio':
        return audioFileConfig;
      case 'image':
        return imageFileConfig;
      default:
        return videoFileConfig;
    }
  };

  // File handlers
  const handleScormFilesSelected = (files: File[]) => {
    const newFiles: UploadedFile[] = files.map((file) => ({
      file,
      status: 'pending',
      progress: 0,
    }));
    setScormFiles(newFiles);
  };

  const handleMediaFilesSelected = (files: File[]) => {
    const newFiles: UploadedFile[] = files.map((file) => ({
      file,
      status: 'pending',
      progress: 0,
    }));
    setMediaFiles(newFiles);
  };

  const handleDocumentFilesSelected = (files: File[]) => {
    const newFiles: UploadedFile[] = files.map((file) => ({
      file,
      status: 'pending',
      progress: 0,
    }));
    setDocumentFiles(newFiles);
  };

  const handleThumbnailSelected = (files: File[]) => {
    if (files.length > 0) {
      setScormThumbnailFile(files[0]);
    }
  };

  // Upload handlers
  const handleScormUpload = () => {
    if (scormFiles.length === 0) {
      toast({
        title: 'No file selected',
        description: 'Please select a SCORM package to upload.',
        variant: 'destructive',
      });
      return;
    }

    // Update file status to uploading
    setScormFiles((prev) =>
      prev.map((f) => ({ ...f, status: 'uploading', progress: 0 }))
    );

    uploadScorm.mutate({
      payload: {
        file: scormFiles[0].file,
        title: scormFormData.title || undefined,
        description: scormFormData.description || undefined,
        departmentId: scormFormData.departmentId || undefined,
        thumbnail: scormThumbnailFile || undefined,
      },
      onProgress: (progress) => {
        setScormFiles((prev) =>
          prev.map((f) => ({ ...f, progress }))
        );
      },
    });
  };

  const handleMediaUpload = () => {
    if (mediaFiles.length === 0) {
      toast({
        title: 'No file selected',
        description: 'Please select a media file to upload.',
        variant: 'destructive',
      });
      return;
    }

    if (!mediaFormData.title.trim()) {
      toast({
        title: 'Title required',
        description: 'Please enter a title for the media file.',
        variant: 'destructive',
      });
      return;
    }

    // Update file status to uploading
    setMediaFiles((prev) =>
      prev.map((f) => ({ ...f, status: 'uploading', progress: 0 }))
    );

    uploadMedia.mutate({
      payload: {
        file: mediaFiles[0].file,
        title: mediaFormData.title,
        description: mediaFormData.description || undefined,
        departmentId: mediaFormData.departmentId || undefined,
        type: mediaFormData.type,
      },
      onProgress: (progress) => {
        setMediaFiles((prev) =>
          prev.map((f) => ({ ...f, progress }))
        );
      },
    });
  };

  const handleDocumentUpload = () => {
    if (documentFiles.length === 0) {
      toast({
        title: 'No file selected',
        description: 'Please select a document to upload.',
        variant: 'destructive',
      });
      return;
    }

    if (!documentFormData.title.trim()) {
      toast({
        title: 'Title required',
        description: 'Please enter a title for the document.',
        variant: 'destructive',
      });
      return;
    }

    // Update file status to uploading
    setDocumentFiles((prev) =>
      prev.map((f) => ({ ...f, status: 'uploading', progress: 0 }))
    );

    uploadMedia.mutate({
      payload: {
        file: documentFiles[0].file,
        title: documentFormData.title,
        description: documentFormData.description || undefined,
        departmentId: documentFormData.departmentId || undefined,
        type: 'document',
      },
      onProgress: (progress) => {
        setDocumentFiles((prev) =>
          prev.map((f) => ({ ...f, progress }))
        );
      },
    });
  };

  const handleContentSelection = (content: ContentListItem) => {
    setSelectedContent(content);
    toast({
      title: 'Content selected',
      description: `${content.title} has been selected.`,
    });
  };

  const handleLinkToModule = () => {
    if (!selectedContent) {
      toast({
        title: 'No content selected',
        description: 'Please select content from the library first.',
        variant: 'destructive',
      });
      return;
    }

    if (!moduleId) {
      toast({
        title: 'No module specified',
        description: 'Please navigate from a course module to link content.',
        variant: 'destructive',
      });
      return;
    }

    if (!courseId) {
      toast({
        title: 'No course specified',
        description: 'Course ID is required to link content.',
        variant: 'destructive',
      });
      return;
    }

    linkContent.mutate(
      {
        courseId,
        moduleId,
        payload: {
          contentId: selectedContent.id,
          contentType: selectedContent.type as 'scorm' | 'video' | 'document' | 'audio' | 'image',
        },
      },
      {
        onSuccess: () => {
          toast({
            title: 'Content linked',
            description: `${selectedContent.title} has been successfully linked to the module.`,
          });

          // Navigate back to course/module
          if (courseId) {
            navigate(`/staff/courses/${courseId}`);
          }
        },
        onError: (error: any) => {
          toast({
            title: 'Failed to link content',
            description: error.message || 'An error occurred while linking the content.',
            variant: 'destructive',
          });
        },
      }
    );
  };

  const isUploading = uploadScorm.isPending || uploadMedia.isPending;
  const isLinking = linkContent.isPending;

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      <PageHeader
        title="Content Uploader"
        description="Upload SCORM packages, videos, documents, or select from library"
        backButton={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        }
      />

      {/* Context Info */}
      {(courseId || moduleId) && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center gap-2">
            <Badge variant="default">Linked to Course Module</Badge>
            <span className="text-sm text-muted-foreground">
              Content will be available to link after upload
            </span>
          </div>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabValue)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="scorm">
            <Package className="h-4 w-4 mr-2" />
            SCORM Package
          </TabsTrigger>
          <TabsTrigger value="media">
            <FileVideo className="h-4 w-4 mr-2" />
            Video/Audio
          </TabsTrigger>
          <TabsTrigger value="document">
            <FileText className="h-4 w-4 mr-2" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="library">
            <Library className="h-4 w-4 mr-2" />
            Content Library
          </TabsTrigger>
        </TabsList>

        {/* SCORM Upload Tab */}
        <TabsContent value="scorm" className="space-y-6">
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Upload SCORM Package</h3>
                <p className="text-sm text-muted-foreground">
                  Upload a SCORM 1.2 or SCORM 2004 package as a ZIP file
                </p>
              </div>

              <FileUploader
                config={scormFileConfig}
                multiple={false}
                onFilesSelected={handleScormFilesSelected}
                files={scormFiles}
                onRemoveFile={(index) => setScormFiles((prev) => prev.filter((_, i) => i !== index))}
                disabled={isUploading}
              />

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="scorm-title">
                    Title (Optional)
                  </Label>
                  <Input
                    id="scorm-title"
                    placeholder="Override manifest title"
                    value={scormFormData.title}
                    onChange={(e) =>
                      setScormFormData({ ...scormFormData, title: e.target.value })
                    }
                    disabled={isUploading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty to use title from SCORM manifest
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scorm-description">Description (Optional)</Label>
                  <Textarea
                    id="scorm-description"
                    placeholder="Enter description"
                    value={scormFormData.description}
                    onChange={(e) =>
                      setScormFormData({ ...scormFormData, description: e.target.value })
                    }
                    disabled={isUploading}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scorm-department">Department (Optional)</Label>
                  <Select
                    value={scormFormData.departmentId}
                    onValueChange={(value) =>
                      setScormFormData({ ...scormFormData, departmentId: value })
                    }
                    disabled={isUploading}
                  >
                    <SelectTrigger id="scorm-department">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No department</SelectItem>
                      {departmentsData?.departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Thumbnail (Optional)</Label>
                  <FileUploader
                    config={{
                      accept: ['image/*', '.jpg', '.jpeg', '.png', '.webp'],
                      maxSize: 5,
                      label: 'Thumbnail image',
                    }}
                    multiple={false}
                    onFilesSelected={handleThumbnailSelected}
                    files={
                      scormThumbnailFile
                        ? [{ file: scormThumbnailFile, status: 'pending', progress: 0 }]
                        : []
                    }
                    onRemoveFile={() => setScormThumbnailFile(null)}
                    disabled={isUploading}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleScormUpload}
                  disabled={scormFiles.length === 0 || isUploading}
                  size="lg"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload SCORM Package
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Video/Audio Upload Tab */}
        <TabsContent value="media" className="space-y-6">
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Upload Video or Audio</h3>
                <p className="text-sm text-muted-foreground">
                  Upload video or audio files to your media library
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="media-type">Media Type</Label>
                <Select
                  value={mediaFormData.type}
                  onValueChange={(value) =>
                    setMediaFormData({ ...mediaFormData, type: value as MediaType })
                  }
                  disabled={isUploading}
                >
                  <SelectTrigger id="media-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <FileUploader
                config={getMediaFileConfig()}
                multiple={false}
                onFilesSelected={handleMediaFilesSelected}
                files={mediaFiles}
                onRemoveFile={(index) => setMediaFiles((prev) => prev.filter((_, i) => i !== index))}
                disabled={isUploading}
              />

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="media-title">
                    Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="media-title"
                    placeholder="Enter title"
                    value={mediaFormData.title}
                    onChange={(e) =>
                      setMediaFormData({ ...mediaFormData, title: e.target.value })
                    }
                    disabled={isUploading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="media-description">Description (Optional)</Label>
                  <Textarea
                    id="media-description"
                    placeholder="Enter description"
                    value={mediaFormData.description}
                    onChange={(e) =>
                      setMediaFormData({ ...mediaFormData, description: e.target.value })
                    }
                    disabled={isUploading}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="media-department">Department (Optional)</Label>
                  <Select
                    value={mediaFormData.departmentId}
                    onValueChange={(value) =>
                      setMediaFormData({ ...mediaFormData, departmentId: value })
                    }
                    disabled={isUploading}
                  >
                    <SelectTrigger id="media-department">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No department</SelectItem>
                      {departmentsData?.departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleMediaUpload}
                  disabled={mediaFiles.length === 0 || isUploading || !mediaFormData.title.trim()}
                  size="lg"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Media
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Document Upload Tab */}
        <TabsContent value="document" className="space-y-6">
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Upload Document</h3>
                <p className="text-sm text-muted-foreground">
                  Upload PDF, Word, PowerPoint, or Excel documents
                </p>
              </div>

              <FileUploader
                config={documentFileConfig}
                multiple={false}
                onFilesSelected={handleDocumentFilesSelected}
                files={documentFiles}
                onRemoveFile={(index) => setDocumentFiles((prev) => prev.filter((_, i) => i !== index))}
                disabled={isUploading}
              />

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="document-title">
                    Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="document-title"
                    placeholder="Enter title"
                    value={documentFormData.title}
                    onChange={(e) =>
                      setDocumentFormData({ ...documentFormData, title: e.target.value })
                    }
                    disabled={isUploading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="document-description">Description (Optional)</Label>
                  <Textarea
                    id="document-description"
                    placeholder="Enter description"
                    value={documentFormData.description}
                    onChange={(e) =>
                      setDocumentFormData({ ...documentFormData, description: e.target.value })
                    }
                    disabled={isUploading}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="document-department">Department (Optional)</Label>
                  <Select
                    value={documentFormData.departmentId}
                    onValueChange={(value) =>
                      setDocumentFormData({ ...documentFormData, departmentId: value })
                    }
                    disabled={isUploading}
                  >
                    <SelectTrigger id="document-department">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No department</SelectItem>
                      {departmentsData?.departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleDocumentUpload}
                  disabled={documentFiles.length === 0 || isUploading || !documentFormData.title.trim()}
                  size="lg"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Document
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Content Library Tab */}
        <TabsContent value="library" className="space-y-6">
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Browse Content Library</h3>
                <p className="text-sm text-muted-foreground">
                  Select existing content to add to your course module
                </p>
              </div>

              <ContentSelector
                onSelect={handleContentSelection}
                selectedContentId={selectedContent?.id}
              />

              {selectedContent && (
                <Card className="p-4 bg-green-50 border-green-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-sm">Selected: {selectedContent.title}</p>
                        <p className="text-xs text-muted-foreground">
                          Type: {selectedContent.type} | Status: {selectedContent.status}
                        </p>
                      </div>
                    </div>
                    {moduleId && (
                      <Button onClick={handleLinkToModule} size="sm" disabled={isLinking}>
                        {isLinking ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Linking...
                          </>
                        ) : (
                          'Link to Module'
                        )}
                      </Button>
                    )}
                  </div>
                </Card>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
