/**
 * ScormPlayer Component Tests
 * Tests for SCORM content player with API integration
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ScormPlayer } from '../ScormPlayer';

// Mock the SCORM API
vi.mock('@/shared/lib/scorm/scormApi', () => {
  return {
    ScormAPI: vi.fn(function () {
      return {
        initialize: vi.fn(),
        destroy: vi.fn(),
        updateSessionTime: vi.fn(),
        getAllData: vi.fn(() => ({})),
        isInitialized: vi.fn(() => true),
      };
    }),
  };
});

// Mock hooks
const mockUpdateAttempt = vi.fn();
const mockCompleteAttempt = vi.fn();
const mockSaveScormData = vi.fn();

vi.mock('@/entities/content-attempt', () => ({
  useUpdateContentAttempt: () => ({
    mutate: mockUpdateAttempt,
    debouncedMutate: mockUpdateAttempt,
  }),
  useCompleteContentAttempt: () => ({
    mutate: mockCompleteAttempt,
  }),
  useSaveScormData: () => ({
    mutate: mockSaveScormData,
  }),
}));

describe('ScormPlayer', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Clear all mocks
    vi.clearAllMocks();

    // Mock window.addEventListener for beforeunload
    window.addEventListener = vi.fn();
    window.removeEventListener = vi.fn();
  });

  const renderScormPlayer = (props = {}) => {
    const defaultProps = {
      attemptId: 'attempt-1',
      scormUrl: 'https://example.com/scorm/index.html',
      scormVersion: '1.2' as const,
      savedData: {},
      onComplete: vi.fn(),
      onError: vi.fn(),
    };

    return render(
      <QueryClientProvider client={queryClient}>
        <ScormPlayer {...defaultProps} {...props} />
      </QueryClientProvider>
    );
  };

  it('should render loading state initially', () => {
    renderScormPlayer();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should render iframe with correct src', async () => {
    renderScormPlayer();

    await waitFor(() => {
      const iframe = screen.getByTitle('SCORM Content');
      expect(iframe).toBeInTheDocument();
      expect(iframe).toHaveAttribute('src', 'https://example.com/scorm/index.html');
    });
  });

  it('should initialize SCORM API on mount', async () => {
    const { ScormAPI } = await import('@/shared/lib/scorm/scormApi');
    renderScormPlayer();

    await waitFor(() => {
      expect(ScormAPI).toHaveBeenCalledWith('1.2', expect.any(Object));
    });
  });

  it('should handle SCORM 2004 version', async () => {
    const { ScormAPI } = await import('@/shared/lib/scorm/scormApi');
    renderScormPlayer({ scormVersion: '2004' });

    await waitFor(() => {
      expect(ScormAPI).toHaveBeenCalledWith('2004', expect.any(Object));
    });
  });

  it('should restore saved data', async () => {
    const savedData = {
      'cmi.core.lesson_status': 'incomplete',
      'cmi.core.score.raw': '75',
    };

    const { ScormAPI } = await import('@/shared/lib/scorm/scormApi');
    renderScormPlayer({ savedData });

    await waitFor(() => {
      expect(ScormAPI).toHaveBeenCalledWith(
        '1.2',
        expect.objectContaining({
          savedData,
        })
      );
    });
  });

  it('should call onComplete when SCORM terminates with completed status', async () => {
    const onComplete = vi.fn();
    let terminateCallback: ((data: Record<string, string>) => void) | undefined;

    const { ScormAPI } = await import('@/shared/lib/scorm/scormApi');
    (ScormAPI as any).mockImplementation(function (_version: string, options: any) {
      terminateCallback = options.onTerminate;
      return {
        initialize: vi.fn(),
        destroy: vi.fn(),
        updateSessionTime: vi.fn(),
        getAllData: vi.fn(() => ({})),
        isInitialized: vi.fn(() => true),
      };
    });

    renderScormPlayer({ onComplete });

    await waitFor(() => {
      expect(ScormAPI).toHaveBeenCalled();
    });

    // Simulate SCORM termination with completed status
    if (terminateCallback) {
      terminateCallback({
        'cmi.core.lesson_status': 'completed',
        'cmi.core.score.raw': '85',
      });
    }

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalled();
    });
  });

  it('should auto-save SCORM data on commit', async () => {
    let commitCallback: ((data: Record<string, string>) => void) | undefined;

    const { ScormAPI } = await import('@/shared/lib/scorm/scormApi');
    (ScormAPI as any).mockImplementation(function (_version: string, options: any) {
      commitCallback = options.onCommit;
      return {
        initialize: vi.fn(),
        destroy: vi.fn(),
        updateSessionTime: vi.fn(),
        getAllData: vi.fn(() => ({})),
        isInitialized: vi.fn(() => true),
      };
    });

    renderScormPlayer();

    await waitFor(() => {
      expect(ScormAPI).toHaveBeenCalled();
    });

    // Simulate SCORM commit
    if (commitCallback) {
      commitCallback({
        'cmi.core.lesson_status': 'incomplete',
        'cmi.suspend_data': 'page=5',
      });
    }

    await waitFor(() => {
      expect(mockSaveScormData).toHaveBeenCalledWith(
        expect.objectContaining({
          attemptId: 'attempt-1',
          data: expect.objectContaining({
            cmiData: expect.any(Object),
          }),
        })
      );
    });
  });

  it('should handle SCORM errors', async () => {
    const onError = vi.fn();
    let errorCallback: ((error: any) => void) | undefined;

    const { ScormAPI } = await import('@/shared/lib/scorm/scormApi');
    (ScormAPI as any).mockImplementation(function (_version: string, options: any) {
      errorCallback = options.onError;
      return {
        initialize: vi.fn(),
        destroy: vi.fn(),
        updateSessionTime: vi.fn(),
        getAllData: vi.fn(() => ({})),
        isInitialized: vi.fn(() => true),
      };
    });

    renderScormPlayer({ onError });

    await waitFor(() => {
      expect(ScormAPI).toHaveBeenCalled();
    });

    // Simulate SCORM error
    if (errorCallback) {
      errorCallback({
        errorCode: '101',
        errorMessage: 'General exception',
      });
    }

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          errorCode: '101',
          errorMessage: 'General exception',
        })
      );
    });
  });

  it('should save data on page unload', async () => {
    renderScormPlayer();

    await waitFor(() => {
      expect(window.addEventListener).toHaveBeenCalledWith(
        'beforeunload',
        expect.any(Function)
      );
    });
  });

  it('should clean up SCORM API on unmount', async () => {
    let destroyFn: any;

    const { ScormAPI } = await import('@/shared/lib/scorm/scormApi');
    (ScormAPI as any).mockImplementation(function () {
      destroyFn = vi.fn();
      return {
        initialize: vi.fn(),
        destroy: destroyFn,
        updateSessionTime: vi.fn(),
        getAllData: vi.fn(() => ({})),
        isInitialized: vi.fn(() => true),
      };
    });

    const { unmount } = renderScormPlayer();

    await waitFor(() => {
      expect(ScormAPI).toHaveBeenCalled();
    });

    unmount();

    expect(destroyFn).toHaveBeenCalled();
  });

  it('should display error message when URL is invalid', () => {
    renderScormPlayer({ scormUrl: '' });

    expect(screen.getByText(/invalid scorm url/i)).toBeInTheDocument();
  });

  it('should render iframe with proper attributes', async () => {
    renderScormPlayer();

    const iframe = await screen.findByTitle('SCORM Content');

    expect(iframe).toHaveAttribute('allow', 'autoplay; fullscreen');
    expect(iframe).toHaveAttribute(
      'sandbox',
      'allow-same-origin allow-scripts allow-forms allow-popups allow-modals'
    );
    expect(iframe).toHaveClass('h-full', 'w-full', 'border-0');
  });

  it('should update progress when lesson status changes', async () => {
    let commitCallback: ((data: Record<string, string>) => void) | undefined;

    const { ScormAPI } = await import('@/shared/lib/scorm/scormApi');
    (ScormAPI as any).mockImplementation(function (_version: string, options: any) {
      commitCallback = options.onCommit;
      return {
        initialize: vi.fn(),
        destroy: vi.fn(),
        updateSessionTime: vi.fn(),
        getAllData: vi.fn(() => ({})),
        isInitialized: vi.fn(() => true),
      };
    });

    renderScormPlayer();

    await waitFor(() => {
      expect(ScormAPI).toHaveBeenCalled();
    });

    // Simulate progress update
    if (commitCallback) {
      commitCallback({
        'cmi.core.lesson_status': 'incomplete',
        'cmi.core.score.raw': '50',
      });
    }

    await waitFor(() => {
      expect(mockSaveScormData).toHaveBeenCalled();
    });
  });

  it('should pass learner info to SCORM API', async () => {
    const { ScormAPI } = await import('@/shared/lib/scorm/scormApi');
    renderScormPlayer({
      learnerId: 'learner-123',
      learnerName: 'John Doe',
    });

    await waitFor(() => {
      expect(ScormAPI).toHaveBeenCalledWith(
        '1.2',
        expect.objectContaining({
          learnerId: 'learner-123',
          learnerName: 'John Doe',
        })
      );
    });
  });

  it('should enable auto-save with 30 second interval', async () => {
    const { ScormAPI } = await import('@/shared/lib/scorm/scormApi');
    renderScormPlayer();

    await waitFor(() => {
      expect(ScormAPI).toHaveBeenCalledWith(
        '1.2',
        expect.objectContaining({
          autoSaveInterval: 30000,
        })
      );
    });
  });
});
