/**
 * Template Management Page
 * Admin interface for managing course templates with CRUD operations
 */

import React from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { DataTable } from '@/shared/ui/data-table';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Checkbox } from '@/shared/ui/checkbox';
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
import { PageHeader } from '@/shared/ui/page-header';
import { Card, CardContent } from '@/shared/ui/card';
import { Label } from '@/shared/ui/label';
import { Input } from '@/shared/ui/input';
import { TemplateForm } from '@/entities/template';
import {
  useTemplates,
  useDeleteTemplate,
  useDuplicateTemplate,
  useCreateTemplate,
  useUpdateTemplate,
  useTemplatePreview,
  type TemplateListItem,
  type TemplateType,
  type TemplateStatus,
  type TemplateFilters,
  type Template,
  type CreateTemplatePayload,
  type UpdateTemplatePayload,
} from '@/entities/template';
import { useDepartments } from '@/entities/department';
import {
  MoreHorizontal,
  Plus,
  Trash,
  Edit,
  Eye,
  Copy,
  Loader2,
  Filter,
  X,
  FileText,
} from 'lucide-react';

export const TemplateManagementPage: React.FC = () => {
  // State for selections and dialogs
  const [selectedTemplates, setSelectedTemplates] = React.useState<TemplateListItem[]>([]);
  const [templateToEdit, setTemplateToEdit] = React.useState<TemplateListItem | null>(null);
  const [templateToDelete, setTemplateToDelete] = React.useState<string | null>(null);
  const [templateToDuplicate, setTemplateToDuplicate] = React.useState<string | null>(null);
  const [templateToPreview, setTemplateToPreview] = React.useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = React.useState(false);
  const [isDuplicateConfirmOpen, setIsDuplicateConfirmOpen] = React.useState(false);
  const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = React.useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = React.useState(false);
  const [forceDelete, setForceDelete] = React.useState(false);

  // State for filters
  const [filters, setFilters] = React.useState<TemplateFilters>({
    page: 1,
    limit: 50,
  });
  const [showFilters, setShowFilters] = React.useState(false);

  const { toast } = useToast();

  // Fetch templates with filters
  const { data: templatesData, isLoading, error } = useTemplates(filters);

  // Fetch departments for the form and filters
  const { data: departmentsData } = useDepartments({ limit: 1000 });

  // Fetch preview data when template is selected
  const {
    data: previewData,
    isLoading: isPreviewLoading,
    error: previewError,
  } = useTemplatePreview(
    templateToPreview || '',
    { format: 'json' },
    { enabled: !!templateToPreview && isPreviewDialogOpen }
  );

  // Mutations
  const createTemplate = useCreateTemplate();
  const updateTemplate = useUpdateTemplate();

  const deleteTemplate = useDeleteTemplate();

  const duplicateTemplate = useDuplicateTemplate();

  // Action handlers
  const handleDelete = (id: string) => {
    setTemplateToDelete(id);
    setForceDelete(false);
    setIsDeleteConfirmOpen(true);
  };

  const handleBulkDelete = () => {
    setIsBulkDeleteConfirmOpen(true);
  };

  const handleDuplicate = (id: string) => {
    setTemplateToDuplicate(id);
    setIsDuplicateConfirmOpen(true);
  };

  const handlePreview = (id: string) => {
    setTemplateToPreview(id);
    setIsPreviewDialogOpen(true);
  };

  const confirmDelete = () => {
    if (templateToDelete) {
      deleteTemplate.mutate(
        { id: templateToDelete, force: forceDelete },
        {
          onSuccess: (data) => {
            if (data.affectedCourses > 0) {
              toast({
                title: 'Template deleted',
                description: `Template deleted. ${data.affectedCourses} course(s) were affected and ${
                  data.replacedWith ? 'assigned to a replacement template' : 'set to no template'
                }.`,
              });
            } else {
              toast({
                title: 'Template deleted',
                description: 'Template has been successfully deleted.',
              });
            }
            setIsDeleteConfirmOpen(false);
            setTemplateToDelete(null);
            setForceDelete(false);
          },
          onError: (error: any) => {
            // Check if error is due to template being in use
            if (error.statusCode === 409 || error.message?.includes('in use')) {
              toast({
                title: 'Template in use',
                description:
                  'This template is currently in use by courses. Enable "Force Delete" to proceed.',
                variant: 'destructive',
              });
              setForceDelete(true);
            } else {
              toast({
                title: 'Error',
                description: error.message || 'Failed to delete template. Please try again.',
                variant: 'destructive',
              });
              setIsDeleteConfirmOpen(false);
              setTemplateToDelete(null);
              setForceDelete(false);
            }
          },
        }
      );
    }
  };

  const confirmBulkDelete = async () => {
    try {
      await Promise.all(
        selectedTemplates.map((template) =>
          deleteTemplate.mutateAsync({ id: template.id, force: true })
        )
      );
      toast({
        title: 'Templates deleted',
        description: `${selectedTemplates.length} template(s) have been successfully deleted.`,
      });
      setSelectedTemplates([]);
      setIsBulkDeleteConfirmOpen(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete some templates. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const confirmDuplicate = () => {
    if (templateToDuplicate) {
      const originalTemplate = templatesData?.templates.find(
        (t) => t.id === templateToDuplicate
      );
      duplicateTemplate.mutate(
        {
          id: templateToDuplicate,
          payload: {
            name: originalTemplate ? `${originalTemplate.name} (Copy)` : undefined,
            status: 'draft',
          },
        },
        {
          onSuccess: () => {
            toast({
              title: 'Template duplicated',
              description: 'A copy of the template has been created as a draft.',
            });
            setIsDuplicateConfirmOpen(false);
            setTemplateToDuplicate(null);
          },
          onError: (error: any) => {
            toast({
              title: 'Error',
              description: error.message || 'Failed to duplicate template. Please try again.',
              variant: 'destructive',
            });
          },
        }
      );
    }
  };

  const handleFormSubmit = (data: CreateTemplatePayload | UpdateTemplatePayload) => {
    if (templateToEdit) {
      // Update existing template
      updateTemplate.mutate(
        { id: templateToEdit.id, payload: data as UpdateTemplatePayload },
        {
          onSuccess: () => {
            toast({
              title: 'Template updated',
              description: 'Template has been successfully updated.',
            });
            setTemplateToEdit(null);
          },
          onError: (error: any) => {
            toast({
              title: 'Error',
              description: error.message || 'Failed to update template. Please try again.',
              variant: 'destructive',
            });
          },
        }
      );
    } else {
      // Create new template
      createTemplate.mutate(data as CreateTemplatePayload, {
        onSuccess: () => {
          toast({
            title: 'Template created',
            description: 'Template has been successfully created.',
          });
          setIsCreateDialogOpen(false);
        },
        onError: (error: any) => {
          toast({
            title: 'Error',
            description: error.message || 'Failed to create template. Please try again.',
            variant: 'destructive',
          });
        },
      });
    }
  };

  const handleFilterChange = (key: keyof TemplateFilters, value: string | undefined) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
      page: 1, // Reset to first page when filters change
    }));
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 50,
    });
  };

  const hasActiveFilters = filters.type || filters.department || filters.status || filters.search;

  // Define columns
  const columns: ColumnDef<TemplateListItem>[] = [
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
      accessorKey: 'name',
      header: 'Template Name',
      cell: ({ row }) => {
        const template = row.original;
        return (
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="font-medium">{template.name}</div>
              <div className="text-xs text-muted-foreground">
                Created by {template.createdBy.firstName} {template.createdBy.lastName}
              </div>
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
        return <Badge variant={getTypeVariant(type)}>{formatType(type)}</Badge>;
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        return <Badge variant={getStatusVariant(status)}>{formatStatus(status)}</Badge>;
      },
    },
    {
      accessorKey: 'department',
      header: 'Department',
      cell: ({ row }) => {
        const template = row.original;
        return (
          <div className="text-sm">
            {template.isGlobal ? (
              <Badge variant="outline" className="text-xs">
                Global
              </Badge>
            ) : template.departmentName ? (
              <span>{template.departmentName}</span>
            ) : (
              <span className="text-muted-foreground">N/A</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'usageCount',
      header: 'Usage',
      cell: ({ row }) => {
        const count = row.original.usageCount;
        return (
          <div className="text-center">
            <span className="font-medium">{count}</span>
            <span className="text-xs text-muted-foreground ml-1">
              {count === 1 ? 'course' : 'courses'}
            </span>
          </div>
        );
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
        const template = row.original;
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
              <DropdownMenuItem onClick={() => handlePreview(template.id)}>
                <Eye className="mr-2 h-4 w-4" />
                Preview Template
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTemplateToEdit(template)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Template
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDuplicate(template.id)}>
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDelete(template.id)}
                className="text-destructive"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete Template
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
      <PageHeader
        title="Template Management"
        description="Manage course templates for certificate generation and document formatting"
      >
        {selectedTemplates.length > 0 && (
          <Button variant="destructive" onClick={handleBulkDelete}>
            <Trash className="mr-2 h-4 w-4" />
            Delete Selected ({selectedTemplates.length})
          </Button>
        )}
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
          <Filter className="mr-2 h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-2">
              {
                Object.keys(filters).filter(
                  (k) =>
                    k !== 'page' &&
                    k !== 'limit' &&
                    k !== 'sort' &&
                    filters[k as keyof TemplateFilters]
                ).length
              }
            </Badge>
          )}
        </Button>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Template
        </Button>
      </PageHeader>

      {/* Filters */}
      {showFilters && (
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Filters</h3>
              <p className="text-sm text-muted-foreground">
                Filter templates by type, status, department, or search
              </p>
            </div>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="mr-2 h-4 w-4" />
                Clear All
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="filter-type">Type</Label>
              <Select
                value={filters.type || 'all'}
                onValueChange={(value) =>
                  handleFilterChange('type', value === 'all' ? undefined : value)
                }
              >
                <SelectTrigger id="filter-type">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="master">Master</SelectItem>
                  <SelectItem value="department">Department</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="filter-status">Status</Label>
              <Select
                value={filters.status || 'all'}
                onValueChange={(value) =>
                  handleFilterChange('status', value === 'all' ? undefined : value)
                }
              >
                <SelectTrigger id="filter-status">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="filter-department">Department</Label>
              <Select
                value={filters.department || 'all'}
                onValueChange={(value) =>
                  handleFilterChange('department', value === 'all' ? undefined : value)
                }
              >
                <SelectTrigger id="filter-department">
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
              <Label htmlFor="filter-search">Search</Label>
              <Input
                id="filter-search"
                type="text"
                placeholder="Search templates..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
          </div>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card className="p-6 border-destructive">
          <div className="text-destructive">
            <h3 className="font-semibold mb-2">Error loading templates</h3>
            <p className="text-sm">{error.message}</p>
          </div>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading templates...</span>
        </div>
      )}

      {/* Data Table */}
      {!isLoading && !error && (
        <DataTable
          columns={columns}
          data={templatesData?.templates || []}
          searchable
          searchPlaceholder="Search templates..."
          onRowSelectionChange={setSelectedTemplates}
        />
      )}

      {/* Pagination Info */}
      {templatesData?.pagination && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div>
            Showing {templatesData.templates.length} of {templatesData.pagination.total} template(s)
          </div>
          <div>
            Page {templatesData.pagination.page} of {templatesData.pagination.totalPages}
          </div>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        open={isCreateDialogOpen || !!templateToEdit}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false);
            setTemplateToEdit(null);
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {templateToEdit ? 'Edit Template' : 'Create New Template'}
            </DialogTitle>
            <DialogDescription>
              {templateToEdit
                ? 'Update the template information below.'
                : 'Fill in the information to create a new template.'}
            </DialogDescription>
          </DialogHeader>
          <TemplateForm
            template={
              templateToEdit
                ? ({
                    id: templateToEdit.id,
                    name: templateToEdit.name,
                    type: templateToEdit.type,
                    status: templateToEdit.status,
                    css: null,
                    html: null,
                    department: templateToEdit.department,
                    departmentName: templateToEdit.departmentName,
                    isGlobal: templateToEdit.isGlobal,
                    createdBy: templateToEdit.createdBy,
                    usageCount: templateToEdit.usageCount,
                    previewUrl: templateToEdit.previewUrl,
                    createdAt: templateToEdit.createdAt,
                    updatedAt: templateToEdit.updatedAt,
                  } as Template)
                : undefined
            }
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setIsCreateDialogOpen(false);
              setTemplateToEdit(null);
            }}
            isLoading={createTemplate.isPending || updateTemplate.isPending}
            departments={departmentsData?.departments.map((dept) => ({
              id: dept.id,
              name: dept.name,
            }))}
          />
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Template Preview</DialogTitle>
            <DialogDescription>
              Preview of the rendered template with sample data
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {isPreviewLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading preview...</span>
              </div>
            )}
            {previewError && (
              <Card className="p-6 border-destructive">
                <div className="text-destructive">
                  <h3 className="font-semibold mb-2">Error loading preview</h3>
                  <p className="text-sm">{previewError.message}</p>
                </div>
              </Card>
            )}
            {previewData && typeof previewData === 'object' && 'html' in previewData && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold mb-2">Preview Information</h4>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>Template: {previewData.metadata.templateName}</div>
                    <div>
                      Generated: {format(new Date(previewData.metadata.previewGenerated), 'PPpp')}
                    </div>
                    <div>
                      Sample Data: {previewData.metadata.placeholders.courseTitle} (
                      {previewData.metadata.placeholders.courseCode})
                    </div>
                  </div>
                </div>
                <Card className="p-4">
                  <CardContent className="p-0">
                    <div className="border rounded-md overflow-hidden">
                      <style>{previewData.css}</style>
                      <div
                        dangerouslySetInnerHTML={{ __html: previewData.html }}
                        className="p-8 bg-white"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        onConfirm={confirmDelete}
        title="Delete Template"
        description={
          forceDelete
            ? `This template is currently in use by courses. Are you sure you want to force delete it? Courses using this template will have their template reference removed.`
            : `Are you sure you want to delete this template? This action cannot be undone.`
        }
        confirmText={forceDelete ? 'Force Delete' : 'Delete'}
        isDestructive
        isLoading={deleteTemplate.isPending}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmDialog
        open={isBulkDeleteConfirmOpen}
        onOpenChange={setIsBulkDeleteConfirmOpen}
        onConfirm={confirmBulkDelete}
        title="Delete Multiple Templates"
        description={`Are you sure you want to delete ${selectedTemplates.length} template(s)? Templates in use will be force deleted and courses will have their template references removed. This action cannot be undone.`}
        confirmText="Delete All"
        isDestructive
        isLoading={deleteTemplate.isPending}
      />

      {/* Duplicate Confirmation */}
      <ConfirmDialog
        open={isDuplicateConfirmOpen}
        onOpenChange={setIsDuplicateConfirmOpen}
        onConfirm={confirmDuplicate}
        title="Duplicate Template"
        description="Are you sure you want to duplicate this template? A new template will be created with the same structure and styles, but as a draft."
        confirmText="Duplicate"
        isLoading={duplicateTemplate.isPending}
      />
    </div>
  );
};

// Helper functions
function formatType(type: TemplateType): string {
  const map: Record<TemplateType, string> = {
    master: 'Master',
    department: 'Department',
    custom: 'Custom',
  };
  return map[type] || type;
}

function formatStatus(status: TemplateStatus): string {
  const map: Record<TemplateStatus, string> = {
    active: 'Active',
    draft: 'Draft',
  };
  return map[status] || status;
}

function getTypeVariant(
  type: TemplateType
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (type) {
    case 'master':
      return 'default';
    case 'department':
      return 'secondary';
    case 'custom':
      return 'outline';
    default:
      return 'secondary';
  }
}

function getStatusVariant(status: TemplateStatus): 'default' | 'secondary' {
  switch (status) {
    case 'active':
      return 'default';
    case 'draft':
      return 'secondary';
    default:
      return 'secondary';
  }
}
