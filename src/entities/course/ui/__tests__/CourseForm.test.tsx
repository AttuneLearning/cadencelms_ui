/**
 * Tests for CourseForm Component
 */

import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CourseForm } from '../CourseForm';
import { mockPublishedCourse, mockDraftCourse } from '@/test/mocks/data/courses';

describe('CourseForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  // Mock ResizeObserver which is used by some UI components
  beforeAll(() => {
    global.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render create mode form', () => {
      render(<CourseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      expect(screen.getByText('Basic Information')).toBeInTheDocument();
      expect(screen.getByText('Create a new course.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Create Course/i })).toBeInTheDocument();
    });

    it('should render edit mode form', () => {
      render(<CourseForm course={mockPublishedCourse} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      expect(screen.getByText('Update the course details below.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Update Course/i })).toBeInTheDocument();
    });

    it('should render all form sections', () => {
      render(<CourseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      expect(screen.getByText('Basic Information')).toBeInTheDocument();
      expect(screen.getByText('Course Settings')).toBeInTheDocument();
    });

    it('should render all required fields with asterisks', () => {
      render(<CourseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      expect(screen.getByText(/Course Title/)).toBeInTheDocument();
      expect(screen.getByText(/Course Code/)).toBeInTheDocument();
      expect(screen.getByText(/Department/)).toBeInTheDocument();
    });
  });

  describe('Create Mode', () => {
    it('should have empty initial values', () => {
      render(<CourseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const titleInput = screen.getByLabelText(/Course Title/);
      const codeInput = screen.getByLabelText(/Course Code/);
      const descriptionInput = screen.getByLabelText(/Description/);

      expect(titleInput).toHaveValue('');
      expect(codeInput).toHaveValue('');
      expect(descriptionInput).toHaveValue('');
    });

    it('should have default settings values', () => {
      render(<CourseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const selfEnrollmentCheckbox = screen.getByLabelText(/Allow Self-Enrollment/);
      const passingScoreInput = screen.getByLabelText(/Passing Score/);
      const maxAttemptsInput = screen.getByLabelText(/Maximum Attempts/);
      const certificateCheckbox = screen.getByLabelText(/Enable Certificate/);

      expect(selfEnrollmentCheckbox).not.toBeChecked();
      expect(passingScoreInput).toHaveValue(70);
      expect(maxAttemptsInput).toHaveValue(3);
      expect(certificateCheckbox).not.toBeChecked();
    });
  });

  describe('Edit Mode', () => {
    it('should populate form with course data', () => {
      render(<CourseForm course={mockPublishedCourse} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const titleInput = screen.getByLabelText(/Course Title/);
      const codeInput = screen.getByLabelText(/Course Code/);
      const descriptionInput = screen.getByLabelText(/Description/);

      expect(titleInput).toHaveValue(mockPublishedCourse.title);
      expect(codeInput).toHaveValue(mockPublishedCourse.code);
      expect(descriptionInput).toHaveValue(mockPublishedCourse.description);
    });

    it('should populate settings fields', () => {
      render(<CourseForm course={mockPublishedCourse} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const selfEnrollmentCheckbox = screen.getByLabelText(/Allow Self-Enrollment/);
      const passingScoreInput = screen.getByLabelText(/Passing Score/);
      const maxAttemptsInput = screen.getByLabelText(/Maximum Attempts/);
      const certificateCheckbox = screen.getByLabelText(/Enable Certificate/);

      expect(selfEnrollmentCheckbox).toBeChecked();
      expect(passingScoreInput).toHaveValue(mockPublishedCourse.settings.passingScore);
      expect(maxAttemptsInput).toHaveValue(mockPublishedCourse.settings.maxAttempts);
      expect(certificateCheckbox).toBeChecked();
    });

    it('should populate department and program', () => {
      render(<CourseForm course={mockPublishedCourse} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const departmentInput = screen.getByLabelText(/Department/);
      const programInput = screen.getByLabelText(/Program/);

      expect(departmentInput).toHaveValue(mockPublishedCourse.department.id);
      expect(programInput).toHaveValue(mockPublishedCourse.program!.id);
    });

    it('should populate credits and duration', () => {
      render(<CourseForm course={mockPublishedCourse} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const creditsInput = screen.getByLabelText(/Credits/);
      const durationInput = screen.getByLabelText(/Duration/);

      expect(creditsInput).toHaveValue(mockPublishedCourse.credits);
      expect(durationInput).toHaveValue(mockPublishedCourse.duration);
    });
  });

  describe('Form Validation', () => {
    it('should require course title', async () => {
      render(<CourseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const submitButton = screen.getByRole('button', { name: /Create Course/i });
      fireEvent.click(submitButton);

      const titleInput = screen.getByLabelText(/Course Title/);
      expect(titleInput).toBeRequired();
    });

    it('should require course code', async () => {
      render(<CourseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const codeInput = screen.getByLabelText(/Course Code/);
      expect(codeInput).toBeRequired();
    });

    it('should require department', async () => {
      render(<CourseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const departmentInput = screen.getByLabelText(/Department/);
      expect(departmentInput).toBeRequired();
    });

    it('should validate course code pattern', () => {
      render(<CourseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const codeInput = screen.getByLabelText(/Course Code/) as HTMLInputElement;
      expect(codeInput.pattern).toBe('^[A-Z]{2,4}[0-9]{3}$');
    });

    it('should show course code format hint', () => {
      render(<CourseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      expect(screen.getByText(/Format: 2-4 uppercase letters followed by 3 digits/)).toBeInTheDocument();
    });

    it('should validate title length (max 200)', () => {
      render(<CourseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const titleInput = screen.getByLabelText(/Course Title/) as HTMLInputElement;
      expect(titleInput.maxLength).toBe(200);
    });

    it('should validate description length (max 2000)', () => {
      render(<CourseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const descriptionInput = screen.getByLabelText(/Description/) as HTMLTextAreaElement;
      expect(descriptionInput.maxLength).toBe(2000);
    });

    it('should validate credits range (0-10)', () => {
      render(<CourseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const creditsInput = screen.getByLabelText(/Credits/) as HTMLInputElement;
      expect(creditsInput.min).toBe('0');
      expect(creditsInput.max).toBe('10');
    });

    it('should validate passing score range (0-100)', () => {
      render(<CourseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const passingScoreInput = screen.getByLabelText(/Passing Score/) as HTMLInputElement;
      expect(passingScoreInput.min).toBe('0');
      expect(passingScoreInput.max).toBe('100');
    });

    it('should validate max attempts (min 1)', () => {
      render(<CourseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const maxAttemptsInput = screen.getByLabelText(/Maximum Attempts/) as HTMLInputElement;
      expect(maxAttemptsInput.min).toBe('1');
    });
  });

  describe('User Interactions', () => {
    it('should update title input', async () => {
      const user = userEvent.setup();
      render(<CourseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const titleInput = screen.getByLabelText(/Course Title/);
      await user.type(titleInput, 'Test Course Title');

      expect(titleInput).toHaveValue('Test Course Title');
    });

    it('should convert course code to uppercase', async () => {
      const user = userEvent.setup();
      render(<CourseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const codeInput = screen.getByLabelText(/Course Code/);
      await user.type(codeInput, 'web101');

      expect(codeInput).toHaveValue('WEB101');
    });

    it('should update description textarea', async () => {
      const user = userEvent.setup();
      render(<CourseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const descriptionInput = screen.getByLabelText(/Description/);
      await user.type(descriptionInput, 'Test description');

      expect(descriptionInput).toHaveValue('Test description');
    });

    it('should update credits field', async () => {
      const user = userEvent.setup();
      render(<CourseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const creditsInput = screen.getByLabelText(/Credits/);
      await user.clear(creditsInput);
      await user.type(creditsInput, '5');

      expect(creditsInput).toHaveValue(5);
    });

    it('should update duration field', async () => {
      const user = userEvent.setup();
      render(<CourseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const durationInput = screen.getByLabelText(/Duration/);
      await user.clear(durationInput);
      await user.type(durationInput, '40');

      expect(durationInput).toHaveValue(40);
    });

    it('should toggle self-enrollment checkbox', async () => {
      const user = userEvent.setup();
      render(<CourseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const checkbox = screen.getByLabelText(/Allow Self-Enrollment/);
      expect(checkbox).not.toBeChecked();

      await user.click(checkbox);
      expect(checkbox).toBeChecked();

      await user.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });

    it('should toggle certificate checkbox', async () => {
      const user = userEvent.setup();
      render(<CourseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const checkbox = screen.getByLabelText(/Enable Certificate/);
      expect(checkbox).not.toBeChecked();

      await user.click(checkbox);
      expect(checkbox).toBeChecked();
    });

    it('should update passing score', async () => {
      const user = userEvent.setup();
      render(<CourseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const passingScoreInput = screen.getByLabelText(/Passing Score/);
      await user.clear(passingScoreInput);
      await user.type(passingScoreInput, '85');

      expect(passingScoreInput).toHaveValue(85);
    });

    it('should update max attempts', async () => {
      const user = userEvent.setup();
      render(<CourseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const maxAttemptsInput = screen.getByLabelText(/Maximum Attempts/);
      await user.clear(maxAttemptsInput);
      await user.type(maxAttemptsInput, '5');

      expect(maxAttemptsInput).toHaveValue(5);
    });
  });

  describe('Form Submission', () => {
    it('should call onSubmit with form data', async () => {
      const user = userEvent.setup();
      render(<CourseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      await user.type(screen.getByLabelText(/Course Title/), 'New Course');
      await user.type(screen.getByLabelText(/Course Code/), 'NEW101');
      await user.type(screen.getByLabelText(/Department/), 'dept-1');

      const submitButton = screen.getByRole('button', { name: /Create Course/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'New Course',
            code: 'NEW101',
            department: 'dept-1',
          })
        );
      });
    });

    it('should include settings in submission', async () => {
      const user = userEvent.setup();
      render(<CourseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      await user.type(screen.getByLabelText(/Course Title/), 'New Course');
      await user.type(screen.getByLabelText(/Course Code/), 'NEW101');
      await user.type(screen.getByLabelText(/Department/), 'dept-1');
      await user.click(screen.getByLabelText(/Allow Self-Enrollment/));
      await user.click(screen.getByLabelText(/Enable Certificate/));

      const submitButton = screen.getByRole('button', { name: /Create Course/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            settings: expect.objectContaining({
              allowSelfEnrollment: true,
              certificateEnabled: true,
            }),
          })
        );
      });
    });

    it('should submit with optional fields', async () => {
      const user = userEvent.setup();
      render(<CourseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      await user.type(screen.getByLabelText(/Course Title/), 'New Course');
      await user.type(screen.getByLabelText(/Course Code/), 'NEW101');
      await user.type(screen.getByLabelText(/Description/), 'Test description');
      await user.type(screen.getByLabelText(/Department/), 'dept-1');
      await user.type(screen.getByLabelText(/Program/), 'prog-1');
      await user.clear(screen.getByLabelText(/Credits/));
      await user.type(screen.getByLabelText(/Credits/), '4');
      await user.clear(screen.getByLabelText(/Duration/));
      await user.type(screen.getByLabelText(/Duration/), '50');

      const submitButton = screen.getByRole('button', { name: /Create Course/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'New Course',
            code: 'NEW101',
            description: 'Test description',
            department: 'dept-1',
            program: 'prog-1',
            credits: 4,
            duration: 50,
          })
        );
      });
    });

    it('should submit update in edit mode', async () => {
      const user = userEvent.setup();
      render(<CourseForm course={mockDraftCourse} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const titleInput = screen.getByLabelText(/Course Title/);
      await user.clear(titleInput);
      await user.type(titleInput, 'Updated Title');

      const submitButton = screen.getByRole('button', { name: /Update Course/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Updated Title',
          })
        );
      });
    });
  });

  describe('Cancel Action', () => {
    it('should call onCancel when cancel button clicked', async () => {
      const user = userEvent.setup();
      render(<CourseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      await user.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('should not call onSubmit when cancel is clicked', async () => {
      const user = userEvent.setup();
      render(<CourseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      await user.click(cancelButton);

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    it('should disable form inputs when loading', () => {
      render(<CourseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isLoading={true} />);

      expect(screen.getByLabelText(/Course Title/)).toBeDisabled();
      expect(screen.getByLabelText(/Course Code/)).toBeDisabled();
      expect(screen.getByLabelText(/Description/)).toBeDisabled();
      expect(screen.getByLabelText(/Department/)).toBeDisabled();
    });

    it('should disable buttons when loading', () => {
      render(<CourseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isLoading={true} />);

      expect(screen.getByRole('button', { name: /Create Course/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /Cancel/i })).toBeDisabled();
    });

    it('should show loading spinner when loading', () => {
      const { container } = render(<CourseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isLoading={true} />);

      const spinner = container.querySelector('[class*="animate-spin"]');
      expect(spinner).toBeInTheDocument();
    });

    it('should not show spinner when not loading', () => {
      const { container } = render(<CourseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isLoading={false} />);

      const spinner = container.querySelector('[class*="animate-spin"]');
      expect(spinner).not.toBeInTheDocument();
    });
  });

  describe('Error Display', () => {
    it('should display error message when provided', () => {
      const errorMessage = 'Failed to create course';
      render(<CourseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} error={errorMessage} />);

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('should not display error when no error provided', () => {
      render(<CourseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const alert = screen.queryByRole('alert');
      expect(alert).not.toBeInTheDocument();
    });

    it('should display error in destructive variant', () => {
      const errorMessage = 'Failed to create course';
      const { container } = render(<CourseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} error={errorMessage} />);

      const alert = container.querySelector('[class*="destructive"]');
      expect(alert).toBeInTheDocument();
    });
  });

  describe('Course Code Format', () => {
    it('should display course code in monospace font', () => {
      render(<CourseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const codeInput = screen.getByLabelText(/Course Code/);
      expect(codeInput).toHaveClass('font-mono');
    });

    it('should show format helper text', () => {
      render(<CourseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      expect(screen.getByText(/Format: 2-4 uppercase letters followed by 3 digits/)).toBeInTheDocument();
    });

    it('should show example in placeholder', () => {
      render(<CourseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const codeInput = screen.getByLabelText(/Course Code/);
      expect(codeInput).toHaveAttribute('placeholder', 'e.g., WEB101');
    });
  });

  describe('Settings Configuration', () => {
    it('should display all setting options', () => {
      render(<CourseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      expect(screen.getByLabelText(/Allow Self-Enrollment/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Passing Score/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Maximum Attempts/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Enable Certificate/)).toBeInTheDocument();
    });

    it('should update all settings independently', async () => {
      const user = userEvent.setup();
      render(<CourseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      await user.click(screen.getByLabelText(/Allow Self-Enrollment/));
      await user.clear(screen.getByLabelText(/Passing Score/));
      await user.type(screen.getByLabelText(/Passing Score/), '80');
      await user.clear(screen.getByLabelText(/Maximum Attempts/));
      await user.type(screen.getByLabelText(/Maximum Attempts/), '5');
      await user.click(screen.getByLabelText(/Enable Certificate/));

      expect(screen.getByLabelText(/Allow Self-Enrollment/)).toBeChecked();
      expect(screen.getByLabelText(/Passing Score/)).toHaveValue(80);
      expect(screen.getByLabelText(/Maximum Attempts/)).toHaveValue(5);
      expect(screen.getByLabelText(/Enable Certificate/)).toBeChecked();
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for all inputs', () => {
      render(<CourseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      expect(screen.getByLabelText(/Course Title/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Course Code/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Description/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Credits/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Duration/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Department/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Program/)).toBeInTheDocument();
    });

    it('should mark required fields visually', () => {
      render(<CourseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const requiredLabels = screen.getAllByText('*');
      expect(requiredLabels.length).toBeGreaterThan(0);
    });

    it('should be keyboard navigable', () => {
      render(<CourseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const titleInput = screen.getByLabelText(/Course Title/);
      titleInput.focus();
      expect(titleInput).toHaveFocus();
    });
  });

  describe('Snapshot Tests', () => {
    it('should match snapshot for create mode', () => {
      const { container } = render(<CourseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for edit mode', () => {
      const { container } = render(
        <CourseForm course={mockPublishedCourse} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot with error', () => {
      const { container } = render(
        <CourseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} error="Test error message" />
      );

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot in loading state', () => {
      const { container } = render(<CourseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isLoading={true} />);

      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
