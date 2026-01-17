/**
 * Academic Year Management Page
 * Admin interface for managing academic years with date validation
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { useToast } from '@/shared/ui/use-toast';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { PageHeader } from '@/shared/ui/page-header';
import { Card } from '@/shared/ui/card';
import {
  MoreHorizontal,
  Plus,
  Trash,
  Edit,
  Loader2,
} from 'lucide-react';
import {
  useAcademicYears,
  useCreateAcademicYear,
  useUpdateAcademicYear,
  useDeleteAcademicYear,
  AcademicYearForm,
  type AcademicYearListItem,
} from '@/entities/academic-year';

export const AcademicYearManagementPage: React.FC = () => {
  // State for selections and dialogs
  const [selectedYears, setSelectedYears] = React.useState<AcademicYearListItem[]>([]);
  const [yearToEdit, setYearToEdit] = React.useState<AcademicYearListItem | null>(null);
  const [yearToDelete, setYearToDelete] = React.useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = React.useState(false);
  const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = React.useState(false);

  const { toast } = useToast();

  // Fetch academic years
  const { data: yearsData, isLoading, error } = useAcademicYears();

  // Mutations
  const createMutation = useCreateAcademicYear();
  const updateMutation = useUpdateAcademicYear();
  const deleteMutation = useDeleteAcademicYear();

  // Action handlers
  const handleDelete = (id: string) => {
    setYearToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  const handleBulkDelete = () => {
    setIsBulkDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (yearToDelete) {
      deleteMutation.mutate(yearToDelete, {
        onSuccess: () => {
          toast({
            title: 'Academic year deleted',
            description: 'Academic year has been successfully deleted.',
          });
          setIsDeleteConfirmOpen(false);
          setYearToDelete(null);
        },
        onError: (error: any) => {
          toast({
            title: 'Error',
            description: error.message || 'Failed to delete academic year. Please try again.',
            variant: 'destructive',
          });
        },
      });
    }
  };

  const confirmBulkDelete = async () => {
    try {
      await Promise.all(selectedYears.map((y) => deleteMutation.mutateAsync(y.id)));
      toast({
        title: 'Academic years deleted',
        description: `${selectedYears.length} academic year(s) have been successfully deleted.`,
      });
      setSelectedYears([]);
      setIsBulkDeleteConfirmOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete some academic years. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleFormSuccess = () => {
    setIsCreateDialogOpen(false);
    setYearToEdit(null);
  };

  // Define columns
  const columns: ColumnDef<AcademicYearListItem>[] = [
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
      header: 'Academic Year',
      cell: ({ row }) => {
        const year = row.original;
        return (
          <div className="font-medium">{year.name}</div>
        );
      },
    },
    {
      accessorKey: 'startDate',
      header: 'Start Date',
      cell: ({ row }) => {
        const year = row.original;
        return (
          <span className="text-sm">
            {format(new Date(year.startDate), 'MMM dd, yyyy')}
          </span>
        );
      },
    },
    {
      accessorKey: 'endDate',
      header: 'End Date',
      cell: ({ row }) => {
        const year = row.original;
        return (
          <span className="text-sm">
            {format(new Date(year.endDate), 'MMM dd, yyyy')}
          </span>
        );
      },
    },
    {
      accessorKey: 'isCurrent',
      header: 'Status',
      cell: ({ row }) => {
        const year = row.original;
        return (
          <Badge variant={year.isCurrent ? 'default' : 'secondary'}>
            {year.isCurrent ? 'Current' : 'Inactive'}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'termCount',
      header: 'Terms',
      cell: ({ row }) => {
        const year = row.original;
        return (
          <div className="text-center">
            <span className="font-medium">{year.termCount}</span>
          </div>
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
        const year = row.original;
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
              <DropdownMenuItem onClick={() => setYearToEdit(year)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Academic Year
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDelete(year.id)}
                className="text-destructive"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete Academic Year
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
        title="Academic Year Management"
        description="Manage academic years and terms"
      >
        {selectedYears.length > 0 && (
          <Button variant="destructive" onClick={handleBulkDelete}>
            <Trash className="mr-2 h-4 w-4" />
            Delete Selected ({selectedYears.length})
          </Button>
        )}
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Academic Year
        </Button>
      </PageHeader>

      {/* Info Card */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="text-sm text-blue-900">
          <h3 className="font-semibold mb-2">Academic Year Management</h3>
          <p>Only one academic year can be marked as current at a time. Setting a new current year will automatically update any previously marked current year to inactive.</p>
        </div>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="p-6 border-destructive">
          <div className="text-destructive">
            <h3 className="font-semibold mb-2">Error loading academic years</h3>
            <p className="text-sm">{error.message}</p>
          </div>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading academic years...</span>
        </div>
      )}

      {/* Data Table */}
      {!isLoading && !error && (
        <DataTable
          columns={columns}
          data={yearsData?.years || []}
          searchable={false}
          onRowSelectionChange={setSelectedYears}
        />
      )}

      {/* Pagination Info */}
      {yearsData && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div>
            Showing {yearsData.years.length} academic year(s)
          </div>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        open={isCreateDialogOpen || !!yearToEdit}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false);
            setYearToEdit(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {yearToEdit ? 'Edit Academic Year' : 'Create New Academic Year'}
            </DialogTitle>
            <DialogDescription>
              {yearToEdit
                ? 'Update the academic year information below.'
                : 'Fill in the information to create a new academic year.'}
            </DialogDescription>
          </DialogHeader>
          <AcademicYearForm
            academicYear={yearToEdit || undefined}
            onSubmit={(data) => {
              if (yearToEdit) {
                updateMutation.mutate(
                  { id: yearToEdit.id, payload: data },
                  {
                    onSuccess: handleFormSuccess,
                    onError: (error: any) => {
                      toast({
                        title: 'Error',
                        description: error.message || 'Failed to update academic year.',
                        variant: 'destructive',
                      });
                    },
                  }
                );
              } else {
                createMutation.mutate(data as any, {
                  onSuccess: handleFormSuccess,
                  onError: (error: any) => {
                    toast({
                      title: 'Error',
                      description: error.message || 'Failed to create academic year.',
                      variant: 'destructive',
                    });
                  },
                });
              }
            }}
            onCancel={() => {
              setIsCreateDialogOpen(false);
              setYearToEdit(null);
            }}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        onConfirm={confirmDelete}
        title="Delete Academic Year"
        description="Are you sure you want to delete this academic year? This action cannot be undone."
        confirmText="Delete"
        isDestructive
        isLoading={deleteMutation.isPending}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmDialog
        open={isBulkDeleteConfirmOpen}
        onOpenChange={setIsBulkDeleteConfirmOpen}
        onConfirm={confirmBulkDelete}
        title="Delete Multiple Academic Years"
        description={`Are you sure you want to delete ${selectedYears.length} academic year(s)? This action cannot be undone.`}
        confirmText="Delete All"
        isDestructive
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
