/**
 * Tests for QueryProvider
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { useQuery } from '@tanstack/react-query';
import { QueryProvider, queryClient } from './QueryProvider';

// Test component that uses a query
function TestComponent() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['test'],
    queryFn: async () => {
      return { message: 'Hello World' };
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {(error as Error).message}</div>;

  return <div data-testid="result">{data?.message}</div>;
}

describe('QueryProvider', () => {
  beforeEach(() => {
    // Clear all queries before each test
    queryClient.clear();
  });

  it('should provide query client to children', async () => {
    render(
      <QueryProvider enablePersistence={false} enableDevtools={false}>
        <TestComponent />
      </QueryProvider>
    );

    // Initially loading
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByTestId('result')).toHaveTextContent('Hello World');
    });
  });

  it('should render without persistence when disabled', () => {
    const { container } = render(
      <QueryProvider enablePersistence={false} enableDevtools={false}>
        <div>Test Content</div>
      </QueryProvider>
    );

    expect(container.textContent).toContain('Test Content');
  });

  it('should render with persistence when enabled', () => {
    const { container } = render(
      <QueryProvider enablePersistence={true} enableDevtools={false}>
        <div>Test Content</div>
      </QueryProvider>
    );

    expect(container.textContent).toContain('Test Content');
  });

  it('should handle query errors', async () => {
    function ErrorComponent() {
      const { error, isLoading } = useQuery({
        queryKey: ['error-test'],
        queryFn: async () => {
          throw new Error('Test Error');
        },
        retry: false, // Disable retries for faster test
      });

      if (isLoading) return <div>Loading...</div>;
      if (error) return <div>Error: {error.message}</div>;

      return <div>Success</div>;
    }

    render(
      <QueryProvider enablePersistence={false} enableDevtools={false}>
        <ErrorComponent />
      </QueryProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Error: Test Error/)).toBeInTheDocument();
    });
  });

  it('should cache queries correctly', async () => {
    let callCount = 0;

    function CacheTestComponent() {
      const { data } = useQuery({
        queryKey: ['cache-test'],
        queryFn: async () => {
          callCount++;
          return { count: callCount };
        },
        staleTime: 60000, // Keep fresh for 1 minute
      });

      return <div data-testid="count">{data?.count || 'loading'}</div>;
    }

    const { unmount } = render(
      <QueryProvider enablePersistence={false} enableDevtools={false}>
        <CacheTestComponent />
      </QueryProvider>
    );

    // Wait for initial query
    await waitFor(() => {
      expect(screen.getByTestId('count')).toHaveTextContent('1');
    });

    // Unmount and remount
    unmount();

    render(
      <QueryProvider enablePersistence={false} enableDevtools={false}>
        <CacheTestComponent />
      </QueryProvider>
    );

    // Should use cached data, not refetch
    await waitFor(() => {
      expect(screen.getByTestId('count')).toHaveTextContent('1');
    });

    // Call count should still be 1 (used cache)
    expect(callCount).toBe(1);
  });

  it('should allow multiple queries', async () => {
    function MultiQueryComponent() {
      const query1 = useQuery({
        queryKey: ['query1'],
        queryFn: async () => ({ id: 1, name: 'First' }),
      });

      const query2 = useQuery({
        queryKey: ['query2'],
        queryFn: async () => ({ id: 2, name: 'Second' }),
      });

      if (query1.isLoading || query2.isLoading) {
        return <div>Loading...</div>;
      }

      return (
        <div>
          <div data-testid="query1">{query1.data?.name}</div>
          <div data-testid="query2">{query2.data?.name}</div>
        </div>
      );
    }

    render(
      <QueryProvider enablePersistence={false} enableDevtools={false}>
        <MultiQueryComponent />
      </QueryProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('query1')).toHaveTextContent('First');
      expect(screen.getByTestId('query2')).toHaveTextContent('Second');
    });
  });
});
