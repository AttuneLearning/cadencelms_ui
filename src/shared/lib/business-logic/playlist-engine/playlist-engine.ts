/**
 * Playlist Engine
 * Runtime engine that manages the adaptive playlist for a single module.
 * Pure TypeScript — no React dependencies.
 *
 * Usage:
 *   const engine = new PlaylistEngine(config, learningUnits, enrollmentId, moduleId);
 *   const session = engine.initializePlaylist();
 *   // ... learner progresses ...
 *   const decision = engine.resolveNext();
 *   const updatedSession = engine.applyDecision(decision);
 */

import type {
  CourseAdaptiveSettings,
  StaticLearningUnit,
  LearnerModuleSession,
  PlaylistEntry,
  StaticPlaylistEntry,
  RetryEntry,
  PlaylistDecision,
  PlaylistContext,
  PlaylistStrategy,
  GateResult,
  NodeProgress,
  PlaylistDisplayEntry,
  GateDisplayStatus,
} from './types';
import { DEFAULT_ADAPTIVE_SETTINGS } from './types';
import { StaticStrategy } from './strategies/static-strategy';
import { GuidedStrategy } from './strategies/guided-strategy';
import { FullStrategy } from './strategies/full-strategy';

function createStrategy(mode: CourseAdaptiveSettings['mode']): PlaylistStrategy {
  switch (mode) {
    case 'guided':
      return new GuidedStrategy();
    case 'full':
      return new FullStrategy();
    case 'off':
    default:
      return new StaticStrategy();
  }
}

export class PlaylistEngine {
  private config: CourseAdaptiveSettings;
  private staticSequence: StaticLearningUnit[];
  private strategy: PlaylistStrategy;
  private session: LearnerModuleSession;

  constructor(
    config: CourseAdaptiveSettings | undefined,
    staticSequence: StaticLearningUnit[],
    enrollmentId: string,
    moduleId: string,
    initialNodeProgress?: Record<string, NodeProgress>
  ) {
    this.config = config || DEFAULT_ADAPTIVE_SETTINGS;
    this.staticSequence = staticSequence;
    this.strategy = createStrategy(this.config.mode);

    // Initialize an empty session — call initializePlaylist() to populate
    this.session = {
      enrollmentId,
      moduleId,
      playlist: [],
      currentIndex: 0,
      nodeProgress: initialNodeProgress || {},
      gateAttempts: {},
      isComplete: false,
      skippedEntries: [],
    };
  }

  /** Build the initial playlist from the static LU sequence */
  initializePlaylist(): LearnerModuleSession {
    const playlist: PlaylistEntry[] = this.staticSequence.map((lu) => ({
      kind: 'static' as const,
      entryId: `static-${lu.id}`,
      title: lu.title,
      lu,
    }));

    this.session = {
      ...this.session,
      playlist,
      currentIndex: 0,
      isComplete: playlist.length === 0,
    };

    return this.session;
  }

  /** Restore session from a previously saved state */
  restoreSession(session: LearnerModuleSession): void {
    this.session = session;
  }

  /** Get the current session state (JSON-serializable) */
  getSession(): LearnerModuleSession {
    return this.session;
  }

  /** Get the current playlist entry, or null if complete */
  getCurrentEntry(): PlaylistEntry | null {
    if (this.session.isComplete) return null;
    return this.session.playlist[this.session.currentIndex] || null;
  }

  /** Ask the strategy what to do next */
  resolveNext(): PlaylistDecision {
    const context = this.buildContext();
    return this.strategy.resolveNext(context);
  }

  /** Apply a decision to mutate the session state */
  applyDecision(decision: PlaylistDecision): LearnerModuleSession {
    switch (decision.action) {
      case 'advance':
        this.session = {
          ...this.session,
          currentIndex: this.session.currentIndex + 1,
          isComplete: this.session.currentIndex + 1 >= this.session.playlist.length,
        };
        break;

      case 'skip':
        this.session = {
          ...this.session,
          skippedEntries: [
            ...this.session.skippedEntries,
            this.session.playlist[this.session.currentIndex].entryId,
          ],
          currentIndex: this.session.currentIndex + 1,
          isComplete: this.session.currentIndex + 1 >= this.session.playlist.length,
        };
        break;

      case 'inject': {
        // Insert injected entries after the current position
        const before = this.session.playlist.slice(0, this.session.currentIndex + 1);
        const after = this.session.playlist.slice(this.session.currentIndex + 1);
        this.session = {
          ...this.session,
          playlist: [...before, ...decision.entries, ...after],
          // Advance past current entry into the first injected entry
          currentIndex: this.session.currentIndex + 1,
        };
        break;
      }

      case 'retry': {
        // Find the gate entry and create a retry entry after current position
        const gateEntry = this.session.playlist.find(
          (e) => e.kind === 'static' && (e as StaticPlaylistEntry).lu.id === decision.luId
        ) as StaticPlaylistEntry | undefined;

        if (gateEntry) {
          const existingRetries = this.session.gateAttempts[decision.luId]?.length || 0;
          const retryEntry: RetryEntry = {
            kind: 'retry',
            entryId: `retry-${decision.luId}-${existingRetries + 1}`,
            title: `Retry: ${gateEntry.lu.title} (#${existingRetries + 1})`,
            lu: gateEntry.lu,
            attemptNumber: existingRetries + 1,
          };
          const before = this.session.playlist.slice(0, this.session.currentIndex + 1);
          const after = this.session.playlist.slice(this.session.currentIndex + 1);
          this.session = {
            ...this.session,
            playlist: [...before, retryEntry, ...after],
            currentIndex: this.session.currentIndex + 1,
          };
        }
        break;
      }

      case 'hold':
        // No state change — learner is blocked
        break;

      case 'complete':
        this.session = {
          ...this.session,
          isComplete: true,
        };
        break;
    }

    return this.session;
  }

  /** Record a gate result and update session state */
  recordGateResult(result: GateResult): LearnerModuleSession {
    const existing = this.session.gateAttempts[result.luId] || [];
    this.session = {
      ...this.session,
      gateAttempts: {
        ...this.session.gateAttempts,
        [result.luId]: [...existing, result],
      },
    };
    return this.session;
  }

  /** Update node progress for a specific knowledge node */
  updateNodeProgress(nodeId: string, progress: NodeProgress): LearnerModuleSession {
    this.session = {
      ...this.session,
      nodeProgress: {
        ...this.session.nodeProgress,
        [nodeId]: progress,
      },
    };
    return this.session;
  }

  /** Whether the module playlist is complete */
  isComplete(): boolean {
    return this.session.isComplete;
  }

  /** Navigate to a specific index (for sidebar click) */
  goToIndex(index: number): LearnerModuleSession {
    if (index >= 0 && index < this.session.playlist.length) {
      this.session = {
        ...this.session,
        currentIndex: index,
        isComplete: false,
      };
    }
    return this.session;
  }

  /** Build display entries for the sidebar */
  getDisplayEntries(): PlaylistDisplayEntry[] {
    return this.session.playlist.map((entry, index) => {
      const isGate =
        entry.kind === 'static' && !!(entry as StaticPlaylistEntry).lu.adaptive?.isGate;
      const isRetryGate = entry.kind === 'retry';

      let gateStatus: GateDisplayStatus | undefined;
      if (isGate || isRetryGate) {
        const luId =
          entry.kind === 'static'
            ? (entry as StaticPlaylistEntry).lu.id
            : (entry as RetryEntry).lu.id;
        const results = this.session.gateAttempts[luId] || [];
        if (results.length === 0) {
          gateStatus = 'pending';
        } else {
          gateStatus = results[results.length - 1].passed ? 'passed' : 'failed';
        }
      }

      return {
        id: entry.entryId,
        title: entry.title,
        kind: entry.kind,
        isSkipped: this.session.skippedEntries.includes(entry.entryId),
        isCurrent: index === this.session.currentIndex,
        isCompleted: index < this.session.currentIndex && !this.session.skippedEntries.includes(entry.entryId),
        isGate: isGate || isRetryGate,
        gateStatus,
      };
    });
  }

  /** Build the context object for the strategy */
  private buildContext(): PlaylistContext {
    return {
      staticSequence: this.staticSequence,
      playlist: this.session.playlist,
      currentIndex: this.session.currentIndex,
      nodeProgress: this.session.nodeProgress,
      gateResults: this.session.gateAttempts,
      adaptiveConfig: this.config,
    };
  }
}
