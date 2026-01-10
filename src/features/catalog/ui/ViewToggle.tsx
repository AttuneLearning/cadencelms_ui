/**
 * ViewToggle Component
 * Toggle between grid and list view
 */

import React from 'react';
import { LayoutGrid, List } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/lib/utils';

export type ViewMode = 'grid' | 'list';

interface ViewToggleProps {
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({ view, onViewChange }) => {
  return (
    <div className="flex items-center gap-1 border rounded-md p-1">
      <Button
        variant={view === 'grid' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('grid')}
        aria-label="Grid view"
        data-active={view === 'grid'}
        className={cn(
          'h-8 px-3',
          view === 'grid' && 'bg-primary text-primary-foreground'
        )}
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
      <Button
        variant={view === 'list' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('list')}
        aria-label="List view"
        data-active={view === 'list'}
        className={cn(
          'h-8 px-3',
          view === 'list' && 'bg-primary text-primary-foreground'
        )}
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  );
};
