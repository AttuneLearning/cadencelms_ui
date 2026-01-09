/**
 * Tests for ProgramLevelForm Component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProgramLevelForm } from '../ProgramLevelForm';
import {
  mockCreateProgramLevelFormData,
  mockUpdateProgramLevelFormData,
  mockMinimalFormData,
} from '@/test/mocks/data/programLevels';

describe('ProgramLevelForm', () => {
  describe('Rendering', () => {
    it('should render in create mode by default', () => {
      const handleSubmit = vi.fn();

      render(<ProgramLevelForm onSubmit={handleSubmit} />);

      expect(screen.getByLabelText(/Level Name/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Description/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Required Credits/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Create Level' })).toBeInTheDocument();
    });

    it('should render in edit mode', () => {
      const handleSubmit = vi.fn();

      render(
        <ProgramLevelForm
          onSubmit={handleSubmit}
          mode="edit"
          initialData={mockUpdateProgramLevelFormData}
        />
      );

      expect(screen.getByRole('button', { name: 'Update Level' })).toBeInTheDocument();
    });

    it('should display initial data in form fields', () => {
      const handleSubmit = vi.fn();

      render(
        <ProgramLevelForm
          onSubmit={handleSubmit}
          initialData={mockCreateProgramLevelFormData}
        />
      );

      expect(screen.getByDisplayValue('Year 1: Foundation')).toBeInTheDocument();
      expect(
        screen.getByDisplayValue(/Introduction to computer science fundamentals/)
      ).toBeInTheDocument();
      expect(screen.getByDisplayValue('30')).toBeInTheDocument();
    });

    it('should show cancel button when onCancel is provided', () => {
      const handleSubmit = vi.fn();
      const handleCancel = vi.fn();

      render(<ProgramLevelForm onSubmit={handleSubmit} onCancel={handleCancel} />);

      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });

    it('should not show cancel button when onCancel is not provided', () => {
      const handleSubmit = vi.fn();

      render(<ProgramLevelForm onSubmit={handleSubmit} />);

      expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
    });

    it('should display error message when provided', () => {
      const handleSubmit = vi.fn();

      render(<ProgramLevelForm onSubmit={handleSubmit} error="Something went wrong" />);

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('should not display error when error is null', () => {
      const handleSubmit = vi.fn();

      render(<ProgramLevelForm onSubmit={handleSubmit} error={null} />);

      const alerts = document.querySelectorAll('[role="alert"]');
      expect(alerts).toHaveLength(0);
    });

    it('should show required asterisk on name field', () => {
      const handleSubmit = vi.fn();

      render(<ProgramLevelForm onSubmit={handleSubmit} />);

      const nameLabel = screen.getByLabelText(/Level Name/);
      expect(nameLabel).toBeInTheDocument();
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('should show placeholder text in fields', () => {
      const handleSubmit = vi.fn();

      render(<ProgramLevelForm onSubmit={handleSubmit} />);

      expect(
        screen.getByPlaceholderText(/e.g., Level 1: Foundation/)
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(/Describe what learners will accomplish/)
      ).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/e.g., 15, 18, 24/)).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should validate required name field', async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn();

      render(<ProgramLevelForm onSubmit={handleSubmit} />);

      const submitButton = screen.getByRole('button', { name: 'Create Level' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Level name is required')).toBeInTheDocument();
      });

      expect(handleSubmit).not.toHaveBeenCalled();
    });

    it('should validate name max length (200 characters)', async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn();
      const longName = 'A'.repeat(201);

      render(
        <ProgramLevelForm onSubmit={handleSubmit} initialData={{ name: longName }} />
      );

      const submitButton = screen.getByRole('button', { name: 'Create Level' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('Level name must be 200 characters or less')
        ).toBeInTheDocument();
      });

      expect(handleSubmit).not.toHaveBeenCalled();
    });

    it('should validate description max length (2000 characters)', async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn();
      const longDescription = 'A'.repeat(2001);

      render(
        <ProgramLevelForm
          onSubmit={handleSubmit}
          initialData={{ name: 'Valid Name', description: longDescription }}
        />
      );

      const submitButton = screen.getByRole('button', { name: 'Create Level' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('Description must be 2000 characters or less')
        ).toBeInTheDocument();
      });

      expect(handleSubmit).not.toHaveBeenCalled();
    });

    it('should have min attribute on credits input to prevent negative numbers', () => {
      const handleSubmit = vi.fn();

      render(<ProgramLevelForm onSubmit={handleSubmit} />);

      const creditsInput = screen.getByLabelText(/Required Credits/) as HTMLInputElement;
      expect(creditsInput).toHaveAttribute('min', '0');
      expect(creditsInput).toHaveAttribute('type', 'number');
    });

    it('should clear validation errors when field is corrected', async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn();

      render(<ProgramLevelForm onSubmit={handleSubmit} />);

      const submitButton = screen.getByRole('button', { name: 'Create Level' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Level name is required')).toBeInTheDocument();
      });

      const nameInput = screen.getByLabelText(/Level Name/);
      await user.type(nameInput, 'Valid Name');

      await waitFor(() => {
        expect(screen.queryByText('Level name is required')).not.toBeInTheDocument();
      });
    });

    it('should accept valid form data', async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn();

      render(<ProgramLevelForm onSubmit={handleSubmit} />);

      const nameInput = screen.getByLabelText(/Level Name/);
      await user.type(nameInput, 'Year 1: Foundation');

      const submitButton = screen.getByRole('button', { name: 'Create Level' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalledWith({
          name: 'Year 1: Foundation',
        });
      });
    });
  });

  describe('Form Submission', () => {
    it('should submit form with all fields', async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn();

      render(<ProgramLevelForm onSubmit={handleSubmit} />);

      const nameInput = screen.getByLabelText(/Level Name/);
      const descriptionInput = screen.getByLabelText(/Description/);
      const creditsInput = screen.getByLabelText(/Required Credits/);

      await user.type(nameInput, 'Year 1: Foundation');
      await user.type(descriptionInput, 'Introduction to computer science fundamentals');
      await user.clear(creditsInput);
      await user.type(creditsInput, '30');

      const submitButton = screen.getByRole('button', { name: 'Create Level' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalledWith({
          name: 'Year 1: Foundation',
          description: 'Introduction to computer science fundamentals',
          requiredCredits: 30,
        });
      });
    });

    it('should submit form with only required fields', async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn();

      render(<ProgramLevelForm onSubmit={handleSubmit} />);

      const nameInput = screen.getByLabelText(/Level Name/);
      await user.type(nameInput, 'New Level');

      const submitButton = screen.getByRole('button', { name: 'Create Level' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalledWith({
          name: 'New Level',
        });
      });
    });

    it('should trim whitespace from text fields', async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn();

      render(<ProgramLevelForm onSubmit={handleSubmit} />);

      const nameInput = screen.getByLabelText(/Level Name/);
      const descriptionInput = screen.getByLabelText(/Description/);

      await user.type(nameInput, '  Year 1: Foundation  ');
      await user.type(descriptionInput, '  Some description  ');

      const submitButton = screen.getByRole('button', { name: 'Create Level' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalledWith({
          name: 'Year 1: Foundation',
          description: 'Some description',
        });
      });
    });

    it('should not include empty description in payload', async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn();

      render(<ProgramLevelForm onSubmit={handleSubmit} />);

      const nameInput = screen.getByLabelText(/Level Name/);
      await user.type(nameInput, 'New Level');

      const submitButton = screen.getByRole('button', { name: 'Create Level' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalledWith({
          name: 'New Level',
        });
      });

      const call = handleSubmit.mock.calls[0][0];
      expect(call).not.toHaveProperty('description');
    });

    it('should handle numeric input for credits', async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn();

      render(<ProgramLevelForm onSubmit={handleSubmit} initialData={{ requiredCredits: 42 }} />);

      const nameInput = screen.getByLabelText(/Level Name/);
      await user.type(nameInput, 'New Level');

      const submitButton = screen.getByRole('button', { name: 'Create Level' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalledWith({
          name: 'New Level',
          requiredCredits: 42,
        });
      });
    });

    it('should handle zero credits', async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn();

      render(<ProgramLevelForm onSubmit={handleSubmit} initialData={{ requiredCredits: 0 }} />);

      const nameInput = screen.getByLabelText(/Level Name/);
      await user.type(nameInput, 'New Level');

      const submitButton = screen.getByRole('button', { name: 'Create Level' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalledWith({
          name: 'New Level',
          requiredCredits: 0,
        });
      });
    });
  });

  describe('Form Interactions', () => {
    it('should update form fields on change', async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn();

      render(<ProgramLevelForm onSubmit={handleSubmit} />);

      const nameInput = screen.getByLabelText(/Level Name/) as HTMLInputElement;
      await user.type(nameInput, 'Test Level');

      expect(nameInput.value).toBe('Test Level');
    });

    it('should call onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn();
      const handleCancel = vi.fn();

      render(<ProgramLevelForm onSubmit={handleSubmit} onCancel={handleCancel} />);

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      await user.click(cancelButton);

      expect(handleCancel).toHaveBeenCalledTimes(1);
    });

    it('should prevent form submission when validation fails', async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn();

      render(<ProgramLevelForm onSubmit={handleSubmit} />);

      const submitButton = screen.getByRole('button', { name: 'Create Level' });
      await user.click(submitButton);

      expect(handleSubmit).not.toHaveBeenCalled();
    });

    it('should update initial data when initialData prop changes', () => {
      const handleSubmit = vi.fn();

      const { rerender } = render(
        <ProgramLevelForm onSubmit={handleSubmit} initialData={mockMinimalFormData} />
      );

      expect(screen.getByDisplayValue('New Level')).toBeInTheDocument();

      rerender(
        <ProgramLevelForm onSubmit={handleSubmit} initialData={mockCreateProgramLevelFormData} />
      );

      expect(screen.getByDisplayValue('Year 1: Foundation')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should disable form fields when loading', () => {
      const handleSubmit = vi.fn();

      render(<ProgramLevelForm onSubmit={handleSubmit} loading />);

      const nameInput = screen.getByLabelText(/Level Name/);
      const descriptionInput = screen.getByLabelText(/Description/);
      const creditsInput = screen.getByLabelText(/Required Credits/);

      expect(nameInput).toBeDisabled();
      expect(descriptionInput).toBeDisabled();
      expect(creditsInput).toBeDisabled();
    });

    it('should disable buttons when loading', () => {
      const handleSubmit = vi.fn();
      const handleCancel = vi.fn();

      render(<ProgramLevelForm onSubmit={handleSubmit} onCancel={handleCancel} loading />);

      const submitButton = screen.getByRole('button', { name: 'Saving...' });
      const cancelButton = screen.getByRole('button', { name: 'Cancel' });

      expect(submitButton).toBeDisabled();
      expect(cancelButton).toBeDisabled();
    });

    it('should show loading text on submit button', () => {
      const handleSubmit = vi.fn();

      render(<ProgramLevelForm onSubmit={handleSubmit} loading />);

      expect(screen.getByRole('button', { name: 'Saving...' })).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string in credits field', async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn();

      render(<ProgramLevelForm onSubmit={handleSubmit} />);

      const nameInput = screen.getByLabelText(/Level Name/);
      const creditsInput = screen.getByLabelText(/Required Credits/);

      await user.type(nameInput, 'New Level');
      await user.clear(creditsInput);

      const submitButton = screen.getByRole('button', { name: 'Create Level' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalledWith({
          name: 'New Level',
        });
      });
    });

    it('should enforce max length on name field', async () => {
      const handleSubmit = vi.fn();

      render(<ProgramLevelForm onSubmit={handleSubmit} />);

      const nameInput = screen.getByLabelText(/Level Name/) as HTMLInputElement;
      expect(nameInput).toHaveAttribute('maxLength', '200');
    });

    it('should enforce max length on description field', async () => {
      const handleSubmit = vi.fn();

      render(<ProgramLevelForm onSubmit={handleSubmit} />);

      const descriptionInput = screen.getByLabelText(/Description/) as HTMLTextAreaElement;
      expect(descriptionInput).toHaveAttribute('maxLength', '2000');
    });

    it('should handle very long valid description', async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn();
      const longValidDescription = 'A'.repeat(2000);

      render(
        <ProgramLevelForm
          onSubmit={handleSubmit}
          initialData={{ name: 'New Level', description: longValidDescription }}
        />
      );

      const submitButton = screen.getByRole('button', { name: 'Create Level' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for all fields', () => {
      const handleSubmit = vi.fn();

      render(<ProgramLevelForm onSubmit={handleSubmit} />);

      expect(screen.getByLabelText(/Level Name/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Description/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Required Credits/)).toBeInTheDocument();
    });

    it('should display helper text for fields', () => {
      const handleSubmit = vi.fn();

      render(<ProgramLevelForm onSubmit={handleSubmit} />);

      expect(
        screen.getByText(/Descriptive name for this level within the program/)
      ).toBeInTheDocument();
      expect(screen.getByText(/Optional description of this level/)).toBeInTheDocument();
      expect(
        screen.getByText(/Optional number of credits required to complete this level/)
      ).toBeInTheDocument();
    });

    it('should apply error styling to invalid fields', async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn();

      render(<ProgramLevelForm onSubmit={handleSubmit} />);

      const submitButton = screen.getByRole('button', { name: 'Create Level' });
      await user.click(submitButton);

      await waitFor(() => {
        const nameInput = screen.getByLabelText(/Level Name/);
        expect(nameInput).toHaveClass('border-destructive');
      });
    });
  });

  describe('Snapshot Tests', () => {
    it('should match snapshot in create mode', () => {
      const handleSubmit = vi.fn();
      const { container } = render(<ProgramLevelForm onSubmit={handleSubmit} mode="create" />);

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot in edit mode', () => {
      const handleSubmit = vi.fn();
      const { container } = render(
        <ProgramLevelForm
          onSubmit={handleSubmit}
          mode="edit"
          initialData={mockUpdateProgramLevelFormData}
        />
      );

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot with error', () => {
      const handleSubmit = vi.fn();
      const { container } = render(
        <ProgramLevelForm onSubmit={handleSubmit} error="Test error message" />
      );

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot in loading state', () => {
      const handleSubmit = vi.fn();
      const { container } = render(<ProgramLevelForm onSubmit={handleSubmit} loading />);

      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
