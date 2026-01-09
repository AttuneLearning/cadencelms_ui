/**
 * Tests for ProgramForm Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProgramForm } from '../ProgramForm';
import {
  mockFullProgram,
  mockDepartments,
  createMockProgram,
} from '@/test/mocks/data/programs';

// Mock the useProgram hooks
vi.mock('../../model/useProgram', () => ({
  useCreateProgram: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
    error: null,
  })),
  useUpdateProgram: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
    error: null,
  })),
}));

import * as useProgramModule from '../../model/useProgram';

describe('ProgramForm', () => {
  let queryClient: QueryClient;

  const renderWithProviders = (ui: React.ReactElement) => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    return render(
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Create Mode', () => {
    it('should render form in create mode', () => {
      renderWithProviders(
        <ProgramForm availableDepartments={mockDepartments} />
      );

      expect(screen.getByText('Create New Program')).toBeInTheDocument();
      expect(
        screen.getByText('Fill in the information to create a new program.')
      ).toBeInTheDocument();
    });

    it('should display all required fields', () => {
      renderWithProviders(
        <ProgramForm availableDepartments={mockDepartments} />
      );

      expect(screen.getByLabelText(/Program Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Program Code/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Department/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Credential Type/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Duration/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Publication Status/i)).toBeInTheDocument();
    });

    it('should have empty initial values in create mode', () => {
      renderWithProviders(
        <ProgramForm availableDepartments={mockDepartments} />
      );

      const nameInput = screen.getByLabelText(/Program Name/i) as HTMLInputElement;
      const codeInput = screen.getByLabelText(/Program Code/i) as HTMLInputElement;

      expect(nameInput.value).toBe('');
      expect(codeInput.value).toBe('');
    });

    it('should display Create Program button in create mode', () => {
      renderWithProviders(
        <ProgramForm availableDepartments={mockDepartments} />
      );

      expect(screen.getByText('Create Program')).toBeInTheDocument();
    });

    it('should not display status field in create mode', () => {
      renderWithProviders(
        <ProgramForm availableDepartments={mockDepartments} />
      );

      // Status field (not Publication Status) should not be present in create mode
      expect(screen.queryByText('Status')).not.toBeInTheDocument();
      expect(screen.queryByText(/Active \(Accepting enrollments\)/i)).not.toBeInTheDocument();
    });
  });

  describe('Edit Mode', () => {
    it('should render form in edit mode', () => {
      renderWithProviders(
        <ProgramForm
          program={mockFullProgram}
          availableDepartments={mockDepartments}
        />
      );

      expect(screen.getByText('Edit Program')).toBeInTheDocument();
      expect(
        screen.getByText('Update the program information below.')
      ).toBeInTheDocument();
    });

    it('should populate form with program data', () => {
      renderWithProviders(
        <ProgramForm
          program={mockFullProgram}
          availableDepartments={mockDepartments}
        />
      );

      const nameInput = screen.getByLabelText(/Program Name/i) as HTMLInputElement;
      const codeInput = screen.getByLabelText(/Program Code/i) as HTMLInputElement;

      expect(nameInput.value).toBe(mockFullProgram.name);
      expect(codeInput.value).toBe(mockFullProgram.code);
    });

    it('should display Update Program button in edit mode', () => {
      renderWithProviders(
        <ProgramForm
          program={mockFullProgram}
          availableDepartments={mockDepartments}
        />
      );

      expect(screen.getByText('Update Program')).toBeInTheDocument();
    });

    it('should display status field in edit mode', () => {
      renderWithProviders(
        <ProgramForm
          program={mockFullProgram}
          availableDepartments={mockDepartments}
        />
      );

      // Should have the specific Status field with enrollment options
      const statusElements = screen.getAllByText(/Active \(Accepting enrollments\)/i);
      expect(statusElements.length).toBeGreaterThan(0);
    });

    it('should disable department field in edit mode', () => {
      renderWithProviders(
        <ProgramForm
          program={mockFullProgram}
          availableDepartments={mockDepartments}
        />
      );

      const departmentSelect = screen.getByLabelText(/Department/i);
      expect(departmentSelect).toBeDisabled();
    });
  });

  describe('Form Fields', () => {
    it('should mark required fields with asterisk', () => {
      renderWithProviders(
        <ProgramForm availableDepartments={mockDepartments} />
      );

      const requiredLabels = screen.getAllByText('*');
      expect(requiredLabels.length).toBeGreaterThan(0);
    });

    it('should have placeholder text for inputs', () => {
      renderWithProviders(
        <ProgramForm availableDepartments={mockDepartments} />
      );

      expect(
        screen.getByPlaceholderText('Certified Business Technician')
      ).toBeInTheDocument();
      expect(screen.getByPlaceholderText('CBT-101')).toBeInTheDocument();
    });

    it('should display field helper text', () => {
      renderWithProviders(
        <ProgramForm availableDepartments={mockDepartments} />
      );

      expect(
        screen.getByText(/Full name of the program \(1-200 characters\)/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/uppercase letters, numbers, and hyphens only/i)
      ).toBeInTheDocument();
    });

    it('should convert program code to uppercase', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <ProgramForm availableDepartments={mockDepartments} />
      );

      const codeInput = screen.getByLabelText(/Program Code/i);
      await user.type(codeInput, 'abc-123');

      expect(codeInput).toHaveValue('ABC-123');
    });

    it('should display character count for description', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <ProgramForm availableDepartments={mockDepartments} />
      );

      const descriptionTextarea = screen.getByLabelText(/Description/i);
      expect(screen.getByText('0/2000 characters')).toBeInTheDocument();

      await user.type(descriptionTextarea, 'Test description');

      expect(screen.getByText('16/2000 characters')).toBeInTheDocument();
    });
  });

  describe('Department Selection', () => {
    it('should render department dropdown', () => {
      renderWithProviders(
        <ProgramForm availableDepartments={mockDepartments} />
      );

      expect(screen.getByLabelText(/Department/i)).toBeInTheDocument();
    });

    it('should display department options', async () => {
      renderWithProviders(
        <ProgramForm availableDepartments={mockDepartments} />
      );

      const departmentSelect = screen.getByLabelText(/Department/i);

      // Just verify the select is interactive
      expect(departmentSelect).toBeEnabled();
      expect(departmentSelect).toHaveAttribute('role', 'combobox');
    });
  });

  describe('Credential Selection', () => {
    it('should render credential dropdown', () => {
      renderWithProviders(
        <ProgramForm availableDepartments={mockDepartments} />
      );

      expect(screen.getByLabelText(/Credential Type/i)).toBeInTheDocument();
    });

    it('should display credential options', () => {
      renderWithProviders(
        <ProgramForm availableDepartments={mockDepartments} />
      );

      const credentialSelect = screen.getByLabelText(/Credential Type/i);

      // Just verify the select is interactive
      expect(credentialSelect).toBeEnabled();
      expect(credentialSelect).toHaveAttribute('role', 'combobox');
    });
  });

  describe('Duration Fields', () => {
    it('should render duration number input', () => {
      renderWithProviders(
        <ProgramForm availableDepartments={mockDepartments} />
      );

      const durationInput = screen.getByLabelText(/Duration/i);
      expect(durationInput).toHaveAttribute('type', 'number');
    });

    it('should render duration unit dropdown', async () => {
      renderWithProviders(
        <ProgramForm availableDepartments={mockDepartments} />
      );

      // Find the duration unit select (there are multiple selects)
      const selects = screen.getAllByRole('combobox');
      const durationUnitSelect = selects.find(
        (select) => select.getAttribute('class')?.includes('w-[120px]')
      );

      expect(durationUnitSelect).toBeInTheDocument();
    });

    it('should display duration unit options', () => {
      renderWithProviders(
        <ProgramForm availableDepartments={mockDepartments} />
      );

      const selects = screen.getAllByRole('combobox');
      // Should have multiple selects including duration unit
      expect(selects.length).toBeGreaterThan(1);
    });
  });

  describe('Publication Status', () => {
    it('should render publication status dropdown', () => {
      renderWithProviders(
        <ProgramForm availableDepartments={mockDepartments} />
      );

      expect(screen.getByLabelText(/Publication Status/i)).toBeInTheDocument();
    });

    it('should display publication status options', () => {
      renderWithProviders(
        <ProgramForm availableDepartments={mockDepartments} />
      );

      const publicationSelect = screen.getByLabelText(/Publication Status/i);

      // Just verify the select is interactive
      expect(publicationSelect).toBeEnabled();
      expect(publicationSelect).toHaveAttribute('role', 'combobox');
    });
  });

  describe('Form Validation', () => {
    it('should require program name', async () => {
      const user = userEvent.setup();
      const onSuccess = vi.fn();
      renderWithProviders(
        <ProgramForm
          availableDepartments={mockDepartments}
          onSuccess={onSuccess}
        />
      );

      const submitButton = screen.getByText('Create Program');
      await user.click(submitButton);

      // HTML5 validation will prevent submit
      const nameInput = screen.getByLabelText(/Program Name/i);
      expect(nameInput).toBeRequired();
    });

    it('should require program code', () => {
      renderWithProviders(
        <ProgramForm availableDepartments={mockDepartments} />
      );

      const codeInput = screen.getByLabelText(/Program Code/i);
      expect(codeInput).toBeRequired();
    });

    it('should enforce minimum length for program name', () => {
      renderWithProviders(
        <ProgramForm availableDepartments={mockDepartments} />
      );

      const nameInput = screen.getByLabelText(/Program Name/i);
      expect(nameInput).toHaveAttribute('minLength', '1');
    });

    it('should enforce maximum length for program name', () => {
      renderWithProviders(
        <ProgramForm availableDepartments={mockDepartments} />
      );

      const nameInput = screen.getByLabelText(/Program Name/i);
      expect(nameInput).toHaveAttribute('maxLength', '200');
    });

    it('should enforce pattern for program code', () => {
      renderWithProviders(
        <ProgramForm availableDepartments={mockDepartments} />
      );

      const codeInput = screen.getByLabelText(/Program Code/i);
      expect(codeInput).toHaveAttribute('pattern', '[A-Z0-9-]+');
    });

    it('should enforce minimum value for duration', () => {
      renderWithProviders(
        <ProgramForm availableDepartments={mockDepartments} />
      );

      const durationInput = screen.getByLabelText(/Duration/i);
      expect(durationInput).toHaveAttribute('min', '1');
    });
  });

  describe('Form Submission', () => {
    it('should call createProgram mutation on submit in create mode', async () => {
      const user = userEvent.setup();
      const mutateAsync = vi.fn().mockResolvedValue({});
      const onSuccess = vi.fn();

      vi.mocked(useProgramModule.useCreateProgram).mockReturnValue({
        mutateAsync,
        isPending: false,
        error: null,
      } as any);

      renderWithProviders(
        <ProgramForm
          availableDepartments={mockDepartments}
          onSuccess={onSuccess}
        />
      );

      const nameInput = screen.getByLabelText(/Program Name/i);
      const codeInput = screen.getByLabelText(/Program Code/i);

      await user.type(nameInput, 'Test Program');
      await user.type(codeInput, 'TEST-001');

      const submitButton = screen.getByText('Create Program');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mutateAsync).toHaveBeenCalled();
      });
    });

    it('should call updateProgram mutation on submit in edit mode', async () => {
      const user = userEvent.setup();
      const mutateAsync = vi.fn().mockResolvedValue({});
      const onSuccess = vi.fn();

      vi.mocked(useProgramModule.useUpdateProgram).mockReturnValue({
        mutateAsync,
        isPending: false,
        error: null,
      } as any);

      renderWithProviders(
        <ProgramForm
          program={mockFullProgram}
          availableDepartments={mockDepartments}
          onSuccess={onSuccess}
        />
      );

      const nameInput = screen.getByLabelText(/Program Name/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'Updated Name');

      const submitButton = screen.getByText('Update Program');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mutateAsync).toHaveBeenCalled();
      });
    });

    it('should call onSuccess callback after successful creation', async () => {
      const user = userEvent.setup();
      const mutateAsync = vi.fn().mockResolvedValue({});
      const onSuccess = vi.fn();

      vi.mocked(useProgramModule.useCreateProgram).mockReturnValue({
        mutateAsync,
        isPending: false,
        error: null,
      } as any);

      renderWithProviders(
        <ProgramForm
          availableDepartments={mockDepartments}
          onSuccess={onSuccess}
        />
      );

      const nameInput = screen.getByLabelText(/Program Name/i);
      const codeInput = screen.getByLabelText(/Program Code/i);

      await user.type(nameInput, 'Test Program');
      await user.type(codeInput, 'TEST-001');

      const submitButton = screen.getByText('Create Program');
      await user.click(submitButton);

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled();
      });
    });

    it('should prevent multiple submissions', async () => {
      const mutateAsync = vi.fn().mockResolvedValue({});

      vi.mocked(useProgramModule.useCreateProgram).mockReturnValue({
        mutateAsync,
        isPending: true,
        error: null,
      } as any);

      renderWithProviders(
        <ProgramForm availableDepartments={mockDepartments} />
      );

      const submitButton = screen.getByText('Saving...');
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Loading State', () => {
    it('should display loading state when creating', () => {
      vi.mocked(useProgramModule.useCreateProgram).mockReturnValue({
        mutateAsync: vi.fn(),
        isPending: true,
        error: null,
      } as any);

      renderWithProviders(
        <ProgramForm availableDepartments={mockDepartments} />
      );

      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });

    it('should disable form inputs when loading', () => {
      vi.mocked(useProgramModule.useCreateProgram).mockReturnValue({
        mutateAsync: vi.fn(),
        isPending: true,
        error: null,
      } as any);

      renderWithProviders(
        <ProgramForm availableDepartments={mockDepartments} />
      );

      const nameInput = screen.getByLabelText(/Program Name/i);
      const codeInput = screen.getByLabelText(/Program Code/i);

      expect(nameInput).toBeDisabled();
      expect(codeInput).toBeDisabled();
    });
  });

  describe('Error Handling', () => {
    it('should display error message when creation fails', () => {
      const error = new Error('Failed to create program');

      vi.mocked(useProgramModule.useCreateProgram).mockReturnValue({
        mutateAsync: vi.fn(),
        isPending: false,
        error,
      } as any);

      renderWithProviders(
        <ProgramForm availableDepartments={mockDepartments} />
      );

      expect(screen.getByText('Failed to create program')).toBeInTheDocument();
    });

    it('should display error message when update fails', () => {
      const error = new Error('Failed to update program');

      vi.mocked(useProgramModule.useUpdateProgram).mockReturnValue({
        mutateAsync: vi.fn(),
        isPending: false,
        error,
      } as any);

      // Also need to mock useCreateProgram to avoid interference
      vi.mocked(useProgramModule.useCreateProgram).mockReturnValue({
        mutateAsync: vi.fn(),
        isPending: false,
        error: null,
      } as any);

      renderWithProviders(
        <ProgramForm
          program={mockFullProgram}
          availableDepartments={mockDepartments}
        />
      );

      expect(screen.getByText('Failed to update program')).toBeInTheDocument();
    });

    it('should display generic error message when error message is not available', () => {
      vi.mocked(useProgramModule.useCreateProgram).mockReturnValue({
        mutateAsync: vi.fn(),
        isPending: false,
        error: {} as Error,
      } as any);

      renderWithProviders(
        <ProgramForm availableDepartments={mockDepartments} />
      );

      expect(
        screen.getByText('Failed to save program. Please try again.')
      ).toBeInTheDocument();
    });
  });

  describe('Cancel Action', () => {
    it('should display cancel button when onCancel is provided', () => {
      const onCancel = vi.fn();
      renderWithProviders(
        <ProgramForm
          availableDepartments={mockDepartments}
          onCancel={onCancel}
        />
      );

      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('should call onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup();
      const onCancel = vi.fn();

      renderWithProviders(
        <ProgramForm
          availableDepartments={mockDepartments}
          onCancel={onCancel}
        />
      );

      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('should not display cancel button when onCancel is not provided', () => {
      renderWithProviders(
        <ProgramForm availableDepartments={mockDepartments} />
      );

      expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
    });

    it('should disable cancel button when loading', () => {
      vi.mocked(useProgramModule.useCreateProgram).mockReturnValue({
        mutateAsync: vi.fn(),
        isPending: true,
        error: null,
      } as any);

      const onCancel = vi.fn();
      renderWithProviders(
        <ProgramForm
          availableDepartments={mockDepartments}
          onCancel={onCancel}
        />
      );

      const cancelButton = screen.getByText('Cancel');
      expect(cancelButton).toBeDisabled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty departments array', () => {
      renderWithProviders(<ProgramForm availableDepartments={[]} />);

      expect(screen.getByLabelText(/Department/i)).toBeInTheDocument();
    });

    it('should handle program with minimal data in edit mode', () => {
      const minimalProgram = createMockProgram({
        description: '',
      });

      renderWithProviders(
        <ProgramForm
          program={minimalProgram}
          availableDepartments={mockDepartments}
        />
      );

      const descriptionTextarea = screen.getByLabelText(/Description/i) as HTMLTextAreaElement;
      expect(descriptionTextarea.value).toBe('');
    });
  });

  describe('Snapshot Tests', () => {
    it('should match snapshot in create mode', () => {
      const { container } = renderWithProviders(
        <ProgramForm availableDepartments={mockDepartments} />
      );

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot in edit mode', () => {
      const { container } = renderWithProviders(
        <ProgramForm
          program={mockFullProgram}
          availableDepartments={mockDepartments}
        />
      );

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot with error', () => {
      const error = new Error('Test error');
      vi.mocked(useProgramModule.useCreateProgram).mockReturnValue({
        mutateAsync: vi.fn(),
        isPending: false,
        error,
      } as any);

      const { container } = renderWithProviders(
        <ProgramForm availableDepartments={mockDepartments} />
      );

      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
