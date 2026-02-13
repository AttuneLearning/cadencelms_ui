/**
 * Static Strategy
 * Pure passthrough — ignores all adaptive metadata.
 * Always advances to the next entry; completes when at the end.
 */

import type { PlaylistStrategy, PlaylistContext, PlaylistDecision } from '../types';

export class StaticStrategy implements PlaylistStrategy {
  resolveNext(context: PlaylistContext): PlaylistDecision {
    const { playlist, currentIndex } = context;

    if (currentIndex >= playlist.length - 1) {
      return { action: 'complete' };
    }

    return { action: 'advance' };
  }
}
