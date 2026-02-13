import { describe, it, expect } from 'vitest';
import { assignLanes, lanesUsed } from '../spanLayout';
import type { WeekSegment } from '@/entities/calendar-event';

function makeSegment(overrides: Partial<WeekSegment> & { eventId: string }): WeekSegment {
  return {
    title: 'Test',
    color: 'bg-primary/70',
    startCol: 1,
    colSpan: 1,
    isFirst: true,
    isLast: true,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// assignLanes
// ---------------------------------------------------------------------------

describe('assignLanes', () => {
  it('assigns a single segment to lane 0', () => {
    const segments = [makeSegment({ eventId: 'a', startCol: 1, colSpan: 3 })];
    const result = assignLanes(segments);
    expect(result.assigned).toHaveLength(1);
    expect(result.assigned[0].lane).toBe(0);
    expect(result.overflow).toBe(0);
  });

  it('assigns non-overlapping segments to the same lane', () => {
    const segments = [
      makeSegment({ eventId: 'a', startCol: 1, colSpan: 2 }),
      makeSegment({ eventId: 'b', startCol: 4, colSpan: 2 }),
    ];
    const result = assignLanes(segments);
    expect(result.assigned).toHaveLength(2);
    expect(result.assigned[0].lane).toBe(0);
    expect(result.assigned[1].lane).toBe(0);
    expect(result.overflow).toBe(0);
  });

  it('assigns overlapping segments to different lanes', () => {
    const segments = [
      makeSegment({ eventId: 'a', startCol: 1, colSpan: 4 }),
      makeSegment({ eventId: 'b', startCol: 2, colSpan: 3 }),
    ];
    const result = assignLanes(segments);
    expect(result.assigned).toHaveLength(2);
    const lanes = result.assigned.map((a) => a.lane);
    expect(new Set(lanes).size).toBe(2);
    expect(result.overflow).toBe(0);
  });

  it('sends excess overlapping segments to overflow (max 3 lanes)', () => {
    const segments = [
      makeSegment({ eventId: 'a', startCol: 1, colSpan: 7 }),
      makeSegment({ eventId: 'b', startCol: 1, colSpan: 7 }),
      makeSegment({ eventId: 'c', startCol: 1, colSpan: 7 }),
      makeSegment({ eventId: 'd', startCol: 1, colSpan: 7 }),
    ];
    const result = assignLanes(segments);
    expect(result.assigned).toHaveLength(3);
    expect(result.overflow).toBe(1);
  });

  it('handles empty segments', () => {
    const result = assignLanes([]);
    expect(result.assigned).toHaveLength(0);
    expect(result.overflow).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// lanesUsed
// ---------------------------------------------------------------------------

describe('lanesUsed', () => {
  it('returns 0 for empty layout', () => {
    expect(lanesUsed({ assigned: [], overflow: 0 })).toBe(0);
  });

  it('returns the maximum lane + 1', () => {
    const layout = assignLanes([
      makeSegment({ eventId: 'a', startCol: 1, colSpan: 7 }),
      makeSegment({ eventId: 'b', startCol: 1, colSpan: 7 }),
    ]);
    expect(lanesUsed(layout)).toBe(2);
  });
});
