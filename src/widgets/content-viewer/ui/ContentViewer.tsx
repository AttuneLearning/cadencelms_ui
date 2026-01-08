/**
 * ContentViewer Component
 * Main content viewer that routes to appropriate viewer based on content type
 */

import React from 'react';
import { VideoPlayer } from './VideoPlayer';
import { DocumentViewer } from './DocumentViewer';
import { ExternalLinkViewer } from './ExternalLinkViewer';
import { Card, CardContent } from '@/shared/ui/card';
import { AlertCircle, FileQuestion } from 'lucide-react';
import type { Content } from '@/entities/content/model/types';
import type { Lesson } from '@/entities/lesson/model/types';

type ViewableContent = (Partial<Content> | Partial<Lesson>) & {
  videoUrl?: string;
  documentUrl?: string;
  fileUrl?: string;
  mimeType?: string;
  isDownloadable?: boolean;
  scormPackageId?: string;
};

interface ContentViewerProps {
  content: ViewableContent;
  onProgress?: (data: {
    currentTime?: number;
    duration?: number;
    percent?: number;
    scrollPercent?: number;
  }) => void;
  onComplete?: () => void;
  initialPosition?: number;
  className?: string;
}

export const ContentViewer: React.FC<ContentViewerProps> = ({
  content,
  onProgress,
  onComplete,
  initialPosition,
  className,
}) => {
  // Handle video content
  if (content.type === 'video' && (content.videoUrl || content.fileUrl)) {
    const videoUrl = content.videoUrl || content.fileUrl || '';
    return (
      <VideoPlayer
        videoUrl={videoUrl}
        onProgress={(progress) => {
          if (onProgress) {
            onProgress({
              currentTime: progress.currentTime,
              duration: progress.duration,
              percent: progress.percent,
            });
          }
        }}
        onComplete={onComplete}
        initialPosition={initialPosition}
        className={className}
      />
    );
  }

  // Handle document content
  if (content.type === 'document' && (content.documentUrl || content.fileUrl)) {
    const documentUrl = content.documentUrl || content.fileUrl || '';
    return (
      <DocumentViewer
        documentUrl={documentUrl}
        title={content.title}
        mimeType={content.mimeType}
        isDownloadable={content.isDownloadable}
        onProgress={(progress) => {
          if (onProgress) {
            onProgress({
              scrollPercent: progress.scrollPercent,
              percent: progress.scrollPercent,
            });
          }
        }}
        className={className}
      />
    );
  }

  // Handle external link
  if (content.type === 'external-link' && content.externalUrl) {
    return (
      <ExternalLinkViewer
        url={content.externalUrl}
        title={content.title}
        description={content.description}
        onVisit={onComplete}
        className={className}
      />
    );
  }

  // Handle SCORM content
  if (content.type === 'scorm' && content.scormPackageId) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">SCORM Content</h3>
          <p className="text-sm text-muted-foreground mb-4">
            SCORM content viewer will be implemented in a future update.
          </p>
          <p className="text-xs text-muted-foreground">
            Package ID: {content.scormPackageId}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Handle quiz/assignment (not implemented in this phase)
  if (content.type === 'quiz' || content.type === 'assignment') {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {content.type === 'quiz' ? 'Quiz' : 'Assignment'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {content.type === 'quiz' ? 'Quiz' : 'Assignment'} viewer will be implemented in
            a future phase.
          </p>
        </CardContent>
      </Card>
    );
  }

  // No valid content
  return (
    <Card className={className}>
      <CardContent className="flex flex-col items-center justify-center p-12 text-center">
        <FileQuestion className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Content Available</h3>
        <p className="text-sm text-muted-foreground">
          This lesson does not have any viewable content yet.
        </p>
      </CardContent>
    </Card>
  );
};
