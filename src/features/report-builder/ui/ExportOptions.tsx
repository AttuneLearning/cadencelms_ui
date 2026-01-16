/**
 * Export Options Component
 * Select output format for report generation
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { FileText, FileSpreadsheet, Database, FileJson } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { ReportOutputFormat } from '@/shared/types/report-builder';

interface ExportOptionsProps {
  selected: ReportOutputFormat;
  onSelect: (format: ReportOutputFormat) => void;
  className?: string;
}

interface FormatOption {
  value: ReportOutputFormat;
  label: string;
  description: string;
  icon: React.ElementType;
  recommended?: boolean;
}

const FORMAT_OPTIONS: FormatOption[] = [
  {
    value: 'pdf',
    label: 'PDF',
    description: 'Best for printing and sharing',
    icon: FileText,
  },
  {
    value: 'excel',
    label: 'Excel',
    description: 'Best for data analysis',
    icon: FileSpreadsheet,
    recommended: true,
  },
  {
    value: 'csv',
    label: 'CSV',
    description: 'Best for importing to other tools',
    icon: Database,
  },
  {
    value: 'json',
    label: 'JSON',
    description: 'Best for developers and APIs',
    icon: FileJson,
  },
];

export const ExportOptions: React.FC<ExportOptionsProps> = ({
  selected,
  onSelect,
  className,
}) => {
  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle>Export Format</CardTitle>
        <CardDescription>Choose how you want to receive your report</CardDescription>
      </CardHeader>

      <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {FORMAT_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isSelected = selected === option.value;

          return (
            <button
              key={option.value}
              onClick={() => onSelect(option.value)}
              className={cn(
                'relative flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all',
                'hover:border-primary/50',
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card'
              )}
            >
              {option.recommended && (
                <Badge
                  variant="outline"
                  className="absolute top-2 right-2 text-xs border-green-600 text-green-600 bg-green-50"
                >
                  Recommended
                </Badge>
              )}

              <div className={cn(
                'flex items-center justify-center w-12 h-12 rounded-lg',
                isSelected ? 'bg-primary text-primary-foreground' : 'bg-secondary'
              )}>
                <Icon className="h-6 w-6" />
              </div>

              <div className="text-center">
                <p className="text-sm font-semibold">{option.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{option.description}</p>
              </div>

              {isSelected && (
                <div className="absolute inset-0 rounded-lg border-2 border-primary pointer-events-none" />
              )}
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
};
