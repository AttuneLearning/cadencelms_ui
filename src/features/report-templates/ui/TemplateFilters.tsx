/**
 * Template Filters Component
 * Filters for browsing report templates
 */

import React from 'react';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { Button } from '@/shared/ui/button';
import { Search, X } from 'lucide-react';
import type { ListReportTemplatesParams } from '@/entities/report-template';

interface TemplateFiltersProps {
  filters: ListReportTemplatesParams;
  onFiltersChange: (filters: ListReportTemplatesParams) => void;
  onClear?: () => void;
}

const CATEGORIES = [
  { value: 'enrollment', label: 'Enrollment' },
  { value: 'analytics', label: 'Analytics' },
  { value: 'performance', label: 'Performance' },
  { value: 'activity', label: 'Activity' },
  { value: 'assessment', label: 'Assessment' },
  { value: 'custom', label: 'Custom' },
];

const VISIBILITY_OPTIONS = [
  { value: 'private', label: 'Private' },
  { value: 'team', label: 'Team' },
  { value: 'department', label: 'Department' },
  { value: 'organization', label: 'Organization' },
  { value: 'system', label: 'System' },
];

export const TemplateFilters: React.FC<TemplateFiltersProps> = ({
  filters,
  onFiltersChange,
  onClear,
}) => {
  const hasActiveFilters = filters.search || filters.category || filters.visibility;

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-4">
        {/* Search */}
        <div className="flex-1 space-y-2">
          <Label htmlFor="search">Search Templates</Label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search by name or description..."
              value={filters.search || ''}
              onChange={(e) =>
                onFiltersChange({ ...filters, search: e.target.value || undefined })
              }
              className="pl-8"
            />
          </div>
        </div>

        {/* Category */}
        <div className="w-48 space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={filters.category || 'all'}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                category: value === 'all' ? undefined : value,
              })
            }
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Visibility */}
        <div className="w-48 space-y-2">
          <Label htmlFor="visibility">Visibility</Label>
          <Select
            value={filters.visibility || 'all'}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                visibility: value === 'all' ? undefined : (value as any),
              })
            }
          >
            <SelectTrigger id="visibility">
              <SelectValue placeholder="All Visibility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Visibility</SelectItem>
              {VISIBILITY_OPTIONS.map((vis) => (
                <SelectItem key={vis.value} value={vis.value}>
                  {vis.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && onClear && (
          <Button variant="outline" size="icon" onClick={onClear}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
