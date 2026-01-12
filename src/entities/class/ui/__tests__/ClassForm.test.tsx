/**
 * Tests for ClassForm Component (Simplified Version)
 *
 * Note: This tests the simplified ClassForm component which only has a name input field.
 * The full form implementation is in ClassForm.complex.tsx.skip and will be tested
 * once that component is completed and activated.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ClassForm } from '../ClassForm';
import { mockFullClass } from '@/test/mocks/data/classes';

describe('ClassForm (Simplified)', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      const onSubmit = vi.fn();

      render(<ClassForm onSubmit={onSubmit} />);

      expect(screen.getByLabelText(/Class Name/i)).toBeInTheDocument();
    });

    it('should render name input field', () => {
      const onSubmit = vi.fn();

      render(<ClassForm onSubmit={onSubmit} />);

      const nameInput = screen.getByLabelText(/Class Name/i);
      expect(nameInput).toBeInTheDocument();
      expect(nameInput.tagName).toBe('INPUT');
    });

    it('should show required indicator on name field', () => {
      const onSubmit = vi.fn();

      render(<ClassForm onSubmit={onSubmit} />);

      const requiredIndicator = screen.getByText('*');
      expect(requiredIndicator).toBeInTheDocument();
      expect(requiredIndicator).toHaveClass('text-destructive');
    });

    it('should render submit button', () => {
      const onSubmit = vi.fn();

      render(<ClassForm onSubmit={onSubmit} />);

      const submitButton = screen.getByRole('button', { name: /Create Class/i });
      expect(submitButton).toBeInTheDocument();
    });

    it('should display placeholder message for additional fields', () => {
      const onSubmit = vi.fn();

      render(<ClassForm onSubmit={onSubmit} />);

      expect(
        screen.getByText(/Additional fields \(course, program, dates, etc.\) coming soon/i)
      ).toBeInTheDocument();
    });
  });

  describe('Create Mode', () => {
    it('should display "Create Class" button in create mode', () => {
      const onSubmit = vi.fn();

      render(<ClassForm onSubmit={onSubmit} />);

      expect(screen.getByRole('button', { name: /Create Class/i })).toBeInTheDocument();
    });

    it('should have empty name input in create mode', () => {
      const onSubmit = vi.fn();

      render(<ClassForm onSubmit={onSubmit} />);

      const nameInput = screen.getByLabelText(/Class Name/i) as HTMLInputElement;
      expect(nameInput.value).toBe('');
    });

    it('should display placeholder text', () => {
      const onSubmit = vi.fn();

      render(<ClassForm onSubmit={onSubmit} />);

      const nameInput = screen.getByPlaceholderText('Enter class name');
      expect(nameInput).toBeInTheDocument();
    });
  });

  describe('Edit Mode', () => {
    it('should display "Update Class" button in edit mode', () => {
      const onSubmit = vi.fn();

      render(<ClassForm initialClass={mockFullClass} onSubmit={onSubmit} />);

      expect(screen.getByRole('button', { name: /Update Class/i })).toBeInTheDocument();
    });

    it('should populate name input with initial class data', () => {
      const onSubmit = vi.fn();

      render(<ClassForm initialClass={mockFullClass} onSubmit={onSubmit} />);

      const nameInput = screen.getByLabelText(/Class Name/i) as HTMLInputElement;
      expect(nameInput.value).toBe(mockFullClass.name);
    });

    it('should maintain initial values when provided', () => {
      const onSubmit = vi.fn();

      render(<ClassForm initialClass={mockFullClass} onSubmit={onSubmit} />);

      const nameInput = screen.getByLabelText(/Class Name/i) as HTMLInputElement;
      expect(nameInput.value).toBe(mockFullClass.name);
    });
  });

  describe('Form Interaction', () => {
    it('should update name input value when user types', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();

      render(<ClassForm onSubmit={onSubmit} />);

      const nameInput = screen.getByLabelText(/Class Name/i) as HTMLInputElement;
      await user.type(nameInput, 'New Test Class');

      expect(nameInput.value).toBe('New Test Class');
    });

    it('should allow editing existing name', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();

      render(<ClassForm initialClass={mockFullClass} onSubmit={onSubmit} />);

      const nameInput = screen.getByLabelText(/Class Name/i) as HTMLInputElement;
      await user.clear(nameInput);
      await user.type(nameInput, 'Updated Class Name');

      expect(nameInput.value).toBe('Updated Class Name');
    });

    it('should handle paste events', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();

      render(<ClassForm onSubmit={onSubmit} />);

      const nameInput = screen.getByLabelText(/Class Name/i);
      await user.click(nameInput);
      await user.paste('Pasted Class Name');

      expect((nameInput as HTMLInputElement).value).toBe('Pasted Class Name');
    });
  });

  describe('Form Submission', () => {
    it('should call onSubmit when form is submitted', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();

      render(<ClassForm onSubmit={onSubmit} />);

      const nameInput = screen.getByLabelText(/Class Name/i);
      await user.type(nameInput, 'Test Class');

      const submitButton = screen.getByRole('button', { name: /Create Class/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled();
      });
    });

    it('should call onSubmit with form data', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();

      render(<ClassForm onSubmit={onSubmit} />);

      const nameInput = screen.getByLabelText(/Class Name/i);
      await user.type(nameInput, 'Test Class');

      const submitButton = screen.getByRole('button', { name: /Create Class/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Test Class',
          })
        );
      });
    });

    it('should prevent default form submission', async () => {
      const onSubmit = vi.fn();

      const { container } = render(<ClassForm onSubmit={onSubmit} />);

      const form = container.querySelector('form');
      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      const preventDefaultSpy = vi.spyOn(submitEvent, 'preventDefault');

      form?.dispatchEvent(submitEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should not call onSubmit when name is empty and form is submitted', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();

      render(<ClassForm onSubmit={onSubmit} />);

      const submitButton = screen.getByRole('button', { name: /Create Class/i });
      await user.click(submitButton);

      // HTML5 validation should prevent submission
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Cancel Button', () => {
    it('should render cancel button when onCancel is provided', () => {
      const onSubmit = vi.fn();
      const onCancel = vi.fn();

      render(<ClassForm onSubmit={onSubmit} onCancel={onCancel} />);

      expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    });

    it('should not render cancel button when onCancel is not provided', () => {
      const onSubmit = vi.fn();

      render(<ClassForm onSubmit={onSubmit} />);

      expect(screen.queryByRole('button', { name: /Cancel/i })).not.toBeInTheDocument();
    });

    it('should call onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      const onCancel = vi.fn();

      render(<ClassForm onSubmit={onSubmit} onCancel={onCancel} />);

      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      await user.click(cancelButton);

      expect(onCancel).toHaveBeenCalled();
    });

    it('should not submit form when cancel button is clicked', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      const onCancel = vi.fn();

      render(<ClassForm onSubmit={onSubmit} onCancel={onCancel} />);

      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      await user.click(cancelButton);

      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    it('should disable inputs when isLoading is true', () => {
      const onSubmit = vi.fn();

      render(<ClassForm onSubmit={onSubmit} isLoading={true} />);

      const nameInput = screen.getByLabelText(/Class Name/i);
      expect(nameInput).toBeDisabled();
    });

    it('should disable submit button when isLoading is true', () => {
      const onSubmit = vi.fn();

      render(<ClassForm onSubmit={onSubmit} isLoading={true} />);

      const submitButton = screen.getByRole('button', { name: /Create Class/i });
      expect(submitButton).toBeDisabled();
    });

    it('should disable cancel button when isLoading is true', () => {
      const onSubmit = vi.fn();
      const onCancel = vi.fn();

      render(<ClassForm onSubmit={onSubmit} onCancel={onCancel} isLoading={true} />);

      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      expect(cancelButton).toBeDisabled();
    });

    it('should display loading spinner when isLoading is true', () => {
      const onSubmit = vi.fn();

      const { container } = render(<ClassForm onSubmit={onSubmit} isLoading={true} />);

      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('should not display loading spinner when isLoading is false', () => {
      const onSubmit = vi.fn();

      const { container } = render(<ClassForm onSubmit={onSubmit} isLoading={false} />);

      const spinner = container.querySelector('.animate-spin');
      expect(spinner).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should display error message when error is provided', () => {
      const onSubmit = vi.fn();
      const error = new Error('Failed to save class');

      render(<ClassForm onSubmit={onSubmit} error={error} />);

      expect(screen.getByText('Failed to save class')).toBeInTheDocument();
    });

    it('should not display error message when no error', () => {
      const onSubmit = vi.fn();

      render(<ClassForm onSubmit={onSubmit} error={null} />);

      expect(screen.queryByText(/Failed to save class/i)).not.toBeInTheDocument();
    });

    it('should display default error message when error has no message', () => {
      const onSubmit = vi.fn();
      const error = {} as Error;

      render(<ClassForm onSubmit={onSubmit} error={error} />);

      expect(screen.getByText('Failed to save class')).toBeInTheDocument();
    });

    it('should render error in alert component', () => {
      const onSubmit = vi.fn();
      const error = new Error('Test error');

      const { container } = render(<ClassForm onSubmit={onSubmit} error={error} />);

      const alert = container.querySelector('[role="alert"]');
      expect(alert).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should mark name field as required', () => {
      const onSubmit = vi.fn();

      render(<ClassForm onSubmit={onSubmit} />);

      const nameInput = screen.getByLabelText(/Class Name/i);
      expect(nameInput).toHaveAttribute('required');
    });

    it('should have proper input attributes', () => {
      const onSubmit = vi.fn();

      render(<ClassForm onSubmit={onSubmit} />);

      const nameInput = screen.getByLabelText(/Class Name/i);
      expect(nameInput).toHaveAttribute('id', 'name');
      expect(nameInput).toHaveAttribute('placeholder', 'Enter class name');
    });
  });

  describe('Button Icons', () => {
    it('should display save icon on submit button', () => {
      const onSubmit = vi.fn();

      render(<ClassForm onSubmit={onSubmit} />);

      const submitButton = screen.getByRole('button', { name: /Create Class/i });
      const icon = submitButton.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('should display X icon on cancel button', () => {
      const onSubmit = vi.fn();
      const onCancel = vi.fn();

      render(<ClassForm onSubmit={onSubmit} onCancel={onCancel} />);

      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      const icon = cancelButton.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper label association', () => {
      const onSubmit = vi.fn();

      render(<ClassForm onSubmit={onSubmit} />);

      const nameInput = screen.getByLabelText(/Class Name/i);
      const label = screen.getByText(/Class Name/);

      expect(nameInput).toHaveAttribute('id', 'name');
      expect(label).toHaveAttribute('for', 'name');
    });

    it('should have semantic form structure', () => {
      const onSubmit = vi.fn();

      const { container } = render(<ClassForm onSubmit={onSubmit} />);

      const form = container.querySelector('form');
      expect(form).toBeInTheDocument();
    });

    it('should have accessible buttons', () => {
      const onSubmit = vi.fn();
      const onCancel = vi.fn();

      render(<ClassForm onSubmit={onSubmit} onCancel={onCancel} />);

      const submitButton = screen.getByRole('button', { name: /Create Class/i });
      const cancelButton = screen.getByRole('button', { name: /Cancel/i });

      expect(submitButton).toHaveAttribute('type', 'submit');
      expect(cancelButton).toHaveAttribute('type', 'button');
    });
  });

  describe('Form Layout', () => {
    it('should use proper spacing classes', () => {
      const onSubmit = vi.fn();

      const { container } = render(<ClassForm onSubmit={onSubmit} />);

      const form = container.querySelector('form');
      expect(form).toHaveClass('space-y-6');
    });

    it('should render buttons in flex container', () => {
      const onSubmit = vi.fn();
      const onCancel = vi.fn();

      const { container } = render(<ClassForm onSubmit={onSubmit} onCancel={onCancel} />);

      const buttonContainer = container.querySelector('.flex.gap-2');
      expect(buttonContainer).toBeInTheDocument();
    });
  });

  describe('Snapshot Tests', () => {
    it('should match snapshot in create mode', () => {
      const onSubmit = vi.fn();

      const { container } = render(<ClassForm onSubmit={onSubmit} />);

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot in edit mode', () => {
      const onSubmit = vi.fn();

      const { container } = render(<ClassForm initialClass={mockFullClass} onSubmit={onSubmit} />);

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot with error', () => {
      const onSubmit = vi.fn();
      const error = new Error('Test error');

      const { container } = render(<ClassForm onSubmit={onSubmit} error={error} />);

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot in loading state', () => {
      const onSubmit = vi.fn();

      const { container } = render(<ClassForm onSubmit={onSubmit} isLoading={true} />);

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot with cancel button', () => {
      const onSubmit = vi.fn();
      const onCancel = vi.fn();

      const { container } = render(<ClassForm onSubmit={onSubmit} onCancel={onCancel} />);

      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('Future Implementation Notes', () => {
    it('should display message about future fields', () => {
      const onSubmit = vi.fn();

      render(<ClassForm onSubmit={onSubmit} />);

      const message = screen.getByText(/Additional fields.*coming soon/i);
      expect(message).toBeInTheDocument();
      expect(message).toHaveClass('text-sm', 'text-muted-foreground');
    });

    it('should indicate this is a simplified version', () => {
      const onSubmit = vi.fn();

      render(<ClassForm onSubmit={onSubmit} />);

      // The TODO comment in the component indicates future implementation
      expect(screen.getByText(/Additional fields/i)).toBeInTheDocument();
    });
  });
});
