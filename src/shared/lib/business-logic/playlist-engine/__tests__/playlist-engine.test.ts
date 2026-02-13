import { describe, it, expect } from 'vitest';
import { PlaylistEngine } from '../playlist-engine';
import type {
  StaticLearningUnit,
  CourseAdaptiveSettings,
  GateResult,
  LearnerModuleSession,
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

function makeGateLU(id: string): StaticLearningUnit {
  return makeLU({
    id,
    title: `Gate: ${id}`,
    adaptive: {
      teachesNodes: [],
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
}

const OFF_CONFIG: CourseAdaptiveSettings = {
  mode: 'off',
  allowLearnerChoice: false,
  preAssessmentEnabled: false,
};

const GUIDED_CONFIG: CourseAdaptiveSettings = {
  mode: 'guided',
  allowLearnerChoice: false,
  preAssessmentEnabled: false,
};

describe('PlaylistEngine', () => {
  describe('initialization', () => {
    it('creates an initial playlist from static LU sequence', () => {
      const lus = [
        makeLU({ id: 'lu-1', sequence: 1 }),
        makeLU({ id: 'lu-2', sequence: 2 }),
        makeLU({ id: 'lu-3', sequence: 3 }),
      ];
      const engine = new PlaylistEngine(OFF_CONFIG, lus, 'enr-1', 'mod-1');
      const session = engine.initializePlaylist();

      expect(session.playlist).toHaveLength(3);
      expect(session.currentIndex).toBe(0);
      expect(session.isComplete).toBe(false);
      expect(session.enrollmentId).toBe('enr-1');
      expect(session.moduleId).toBe('mod-1');
    });

    it('marks empty playlist as complete', () => {
      const engine = new PlaylistEngine(OFF_CONFIG, [], 'enr-1', 'mod-1');
      const session = engine.initializePlaylist();

      expect(session.playlist).toHaveLength(0);
      expect(session.isComplete).toBe(true);
    });

    it('generates static entry IDs from LU IDs', () => {
      const lus = [makeLU({ id: 'lu-abc' })];
      const engine = new PlaylistEngine(OFF_CONFIG, lus, 'enr-1', 'mod-1');
      const session = engine.initializePlaylist();

      expect(session.playlist[0].entryId).toBe('static-lu-abc');
      expect(session.playlist[0].kind).toBe('static');
    });

    it('uses default config when none provided', () => {
      const lus = [makeLU({ id: 'lu-1' }), makeLU({ id: 'lu-2' })];
      const engine = new PlaylistEngine(undefined, lus, 'enr-1', 'mod-1');
      const session = engine.initializePlaylist();

      // Should work like off mode — resolve always advances
      const decision = engine.resolveNext();
      expect(decision.action).toBe('advance');
      expect(session.playlist).toHaveLength(2);
    });
  });

  describe('off-mode passthrough (5 LUs)', () => {
    it('navigates through all 5 LUs sequentially', () => {
      const lus = Array.from({ length: 5 }, (_, i) =>
        makeLU({ id: `lu-${i + 1}`, title: `LU ${i + 1}`, sequence: i + 1 })
      );
      const engine = new PlaylistEngine(OFF_CONFIG, lus, 'enr-1', 'mod-1');
      engine.initializePlaylist();

      // Walk through all 5 entries
      for (let i = 0; i < 4; i++) {
        expect(engine.isComplete()).toBe(false);
        const entry = engine.getCurrentEntry();
        expect(entry).not.toBeNull();
        expect(entry!.title).toBe(`LU ${i + 1}`);

        const decision = engine.resolveNext();
        expect(decision.action).toBe('advance');
        engine.applyDecision(decision);
      }

      // At LU 5 (last entry)
      expect(engine.getCurrentEntry()!.title).toBe('LU 5');
      const finalDecision = engine.resolveNext();
      expect(finalDecision.action).toBe('complete');
      engine.applyDecision(finalDecision);
      expect(engine.isComplete()).toBe(true);
      expect(engine.getCurrentEntry()).toBeNull();
    });
  });

  describe('session serialization', () => {
    it('returns a JSON-serializable session', () => {
      const lus = [makeLU({ id: 'lu-1' }), makeLU({ id: 'lu-2' })];
      const engine = new PlaylistEngine(OFF_CONFIG, lus, 'enr-1', 'mod-1');
      engine.initializePlaylist();

      const session = engine.getSession();
      const json = JSON.stringify(session);
      const parsed: LearnerModuleSession = JSON.parse(json);

      expect(parsed.enrollmentId).toBe('enr-1');
      expect(parsed.moduleId).toBe('mod-1');
      expect(parsed.playlist).toHaveLength(2);
      expect(parsed.currentIndex).toBe(0);
    });

    it('restores session from saved state', () => {
      const lus = [makeLU({ id: 'lu-1' }), makeLU({ id: 'lu-2' }), makeLU({ id: 'lu-3' })];
      const engine = new PlaylistEngine(OFF_CONFIG, lus, 'enr-1', 'mod-1');
      engine.initializePlaylist();

      // Advance once
      engine.applyDecision(engine.resolveNext());
      const savedSession = JSON.parse(JSON.stringify(engine.getSession()));

      // Create new engine and restore
      const engine2 = new PlaylistEngine(OFF_CONFIG, lus, 'enr-1', 'mod-1');
      engine2.restoreSession(savedSession);

      expect(engine2.getSession().currentIndex).toBe(1);
      expect(engine2.getCurrentEntry()!.title).toBe('Test LU');
    });
  });

  describe('display entries', () => {
    it('generates display entries for all playlist items', () => {
      const lus = [
        makeLU({ id: 'lu-1', title: 'Lesson 1' }),
        makeGateLU('gate-1'),
        makeLU({ id: 'lu-3', title: 'Lesson 3' }),
      ];
      const engine = new PlaylistEngine(OFF_CONFIG, lus, 'enr-1', 'mod-1');
      engine.initializePlaylist();

      const entries = engine.getDisplayEntries();
      expect(entries).toHaveLength(3);

      // First entry is current
      expect(entries[0].isCurrent).toBe(true);
      expect(entries[0].isCompleted).toBe(false);
      expect(entries[0].isGate).toBe(false);

      // Second entry is gate
      expect(entries[1].isGate).toBe(true);
      expect(entries[1].gateStatus).toBe('pending');

      // Third entry is not current
      expect(entries[2].isCurrent).toBe(false);
    });

    it('marks completed entries correctly', () => {
      const lus = [
        makeLU({ id: 'lu-1', title: 'Lesson 1' }),
        makeLU({ id: 'lu-2', title: 'Lesson 2' }),
      ];
      const engine = new PlaylistEngine(OFF_CONFIG, lus, 'enr-1', 'mod-1');
      engine.initializePlaylist();

      // Advance past first entry
      engine.applyDecision({ action: 'advance' });

      const entries = engine.getDisplayEntries();
      expect(entries[0].isCompleted).toBe(true);
      expect(entries[0].isCurrent).toBe(false);
      expect(entries[1].isCurrent).toBe(true);
    });

    it('marks skipped entries correctly', () => {
      const lus = [
        makeLU({ id: 'lu-1', title: 'Lesson 1' }),
        makeLU({ id: 'lu-2', title: 'Lesson 2' }),
      ];
      const engine = new PlaylistEngine(OFF_CONFIG, lus, 'enr-1', 'mod-1');
      engine.initializePlaylist();

      // Skip first entry
      engine.applyDecision({ action: 'skip', reason: 'Already mastered' });

      const entries = engine.getDisplayEntries();
      expect(entries[0].isSkipped).toBe(true);
      expect(entries[0].isCompleted).toBe(false); // Skipped, not completed
    });

    it('shows gate status based on gate results', () => {
      const gate = makeGateLU('gate-1');
      const lus = [gate, makeLU({ id: 'lu-2' })];
      const engine = new PlaylistEngine(GUIDED_CONFIG, lus, 'enr-1', 'mod-1');
      engine.initializePlaylist();

      // Before any attempt — pending
      let entries = engine.getDisplayEntries();
      expect(entries[0].gateStatus).toBe('pending');

      // Record a passed gate result
      engine.recordGateResult({
        luId: 'gate-1',
        passed: true,
        score: 0.9,
        attemptNumber: 1,
        failedNodes: [],
      });

      entries = engine.getDisplayEntries();
      expect(entries[0].gateStatus).toBe('passed');
    });
  });

  describe('goToIndex', () => {
    it('navigates to a valid index', () => {
      const lus = [
        makeLU({ id: 'lu-1' }),
        makeLU({ id: 'lu-2' }),
        makeLU({ id: 'lu-3' }),
      ];
      const engine = new PlaylistEngine(OFF_CONFIG, lus, 'enr-1', 'mod-1');
      engine.initializePlaylist();

      engine.goToIndex(2);
      expect(engine.getSession().currentIndex).toBe(2);
      expect(engine.getCurrentEntry()!.entryId).toBe('static-lu-3');
    });

    it('ignores out-of-bounds index', () => {
      const lus = [makeLU({ id: 'lu-1' })];
      const engine = new PlaylistEngine(OFF_CONFIG, lus, 'enr-1', 'mod-1');
      engine.initializePlaylist();

      engine.goToIndex(5);
      expect(engine.getSession().currentIndex).toBe(0);

      engine.goToIndex(-1);
      expect(engine.getSession().currentIndex).toBe(0);
    });

    it('resets isComplete when navigating back', () => {
      const lus = [makeLU({ id: 'lu-1' })];
      const engine = new PlaylistEngine(OFF_CONFIG, lus, 'enr-1', 'mod-1');
      engine.initializePlaylist();

      // Complete the playlist
      engine.applyDecision({ action: 'complete' });
      expect(engine.isComplete()).toBe(true);

      // Navigate back
      engine.goToIndex(0);
      expect(engine.isComplete()).toBe(false);
    });
  });

  describe('recordGateResult', () => {
    it('records and accumulates gate results', () => {
      const gate = makeGateLU('gate-1');
      const engine = new PlaylistEngine(GUIDED_CONFIG, [gate], 'enr-1', 'mod-1');
      engine.initializePlaylist();

      const result1: GateResult = {
        luId: 'gate-1',
        passed: false,
        score: 0.5,
        attemptNumber: 1,
        failedNodes: ['node-1'],
      };
      engine.recordGateResult(result1);

      const result2: GateResult = {
        luId: 'gate-1',
        passed: true,
        score: 0.9,
        attemptNumber: 2,
        failedNodes: [],
      };
      engine.recordGateResult(result2);

      const session = engine.getSession();
      expect(session.gateAttempts['gate-1']).toHaveLength(2);
      expect(session.gateAttempts['gate-1'][0].passed).toBe(false);
      expect(session.gateAttempts['gate-1'][1].passed).toBe(true);
    });
  });

  describe('updateNodeProgress', () => {
    it('updates node progress', () => {
      const engine = new PlaylistEngine(OFF_CONFIG, [makeLU()], 'enr-1', 'mod-1');
      engine.initializePlaylist();

      engine.updateNodeProgress('node-1', { mastery: 0.85, attempts: 3 });

      const session = engine.getSession();
      expect(session.nodeProgress['node-1']).toEqual({ mastery: 0.85, attempts: 3 });
    });

    it('overwrites existing node progress', () => {
      const engine = new PlaylistEngine(
        OFF_CONFIG,
        [makeLU()],
        'enr-1',
        'mod-1',
        { 'node-1': { mastery: 0.5, attempts: 1 } }
      );
      engine.initializePlaylist();

      engine.updateNodeProgress('node-1', { mastery: 0.9, attempts: 5 });

      expect(engine.getSession().nodeProgress['node-1'].mastery).toBe(0.9);
    });
  });

  describe('inject decision', () => {
    it('inserts entries after current position', () => {
      const lus = [
        makeLU({ id: 'lu-1', title: 'LU 1' }),
        makeLU({ id: 'lu-2', title: 'LU 2' }),
      ];
      const engine = new PlaylistEngine(OFF_CONFIG, lus, 'enr-1', 'mod-1');
      engine.initializePlaylist();

      engine.applyDecision({
        action: 'inject',
        entries: [
          {
            kind: 'injected-practice',
            entryId: 'practice-1',
            title: 'Practice: weak areas',
            targetNodeIds: ['node-1'],
            questionCount: 5,
          },
        ],
      });

      const session = engine.getSession();
      expect(session.playlist).toHaveLength(3);
      expect(session.playlist[1].kind).toBe('injected-practice');
      expect(session.currentIndex).toBe(1); // Moved to injected entry
    });
  });

  describe('retry decision', () => {
    it('inserts a retry entry for the gate', () => {
      const gate = makeGateLU('gate-1');
      const lus = [gate, makeLU({ id: 'lu-2' })];
      const engine = new PlaylistEngine(GUIDED_CONFIG, lus, 'enr-1', 'mod-1');
      engine.initializePlaylist();

      // Record a failed attempt
      engine.recordGateResult({
        luId: 'gate-1',
        passed: false,
        score: 0.4,
        attemptNumber: 1,
        failedNodes: ['node-1'],
      });

      engine.applyDecision({ action: 'retry', luId: 'gate-1' });

      const session = engine.getSession();
      expect(session.playlist).toHaveLength(3);
      expect(session.playlist[1].kind).toBe('retry');
      expect(session.currentIndex).toBe(1);
    });
  });
});
