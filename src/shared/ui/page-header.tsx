/**
 * PageHeader component for consistent page headers across the application
 */

import React from 'react';
import { cn } from '@/shared/lib/utils';

export interface PageHeaderProps {
  /** Page title - can be a string or ReactNode (for inline badges, icons, etc.) */
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  /** Optional back button element to render before the title */
  backButton?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  children,
  className,
  backButton,
}) => {
  return (
    <div className={cn('flex flex-col gap-4 pb-4 md:flex-row md:items-center md:justify-between', className)}>
      <div className="flex items-center gap-4">
        {backButton}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
          {description && (
            <div className="text-muted-foreground">{description}</div>
          )}
        </div>
      </div>
      {children && (
        <div className="flex items-center gap-2">
          {children}
        </div>
      )}
    </div>
  );
};
