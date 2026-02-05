/**
 * ModuleLibraryCard Component
 * Displays a module from the shared library with usage statistics
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/shared/ui/tooltip';
import {
  BookOpen,
  Clock,
  Users,
  TrendingUp,
  Building,
  Plus,
  Eye,
  MoreHorizontal,
  AlertCircle,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import type { ModuleLibraryItem } from '@/entities/module';
import { cn } from '@/shared/lib/utils';

interface ModuleLibraryCardProps {
  module: ModuleLibraryItem;
  isSelected?: boolean;
  onSelect?: (module: ModuleLibraryItem) => void;
  onView?: (module: ModuleLibraryItem) => void;
  onAdd?: (module: ModuleLibraryItem) => void;
  showActions?: boolean;
  className?: string;
}

const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};

export const ModuleLibraryCard: React.FC<ModuleLibraryCardProps> = ({
  module,
  isSelected = false,
  onSelect,
  onView,
  onAdd,
  showActions = true,
  className,
}) => {
  return (
    <Card
      className={cn(
        'transition-all hover:shadow-md',
        isSelected && 'ring-2 ring-primary',
        onSelect && 'cursor-pointer',
        className
      )}
      onClick={() => onSelect?.(module)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="line-clamp-1 text-base">{module.title}</CardTitle>
            <CardDescription className="mt-1 line-clamp-2">
              {module.description || 'No description available'}
            </CardDescription>
          </div>
          {showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onView?.(module)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                {onAdd && (
                  <DropdownMenuItem onClick={() => onAdd(module)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add to Course
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Status badges */}
        <div className="mt-2 flex flex-wrap gap-1">
          {module.isPublished ? (
            <Badge variant="default" className="bg-green-600 text-xs">
              Published
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs">
              Draft
            </Badge>
          )}
          {module.usedInCourseVersionsCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              Used in {module.usedInCourseVersionsCount} course(s)
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <BookOpen className="h-4 w-4" />
                  <span>{module.learningUnitCount} units</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>Learning units in this module</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{formatDuration(module.estimatedDuration)}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>Estimated duration</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{module.totalEnrollments.toLocaleString()}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>Total learners enrolled</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  <span>
                    {module.averageCompletionRate !== null
                      ? `${module.averageCompletionRate.toFixed(1)}%`
                      : 'N/A'}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>Average completion rate</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Owner info */}
        <div className="mt-3 flex items-center gap-2 border-t pt-3 text-xs text-muted-foreground">
          <Building className="h-3 w-3" />
          <span>{module.ownerDepartment.name}</span>
          <span className="mx-1">•</span>
          <span>
            by {module.createdBy.firstName} {module.createdBy.lastName}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * ModuleUsageWarning Component
 * Shows warning when a module is used in multiple courses
 */

interface ModuleUsageWarningProps {
  publishedCount: number;
  draftCount: number;
}

export const ModuleUsageWarning: React.FC<ModuleUsageWarningProps> = ({
  publishedCount,
  draftCount,
}) => {
  if (publishedCount === 0 && draftCount === 0) return null;

  return (
    <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
      <AlertCircle className="mt-0.5 h-4 w-4 text-amber-600" />
      <div className="text-sm text-amber-800">
        <p className="font-medium">This module is shared across multiple courses</p>
        <p className="mt-1 text-xs">
          Changes will affect {publishedCount > 0 && `${publishedCount} published course(s)`}
          {publishedCount > 0 && draftCount > 0 && ' and '}
          {draftCount > 0 && `${draftCount} draft course(s)`}.
        </p>
      </div>
    </div>
  );
};
