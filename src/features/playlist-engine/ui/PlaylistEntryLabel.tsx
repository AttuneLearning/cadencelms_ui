/**
 * PlaylistEntryLabel
 * Renders the appropriate label + icon for each playlist entry type.
 */

import { Brain, RotateCcw, BookOpen } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { PlaylistDisplayEntry } from '@/shared/lib/business-logic/playlist-engine';

export interface PlaylistEntryLabelProps {
  entry: PlaylistDisplayEntry;
  className?: string;
}

export function PlaylistEntryLabel({ entry, className }: PlaylistEntryLabelProps) {
  const iconClass = 'h-3.5 w-3.5 shrink-0';

  switch (entry.kind) {
    case 'injected-practice':
      return (
        <span className={cn('flex items-center gap-1.5 text-sm text-primary', className)}>
          <Brain className={iconClass} />
          <span>{entry.title}</span>
        </span>
      );

    case 'injected-review':
      return (
        <span className={cn('flex items-center gap-1.5 text-sm text-blue-600', className)}>
          <BookOpen className={iconClass} />
          <span>{entry.title}</span>
        </span>
      );

    case 'retry':
      return (
        <span className={cn('flex items-center gap-1.5 text-sm text-orange-600', className)}>
          <RotateCcw className={iconClass} />
          <span>{entry.title}</span>
        </span>
      );

    case 'static':
    default:
      return (
        <span className={cn('flex items-center gap-1.5 text-sm', className)}>
          <span>{entry.title}</span>
        </span>
      );
  }
}
