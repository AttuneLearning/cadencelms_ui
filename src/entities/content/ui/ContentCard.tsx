/**
 * Content Card Component
 * Displays content item information in a card layout
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import {
  FileText,
  Video,
  Music,
  Image as ImageIcon,
  Package,
  Calendar,
  Eye,
  EyeOff,
  Building2,
  HardDrive,
} from 'lucide-react';
import type {
  ContentListItem,
  Content,
  ScormPackageListItem,
  ScormPackage,
  MediaFileListItem,
  MediaFile,
  ContentType,
  MediaType,
  ContentStatus,
} from '../model/types';

type ContentCardItem =
  | ContentListItem
  | Content
  | ScormPackageListItem
  | ScormPackage
  | MediaFileListItem
  | MediaFile;

interface ContentCardProps {
  content: ContentCardItem;
  showMetadata?: boolean;
  onClick?: () => void;
}

export function ContentCard({
  content,
  showMetadata = true,
  onClick,
}: ContentCardProps) {
  const getContentTypeIcon = (type: ContentType | MediaType): React.ReactElement => {
    // Handle ContentType
    if (type === 'scorm') return <Package className="h-5 w-5 flex-shrink-0" />;
    if (type === 'media') return <Video className="h-5 w-5 flex-shrink-0" />;
    if (type === 'exercise') return <FileText className="h-5 w-5 flex-shrink-0" />;

    // Handle MediaType
    if (type === 'video') return <Video className="h-5 w-5 flex-shrink-0" />;
    if (type === 'audio') return <Music className="h-5 w-5 flex-shrink-0" />;
    if (type === 'image') return <ImageIcon className="h-5 w-5 flex-shrink-0" />;
    if (type === 'document') return <FileText className="h-5 w-5 flex-shrink-0" />;

    return <FileText className="h-5 w-5 flex-shrink-0" />;
  };

  const getStatusBadgeColor = (status: ContentStatus) => {
    switch (status) {
      case 'draft':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'published':
        return 'bg-green-500/10 text-green-500';
      case 'archived':
        return 'bg-gray-500/10 text-gray-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  const getTypeBadgeColor = (type: ContentType | MediaType): string => {
    // Handle ContentType
    if (type === 'scorm') return 'bg-purple-500/10 text-purple-500';
    if (type === 'media') return 'bg-blue-500/10 text-blue-500';
    if (type === 'exercise') return 'bg-amber-500/10 text-amber-500';

    // Handle MediaType
    if (type === 'video') return 'bg-blue-500/10 text-blue-500';
    if (type === 'audio') return 'bg-green-500/10 text-green-500';
    if (type === 'image') return 'bg-pink-500/10 text-pink-500';
    if (type === 'document') return 'bg-orange-500/10 text-orange-500';

    return 'bg-gray-500/10 text-gray-500';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const isClickable = !!onClick;
  // Determine the type - content entities have ContentType, media files have MediaType
  const type: ContentType | MediaType = 'type' in content && content.type !== undefined
    ? content.type
    : 'media' as const;
  const status = 'status' in content ? content.status : 'draft' as const;

  // Check if this is a SCORM package (has isPublished field)
  const isScormPackage = 'isPublished' in content;

  // Check if this has file size (SCORM or Media)
  const hasFileSize = 'fileSize' in content || 'size' in content;
  const fileSize = 'fileSize' in content ? content.fileSize : 'size' in content ? content.size : 0;

  // Check if this has duration (Media)
  const hasDuration = 'duration' in content && content.duration !== null;
  const duration = 'duration' in content ? content.duration : null;

  // Check if this has usage count (detail views)
  const hasUsageCount = 'usageCount' in content;
  const usageCount = 'usageCount' in content ? content.usageCount : 0;

  return (
    <Card
      className={isClickable ? 'cursor-pointer transition-colors hover:bg-accent' : ''}
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="flex items-center gap-2 flex-wrap">
              {getContentTypeIcon(type)}
              <span className="truncate">{content.title}</span>
            </CardTitle>
            {'description' in content && content.description && (
              <CardDescription className="mt-2 line-clamp-2">
                {content.description}
              </CardDescription>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Badge variant="outline" className={getStatusBadgeColor(status)}>
              {status}
            </Badge>
            <Badge variant="outline" className={getTypeBadgeColor(type)}>
              {type}
            </Badge>
            {isScormPackage && (
              content.isPublished ? (
                <Badge variant="outline" className="bg-green-500/10 text-green-500">
                  <Eye className="h-3 w-3 mr-1" />
                  Published
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-gray-500/10 text-gray-500">
                  <EyeOff className="h-3 w-3 mr-1" />
                  Draft
                </Badge>
              )
            )}
          </div>
        </div>
      </CardHeader>

      {showMetadata && (
        <CardContent>
          <div className="space-y-4">
            {content.department && (
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{content.department.name}</span>
              </div>
            )}

            {content.thumbnailUrl && (
              <div className="rounded-md overflow-hidden bg-muted">
                <img
                  src={content.thumbnailUrl}
                  alt={content.title}
                  className="w-full h-32 object-cover"
                />
              </div>
            )}

            <div className="flex items-center gap-4 flex-wrap text-sm">
              {hasFileSize && fileSize > 0 && (
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {formatFileSize(fileSize)}
                  </span>
                </div>
              )}
              {hasDuration && duration !== null && (
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {formatDuration(duration)}
                  </span>
                </div>
              )}
            </div>

            {hasUsageCount && (
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Used in courses</span>
                  <span className="font-medium">{usageCount}</span>
                </div>
              </div>
            )}

            {'totalAttempts' in content && content.totalAttempts > 0 && (
              <div className="pt-4 border-t space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Attempts</span>
                  <span className="font-medium">{content.totalAttempts}</span>
                </div>
                {content.averageScore !== null && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Average Score</span>
                    <span className="font-medium">{content.averageScore.toFixed(1)}%</span>
                  </div>
                )}
              </div>
            )}

            <div className="pt-4 border-t flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>Created {new Date(content.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
