/**
 * VersionBadge Component
 * Displays version information with lock status and latest indicator
 */

import React from 'react';
import { Badge } from '@/shared/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/shared/ui/tooltip';
import { Lock, GitBranch } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface VersionBadgeProps {
  version: number;
  isLatest?: boolean;
  isLocked?: boolean;
  lockedReason?: string | null;
  showIcon?: boolean;
  className?: string;
  onClick?: () => void;
}

export const VersionBadge: React.FC<VersionBadgeProps> = ({
  version,
  isLatest = false,
  isLocked = false,
  lockedReason,
  showIcon = true,
  className,
  onClick,
}) => {
  const content = (
    <div
      className={cn(
        'flex items-center gap-1',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {showIcon && <GitBranch className="h-3 w-3 text-muted-foreground" />}
      <Badge variant="outline" className="font-mono text-xs">
        v{version}
      </Badge>
      {isLocked && (
        <Lock className="h-3 w-3 text-muted-foreground" />
      )}
      {isLatest && (
        <Badge variant="secondary" className="text-xs">
          Latest
        </Badge>
      )}
    </div>
  );

  if (isLocked && lockedReason) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent>
            <p>Locked: {lockedReason}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
};

/**
 * VersionStatusIndicator Component
 * Shows version status with color coding
 */

interface VersionStatusIndicatorProps {
  status: 'draft' | 'published' | 'archived';
  className?: string;
}

export const VersionStatusIndicator: React.FC<VersionStatusIndicatorProps> = ({
  status,
  className,
}) => {
  const variants: Record<typeof status, { variant: 'default' | 'secondary' | 'outline'; label: string }> = {
    draft: { variant: 'outline', label: 'Draft' },
    published: { variant: 'default', label: 'Published' },
    archived: { variant: 'secondary', label: 'Archived' },
  };

  const { variant, label } = variants[status];

  return (
    <Badge
      variant={variant}
      className={cn(
        status === 'published' && 'bg-green-600 hover:bg-green-700',
        className
      )}
    >
      {label}
    </Badge>
  );
};
