/**
 * Content Selector Component
 * Browse and select existing content from library
 */

import React, { useState } from 'react';
import { Search, Filter, X, Package, FileVideo, File as FileIcon, Eye } from 'lucide-react';
import { Card } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Label } from '@/shared/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/ui/dialog';
import { useContents, type ContentListItem, type ContentType } from '@/entities/content';
import { useDepartments } from '@/entities/department';
import { cn } from '@/shared/lib/utils';
import { format } from 'date-fns';

interface ContentSelectorProps {
  onSelect: (content: ContentListItem) => void;
  selectedContentId?: string;
  filterByType?: ContentType;
  departmentId?: string;
  className?: string;
}

export const ContentSelector: React.FC<ContentSelectorProps> = ({
  onSelect,
  selectedContentId,
  filterByType,
  departmentId,
  className,
}) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<ContentType | 'all'>(filterByType || 'all');
  const [departmentFilter, setDepartmentFilter] = useState<string>(departmentId || 'all');
  const [showFilters, setShowFilters] = useState(false);
  const [previewContent, setPreviewContent] = useState<ContentListItem | null>(null);

  // Fetch content with filters
  const { data: contentData, isLoading, error } = useContents({
    search: search || undefined,
    type: typeFilter !== 'all' ? typeFilter : undefined,
    departmentId: departmentFilter !== 'all' ? departmentFilter : undefined,
    status: 'published', // Only show published content
    limit: 50,
  });

  // Fetch departments for filter
  const { data: departmentsData } = useDepartments({ limit: 1000 });

  const handleContentSelect = (content: ContentListItem) => {
    onSelect(content);
  };

  const handlePreview = (content: ContentListItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewContent(content);
  };

  const getContentIcon = (type: ContentType) => {
    switch (type) {
      case 'scorm':
        return <Package className="h-5 w-5" />;
      case 'media':
        return <FileVideo className="h-5 w-5" />;
      case 'exercise':
        return <FileIcon className="h-5 w-5" />;
      default:
        return <FileIcon className="h-5 w-5" />;
    }
  };

  const getContentTypeBadge = (type: ContentType) => {
    const config = {
      scorm: { label: 'SCORM', variant: 'default' as const },
      media: { label: 'Media', variant: 'secondary' as const },
      exercise: { label: 'Exercise', variant: 'outline' as const },
    };
    return config[type] || { label: type, variant: 'outline' as const };
  };


  const hasActiveFilters = typeFilter !== 'all' || departmentFilter !== 'all' || search;

  const clearFilters = () => {
    setSearch('');
    setTypeFilter(filterByType || 'all');
    setDepartmentFilter(departmentId || 'all');
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search and Filter Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search content by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-2">
              {[typeFilter !== 'all', departmentFilter !== 'all', search].filter(Boolean).length}
            </Badge>
          )}
        </Button>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
          >
            <X className="h-4 w-4 mr-2" />
            Clear
          </Button>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type-filter">Content Type</Label>
              <Select
                value={typeFilter}
                onValueChange={(value) => setTypeFilter(value as ContentType | 'all')}
                disabled={!!filterByType}
              >
                <SelectTrigger id="type-filter">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="scorm">SCORM Packages</SelectItem>
                  <SelectItem value="media">Media Files</SelectItem>
                  <SelectItem value="exercise">Exercises</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department-filter">Department</Label>
              <Select
                value={departmentFilter}
                onValueChange={setDepartmentFilter}
                disabled={!!departmentId}
              >
                <SelectTrigger id="department-filter">
                  <SelectValue placeholder="All departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departmentsData?.departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card className="p-4 border-destructive">
          <div className="text-destructive text-sm">
            Failed to load content: {error.message}
          </div>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2 text-muted-foreground">
            <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>Loading content...</span>
          </div>
        </div>
      )}

      {/* Content Grid */}
      {!isLoading && !error && (
        <>
          {contentData?.content && contentData.content.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contentData.content.map((content) => (
                <Card
                  key={content.id}
                  className={cn(
                    'p-4 cursor-pointer transition-all hover:shadow-md',
                    selectedContentId === content.id && 'ring-2 ring-primary'
                  )}
                  onClick={() => handleContentSelect(content)}
                >
                  <div className="space-y-3">
                    {/* Thumbnail */}
                    <div className="aspect-video rounded-md bg-muted flex items-center justify-center overflow-hidden">
                      {content.thumbnailUrl ? (
                        <img
                          src={content.thumbnailUrl}
                          alt={content.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-muted-foreground">
                          {getContentIcon(content.type)}
                        </div>
                      )}
                    </div>

                    {/* Content Info */}
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium text-sm line-clamp-1">
                          {content.title}
                        </h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 flex-shrink-0"
                          onClick={(e) => handlePreview(content, e)}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>

                      {content.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {content.description}
                        </p>
                      )}

                      {/* Badges */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant={getContentTypeBadge(content.type).variant}
                          className="text-xs"
                        >
                          {getContentTypeBadge(content.type).label}
                        </Badge>
                        {content.department && (
                          <Badge variant="outline" className="text-xs">
                            {content.department.name}
                          </Badge>
                        )}
                      </div>

                      {/* Metadata */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          By {content.createdBy.name}
                        </span>
                        <span>
                          {format(new Date(content.createdAt), 'MMM dd, yyyy')}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8">
              <div className="text-center text-muted-foreground">
                <FileIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium">No content found</p>
                <p className="text-xs mt-1">
                  {hasActiveFilters
                    ? 'Try adjusting your filters'
                    : 'Upload content to get started'}
                </p>
              </div>
            </Card>
          )}

          {/* Pagination Info */}
          {contentData?.pagination && contentData.content.length > 0 && (
            <div className="text-sm text-muted-foreground text-center">
              Showing {contentData.content.length} of {contentData.pagination.total} items
            </div>
          )}
        </>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!previewContent} onOpenChange={() => setPreviewContent(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{previewContent?.title}</DialogTitle>
            <DialogDescription>Content Details</DialogDescription>
          </DialogHeader>
          {previewContent && (
            <div className="space-y-4">
              {/* Thumbnail */}
              {previewContent.thumbnailUrl && (
                <div className="aspect-video rounded-md bg-muted overflow-hidden">
                  <img
                    src={previewContent.thumbnailUrl}
                    alt={previewContent.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Description */}
              {previewContent.description && (
                <div>
                  <Label>Description</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {previewContent.description}
                  </p>
                </div>
              )}

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type</Label>
                  <div className="mt-1">
                    <Badge variant={getContentTypeBadge(previewContent.type).variant}>
                      {getContentTypeBadge(previewContent.type).label}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="mt-1">
                    <Badge variant="default">{previewContent.status}</Badge>
                  </div>
                </div>
                {previewContent.department && (
                  <div>
                    <Label>Department</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {previewContent.department.name}
                    </p>
                  </div>
                )}
                <div>
                  <Label>Created By</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {previewContent.createdBy.name}
                  </p>
                </div>
                <div>
                  <Label>Created At</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {format(new Date(previewContent.createdAt), 'MMM dd, yyyy')}
                  </p>
                </div>
                <div>
                  <Label>Last Updated</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {format(new Date(previewContent.updatedAt), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setPreviewContent(null)}>
                  Close
                </Button>
                <Button onClick={() => {
                  handleContentSelect(previewContent);
                  setPreviewContent(null);
                }}>
                  Select Content
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
