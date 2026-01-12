/**
 * VideoPlayer Component Tests
 * Tests for video content player with progress tracking
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { VideoPlayer } from '../VideoPlayer';

// Mock hooks
const mockSaveVideoProgress = vi.fn();
const mockCompleteAttempt = vi.fn();

vi.mock('@/entities/content-attempt', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/entities/content-attempt')>();
  return {
    ...actual,
    useSaveVideoProgress: () => ({
      debouncedSave: mockSaveVideoProgress,
    }),
    useCompleteContentAttempt: () => ({
      mutate: mockCompleteAttempt,
    }),
  };
});

describe('VideoPlayer', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    vi.clearAllMocks();
  });

  const renderVideoPlayer = (props = {}) => {
    const defaultProps = {
      attemptId: 'attempt-1',
      videoUrl: 'https://example.com/video.mp4',
      lastPosition: 0,
      onComplete: vi.fn(),
      onProgress: vi.fn(),
    };

    return render(
      <QueryClientProvider client={queryClient}>
        <VideoPlayer {...defaultProps} {...props} />
      </QueryClientProvider>
    );
  };

  it('should render video element with correct src', () => {
    renderVideoPlayer();

    const video = screen.getByTestId('video-player');
    expect(video).toBeInTheDocument();
    expect(video).toHaveAttribute('src', 'https://example.com/video.mp4');
  });

  it('should show loading state initially', () => {
    renderVideoPlayer();

    expect(screen.getByText(/loading video/i)).toBeInTheDocument();
  });

  it('should render video with controls', () => {
    renderVideoPlayer();

    const video = screen.getByTestId('video-player') as HTMLVideoElement;
    expect(video).toHaveAttribute('controls');
    expect(video).toHaveAttribute('controlslist', 'nodownload');
  });

  it('should have proper video classes', () => {
    renderVideoPlayer();

    const video = screen.getByTestId('video-player');
    expect(video).toHaveClass('h-full', 'w-full');
  });

  it('should render custom controls', () => {
    renderVideoPlayer();

    // Check for playback speed button
    expect(screen.getByRole('button', { name: /1x/i })).toBeInTheDocument();

    // Check for mute button
    expect(screen.getByLabelText(/toggle mute/i)).toBeInTheDocument();

    // Check for fullscreen button
    expect(screen.getByLabelText(/fullscreen/i)).toBeInTheDocument();
  });

  it('should display time format (initially 0:00 / 0:00)', () => {
    renderVideoPlayer();

    // Should display time - defaults to 0 (there are two: current and duration)
    const timeDisplays = screen.getAllByText('0:00');
    expect(timeDisplays.length).toBeGreaterThanOrEqual(2);
  });

  it('should handle invalid video URL', () => {
    renderVideoPlayer({ videoUrl: '' });

    expect(screen.getByText(/invalid video url/i)).toBeInTheDocument();
  });

  it('should display error message on video load error', async () => {
    const { findAllByText } = renderVideoPlayer({ videoUrl: 'invalid-url' });

    const video = screen.getByTestId('video-player');

    // Trigger error event
    const errorEvent = new Event('error');
    video.dispatchEvent(errorEvent);

    // Wait for error message to appear (there are multiple matching elements)
    const errorMessages = await findAllByText(/error loading video/i);
    expect(errorMessages.length).toBeGreaterThan(0);
  });

  it('should have progress bar', () => {
    const { container } = renderVideoPlayer();

    // Check for progress bar element
    const progressBar = container.querySelector('.h-1.w-full.rounded-full.bg-white\\/30');
    expect(progressBar).toBeInTheDocument();
  });

  it('should render player in black background container', () => {
    const { container } = renderVideoPlayer();

    const playerContainer = container.querySelector('.relative.h-full.w-full.bg-black');
    expect(playerContainer).toBeInTheDocument();
  });

  it('should have gradient controls overlay', () => {
    const { container } = renderVideoPlayer();

    const controlsOverlay = container.querySelector('.bg-gradient-to-t.from-black\\/80');
    expect(controlsOverlay).toBeInTheDocument();
  });
});
