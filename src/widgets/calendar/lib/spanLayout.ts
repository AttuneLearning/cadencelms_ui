/**
 * Span bar lane stacking algorithm
 *
 * Uses greedy interval scheduling to assign span segments to lanes (max 3 visible).
 * Overflow events are counted and displayed as "+N more".
 */

import type { WeekSegment } from '@/entities/calendar-event';

const MAX_LANES = 3;

export interface LaneAssignment {
  segment: WeekSegment;
  lane: number;
}

export interface WeekSpanLayout {
  /** Segments that fit within the MAX_LANES limit, each with a lane number (0-based) */
  assigned: LaneAssignment[];
  /** Number of additional events that don't fit */
  overflow: number;
}

/**
 * Assign lanes to a set of span segments for a single week row.
 *
 * All segments must belong to the same week row. Uses greedy interval scheduling:
 * for each segment, assign the lowest available lane. If all lanes are occupied
 * for the segment's column range, it goes to overflow.
 */
export function assignLanes(segments: WeekSegment[]): WeekSpanLayout {
  // Sort by start column, then by span width (wider first for visual stability)
  const sorted = [...segments].sort((a, b) => {
    if (a.startCol !== b.startCol) return a.startCol - b.startCol;
    return b.colSpan - a.colSpan;
  });

  // Track which columns are occupied in each lane
  // lanes[i] = array of occupied column ranges
  const lanes: Array<Array<{ start: number; end: number }>> = [];
  for (let i = 0; i < MAX_LANES; i++) {
    lanes.push([]);
  }

  const assigned: LaneAssignment[] = [];
  let overflow = 0;

  for (const segment of sorted) {
    const segStart = segment.startCol;
    const segEnd = segment.startCol + segment.colSpan - 1;

    let placed = false;

    for (let lane = 0; lane < MAX_LANES; lane++) {
      const conflicts = lanes[lane].some(
        (range) => segStart <= range.end && segEnd >= range.start
      );

      if (!conflicts) {
        lanes[lane].push({ start: segStart, end: segEnd });
        assigned.push({ segment, lane });
        placed = true;
        break;
      }
    }

    if (!placed) {
      overflow++;
    }
  }

  return { assigned, overflow };
}

/**
 * Calculate the total height needed for span bar overlay in a week row.
 * Returns the number of lanes used (0 to MAX_LANES).
 */
export function lanesUsed(layout: WeekSpanLayout): number {
  if (layout.assigned.length === 0) return 0;
  return Math.max(...layout.assigned.map((a) => a.lane)) + 1;
}
