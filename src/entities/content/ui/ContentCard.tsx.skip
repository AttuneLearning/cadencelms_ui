/**
 * ContentCard component
 * Displays a content item in a card format with metadata
 */

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Skeleton } from '@/shared/ui/skeleton';
import { cn } from '@/shared/lib/utils';
import { Clock, FileIcon, Tag } from 'lucide-react';
import { ContentTypeBadge } from './ContentTypeBadge';
import type { Content } from '../model/types';
import {
  ContentType,
  formatFileSize,
  formatDuration,
  isScormMetadata,
  isVideoMetadata,
  isDocumentMetadata,
  isQuizMetadata,
  isExternalLinkMetadata,
} from '../model/types';

export interface ContentCardProps {
  content: Content;
  onClick?: (content: Content) => void;
  className?: string;
  showThumbnail?: boolean;
  showMetadata?: boolean;
  showTags?: boolean;
}

/**
 * ContentCard component
 * Displays a content item with type badge, metadata, and thumbnail
 */
export function ContentCard({
  content,
  onClick,
  className,
  showThumbnail = true,
  showMetadata = true,
  showTags = true,
}: ContentCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(content);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (onClick && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onClick(content);
    }
  };

  // Extract relevant metadata based on content type
  const metadataInfo = React.useMemo(() => {
    const { metadata, type } = content;

    if (type === ContentType.VIDEO && isVideoMetadata(metadata)) {
      return {
        duration: formatDuration(metadata.duration),
        size: formatFileSize(metadata.fileSize),
        format: metadata.format,
      };
    }

    if (
      (type === ContentType.SCORM_12 || type === ContentType.SCORM_2004) &&
      isScormMetadata(metadata)
    ) {
      return {
        size: formatFileSize(metadata.packageSize),
        version: metadata.scormVersion,
      };
    }

    if (type === ContentType.DOCUMENT && isDocumentMetadata(metadata)) {
      return {
        size: formatFileSize(metadata.fileSize),
        format: metadata.format,
        pages: metadata.pageCount ? `${metadata.pageCount} pages` : undefined,
      };
    }

    if (type === ContentType.QUIZ && isQuizMetadata(metadata)) {
      return {
        questions: `${metadata.questionCount} questions`,
        timeLimit: metadata.timeLimit
          ? `${metadata.timeLimit} min`
          : 'No time limit',
        passingScore: `${metadata.passingScore}% to pass`,
      };
    }

    if (type === ContentType.EXTERNAL_LINK && isExternalLinkMetadata(metadata)) {
      return {
        duration: metadata.estimatedDuration
          ? `~${metadata.estimatedDuration} min`
          : undefined,
        url: new URL(metadata.url).hostname,
      };
    }

    return {};
  }, [content]);

  const tags = content.metadata.tags;
  const hasTags = showTags && tags && tags.length > 0;

  return (
    <Card
      className={cn(
        'group transition-all hover:shadow-md',
        onClick && 'cursor-pointer hover:border-primary',
        className
      )}
      onClick={onClick ? handleClick : undefined}
      onKeyDown={onClick ? handleKeyDown : undefined}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : undefined}
      aria-label={onClick ? `Open ${content.title}` : undefined}
    >
      {showThumbnail && content.thumbnailUrl && (
        <div className="aspect-video w-full overflow-hidden rounded-t-lg">
          <img
            src={content.thumbnailUrl}
            alt={`${content.title} thumbnail`}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
          />
        </div>
      )}

      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-2 text-lg">{content.title}</CardTitle>
          <ContentTypeBadge type={content.type} />
        </div>
        {content.description && (
          <CardDescription className="line-clamp-2">
            {content.description}
          </CardDescription>
        )}
      </CardHeader>

      {showMetadata && Object.keys(metadataInfo).length > 0 && (
        <CardContent>
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            {Object.entries(metadataInfo).map(([key, value]) => {
              if (!value) return null;

              return (
                <div key={key} className="flex items-center gap-1">
                  {key === 'duration' && <Clock className="h-3 w-3" />}
                  {key === 'size' && <FileIcon className="h-3 w-3" />}
                  <span>{value}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      )}

      {hasTags && (
        <CardFooter>
          <div className="flex flex-wrap items-center gap-2">
            <Tag className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
            {tags!.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {tags!.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{tags!.length - 3}
              </Badge>
            )}
          </div>
        </CardFooter>
      )}

      {content.isRequired && (
        <div className="absolute right-2 top-2">
          <Badge variant="destructive" className="text-xs">
            Required
          </Badge>
        </div>
      )}
    </Card>
  );
}

/**
 * ContentCardSkeleton component
 * Loading skeleton for ContentCard
 */
export function ContentCardSkeleton({
  showThumbnail = true,
  className,
}: {
  showThumbnail?: boolean;
  className?: string;
}) {
  return (
    <Card className={cn('', className)}>
      {showThumbnail && <Skeleton className="aspect-video w-full rounded-t-lg" />}
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-5 w-20" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </CardHeader>
      <CardContent>
        <div className="flex gap-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * ContentCardList component
 * Displays a grid of content cards
 */
export interface ContentCardListProps {
  contents: Content[];
  onContentClick?: (content: Content) => void;
  className?: string;
  columns?: 1 | 2 | 3 | 4;
  showThumbnail?: boolean;
  showMetadata?: boolean;
  showTags?: boolean;
}

export function ContentCardList({
  contents,
  onContentClick,
  className,
  columns = 3,
  showThumbnail = true,
  showMetadata = true,
  showTags = true,
}: ContentCardListProps) {
  const gridClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  }[columns];

  return (
    <div className={cn('grid gap-6', gridClass, className)}>
      {contents.map((content) => (
        <ContentCard
          key={content.id}
          content={content}
          onClick={onContentClick}
          showThumbnail={showThumbnail}
          showMetadata={showMetadata}
          showTags={showTags}
        />
      ))}
    </div>
  );
}

/**
 * ContentCardListSkeleton component
 * Loading skeleton for ContentCardList
 */
export function ContentCardListSkeleton({
  count = 6,
  columns = 3,
  showThumbnail = true,
  className,
}: {
  count?: number;
  columns?: 1 | 2 | 3 | 4;
  showThumbnail?: boolean;
  className?: string;
}) {
  const gridClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  }[columns];

  return (
    <div className={cn('grid gap-6', gridClass, className)}>
      {Array.from({ length: count }).map((_, index) => (
        <ContentCardSkeleton key={index} showThumbnail={showThumbnail} />
      ))}
    </div>
  );
}
