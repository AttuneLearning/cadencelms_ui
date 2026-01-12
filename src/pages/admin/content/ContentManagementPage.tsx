/**
 * Content Management Page
 * Admin interface for managing content with SCORM packages and media library
 */

import React from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { DataTable } from '@/shared/ui/data-table';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Checkbox } from '@/shared/ui/checkbox';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { useToast } from '@/shared/ui/use-toast';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { Card } from '@/shared/ui/card';
import { Label } from '@/shared/ui/label';
import {
  ContentForm,
  useScormPackages,
  useMediaFiles,
  useDeleteScormPackage,
  useDeleteMediaFile,
  usePublishScormPackage,
  useUnpublishScormPackage,
  useLaunchScormPackage,
  type ScormPackageListItem,
  type ScormPackageFilters,
  type MediaFileListItem,
  type MediaFileFilters,
  type ContentStatus,
  type MediaType,
} from '@/entities/content';
import { useDepartments } from '@/entities/department';
import {
  MoreHorizontal,
  Trash,
  Eye,
  EyeOff,
  Loader2,
  Filter,
  X,
  Play,
  Upload,
  Package,
  Image as ImageIcon,
} from 'lucide-react';

type TabValue = 'scorm' | 'media';

export const ContentManagementPage: React.FC = () => {
  // State for tab management
  const [activeTab, setActiveTab] = React.useState<TabValue>('scorm');

  // State for selections and dialogs - SCORM
  const [selectedScormPackages, setSelectedScormPackages] = React.useState<ScormPackageListItem[]>([]);
  const [scormToDelete, setScormToDelete] = React.useState<string | null>(null);
  const [scormToPublish, setScormToPublish] = React.useState<{
    id: string;
    action: 'publish' | 'unpublish';
  } | null>(null);
  const [scormToLaunch, setScormToLaunch] = React.useState<ScormPackageListItem | null>(null);
  const [isScormUploadOpen, setIsScormUploadOpen] = React.useState(false);
  const [isScormDeleteConfirmOpen, setIsScormDeleteConfirmOpen] = React.useState(false);
  const [isScormPublishConfirmOpen, setIsScormPublishConfirmOpen] = React.useState(false);
  const [isBulkScormDeleteConfirmOpen, setIsBulkScormDeleteConfirmOpen] = React.useState(false);
  const [isScormLaunchOpen, setIsScormLaunchOpen] = React.useState(false);

  // State for selections and dialogs - Media
  const [selectedMediaFiles, setSelectedMediaFiles] = React.useState<MediaFileListItem[]>([]);
  const [mediaToDelete, setMediaToDelete] = React.useState<string | null>(null);
  const [isMediaUploadOpen, setIsMediaUploadOpen] = React.useState(false);
  const [isMediaDeleteConfirmOpen, setIsMediaDeleteConfirmOpen] = React.useState(false);
  const [isBulkMediaDeleteConfirmOpen, setIsBulkMediaDeleteConfirmOpen] = React.useState(false);

  // State for filters - SCORM
  const [scormFilters, setScormFilters] = React.useState<ScormPackageFilters>({
    page: 1,
    limit: 50,
  });
  const [showScormFilters, setShowScormFilters] = React.useState(false);

  // State for filters - Media
  const [mediaFilters, setMediaFilters] = React.useState<MediaFileFilters>({
    page: 1,
    limit: 50,
  });
  const [showMediaFilters, setShowMediaFilters] = React.useState(false);

  const { toast } = useToast();

  // Fetch SCORM packages with filters
  const { data: scormData, isLoading: isLoadingScorm, error: scormError } = useScormPackages(scormFilters);

  // Fetch media files with filters
  const { data: mediaData, isLoading: isLoadingMedia, error: mediaError } = useMediaFiles(mediaFilters);

  // Fetch departments for filters
  const { data: departmentsData } = useDepartments({ limit: 1000 });

  // SCORM Mutations
  const deleteScorm = useDeleteScormPackage({
    onSuccess: () => {
      toast({
        title: 'SCORM package deleted',
        description: 'SCORM package has been successfully deleted.',
      });
      setIsScormDeleteConfirmOpen(false);
      setScormToDelete(null);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete SCORM package. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const publishScorm = usePublishScormPackage({
    onSuccess: () => {
      toast({
        title: 'SCORM package published',
        description: 'SCORM package is now available for use.',
      });
      setIsScormPublishConfirmOpen(false);
      setScormToPublish(null);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to publish SCORM package. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const unpublishScorm = useUnpublishScormPackage({
    onSuccess: () => {
      toast({
        title: 'SCORM package unpublished',
        description: 'SCORM package is no longer available for use.',
      });
      setIsScormPublishConfirmOpen(false);
      setScormToPublish(null);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to unpublish SCORM package. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const launchScorm = useLaunchScormPackage({
    onSuccess: (data) => {
      // Open SCORM player in new window
      window.open(data.playerUrl, '_blank', 'width=1024,height=768');
      setIsScormLaunchOpen(false);
      setScormToLaunch(null);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to launch SCORM package. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Media Mutations
  const deleteMedia = useDeleteMediaFile({
    onSuccess: () => {
      toast({
        title: 'Media file deleted',
        description: 'Media file has been successfully deleted.',
      });
      setIsMediaDeleteConfirmOpen(false);
      setMediaToDelete(null);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete media file. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // SCORM Action handlers
  const handleScormDelete = (id: string) => {
    setScormToDelete(id);
    setIsScormDeleteConfirmOpen(true);
  };

  const handleBulkScormDelete = () => {
    setIsBulkScormDeleteConfirmOpen(true);
  };

  const handleScormPublishToggle = (scorm: ScormPackageListItem) => {
    setScormToPublish({
      id: scorm.id,
      action: scorm.isPublished ? 'unpublish' : 'publish',
    });
    setIsScormPublishConfirmOpen(true);
  };

  const handleScormLaunch = (scorm: ScormPackageListItem) => {
    setScormToLaunch(scorm);
    setIsScormLaunchOpen(true);
  };

  const confirmScormDelete = () => {
    if (scormToDelete) {
      deleteScorm.mutate(scormToDelete);
    }
  };

  const confirmBulkScormDelete = async () => {
    try {
      await Promise.all(selectedScormPackages.map((scorm) => deleteScorm.mutateAsync(scorm.id)));
      toast({
        title: 'SCORM packages deleted',
        description: `${selectedScormPackages.length} SCORM package(s) have been successfully deleted.`,
      });
      setSelectedScormPackages([]);
      setIsBulkScormDeleteConfirmOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete some SCORM packages. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const confirmScormPublish = () => {
    if (scormToPublish) {
      if (scormToPublish.action === 'publish') {
        publishScorm.mutate({ id: scormToPublish.id });
      } else {
        unpublishScorm.mutate(scormToPublish.id);
      }
    }
  };

  const confirmScormLaunch = () => {
    if (scormToLaunch) {
      launchScorm.mutate({ id: scormToLaunch.id });
    }
  };

  // Media Action handlers
  const handleMediaDelete = (id: string) => {
    setMediaToDelete(id);
    setIsMediaDeleteConfirmOpen(true);
  };

  const handleBulkMediaDelete = () => {
    setIsBulkMediaDeleteConfirmOpen(true);
  };

  const confirmMediaDelete = () => {
    if (mediaToDelete) {
      deleteMedia.mutate(mediaToDelete);
    }
  };

  const confirmBulkMediaDelete = async () => {
    try {
      await Promise.all(selectedMediaFiles.map((media) => deleteMedia.mutateAsync(media.id)));
      toast({
        title: 'Media files deleted',
        description: `${selectedMediaFiles.length} media file(s) have been successfully deleted.`,
      });
      setSelectedMediaFiles([]);
      setIsBulkMediaDeleteConfirmOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete some media files. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Filter handlers - SCORM
  const handleScormFilterChange = (key: keyof ScormPackageFilters, value: string | undefined) => {
    setScormFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
      page: 1, // Reset to first page when filters change
    }));
  };

  const clearScormFilters = () => {
    setScormFilters({
      page: 1,
      limit: 50,
    });
  };

  const hasActiveScormFilters = scormFilters.departmentId || scormFilters.status || scormFilters.version || scormFilters.search;

  // Filter handlers - Media
  const handleMediaFilterChange = (key: keyof MediaFileFilters, value: string | undefined) => {
    setMediaFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
      page: 1, // Reset to first page when filters change
    }));
  };

  const clearMediaFilters = () => {
    setMediaFilters({
      page: 1,
      limit: 50,
    });
  };

  const hasActiveMediaFilters = mediaFilters.departmentId || mediaFilters.type || mediaFilters.search;

  // Form success handlers
  const handleScormUploadSuccess = () => {
    setIsScormUploadOpen(false);
  };

  const handleMediaUploadSuccess = () => {
    setIsMediaUploadOpen(false);
  };

  // Define SCORM columns
  const scormColumns: ColumnDef<ScormPackageListItem>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => {
        const scorm = row.original;
        return (
          <div>
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{scorm.title}</span>
            </div>
            {scorm.description && (
              <div className="text-sm text-muted-foreground line-clamp-1 mt-1">
                {scorm.description}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'version',
      header: 'SCORM Version',
      cell: ({ row }) => {
        const version = row.original.version;
        return <Badge variant="outline">SCORM {version}</Badge>;
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const scorm = row.original;
        return (
          <div className="flex items-center gap-2">
            <Badge variant={getStatusVariant(scorm.status)}>
              {formatStatus(scorm.status)}
            </Badge>
            {scorm.isPublished && (
              <Badge variant="default" className="text-xs">
                Published
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'department',
      header: 'Department',
      cell: ({ row }) => {
        const scorm = row.original;
        return scorm.department ? (
          <div className="text-sm">{scorm.department.name}</div>
        ) : (
          <span className="text-muted-foreground text-sm">-</span>
        );
      },
    },
    {
      accessorKey: 'fileSize',
      header: 'File Size',
      cell: ({ row }) => {
        const size = row.original.fileSize;
        return <span className="text-sm">{formatFileSize(size)}</span>;
      },
    },
    {
      accessorKey: 'updatedAt',
      header: 'Last Updated',
      cell: ({ row }) => {
        const updated = row.original.updatedAt;
        return (
          <span className="text-sm text-muted-foreground">
            {format(new Date(updated), 'MMM dd, yyyy')}
          </span>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const scorm = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleScormLaunch(scorm)}>
                <Play className="mr-2 h-4 w-4" />
                Launch Player
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleScormPublishToggle(scorm)}>
                {scorm.isPublished ? (
                  <>
                    <EyeOff className="mr-2 h-4 w-4" />
                    Unpublish
                  </>
                ) : (
                  <>
                    <Eye className="mr-2 h-4 w-4" />
                    Publish
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleScormDelete(scorm.id)}
                className="text-destructive"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete Package
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // Define Media columns
  const mediaColumns: ColumnDef<MediaFileListItem>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => {
        const media = row.original;
        return (
          <div className="flex items-center gap-3">
            {media.thumbnailUrl ? (
              <img
                src={media.thumbnailUrl}
                alt={media.title}
                className="h-10 w-10 rounded object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                <ImageIcon className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
            <div>
              <div className="font-medium">{media.title}</div>
              <div className="text-xs text-muted-foreground">{media.filename}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => {
        const type = row.original.type;
        return <Badge variant="secondary">{formatMediaType(type)}</Badge>;
      },
    },
    {
      accessorKey: 'department',
      header: 'Department',
      cell: ({ row }) => {
        const media = row.original;
        return media.department ? (
          <div className="text-sm">{media.department.name}</div>
        ) : (
          <span className="text-muted-foreground text-sm">-</span>
        );
      },
    },
    {
      accessorKey: 'size',
      header: 'File Size',
      cell: ({ row }) => {
        const size = row.original.size;
        return <span className="text-sm">{formatFileSize(size)}</span>;
      },
    },
    {
      accessorKey: 'duration',
      header: 'Duration',
      cell: ({ row }) => {
        const duration = row.original.duration;
        return duration ? (
          <span className="text-sm">{formatDuration(duration)}</span>
        ) : (
          <span className="text-muted-foreground text-sm">-</span>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Uploaded',
      cell: ({ row }) => {
        const created = row.original.createdAt;
        return (
          <span className="text-sm text-muted-foreground">
            {format(new Date(created), 'MMM dd, yyyy')}
          </span>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const media = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => window.open(media.url, '_blank')}>
                <Eye className="mr-2 h-4 w-4" />
                View Media
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleMediaDelete(media.id)}
                className="text-destructive"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete Media
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Management</h1>
          <p className="text-muted-foreground">
            Manage SCORM packages and media library
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabValue)}>
        <TabsList>
          <TabsTrigger value="scorm">
            <Package className="mr-2 h-4 w-4" />
            SCORM Packages
          </TabsTrigger>
          <TabsTrigger value="media">
            <ImageIcon className="mr-2 h-4 w-4" />
            Media Library
          </TabsTrigger>
        </TabsList>

        {/* SCORM Tab Content */}
        <TabsContent value="scorm" className="space-y-4">
          {/* SCORM Actions Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {selectedScormPackages.length > 0 && (
                <Button variant="destructive" onClick={handleBulkScormDelete}>
                  <Trash className="mr-2 h-4 w-4" />
                  Delete Selected ({selectedScormPackages.length})
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setShowScormFilters(!showScormFilters)}>
                <Filter className="mr-2 h-4 w-4" />
                Filters
                {hasActiveScormFilters && (
                  <Badge variant="secondary" className="ml-2">
                    {Object.keys(scormFilters).filter((k) => k !== 'page' && k !== 'limit' && scormFilters[k as keyof ScormPackageFilters]).length}
                  </Badge>
                )}
              </Button>
              <Button onClick={() => setIsScormUploadOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Upload SCORM
              </Button>
            </div>
          </div>

          {/* SCORM Filters */}
          {showScormFilters && (
            <Card className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Filters</h3>
                  <p className="text-sm text-muted-foreground">
                    Filter SCORM packages by status, department, version, or search
                  </p>
                </div>
                {hasActiveScormFilters && (
                  <Button variant="ghost" size="sm" onClick={clearScormFilters}>
                    <X className="mr-2 h-4 w-4" />
                    Clear All
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="scorm-filter-status">Status</Label>
                  <Select
                    value={scormFilters.status || 'all'}
                    onValueChange={(value) =>
                      handleScormFilterChange('status', value === 'all' ? undefined : value)
                    }
                  >
                    <SelectTrigger id="scorm-filter-status">
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scorm-filter-version">SCORM Version</Label>
                  <Select
                    value={scormFilters.version || 'all'}
                    onValueChange={(value) =>
                      handleScormFilterChange('version', value === 'all' ? undefined : value)
                    }
                  >
                    <SelectTrigger id="scorm-filter-version">
                      <SelectValue placeholder="All versions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Versions</SelectItem>
                      <SelectItem value="1.2">SCORM 1.2</SelectItem>
                      <SelectItem value="2004">SCORM 2004</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scorm-filter-department">Department</Label>
                  <Select
                    value={scormFilters.departmentId || 'all'}
                    onValueChange={(value) =>
                      handleScormFilterChange('departmentId', value === 'all' ? undefined : value)
                    }
                  >
                    <SelectTrigger id="scorm-filter-department">
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

                <div className="space-y-2">
                  <Label htmlFor="scorm-filter-search">Search</Label>
                  <div className="relative">
                    <input
                      id="scorm-filter-search"
                      type="text"
                      placeholder="Search packages..."
                      value={scormFilters.search || ''}
                      onChange={(e) => handleScormFilterChange('search', e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* SCORM Error State */}
          {scormError && (
            <Card className="p-6 border-destructive">
              <div className="text-destructive">
                <h3 className="font-semibold mb-2">Error loading SCORM packages</h3>
                <p className="text-sm">{scormError.message}</p>
              </div>
            </Card>
          )}

          {/* SCORM Loading State */}
          {isLoadingScorm && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading SCORM packages...</span>
            </div>
          )}

          {/* SCORM Data Table */}
          {!isLoadingScorm && !scormError && (
            <DataTable
              columns={scormColumns}
              data={scormData?.packages || []}
              searchable
              searchPlaceholder="Search SCORM packages..."
              onRowSelectionChange={setSelectedScormPackages}
            />
          )}

          {/* SCORM Pagination Info */}
          {scormData?.pagination && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div>
                Showing {scormData.packages.length} of {scormData.pagination.total} package(s)
              </div>
              <div>
                Page {scormData.pagination.page} of {scormData.pagination.totalPages}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Media Tab Content */}
        <TabsContent value="media" className="space-y-4">
          {/* Media Actions Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {selectedMediaFiles.length > 0 && (
                <Button variant="destructive" onClick={handleBulkMediaDelete}>
                  <Trash className="mr-2 h-4 w-4" />
                  Delete Selected ({selectedMediaFiles.length})
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setShowMediaFilters(!showMediaFilters)}>
                <Filter className="mr-2 h-4 w-4" />
                Filters
                {hasActiveMediaFilters && (
                  <Badge variant="secondary" className="ml-2">
                    {Object.keys(mediaFilters).filter((k) => k !== 'page' && k !== 'limit' && mediaFilters[k as keyof MediaFileFilters]).length}
                  </Badge>
                )}
              </Button>
              <Button onClick={() => setIsMediaUploadOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Upload Media
              </Button>
            </div>
          </div>

          {/* Media Filters */}
          {showMediaFilters && (
            <Card className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Filters</h3>
                  <p className="text-sm text-muted-foreground">
                    Filter media files by type, department, or search
                  </p>
                </div>
                {hasActiveMediaFilters && (
                  <Button variant="ghost" size="sm" onClick={clearMediaFilters}>
                    <X className="mr-2 h-4 w-4" />
                    Clear All
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="media-filter-type">Media Type</Label>
                  <Select
                    value={mediaFilters.type || 'all'}
                    onValueChange={(value) =>
                      handleMediaFilterChange('type', value === 'all' ? undefined : value)
                    }
                  >
                    <SelectTrigger id="media-filter-type">
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="audio">Audio</SelectItem>
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="document">Document</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="media-filter-department">Department</Label>
                  <Select
                    value={mediaFilters.departmentId || 'all'}
                    onValueChange={(value) =>
                      handleMediaFilterChange('departmentId', value === 'all' ? undefined : value)
                    }
                  >
                    <SelectTrigger id="media-filter-department">
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

                <div className="space-y-2">
                  <Label htmlFor="media-filter-search">Search</Label>
                  <div className="relative">
                    <input
                      id="media-filter-search"
                      type="text"
                      placeholder="Search media..."
                      value={mediaFilters.search || ''}
                      onChange={(e) => handleMediaFilterChange('search', e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Media Error State */}
          {mediaError && (
            <Card className="p-6 border-destructive">
              <div className="text-destructive">
                <h3 className="font-semibold mb-2">Error loading media files</h3>
                <p className="text-sm">{mediaError.message}</p>
              </div>
            </Card>
          )}

          {/* Media Loading State */}
          {isLoadingMedia && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading media files...</span>
            </div>
          )}

          {/* Media Data Table */}
          {!isLoadingMedia && !mediaError && (
            <DataTable
              columns={mediaColumns}
              data={mediaData?.media || []}
              searchable
              searchPlaceholder="Search media files..."
              onRowSelectionChange={setSelectedMediaFiles}
            />
          )}

          {/* Media Pagination Info */}
          {mediaData?.pagination && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div>
                Showing {mediaData.media.length} of {mediaData.pagination.total} file(s)
              </div>
              <div>
                Page {mediaData.pagination.page} of {mediaData.pagination.totalPages}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* SCORM Upload Dialog */}
      <Dialog open={isScormUploadOpen} onOpenChange={setIsScormUploadOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload SCORM Package</DialogTitle>
            <DialogDescription>
              Upload a SCORM 1.2 or SCORM 2004 package as a ZIP file.
            </DialogDescription>
          </DialogHeader>
          <ContentForm
            mode="scorm"
            onSuccess={handleScormUploadSuccess}
            onCancel={() => setIsScormUploadOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Media Upload Dialog */}
      <Dialog open={isMediaUploadOpen} onOpenChange={setIsMediaUploadOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Media File</DialogTitle>
            <DialogDescription>
              Upload a video, audio, image, or document file to the media library.
            </DialogDescription>
          </DialogHeader>
          <ContentForm
            mode="media"
            onSuccess={handleMediaUploadSuccess}
            onCancel={() => setIsMediaUploadOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* SCORM Delete Confirmation */}
      <ConfirmDialog
        open={isScormDeleteConfirmOpen}
        onOpenChange={setIsScormDeleteConfirmOpen}
        onConfirm={confirmScormDelete}
        title="Delete SCORM Package"
        description="Are you sure you want to delete this SCORM package? This will remove all associated data and cannot be undone."
        confirmText="Delete"
        isDestructive
        isLoading={deleteScorm.isPending}
      />

      {/* Bulk SCORM Delete Confirmation */}
      <ConfirmDialog
        open={isBulkScormDeleteConfirmOpen}
        onOpenChange={setIsBulkScormDeleteConfirmOpen}
        onConfirm={confirmBulkScormDelete}
        title="Delete Multiple SCORM Packages"
        description={`Are you sure you want to delete ${selectedScormPackages.length} SCORM package(s)? This action cannot be undone.`}
        confirmText="Delete All"
        isDestructive
        isLoading={deleteScorm.isPending}
      />

      {/* SCORM Publish/Unpublish Confirmation */}
      <ConfirmDialog
        open={isScormPublishConfirmOpen}
        onOpenChange={setIsScormPublishConfirmOpen}
        onConfirm={confirmScormPublish}
        title={scormToPublish?.action === 'publish' ? 'Publish SCORM Package' : 'Unpublish SCORM Package'}
        description={
          scormToPublish?.action === 'publish'
            ? 'Are you sure you want to publish this SCORM package? It will become available for use in courses.'
            : 'Are you sure you want to unpublish this SCORM package? It will no longer be available for use in courses.'
        }
        confirmText={scormToPublish?.action === 'publish' ? 'Publish' : 'Unpublish'}
        isLoading={publishScorm.isPending || unpublishScorm.isPending}
      />

      {/* SCORM Launch Confirmation */}
      <ConfirmDialog
        open={isScormLaunchOpen}
        onOpenChange={setIsScormLaunchOpen}
        onConfirm={confirmScormLaunch}
        title="Launch SCORM Player"
        description="This will open the SCORM package in a new window. Make sure pop-ups are enabled in your browser."
        confirmText="Launch"
        isLoading={launchScorm.isPending}
      />

      {/* Media Delete Confirmation */}
      <ConfirmDialog
        open={isMediaDeleteConfirmOpen}
        onOpenChange={setIsMediaDeleteConfirmOpen}
        onConfirm={confirmMediaDelete}
        title="Delete Media File"
        description="Are you sure you want to delete this media file? This action cannot be undone."
        confirmText="Delete"
        isDestructive
        isLoading={deleteMedia.isPending}
      />

      {/* Bulk Media Delete Confirmation */}
      <ConfirmDialog
        open={isBulkMediaDeleteConfirmOpen}
        onOpenChange={setIsBulkMediaDeleteConfirmOpen}
        onConfirm={confirmBulkMediaDelete}
        title="Delete Multiple Media Files"
        description={`Are you sure you want to delete ${selectedMediaFiles.length} media file(s)? This action cannot be undone.`}
        confirmText="Delete All"
        isDestructive
        isLoading={deleteMedia.isPending}
      />
    </div>
  );
};

// Helper functions
function formatStatus(status: ContentStatus): string {
  const map: Record<ContentStatus, string> = {
    draft: 'Draft',
    published: 'Published',
    archived: 'Archived',
  };
  return map[status] || status;
}

function getStatusVariant(status: ContentStatus): 'default' | 'secondary' | 'destructive' {
  switch (status) {
    case 'published':
      return 'default';
    case 'draft':
      return 'secondary';
    case 'archived':
      return 'destructive';
    default:
      return 'secondary';
  }
}

function formatMediaType(type: MediaType): string {
  const map: Record<MediaType, string> = {
    video: 'Video',
    audio: 'Audio',
    image: 'Image',
    document: 'Document',
  };
  return map[type] || type;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}
