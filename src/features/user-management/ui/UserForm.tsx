/**
 * User Form Component
 * Form for creating and editing users
 * 
 * Features:
 * - Separate Staff and Learner department membership sections
 * - Sections are conditionally visible based on user roles
 * - Staff departments show staff-specific roles (instructor, dept-admin, etc.)
 * - Learner departments show learner-specific roles (course-taker, auditor, supervisor)
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
import { Briefcase, GraduationCap } from 'lucide-react';
import { userFormSchema, STAFF_DEPARTMENT_ROLES, LEARNER_DEPARTMENT_ROLES, type UserFormValues } from '../model/validation';
import type { UserListItem, Role, UserStatus } from '@/entities/user';
import { DepartmentMultiSelect, type DepartmentSelection } from './DepartmentMultiSelect';

interface UserFormProps {
  user?: UserListItem;
  onSubmit: (data: UserFormValues) => void;
  isLoading?: boolean;
}

export const UserForm: React.FC<UserFormProps> = ({ user, onSubmit, isLoading }) => {
  // Transform user's existing departments to separate staff/learner form formats
  // Staff roles: instructor, department-admin, content-admin, billing-admin, reporting-analyst
  // Learner roles: course-taker, auditor, supervisor
  const staffRoleKeys = STAFF_DEPARTMENT_ROLES.map(r => r.key);
  const learnerRoleKeys = LEARNER_DEPARTMENT_ROLES.map(r => r.key);
  
  const { initialStaffDepts, initialLearnerDepts } = React.useMemo(() => {
    if (!user?.departments) return { initialStaffDepts: [], initialLearnerDepts: [] };
    
    const staffDepts: DepartmentSelection[] = [];
    const learnerDepts: DepartmentSelection[] = [];
    
    user.departments.forEach((dept, index) => {
      const allRoles = dept.rolesInDepartment || [];
      const staffRolesInDept = allRoles.filter(r => staffRoleKeys.includes(r));
      const learnerRolesInDept = allRoles.filter(r => learnerRoleKeys.includes(r));
      
      if (staffRolesInDept.length > 0) {
        staffDepts.push({
          departmentId: dept.departmentId,
          departmentName: dept.departmentName,
          isPrimary: staffDepts.length === 0,
          roles: staffRolesInDept,
        });
      }
      
      if (learnerRolesInDept.length > 0) {
        learnerDepts.push({
          departmentId: dept.departmentId,
          departmentName: dept.departmentName,
          isPrimary: learnerDepts.length === 0,
          roles: learnerRolesInDept,
        });
      }
    });
    
    return { initialStaffDepts: staffDepts, initialLearnerDepts: learnerDepts };
  }, [user?.departments, staffRoleKeys, learnerRoleKeys]);

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
          staffDepartmentMemberships: initialStaffDepts,
          learnerDepartmentMemberships: initialLearnerDepts,
        }
      : {
          email: '',
          firstName: '',
          lastName: '',
          roles: ['learner'],
          status: 'active',
          password: '',
          staffDepartmentMemberships: [],
          learnerDepartmentMemberships: [],
        },
  });

  const selectedRoles = watch('roles');
  const status = watch('status');
  const staffDepartmentMemberships = watch('staffDepartmentMemberships') || [];
  const learnerDepartmentMemberships = watch('learnerDepartmentMemberships') || [];
  
  // Conditional visibility
  const showStaffSection = selectedRoles?.includes('staff') || selectedRoles?.includes('global-admin');
  const showLearnerSection = selectedRoles?.includes('learner');

  const handleStaffDepartmentChange = (departments: DepartmentSelection[]) => {
    setValue('staffDepartmentMemberships', departments);
  };
  
  const handleLearnerDepartmentChange = (departments: DepartmentSelection[]) => {
    setValue('learnerDepartmentMemberships', departments);
  };

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

      {/* Staff Department Memberships - shown when user has 'staff' or 'global-admin' role */}
      {showStaffSection && (
        <div className="space-y-3 p-4 rounded-lg border bg-blue-50/50 dark:bg-blue-950/20">
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <Label className="text-base font-medium">Staff Department Memberships</Label>
          </div>
          <p className="text-sm text-muted-foreground">
            Assign staff roles like Instructor, Department Admin, Content Admin, etc.
          </p>
          <DepartmentMultiSelect
            value={staffDepartmentMemberships}
            onChange={handleStaffDepartmentChange}
            roleType="staff"
            placeholder="Search and add staff departments..."
          />
        </div>
      )}

      {/* Learner Department Memberships - shown when user has 'learner' role */}
      {showLearnerSection && (
        <div className="space-y-3 p-4 rounded-lg border bg-green-50/50 dark:bg-green-950/20">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-green-600 dark:text-green-400" />
            <Label className="text-base font-medium">Learner Department Memberships</Label>
          </div>
          <p className="text-sm text-muted-foreground">
            Assign learner roles like Course Taker, Auditor, or Supervisor.
          </p>
          <DepartmentMultiSelect
            value={learnerDepartmentMemberships}
            onChange={handleLearnerDepartmentChange}
            roleType="learner"
            placeholder="Search and add learner departments..."
          />
        </div>
      )}

      {/* Optional Fields */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Optional Information</h3>

        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input id="phoneNumber" type="tel" {...register('phoneNumber')} />
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
