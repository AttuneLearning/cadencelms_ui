/**
 * SubdepartmentList
 * Displays and manages child departments under a parent department
 */

import React, { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { useToast } from '@/shared/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { Plus, MoreHorizontal, Edit, Trash, Loader2, Building2 } from 'lucide-react';
import {
  useDepartments,
  useDeleteDepartment,
  DepartmentForm,
  type DepartmentListItem,
} from '@/entities/department';

interface SubdepartmentListProps {
  parentId: string;
  parentName: string;
  /** Available departments for parent selection in edit mode (excluding self + descendants) */
  availableParents?: { id: string; name: string; code: string }[];
}

export const SubdepartmentList: React.FC<SubdepartmentListProps> = ({
  parentId,
  parentName,
  availableParents = [],
}) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<DepartmentListItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { toast } = useToast();

  const { data, isLoading } = useDepartments({ parentId, limit: 100 });

  const deleteMutation = useDeleteDepartment({
    onSuccess: () => {
      toast({ title: 'Subdepartment deleted', description: 'Subdepartment has been removed.' });
      setDeletingId(null);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete subdepartment.',
        variant: 'destructive',
      });
    },
  });

  const handleFormSuccess = () => {
    setIsCreateOpen(false);
    setEditingDept(null);
    toast({
      title: editingDept ? 'Subdepartment updated' : 'Subdepartment created',
      description: editingDept
        ? 'Subdepartment has been updated successfully.'
        : 'New subdepartment has been created.',
    });
  };

  const subdepartments = data?.departments || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading subdepartments...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {subdepartments.length === 0
            ? `No subdepartments under ${parentName}`
            : `${subdepartments.length} subdepartment(s) under ${parentName}`}
        </p>
        <Button size="sm" onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Subdepartment
        </Button>
      </div>

      {subdepartments.length > 0 && (
        <div className="divide-y rounded-md border">
          {subdepartments.map((dept) => (
            <div key={dept.id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">{dept.name}</div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-mono">{dept.code}</span>
                    {dept.description && (
                      <>
                        <span>&middot;</span>
                        <span className="line-clamp-1">{dept.description}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={dept.status === 'active' ? 'default' : 'secondary'}>
                  {dept.status}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditingDept(dept)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setDeletingId(dept.id)}
                      className="text-destructive"
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        open={isCreateOpen || !!editingDept}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateOpen(false);
            setEditingDept(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingDept ? 'Edit Subdepartment' : 'Create Subdepartment'}
            </DialogTitle>
            <DialogDescription>
              {editingDept
                ? 'Update the subdepartment information below.'
                : `Create a new subdepartment under ${parentName}.`}
            </DialogDescription>
          </DialogHeader>
          <DepartmentForm
            department={editingDept || undefined}
            defaultParentId={parentId}
            availableParents={availableParents}
            onSuccess={handleFormSuccess}
            onCancel={() => {
              setIsCreateOpen(false);
              setEditingDept(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
        onConfirm={() => deletingId && deleteMutation.mutate(deletingId)}
        title="Delete Subdepartment"
        description="Are you sure you want to delete this subdepartment? This action cannot be undone."
        confirmText="Delete"
        isDestructive
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
