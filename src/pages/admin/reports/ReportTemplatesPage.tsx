/**
 * Report Templates Management Page
 * Admin interface for managing report templates with CRUD operations
 */

import React from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { DataTable } from '@/shared/ui/data-table';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Checkbox } from '@/shared/ui/checkbox';
import { Textarea } from '@/shared/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
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
import { useToast } from '@/shared/ui/use-toast';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import {
  MoreHorizontal,
  Plus,
  Trash,
  Edit,
  Check,
  Share2,
  FileText,
  Filter,
} from 'lucide-react';
import {
  useReportTemplates,
  useCreateReportTemplate,
  useUpdateReportTemplate,
  useDeleteReportTemplate,
  type ReportTemplate,
  type ReportType,
  type CreateReportTemplatePayload,
} from '@/entities/report';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as reportApi from '@/entities/report/api/reportApi';

export const ReportTemplatesPage: React.FC = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [templateToEdit, setTemplateToEdit] = React.useState<ReportTemplate | null>(null);
  const [templateToDelete, setTemplateToDelete] = React.useState<string | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = React.useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState<ReportType | 'all'>('all');
  const [defaultFilter, setDefaultFilter] = React.useState<boolean | 'all'>('all');
  const [sharedFilter, setSharedFilter] = React.useState<boolean | 'all'>('all');

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Build filters
  const filters = React.useMemo(() => {
    const f: any = {};
    if (searchQuery) f.search = searchQuery;
    if (typeFilter !== 'all') f.type = typeFilter;
    if (defaultFilter !== 'all') f.isDefault = defaultFilter;
    if (sharedFilter !== 'all') f.isShared = sharedFilter;
    return f;
  }, [searchQuery, typeFilter, defaultFilter, sharedFilter]);

  // Fetch templates
  const { data, isLoading } = useReportTemplates(filters);
  const templates = data?.templates || [];

  // Mutations
  const createMutation = useCreateReportTemplate();
  const updateMutation = useUpdateReportTemplate();
  const deleteMutation = useDeleteReportTemplate();

  const setAsDefaultMutation = useMutation({
    mutationFn: reportApi.setAsDefaultTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reportTemplates'] });
      toast({
        title: 'Template updated',
        description: 'Template has been set as default.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to set template as default.',
        variant: 'destructive',
      });
    },
  });

  const toggleSharedMutation = useMutation({
    mutationFn: reportApi.toggleSharedTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reportTemplates'] });
      toast({
        title: 'Template updated',
        description: 'Template shared status has been toggled.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to toggle shared status.',
        variant: 'destructive',
      });
    },
  });

  const handleDelete = (id: string) => {
    setTemplateToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (templateToDelete) {
      deleteMutation.mutate(templateToDelete, {
        onSuccess: () => {
          toast({
            title: 'Template deleted',
            description: 'Template has been successfully deleted.',
          });
          setIsDeleteConfirmOpen(false);
          setTemplateToDelete(null);
        },
        onError: () => {
          toast({
            title: 'Error',
            description: 'Failed to delete template. Please try again.',
            variant: 'destructive',
          });
        },
      });
    }
  };

  const handleSetAsDefault = (id: string) => {
    setAsDefaultMutation.mutate(id);
  };

  const handleToggleShared = (id: string) => {
    toggleSharedMutation.mutate(id);
  };

  // Define columns
  const columns: ColumnDef<ReportTemplate>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => {
        const template = row.original;
        return (
          <div className="flex flex-col gap-1">
            <div className="font-medium">{template.name}</div>
            {template.description && (
              <div className="text-sm text-muted-foreground">{template.description}</div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => {
        const type = row.original.type;
        return (
          <Badge variant="outline">
            {type}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'isDefault',
      header: 'Default',
      cell: ({ row }) => {
        const isDefault = row.original.isDefault;
        return isDefault ? (
          <Badge variant="default" className="gap-1">
            <Check className="h-3 w-3" />
            Default
          </Badge>
        ) : null;
      },
    },
    {
      accessorKey: 'isShared',
      header: 'Shared',
      cell: ({ row }) => {
        const isShared = row.original.isShared;
        return isShared ? (
          <Badge variant="secondary" className="gap-1">
            <Share2 className="h-3 w-3" />
            Shared
          </Badge>
        ) : null;
      },
    },
    {
      accessorKey: 'createdBy',
      header: 'Created By',
      cell: ({ row }) => {
        const template = row.original;
        return (
          <div className="text-sm">
            {template.createdByName}
          </div>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => {
        const created = row.original.createdAt;
        return format(new Date(created), 'MMM dd, yyyy');
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
              <DropdownMenuItem onClick={() => setTemplateToEdit(template)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Template
              </DropdownMenuItem>
              {!template.isDefault && (
                <DropdownMenuItem onClick={() => handleSetAsDefault(template.id)}>
                  <Check className="mr-2 h-4 w-4" />
                  Set as Default
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => handleToggleShared(template.id)}>
                <Share2 className="mr-2 h-4 w-4" />
                {template.isShared ? 'Make Private' : 'Make Shared'}
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Report Templates</h1>
          <p className="text-muted-foreground">Manage report templates and defaults</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Template
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          <CardDescription>Filter templates by various criteria</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Report Type</Label>
            <Select
              value={typeFilter}
              onValueChange={(value) => setTypeFilter(value as ReportType | 'all')}
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="enrollment">Enrollment</SelectItem>
                <SelectItem value="completion">Completion</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
                <SelectItem value="attendance">Attendance</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="default">Default Status</Label>
            <Select
              value={defaultFilter.toString()}
              onValueChange={(value) =>
                setDefaultFilter(value === 'all' ? 'all' : value === 'true')
              }
            >
              <SelectTrigger id="default">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="true">Default only</SelectItem>
                <SelectItem value="false">Non-default</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="shared">Shared Status</Label>
            <Select
              value={sharedFilter.toString()}
              onValueChange={(value) =>
                setSharedFilter(value === 'all' ? 'all' : value === 'true')
              }
            >
              <SelectTrigger id="shared">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="true">Shared only</SelectItem>
                <SelectItem value="false">Private only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={templates}
        searchable
        searchPlaceholder="Search templates..."
      />

      {/* Create/Edit Dialog */}
      <TemplateFormDialog
        open={isCreateDialogOpen || !!templateToEdit}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false);
            setTemplateToEdit(null);
          }
        }}
        template={templateToEdit}
        onSuccess={() => {
          setIsCreateDialogOpen(false);
          setTemplateToEdit(null);
        }}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        onConfirm={confirmDelete}
        title="Delete Template"
        description="Are you sure you want to delete this template? This action cannot be undone."
        confirmText="Delete"
        isDestructive
      />
    </div>
  );
};

// Template Form Dialog Component
interface TemplateFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: ReportTemplate | null;
  onSuccess: () => void;
}

const TemplateFormDialog: React.FC<TemplateFormDialogProps> = ({
  open,
  onOpenChange,
  template,
  onSuccess,
}) => {
  const { toast } = useToast();
  const createMutation = useCreateReportTemplate();
  const updateMutation = useUpdateReportTemplate();

  const [formData, setFormData] = React.useState<Partial<CreateReportTemplatePayload>>({
    name: '',
    description: '',
    type: 'enrollment',
    defaultFilters: {},
    columns: [],
    isDefault: false,
    isShared: false,
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        description: template.description,
        type: template.type,
        defaultFilters: template.defaultFilters,
        columns: template.columns,
        isDefault: template.isDefault,
        isShared: template.isShared,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        type: 'enrollment',
        defaultFilters: {},
        columns: [],
        isDefault: false,
        isShared: false,
      });
    }
  }, [template, open]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name?.trim()) {
      newErrors.name = 'Template name is required';
    }
    if (!formData.type) {
      newErrors.type = 'Report type is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const payload: CreateReportTemplatePayload = {
      name: formData.name!,
      description: formData.description || '',
      type: formData.type!,
      defaultFilters: formData.defaultFilters || {},
      columns: formData.columns || [],
      isDefault: formData.isDefault || false,
      isShared: formData.isShared || false,
    };

    if (template) {
      updateMutation.mutate(
        { id: template.id, payload },
        {
          onSuccess: () => {
            toast({
              title: 'Template updated',
              description: 'Template has been successfully updated.',
            });
            onSuccess();
          },
          onError: () => {
            toast({
              title: 'Error',
              description: 'Failed to update template. Please try again.',
              variant: 'destructive',
            });
          },
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast({
            title: 'Template created',
            description: 'Template has been successfully created.',
          });
          onSuccess();
        },
        onError: () => {
          toast({
            title: 'Error',
            description: 'Failed to create template. Please try again.',
            variant: 'destructive',
          });
        },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" data-testid="template-form-dialog">
        <DialogHeader>
          <DialogTitle>
            {template ? 'Edit Report Template' : 'Create Report Template'}
          </DialogTitle>
          <DialogDescription>
            {template
              ? 'Update the template settings below.'
              : 'Create a new report template with custom settings.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="template-name">
              Template Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="template-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter template name"
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="template-description">Description</Label>
            <Textarea
              id="template-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter template description"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="template-type">
              Report Type <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value as ReportType })}
            >
              <SelectTrigger id="template-type">
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="enrollment">Enrollment</SelectItem>
                <SelectItem value="completion">Completion</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
                <SelectItem value="attendance">Attendance</SelectItem>
                <SelectItem value="learner-activity">Learner Activity</SelectItem>
                <SelectItem value="course-analytics">Course Analytics</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && <p className="text-sm text-destructive">{errors.type}</p>}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is-default"
              checked={formData.isDefault}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isDefault: checked as boolean })
              }
            />
            <Label htmlFor="is-default" className="font-normal">
              Set as default template for this report type
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is-shared"
              checked={formData.isShared}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isShared: checked as boolean })
              }
            />
            <Label htmlFor="is-shared" className="font-normal">
              Share this template with all users
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {template ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
