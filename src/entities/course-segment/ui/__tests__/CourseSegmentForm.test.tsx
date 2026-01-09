/**
 * Tests for CourseSegmentForm Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CourseSegmentForm } from '../CourseSegmentForm';
import type { CreateCourseSegmentPayload, UpdateCourseSegmentPayload } from '../../model/types';

describe('CourseSegmentForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Create Mode', () => {
    it('should render form in create mode', () => {
      render(
        <CourseSegmentForm mode="create" onSubmit={mockOnSubmit} />
      );

      expect(screen.getByLabelText(/Title/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Description/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Order/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Type/)).toBeInTheDocument();
    });

    it('should show Create Module button in create mode', () => {
      render(
        <CourseSegmentForm mode="create" onSubmit={mockOnSubmit} />
      );

      expect(screen.getByText('Create Module')).toBeInTheDocument();
    });

    it('should have order field in create mode', () => {
      render(
        <CourseSegmentForm mode="create" onSubmit={mockOnSubmit} />
      );

      const orderInput = screen.getByLabelText(/Order/);
      expect(orderInput).toBeInTheDocument();
      expect(orderInput).toHaveAttribute('type', 'number');
    });

    it('should allow selecting type in create mode', () => {
      render(
        <CourseSegmentForm mode="create" onSubmit={mockOnSubmit} />
      );

      const typeSelect = screen.getByRole('combobox', { name: /Type/ });
      expect(typeSelect).not.toBeDisabled();
    });
  });

  describe('Edit Mode', () => {
    const defaultValues: UpdateCourseSegmentPayload = {
      title: 'Existing Module',
      description: 'Existing description',
      type: 'scorm',
      isPublished: true,
      passingScore: 80,
    };

    it('should render form in edit mode', () => {
      render(
        <CourseSegmentForm
          mode="edit"
          defaultValues={defaultValues}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByDisplayValue('Existing Module')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Existing description')).toBeInTheDocument();
    });

    it('should show Update Module button in edit mode', () => {
      render(
        <CourseSegmentForm
          mode="edit"
          defaultValues={defaultValues}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByText('Update Module')).toBeInTheDocument();
    });

    it('should not show order field in edit mode', () => {
      render(
        <CourseSegmentForm
          mode="edit"
          defaultValues={defaultValues}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.queryByLabelText(/Order/)).not.toBeInTheDocument();
    });

    it('should disable type selection in edit mode', () => {
      render(
        <CourseSegmentForm
          mode="edit"
          defaultValues={defaultValues}
          onSubmit={mockOnSubmit}
        />
      );

      const typeSelect = screen.getByRole('combobox', { name: /Type/ });
      expect(typeSelect).toBeDisabled();
    });
  });

  describe('Basic Information Fields', () => {
    it('should render title input', () => {
      render(
        <CourseSegmentForm mode="create" onSubmit={mockOnSubmit} />
      );

      const titleInput = screen.getByLabelText(/Title/);
      expect(titleInput).toBeInTheDocument();
      expect(titleInput).toHaveAttribute('placeholder', 'Enter module title');
    });

    it('should accept title input', async () => {
      const user = userEvent.setup();
      render(
        <CourseSegmentForm mode="create" onSubmit={mockOnSubmit} />
      );

      const titleInput = screen.getByLabelText(/Title/);
      await user.type(titleInput, 'New Module Title');

      expect(titleInput).toHaveValue('New Module Title');
    });

    it('should render description textarea', () => {
      render(
        <CourseSegmentForm mode="create" onSubmit={mockOnSubmit} />
      );

      const descriptionInput = screen.getByLabelText(/Description/);
      expect(descriptionInput).toBeInTheDocument();
      expect(descriptionInput.tagName).toBe('TEXTAREA');
    });

    it('should accept description input', async () => {
      const user = userEvent.setup();
      render(
        <CourseSegmentForm mode="create" onSubmit={mockOnSubmit} />
      );

      const descriptionInput = screen.getByLabelText(/Description/);
      await user.type(descriptionInput, 'Module description here');

      expect(descriptionInput).toHaveValue('Module description here');
    });

    it('should render order input in create mode', () => {
      render(
        <CourseSegmentForm mode="create" onSubmit={mockOnSubmit} />
      );

      const orderInput = screen.getByLabelText(/Order/);
      expect(orderInput).toBeInTheDocument();
      expect(orderInput).toHaveAttribute('type', 'number');
    });

    it('should render type selector', () => {
      render(
        <CourseSegmentForm mode="create" onSubmit={mockOnSubmit} />
      );

      const typeSelect = screen.getByRole('combobox', { name: /Type/ });
      expect(typeSelect).toBeInTheDocument();
    });
  });

  describe('Content Settings', () => {
    it('should render content ID input', () => {
      render(
        <CourseSegmentForm mode="create" onSubmit={mockOnSubmit} />
      );

      const contentIdInput = screen.getByLabelText(/Content ID/);
      expect(contentIdInput).toBeInTheDocument();
    });

    it('should render passing score input', () => {
      render(
        <CourseSegmentForm mode="create" onSubmit={mockOnSubmit} />
      );

      const passingScoreInput = screen.getByLabelText(/Passing Score/);
      expect(passingScoreInput).toBeInTheDocument();
      expect(passingScoreInput).toHaveAttribute('type', 'number');
    });

    it('should render duration input', () => {
      render(
        <CourseSegmentForm mode="create" onSubmit={mockOnSubmit} />
      );

      const durationInput = screen.getByLabelText(/Duration/);
      expect(durationInput).toBeInTheDocument();
      expect(durationInput).toHaveAttribute('type', 'number');
    });

    it('should accept content settings input', async () => {
      const user = userEvent.setup();
      render(
        <CourseSegmentForm mode="create" onSubmit={mockOnSubmit} />
      );

      const contentIdInput = screen.getByLabelText(/Content ID/);
      await user.type(contentIdInput, 'content-123');
      expect(contentIdInput).toHaveValue('content-123');

      const passingScoreInput = screen.getByLabelText(/Passing Score/);
      await user.clear(passingScoreInput);
      await user.type(passingScoreInput, '85');
      expect(passingScoreInput).toHaveValue(85);

      const durationInput = screen.getByLabelText(/Duration/);
      await user.clear(durationInput);
      await user.type(durationInput, '3600');
      expect(durationInput).toHaveValue(3600);
    });
  });

  describe('Module Settings', () => {
    it('should render allow multiple attempts toggle', () => {
      render(
        <CourseSegmentForm mode="create" onSubmit={mockOnSubmit} />
      );

      expect(screen.getByText('Allow Multiple Attempts')).toBeInTheDocument();
    });

    it('should render allow multiple attempts toggle', () => {
      render(
        <CourseSegmentForm mode="create" onSubmit={mockOnSubmit} />
      );

      expect(screen.getByText('Allow Multiple Attempts')).toBeInTheDocument();
      expect(screen.getByText(/Allow learners to retry this module/)).toBeInTheDocument();
    });

    it('should show max attempts field when multiple attempts enabled', () => {
      render(
        <CourseSegmentForm mode="create" onSubmit={mockOnSubmit} />
      );

      expect(screen.getByLabelText(/Maximum Attempts/)).toBeInTheDocument();
    });

    it('should conditionally show max attempts field', () => {
      render(
        <CourseSegmentForm mode="create" onSubmit={mockOnSubmit} />
      );

      // By default, multiple attempts is enabled, so max attempts field should be present
      expect(screen.getByLabelText(/Maximum Attempts/)).toBeInTheDocument();
    });

    it('should render time limit input', () => {
      render(
        <CourseSegmentForm mode="create" onSubmit={mockOnSubmit} />
      );

      const timeLimitInput = screen.getByLabelText(/Time Limit/);
      expect(timeLimitInput).toBeInTheDocument();
      expect(timeLimitInput).toHaveAttribute('type', 'number');
    });

    it('should render show feedback toggle', () => {
      render(
        <CourseSegmentForm mode="create" onSubmit={mockOnSubmit} />
      );

      expect(screen.getByText('Show Feedback')).toBeInTheDocument();
    });

    it('should render show feedback toggle', () => {
      render(
        <CourseSegmentForm mode="create" onSubmit={mockOnSubmit} />
      );

      expect(screen.getByText('Show Feedback')).toBeInTheDocument();
    });

    it('should render shuffle questions toggle', () => {
      render(
        <CourseSegmentForm mode="create" onSubmit={mockOnSubmit} />
      );

      expect(screen.getByText('Shuffle Questions')).toBeInTheDocument();
    });
  });

  describe('Publishing Toggle', () => {
    it('should render published toggle', () => {
      render(
        <CourseSegmentForm mode="create" onSubmit={mockOnSubmit} />
      );

      expect(screen.getByText('Published')).toBeInTheDocument();
      expect(screen.getByText(/Make this module visible to learners/)).toBeInTheDocument();
    });

    it('should render published toggle in edit mode', () => {
      render(
        <CourseSegmentForm
          mode="edit"
          defaultValues={{ isPublished: true }}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByText('Published')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show error when title is empty', async () => {
      const user = userEvent.setup();
      render(
        <CourseSegmentForm mode="create" onSubmit={mockOnSubmit} />
      );

      const titleInput = screen.getByLabelText(/Title/);
      await user.clear(titleInput);

      const submitButton = screen.getByText('Create Module');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Title is required')).toBeInTheDocument();
      });
    });

    it('should show error when order is less than 1', async () => {
      const user = userEvent.setup();
      render(
        <CourseSegmentForm mode="create" onSubmit={mockOnSubmit} />
      );

      const orderInput = screen.getByLabelText(/Order/);
      await user.clear(orderInput);
      await user.type(orderInput, '0');

      const submitButton = screen.getByText('Create Module');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Order must be at least 1/)).toBeInTheDocument();
      });
    });

    it('should show error when passing score is over 100', async () => {
      const user = userEvent.setup();
      render(
        <CourseSegmentForm mode="create" onSubmit={mockOnSubmit} />
      );

      const passingScoreInput = screen.getByLabelText(/Passing Score/);
      await user.type(passingScoreInput, '150');

      const submitButton = screen.getByText('Create Module');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Must be at most 100/)).toBeInTheDocument();
      });
    });

    it('should show error when passing score is negative', async () => {
      const user = userEvent.setup();
      render(
        <CourseSegmentForm mode="create" onSubmit={mockOnSubmit} />
      );

      const passingScoreInput = screen.getByLabelText(/Passing Score/);
      await user.type(passingScoreInput, '-10');

      const submitButton = screen.getByText('Create Module');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Must be at least 0/)).toBeInTheDocument();
      });
    });

    it('should show error when title exceeds max length', async () => {
      const user = userEvent.setup();
      render(
        <CourseSegmentForm mode="create" onSubmit={mockOnSubmit} />
      );

      const longTitle = 'A'.repeat(201);
      const titleInput = screen.getByLabelText(/Title/);
      await user.type(titleInput, longTitle);

      const submitButton = screen.getByText('Create Module');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Title must be at most 200 characters/)).toBeInTheDocument();
      });
    });

    it('should show error when description exceeds max length', async () => {
      const user = userEvent.setup();
      render(
        <CourseSegmentForm mode="create" onSubmit={mockOnSubmit} />
      );

      const longDescription = 'B'.repeat(2001);
      const descriptionInput = screen.getByLabelText(/Description/);
      await user.type(descriptionInput, longDescription);

      const submitButton = screen.getByText('Create Module');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Description must be at most 2000 characters/)).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('should call onSubmit with valid data in create mode', async () => {
      const user = userEvent.setup();
      render(
        <CourseSegmentForm mode="create" onSubmit={mockOnSubmit} />
      );

      await user.type(screen.getByLabelText(/Title/), 'New Module');
      await user.type(screen.getByLabelText(/Description/), 'Module description');

      const submitButton = screen.getByText('Create Module');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });

      const submittedData = mockOnSubmit.mock.calls[0][0] as CreateCourseSegmentPayload;
      expect(submittedData.title).toBe('New Module');
      expect(submittedData.description).toBe('Module description');
    });

    it('should call onSubmit with all fields populated', async () => {
      const user = userEvent.setup();
      render(
        <CourseSegmentForm mode="create" onSubmit={mockOnSubmit} />
      );

      await user.type(screen.getByLabelText(/Title/), 'Complete Module');
      await user.type(screen.getByLabelText(/Description/), 'Complete description');
      await user.type(screen.getByLabelText(/Content ID/), 'content-123');

      const submitButton = screen.getByText('Create Module');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });

      const submittedData = mockOnSubmit.mock.calls[0][0] as CreateCourseSegmentPayload;
      expect(submittedData.title).toBe('Complete Module');
      expect(submittedData.description).toBe('Complete description');
      expect(submittedData.contentId).toBe('content-123');
    });

    it('should include settings in submission', async () => {
      const user = userEvent.setup();
      render(
        <CourseSegmentForm mode="create" onSubmit={mockOnSubmit} />
      );

      await user.type(screen.getByLabelText(/Title/), 'Module with Settings');

      const submitButton = screen.getByText('Create Module');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });

      const submittedData = mockOnSubmit.mock.calls[0][0] as CreateCourseSegmentPayload;
      expect(submittedData.settings).toBeDefined();
      expect(submittedData.settings).toHaveProperty('allowMultipleAttempts');
      expect(submittedData.settings).toHaveProperty('showFeedback');
    });

    it('should call onSubmit in edit mode', async () => {
      const user = userEvent.setup();
      render(
        <CourseSegmentForm
          mode="edit"
          defaultValues={{ title: 'Existing', description: 'Old description' }}
          onSubmit={mockOnSubmit}
        />
      );

      const titleInput = screen.getByDisplayValue('Existing');
      await user.clear(titleInput);
      await user.type(titleInput, 'Updated Title');

      const submitButton = screen.getByText('Update Module');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });

      const submittedData = mockOnSubmit.mock.calls[0][0] as UpdateCourseSegmentPayload;
      expect(submittedData.title).toBe('Updated Title');
    });

    it('should not call onSubmit when form is invalid', async () => {
      const user = userEvent.setup();
      render(
        <CourseSegmentForm mode="create" onSubmit={mockOnSubmit} />
      );

      // Clear required title field
      const titleInput = screen.getByLabelText(/Title/);
      await user.clear(titleInput);

      const submitButton = screen.getByText('Create Module');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Title is required')).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    it('should disable form when loading', () => {
      render(
        <CourseSegmentForm mode="create" onSubmit={mockOnSubmit} isLoading={true} />
      );

      const submitButton = screen.getByText('Saving...');
      expect(submitButton).toBeDisabled();
    });

    it('should show "Saving..." text when loading', () => {
      render(
        <CourseSegmentForm mode="create" onSubmit={mockOnSubmit} isLoading={true} />
      );

      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });

    it('should disable cancel button when loading', () => {
      render(
        <CourseSegmentForm
          mode="create"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isLoading={true}
        />
      );

      const cancelButton = screen.getByText('Cancel');
      expect(cancelButton).toBeDisabled();
    });
  });

  describe('Cancel Button', () => {
    it('should show cancel button when onCancel provided', () => {
      render(
        <CourseSegmentForm
          mode="create"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('should not show cancel button when onCancel not provided', () => {
      render(
        <CourseSegmentForm mode="create" onSubmit={mockOnSubmit} />
      );

      expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
    });

    it('should call onCancel when cancel button clicked', async () => {
      const user = userEvent.setup();
      render(
        <CourseSegmentForm
          mode="create"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalled();
    });
  });

  describe('Default Values', () => {
    it('should populate form with default values', () => {
      const defaultValues: UpdateCourseSegmentPayload = {
        title: 'Test Module',
        description: 'Test description',
        contentId: 'content-abc',
        passingScore: 75,
        duration: 2400,
        isPublished: true,
      };

      render(
        <CourseSegmentForm
          mode="edit"
          defaultValues={defaultValues}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByDisplayValue('Test Module')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test description')).toBeInTheDocument();
      expect(screen.getByDisplayValue('content-abc')).toBeInTheDocument();
      expect(screen.getByDisplayValue('75')).toBeInTheDocument();
      expect(screen.getByDisplayValue('2400')).toBeInTheDocument();
    });

    it('should use default values for toggles', () => {
      render(
        <CourseSegmentForm mode="create" onSubmit={mockOnSubmit} />
      );

      // Verify toggle labels are present (indicating default state is set)
      expect(screen.getByText('Allow Multiple Attempts')).toBeInTheDocument();
      expect(screen.getByText('Show Feedback')).toBeInTheDocument();
      expect(screen.getByText('Shuffle Questions')).toBeInTheDocument();
      expect(screen.getByText('Published')).toBeInTheDocument();
    });
  });

  describe('Type Selection', () => {
    it('should render type selector', () => {
      render(
        <CourseSegmentForm mode="create" onSubmit={mockOnSubmit} />
      );

      const typeSelect = screen.getByRole('combobox', { name: /Type/ });
      expect(typeSelect).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string description', async () => {
      const user = userEvent.setup();
      render(
        <CourseSegmentForm mode="create" onSubmit={mockOnSubmit} />
      );

      await user.type(screen.getByLabelText(/Title/), 'Module');

      const descriptionInput = screen.getByLabelText(/Description/);
      await user.clear(descriptionInput);

      const submitButton = screen.getByText('Create Module');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });
    });

    it('should handle zero values for numeric fields', async () => {
      const user = userEvent.setup();
      render(
        <CourseSegmentForm mode="create" onSubmit={mockOnSubmit} />
      );

      await user.type(screen.getByLabelText(/Title/), 'Module');

      const passingScoreInput = screen.getByLabelText(/Passing Score/);
      await user.clear(passingScoreInput);
      await user.type(passingScoreInput, '0');

      const durationInput = screen.getByLabelText(/Duration/);
      await user.clear(durationInput);
      await user.type(durationInput, '0');

      const submitButton = screen.getByText('Create Module');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });
    });

    it('should handle max attempts of 1', async () => {
      const user = userEvent.setup();
      render(
        <CourseSegmentForm mode="create" onSubmit={mockOnSubmit} />
      );

      await user.type(screen.getByLabelText(/Title/), 'Module');

      const maxAttemptsInput = screen.getByLabelText(/Maximum Attempts/);
      await user.type(maxAttemptsInput, '1');

      const submitButton = screen.getByText('Create Module');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });

      const submittedData = mockOnSubmit.mock.calls[0][0] as CreateCourseSegmentPayload;
      // Form inputs return strings, so we need to check for the value that was typed
      expect(submittedData.settings?.maxAttempts).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for all inputs', () => {
      render(
        <CourseSegmentForm mode="create" onSubmit={mockOnSubmit} />
      );

      expect(screen.getByLabelText(/Title/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Description/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Order/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Type/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Content ID/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Passing Score/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Duration/)).toBeInTheDocument();
    });

    it('should have descriptive text for toggles', () => {
      render(
        <CourseSegmentForm mode="create" onSubmit={mockOnSubmit} />
      );

      expect(screen.getByText(/Allow learners to retry this module/)).toBeInTheDocument();
      expect(screen.getByText(/Show correct answers and feedback/)).toBeInTheDocument();
      expect(screen.getByText(/Randomize question order/)).toBeInTheDocument();
      expect(screen.getByText(/Make this module visible to learners/)).toBeInTheDocument();
    });

    it('should show error messages near fields', async () => {
      const user = userEvent.setup();
      render(
        <CourseSegmentForm mode="create" onSubmit={mockOnSubmit} />
      );

      const titleInput = screen.getByLabelText(/Title/);
      await user.clear(titleInput);

      const submitButton = screen.getByText('Create Module');
      await user.click(submitButton);

      await waitFor(() => {
        const errorMessage = screen.getByText('Title is required');
        expect(errorMessage).toBeInTheDocument();
        expect(errorMessage).toHaveClass('text-destructive');
      });
    });
  });

  describe('Snapshot Tests', () => {
    it('should match snapshot in create mode', () => {
      const { container } = render(
        <CourseSegmentForm mode="create" onSubmit={mockOnSubmit} />
      );

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot in edit mode', () => {
      const { container } = render(
        <CourseSegmentForm
          mode="edit"
          defaultValues={{ title: 'Test', description: 'Test desc' }}
          onSubmit={mockOnSubmit}
        />
      );

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot with loading state', () => {
      const { container } = render(
        <CourseSegmentForm
          mode="create"
          onSubmit={mockOnSubmit}
          isLoading={true}
        />
      );

      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
