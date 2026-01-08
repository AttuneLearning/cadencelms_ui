/**
 * Content type configuration and helpers
 * Provides icons, colors, and labels for each content type
 */

import {
  FileVideo,
  FileText,
  ClipboardList,
  ExternalLink,
  Package,
  type LucideIcon,
} from 'lucide-react';
import { ContentType, getContentTypeDisplayName } from '../model/types';

/**
 * Configuration for each content type including icon, color, and label
 */
export const contentTypeBadgeConfig: Record<
  ContentType,
  {
    icon: LucideIcon;
    className: string;
    label: string;
  }
> = {
  [ContentType.SCORM_12]: {
    icon: Package,
    className: 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100',
    label: getContentTypeDisplayName(ContentType.SCORM_12),
  },
  [ContentType.SCORM_2004]: {
    icon: Package,
    className: 'border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100',
    label: getContentTypeDisplayName(ContentType.SCORM_2004),
  },
  [ContentType.VIDEO]: {
    icon: FileVideo,
    className: 'border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100',
    label: getContentTypeDisplayName(ContentType.VIDEO),
  },
  [ContentType.DOCUMENT]: {
    icon: FileText,
    className: 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100',
    label: getContentTypeDisplayName(ContentType.DOCUMENT),
  },
  [ContentType.QUIZ]: {
    icon: ClipboardList,
    className: 'border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100',
    label: getContentTypeDisplayName(ContentType.QUIZ),
  },
  [ContentType.EXTERNAL_LINK]: {
    icon: ExternalLink,
    className: 'border-cyan-200 bg-cyan-50 text-cyan-700 hover:bg-cyan-100',
    label: getContentTypeDisplayName(ContentType.EXTERNAL_LINK),
  },
};

/**
 * Get icon component for a content type
 * Useful for standalone icon display
 */
export function getContentTypeIcon(type: ContentType): LucideIcon {
  return contentTypeBadgeConfig[type].icon;
}

/**
 * Get color class for a content type
 * Useful for custom styling
 */
export function getContentTypeColorClass(type: ContentType): string {
  return contentTypeBadgeConfig[type].className;
}
