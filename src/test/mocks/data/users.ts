/**
 * Mock user data for testing
 */

import type { User, UserListItem, UserFormData } from '@/entities/user/model/types';

export const mockUsers: UserListItem[] = [
  {
    _id: 'user-1',
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    userTypes: ['staff'], // V2
    roles: ['staff'], // V1 (deprecated)
    status: 'active',
    lastLoginAt: '2026-01-08T10:00:00Z',
    createdAt: '2025-12-01T10:00:00Z',
  },
  {
    _id: 'user-2',
    email: 'jane.smith@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    userTypes: ['learner'], // V2
    roles: ['learner'], // V1 (deprecated)
    status: 'active',
    lastLoginAt: '2026-01-07T15:30:00Z',
    createdAt: '2025-12-15T10:00:00Z',
  },
  {
    _id: 'user-3',
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    userTypes: ['global-admin'], // V2
    roles: ['global-admin'], // V1 (deprecated)
    status: 'active',
    lastLoginAt: '2026-01-08T08:00:00Z',
    createdAt: '2025-11-01T10:00:00Z',
  },
  {
    _id: 'user-4',
    email: 'suspended@example.com',
    firstName: 'Suspended',
    lastName: 'User',
    userTypes: ['learner'], // V2
    roles: ['learner'], // V1 (deprecated)
    status: 'suspended',
    createdAt: '2025-12-20T10:00:00Z',
  },
  {
    _id: 'user-5',
    email: 'inactive@example.com',
    firstName: 'Inactive',
    lastName: 'User',
    userTypes: ['staff'], // V2
    roles: ['staff'], // V1 (deprecated)
    status: 'inactive',
    createdAt: '2025-11-15T10:00:00Z',
  },
];

export const mockFullUser: User = {
  _id: 'user-1',
  email: 'john.doe@example.com',
  firstName: 'John',
  lastName: 'Doe',
  userTypes: ['staff'], // V2
  defaultDashboard: 'staff', // V2
  isActive: true, // V2
  roles: ['staff'], // V1 (deprecated)
  status: 'active',
  createdAt: '2025-12-01T10:00:00Z',
  updatedAt: '2026-01-08T10:00:00Z',
  lastLoginAt: '2026-01-08T10:00:00Z',
  avatar: 'https://example.com/avatars/john.jpg',
  phoneNumber: '+1234567890',
  department: 'Engineering',
  jobTitle: 'Senior Developer',
};

export const mockUserFormData: UserFormData = {
  email: 'new.user@example.com',
  firstName: 'New',
  lastName: 'User',
  password: 'SecurePassword123!',
  userTypes: ['learner'], // V2
  roles: ['learner'], // V1 (deprecated)
  status: 'active',
  phoneNumber: '+0987654321',
};

export const mockUpdateUserFormData: Partial<UserFormData> = {
  firstName: 'Updated',
  lastName: 'Name',
  phoneNumber: '+1111111111',
  department: 'Marketing',
  jobTitle: 'Marketing Manager',
};

export const createMockUser = (overrides?: Partial<User>): User => ({
  _id: `user-${Math.random().toString(36).substr(2, 9)}`,
  email: `user-${Math.random().toString(36).substr(2, 5)}@example.com`,
  firstName: 'Test',
  lastName: 'User',
  userTypes: ['learner'], // V2
  defaultDashboard: 'learner', // V2
  isActive: true, // V2
  roles: ['learner'], // V1 (deprecated)
  status: 'active',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

export const createMockUserListItem = (overrides?: Partial<UserListItem>): UserListItem => ({
  _id: `user-${Math.random().toString(36).substr(2, 9)}`,
  email: `user-${Math.random().toString(36).substr(2, 5)}@example.com`,
  firstName: 'Test',
  lastName: 'User',
  userTypes: ['learner'], // V2
  roles: ['learner'], // V1 (deprecated)
  status: 'active',
  createdAt: new Date().toISOString(),
  ...overrides,
});
