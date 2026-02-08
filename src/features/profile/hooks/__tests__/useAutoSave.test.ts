/**
 * useAutoSave Hook Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAutoSave, useBlurSave } from '../useAutoSave';

describe('useAutoSave', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('should initialize with idle status', () => {
    const mockSave = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useAutoSave({
        data: { name: 'test' },
        onSave: mockSave,
      })
    );

    expect(result.current.status).toBe('idle');
    expect(result.current.error).toBeNull();
  });

  it.skip('should debounce save for 2 minutes by default', async () => {
    const mockSave = vi.fn().mockResolvedValue(undefined);
    const { rerender } = renderHook(
      ({ data }) =>
        useAutoSave({
          data,
          onSave: mockSave,
        }),
      { initialProps: { data: { name: 'initial' } } }
    );

    // Update data
    rerender({ data: { name: 'updated' } });

    // Should not save immediately
    expect(mockSave).not.toHaveBeenCalled();

    // Fast-forward 1 minute - should still not save
    act(() => {
      vi.advanceTimersByTime(60000);
    });
    expect(mockSave).not.toHaveBeenCalled();

    // Fast-forward another minute - should save
    act(() => {
      vi.advanceTimersByTime(60000);
    });

    await waitFor(() => {
      expect(mockSave).toHaveBeenCalledWith({ name: 'updated' });
    });
  });

  it.skip('should use custom debounce time', async () => {
    const mockSave = vi.fn().mockResolvedValue(undefined);
    const { rerender } = renderHook(
      ({ data }) =>
        useAutoSave({
          data,
          onSave: mockSave,
          debounceMs: 5000, // 5 seconds
        }),
      { initialProps: { data: { name: 'initial' } } }
    );

    // Update data
    rerender({ data: { name: 'updated' } });

    // Fast-forward 5 seconds
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    await waitFor(() => {
      expect(mockSave).toHaveBeenCalledWith({ name: 'updated' });
    });
  });

  it.skip('should not save on initial mount', async () => {
    const mockSave = vi.fn().mockResolvedValue(undefined);
    renderHook(() =>
      useAutoSave({
        data: { name: 'initial' },
        onSave: mockSave,
      })
    );

    // Fast-forward past debounce time
    act(() => {
      vi.advanceTimersByTime(120000);
    });

    await waitFor(() => {
      expect(mockSave).not.toHaveBeenCalled();
    });
  });

  it.skip('should set status to saving during save', async () => {
    let resolveSave: any;
    const mockSave = vi.fn(
      (): Promise<void> =>
        new Promise((resolve) => {
          resolveSave = resolve;
        })
    );

    const { result, rerender } = renderHook(
      ({ data }) =>
        useAutoSave({
          data,
          onSave: mockSave,
          debounceMs: 100,
        }),
      { initialProps: { data: { name: 'initial' } } }
    );

    // Update data
    rerender({ data: { name: 'updated' } });

    // Fast-forward debounce
    act(() => {
      vi.advanceTimersByTime(100);
    });

    await waitFor(() => {
      expect(result.current.status).toBe('saving');
    });

    // Resolve save
    act(() => {
      resolveSave();
    });

    await waitFor(() => {
      expect(result.current.status).toBe('saved');
    });
  });

  it.skip('should set status to error on save failure', async () => {
    const mockError = new Error('Save failed');
    const mockSave = vi.fn().mockRejectedValue(mockError);

    const { result, rerender } = renderHook(
      ({ data }) =>
        useAutoSave({
          data,
          onSave: mockSave,
          debounceMs: 100,
        }),
      { initialProps: { data: { name: 'initial' } } }
    );

    // Update data
    rerender({ data: { name: 'updated' } });

    // Fast-forward debounce
    act(() => {
      vi.advanceTimersByTime(100);
    });

    await waitFor(() => {
      expect(result.current.status).toBe('error');
      expect(result.current.error).toBe(mockError);
    });
  });

  it.skip('should reset to idle after 3 seconds of saved status', async () => {
    const mockSave = vi.fn().mockResolvedValue(undefined);

    const { result, rerender } = renderHook(
      ({ data }) =>
        useAutoSave({
          data,
          onSave: mockSave,
          debounceMs: 100,
        }),
      { initialProps: { data: { name: 'initial' } } }
    );

    // Update data
    rerender({ data: { name: 'updated' } });

    // Fast-forward debounce
    act(() => {
      vi.advanceTimersByTime(100);
    });

    await waitFor(() => {
      expect(result.current.status).toBe('saved');
    });

    // Fast-forward 3 seconds
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.status).toBe('idle');
  });

  it.skip('should not save when disabled', async () => {
    const mockSave = vi.fn().mockResolvedValue(undefined);

    const { rerender } = renderHook(
      ({ data }) =>
        useAutoSave({
          data,
          onSave: mockSave,
          debounceMs: 100,
          enabled: false,
        }),
      { initialProps: { data: { name: 'initial' } } }
    );

    // Update data
    rerender({ data: { name: 'updated' } });

    // Fast-forward debounce
    act(() => {
      vi.advanceTimersByTime(100);
    });

    await waitFor(() => {
      expect(mockSave).not.toHaveBeenCalled();
    });
  });

  it.skip('should allow manual save', async () => {
    const mockSave = vi.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useAutoSave({
        data: { name: 'test' },
        onSave: mockSave,
      })
    );

    // Manually trigger save
    await act(async () => {
      await result.current.save();
    });

    expect(mockSave).toHaveBeenCalledWith({ name: 'test' });
    expect(result.current.status).toBe('saved');
  });

  it.skip('should reset status and error', async () => {
    const mockSave = vi.fn().mockRejectedValue(new Error('Save failed'));

    const { result, rerender } = renderHook(
      ({ data }) =>
        useAutoSave({
          data,
          onSave: mockSave,
          debounceMs: 100,
        }),
      { initialProps: { data: { name: 'initial' } } }
    );

    // Update data to trigger error
    rerender({ data: { name: 'updated' } });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });

    // Reset
    act(() => {
      result.current.reset();
    });

    expect(result.current.status).toBe('idle');
    expect(result.current.error).toBeNull();
  });

  it.skip('should not save if data has not changed', async () => {
    const mockSave = vi.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useAutoSave({
        data: { name: 'test' },
        onSave: mockSave,
      })
    );

    // Manually save twice with same data
    await act(async () => {
      await result.current.save();
    });

    expect(mockSave).toHaveBeenCalledTimes(1);

    await act(async () => {
      await result.current.save();
    });

    // Should not save again since data hasn't changed
    expect(mockSave).toHaveBeenCalledTimes(1);
  });
});

describe('useBlurSave', () => {
  it('should return a blur handler function', () => {
    const mockSave = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useBlurSave(mockSave));

    expect(typeof result.current).toBe('function');
  });

  it('should call save function when invoked', async () => {
    const mockSave = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useBlurSave(mockSave));

    await act(async () => {
      await result.current();
    });

    expect(mockSave).toHaveBeenCalled();
  });
});
