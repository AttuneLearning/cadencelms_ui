/**
 * Full Strategy
 * Extends guided logic with skip, inject-practice, and prescribe-review.
 * - Skip: if LU is skippable AND all teachesNodes mastered ≥ threshold → skip
 * - Inject on gate fail: inject targeted practice for failed nodes
 * - Prescribe review: inject review entry for LU teaching weak nodes
 */

import type {
  PlaylistStrategy,
  PlaylistContext,
  PlaylistDecision,
  StaticPlaylistEntry,
  InjectedPracticeEntry,
  InjectedReviewEntry,
  PlaylistEntry,
  StaticLearningUnit,
} from '../types';

let injectedCounter = 0;

function generateEntryId(prefix: string): string {
  injectedCounter += 1;
  return `${prefix}-${Date.now()}-${injectedCounter}`;
}

/** Default mastery threshold when none is configured on the gate */
const DEFAULT_MASTERY_THRESHOLD = 0.7;

/** Default number of practice questions when injecting */
const DEFAULT_PRACTICE_QUESTION_COUNT = 5;

export class FullStrategy implements PlaylistStrategy {
  resolveNext(context: PlaylistContext): PlaylistDecision {
    const { playlist, currentIndex, gateResults, nodeProgress, staticSequence } = context;

    // At the end of the playlist
    if (currentIndex >= playlist.length - 1) {
      return { action: 'complete' };
    }

    const currentEntry = playlist[currentIndex];

    // Non-static entries (injected practice, review, retry) always advance when done
    if (currentEntry.kind !== 'static') {
      return { action: 'advance' };
    }

    const lu = (currentEntry as StaticPlaylistEntry).lu;

    // --- Skip logic ---
    if (lu.adaptive?.isSkippable && !lu.adaptive.isGate) {
      const teachesNodes = lu.adaptive.teachesNodes;
      if (teachesNodes.length > 0) {
        const threshold = DEFAULT_MASTERY_THRESHOLD;
        const allMastered = teachesNodes.every((nodeId) => {
          const progress = nodeProgress[nodeId];
          return progress && progress.mastery >= threshold;
        });
        if (allMastered) {
          return {
            action: 'skip',
            reason: `All knowledge nodes already mastered above ${Math.round(threshold * 100)}% threshold.`,
          };
        }
      }
    }

    // --- Gate logic ---
    if (!lu.adaptive?.isGate) {
      return { action: 'advance' };
    }

    const gateConfig = lu.adaptive.gateConfig;
    if (!gateConfig) {
      return { action: 'advance' };
    }

    const results = gateResults[lu.id] || [];

    // No attempt yet — hold
    if (results.length === 0) {
      return {
        action: 'hold',
        message: `Complete the gate challenge for "${lu.title}" to continue.`,
      };
    }

    const latestResult = results[results.length - 1];

    // Gate passed — advance
    if (latestResult.passed) {
      return { action: 'advance' };
    }

    // Gate failed — check retries
    const retriesUsed = results.length;
    const maxRetries = gateConfig.maxRetries;
    const hasRetriesRemaining = maxRetries === -1 || retriesUsed < maxRetries;

    if (hasRetriesRemaining) {
      return { action: 'retry', luId: lu.id };
    }

    // Retries exhausted — apply failStrategy
    switch (gateConfig.failStrategy) {
      case 'allow-continue':
        return { action: 'advance' };

      case 'hold':
        return {
          action: 'hold',
          message: `Gate "${lu.title}" failed and all retries exhausted. Contact your instructor.`,
        };

      case 'inject-practice': {
        const failedNodes = latestResult.failedNodes;
        if (failedNodes.length === 0) {
          return { action: 'advance' };
        }
        const practiceEntry: InjectedPracticeEntry = {
          kind: 'injected-practice',
          entryId: generateEntryId('practice'),
          title: `Practice: ${failedNodes.length} weak area${failedNodes.length > 1 ? 's' : ''}`,
          targetNodeIds: failedNodes,
          questionCount: DEFAULT_PRACTICE_QUESTION_COUNT,
        };
        return { action: 'inject', entries: [practiceEntry] };
      }

      case 'prescribe-review': {
        const failedNodes = latestResult.failedNodes;
        if (failedNodes.length === 0) {
          return { action: 'advance' };
        }
        const reviewEntries = buildReviewEntries(failedNodes, staticSequence);
        if (reviewEntries.length === 0) {
          // No teaching LU found — fall back to practice injection
          const practiceEntry: InjectedPracticeEntry = {
            kind: 'injected-practice',
            entryId: generateEntryId('practice-fallback'),
            title: `Practice: ${failedNodes.length} weak area${failedNodes.length > 1 ? 's' : ''}`,
            targetNodeIds: failedNodes,
            questionCount: DEFAULT_PRACTICE_QUESTION_COUNT,
          };
          return { action: 'inject', entries: [practiceEntry] };
        }
        return { action: 'inject', entries: reviewEntries };
      }

      default:
        return { action: 'hold', message: `Gate "${lu.title}" is blocking progress.` };
    }
  }
}

/** Find static LUs that teach the failed nodes and build review entries */
function buildReviewEntries(
  failedNodes: string[],
  staticSequence: StaticLearningUnit[]
): PlaylistEntry[] {
  const entries: InjectedReviewEntry[] = [];
  const coveredNodes = new Set<string>();

  for (const lu of staticSequence) {
    if (!lu.adaptive?.teachesNodes) continue;

    const overlap = lu.adaptive.teachesNodes.filter(
      (nodeId) => failedNodes.includes(nodeId) && !coveredNodes.has(nodeId)
    );

    if (overlap.length > 0) {
      overlap.forEach((n) => coveredNodes.add(n));
      entries.push({
        kind: 'injected-review',
        entryId: generateEntryId('review'),
        title: `Review: ${lu.title}`,
        referenceLuId: lu.id,
        targetNodeIds: overlap,
      });
    }

    // Stop once all failed nodes are covered
    if (coveredNodes.size >= failedNodes.length) break;
  }

  return entries;
}
