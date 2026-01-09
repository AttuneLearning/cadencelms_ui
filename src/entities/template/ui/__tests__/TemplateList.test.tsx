/**
 * Tests for TemplateList Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TemplateList } from '../TemplateList';
import * as useTemplateHook from '../../model/useTemplate';
import {
  mockTemplateListItems,
  createMockTemplateListItem,
} from '@/test/mocks/data/templates';
import type { TemplatesListResponse } from '../../model/types';

// Create a wrapper with all necessary providers
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe('TemplateList', () => {
  const mockTemplatesResponse: TemplatesListResponse = {
    templates: mockTemplateListItems,
    pagination: {
      page: 1,
      limit: 20,
      total: mockTemplateListItems.length,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should display loading spinner', () => {
      vi.spyOn(useTemplateHook, 'useTemplates').mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
      } as any);

      const { container } = render(<TemplateList />, { wrapper: createWrapper() });

      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should display error message on fetch failure', () => {
      const errorMessage = 'Failed to load templates';
      vi.spyOn(useTemplateHook, 'useTemplates').mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error(errorMessage),
      } as any);

      render(<TemplateList />, { wrapper: createWrapper() });

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('should display default error message when error has no message', () => {
      vi.spyOn(useTemplateHook, 'useTemplates').mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: null,
      } as any);

      render(<TemplateList />, { wrapper: createWrapper() });

      expect(screen.getByText('Failed to load templates. Please try again.')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should display "No templates found" when list is empty', () => {
      vi.spyOn(useTemplateHook, 'useTemplates').mockReturnValue({
        data: {
          templates: [],
          pagination: {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
          },
        },
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(<TemplateList />, { wrapper: createWrapper() });

      expect(screen.getByText('No templates found.')).toBeInTheDocument();
    });
  });

  describe('Template Rendering', () => {
    it('should render all templates in the list', () => {
      vi.spyOn(useTemplateHook, 'useTemplates').mockReturnValue({
        data: mockTemplatesResponse,
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(<TemplateList />, { wrapper: createWrapper() });

      mockTemplateListItems.forEach((template) => {
        expect(screen.getByText(template.name)).toBeInTheDocument();
      });
    });

    it('should render templates in a grid layout', () => {
      vi.spyOn(useTemplateHook, 'useTemplates').mockReturnValue({
        data: mockTemplatesResponse,
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      const { container } = render(<TemplateList />, { wrapper: createWrapper() });

      const grid = container.querySelector('[class*="grid"]');
      expect(grid).toBeInTheDocument();
    });

    it('should pass onPreview callback to template cards', () => {
      vi.spyOn(useTemplateHook, 'useTemplates').mockReturnValue({
        data: mockTemplatesResponse,
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      const onPreview = vi.fn();

      render(<TemplateList onPreview={onPreview} />, { wrapper: createWrapper() });

      expect(screen.getAllByText('Preview').length).toBeGreaterThan(0);
    });
  });

  describe('Filters', () => {
    it('should show filters by default', () => {
      vi.spyOn(useTemplateHook, 'useTemplates').mockReturnValue({
        data: mockTemplatesResponse,
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(<TemplateList />, { wrapper: createWrapper() });

      expect(screen.getByPlaceholderText('Search templates by name...')).toBeInTheDocument();
      // Check for select elements by their role
      const selects = screen.getAllByRole('combobox');
      expect(selects.length).toBeGreaterThanOrEqual(3);
    });

    it('should hide filters when showFilters is false', () => {
      vi.spyOn(useTemplateHook, 'useTemplates').mockReturnValue({
        data: mockTemplatesResponse,
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(<TemplateList showFilters={false} />, { wrapper: createWrapper() });

      expect(screen.queryByPlaceholderText('Search templates by name...')).not.toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('should render search input', () => {
      vi.spyOn(useTemplateHook, 'useTemplates').mockReturnValue({
        data: mockTemplatesResponse,
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(<TemplateList />, { wrapper: createWrapper() });

      const searchInput = screen.getByPlaceholderText('Search templates by name...');
      expect(searchInput).toBeInTheDocument();
    });

    it('should update search input value on change', () => {
      vi.spyOn(useTemplateHook, 'useTemplates').mockReturnValue({
        data: mockTemplatesResponse,
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(<TemplateList />, { wrapper: createWrapper() });

      const searchInput = screen.getByPlaceholderText(
        'Search templates by name...'
      ) as HTMLInputElement;
      fireEvent.change(searchInput, { target: { value: 'Master' } });

      expect(searchInput.value).toBe('Master');
    });

    it('should trigger search on button click', async () => {
      const useTemplatesSpy = vi.spyOn(useTemplateHook, 'useTemplates').mockReturnValue({
        data: mockTemplatesResponse,
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(<TemplateList />, { wrapper: createWrapper() });

      const searchInput = screen.getByPlaceholderText('Search templates by name...');
      const searchButton = screen.getByRole('button', { name: /search/i });

      fireEvent.change(searchInput, { target: { value: 'Master' } });
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(useTemplatesSpy).toHaveBeenCalled();
      });
    });

    it('should trigger search on Enter key press', async () => {
      const useTemplatesSpy = vi.spyOn(useTemplateHook, 'useTemplates').mockReturnValue({
        data: mockTemplatesResponse,
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(<TemplateList />, { wrapper: createWrapper() });

      const searchInput = screen.getByPlaceholderText('Search templates by name...');

      fireEvent.change(searchInput, { target: { value: 'Master' } });
      fireEvent.keyPress(searchInput, { key: 'Enter', code: 'Enter', charCode: 13 });

      await waitFor(() => {
        expect(useTemplatesSpy).toHaveBeenCalled();
      });
    });
  });

  describe('Type Filter', () => {
    it('should render type filter dropdown', () => {
      vi.spyOn(useTemplateHook, 'useTemplates').mockReturnValue({
        data: mockTemplatesResponse,
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      const { container } = render(<TemplateList />, { wrapper: createWrapper() });

      // Check for select comboboxes
      const selects = screen.getAllByRole('combobox');
      expect(selects.length).toBeGreaterThanOrEqual(1);
    });

    it('should call useTemplates with filters', () => {
      const useTemplatesSpy = vi.spyOn(useTemplateHook, 'useTemplates').mockReturnValue({
        data: mockTemplatesResponse,
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(<TemplateList filters={{ type: 'master' }} />, { wrapper: createWrapper() });

      expect(useTemplatesSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'master' })
      );
    });

    it('should call useTemplates with department filter', () => {
      const useTemplatesSpy = vi.spyOn(useTemplateHook, 'useTemplates').mockReturnValue({
        data: mockTemplatesResponse,
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(<TemplateList filters={{ type: 'department' }} />, { wrapper: createWrapper() });

      expect(useTemplatesSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'department' })
      );
    });

    it('should call useTemplates with custom type filter', () => {
      const useTemplatesSpy = vi.spyOn(useTemplateHook, 'useTemplates').mockReturnValue({
        data: mockTemplatesResponse,
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(<TemplateList filters={{ type: 'custom' }} />, { wrapper: createWrapper() });

      expect(useTemplatesSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'custom' })
      );
    });
  });

  describe('Status Filter', () => {
    it('should render status filter dropdown', () => {
      vi.spyOn(useTemplateHook, 'useTemplates').mockReturnValue({
        data: mockTemplatesResponse,
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      const { container } = render(<TemplateList />, { wrapper: createWrapper() });

      // Check for select comboboxes
      const selects = screen.getAllByRole('combobox');
      expect(selects.length).toBeGreaterThanOrEqual(2);
    });

    it('should call useTemplates with active status filter', () => {
      const useTemplatesSpy = vi.spyOn(useTemplateHook, 'useTemplates').mockReturnValue({
        data: mockTemplatesResponse,
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(<TemplateList filters={{ status: 'active' }} />, { wrapper: createWrapper() });

      expect(useTemplatesSpy).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'active' })
      );
    });

    it('should call useTemplates with draft status filter', () => {
      const useTemplatesSpy = vi.spyOn(useTemplateHook, 'useTemplates').mockReturnValue({
        data: mockTemplatesResponse,
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(<TemplateList filters={{ status: 'draft' }} />, { wrapper: createWrapper() });

      expect(useTemplatesSpy).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'draft' })
      );
    });
  });

  describe('Sort Functionality', () => {
    it('should render sort dropdown', () => {
      vi.spyOn(useTemplateHook, 'useTemplates').mockReturnValue({
        data: mockTemplatesResponse,
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      const { container } = render(<TemplateList />, { wrapper: createWrapper() });

      // Check for select comboboxes (type, status, sort)
      const selects = screen.getAllByRole('combobox');
      expect(selects.length).toBeGreaterThanOrEqual(3);
    });

    it('should call useTemplates with sort parameter', () => {
      const useTemplatesSpy = vi.spyOn(useTemplateHook, 'useTemplates').mockReturnValue({
        data: mockTemplatesResponse,
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(<TemplateList filters={{ sort: '-createdAt' }} />, { wrapper: createWrapper() });

      expect(useTemplatesSpy).toHaveBeenCalledWith(
        expect.objectContaining({ sort: '-createdAt' })
      );
    });

    it('should call useTemplates with usage count sort', () => {
      const useTemplatesSpy = vi.spyOn(useTemplateHook, 'useTemplates').mockReturnValue({
        data: mockTemplatesResponse,
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(<TemplateList filters={{ sort: '-usageCount' }} />, { wrapper: createWrapper() });

      expect(useTemplatesSpy).toHaveBeenCalledWith(
        expect.objectContaining({ sort: '-usageCount' })
      );
    });
  });

  describe('Pagination', () => {
    it('should display pagination info when there are multiple pages', () => {
      const paginatedResponse = {
        ...mockTemplatesResponse,
        pagination: {
          page: 1,
          limit: 2,
          total: 5,
          totalPages: 3,
          hasNext: true,
          hasPrev: false,
        },
      };

      vi.spyOn(useTemplateHook, 'useTemplates').mockReturnValue({
        data: paginatedResponse,
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(<TemplateList />, { wrapper: createWrapper() });

      expect(screen.getByText(/Showing \d+ of \d+ templates/)).toBeInTheDocument();
    });

    it('should not display pagination when total pages is 1', () => {
      vi.spyOn(useTemplateHook, 'useTemplates').mockReturnValue({
        data: mockTemplatesResponse,
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(<TemplateList />, { wrapper: createWrapper() });

      expect(screen.queryByText('Previous')).not.toBeInTheDocument();
      expect(screen.queryByText('Next')).not.toBeInTheDocument();
    });

    it('should display pagination controls when totalPages > 1', () => {
      const paginatedResponse = {
        ...mockTemplatesResponse,
        pagination: {
          page: 1,
          limit: 2,
          total: 5,
          totalPages: 3,
          hasNext: true,
          hasPrev: false,
        },
      };

      vi.spyOn(useTemplateHook, 'useTemplates').mockReturnValue({
        data: paginatedResponse,
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(<TemplateList />, { wrapper: createWrapper() });

      expect(screen.getByText('Previous')).toBeInTheDocument();
      expect(screen.getByText('Next')).toBeInTheDocument();
      expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
    });

    it('should disable Previous button on first page', () => {
      const paginatedResponse = {
        ...mockTemplatesResponse,
        pagination: {
          page: 1,
          limit: 2,
          total: 5,
          totalPages: 3,
          hasNext: true,
          hasPrev: false,
        },
      };

      vi.spyOn(useTemplateHook, 'useTemplates').mockReturnValue({
        data: paginatedResponse,
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(<TemplateList />, { wrapper: createWrapper() });

      const previousButton = screen.getByText('Previous').closest('button');
      expect(previousButton).toBeDisabled();
    });

    it('should disable Next button on last page', () => {
      const paginatedResponse = {
        ...mockTemplatesResponse,
        pagination: {
          page: 3,
          limit: 2,
          total: 5,
          totalPages: 3,
          hasNext: false,
          hasPrev: true,
        },
      };

      vi.spyOn(useTemplateHook, 'useTemplates').mockReturnValue({
        data: paginatedResponse,
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(<TemplateList />, { wrapper: createWrapper() });

      const nextButton = screen.getByText('Next').closest('button');
      expect(nextButton).toBeDisabled();
    });

    it('should enable both buttons on middle page', () => {
      const paginatedResponse = {
        ...mockTemplatesResponse,
        pagination: {
          page: 2,
          limit: 2,
          total: 5,
          totalPages: 3,
          hasNext: true,
          hasPrev: true,
        },
      };

      vi.spyOn(useTemplateHook, 'useTemplates').mockReturnValue({
        data: paginatedResponse,
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(<TemplateList />, { wrapper: createWrapper() });

      const previousButton = screen.getByText('Previous').closest('button');
      const nextButton = screen.getByText('Next').closest('button');

      expect(previousButton).not.toBeDisabled();
      expect(nextButton).not.toBeDisabled();
    });
  });

  describe('External Filters', () => {
    it('should use external filters when provided', () => {
      const externalFilters = { type: 'master' as const };

      const useTemplatesSpy = vi.spyOn(useTemplateHook, 'useTemplates').mockReturnValue({
        data: mockTemplatesResponse,
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(<TemplateList filters={externalFilters} />, { wrapper: createWrapper() });

      expect(useTemplatesSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'master' })
      );
    });

    it('should prioritize external filters over local state', () => {
      const externalFilters = { type: 'department' as const, status: 'active' as const };

      const useTemplatesSpy = vi.spyOn(useTemplateHook, 'useTemplates').mockReturnValue({
        data: mockTemplatesResponse,
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(<TemplateList filters={externalFilters} />, { wrapper: createWrapper() });

      expect(useTemplatesSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'department',
          status: 'active',
        })
      );
    });
  });

  describe('Custom className', () => {
    it('should apply custom className to container', () => {
      vi.spyOn(useTemplateHook, 'useTemplates').mockReturnValue({
        data: mockTemplatesResponse,
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      const customClass = 'custom-list-class';
      const { container } = render(<TemplateList className={customClass} />, {
        wrapper: createWrapper(),
      });

      const listContainer = container.querySelector(`.${customClass}`);
      expect(listContainer).toBeInTheDocument();
    });
  });
});
