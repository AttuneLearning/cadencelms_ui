/**
 * Adaptive Playlist Engine Types
 * Pure type definitions for the runtime playlist engine (ADR-UI-004).
 * No React dependencies — usable in any JS/TS environment.
 */

import type { LearningUnitType, LearningUnitCategory } from '@/entities/learning-unit/model/types';

// =====================
// ADAPTIVE METADATA
// =====================

/** Strategy applied when a gate is failed */
export type GateFailStrategy = 'allow-continue' | 'hold' | 'inject-practice' | 'prescribe-review';

/** Configuration for a gate checkpoint */
export interface GateConfig {
  /** Mastery threshold (0-1) required to pass the gate */
  masteryThreshold: number;
  /** Minimum number of questions in the gate challenge */
  minQuestions: number;
  /** Max retry attempts after failure (-1 = unlimited) */
  maxRetries: number;
  /** What happens when the learner fails the gate */
  failStrategy: GateFailStrategy;
}

/** Adaptive metadata attached to a learning unit */
export interface LearningUnitAdaptive {
  /** Knowledge node IDs this LU teaches */
  teachesNodes: string[];
  /** Knowledge node IDs this LU assesses */
  assessesNodes: string[];
  /** Whether this LU acts as a gate checkpoint */
  isGate: boolean;
  /** Whether the engine can skip this LU if taught nodes are already mastered */
  isSkippable: boolean;
  /** Gate configuration (only relevant when isGate is true) */
  gateConfig?: GateConfig;
}

// =====================
// STATIC LEARNING UNIT
// =====================

/** Learning unit enriched with optional adaptive metadata for the engine */
export interface StaticLearningUnit {
  id: string;
  title: string;
  type: LearningUnitType;
  contentId: string | null;
  category: LearningUnitCategory | null;
  isRequired: boolean;
  sequence: number;
  estimatedDuration: number | null;
  /** Adaptive metadata — undefined when adaptive mode is off or API hasn't provided it */
  adaptive?: LearningUnitAdaptive;
}

// =====================
// PLAYLIST ENTRIES
// =====================

/** Base fields shared by all playlist entry types */
interface PlaylistEntryBase {
  /** Unique entry ID (distinct from LU id — injected entries get generated IDs) */
  entryId: string;
  /** Title to display */
  title: string;
}

/** A static entry mapped 1:1 from the original LU sequence */
export interface StaticPlaylistEntry extends PlaylistEntryBase {
  kind: 'static';
  /** The source learning unit */
  lu: StaticLearningUnit;
}

/** An injected practice entry targeting specific weak nodes */
export interface InjectedPracticeEntry extends PlaylistEntryBase {
  kind: 'injected-practice';
  /** Knowledge node IDs to practice */
  targetNodeIds: string[];
  /** Number of questions to present */
  questionCount: number;
}

/** An injected review entry referencing content from another LU */
export interface InjectedReviewEntry extends PlaylistEntryBase {
  kind: 'injected-review';
  /** The LU whose content should be reviewed */
  referenceLuId: string;
  /** Knowledge node IDs this review targets */
  targetNodeIds: string[];
}

/** A retry entry for re-attempting a gate */
export interface RetryEntry extends PlaylistEntryBase {
  kind: 'retry';
  /** The gate LU being retried */
  lu: StaticLearningUnit;
  /** Which retry attempt this is (1-based) */
  attemptNumber: number;
}

/** Discriminated union of all playlist entry types */
export type PlaylistEntry =
  | StaticPlaylistEntry
  | InjectedPracticeEntry
  | InjectedReviewEntry
  | RetryEntry;

// =====================
// SESSION STATE
// =====================

/** Per-node mastery progress tracked during the session */
export interface NodeProgress {
  /** Current mastery score (0-1) */
  mastery: number;
  /** Number of attempts at this node */
  attempts: number;
}

/** Result of a gate challenge attempt */
export interface GateResult {
  /** The learning unit ID of the gate */
  luId: string;
  /** Whether the gate was passed */
  passed: boolean;
  /** Score achieved (0-1) */
  score: number;
  /** Which attempt this was (1-based) */
  attemptNumber: number;
  /** Node IDs that were below threshold */
  failedNodes: string[];
}

/** Persistent session state for one module's playlist — JSON-serializable */
export interface LearnerModuleSession {
  /** The enrollment this session belongs to */
  enrollmentId: string;
  /** The module this session covers */
  moduleId: string;
  /** The ordered playlist of entries */
  playlist: PlaylistEntry[];
  /** Current position in the playlist (0-based) */
  currentIndex: number;
  /** Per-node progress: nodeId → NodeProgress */
  nodeProgress: Record<string, NodeProgress>;
  /** Gate attempt results: luId → GateResult[] */
  gateAttempts: Record<string, GateResult[]>;
  /** Whether the module playlist has been completed */
  isComplete: boolean;
  /** Entries that were skipped (entry IDs) */
  skippedEntries: string[];
}

// =====================
// STRATEGY INTERFACE
// =====================

/** Context provided to the strategy for decision-making */
export interface PlaylistContext {
  /** The original static LU sequence */
  staticSequence: StaticLearningUnit[];
  /** Current playlist entries */
  playlist: PlaylistEntry[];
  /** Current position in the playlist */
  currentIndex: number;
  /** Per-node mastery progress */
  nodeProgress: Record<string, NodeProgress>;
  /** Gate results by LU ID */
  gateResults: Record<string, GateResult[]>;
  /** Adaptive configuration */
  adaptiveConfig: CourseAdaptiveSettings;
}

// =====================
// PLAYLIST DECISIONS
// =====================

export interface AdvanceDecision {
  action: 'advance';
}

export interface SkipDecision {
  action: 'skip';
  /** Reason the LU was skipped */
  reason: string;
}

export interface InjectDecision {
  action: 'inject';
  /** Entries to inject after the current position */
  entries: PlaylistEntry[];
}

export interface RetryDecision {
  action: 'retry';
  /** The gate LU to retry */
  luId: string;
}

export interface HoldDecision {
  action: 'hold';
  /** Message explaining why navigation is blocked */
  message: string;
}

export interface CompleteDecision {
  action: 'complete';
}

/** Discriminated union of all possible engine decisions */
export type PlaylistDecision =
  | AdvanceDecision
  | SkipDecision
  | InjectDecision
  | RetryDecision
  | HoldDecision
  | CompleteDecision;

// =====================
// STRATEGY INTERFACE
// =====================

/** Interface that all playlist strategies must implement */
export interface PlaylistStrategy {
  /** Given the current context, decide what to do next */
  resolveNext(context: PlaylistContext): PlaylistDecision;
}

// =====================
// COURSE CONFIGURATION
// =====================

/** Adaptive mode for a course */
export type AdaptiveMode = 'off' | 'guided' | 'full';

/** Course-level adaptive settings */
export interface CourseAdaptiveSettings {
  /** Which adaptive mode is active */
  mode: AdaptiveMode;
  /** Whether learners can toggle the mode themselves */
  allowLearnerChoice: boolean;
  /** Whether to run a pre-assessment before starting the module */
  preAssessmentEnabled: boolean;
}

/** Default settings when adaptive is not configured */
export const DEFAULT_ADAPTIVE_SETTINGS: CourseAdaptiveSettings = {
  mode: 'off',
  allowLearnerChoice: false,
  preAssessmentEnabled: false,
};

// =====================
// DISPLAY TYPES
// =====================

/** Gate display status for the sidebar */
export type GateDisplayStatus = 'pending' | 'passed' | 'failed';

/** Display-ready entry for the sidebar playlist view */
export interface PlaylistDisplayEntry {
  /** Entry ID */
  id: string;
  /** Display title */
  title: string;
  /** Entry kind */
  kind: PlaylistEntry['kind'];
  /** Whether this entry was skipped */
  isSkipped: boolean;
  /** Whether this is the current entry */
  isCurrent: boolean;
  /** Whether this entry has been completed */
  isCompleted: boolean;
  /** Whether this entry is a gate */
  isGate: boolean;
  /** Gate status (only relevant when isGate is true) */
  gateStatus?: GateDisplayStatus;
}
