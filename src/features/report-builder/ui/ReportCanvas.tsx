/**
 * Report Canvas Component
 * Main canvas with drop zones for building custom reports
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { X, AlertCircle } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { ReportDimension, ReportMeasure, ReportSlicer } from '@/shared/types/report-builder';
import type { FieldItem } from './FieldPalette';

interface ReportCanvasProps {
  dimensions: ReportDimension[];
  measures: ReportMeasure[];
  slicers?: ReportSlicer[];
  groups?: string[];
  onAddDimension?: (dimension: ReportDimension) => void;
  onRemoveDimension?: (index: number) => void;
  onAddMeasure?: (measure: ReportMeasure) => void;
  onRemoveMeasure?: (index: number) => void;
  onAddSlicer?: (slicer: ReportSlicer) => void;
  onRemoveSlicer?: (index: number) => void;
  errors?: string[];
  className?: string;
}

interface DropZoneProps {
  title: string;
  description: string;
  items: Array<{ type: string; label?: string }>;
  onDrop: (field: FieldItem) => void;
  onRemove: (index: number) => void;
  emptyMessage: string;
  acceptType: 'dimension' | 'measure';
  className?: string;
}

const DropZone: React.FC<DropZoneProps> = ({
  title,
  description,
  items,
  onDrop,
  onRemove,
  emptyMessage,
  acceptType,
  className,
}) => {
  const [isDragOver, setIsDragOver] = React.useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    try {
      const data = e.dataTransfer.getData('application/json');
      const field: FieldItem = JSON.parse(data);

      // Validate field type
      if (field.type !== acceptType) {
        return;
      }

      onDrop(field);
    } catch (error) {
      console.error('Failed to parse dropped field:', error);
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'min-h-[100px] p-3 rounded-lg border-2 border-dashed transition-colors',
          isDragOver
            ? 'border-primary bg-primary/5'
            : 'border-border bg-card hover:border-primary/50'
        )}
      >
        {items.length === 0 ? (
          <div className="flex items-center justify-center h-[76px] text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 rounded-md bg-secondary"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium capitalize">
                    {item.label || item.type.replace('-', ' ')}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {item.type}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove(index)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const ReportCanvas: React.FC<ReportCanvasProps> = ({
  dimensions,
  measures,
  slicers = [],
  groups = [],
  onAddDimension,
  onRemoveDimension,
  onAddMeasure,
  onRemoveMeasure,
  onRemoveSlicer: _onRemoveSlicer,
  errors = [],
  className,
}) => {
  const handleAddDimension = (field: FieldItem) => {
    if (onAddDimension) {
      onAddDimension({
        type: field.id as any,
        label: field.label,
      });
    }
  };

  const handleAddMeasure = (field: FieldItem) => {
    if (onAddMeasure) {
      onAddMeasure({
        type: field.id as any,
        label: field.label,
      });
    }
  };

  return (
    <Card className={cn('h-full', className)}>
      <CardHeader>
        <CardTitle>Report Structure</CardTitle>
        <CardDescription>Drag and drop fields to build your report</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Validation Errors */}
        {errors.length > 0 && (
          <div className="rounded-lg border border-destructive bg-destructive/10 p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-destructive">Validation Errors</p>
                <ul className="mt-1 space-y-1">
                  {errors.map((error, index) => (
                    <li key={index} className="text-xs text-destructive">
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Dimensions Drop Zone */}
        <DropZone
          title="Dimensions (Rows)"
          description="How to group your data"
          items={dimensions}
          onDrop={handleAddDimension}
          onRemove={onRemoveDimension || (() => {})}
          emptyMessage="Drag dimensions here to group your data"
          acceptType="dimension"
        />

        {/* Measures Drop Zone */}
        <DropZone
          title="Measures (Values)"
          description="What to calculate"
          items={measures}
          onDrop={handleAddMeasure}
          onRemove={onRemoveMeasure || (() => {})}
          emptyMessage="Drag measures here to calculate values"
          acceptType="measure"
        />

        {/* Report Summary */}
        <div className="rounded-lg border border-border bg-muted/50 p-3">
          <h3 className="text-sm font-semibold mb-2">Report Summary</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{dimensions.length}</p>
              <p className="text-xs text-muted-foreground">Dimensions</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{measures.length}</p>
              <p className="text-xs text-muted-foreground">Measures</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{slicers.length + groups.length}</p>
              <p className="text-xs text-muted-foreground">Filters</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
