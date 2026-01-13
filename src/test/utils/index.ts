/**
 * Test Utilities - Central Export
 * Version: 1.0.0
 * Date: 2026-01-13
 */

// Test Wrappers
export {
  createTestWrapper,
  renderWithProviders,
  createTestQueryClient,
  type TestWrapperOptions,
  type RenderWithProvidersOptions,
} from './testWrapper';

// Mock Factories
export {
  createMockUser,
  createMockAccessToken,
  createMockRoleHierarchy,
  createMockDepartmentRoleGroup,
  createMockRoleAssignment,
  createMockAuthStore,
  createMockNavigation,
  createMockDepartmentContext,
  createMockStaffUser,
  createMockLearnerUser,
  createMockGlobalAdminUser,
  createMockStaffRoleHierarchy,
  createMockGlobalAdminRoleHierarchy,
  type MockUserOptions,
  type MockAccessTokenOptions,
  type MockRoleHierarchyOptions,
  type MockDepartmentRoleGroupOptions,
  type MockRoleAssignmentOptions,
  type MockAuthStoreOptions,
  type MockNavigationOptions,
  type MockDepartmentContextOptions,
} from './mockFactories';

// Hook Rendering (existing)
export {
  renderHook,
  createWrapper,
  createTestQueryClient as createTestQueryClientForHooks,
} from './renderHook';
