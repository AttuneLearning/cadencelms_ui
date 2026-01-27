/**
 * Adaptive Testing Types
 * Types for adaptive question delivery and learner progress tracking
 */

/**
 * Question ordering strategy
 */
export type RandomizationLevel = 'in_order' | 'by_difficulty' | 'completely_random';

/**
 * Difficulty progression strategy
 */
export type DifficultyProgression = 'increase_on_correct' | 'decrease_on_wrong' | 'maintain';

/**
 * Action to take when concept is mastered
 */
export type ConceptMasteryAction = 'skip_related' | 'reduce_weight' | 'complete';

/**
 * Concept mastery configuration
 */
export interface ConceptMasteryConfig {
  /** Number of correct answers to consider concept mastered */
  correctThreshold: number;
  /** Action to take when mastered */
  action: ConceptMasteryAction;
}

/**
 * Full adaptive testing configuration
 */
export interface AdaptiveConfig {
  /** Whether adaptive mode is enabled */
  enabled: boolean;
  /** Skip related questions when a question is answered correctly */
  skipRelatedOnCorrect: boolean;
  /** Repeat questions that were answered incorrectly */
  repeatWrongAnswers: boolean;
  /** Number of questions to delay before repeating a wrong answer */
  repeatDelay: number;
  /** How difficulty should progress based on performance */
  difficultyProgression: DifficultyProgression;
  /** Concept mastery settings */
  conceptMastery: ConceptMasteryConfig;
}

/**
 * Randomization settings
 */
export interface RandomizationSettings {
  /** Question ordering strategy */
  level: RandomizationLevel;
  /** Whether learner can choose their preferred order */
  allowUserChoice: boolean;
}

/**
 * Mastery-based repetition settings
 */
export interface RepetitionConfig {
  /** Number of correct answers required to master a question (null = disabled) */
  threshold: number | null;
}

/**
 * Individual question progress for a learner
 */
export interface QuestionProgress {
  questionId: string;
  /** Number of times answered correctly */
  correctCount: number;
  /** Number of times answered incorrectly */
  incorrectCount: number;
  /** Last attempt timestamp */
  lastAttemptAt: string | null;
  /** Whether question is still active (false if mastered) */
  isActive: boolean;
  /** When the question was mastered */
  masteredAt: string | null;
}

/**
 * Learner's progress on a learning unit
 */
export interface LearnerUnitProgress {
  learningUnitId: string;
  learnerId: string;
  questions: QuestionProgress[];
  /** Total questions in the unit */
  totalQuestions: number;
  /** Questions mastered */
  masteredCount: number;
  /** Overall progress percentage */
  progressPercent: number;
  /** Last activity timestamp */
  lastActivityAt: string | null;
}

/**
 * Record answer request
 */
export interface RecordAnswerRequest {
  questionId: string;
  isCorrect: boolean;
  /** Time spent on the question in seconds */
  timeSpent?: number;
}

/**
 * Default adaptive config
 */
export const DEFAULT_ADAPTIVE_CONFIG: AdaptiveConfig = {
  enabled: false,
  skipRelatedOnCorrect: false,
  repeatWrongAnswers: true,
  repeatDelay: 3,
  difficultyProgression: 'maintain',
  conceptMastery: {
    correctThreshold: 3,
    action: 'skip_related',
  },
};

/**
 * Default randomization settings
 */
export const DEFAULT_RANDOMIZATION_SETTINGS: RandomizationSettings = {
  level: 'in_order',
  allowUserChoice: false,
};

/**
 * Default repetition config
 */
export const DEFAULT_REPETITION_CONFIG: RepetitionConfig = {
  threshold: null,
};
