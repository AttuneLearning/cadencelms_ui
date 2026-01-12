/**
 * ProfilePage Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ProfilePage } from '../ProfilePage';
import * as userProfileHooks from '@/entities/user-profile/model/useUserProfile';
import type { UserProfile } from '@/entities/user-profile';

// Mock the navigation hook
vi.mock('@/shared/lib/navigation/useNavigation', () => ({
  useNavigation: () => ({
    updateBreadcrumbs: vi.fn(),
  }),
}));

// Mock the toast hook
vi.mock('@/shared/ui/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Helper to wrap component with providers
function renderWithProviders(component: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{component}</BrowserRouter>
    </QueryClientProvider>
  );
}

// Mock profile data
const mockLearnerProfile: UserProfile = {
  id: '1',
  email: 'learner@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'learner',
  status: 'active',
  isActive: true,
  profileImage: null,
  phone: '+1-555-0123',
  studentId: 'STU001',
  createdAt: '2024-01-01T00:00:00Z',
  lastLoginAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-01-15T10:30:00Z',
  courseEnrollments: ['course1', 'course2'],
};

const mockStaffProfile: UserProfile = {
  id: '2',
  email: 'staff@example.com',
  firstName: 'Jane',
  lastName: 'Smith',
  role: 'staff',
  status: 'active',
  isActive: true,
  profileImage: 'https://example.com/avatar.jpg',
  phone: '+1-555-0456',
  departments: ['dept1', 'dept2'],
  permissions: ['read:courses', 'write:courses'],
  createdAt: '2023-06-01T00:00:00Z',
  lastLoginAt: '2024-01-15T14:30:00Z',
  updatedAt: '2024-01-15T14:30:00Z',
};

const mockDepartments = [
  {
    id: 'dept1',
    name: 'Computer Science',
    code: 'CS',
    description: 'Department of Computer Science',
    isActive: true,
    userRole: 'instructor',
  },
  {
    id: 'dept2',
    name: 'Mathematics',
    code: 'MATH',
    description: 'Department of Mathematics',
    isActive: true,
    userRole: 'coordinator',
  },
];

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should display loading skeletons while fetching profile', () => {
      vi.spyOn(userProfileHooks, 'useUserProfile').mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      } as any);

      vi.spyOn(userProfileHooks, 'useUserDepartments').mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
      } as any);

      renderWithProviders(<ProfilePage />);

      // Check for loading skeletons by looking for the animate-pulse class
      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('Error State', () => {
    it('should display error message when profile fetch fails', () => {
      vi.spyOn(userProfileHooks, 'useUserProfile').mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Failed to fetch profile'),
      } as any);

      vi.spyOn(userProfileHooks, 'useUserDepartments').mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
      } as any);

      renderWithProviders(<ProfilePage />);

      expect(
        screen.getByText(/failed to load profile/i)
      ).toBeInTheDocument();
    });
  });

  describe('Learner Profile', () => {
    beforeEach(() => {
      vi.spyOn(userProfileHooks, 'useUserProfile').mockReturnValue({
        data: mockLearnerProfile,
        isLoading: false,
        error: null,
      } as any);

      vi.spyOn(userProfileHooks, 'useUserDepartments').mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
      } as any);
    });

    it('should display learner profile information', () => {
      renderWithProviders(<ProfilePage />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('learner@example.com')).toBeInTheDocument();
      expect(screen.getByText('+1-555-0123')).toBeInTheDocument();

      // Student ID appears in multiple places (card and account section)
      const studentIds = screen.getAllByText(/STU001/);
      expect(studentIds.length).toBeGreaterThan(0);
    });

    it('should show edit button', () => {
      renderWithProviders(<ProfilePage />);

      expect(screen.getByRole('button', { name: /edit profile/i })).toBeInTheDocument();
    });

    it('should not show departments section for learner', () => {
      renderWithProviders(<ProfilePage />);

      expect(screen.queryByText(/my departments/i)).not.toBeInTheDocument();
    });

    it('should display account information', () => {
      renderWithProviders(<ProfilePage />);

      // Check for Account Information section header
      expect(screen.getByText(/account information/i)).toBeInTheDocument();

      // Check for key account details
      const statusLabels = screen.getAllByText(/account status/i);
      expect(statusLabels.length).toBeGreaterThan(0);

      const roleLabels = screen.getAllByText(/user role/i);
      expect(roleLabels.length).toBeGreaterThan(0);
    });
  });

  describe('Staff Profile', () => {
    beforeEach(() => {
      vi.spyOn(userProfileHooks, 'useUserProfile').mockReturnValue({
        data: mockStaffProfile,
        isLoading: false,
        error: null,
      } as any);

      vi.spyOn(userProfileHooks, 'useUserDepartments').mockReturnValue({
        data: mockDepartments,
        isLoading: false,
        error: null,
      } as any);
    });

    it('should display staff profile information', () => {
      renderWithProviders(<ProfilePage />);

      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('staff@example.com')).toBeInTheDocument();
      expect(screen.getByText('+1-555-0456')).toBeInTheDocument();
    });

    it('should show departments section for staff', () => {
      renderWithProviders(<ProfilePage />);

      expect(screen.getByText(/my departments/i)).toBeInTheDocument();
    });

    it('should display department assignments', () => {
      renderWithProviders(<ProfilePage />);

      expect(screen.getByText('Computer Science')).toBeInTheDocument();
      expect(screen.getByText('Mathematics')).toBeInTheDocument();
      expect(screen.getByText('CS')).toBeInTheDocument();
      expect(screen.getByText('MATH')).toBeInTheDocument();
    });

    it('should display user roles in departments', () => {
      renderWithProviders(<ProfilePage />);

      const roles = screen.getAllByText(/instructor|coordinator/i);
      expect(roles.length).toBeGreaterThan(0);
    });

    it('should display permissions', () => {
      renderWithProviders(<ProfilePage />);

      const permissions = screen.getAllByText(/read:courses|write:courses/);
      expect(permissions.length).toBeGreaterThan(0);
    });
  });

  describe('Edit Mode', () => {
    beforeEach(() => {
      vi.spyOn(userProfileHooks, 'useUserProfile').mockReturnValue({
        data: mockLearnerProfile,
        isLoading: false,
        error: null,
      } as any);

      vi.spyOn(userProfileHooks, 'useUserDepartments').mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
      } as any);

      vi.spyOn(userProfileHooks, 'useUpdateUserProfile').mockReturnValue({
        mutateAsync: vi.fn(),
        isPending: false,
        isError: false,
        isSuccess: false,
      } as any);
    });

    it('should switch to edit mode when edit button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ProfilePage />);

      const editButton = screen.getByRole('button', { name: /edit profile/i });
      await user.click(editButton);

      // In edit mode, should see form with Save Changes button
      expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('should show cancel button in edit mode', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ProfilePage />);

      const editButton = screen.getByRole('button', { name: /edit profile/i });
      await user.click(editButton);

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('should return to view mode when cancel is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ProfilePage />);

      // Enter edit mode
      const editButton = screen.getByRole('button', { name: /edit profile/i });
      await user.click(editButton);

      // Cancel edit
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      // Should show edit button again
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit profile/i })).toBeInTheDocument();
      });
    });
  });

  describe('Department Loading State', () => {
    it('should show loading skeletons while fetching departments', () => {
      vi.spyOn(userProfileHooks, 'useUserProfile').mockReturnValue({
        data: mockStaffProfile,
        isLoading: false,
        error: null,
      } as any);

      vi.spyOn(userProfileHooks, 'useUserDepartments').mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      } as any);

      renderWithProviders(<ProfilePage />);

      expect(screen.getByText(/my departments/i)).toBeInTheDocument();
    });
  });

  describe('Empty Departments', () => {
    it('should show empty state when staff has no departments', () => {
      vi.spyOn(userProfileHooks, 'useUserProfile').mockReturnValue({
        data: mockStaffProfile,
        isLoading: false,
        error: null,
      } as any);

      vi.spyOn(userProfileHooks, 'useUserDepartments').mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      } as any);

      renderWithProviders(<ProfilePage />);

      expect(screen.getByText(/no departments assigned/i)).toBeInTheDocument();
    });
  });

  describe('Department Error State', () => {
    it('should show error message when departments fetch fails', () => {
      vi.spyOn(userProfileHooks, 'useUserProfile').mockReturnValue({
        data: mockStaffProfile,
        isLoading: false,
        error: null,
      } as any);

      vi.spyOn(userProfileHooks, 'useUserDepartments').mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Failed to fetch departments'),
      } as any);

      renderWithProviders(<ProfilePage />);

      expect(screen.getByText(/failed to load departments/i)).toBeInTheDocument();
    });
  });
});
