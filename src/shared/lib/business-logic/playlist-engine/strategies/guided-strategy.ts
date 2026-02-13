/**
 * Guided Strategy
 * Respects gates — blocks learner at gate LUs until they pass.
 * Non-gate LUs always advance. No skip or inject behavior.
 */

import type {
  PlaylistStrategy,
  PlaylistContext,
  PlaylistDecision,
  StaticPlaylistEntry,
} from '../types';

export class GuidedStrategy implements PlaylistStrategy {
  resolveNext(context: PlaylistContext): PlaylistDecision {
    const { playlist, currentIndex, gateResults } = context;

    // At the end of the playlist
    if (currentIndex >= playlist.length - 1) {
      return { action: 'complete' };
    }

    const currentEntry = playlist[currentIndex];

    // Only static entries can be gates
    if (currentEntry.kind !== 'static') {
      return { action: 'advance' };
    }

    const lu = (currentEntry as StaticPlaylistEntry).lu;

    // Non-gate LUs always advance
    if (!lu.adaptive?.isGate) {
      return { action: 'advance' };
    }

    const gateConfig = lu.adaptive.gateConfig;
    if (!gateConfig) {
      // Gate without config — treat as non-gate
      return { action: 'advance' };
    }

    // Check gate results for this LU
    const results = gateResults[lu.id] || [];

    // No attempt yet — hold until the gate is attempted
    if (results.length === 0) {
      return {
        action: 'hold',
        message: `Complete the gate challenge for "${lu.title}" to continue.`,
      };
    }

    // Check the latest attempt
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

    // Retries exhausted — respect failStrategy
    switch (gateConfig.failStrategy) {
      case 'allow-continue':
        return { action: 'advance' };
      case 'hold':
      case 'inject-practice':
      case 'prescribe-review':
        // In guided mode, inject/prescribe degrade to hold
        return {
          action: 'hold',
          message: `Gate "${lu.title}" failed and all retries exhausted. Contact your instructor for assistance.`,
        };
      default:
        return { action: 'hold', message: `Gate "${lu.title}" is blocking progress.` };
    }
  }
}
