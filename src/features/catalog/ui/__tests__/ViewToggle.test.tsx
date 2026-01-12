/**
 * Tests for ViewToggle Component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ViewToggle } from '../ViewToggle';

describe('ViewToggle', () => {
  it('should render grid and list view buttons', () => {
    const onViewChange = vi.fn();
    render(<ViewToggle view="grid" onViewChange={onViewChange} />);

    expect(screen.getByRole('button', { name: /grid view/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /list view/i })).toBeInTheDocument();
  });

  it('should highlight grid view when active', () => {
    const onViewChange = vi.fn();
    render(<ViewToggle view="grid" onViewChange={onViewChange} />);

    const gridButton = screen.getByRole('button', { name: /grid view/i });
    expect(gridButton).toHaveAttribute('data-active', 'true');
  });

  it('should highlight list view when active', () => {
    const onViewChange = vi.fn();
    render(<ViewToggle view="list" onViewChange={onViewChange} />);

    const listButton = screen.getByRole('button', { name: /list view/i });
    expect(listButton).toHaveAttribute('data-active', 'true');
  });

  it('should call onViewChange when grid button clicked', () => {
    const onViewChange = vi.fn();
    render(<ViewToggle view="list" onViewChange={onViewChange} />);

    const gridButton = screen.getByRole('button', { name: /grid view/i });
    fireEvent.click(gridButton);

    expect(onViewChange).toHaveBeenCalledWith('grid');
  });

  it('should call onViewChange when list button clicked', () => {
    const onViewChange = vi.fn();
    render(<ViewToggle view="grid" onViewChange={onViewChange} />);

    const listButton = screen.getByRole('button', { name: /list view/i });
    fireEvent.click(listButton);

    expect(onViewChange).toHaveBeenCalledWith('list');
  });
});
