/**
 * CatalogFilters Component
 * Filter panel for course catalog
 */

import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Label } from '@/shared/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

export interface CatalogFilterValues {
  department?: string;
  program?: string;
  difficulty?: string;
  level?: string;
  sort?: string;
}

interface CatalogFiltersProps {
  filters: CatalogFilterValues;
  onFilterChange: (filters: CatalogFilterValues) => void;
  departments?: Array<{ id: string; name: string }>;
  programs?: Array<{ id: string; name: string }>;
}

export const CatalogFilters: React.FC<CatalogFiltersProps> = ({
  filters,
  onFilterChange,
  departments = [],
  programs = [],
}) => {
  const handleFilterChange = (key: keyof CatalogFilterValues, value: string) => {
    onFilterChange({
      ...filters,
      [key]: value === 'all' ? undefined : value,
    });
  };

  const handleClearFilters = () => {
    onFilterChange({});
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== undefined);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filters</CardTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              aria-label="Clear filters"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Department Filter */}
        <div className="space-y-2">
          <Label htmlFor="department-filter">Department</Label>
          <Select
            value={filters.department || 'all'}
            onValueChange={(value) => handleFilterChange('department', value)}
          >
            <SelectTrigger id="department-filter">
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
        </div>

        {/* Program Filter */}
        <div className="space-y-2">
          <Label htmlFor="program-filter">Program</Label>
          <Select
            value={filters.program || 'all'}
            onValueChange={(value) => handleFilterChange('program', value)}
          >
            <SelectTrigger id="program-filter">
              <SelectValue placeholder="All Programs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Programs</SelectItem>
              {programs.map((prog) => (
                <SelectItem key={prog.id} value={prog.id}>
                  {prog.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Difficulty Filter */}
        <div className="space-y-2">
          <Label htmlFor="difficulty-filter">Difficulty</Label>
          <Select
            value={filters.difficulty || 'all'}
            onValueChange={(value) => handleFilterChange('difficulty', value)}
          >
            <SelectTrigger id="difficulty-filter">
              <SelectValue placeholder="All Levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort By */}
        <div className="space-y-2">
          <Label htmlFor="sort-filter">Sort By</Label>
          <Select
            value={filters.sort || 'title:asc'}
            onValueChange={(value) => handleFilterChange('sort', value)}
          >
            <SelectTrigger id="sort-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="title:asc">Name (A-Z)</SelectItem>
              <SelectItem value="title:desc">Name (Z-A)</SelectItem>
              <SelectItem value="createdAt:desc">Newest First</SelectItem>
              <SelectItem value="createdAt:asc">Oldest First</SelectItem>
              <SelectItem value="enrollmentCount:desc">Most Popular</SelectItem>
              <SelectItem value="duration:asc">Shortest Duration</SelectItem>
              <SelectItem value="duration:desc">Longest Duration</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};
