/**
 * Content Type Configuration
 * Badge configuration and helpers for different content types
 */

import { FileText, FileVideo, Package, HelpCircle, ExternalLink, File } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ContentType } from '../model/types';

/**
 * Configuration for content type badges
 */
export const contentTypeBadgeConfig: Record<
  ContentType,
  {
    icon: LucideIcon;
    className: string;
    label: string;
  }
> = {
  video: {
    icon: FileVideo,
    className: 'bg-blue-500/10 text-blue-500',
    label: 'Video',
  },
  document: {
    icon: FileText,
    className: 'bg-green-500/10 text-green-500',
    label: 'Document',
  },
  scorm: {
    icon: Package,
    className: 'bg-purple-500/10 text-purple-500',
    label: 'SCORM',
  },
  quiz: {
    icon: HelpCircle,
    className: 'bg-orange-500/10 text-orange-500',
    label: 'Quiz',
  },
  assignment: {
    icon: File,
    className: 'bg-pink-500/10 text-pink-500',
    label: 'Assignment',
  },
  'external-link': {
    icon: ExternalLink,
    className: 'bg-gray-500/10 text-gray-500',
    label: 'External Link',
  },
};

/**
 * Get icon component for a content type
 */
export function getContentTypeIcon(type: ContentType): LucideIcon {
  return contentTypeBadgeConfig[type]?.icon || File;
}

/**
 * Get color class for a content type
 */
export function getContentTypeColorClass(type: ContentType): string {
  return contentTypeBadgeConfig[type]?.className || 'bg-gray-500/10 text-gray-500';
}
