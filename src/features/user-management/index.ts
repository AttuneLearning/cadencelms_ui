/**
 * User Management Feature - Public API
 */

export { UserForm } from './ui/UserForm';
export { UserFormDialog } from './ui/UserFormDialog';
export { DepartmentMultiSelect, type DepartmentSelection, type DepartmentRoleType } from './ui/DepartmentMultiSelect';
export { 
  userFormSchema, 
  type UserFormValues, 
  type DepartmentMembershipFormValue,
  DEPARTMENT_ROLES,
  STAFF_DEPARTMENT_ROLES,
  LEARNER_DEPARTMENT_ROLES,
  type DepartmentRoleKey,
  type StaffDepartmentRoleKey,
  type LearnerDepartmentRoleKey,
} from './model/validation';
