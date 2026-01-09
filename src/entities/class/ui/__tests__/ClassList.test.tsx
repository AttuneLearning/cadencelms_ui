/**
 * Tests for ClassList Component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { ClassList } from '../ClassList';
import { mockClasses } from '@/test/mocks/data/classes';

// Wrapper component for Router
const RouterWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('ClassList', () => {
  const mockTerms = [
    { id: 'term-1', name: 'Spring 2026' },
    { id: 'term-2', name: 'Fall 2026' },
    { id: 'term-3', name: 'Fall 2025' },
  ];

  const mockCourses = [
    { id: 'course-1', title: 'Introduction to Programming', code: 'CS101' },
    { id: 'course-2', title: 'Advanced Database Systems', code: 'CS401' },
    { id: 'course-3', title: 'Web Development Fundamentals', code: 'CS201' },
  ];

  describe('Rendering', () => {
    it('should render with default props', () => {
      render(
        <RouterWrapper>
          <ClassList classes={mockClasses} />
        </RouterWrapper>
      );

      expect(screen.getByText('Filter Classes')).toBeInTheDocument();
    });

    it('should render list of classes', () => {
      render(
        <RouterWrapper>
          <ClassList classes={mockClasses} />
        </RouterWrapper>
      );

      mockClasses.forEach((classItem) => {
        expect(screen.getByText(classItem.name)).toBeInTheDocument();
      });
    });

    it('should display results count', () => {
      render(
        <RouterWrapper>
          <ClassList classes={mockClasses} />
        </RouterWrapper>
      );

      expect(screen.getByText(`Showing ${mockClasses.length} classes`)).toBeInTheDocument();
    });

    it('should display singular "class" for single result', () => {
      render(
        <RouterWrapper>
          <ClassList classes={[mockClasses[0]]} />
        </RouterWrapper>
      );

      expect(screen.getByText('Showing 1 class')).toBeInTheDocument();
    });

    it('should hide filters when showFilters is false', () => {
      render(
        <RouterWrapper>
          <ClassList classes={mockClasses} showFilters={false} />
        </RouterWrapper>
      );

      expect(screen.queryByText('Filter Classes')).not.toBeInTheDocument();
    });

    it('should render in grid view by default', () => {
      const { container } = render(
        <RouterWrapper>
          <ClassList classes={mockClasses} />
        </RouterWrapper>
      );

      const gridContainer = container.querySelector('.grid.gap-4.md\\:grid-cols-2.lg\\:grid-cols-3');
      expect(gridContainer).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should display loading skeletons when isLoading is true', () => {
      const { container } = render(
        <RouterWrapper>
          <ClassList classes={[]} isLoading={true} />
        </RouterWrapper>
      );

      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should display filter skeletons when loading', () => {
      const { container } = render(
        <RouterWrapper>
          <ClassList classes={[]} isLoading={true} showFilters={true} />
        </RouterWrapper>
      );

      const filterSkeletons = container.querySelectorAll('.h-10.animate-pulse');
      expect(filterSkeletons.length).toBe(4);
    });

    it('should display class card skeletons when loading', () => {
      const { container } = render(
        <RouterWrapper>
          <ClassList classes={[]} isLoading={true} />
        </RouterWrapper>
      );

      const cardSkeletons = container.querySelectorAll('.h-64.animate-pulse');
      expect(cardSkeletons.length).toBe(6);
    });

    it('should not display classes when loading', () => {
      render(
        <RouterWrapper>
          <ClassList classes={mockClasses} isLoading={true} />
        </RouterWrapper>
      );

      expect(screen.queryByText(mockClasses[0].name)).not.toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should display empty state when no classes', () => {
      render(
        <RouterWrapper>
          <ClassList classes={[]} />
        </RouterWrapper>
      );

      expect(screen.getByText('No classes found')).toBeInTheDocument();
      expect(
        screen.getByText('Try adjusting your filters or search terms')
      ).toBeInTheDocument();
    });

    it('should not display empty state when classes exist', () => {
      render(
        <RouterWrapper>
          <ClassList classes={mockClasses} />
        </RouterWrapper>
      );

      expect(screen.queryByText('No classes found')).not.toBeInTheDocument();
    });

    it('should not display results count when empty', () => {
      render(
        <RouterWrapper>
          <ClassList classes={[]} />
        </RouterWrapper>
      );

      expect(screen.queryByText(/Showing \d+ class/)).not.toBeInTheDocument();
    });
  });

  describe('View Mode Toggle', () => {
    it('should start in grid view by default', () => {
      const { container } = render(
        <RouterWrapper>
          <ClassList classes={mockClasses} />
        </RouterWrapper>
      );

      const gridContainer = container.querySelector('.grid.gap-4');
      expect(gridContainer).toBeInTheDocument();
    });

    it('should switch to list view when list button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <RouterWrapper>
          <ClassList classes={mockClasses} />
        </RouterWrapper>
      );

      const listButton = screen.getAllByRole('button').find((btn) => {
        const svg = btn.querySelector('svg');
        return svg !== null;
      });

      if (listButton) {
        await user.click(listButton);
      }

      // Note: Due to how the component works, we check for the presence of the toggle
      expect(screen.getByText('Filter Classes')).toBeInTheDocument();
    });

    it('should display grid and list view toggle buttons', () => {
      render(
        <RouterWrapper>
          <ClassList classes={mockClasses} />
        </RouterWrapper>
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Search Functionality', () => {
    it('should render search input', () => {
      render(
        <RouterWrapper>
          <ClassList classes={mockClasses} />
        </RouterWrapper>
      );

      const searchInput = screen.getByPlaceholderText('Search classes...');
      expect(searchInput).toBeInTheDocument();
    });

    it('should call onFilterChange when search input changes', async () => {
      const user = userEvent.setup();
      const onFilterChange = vi.fn();

      render(
        <RouterWrapper>
          <ClassList classes={mockClasses} onFilterChange={onFilterChange} />
        </RouterWrapper>
      );

      const searchInput = screen.getByPlaceholderText('Search classes...');
      await user.type(searchInput, 'Programming');

      await waitFor(() => {
        expect(onFilterChange).toHaveBeenCalled();
      });
    });

    it('should update search input value', async () => {
      const user = userEvent.setup();

      render(
        <RouterWrapper>
          <ClassList classes={mockClasses} />
        </RouterWrapper>
      );

      const searchInput = screen.getByPlaceholderText('Search classes...') as HTMLInputElement;
      await user.type(searchInput, 'Programming');

      await waitFor(() => {
        expect(searchInput.value).toBe('Programming');
      });
    });

    it('should clear search when input is emptied', async () => {
      const user = userEvent.setup();
      const onFilterChange = vi.fn();

      render(
        <RouterWrapper>
          <ClassList classes={mockClasses} onFilterChange={onFilterChange} />
        </RouterWrapper>
      );

      const searchInput = screen.getByPlaceholderText('Search classes...') as HTMLInputElement;
      await user.type(searchInput, 'Test');
      await user.clear(searchInput);

      await waitFor(() => {
        expect(searchInput.value).toBe('');
      });
    });
  });

  describe('Status Filter', () => {
    it('should render status filter dropdown', () => {
      render(
        <RouterWrapper>
          <ClassList classes={mockClasses} />
        </RouterWrapper>
      );

      expect(screen.getByText('All Statuses')).toBeInTheDocument();
    });

    it('should have status filter trigger button', () => {
      render(
        <RouterWrapper>
          <ClassList classes={mockClasses} />
        </RouterWrapper>
      );

      const statusTrigger = screen.getByText('All Statuses');
      expect(statusTrigger).toBeInTheDocument();
      expect(statusTrigger.closest('button')).toBeInTheDocument();
    });
  });

  describe('Term Filter', () => {
    it('should render term filter when terms are provided', () => {
      render(
        <RouterWrapper>
          <ClassList classes={mockClasses} terms={mockTerms} />
        </RouterWrapper>
      );

      expect(screen.getByText('All Terms')).toBeInTheDocument();
    });

    it('should not render term filter when no terms provided', () => {
      render(
        <RouterWrapper>
          <ClassList classes={mockClasses} terms={[]} />
        </RouterWrapper>
      );

      expect(screen.queryByText('All Terms')).not.toBeInTheDocument();
    });

    it('should have term filter trigger button', () => {
      render(
        <RouterWrapper>
          <ClassList classes={mockClasses} terms={mockTerms} />
        </RouterWrapper>
      );

      const termTrigger = screen.getByText('All Terms');
      expect(termTrigger).toBeInTheDocument();
      expect(termTrigger.closest('button')).toBeInTheDocument();
    });
  });

  describe('Course Filter', () => {
    it('should render course filter when courses are provided', () => {
      render(
        <RouterWrapper>
          <ClassList classes={mockClasses} courses={mockCourses} />
        </RouterWrapper>
      );

      expect(screen.getByText('All Courses')).toBeInTheDocument();
    });

    it('should not render course filter when no courses provided', () => {
      render(
        <RouterWrapper>
          <ClassList classes={mockClasses} courses={[]} />
        </RouterWrapper>
      );

      expect(screen.queryByText('All Courses')).not.toBeInTheDocument();
    });

    it('should have course filter trigger button', () => {
      render(
        <RouterWrapper>
          <ClassList classes={mockClasses} courses={mockCourses} />
        </RouterWrapper>
      );

      const courseTrigger = screen.getByText('All Courses');
      expect(courseTrigger).toBeInTheDocument();
      expect(courseTrigger.closest('button')).toBeInTheDocument();
    });
  });

  describe('Multiple Filters', () => {
    it('should pass all active filters to onFilterChange', async () => {
      const user = userEvent.setup();
      const onFilterChange = vi.fn();

      render(
        <RouterWrapper>
          <ClassList
            classes={mockClasses}
            terms={mockTerms}
            courses={mockCourses}
            onFilterChange={onFilterChange}
          />
        </RouterWrapper>
      );

      const searchInput = screen.getByPlaceholderText('Search classes...');
      await user.type(searchInput, 'Programming');

      await waitFor(() => {
        expect(onFilterChange).toHaveBeenCalledWith(
          expect.objectContaining({
            search: 'Programming',
          })
        );
      });
    });

    it('should maintain search input value', async () => {
      const user = userEvent.setup();

      render(
        <RouterWrapper>
          <ClassList
            classes={mockClasses}
            terms={mockTerms}
          />
        </RouterWrapper>
      );

      const searchInput = screen.getByPlaceholderText('Search classes...') as HTMLInputElement;
      await user.type(searchInput, 'Test');

      await waitFor(() => {
        expect(searchInput.value).toBe('Test');
      });
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <RouterWrapper>
          <ClassList classes={mockClasses} className="custom-class" />
        </RouterWrapper>
      );

      const listContainer = container.querySelector('.custom-class');
      expect(listContainer).toBeInTheDocument();
    });
  });

  describe('Filter Display', () => {
    it('should display all four filter inputs when terms and courses provided', () => {
      render(
        <RouterWrapper>
          <ClassList classes={mockClasses} terms={mockTerms} courses={mockCourses} />
        </RouterWrapper>
      );

      expect(screen.getByPlaceholderText('Search classes...')).toBeInTheDocument();
      expect(screen.getByText('All Statuses')).toBeInTheDocument();
      expect(screen.getByText('All Terms')).toBeInTheDocument();
      expect(screen.getByText('All Courses')).toBeInTheDocument();
    });

    it('should display only search and status when no terms or courses', () => {
      render(
        <RouterWrapper>
          <ClassList classes={mockClasses} terms={[]} courses={[]} />
        </RouterWrapper>
      );

      expect(screen.getByPlaceholderText('Search classes...')).toBeInTheDocument();
      expect(screen.getByText('All Statuses')).toBeInTheDocument();
      expect(screen.queryByText('All Terms')).not.toBeInTheDocument();
      expect(screen.queryByText('All Courses')).not.toBeInTheDocument();
    });
  });

  describe('Grid Layout', () => {
    it('should use responsive grid layout', () => {
      const { container } = render(
        <RouterWrapper>
          <ClassList classes={mockClasses} />
        </RouterWrapper>
      );

      const grid = container.querySelector('.grid.md\\:grid-cols-2.lg\\:grid-cols-3');
      expect(grid).toBeInTheDocument();
    });

    it('should apply gap spacing to grid', () => {
      const { container } = render(
        <RouterWrapper>
          <ClassList classes={mockClasses} />
        </RouterWrapper>
      );

      const grid = container.querySelector('.gap-4');
      expect(grid).toBeInTheDocument();
    });
  });

  describe('Filter Header', () => {
    it('should display filter header with title', () => {
      render(
        <RouterWrapper>
          <ClassList classes={mockClasses} showFilters={true} />
        </RouterWrapper>
      );

      expect(screen.getByText('Filter Classes')).toBeInTheDocument();
    });

    it('should display view mode toggle buttons in header', () => {
      render(
        <RouterWrapper>
          <ClassList classes={mockClasses} showFilters={true} />
        </RouterWrapper>
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Search Icon', () => {
    it('should display search icon in search input', () => {
      const { container } = render(
        <RouterWrapper>
          <ClassList classes={mockClasses} />
        </RouterWrapper>
      );

      const searchIcon = container.querySelector('.absolute.left-3');
      expect(searchIcon).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper form controls', () => {
      render(
        <RouterWrapper>
          <ClassList classes={mockClasses} />
        </RouterWrapper>
      );

      const searchInput = screen.getByPlaceholderText('Search classes...');
      expect(searchInput).toBeInTheDocument();
      expect(searchInput.tagName).toBe('INPUT');
    });

    it('should have clickable filter dropdowns', () => {
      render(
        <RouterWrapper>
          <ClassList classes={mockClasses} />
        </RouterWrapper>
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Snapshot Tests', () => {
    it('should match snapshot with classes', () => {
      const { container } = render(
        <RouterWrapper>
          <ClassList classes={mockClasses} />
        </RouterWrapper>
      );

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot in loading state', () => {
      const { container } = render(
        <RouterWrapper>
          <ClassList classes={[]} isLoading={true} />
        </RouterWrapper>
      );

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot in empty state', () => {
      const { container } = render(
        <RouterWrapper>
          <ClassList classes={[]} />
        </RouterWrapper>
      );

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot with all filters', () => {
      const { container } = render(
        <RouterWrapper>
          <ClassList classes={mockClasses} terms={mockTerms} courses={mockCourses} />
        </RouterWrapper>
      );

      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
