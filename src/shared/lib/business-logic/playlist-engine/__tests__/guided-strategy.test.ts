import { describe, it, expect } from 'vitest';
import { GuidedStrategy } from '../strategies/guided-strategy';
import type {
  PlaylistContext,
  StaticPlaylistEntry,
  StaticLearningUnit,
  GateResult,
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
  gateOverrides: Partial<NonNullable<StaticLearningUnit['adaptive']>['gateConfig']> & Record<string, unknown> = {}
): StaticLearningUnit {
  const { failStrategy = 'hold', maxRetries = 2, masteryThreshold = 0.8, minQuestions = 3 } = gateOverrides as {
    failStrategy?: 'allow-continue' | 'hold' | 'inject-practice' | 'prescribe-review';
    maxRetries?: number;
    masteryThreshold?: number;
    minQuestions?: number;
  };
  return makeLU({
    id,
    title: `Gate: ${id}`,
    adaptive: {
      teachesNodes: [],
      assessesNodes: ['node-1'],
      isGate: true,
      isSkippable: false,
      gateConfig: { masteryThreshold, minQuestions, maxRetries, failStrategy },
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
    adaptiveConfig: { mode: 'guided', allowLearnerChoice: false, preAssessmentEnabled: false },
    ...overrides,
  };
}

function makeGateResult(luId: string, passed: boolean, attemptNumber: number): GateResult {
  return {
    luId,
    passed,
    score: passed ? 0.9 : 0.4,
    attemptNumber,
    failedNodes: passed ? [] : ['node-1'],
  };
}

describe('GuidedStrategy', () => {
  const strategy = new GuidedStrategy();

  it('advances on non-gate LU', () => {
    const lus = [makeLU({ id: 'lu-1' }), makeLU({ id: 'lu-2' })];
    const ctx = makeContext({ playlist: lus.map(makeEntry), currentIndex: 0 });

    expect(strategy.resolveNext(ctx)).toEqual({ action: 'advance' });
  });

  it('completes at the end of the playlist', () => {
    const lu = makeLU({ id: 'lu-1' });
    const ctx = makeContext({ playlist: [makeEntry(lu)], currentIndex: 0 });

    expect(strategy.resolveNext(ctx)).toEqual({ action: 'complete' });
  });

  it('holds on gate with no attempt', () => {
    const gate = makeGateLU('gate-1');
    const ctx = makeContext({
      playlist: [makeEntry(gate), makeEntry(makeLU({ id: 'lu-2' }))],
      currentIndex: 0,
      gateResults: {},
    });

    const decision = strategy.resolveNext(ctx);
    expect(decision.action).toBe('hold');
    if (decision.action === 'hold') {
      expect(decision.message).toContain('gate-1');
    }
  });

  it('advances on gate that passed', () => {
    const gate = makeGateLU('gate-1');
    const ctx = makeContext({
      playlist: [makeEntry(gate), makeEntry(makeLU({ id: 'lu-2' }))],
      currentIndex: 0,
      gateResults: {
        'gate-1': [makeGateResult('gate-1', true, 1)],
      },
    });

    expect(strategy.resolveNext(ctx)).toEqual({ action: 'advance' });
  });

  it('retries on gate failed with retries remaining', () => {
    const gate = makeGateLU('gate-1', { maxRetries: 3 });
    const ctx = makeContext({
      playlist: [makeEntry(gate), makeEntry(makeLU({ id: 'lu-2' }))],
      currentIndex: 0,
      gateResults: {
        'gate-1': [makeGateResult('gate-1', false, 1)],
      },
    });

    expect(strategy.resolveNext(ctx)).toEqual({ action: 'retry', luId: 'gate-1' });
  });

  it('retries with unlimited retries (-1)', () => {
    const gate = makeGateLU('gate-1', { maxRetries: -1 });
    const results = Array.from({ length: 10 }, (_, i) =>
      makeGateResult('gate-1', false, i + 1)
    );
    const ctx = makeContext({
      playlist: [makeEntry(gate), makeEntry(makeLU({ id: 'lu-2' }))],
      currentIndex: 0,
      gateResults: { 'gate-1': results },
    });

    expect(strategy.resolveNext(ctx)).toEqual({ action: 'retry', luId: 'gate-1' });
  });

  it('holds when retries exhausted with hold failStrategy', () => {
    const gate = makeGateLU('gate-1', { maxRetries: 2, failStrategy: 'hold' });
    const ctx = makeContext({
      playlist: [makeEntry(gate), makeEntry(makeLU({ id: 'lu-2' }))],
      currentIndex: 0,
      gateResults: {
        'gate-1': [
          makeGateResult('gate-1', false, 1),
          makeGateResult('gate-1', false, 2),
        ],
      },
    });

    const decision = strategy.resolveNext(ctx);
    expect(decision.action).toBe('hold');
  });

  it('advances when retries exhausted with allow-continue failStrategy', () => {
    const gate = makeGateLU('gate-1', { maxRetries: 1, failStrategy: 'allow-continue' });
    const ctx = makeContext({
      playlist: [makeEntry(gate), makeEntry(makeLU({ id: 'lu-2' }))],
      currentIndex: 0,
      gateResults: {
        'gate-1': [makeGateResult('gate-1', false, 1)],
      },
    });

    expect(strategy.resolveNext(ctx)).toEqual({ action: 'advance' });
  });

  it('holds when retries exhausted with inject-practice (degrades to hold in guided)', () => {
    const gate = makeGateLU('gate-1', { maxRetries: 1, failStrategy: 'inject-practice' });
    const ctx = makeContext({
      playlist: [makeEntry(gate), makeEntry(makeLU({ id: 'lu-2' }))],
      currentIndex: 0,
      gateResults: {
        'gate-1': [makeGateResult('gate-1', false, 1)],
      },
    });

    const decision = strategy.resolveNext(ctx);
    expect(decision.action).toBe('hold');
  });

  it('advances on gate without gateConfig (treated as non-gate)', () => {
    const lu = makeLU({
      id: 'gate-noconfig',
      adaptive: {
        teachesNodes: [],
        assessesNodes: [],
        isGate: true,
        isSkippable: false,
        // No gateConfig
      },
    });
    const ctx = makeContext({
      playlist: [makeEntry(lu), makeEntry(makeLU({ id: 'lu-2' }))],
      currentIndex: 0,
    });

    expect(strategy.resolveNext(ctx)).toEqual({ action: 'advance' });
  });

  it('advances on non-static entry kinds', () => {
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
});
