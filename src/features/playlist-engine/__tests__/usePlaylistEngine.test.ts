import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePlaylistEngine } from '../model/usePlaylistEngine';
import type { StaticLearningUnit, CourseAdaptiveSettings } from '@/shared/lib/business-logic/playlist-engine';

function makeLU(overrides: Partial<StaticLearningUnit> = {}): StaticLearningUnit {
  return {
    id: 'lu-1',
    title: 'Test LU',
    type: 'media',
    contentId: 'c-1',
    category: 'topic',
    isRequired: true,
    sequence: 1,
    estimatedDuration: 10,
    ...overrides,
  };
}

const OFF_CONFIG: CourseAdaptiveSettings = {
  mode: 'off',
  allowLearnerChoice: false,
  preAssessmentEnabled: false,
};

describe('usePlaylistEngine', () => {
  it('initializes with a playlist from learning units', () => {
    const lus = [
      makeLU({ id: 'lu-1', title: 'LU 1', sequence: 1 }),
      makeLU({ id: 'lu-2', title: 'LU 2', sequence: 2 }),
      makeLU({ id: 'lu-3', title: 'LU 3', sequence: 3 }),
    ];

    const { result } = renderHook(() =>
      usePlaylistEngine({
        config: OFF_CONFIG,
        learningUnits: lus,
        enrollmentId: 'enr-1',
        moduleId: 'mod-1',
      })
    );

    expect(result.current.session.playlist).toHaveLength(3);
    expect(result.current.currentEntry).not.toBeNull();
    expect(result.current.currentEntry!.title).toBe('LU 1');
    expect(result.current.isComplete).toBe(false);
  });

  it('resolves and applies next decision (off mode = advance)', () => {
    const lus = [
      makeLU({ id: 'lu-1', title: 'LU 1', sequence: 1 }),
      makeLU({ id: 'lu-2', title: 'LU 2', sequence: 2 }),
    ];

    const { result } = renderHook(() =>
      usePlaylistEngine({
        config: OFF_CONFIG,
        learningUnits: lus,
        enrollmentId: 'enr-1',
        moduleId: 'mod-1',
      })
    );

    let decision;
    act(() => {
      decision = result.current.resolveAndApplyNext();
    });

    expect(decision).toEqual({ action: 'advance' });
    expect(result.current.currentEntry!.title).toBe('LU 2');
  });

  it('completes at the end of playlist', () => {
    const lus = [makeLU({ id: 'lu-1', title: 'Only LU', sequence: 1 })];

    const { result } = renderHook(() =>
      usePlaylistEngine({
        config: OFF_CONFIG,
        learningUnits: lus,
        enrollmentId: 'enr-1',
        moduleId: 'mod-1',
      })
    );

    let decision;
    act(() => {
      decision = result.current.resolveAndApplyNext();
    });

    expect(decision).toEqual({ action: 'complete' });
    expect(result.current.isComplete).toBe(true);
    expect(result.current.currentEntry).toBeNull();
  });

  it('navigates to index via goToIndex', () => {
    const lus = [
      makeLU({ id: 'lu-1', title: 'LU 1', sequence: 1 }),
      makeLU({ id: 'lu-2', title: 'LU 2', sequence: 2 }),
      makeLU({ id: 'lu-3', title: 'LU 3', sequence: 3 }),
    ];

    const { result } = renderHook(() =>
      usePlaylistEngine({
        config: OFF_CONFIG,
        learningUnits: lus,
        enrollmentId: 'enr-1',
        moduleId: 'mod-1',
      })
    );

    act(() => {
      result.current.goToIndex(2);
    });

    expect(result.current.currentEntry!.title).toBe('LU 3');
    expect(result.current.session.currentIndex).toBe(2);
  });

  it('provides display entries for sidebar', () => {
    const lus = [
      makeLU({ id: 'lu-1', title: 'LU 1', sequence: 1 }),
      makeLU({ id: 'lu-2', title: 'LU 2', sequence: 2 }),
    ];

    const { result } = renderHook(() =>
      usePlaylistEngine({
        config: OFF_CONFIG,
        learningUnits: lus,
        enrollmentId: 'enr-1',
        moduleId: 'mod-1',
      })
    );

    expect(result.current.displayEntries).toHaveLength(2);
    expect(result.current.displayEntries[0].isCurrent).toBe(true);
    expect(result.current.displayEntries[1].isCurrent).toBe(false);
  });

  it('handles empty learning units', () => {
    const { result } = renderHook(() =>
      usePlaylistEngine({
        config: OFF_CONFIG,
        learningUnits: [],
        enrollmentId: 'enr-1',
        moduleId: 'mod-1',
      })
    );

    expect(result.current.session.playlist).toHaveLength(0);
    expect(result.current.isComplete).toBe(true);
    expect(result.current.currentEntry).toBeNull();
  });

  it('records gate results', () => {
    const lus = [makeLU({ id: 'lu-1', sequence: 1 })];

    const { result } = renderHook(() =>
      usePlaylistEngine({
        config: OFF_CONFIG,
        learningUnits: lus,
        enrollmentId: 'enr-1',
        moduleId: 'mod-1',
      })
    );

    act(() => {
      result.current.recordGateResult({
        luId: 'lu-1',
        passed: true,
        score: 0.9,
        attemptNumber: 1,
        failedNodes: [],
      });
    });

    expect(result.current.session.gateAttempts['lu-1']).toHaveLength(1);
  });

  it('updates node progress', () => {
    const lus = [makeLU({ id: 'lu-1', sequence: 1 })];

    const { result } = renderHook(() =>
      usePlaylistEngine({
        config: OFF_CONFIG,
        learningUnits: lus,
        enrollmentId: 'enr-1',
        moduleId: 'mod-1',
      })
    );

    act(() => {
      result.current.updateNodeProgress('node-1', { mastery: 0.8, attempts: 3 });
    });

    expect(result.current.session.nodeProgress['node-1']).toEqual({
      mastery: 0.8,
      attempts: 3,
    });
  });
});
