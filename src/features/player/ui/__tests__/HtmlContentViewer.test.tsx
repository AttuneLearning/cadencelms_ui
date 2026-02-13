import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HtmlContentViewer } from '../HtmlContentViewer';

vi.mock('@/entities/content', () => ({
  useContent: vi.fn(),
}));

import { useContent } from '@/entities/content';

describe('HtmlContentViewer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useContent as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: {
        title: 'Lesson 1',
        metadata: { htmlContent: '<p>Interactive content</p>' },
      },
      isLoading: false,
      error: null,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not mark viewed from idle time alone', () => {
    vi.useFakeTimers();
    const onViewed = vi.fn();

    render(<HtmlContentViewer contentId="content-1" onViewed={onViewed} />);
    vi.advanceTimersByTime(15000);

    expect(onViewed).not.toHaveBeenCalled();
  });

  it('marks viewed on learner interaction', () => {
    const onViewed = vi.fn();

    render(<HtmlContentViewer contentId="content-1" onViewed={onViewed} />);
    fireEvent.mouseDown(screen.getByTestId('html-content-viewer'));

    expect(onViewed).toHaveBeenCalledTimes(1);
  });

  it('marks viewed only once per content', () => {
    const onViewed = vi.fn();

    render(<HtmlContentViewer contentId="content-1" onViewed={onViewed} />);
    const viewer = screen.getByTestId('html-content-viewer');
    fireEvent.mouseDown(viewer);
    fireEvent.scroll(viewer);
    fireEvent.keyDown(viewer, { key: 'Enter' });

    expect(onViewed).toHaveBeenCalledTimes(1);
  });
});
