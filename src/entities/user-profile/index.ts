/**
 * User Profile Entity - Public API
 */

// Types
export type {
  UserProfile,
  UserRole,
  UserStatus,
  DepartmentRole,
  UpdateProfilePayload,
  UserDepartment,
} from './model/types';

// Hooks
export { useUserProfile, useUpdateUserProfile, useUserDepartments } from './model/useUserProfile';
export { userProfileKeys } from './model/userProfileKeys';

// API (for advanced use cases)
export * as userProfileApi from './api/userProfileApi';

// UI Components
export { UserProfileCard } from './ui/UserProfileCard';
export { UserProfileForm } from './ui/UserProfileForm';
export { UserProfileAvatar } from './ui/UserProfileAvatar';
