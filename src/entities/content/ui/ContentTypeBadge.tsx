/**
 * ContentTypeBadge component
 * Displays a badge with icon and color based on content type
 */

import { Badge } from '@/shared/ui/badge';
import { cn } from '@/shared/lib/utils';
import { ContentType } from '../model/types';
import { contentTypeBadgeConfig } from '../lib/contentTypeConfig';

export interface ContentTypeBadgeProps {
  type: ContentType;
  showIcon?: boolean;
  showLabel?: boolean;
  className?: string;
}

/**
 * ContentTypeBadge component
 * Displays a styled badge indicating the content type
 */
export function ContentTypeBadge({
  type,
  showIcon = true,
  showLabel = true,
  className,
}: ContentTypeBadgeProps) {
  const config = contentTypeBadgeConfig[type];
  const Icon = config.icon;

  if (!showIcon && !showLabel) {
    return null;
  }

  return (
    <Badge
      variant="outline"
      className={cn(config.className, className)}
      aria-label={`Content type: ${config.label}`}
    >
      {showIcon && <Icon className="mr-1 h-3 w-3" aria-hidden="true" />}
      {showLabel && <span>{config.label}</span>}
    </Badge>
  );
}
