/**
 * Tests for CatalogSearch Component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CatalogSearch } from '../CatalogSearch';

describe('CatalogSearch', () => {
  it('should render search input', () => {
    const onSearch = vi.fn();
    render(<CatalogSearch value="" onSearch={onSearch} />);

    expect(screen.getByPlaceholderText(/Search courses/i)).toBeInTheDocument();
  });

  it('should display current value', () => {
    const onSearch = vi.fn();
    render(<CatalogSearch value="React" onSearch={onSearch} />);

    const input = screen.getByPlaceholderText(/Search courses/i) as HTMLInputElement;
    expect(input.value).toBe('React');
  });

  it('should call onSearch when input changes', async () => {
    const onSearch = vi.fn();
    render(<CatalogSearch value="" onSearch={onSearch} />);

    const input = screen.getByPlaceholderText(/Search courses/i);
    fireEvent.change(input, { target: { value: 'TypeScript' } });

    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith('TypeScript');
    }, { timeout: 600 });
  });

  it('should debounce search input', async () => {
    vi.useFakeTimers();
    const onSearch = vi.fn();
    render(<CatalogSearch value="" onSearch={onSearch} />);

    const input = screen.getByPlaceholderText(/Search courses/i);

    fireEvent.change(input, { target: { value: 'R' } });
    fireEvent.change(input, { target: { value: 'Re' } });
    fireEvent.change(input, { target: { value: 'Rea' } });

    // Should not call immediately
    expect(onSearch).not.toHaveBeenCalled();

    // Fast forward time
    vi.advanceTimersByTime(500);

    // Wait a bit for the callback
    await vi.runAllTimersAsync();

    expect(onSearch).toHaveBeenCalledWith('Rea');
    expect(onSearch).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });

  it('should show search icon', () => {
    const onSearch = vi.fn();
    const { container } = render(<CatalogSearch value="" onSearch={onSearch} />);

    const searchIcon = container.querySelector('svg');
    expect(searchIcon).toBeInTheDocument();
  });

  it('should show clear button when value exists', () => {
    const onSearch = vi.fn();
    render(<CatalogSearch value="React" onSearch={onSearch} />);

    const clearButton = screen.getByRole('button', { name: /clear search/i });
    expect(clearButton).toBeInTheDocument();
  });

  it('should clear search when clear button clicked', () => {
    const onSearch = vi.fn();
    render(<CatalogSearch value="React" onSearch={onSearch} />);

    const clearButton = screen.getByRole('button', { name: /clear search/i });
    fireEvent.click(clearButton);

    expect(onSearch).toHaveBeenCalledWith('');
  });

  it('should not show clear button when value is empty', () => {
    const onSearch = vi.fn();
    render(<CatalogSearch value="" onSearch={onSearch} />);

    const clearButton = screen.queryByRole('button', { name: /clear search/i });
    expect(clearButton).not.toBeInTheDocument();
  });
});
