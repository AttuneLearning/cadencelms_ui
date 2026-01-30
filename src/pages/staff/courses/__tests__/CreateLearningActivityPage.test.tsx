/**
 * Tests for CreateLearningActivityPage
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';
import { CreateLearningActivityPage } from '../CreateLearningActivityPage';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

let mutateAsync = vi.fn();

vi.mock('@/entities/learning-unit', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/entities/learning-unit')>();
  return {
    ...actual,
    useCreateLearningUnit: () => ({
      mutateAsync,
      isPending: false,
      error: null,
    }),
  };
});

describe('CreateLearningActivityPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mutateAsync = vi.fn().mockResolvedValue({ id: 'unit-123' });
  });

  it('renders page header and form', () => {
    renderWithProviders(<CreateLearningActivityPage />, {
      wrapperOptions: {
        initialEntries: ['/staff/courses/course-123/modules/module-456/learning-activities/new'],
        routePath: '/staff/courses/:courseId/modules/:moduleId/learning-activities/new',
      },
    });

    expect(screen.getByRole('heading', { name: /create learning activity/i })).toBeInTheDocument();
    expect(screen.getByText(/add a learning activity to this module/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
  });

  it('submits the form and creates a learning activity', async () => {
    const user = userEvent.setup();

    renderWithProviders(<CreateLearningActivityPage />, {
      wrapperOptions: {
        initialEntries: ['/staff/courses/course-123/modules/module-456/learning-activities/new'],
        routePath: '/staff/courses/:courseId/modules/:moduleId/learning-activities/new',
      },
    });

    await user.type(screen.getByLabelText(/title/i), 'New Activity');

    const submitButton = screen.getByRole('button', { name: /create learning activity/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          moduleId: 'module-456',
          payload: expect.objectContaining({
            title: 'New Activity',
          }),
        })
      );
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/staff/courses/course-123/modules/module-456/edit');
    });
  });
});
