/**
 * User Form Component
 * Form for creating and editing users
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { Checkbox } from '@/shared/ui/checkbox';
import { userFormSchema, type UserFormValues } from '../model/validation';
import type { UserListItem, Role, UserStatus } from '@/entities/user';

interface UserFormProps {
  user?: UserListItem;
  onSubmit: (data: UserFormValues) => void;
  isLoading?: boolean;
}

export const UserForm: React.FC<UserFormProps> = ({ user, onSubmit, isLoading }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: user
      ? {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          roles: user.roles,
          status: user.status,
          password: '',
        }
      : {
          email: '',
          firstName: '',
          lastName: '',
          roles: ['learner'],
          status: 'active',
          password: '',
        },
  });

  const selectedRoles = watch('roles');
  const status = watch('status');

  const handleRoleToggle = (role: Role) => {
    const currentRoles = selectedRoles || [];
    if (currentRoles.includes(role)) {
      setValue(
        'roles',
        currentRoles.filter((r) => r !== role)
      );
    } else {
      setValue('roles', [...currentRoles, role]);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">
          Email <span className="text-destructive">*</span>
        </Label>
        <Input id="email" type="email" {...register('email')} />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>

      {/* First Name */}
      <div className="space-y-2">
        <Label htmlFor="firstName">
          First Name <span className="text-destructive">*</span>
        </Label>
        <Input id="firstName" {...register('firstName')} />
        {errors.firstName && (
          <p className="text-sm text-destructive">{errors.firstName.message}</p>
        )}
      </div>

      {/* Last Name */}
      <div className="space-y-2">
        <Label htmlFor="lastName">
          Last Name <span className="text-destructive">*</span>
        </Label>
        <Input id="lastName" {...register('lastName')} />
        {errors.lastName && <p className="text-sm text-destructive">{errors.lastName.message}</p>}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label htmlFor="password">
          Password {!user && <span className="text-destructive">*</span>}
          {user && <span className="text-muted-foreground text-sm">(leave blank to keep current)</span>}
        </Label>
        <Input id="password" type="password" {...register('password')} />
        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
      </div>

      {/* Roles */}
      <div className="space-y-2">
        <Label>
          Roles <span className="text-destructive">*</span>
        </Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="role-learner"
              checked={selectedRoles?.includes('learner')}
              onCheckedChange={() => handleRoleToggle('learner')}
            />
            <Label htmlFor="role-learner" className="font-normal">
              Learner
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="role-staff"
              checked={selectedRoles?.includes('staff')}
              onCheckedChange={() => handleRoleToggle('staff')}
            />
            <Label htmlFor="role-staff" className="font-normal">
              Staff
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="role-admin"
              checked={selectedRoles?.includes('global-admin')}
              onCheckedChange={() => handleRoleToggle('global-admin')}
            />
            <Label htmlFor="role-admin" className="font-normal">
              Administrator
            </Label>
          </div>
        </div>
        {errors.roles && <p className="text-sm text-destructive">{errors.roles.message}</p>}
      </div>

      {/* Status */}
      <div className="space-y-2">
        <Label htmlFor="status">
          Status <span className="text-destructive">*</span>
        </Label>
        <Select value={status} onValueChange={(value: UserStatus) => setValue('status', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
        {errors.status && <p className="text-sm text-destructive">{errors.status.message}</p>}
      </div>

      {/* Optional Fields */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Optional Information</h3>

        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input id="phoneNumber" type="tel" {...register('phoneNumber')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Input id="department" {...register('department')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="jobTitle">Job Title</Label>
          <Input id="jobTitle" {...register('jobTitle')} />
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : user ? 'Update User' : 'Create User'}
        </Button>
      </div>
    </form>
  );
};
