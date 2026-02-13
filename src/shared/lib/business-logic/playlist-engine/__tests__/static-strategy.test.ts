import { describe, it, expect } from 'vitest';
import { StaticStrategy } from '../strategies/static-strategy';
import type { PlaylistContext, StaticPlaylistEntry, StaticLearningUnit } from '../types';

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
    adaptiveConfig: { mode: 'off', allowLearnerChoice: false, preAssessmentEnabled: false },
    ...overrides,
  };
}

describe('StaticStrategy', () => {
  const strategy = new StaticStrategy();

  it('advances when not at the last entry', () => {
    const lus = [makeLU({ id: 'lu-1' }), makeLU({ id: 'lu-2' }), makeLU({ id: 'lu-3' })];
    const playlist = lus.map(makeEntry);
    const ctx = makeContext({ playlist, currentIndex: 0 });

    expect(strategy.resolveNext(ctx)).toEqual({ action: 'advance' });
  });

  it('advances from middle of playlist', () => {
    const lus = [makeLU({ id: 'lu-1' }), makeLU({ id: 'lu-2' }), makeLU({ id: 'lu-3' })];
    const playlist = lus.map(makeEntry);
    const ctx = makeContext({ playlist, currentIndex: 1 });

    expect(strategy.resolveNext(ctx)).toEqual({ action: 'advance' });
  });

  it('completes at the last entry', () => {
    const lus = [makeLU({ id: 'lu-1' }), makeLU({ id: 'lu-2' })];
    const playlist = lus.map(makeEntry);
    const ctx = makeContext({ playlist, currentIndex: 1 });

    expect(strategy.resolveNext(ctx)).toEqual({ action: 'complete' });
  });

  it('completes when playlist has a single entry', () => {
    const lu = makeLU({ id: 'lu-1' });
    const playlist = [makeEntry(lu)];
    const ctx = makeContext({ playlist, currentIndex: 0 });

    expect(strategy.resolveNext(ctx)).toEqual({ action: 'complete' });
  });

  it('completes on empty playlist', () => {
    const ctx = makeContext({ playlist: [], currentIndex: 0 });
    expect(strategy.resolveNext(ctx)).toEqual({ action: 'complete' });
  });

  it('ignores adaptive metadata entirely', () => {
    const lu = makeLU({
      id: 'lu-gate',
      adaptive: {
        teachesNodes: ['node-1'],
        assessesNodes: ['node-1'],
        isGate: true,
        isSkippable: false,
        gateConfig: {
          masteryThreshold: 0.8,
          minQuestions: 3,
          maxRetries: 2,
          failStrategy: 'hold',
        },
      },
    });
    const playlist = [makeEntry(lu), makeEntry(makeLU({ id: 'lu-2' }))];
    const ctx = makeContext({ playlist, currentIndex: 0 });

    // Should advance despite gate — static strategy ignores it
    expect(strategy.resolveNext(ctx)).toEqual({ action: 'advance' });
  });
});
