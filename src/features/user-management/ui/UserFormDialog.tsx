/**
 * User Form Dialog Component
 * Dialog wrapper for UserForm
 */

import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { useToast } from '@/shared/ui/use-toast';
import { UserForm } from './UserForm';
import { userApi, type UserListItem, type UserFormData } from '@/entities/user';
import type { UserFormValues } from '../model/validation';

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: UserListItem;
}

export const UserFormDialog: React.FC<UserFormDialogProps> = ({ open, onOpenChange, user }) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: UserFormData) => userApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast({
        title: 'User created',
        description: 'User has been successfully created.',
      });
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create user. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<UserFormData> }) =>
      userApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast({
        title: 'User updated',
        description: 'User has been successfully updated.',
      });
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update user. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (data: UserFormValues) => {
    // Remove password if empty (for updates)
    const submitData: UserFormData = {
      ...data,
      password: data.password || undefined,
    };

    if (user) {
      updateMutation.mutate({ id: user._id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{user ? 'Edit User' : 'Create New User'}</DialogTitle>
          <DialogDescription>
            {user
              ? 'Update user information and permissions.'
              : 'Add a new user to the system.'}
          </DialogDescription>
        </DialogHeader>
        <UserForm
          user={user}
          onSubmit={handleSubmit}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      </DialogContent>
    </Dialog>
  );
};
