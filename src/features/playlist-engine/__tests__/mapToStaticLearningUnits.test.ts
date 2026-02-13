import { describe, it, expect } from 'vitest';
import { mapToStaticLearningUnits } from '../lib/mapToStaticLearningUnits';
import type { LearningUnitListItem } from '@/entities/learning-unit/model/types';

function makeLUItem(overrides: Partial<LearningUnitListItem> = {}): LearningUnitListItem {
  return {
    id: 'lu-1',
    title: 'Test LU',
    description: null,
    type: 'media',
    contentId: 'c-1',
    category: 'topic',
    isRequired: true,
    isReplayable: true,
    weight: 100,
    sequence: 1,
    estimatedDuration: 10,
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('mapToStaticLearningUnits', () => {
  it('maps LearningUnitListItem[] to StaticLearningUnit[]', () => {
    const items = [
      makeLUItem({ id: 'lu-1', title: 'First', sequence: 1 }),
      makeLUItem({ id: 'lu-2', title: 'Second', sequence: 2 }),
    ];

    const result = mapToStaticLearningUnits(items);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      id: 'lu-1',
      title: 'First',
      type: 'media',
      contentId: 'c-1',
      category: 'topic',
      isRequired: true,
      sequence: 1,
      estimatedDuration: 10,
      adaptive: undefined,
    });
  });

  it('sorts by sequence', () => {
    const items = [
      makeLUItem({ id: 'lu-3', title: 'Third', sequence: 3 }),
      makeLUItem({ id: 'lu-1', title: 'First', sequence: 1 }),
      makeLUItem({ id: 'lu-2', title: 'Second', sequence: 2 }),
    ];

    const result = mapToStaticLearningUnits(items);

    expect(result[0].id).toBe('lu-1');
    expect(result[1].id).toBe('lu-2');
    expect(result[2].id).toBe('lu-3');
  });

  it('handles empty array', () => {
    const result = mapToStaticLearningUnits([]);
    expect(result).toEqual([]);
  });

  it('preserves null contentId and category', () => {
    const items = [
      makeLUItem({ id: 'lu-1', contentId: null, category: null, sequence: 1 }),
    ];

    const result = mapToStaticLearningUnits(items);

    expect(result[0].contentId).toBeNull();
    expect(result[0].category).toBeNull();
  });

  it('sets adaptive to undefined (API not yet providing it)', () => {
    const items = [makeLUItem({ id: 'lu-1', sequence: 1 })];
    const result = mapToStaticLearningUnits(items);
    expect(result[0].adaptive).toBeUndefined();
  });
});
