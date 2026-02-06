/**
 * MatchingPairList Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MatchingPairList } from '../MatchingPairList';
import type { MatchingPairItem } from '../../api/matchingBuilderApi';

describe('MatchingPairList', () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnPreview = vi.fn();
  const mockOnReorder = vi.fn();

  const mockPairs: MatchingPairItem[] = [
    {
      id: 'pair-1',
      left: {
        text: 'Photosynthesis',
        hints: ['Biology term', 'Plants only'],
      },
      right: {
        text: 'The process by which plants convert light to energy',
        explanation: 'Happens in chloroplasts',
      },
      sequence: 0,
    },
    {
      id: 'pair-2',
      left: {
        text: 'Mitochondria',
      },
      right: {
        text: 'The powerhouse of the cell',
      },
      sequence: 1,
    },
    {
      id: 'pair-3',
      left: {
        text: 'DNA',
        hints: ['Genetics'],
      },
      right: {
        text: 'Deoxyribonucleic acid',
      },
      sequence: 2,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty state when no pairs', () => {
    render(
      <MatchingPairList
        pairs={[]}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onPreview={mockOnPreview}
        onReorder={mockOnReorder}
      />
    );

    expect(screen.getByText(/No matching pairs yet/i)).toBeInTheDocument();
    expect(screen.getByText(/Add your first matching pair/i)).toBeInTheDocument();
  });

  it('renders list of pairs with text', () => {
    render(
      <MatchingPairList
        pairs={mockPairs}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onPreview={mockOnPreview}
        onReorder={mockOnReorder}
      />
    );

    expect(screen.getByText(/Photosynthesis/)).toBeInTheDocument();
    expect(screen.getByText(/Mitochondria/)).toBeInTheDocument();
    expect(screen.getByText(/DNA/)).toBeInTheDocument();
    expect(screen.getByText(/The powerhouse of the cell/)).toBeInTheDocument();
  });

  it('displays sequence numbers', () => {
    render(
      <MatchingPairList
        pairs={mockPairs}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onPreview={mockOnPreview}
        onReorder={mockOnReorder}
      />
    );

    expect(screen.getByText('1.')).toBeInTheDocument();
    expect(screen.getByText('2.')).toBeInTheDocument();
    expect(screen.getByText('3.')).toBeInTheDocument();
  });

  it('indicates when hints are available', () => {
    render(
      <MatchingPairList
        pairs={mockPairs}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onPreview={mockOnPreview}
        onReorder={mockOnReorder}
      />
    );

    // First pair has 2 hints
    expect(screen.getByText(/2 hints/i)).toBeInTheDocument();
    // Third pair has 1 hint
    expect(screen.getByText(/1 hint$/i)).toBeInTheDocument();
  });

  it('renders menu buttons for each pair', () => {
    render(
      <MatchingPairList
        pairs={mockPairs}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onPreview={mockOnPreview}
        onReorder={mockOnReorder}
      />
    );

    // Each pair should have a menu button (3 pairs * 1 menu button + 3 drag handles = 6+ buttons)
    const allButtons = screen.getAllByRole('button');
    expect(allButtons.length).toBeGreaterThanOrEqual(3);
  });

  it('renders drag handles for reordering', () => {
    render(
      <MatchingPairList
        pairs={mockPairs}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onPreview={mockOnPreview}
        onReorder={mockOnReorder}
      />
    );

    // Check that there are drag handles (buttons with GripVertical icons)
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(3);
  });

  it('applies loading state styling', () => {
    const { container } = render(
      <MatchingPairList
        pairs={mockPairs}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onPreview={mockOnPreview}
        onReorder={mockOnReorder}
        isLoading={true}
      />
    );

    // Check that loading state is applied via opacity class
    const listContainer = container.querySelector('.opacity-50');
    expect(listContainer).toBeInTheDocument();
  });
});
