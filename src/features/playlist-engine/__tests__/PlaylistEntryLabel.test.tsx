import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PlaylistEntryLabel } from '../ui/PlaylistEntryLabel';
import type { PlaylistDisplayEntry } from '@/shared/lib/business-logic/playlist-engine';

function makeEntry(overrides: Partial<PlaylistDisplayEntry> = {}): PlaylistDisplayEntry {
  return {
    id: 'entry-1',
    title: 'Test Entry',
    kind: 'static',
    isSkipped: false,
    isCurrent: false,
    isCompleted: false,
    isGate: false,
    ...overrides,
  };
}

describe('PlaylistEntryLabel', () => {
  it('renders static entry with plain title', () => {
    render(<PlaylistEntryLabel entry={makeEntry({ title: 'Lesson 1' })} />);
    expect(screen.getByText('Lesson 1')).toBeInTheDocument();
  });

  it('renders injected-practice entry with brain icon styling', () => {
    render(
      <PlaylistEntryLabel
        entry={makeEntry({ kind: 'injected-practice', title: 'Practice: weak areas' })}
      />
    );
    expect(screen.getByText('Practice: weak areas')).toBeInTheDocument();
  });

  it('renders injected-review entry', () => {
    render(
      <PlaylistEntryLabel
        entry={makeEntry({ kind: 'injected-review', title: 'Review: Intro to EMDR' })}
      />
    );
    expect(screen.getByText('Review: Intro to EMDR')).toBeInTheDocument();
  });

  it('renders retry entry with retry styling', () => {
    render(
      <PlaylistEntryLabel
        entry={makeEntry({ kind: 'retry', title: 'Retry: Gate (#2)' })}
      />
    );
    expect(screen.getByText('Retry: Gate (#2)')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <PlaylistEntryLabel entry={makeEntry()} className="custom-class" />
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
