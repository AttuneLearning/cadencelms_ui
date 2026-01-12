/**
 * Certificate Template Management Page
 * Admin interface for managing certificate templates with CRUD operations
 */

import React from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { DataTable } from '@/shared/ui/data-table';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { Label } from '@/shared/ui/label';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/ui/dialog';
import { useToast } from '@/shared/ui/use-toast';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import {
  MoreHorizontal,
  Plus,
  Trash,
  Edit,
  Loader2,
  Eye,
  Check,
  Power,
  PowerOff,
} from 'lucide-react';
import {
  useCertificateTemplateList,
  useCertificateTemplateDetail,
  useCreateCertificateTemplate,
  useUpdateCertificateTemplate,
  useDeleteCertificateTemplate,
  useSetDefaultTemplate,
  useToggleTemplateActive,
  type CertificateTemplateListItem,
  type CertificateTemplateFormData,
  TEMPLATE_VARIABLES,
  SAMPLE_CERTIFICATE_DATA,
} from '@/entities/certificate-template';

export const CertificateTemplateManagementPage: React.FC = () => {
  // State for dialogs and selections
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = React.useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = React.useState(false);
  const [templateToEdit, setTemplateToEdit] = React.useState<string | null>(null);
  const [templateToPreview, setTemplateToPreview] = React.useState<string | null>(null);
  const [templateToDelete, setTemplateToDelete] = React.useState<string | null>(null);

  // Form state
  const [formData, setFormData] = React.useState<CertificateTemplateFormData>({
    name: '',
    description: '',
    htmlTemplate: '',
    isDefault: false,
    isActive: true,
  });

  const { toast } = useToast();

  // Fetch templates
  const { data: templatesData, isLoading, error } = useCertificateTemplateList({
    page: 1,
    limit: 50,
  });

  // Fetch template detail for editing/preview
  const { data: templateDetail } = useCertificateTemplateDetail(
    templateToEdit || templateToPreview || ''
  );

  // Mutations
  const createMutation = useCreateCertificateTemplate({
    onSuccess: () => {
      toast({
        title: 'Template created',
        description: 'Certificate template has been successfully created.',
      });
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create template. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useUpdateCertificateTemplate({
    onSuccess: () => {
      toast({
        title: 'Template updated',
        description: 'Certificate template has been successfully updated.',
      });
      setIsEditDialogOpen(false);
      setTemplateToEdit(null);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update template. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useDeleteCertificateTemplate({
    onSuccess: () => {
      toast({
        title: 'Template deleted',
        description: 'Certificate template has been successfully deleted.',
      });
      setIsDeleteConfirmOpen(false);
      setTemplateToDelete(null);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete template. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const setDefaultMutation = useSetDefaultTemplate({
    onSuccess: () => {
      toast({
        title: 'Template set as default',
        description: 'This template is now the default certificate template.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to set default template. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const toggleActiveMutation = useToggleTemplateActive({
    onSuccess: () => {
      toast({
        title: 'Template status updated',
        description: 'Certificate template status has been updated.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update template status. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Action handlers
  const handleCreate = () => {
    setIsCreateDialogOpen(true);
    resetForm();
  };

  const handleEdit = (id: string) => {
    setTemplateToEdit(id);
    setIsEditDialogOpen(true);
  };

  const handlePreview = (id: string) => {
    setTemplateToPreview(id);
    setIsPreviewDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setTemplateToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  const handleSetDefault = (id: string) => {
    setDefaultMutation.mutate(id);
  };

  const handleToggleActive = (id: string, isActive: boolean) => {
    toggleActiveMutation.mutate({ id, isActive: !isActive });
  };

  const handleSubmitCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleSubmitUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (templateToEdit) {
      updateMutation.mutate({ id: templateToEdit, data: formData });
    }
  };

  const confirmDelete = () => {
    if (templateToDelete) {
      deleteMutation.mutate(templateToDelete);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      htmlTemplate: '',
      isDefault: false,
      isActive: true,
    });
  };

  // Populate form when editing
  React.useEffect(() => {
    if (templateDetail && templateToEdit) {
      setFormData({
        name: templateDetail.name,
        description: templateDetail.description,
        htmlTemplate: templateDetail.htmlTemplate,
        isDefault: templateDetail.isDefault,
        isActive: templateDetail.isActive,
      });
    }
  }, [templateDetail, templateToEdit]);

  // Render preview with sample data
  const renderPreview = () => {
    if (!templateDetail) return null;

    let htmlContent = templateDetail.htmlTemplate;
    Object.entries(SAMPLE_CERTIFICATE_DATA).forEach(([key, value]) => {
      htmlContent = htmlContent.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });

    return (
      <div
        className="border rounded-lg p-4 bg-white"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    );
  };

  // Define columns
  const columns: ColumnDef<CertificateTemplateListItem>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => {
        const template = row.original;
        return (
          <div>
            <div className="font-medium">{template.name}</div>
            <div className="text-sm text-muted-foreground">{template.description}</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'isDefault',
      header: 'Default',
      cell: ({ row }) => {
        const template = row.original;
        return template.isDefault ? (
          <Badge variant="default">
            <Check className="mr-1 h-3 w-3" />
            Default
          </Badge>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        );
      },
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => {
        const template = row.original;
        return (
          <Badge variant={template.isActive ? 'default' : 'secondary'}>
            {template.isActive ? 'Active' : 'Inactive'}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
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
              <DropdownMenuItem onClick={() => handleEdit(template.id)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Template
              </DropdownMenuItem>
              {!template.isDefault && (
                <DropdownMenuItem onClick={() => handleSetDefault(template.id)}>
                  <Check className="mr-2 h-4 w-4" />
                  Set as Default
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => handleToggleActive(template.id, template.isActive)}
              >
                {template.isActive ? (
                  <>
                    <PowerOff className="mr-2 h-4 w-4" />
                    Deactivate Template
                  </>
                ) : (
                  <>
                    <Power className="mr-2 h-4 w-4" />
                    Activate Template
                  </>
                )}
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
          <h1 className="text-3xl font-bold tracking-tight">
            Certificate Template Management
          </h1>
          <p className="text-muted-foreground">
            Manage certificate templates for course completions
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Create Template
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-destructive">
              <h3 className="font-semibold mb-2">Error loading templates</h3>
              <p className="text-sm">{error.message}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading templates...</span>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && templatesData?.templates.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No templates found</p>
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Template
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Data Table */}
      {!isLoading && !error && templatesData && templatesData.templates.length > 0 && (
        <DataTable
          columns={columns}
          data={templatesData.templates}
          searchable
          searchPlaceholder="Search templates..."
        />
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Certificate Template</DialogTitle>
            <DialogDescription>
              Create a new certificate template with HTML content and variables.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitCreate}>
            <div className="grid grid-cols-2 gap-6">
              {/* Left Column - Form */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="create-name">Template Name</Label>
                  <Input
                    id="create-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Default Certificate"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-description">Description</Label>
                  <Textarea
                    id="create-description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Brief description of this template"
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-html">HTML Template</Label>
                  <Textarea
                    id="create-html"
                    value={formData.htmlTemplate}
                    onChange={(e) =>
                      setFormData({ ...formData, htmlTemplate: e.target.value })
                    }
                    placeholder="Enter HTML template with variables"
                    rows={10}
                    className="font-mono text-sm"
                    required
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="create-default"
                    checked={formData.isDefault}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isDefault: !!checked })
                    }
                  />
                  <Label htmlFor="create-default" className="cursor-pointer">
                    Set as Default Template
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="create-active"
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isActive: !!checked })
                    }
                  />
                  <Label htmlFor="create-active" className="cursor-pointer">
                    Active
                  </Label>
                </div>
              </div>

              {/* Right Column - Variable Helper */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Available Variables</CardTitle>
                    <CardDescription className="text-xs">
                      Use these variables in your HTML template
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {TEMPLATE_VARIABLES.map((variable) => (
                        <div key={variable.key} className="space-y-1">
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {variable.key}
                          </code>
                          <p className="text-xs text-muted-foreground">
                            {variable.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Certificate Template</DialogTitle>
            <DialogDescription>
              Update the certificate template content and settings.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitUpdate}>
            <div className="grid grid-cols-2 gap-6">
              {/* Left Column - Form */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Template Name</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Default Certificate"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Brief description of this template"
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-html">HTML Template</Label>
                  <Textarea
                    id="edit-html"
                    value={formData.htmlTemplate}
                    onChange={(e) =>
                      setFormData({ ...formData, htmlTemplate: e.target.value })
                    }
                    placeholder="Enter HTML template with variables"
                    rows={10}
                    className="font-mono text-sm"
                    required
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-default"
                    checked={formData.isDefault}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isDefault: !!checked })
                    }
                  />
                  <Label htmlFor="edit-default" className="cursor-pointer">
                    Set as Default Template
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-active"
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isActive: !!checked })
                    }
                  />
                  <Label htmlFor="edit-active" className="cursor-pointer">
                    Active
                  </Label>
                </div>
              </div>

              {/* Right Column - Variable Helper */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Available Variables</CardTitle>
                    <CardDescription className="text-xs">
                      Use these variables in your HTML template
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {TEMPLATE_VARIABLES.map((variable) => (
                        <div key={variable.key} className="space-y-1">
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {variable.key}
                          </code>
                          <p className="text-xs text-muted-foreground">
                            {variable.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setTemplateToEdit(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Template Preview</DialogTitle>
            <DialogDescription>
              Preview of the certificate template with sample data
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {templateDetail && renderPreview()}
            {!templateDetail && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              onClick={() => {
                setIsPreviewDialogOpen(false);
                setTemplateToPreview(null);
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        onConfirm={confirmDelete}
        title="Delete Template"
        description="Are you sure you want to delete this certificate template? This action cannot be undone."
        confirmText="Delete"
        isDestructive
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
