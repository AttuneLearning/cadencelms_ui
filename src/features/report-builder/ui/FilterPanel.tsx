/**
 * Filter Panel Component
 * Manage report filters (add, edit, remove)
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Plus } from 'lucide-react';
import { FilterRow } from './FilterRow';
import type { ReportFilter } from '@/shared/types/report-builder';
import { cn } from '@/shared/lib/utils';

interface FilterPanelProps {
  filters: ReportFilter[];
  onAddFilter: () => void;
  onUpdateFilter: (index: number, filter: ReportFilter) => void;
  onRemoveFilter: (index: number) => void;
  className?: string;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onAddFilter,
  onUpdateFilter,
  onRemoveFilter,
  className,
}) => {
  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Add filters to narrow down your report data</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={onAddFilter}>
            <Plus className="mr-2 h-4 w-4" />
            Add Filter
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {filters.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            No filters added. Click "Add Filter" to start filtering your data.
          </div>
        ) : (
          filters.map((filter, index) => (
            <FilterRow
              key={index}
              filter={filter}
              onUpdate={(updatedFilter) => onUpdateFilter(index, updatedFilter)}
              onRemove={() => onRemoveFilter(index)}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
};
