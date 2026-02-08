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
import type { UserListItem, Role } from '@/entities/user';
import { DepartmentMultiSelect, type DepartmentSelection } from './DepartmentMultiSelect';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form';

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
    
    user.departments.forEach((dept) => {
      const allRoles = dept.rolesInDepartment || [];
      const staffRolesInDept = allRoles.filter(r => (staffRoleKeys as readonly string[]).includes(r));
      const learnerRolesInDept = allRoles.filter(r => (learnerRoleKeys as readonly string[]).includes(r));
      
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

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: user
      ? {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          roles: user.userTypes || [],
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

  const selectedRoles = form.watch('roles');
  const staffDepartmentMemberships = form.watch('staffDepartmentMemberships') || [];
  const learnerDepartmentMemberships = form.watch('learnerDepartmentMemberships') || [];
  
  // Conditional visibility
  const showStaffSection = selectedRoles?.includes('staff') || selectedRoles?.includes('global-admin');
  const showLearnerSection = selectedRoles?.includes('learner');

  const handleStaffDepartmentChange = (departments: DepartmentSelection[]) => {
    form.setValue('staffDepartmentMemberships', departments);
  };
  
  const handleLearnerDepartmentChange = (departments: DepartmentSelection[]) => {
    form.setValue('learnerDepartmentMemberships', departments);
  };

  const handleRoleToggle = (role: Role, currentRoles: Role[], onChange: (value: Role[]) => void) => {
    if (currentRoles.includes(role)) {
      onChange(currentRoles.filter((r) => r !== role));
    } else {
      onChange([...currentRoles, role]);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Email <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* First Name */}
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                First Name <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Last Name */}
        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Last Name <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Password */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Password {!user && <span className="text-destructive">*</span>}
                {user && (
                  <span className="text-muted-foreground text-sm">
                    (leave blank to keep current)
                  </span>
                )}
              </FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Roles */}
        <FormField
          control={form.control}
          name="roles"
          render={({ field }) => {
            const currentRoles = field.value || [];
            return (
              <FormItem>
                <FormLabel>
                  Roles <span className="text-destructive">*</span>
                </FormLabel>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="role-learner"
                      checked={currentRoles.includes('learner')}
                      onCheckedChange={() =>
                        handleRoleToggle('learner', currentRoles, field.onChange)
                      }
                    />
                    <FormLabel htmlFor="role-learner" className="font-normal">
                      Learner
                    </FormLabel>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="role-staff"
                      checked={currentRoles.includes('staff')}
                      onCheckedChange={() =>
                        handleRoleToggle('staff', currentRoles, field.onChange)
                      }
                    />
                    <FormLabel htmlFor="role-staff" className="font-normal">
                      Staff
                    </FormLabel>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="role-admin"
                      checked={currentRoles.includes('global-admin')}
                      onCheckedChange={() =>
                        handleRoleToggle('global-admin', currentRoles, field.onChange)
                      }
                    />
                    <FormLabel htmlFor="role-admin" className="font-normal">
                      Administrator
                    </FormLabel>
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        {/* Status */}
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Status <span className="text-destructive">*</span>
              </FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Staff Department Memberships - shown when user has 'staff' or 'global-admin' role */}
        {showStaffSection && (
          <FormField
            control={form.control}
            name="staffDepartmentMemberships"
            render={({ field }) => (
              <FormItem className="space-y-3 p-4 rounded-lg border bg-blue-50/50 dark:bg-blue-950/20">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <FormLabel className="text-base font-medium">Staff Department Memberships</FormLabel>
                </div>
                <FormDescription className="text-sm">
                  Assign staff roles like Instructor, Department Admin, Content Admin, etc.
                </FormDescription>
                <FormControl>
                  <DepartmentMultiSelect
                    value={field.value || staffDepartmentMemberships}
                    onChange={(departments) => {
                      field.onChange(departments);
                      handleStaffDepartmentChange(departments);
                    }}
                    roleType="staff"
                    placeholder="Search and add staff departments..."
                  />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        {/* Learner Department Memberships - shown when user has 'learner' role */}
        {showLearnerSection && (
          <FormField
            control={form.control}
            name="learnerDepartmentMemberships"
            render={({ field }) => (
              <FormItem className="space-y-3 p-4 rounded-lg border bg-green-50/50 dark:bg-green-950/20">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <FormLabel className="text-base font-medium">Learner Department Memberships</FormLabel>
                </div>
                <FormDescription className="text-sm">
                  Assign learner roles like Course Taker, Auditor, or Supervisor.
                </FormDescription>
                <FormControl>
                  <DepartmentMultiSelect
                    value={field.value || learnerDepartmentMemberships}
                    onChange={(departments) => {
                      field.onChange(departments);
                      handleLearnerDepartmentChange(departments);
                    }}
                    roleType="learner"
                    placeholder="Search and add learner departments..."
                  />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        {/* Optional Fields */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Optional Information</h3>

          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input type="tel" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="jobTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Title</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : user ? 'Update User' : 'Create User'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
