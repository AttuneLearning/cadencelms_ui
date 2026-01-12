/**
 * Content Type Configuration
 * Badge configuration and helpers for different content types
 */

import { FileVideo, Package, HelpCircle } from 'lucide-react';
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
  scorm: {
    icon: Package,
    className: 'bg-purple-500/10 text-purple-500',
    label: 'SCORM',
  },
  media: {
    icon: FileVideo,
    className: 'bg-blue-500/10 text-blue-500',
    label: 'Media',
  },
  exercise: {
    icon: HelpCircle,
    className: 'bg-orange-500/10 text-orange-500',
    label: 'Exercise',
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
