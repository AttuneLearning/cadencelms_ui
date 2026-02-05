/**
 * ModuleLibraryBrowser Component
 * Browse and search the shared module library
 */

import React from 'react';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { Skeleton } from '@/shared/ui/skeleton';
import { Search, Filter, Grid3X3, List, RefreshCw, Plus } from 'lucide-react';
import { ModuleLibraryCard } from './ModuleLibraryCard';
import type { ModuleLibraryItem, ModuleLibraryFilters } from '@/entities/module';
import { cn } from '@/shared/lib/utils';

interface ModuleLibraryBrowserProps {
  modules: ModuleLibraryItem[];
  isLoading?: boolean;
  totalCount?: number;
  departments?: Array<{ id: string; name: string }>;
  filters: ModuleLibraryFilters;
  onFiltersChange: (filters: ModuleLibraryFilters) => void;
  onModuleSelect?: (module: ModuleLibraryItem) => void;
  onModuleAdd?: (module: ModuleLibraryItem) => void;
  onModuleView?: (module: ModuleLibraryItem) => void;
  onRefresh?: () => void;
  onCreateNew?: () => void;
  selectedModuleIds?: string[];
  className?: string;
}

type ViewMode = 'grid' | 'list';

export const ModuleLibraryBrowser: React.FC<ModuleLibraryBrowserProps> = ({
  modules,
  isLoading = false,
  totalCount,
  departments = [],
  filters,
  onFiltersChange,
  onModuleSelect,
  onModuleAdd,
  onModuleView,
  onRefresh,
  onCreateNew,
  selectedModuleIds = [],
  className,
}) => {
  const [viewMode, setViewMode] = React.useState<ViewMode>('grid');
  const [searchValue, setSearchValue] = React.useState(filters.search || '');

  // Debounced search
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchValue !== filters.search) {
        onFiltersChange({ ...filters, search: searchValue || undefined, page: 1 });
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchValue, filters, onFiltersChange]);

  const handleDepartmentChange = (value: string) => {
    onFiltersChange({
      ...filters,
      departmentId: value === 'all' ? undefined : value,
      page: 1,
    });
  };

  const handlePublishedChange = (value: string) => {
    onFiltersChange({
      ...filters,
      isPublished: value === 'all' ? undefined : value === 'published',
      page: 1,
    });
  };

  const activeFilterCount = [
    filters.departmentId,
    filters.isPublished !== undefined,
    filters.search,
  ].filter(Boolean).length;

  const handleClearFilters = () => {
    setSearchValue('');
    onFiltersChange({ page: 1, limit: filters.limit });
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search modules..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
              <RefreshCw className={cn('mr-2 h-4 w-4', isLoading && 'animate-spin')} />
              Refresh
            </Button>
          )}
          {onCreateNew && (
            <Button size="sm" onClick={onCreateNew}>
              <Plus className="mr-2 h-4 w-4" />
              Create Module
            </Button>
          )}
        </div>
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Filters:</span>
        </div>

        <Select
          value={filters.departmentId || 'all'}
          onValueChange={handleDepartmentChange}
        >
          <SelectTrigger className="h-8 w-[180px]">
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept.id} value={dept.id}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={
            filters.isPublished === undefined
              ? 'all'
              : filters.isPublished
                ? 'published'
                : 'draft'
          }
          onValueChange={handlePublishedChange}
        >
          <SelectTrigger className="h-8 w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>

        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={handleClearFilters} className="h-8">
            Clear filters
            <Badge variant="secondary" className="ml-2">
              {activeFilterCount}
            </Badge>
          </Button>
        )}

        {/* View mode toggle */}
        <div className="ml-auto flex items-center gap-1 rounded-md border p-1">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Results count */}
      {totalCount !== undefined && (
        <div className="text-sm text-muted-foreground">
          {totalCount} module{totalCount !== 1 ? 's' : ''} found
        </div>
      )}

      {/* Module grid/list */}
      {isLoading ? (
        <div
          className={cn(
            viewMode === 'grid'
              ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3'
              : 'space-y-3'
          )}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <ModuleCardSkeleton key={i} />
          ))}
        </div>
      ) : modules.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <p className="text-muted-foreground">No modules found</p>
          {activeFilterCount > 0 && (
            <Button variant="link" onClick={handleClearFilters} className="mt-2">
              Clear filters to see all modules
            </Button>
          )}
        </div>
      ) : (
        <div
          className={cn(
            viewMode === 'grid'
              ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3'
              : 'space-y-3'
          )}
        >
          {modules.map((module) => (
            <ModuleLibraryCard
              key={module.id}
              module={module}
              isSelected={selectedModuleIds.includes(module.id)}
              onSelect={onModuleSelect}
              onView={onModuleView}
              onAdd={onModuleAdd}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Skeleton for loading state
 */
const ModuleCardSkeleton: React.FC = () => (
  <div className="rounded-lg border p-4">
    <Skeleton className="mb-2 h-5 w-3/4" />
    <Skeleton className="mb-4 h-4 w-full" />
    <div className="grid grid-cols-2 gap-2">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-18" />
    </div>
  </div>
);
