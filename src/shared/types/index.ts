/**
 * Shared Types - Public API
 * Centralized exports for all shared types
 */

// Auth types (Role System V2)
export type {
  UserType,
  DashboardType,
  DepartmentMembership,
  User,
  StaffProfile,
  LearnerProfile,
  LoginResponse,
  EscalateResponse,
  SwitchDepartmentResponse,
  MyRolesResponse,
  PermissionScope,
  AccessToken,
  RefreshToken,
  TokenGrant,
  RoleAssignment,
  DepartmentRoleGroup,
  RoleHierarchy,
  LoginCredentials,
  EscalationCredentials,
  SwitchDepartmentRequest,
  RefreshTokenRequest,
  VerifyTokenResponse,
  RefreshResponse,
} from './auth';
