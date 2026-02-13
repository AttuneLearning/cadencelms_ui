/**
 * Maps LearningUnitListItem[] → StaticLearningUnit[]
 * Extracts adaptive metadata from LUs when present (API-ISS-034).
 */

import type { LearningUnitListItem } from '@/entities/learning-unit/model/types';
import type { StaticLearningUnit } from '@/shared/lib/business-logic/playlist-engine';

export function mapToStaticLearningUnits(
  learningUnits: LearningUnitListItem[]
): StaticLearningUnit[] {
  return learningUnits
    .sort((a, b) => a.sequence - b.sequence)
    .map((lu) => ({
      id: lu.id,
      title: lu.title,
      type: lu.type,
      contentId: lu.contentId,
      category: lu.category,
      isRequired: lu.isRequired,
      sequence: lu.sequence,
      estimatedDuration: lu.estimatedDuration,
      adaptive: lu.adaptive
        ? {
            teachesNodes: lu.adaptive.teachesNodes,
            assessesNodes: lu.adaptive.assessesNodes,
            isGate: lu.adaptive.isGate,
            isSkippable: lu.adaptive.isSkippable,
            gateConfig: lu.adaptive.gateConfig,
          }
        : undefined,
    }));
}
