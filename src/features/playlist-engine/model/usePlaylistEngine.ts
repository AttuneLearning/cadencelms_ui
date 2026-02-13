/**
 * usePlaylistEngine
 * React hook that wraps the PlaylistEngine class for use in the course player.
 * Creates/manages the engine instance and exposes session state + actions.
 */

import { useRef, useState, useCallback, useMemo } from 'react';
import { PlaylistEngine } from '@/shared/lib/business-logic/playlist-engine';
import type {
  StaticLearningUnit,
  CourseAdaptiveSettings,
  LearnerModuleSession,
  PlaylistEntry,
  PlaylistDisplayEntry,
  PlaylistDecision,
  GateResult,
  NodeProgress,
} from '@/shared/lib/business-logic/playlist-engine';

interface UsePlaylistEngineOptions {
  config: CourseAdaptiveSettings;
  learningUnits: StaticLearningUnit[];
  enrollmentId: string;
  moduleId: string;
  initialNodeProgress?: Record<string, NodeProgress>;
}

interface UsePlaylistEngineResult {
  /** Current session state */
  session: LearnerModuleSession;
  /** Current playlist entry (null if complete) */
  currentEntry: PlaylistEntry | null;
  /** Display-ready entries for sidebar */
  displayEntries: PlaylistDisplayEntry[];
  /** Whether the module is complete */
  isComplete: boolean;
  /** Resolve next decision and apply it. Returns the decision for UI to react to. */
  resolveAndApplyNext: () => PlaylistDecision;
  /** Record a gate challenge result */
  recordGateResult: (result: GateResult) => void;
  /** Update mastery for a knowledge node */
  updateNodeProgress: (nodeId: string, progress: NodeProgress) => void;
  /** Navigate to a specific playlist index (sidebar click) */
  goToIndex: (index: number) => void;
}

export function usePlaylistEngine({
  config,
  learningUnits,
  enrollmentId,
  moduleId,
  initialNodeProgress,
}: UsePlaylistEngineOptions): UsePlaylistEngineResult {
  // Stable key for engine identity — recreate engine when these change
  const engineKey = `${enrollmentId}-${moduleId}`;

  const engineRef = useRef<PlaylistEngine | null>(null);
  const engineKeyRef = useRef<string>('');

  // Create or recreate engine when key changes
  if (engineKeyRef.current !== engineKey || !engineRef.current) {
    engineRef.current = new PlaylistEngine(
      config,
      learningUnits,
      enrollmentId,
      moduleId,
      initialNodeProgress
    );
    engineRef.current.initializePlaylist();
    engineKeyRef.current = engineKey;
  }

  const engine = engineRef.current;

  const [session, setSession] = useState<LearnerModuleSession>(() => engine.getSession());

  const resolveAndApplyNext = useCallback(() => {
    const decision = engine.resolveNext();
    const updated = engine.applyDecision(decision);
    setSession(updated);
    return decision;
  }, [engine]);

  const recordGateResult = useCallback(
    (result: GateResult) => {
      const updated = engine.recordGateResult(result);
      setSession(updated);
    },
    [engine]
  );

  const updateNodeProgress = useCallback(
    (nodeId: string, progress: NodeProgress) => {
      const updated = engine.updateNodeProgress(nodeId, progress);
      setSession(updated);
    },
    [engine]
  );

  const goToIndex = useCallback(
    (index: number) => {
      const updated = engine.goToIndex(index);
      setSession(updated);
    },
    [engine]
  );

  const currentEntry = useMemo(() => engine.getCurrentEntry(), [engine, session]);
  const displayEntries = useMemo(() => engine.getDisplayEntries(), [engine, session]);
  const isComplete = session.isComplete;

  return {
    session,
    currentEntry,
    displayEntries,
    isComplete,
    resolveAndApplyNext,
    recordGateResult,
    updateNodeProgress,
    goToIndex,
  };
}
