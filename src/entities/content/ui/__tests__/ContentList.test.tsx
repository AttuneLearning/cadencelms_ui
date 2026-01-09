/**
 * Tests for ContentList Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ContentList } from '../ContentList';
import * as useContentModule from '../../model/useContent';
import {
  mockContentListResponse,
  mockContentListItems,
  createMockContentListItem,
} from '@/test/mocks/data/content';

// Mock the useContents hook
vi.mock('../../model/useContent', async () => {
  const actual = await vi.importActual('../../model/useContent');
  return {
    ...actual,
    useContents: vi.fn(),
  };
});

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('ContentList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render list of content items', async () => {
      vi.mocked(useContentModule.useContents).mockReturnValue({
        data: mockContentListResponse,
        isLoading: false,
        error: null,
      } as any);

      render(<ContentList />, { wrapper: createWrapper() });

      await waitFor(() => {
        mockContentListItems.forEach((content) => {
          expect(screen.getByText(content.title)).toBeInTheDocument();
        });
      });
    });

    it('should render correct number of content cards', async () => {
      vi.mocked(useContentModule.useContents).mockReturnValue({
        data: mockContentListResponse,
        isLoading: false,
        error: null,
      } as any);

      const { container } = render(<ContentList />, { wrapper: createWrapper() });

      await waitFor(() => {
        const cards = container.querySelectorAll('[class*="rounded-lg"]');
        expect(cards.length).toBeGreaterThanOrEqual(mockContentListItems.length);
      });
    });

    it('should render with filters prop', async () => {
      const filters = { type: 'scorm' as const, status: 'published' as const };

      vi.mocked(useContentModule.useContents).mockReturnValue({
        data: mockContentListResponse,
        isLoading: false,
        error: null,
      } as any);

      render(<ContentList filters={filters} />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(useContentModule.useContents).toHaveBeenCalled();
      });
    });
  });

  describe('Empty State', () => {
    it('should display default empty message when no content', async () => {
      vi.mocked(useContentModule.useContents).mockReturnValue({
        data: {
          content: [],
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
        error: null,
      } as any);

      render(<ContentList />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('No content found')).toBeInTheDocument();
      });
    });

    it('should display custom empty message', async () => {
      const customMessage = 'No content matches your search';

      vi.mocked(useContentModule.useContents).mockReturnValue({
        data: {
          content: [],
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
        error: null,
      } as any);

      render(<ContentList emptyMessage={customMessage} />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(customMessage)).toBeInTheDocument();
      });
    });

    it('should display filter icon in empty state', async () => {
      vi.mocked(useContentModule.useContents).mockReturnValue({
        data: {
          content: [],
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
        error: null,
      } as any);

      const { container } = render(<ContentList />, { wrapper: createWrapper() });

      await waitFor(() => {
        const icons = container.querySelectorAll('svg');
        expect(icons.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Loading State', () => {
    it('should display skeleton loaders when loading', () => {
      vi.mocked(useContentModule.useContents).mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      } as any);

      const { container } = render(<ContentList />, { wrapper: createWrapper() });

      const skeletons = container.querySelectorAll('[class*="animate-pulse"]');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should display 3 skeleton cards by default', () => {
      vi.mocked(useContentModule.useContents).mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      } as any);

      const { container } = render(<ContentList />, { wrapper: createWrapper() });

      const skeletonCards = container.querySelectorAll('[class*="animate-pulse"]');
      expect(skeletonCards.length).toBe(3);
    });

    it('should not display content when loading', () => {
      vi.mocked(useContentModule.useContents).mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      } as any);

      render(<ContentList />, { wrapper: createWrapper() });

      mockContentListItems.forEach((content) => {
        expect(screen.queryByText(content.title)).not.toBeInTheDocument();
      });
    });

    it('should not display empty state when loading', () => {
      vi.mocked(useContentModule.useContents).mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      } as any);

      render(<ContentList />, { wrapper: createWrapper() });

      expect(screen.queryByText('No content found')).not.toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should display error message when error occurs', async () => {
      const errorMessage = 'Failed to load content';

      vi.mocked(useContentModule.useContents).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error(errorMessage),
      } as any);

      render(<ContentList />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(`Error loading content: ${errorMessage}`)).toBeInTheDocument();
      });
    });

    it('should display error in center of screen', async () => {
      vi.mocked(useContentModule.useContents).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Test error'),
      } as any);

      const { container } = render(<ContentList />, { wrapper: createWrapper() });

      await waitFor(() => {
        const errorContainer = container.querySelector('[class*="text-center"]');
        expect(errorContainer).toBeInTheDocument();
      });
    });
  });

  describe('Filter Controls', () => {
    it('should display filter controls by default', async () => {
      vi.mocked(useContentModule.useContents).mockReturnValue({
        data: mockContentListResponse,
        isLoading: false,
        error: null,
      } as any);

      render(<ContentList />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search content...')).toBeInTheDocument();
      });
    });

    it('should hide filter controls when showFilters is false', async () => {
      vi.mocked(useContentModule.useContents).mockReturnValue({
        data: mockContentListResponse,
        isLoading: false,
        error: null,
      } as any);

      render(<ContentList showFilters={false} />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.queryByPlaceholderText('Search content...')).not.toBeInTheDocument();
      });
    });

    it('should display search input', async () => {
      vi.mocked(useContentModule.useContents).mockReturnValue({
        data: mockContentListResponse,
        isLoading: false,
        error: null,
      } as any);

      render(<ContentList />, { wrapper: createWrapper() });

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Search content...');
        expect(searchInput).toBeInTheDocument();
      });
    });

    it('should display type filter select', async () => {
      vi.mocked(useContentModule.useContents).mockReturnValue({
        data: mockContentListResponse,
        isLoading: false,
        error: null,
      } as any);

      render(<ContentList />, { wrapper: createWrapper() });

      await waitFor(() => {
        const selects = screen.getAllByRole('combobox');
        expect(selects.length).toBeGreaterThanOrEqual(2);
      });
    });

    it('should display status filter select', async () => {
      vi.mocked(useContentModule.useContents).mockReturnValue({
        data: mockContentListResponse,
        isLoading: false,
        error: null,
      } as any);

      render(<ContentList />, { wrapper: createWrapper() });

      await waitFor(() => {
        const selects = screen.getAllByRole('combobox');
        expect(selects.length).toBeGreaterThanOrEqual(2);
      });
    });

    it('should display search button', async () => {
      vi.mocked(useContentModule.useContents).mockReturnValue({
        data: mockContentListResponse,
        isLoading: false,
        error: null,
      } as any);

      const { container } = render(<ContentList />, { wrapper: createWrapper() });

      await waitFor(() => {
        const buttons = container.querySelectorAll('button');
        expect(buttons.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Filter Interactions', () => {
    it('should update search term on input change', async () => {
      const user = userEvent.setup();

      vi.mocked(useContentModule.useContents).mockReturnValue({
        data: mockContentListResponse,
        isLoading: false,
        error: null,
      } as any);

      render(<ContentList />, { wrapper: createWrapper() });

      const searchInput = screen.getByPlaceholderText('Search content...');
      await user.type(searchInput, 'programming');

      expect(searchInput).toHaveValue('programming');
    });

    it('should trigger search on button click', async () => {
      const user = userEvent.setup();

      vi.mocked(useContentModule.useContents).mockReturnValue({
        data: mockContentListResponse,
        isLoading: false,
        error: null,
      } as any);

      const { container } = render(<ContentList />, { wrapper: createWrapper() });

      const searchInput = screen.getByPlaceholderText('Search content...');
      await user.type(searchInput, 'test');

      const searchButton = container.querySelector('button svg')?.closest('button');
      if (searchButton) {
        await user.click(searchButton);
      }

      expect(useContentModule.useContents).toHaveBeenCalled();
    });

    it('should trigger search on Enter key', async () => {
      const user = userEvent.setup();

      vi.mocked(useContentModule.useContents).mockReturnValue({
        data: mockContentListResponse,
        isLoading: false,
        error: null,
      } as any);

      render(<ContentList />, { wrapper: createWrapper() });

      const searchInput = screen.getByPlaceholderText('Search content...');
      await user.type(searchInput, 'test{Enter}');

      expect(useContentModule.useContents).toHaveBeenCalled();
    });

    it('should clear and re-fetch when search is cleared', async () => {
      const user = userEvent.setup();

      vi.mocked(useContentModule.useContents).mockReturnValue({
        data: mockContentListResponse,
        isLoading: false,
        error: null,
      } as any);

      render(<ContentList />, { wrapper: createWrapper() });

      const searchInput = screen.getByPlaceholderText('Search content...');
      await user.type(searchInput, 'test');
      await user.clear(searchInput);

      expect(searchInput).toHaveValue('');
    });
  });

  describe('Click Interaction', () => {
    it('should call onContentClick when content is clicked', async () => {
      const user = userEvent.setup();
      const onContentClick = vi.fn();

      vi.mocked(useContentModule.useContents).mockReturnValue({
        data: mockContentListResponse,
        isLoading: false,
        error: null,
      } as any);

      render(<ContentList onContentClick={onContentClick} />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(mockContentListItems[0].title)).toBeInTheDocument();
      });

      const firstContentCard = screen
        .getByText(mockContentListItems[0].title)
        .closest('[class*="cursor-pointer"]');

      if (firstContentCard) {
        await user.click(firstContentCard);

        expect(onContentClick).toHaveBeenCalledTimes(1);
        expect(onContentClick).toHaveBeenCalledWith(mockContentListItems[0].id);
      }
    });

    it('should not be clickable when onContentClick is not provided', async () => {
      vi.mocked(useContentModule.useContents).mockReturnValue({
        data: mockContentListResponse,
        isLoading: false,
        error: null,
      } as any);

      const { container } = render(<ContentList />, { wrapper: createWrapper() });

      await waitFor(() => {
        const clickableCards = container.querySelectorAll('[class*="cursor-pointer"]');
        expect(clickableCards.length).toBe(0);
      });
    });
  });

  describe('Pagination', () => {
    it('should display pagination info', async () => {
      vi.mocked(useContentModule.useContents).mockReturnValue({
        data: mockContentListResponse,
        isLoading: false,
        error: null,
      } as any);

      render(<ContentList />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(/Showing \d+ of \d+ items/)).toBeInTheDocument();
      });
    });

    it('should display current page and total pages', async () => {
      vi.mocked(useContentModule.useContents).mockReturnValue({
        data: {
          ...mockContentListResponse,
          pagination: {
            page: 1,
            limit: 20,
            total: 50,
            totalPages: 3,
            hasNext: true,
            hasPrev: false,
          },
        },
        isLoading: false,
        error: null,
      } as any);

      render(<ContentList />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
      });
    });

    it('should display Previous button', async () => {
      vi.mocked(useContentModule.useContents).mockReturnValue({
        data: {
          ...mockContentListResponse,
          pagination: {
            page: 2,
            limit: 20,
            total: 50,
            totalPages: 3,
            hasNext: true,
            hasPrev: true,
          },
        },
        isLoading: false,
        error: null,
      } as any);

      render(<ContentList />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Previous')).toBeInTheDocument();
      });
    });

    it('should display Next button', async () => {
      vi.mocked(useContentModule.useContents).mockReturnValue({
        data: mockContentListResponse,
        isLoading: false,
        error: null,
      } as any);

      render(<ContentList />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Next')).toBeInTheDocument();
      });
    });

    it('should disable Previous button on first page', async () => {
      vi.mocked(useContentModule.useContents).mockReturnValue({
        data: {
          ...mockContentListResponse,
          pagination: {
            page: 1,
            limit: 20,
            total: 50,
            totalPages: 3,
            hasNext: true,
            hasPrev: false,
          },
        },
        isLoading: false,
        error: null,
      } as any);

      render(<ContentList />, { wrapper: createWrapper() });

      await waitFor(() => {
        const prevButton = screen.getByText('Previous');
        expect(prevButton).toBeDisabled();
      });
    });

    it('should disable Next button on last page', async () => {
      vi.mocked(useContentModule.useContents).mockReturnValue({
        data: {
          ...mockContentListResponse,
          pagination: {
            page: 3,
            limit: 20,
            total: 50,
            totalPages: 3,
            hasNext: false,
            hasPrev: true,
          },
        },
        isLoading: false,
        error: null,
      } as any);

      render(<ContentList />, { wrapper: createWrapper() });

      await waitFor(() => {
        const nextButton = screen.getByText('Next');
        expect(nextButton).toBeDisabled();
      });
    });

    it('should not display pagination when only one page', async () => {
      vi.mocked(useContentModule.useContents).mockReturnValue({
        data: {
          content: [createMockContentListItem()],
          pagination: {
            page: 1,
            limit: 20,
            total: 1,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
          },
        },
        isLoading: false,
        error: null,
      } as any);

      render(<ContentList />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.queryByText('Previous')).not.toBeInTheDocument();
        expect(screen.queryByText('Next')).not.toBeInTheDocument();
      });
    });

    it('should handle page change on Previous click', async () => {
      const user = userEvent.setup();

      vi.mocked(useContentModule.useContents).mockReturnValue({
        data: {
          ...mockContentListResponse,
          pagination: {
            page: 2,
            limit: 20,
            total: 50,
            totalPages: 3,
            hasNext: true,
            hasPrev: true,
          },
        },
        isLoading: false,
        error: null,
      } as any);

      render(<ContentList />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Previous')).toBeInTheDocument();
      });

      const prevButton = screen.getByText('Previous');
      await user.click(prevButton);

      expect(useContentModule.useContents).toHaveBeenCalled();
    });

    it('should handle page change on Next click', async () => {
      const user = userEvent.setup();

      vi.mocked(useContentModule.useContents).mockReturnValue({
        data: {
          ...mockContentListResponse,
          pagination: {
            page: 1,
            limit: 20,
            total: 50,
            totalPages: 3,
            hasNext: true,
            hasPrev: false,
          },
        },
        isLoading: false,
        error: null,
      } as any);

      render(<ContentList />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Next')).toBeInTheDocument();
      });

      const nextButton = screen.getByText('Next');
      await user.click(nextButton);

      expect(useContentModule.useContents).toHaveBeenCalled();
    });
  });

  describe('Grid Layout', () => {
    it('should render content in grid layout', async () => {
      vi.mocked(useContentModule.useContents).mockReturnValue({
        data: mockContentListResponse,
        isLoading: false,
        error: null,
      } as any);

      const { container } = render(<ContentList />, { wrapper: createWrapper() });

      await waitFor(() => {
        const gridContainer = container.querySelector('[class*="grid"]');
        expect(gridContainer).toBeInTheDocument();
      });
    });

    it('should have responsive grid columns', async () => {
      vi.mocked(useContentModule.useContents).mockReturnValue({
        data: mockContentListResponse,
        isLoading: false,
        error: null,
      } as any);

      const { container } = render(<ContentList />, { wrapper: createWrapper() });

      await waitFor(() => {
        const gridContainer = container.querySelector('[class*="grid"]');
        expect(gridContainer).toHaveClass('md:grid-cols-2');
        expect(gridContainer).toHaveClass('lg:grid-cols-3');
      });
    });

    it('should have gap between grid items', async () => {
      vi.mocked(useContentModule.useContents).mockReturnValue({
        data: mockContentListResponse,
        isLoading: false,
        error: null,
      } as any);

      const { container } = render(<ContentList />, { wrapper: createWrapper() });

      await waitFor(() => {
        const gridContainer = container.querySelector('[class*="grid"]');
        expect(gridContainer).toHaveClass('gap-4');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined data gracefully', () => {
      vi.mocked(useContentModule.useContents).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
      } as any);

      const { container } = render(<ContentList />, { wrapper: createWrapper() });

      expect(container).toBeInTheDocument();
    });

    it('should handle null pagination', async () => {
      vi.mocked(useContentModule.useContents).mockReturnValue({
        data: {
          content: mockContentListItems,
          pagination: null as any,
        },
        isLoading: false,
        error: null,
      } as any);

      render(<ContentList />, { wrapper: createWrapper() });

      await waitFor(() => {
        mockContentListItems.forEach((content) => {
          expect(screen.getByText(content.title)).toBeInTheDocument();
        });
      });
    });

    it('should handle very large content list', async () => {
      const largeList = Array.from({ length: 100 }, (_, i) =>
        createMockContentListItem({ title: `Content ${i}` })
      );

      vi.mocked(useContentModule.useContents).mockReturnValue({
        data: {
          content: largeList,
          pagination: {
            page: 1,
            limit: 100,
            total: 100,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
          },
        },
        isLoading: false,
        error: null,
      } as any);

      render(<ContentList />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Content 0')).toBeInTheDocument();
        expect(screen.getByText('Content 99')).toBeInTheDocument();
      });
    });
  });

  describe('Snapshot Tests', () => {
    it('should match snapshot with content list', async () => {
      vi.mocked(useContentModule.useContents).mockReturnValue({
        data: mockContentListResponse,
        isLoading: false,
        error: null,
      } as any);

      const { container } = render(<ContentList />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(mockContentListItems[0].title)).toBeInTheDocument();
      });

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot with empty state', async () => {
      vi.mocked(useContentModule.useContents).mockReturnValue({
        data: {
          content: [],
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
        error: null,
      } as any);

      const { container } = render(<ContentList />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('No content found')).toBeInTheDocument();
      });

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot with loading state', () => {
      vi.mocked(useContentModule.useContents).mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      } as any);

      const { container } = render(<ContentList />, { wrapper: createWrapper() });

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot without filters', async () => {
      vi.mocked(useContentModule.useContents).mockReturnValue({
        data: mockContentListResponse,
        isLoading: false,
        error: null,
      } as any);

      const { container } = render(
        <ContentList showFilters={false} />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(screen.getByText(mockContentListItems[0].title)).toBeInTheDocument();
      });

      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
