import { describe, it, expect } from 'vitest';
import { FullStrategy } from '../strategies/full-strategy';
import type {
  PlaylistContext,
  StaticPlaylistEntry,
  StaticLearningUnit,
  GateResult,
  NodeProgress,
} from '../types';

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

function makeGateLU(
  id: string,
  overrides: {
    failStrategy?: 'allow-continue' | 'hold' | 'inject-practice' | 'prescribe-review';
    maxRetries?: number;
    assessesNodes?: string[];
    teachesNodes?: string[];
  } = {}
): StaticLearningUnit {
  const {
    failStrategy = 'hold',
    maxRetries = 2,
    assessesNodes = ['node-1'],
    teachesNodes = [],
  } = overrides;
  return makeLU({
    id,
    title: `Gate: ${id}`,
    adaptive: {
      teachesNodes,
      assessesNodes,
      isGate: true,
      isSkippable: false,
      gateConfig: {
        masteryThreshold: 0.8,
        minQuestions: 3,
        maxRetries,
        failStrategy,
      },
    },
  });
}

function makeSkippableLU(id: string, teachesNodes: string[]): StaticLearningUnit {
  return makeLU({
    id,
    title: `Skippable: ${id}`,
    adaptive: {
      teachesNodes,
      assessesNodes: [],
      isGate: false,
      isSkippable: true,
    },
  });
}

function makeTeachingLU(id: string, teachesNodes: string[]): StaticLearningUnit {
  return makeLU({
    id,
    title: `Teaching: ${id}`,
    adaptive: {
      teachesNodes,
      assessesNodes: [],
      isGate: false,
      isSkippable: false,
    },
  });
}

function makeEntry(lu: StaticLearningUnit): StaticPlaylistEntry {
  return { kind: 'static', entryId: `static-${lu.id}`, title: lu.title, lu };
}

function makeContext(overrides: Partial<PlaylistContext> = {}): PlaylistContext {
  return {
    staticSequence: [],
    playlist: [],
    currentIndex: 0,
    nodeProgress: {},
    gateResults: {},
    adaptiveConfig: { mode: 'full', allowLearnerChoice: false, preAssessmentEnabled: false },
    ...overrides,
  };
}

function makeGateResult(luId: string, passed: boolean, failedNodes: string[] = []): GateResult {
  return {
    luId,
    passed,
    score: passed ? 0.9 : 0.4,
    attemptNumber: 1,
    failedNodes,
  };
}

function masteredProgress(mastery: number): NodeProgress {
  return { mastery, attempts: 5 };
}

describe('FullStrategy', () => {
  const strategy = new FullStrategy();

  // --- Skip logic ---

  describe('skip behavior', () => {
    it('skips when all teachesNodes are mastered above threshold', () => {
      const lu = makeSkippableLU('skip-1', ['node-a', 'node-b']);
      const ctx = makeContext({
        playlist: [makeEntry(lu), makeEntry(makeLU({ id: 'lu-2' }))],
        currentIndex: 0,
        nodeProgress: {
          'node-a': masteredProgress(0.85),
          'node-b': masteredProgress(0.75),
        },
      });

      const decision = strategy.resolveNext(ctx);
      expect(decision.action).toBe('skip');
      if (decision.action === 'skip') {
        expect(decision.reason).toContain('70%');
      }
    });

    it('does not skip when some nodes are below threshold', () => {
      const lu = makeSkippableLU('skip-1', ['node-a', 'node-b']);
      const ctx = makeContext({
        playlist: [makeEntry(lu), makeEntry(makeLU({ id: 'lu-2' }))],
        currentIndex: 0,
        nodeProgress: {
          'node-a': masteredProgress(0.85),
          'node-b': masteredProgress(0.5),
        },
      });

      expect(strategy.resolveNext(ctx)).toEqual({ action: 'advance' });
    });

    it('does not skip when no node progress exists', () => {
      const lu = makeSkippableLU('skip-1', ['node-a']);
      const ctx = makeContext({
        playlist: [makeEntry(lu), makeEntry(makeLU({ id: 'lu-2' }))],
        currentIndex: 0,
        nodeProgress: {},
      });

      expect(strategy.resolveNext(ctx)).toEqual({ action: 'advance' });
    });

    it('does not skip gate LUs even if they are marked skippable', () => {
      const lu = makeLU({
        id: 'gate-skip',
        adaptive: {
          teachesNodes: ['node-a'],
          assessesNodes: ['node-a'],
          isGate: true,
          isSkippable: true, // Shouldn't matter — gates are never skipped
          gateConfig: {
            masteryThreshold: 0.8,
            minQuestions: 3,
            maxRetries: 2,
            failStrategy: 'hold',
          },
        },
      });
      const ctx = makeContext({
        playlist: [makeEntry(lu), makeEntry(makeLU({ id: 'lu-2' }))],
        currentIndex: 0,
        nodeProgress: { 'node-a': masteredProgress(0.95) },
        gateResults: {},
      });

      // Should hold (gate with no attempt), not skip
      const decision = strategy.resolveNext(ctx);
      expect(decision.action).toBe('hold');
    });

    it('does not skip LU with empty teachesNodes', () => {
      const lu = makeSkippableLU('skip-empty', []);
      const ctx = makeContext({
        playlist: [makeEntry(lu), makeEntry(makeLU({ id: 'lu-2' }))],
        currentIndex: 0,
      });

      // No nodes to check mastery against — advances normally
      expect(strategy.resolveNext(ctx)).toEqual({ action: 'advance' });
    });
  });

  // --- Gate logic (inherits from guided) ---

  describe('gate behavior', () => {
    it('holds on gate with no attempt', () => {
      const gate = makeGateLU('gate-1');
      const ctx = makeContext({
        playlist: [makeEntry(gate), makeEntry(makeLU({ id: 'lu-2' }))],
        currentIndex: 0,
      });

      expect(strategy.resolveNext(ctx).action).toBe('hold');
    });

    it('advances on passed gate', () => {
      const gate = makeGateLU('gate-1');
      const ctx = makeContext({
        playlist: [makeEntry(gate), makeEntry(makeLU({ id: 'lu-2' }))],
        currentIndex: 0,
        gateResults: { 'gate-1': [makeGateResult('gate-1', true)] },
      });

      expect(strategy.resolveNext(ctx)).toEqual({ action: 'advance' });
    });

    it('retries on failed gate with retries remaining', () => {
      const gate = makeGateLU('gate-1', { maxRetries: 3 });
      const ctx = makeContext({
        playlist: [makeEntry(gate), makeEntry(makeLU({ id: 'lu-2' }))],
        currentIndex: 0,
        gateResults: {
          'gate-1': [makeGateResult('gate-1', false, ['node-1'])],
        },
      });

      expect(strategy.resolveNext(ctx)).toEqual({ action: 'retry', luId: 'gate-1' });
    });
  });

  // --- Inject on gate fail ---

  describe('inject-practice on gate fail', () => {
    it('injects practice entry when failStrategy is inject-practice', () => {
      const gate = makeGateLU('gate-1', { maxRetries: 1, failStrategy: 'inject-practice' });
      const ctx = makeContext({
        playlist: [makeEntry(gate), makeEntry(makeLU({ id: 'lu-2' }))],
        currentIndex: 0,
        gateResults: {
          'gate-1': [makeGateResult('gate-1', false, ['node-1', 'node-2'])],
        },
      });

      const decision = strategy.resolveNext(ctx);
      expect(decision.action).toBe('inject');
      if (decision.action === 'inject') {
        expect(decision.entries).toHaveLength(1);
        expect(decision.entries[0].kind).toBe('injected-practice');
        if (decision.entries[0].kind === 'injected-practice') {
          expect(decision.entries[0].targetNodeIds).toEqual(['node-1', 'node-2']);
          expect(decision.entries[0].questionCount).toBe(5);
        }
      }
    });

    it('advances when inject-practice but no failedNodes', () => {
      const gate = makeGateLU('gate-1', { maxRetries: 1, failStrategy: 'inject-practice' });
      const ctx = makeContext({
        playlist: [makeEntry(gate), makeEntry(makeLU({ id: 'lu-2' }))],
        currentIndex: 0,
        gateResults: {
          'gate-1': [makeGateResult('gate-1', false, [])],
        },
      });

      expect(strategy.resolveNext(ctx)).toEqual({ action: 'advance' });
    });
  });

  // --- Prescribe review ---

  describe('prescribe-review on gate fail', () => {
    it('injects review entries for LUs that teach failed nodes', () => {
      const teacherA = makeTeachingLU('teacher-a', ['node-1']);
      const teacherB = makeTeachingLU('teacher-b', ['node-2']);
      const gate = makeGateLU('gate-1', {
        maxRetries: 1,
        failStrategy: 'prescribe-review',
        assessesNodes: ['node-1', 'node-2'],
      });
      const finalLU = makeLU({ id: 'lu-final', title: 'Final LU' });

      const staticSequence = [teacherA, teacherB, gate, finalLU];
      const ctx = makeContext({
        staticSequence,
        playlist: staticSequence.map(makeEntry),
        currentIndex: 2, // At the gate (not last entry)
        gateResults: {
          'gate-1': [makeGateResult('gate-1', false, ['node-1', 'node-2'])],
        },
      });

      const decision = strategy.resolveNext(ctx);
      expect(decision.action).toBe('inject');
      if (decision.action === 'inject') {
        expect(decision.entries.length).toBeGreaterThanOrEqual(1);
        const reviewEntries = decision.entries.filter((e) => e.kind === 'injected-review');
        expect(reviewEntries.length).toBeGreaterThanOrEqual(1);
      }
    });

    it('falls back to practice injection when no teaching LU found', () => {
      const gate = makeGateLU('gate-1', {
        maxRetries: 1,
        failStrategy: 'prescribe-review',
      });

      const ctx = makeContext({
        staticSequence: [gate], // No teaching LUs in sequence
        playlist: [makeEntry(gate), makeEntry(makeLU({ id: 'lu-2' }))],
        currentIndex: 0,
        gateResults: {
          'gate-1': [makeGateResult('gate-1', false, ['node-1'])],
        },
      });

      const decision = strategy.resolveNext(ctx);
      expect(decision.action).toBe('inject');
      if (decision.action === 'inject') {
        expect(decision.entries[0].kind).toBe('injected-practice');
      }
    });
  });

  // --- Non-static entries ---

  describe('non-static entries', () => {
    it('advances on injected-practice entries', () => {
      const ctx = makeContext({
        playlist: [
          {
            kind: 'injected-practice',
            entryId: 'practice-1',
            title: 'Practice',
            targetNodeIds: ['n1'],
            questionCount: 5,
          },
          makeEntry(makeLU({ id: 'lu-2' })),
        ],
        currentIndex: 0,
      });

      expect(strategy.resolveNext(ctx)).toEqual({ action: 'advance' });
    });

    it('advances on injected-review entries', () => {
      const ctx = makeContext({
        playlist: [
          {
            kind: 'injected-review',
            entryId: 'review-1',
            title: 'Review',
            referenceLuId: 'lu-1',
            targetNodeIds: ['n1'],
          },
          makeEntry(makeLU({ id: 'lu-2' })),
        ],
        currentIndex: 0,
      });

      expect(strategy.resolveNext(ctx)).toEqual({ action: 'advance' });
    });
  });

  // --- Completion ---

  it('completes at end of playlist', () => {
    const lu = makeLU({ id: 'lu-1' });
    const ctx = makeContext({ playlist: [makeEntry(lu)], currentIndex: 0 });

    expect(strategy.resolveNext(ctx)).toEqual({ action: 'complete' });
  });
});
