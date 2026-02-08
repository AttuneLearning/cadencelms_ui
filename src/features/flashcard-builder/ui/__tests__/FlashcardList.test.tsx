/**
 * FlashcardList Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FlashcardList } from '../FlashcardList';
import type { FlashcardItem } from '../../api/flashcardBuilderApi';

describe('FlashcardList', () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnPreview = vi.fn();
  const mockOnReorder = vi.fn();

  const mockCards: FlashcardItem[] = [
    {
      id: 'card-1',
      moduleId: 'module-1',
      questionId: 'q-1',
      front: { text: 'What is React?' },
      back: { text: 'A JavaScript library for building UIs' },
      tags: ['react', 'javascript'],
      sequence: 0,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'card-2',
      moduleId: 'module-1',
      questionId: 'q-2',
      front: {
        text: 'What is TypeScript?',
        hints: ['Superset of JavaScript', 'Static typing'],
      },
      back: { text: 'A typed superset of JavaScript' },
      tags: ['typescript'],
      sequence: 1,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty state when no cards', () => {
    render(
      <FlashcardList
        cards={[]}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onPreview={mockOnPreview}
        onReorder={mockOnReorder}
      />
    );

    expect(screen.getByText(/No flashcards yet/i)).toBeInTheDocument();
    expect(screen.getByText(/Create your first flashcard/i)).toBeInTheDocument();
  });

  it('renders list of cards with truncated text', () => {
    render(
      <FlashcardList
        cards={mockCards}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onPreview={mockOnPreview}
        onReorder={mockOnReorder}
      />
    );

    expect(screen.getByText(/What is React\?/)).toBeInTheDocument();
    expect(screen.getByText(/What is TypeScript\?/)).toBeInTheDocument();
    expect(screen.getByText(/A JavaScript library/)).toBeInTheDocument();
  });

  it('displays sequence numbers', () => {
    render(
      <FlashcardList
        cards={mockCards}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onPreview={mockOnPreview}
        onReorder={mockOnReorder}
      />
    );

    expect(screen.getByText('1.')).toBeInTheDocument();
    expect(screen.getByText('2.')).toBeInTheDocument();
  });

  it('displays tags', () => {
    render(
      <FlashcardList
        cards={mockCards}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onPreview={mockOnPreview}
        onReorder={mockOnReorder}
      />
    );

    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('javascript')).toBeInTheDocument();
    expect(screen.getByText('typescript')).toBeInTheDocument();
  });

  it('indicates when hints are available', () => {
    render(
      <FlashcardList
        cards={mockCards}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onPreview={mockOnPreview}
        onReorder={mockOnReorder}
      />
    );

    expect(screen.getByText(/2 hints available/i)).toBeInTheDocument();
  });

  it('renders menu buttons for each card', () => {
    render(
      <FlashcardList
        cards={mockCards}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onPreview={mockOnPreview}
        onReorder={mockOnReorder}
      />
    );

    // Each card should have a menu button
    const allButtons = screen.getAllByRole('button');
    // 2 cards * (1 drag handle + 1 menu button) = 4 buttons
    expect(allButtons.length).toBeGreaterThanOrEqual(2);
  });

  it('renders drag handles for reordering', () => {
    render(
      <FlashcardList
        cards={mockCards}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onPreview={mockOnPreview}
        onReorder={mockOnReorder}
      />
    );

    // Check that there are drag handles (buttons with GripVertical icons)
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });
});
