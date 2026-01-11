/**
 * Auth Entity Exports
 * Version: 2.0.0
 *
 * Central export point for authentication entity
 */

// API
export * from './api/authApi';

// Re-export auth types for convenience
export type {
  UserType,
  DashboardType,
  User,
  DepartmentMembership,
  AccessToken,
  RefreshToken,
  TokenGrant,
  RoleHierarchy,
  RoleAssignment,
  LoginCredentials,
  LoginResponse,
  RefreshResponse,
  EscalateResponse,
  SwitchDepartmentResponse,
  MyRolesResponse,
  PermissionScope,
} from '@/shared/types/auth';
