/**
 * AudioPlayer Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AudioPlayer } from '../AudioPlayer';

// Mock the content-attempt hooks
const mockDebouncedSave = vi.fn();
const mockCompleteMutate = vi.fn();

vi.mock('@/entities/content-attempt', async () => {
  const actual = await vi.importActual('@/entities/content-attempt');
  return {
    ...actual,
    useSaveVideoProgress: vi.fn(() => ({
      debouncedSave: mockDebouncedSave,
      mutate: vi.fn(),
      isPending: false,
    })),
    useCompleteContentAttempt: vi.fn(() => ({
      mutate: mockCompleteMutate,
      isPending: false,
    })),
  };
});

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

// Mock HTMLAudioElement properties
const setupAudioMock = () => {
  Object.defineProperty(window.HTMLMediaElement.prototype, 'load', {
    configurable: true,
    value: vi.fn(),
  });

  Object.defineProperty(window.HTMLMediaElement.prototype, 'play', {
    configurable: true,
    value: vi.fn().mockResolvedValue(undefined),
  });

  Object.defineProperty(window.HTMLMediaElement.prototype, 'pause', {
    configurable: true,
    value: vi.fn(),
  });

  Object.defineProperty(window.HTMLMediaElement.prototype, 'duration', {
    configurable: true,
    get() {
      return 100;
    },
  });

  Object.defineProperty(window.HTMLMediaElement.prototype, 'currentTime', {
    configurable: true,
    get() {
      return 0;
    },
    set: vi.fn(),
  });
};

describe('AudioPlayer', () => {
  beforeEach(() => {
    setupAudioMock();
    vi.clearAllMocks();
  });

  it('renders audio element with correct source', () => {
    const { container } = render(
      <AudioPlayer
        attemptId="attempt-1"
        audioUrl="https://example.com/audio.mp3"
      />,
      { wrapper: createWrapper() }
    );

    const audioElement = container.querySelector('audio[data-testid="audio-player"]');
    expect(audioElement).toBeInTheDocument();
    expect(audioElement).toHaveAttribute('src', 'https://example.com/audio.mp3');
  });

  it('displays loading state initially', async () => {
    render(
      <AudioPlayer
        attemptId="attempt-1"
        audioUrl="https://example.com/audio.mp3"
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Loading audio...')).toBeInTheDocument();
  });

  it('hides loading state after audio loads', async () => {
    const { container } = render(
      <AudioPlayer
        attemptId="attempt-1"
        audioUrl="https://example.com/audio.mp3"
      />,
      { wrapper: createWrapper() }
    );

    const audioElement = container.querySelector('audio') as HTMLAudioElement;

    // Simulate audio loading
    fireEvent.loadedMetadata(audioElement);
    fireEvent.loadedData(audioElement);

    await waitFor(() => {
      expect(screen.queryByText('Loading audio...')).not.toBeInTheDocument();
    });
  });

  it('displays play button when not playing', async () => {
    const { container } = render(
      <AudioPlayer
        attemptId="attempt-1"
        audioUrl="https://example.com/audio.mp3"
      />,
      { wrapper: createWrapper() }
    );

    const audioElement = container.querySelector('audio') as HTMLAudioElement;
    fireEvent.loadedMetadata(audioElement);
    fireEvent.loadedData(audioElement);

    await waitFor(() => {
      expect(screen.getByLabelText('Play')).toBeInTheDocument();
    });
  });

  it('displays error state on invalid URL', async () => {
    const mockOnError = vi.fn();

    render(
      <AudioPlayer
        attemptId="attempt-1"
        audioUrl=""
        onError={mockOnError}
      />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText('Error Loading Audio')).toBeInTheDocument();
      expect(screen.getByText('Invalid audio URL')).toBeInTheDocument();
    });
  });

  it('displays error state on load error', async () => {
    const mockOnError = vi.fn();

    const { container } = render(
      <AudioPlayer
        attemptId="attempt-1"
        audioUrl="https://example.com/invalid.mp3"
        onError={mockOnError}
      />,
      { wrapper: createWrapper() }
    );

    const audioElement = container.querySelector('audio') as HTMLAudioElement;
    fireEvent.error(audioElement);

    await waitFor(() => {
      expect(screen.getByText('Error Loading Audio')).toBeInTheDocument();
      expect(mockOnError).toHaveBeenCalledWith('Failed to load audio');
    });
  });

  it('saves progress on timeupdate', async () => {
    const { container } = render(
      <AudioPlayer
        attemptId="attempt-1"
        audioUrl="https://example.com/audio.mp3"
      />,
      { wrapper: createWrapper() }
    );

    const audioElement = container.querySelector('audio') as HTMLAudioElement;

    // Override currentTime for this test
    Object.defineProperty(audioElement, 'currentTime', {
      configurable: true,
      get() {
        return 50;
      },
    });

    fireEvent.loadedMetadata(audioElement);
    fireEvent.loadedData(audioElement);
    fireEvent.timeUpdate(audioElement);

    await waitFor(() => {
      expect(mockDebouncedSave).toHaveBeenCalledWith('attempt-1', 50, 50);
    });
  });

  it('triggers completion at threshold', async () => {
    const mockOnComplete = vi.fn();

    const { container } = render(
      <AudioPlayer
        attemptId="attempt-1"
        audioUrl="https://example.com/audio.mp3"
        completionThreshold={95}
        onComplete={mockOnComplete}
      />,
      { wrapper: createWrapper() }
    );

    const audioElement = container.querySelector('audio') as HTMLAudioElement;

    // Override currentTime to 95%
    Object.defineProperty(audioElement, 'currentTime', {
      configurable: true,
      get() {
        return 95;
      },
    });

    fireEvent.loadedMetadata(audioElement);
    fireEvent.loadedData(audioElement);
    fireEvent.timeUpdate(audioElement);

    await waitFor(() => {
      expect(mockCompleteMutate).toHaveBeenCalledWith({
        attemptId: 'attempt-1',
        data: {
          passed: true,
          timeSpentSeconds: 95,
        },
      });
      expect(mockOnComplete).toHaveBeenCalled();
    });
  });

  it('displays time correctly', async () => {
    const { container } = render(
      <AudioPlayer
        attemptId="attempt-1"
        audioUrl="https://example.com/audio.mp3"
      />,
      { wrapper: createWrapper() }
    );

    const audioElement = container.querySelector('audio') as HTMLAudioElement;

    Object.defineProperty(audioElement, 'duration', {
      configurable: true,
      get() {
        return 125; // 2:05
      },
    });

    fireEvent.loadedMetadata(audioElement);
    fireEvent.loadedData(audioElement);

    await waitFor(() => {
      expect(screen.getByText('0:00')).toBeInTheDocument();
      expect(screen.getByText('2:05')).toBeInTheDocument();
    });
  });

  it('calls onProgress callback with percentage', async () => {
    const mockOnProgress = vi.fn();

    const { container } = render(
      <AudioPlayer
        attemptId="attempt-1"
        audioUrl="https://example.com/audio.mp3"
        onProgress={mockOnProgress}
      />,
      { wrapper: createWrapper() }
    );

    const audioElement = container.querySelector('audio') as HTMLAudioElement;

    Object.defineProperty(audioElement, 'currentTime', {
      configurable: true,
      get() {
        return 25;
      },
    });

    fireEvent.loadedMetadata(audioElement);
    fireEvent.loadedData(audioElement);
    fireEvent.timeUpdate(audioElement);

    await waitFor(() => {
      expect(mockOnProgress).toHaveBeenCalledWith(25);
    });
  });

  it('has speed control button', async () => {
    const { container } = render(
      <AudioPlayer
        attemptId="attempt-1"
        audioUrl="https://example.com/audio.mp3"
      />,
      { wrapper: createWrapper() }
    );

    const audioElement = container.querySelector('audio') as HTMLAudioElement;
    fireEvent.loadedMetadata(audioElement);
    fireEvent.loadedData(audioElement);

    await waitFor(() => {
      expect(screen.getByText('1x')).toBeInTheDocument();
    });
  });

  it('has mute toggle button', async () => {
    const { container } = render(
      <AudioPlayer
        attemptId="attempt-1"
        audioUrl="https://example.com/audio.mp3"
      />,
      { wrapper: createWrapper() }
    );

    const audioElement = container.querySelector('audio') as HTMLAudioElement;
    fireEvent.loadedMetadata(audioElement);
    fireEvent.loadedData(audioElement);

    await waitFor(() => {
      expect(screen.getByLabelText('Toggle mute')).toBeInTheDocument();
    });
  });

  it('has seek slider', async () => {
    const { container } = render(
      <AudioPlayer
        attemptId="attempt-1"
        audioUrl="https://example.com/audio.mp3"
      />,
      { wrapper: createWrapper() }
    );

    const audioElement = container.querySelector('audio') as HTMLAudioElement;
    fireEvent.loadedMetadata(audioElement);
    fireEvent.loadedData(audioElement);

    await waitFor(() => {
      const slider = screen.getByRole('slider');
      expect(slider).toBeInTheDocument();
    });
  });
});
