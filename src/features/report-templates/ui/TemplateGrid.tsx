/**
 * Template Grid Component
 * Displays a grid of report templates
 */

import React from 'react';
import type { ReportTemplate } from '@/entities/report-template';
import { TemplateCard } from './TemplateCard';
import { cn } from '@/shared/lib/utils';

interface TemplateGridProps {
  templates: ReportTemplate[];
  onUse?: (template: ReportTemplate) => void;
  onView?: (templateId: string) => void;
  emptyMessage?: string;
  className?: string;
}

export const TemplateGrid: React.FC<TemplateGridProps> = ({
  templates,
  onUse,
  onView,
  emptyMessage = 'No templates found',
  className,
}) => {
  if (templates.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4',
        className
      )}
    >
      {templates.map((template) => (
        <TemplateCard
          key={template._id}
          template={template}
          onUse={onUse}
          onView={onView}
        />
      ))}
    </div>
  );
};
