/**
 * SCORM Utility Functions
 * Helper functions for SCORM CMI data handling
 */

import type { ScormVersion } from '../model/types';

/**
 * Format seconds to SCORM time format
 * SCORM 1.2: HH:MM:SS
 * SCORM 2004: PTnHnMnS
 */
export function formatScormTime(seconds: number, version: ScormVersion): string {
  if (version === '1.2') {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  } else {
    // SCORM 2004 PT format
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    let result = 'PT';
    if (hours > 0) result += `${hours}H`;
    if (minutes > 0) result += `${minutes}M`;
    if (secs > 0 || result === 'PT') result += `${secs}S`;

    return result;
  }
}

/**
 * Parse SCORM time format to seconds
 */
export function parseScormTime(timeString: string, version: ScormVersion): number {
  if (!timeString) return 0;

  try {
    if (version === '1.2') {
      const parts = timeString.split(':');
      if (parts.length !== 3) return 0;
      const hours = parseInt(parts[0], 10);
      const minutes = parseInt(parts[1], 10);
      const seconds = parseInt(parts[2], 10);
      return hours * 3600 + minutes * 60 + seconds;
    } else {
      // SCORM 2004 PT format
      const match = timeString.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
      if (!match) return 0;
      const hours = parseInt(match[1] || '0', 10);
      const minutes = parseInt(match[2] || '0', 10);
      const seconds = parseInt(match[3] || '0', 10);
      return hours * 3600 + minutes * 60 + seconds;
    }
  } catch {
    return 0;
  }
}

/**
 * Validate CMI field name for given SCORM version
 */
export function validateCmiField(fieldName: string, version: ScormVersion): boolean {
  const scorm12Fields = [
    'cmi.core.student_id',
    'cmi.core.student_name',
    'cmi.core.lesson_location',
    'cmi.core.lesson_status',
    'cmi.core.score.raw',
    'cmi.core.score.min',
    'cmi.core.score.max',
    'cmi.core.session_time',
    'cmi.core.total_time',
    'cmi.suspend_data',
    'cmi.launch_data',
    'cmi.comments',
    'cmi.comments_from_lms',
  ];

  const scorm2004Fields = [
    'cmi.learner_id',
    'cmi.learner_name',
    'cmi.location',
    'cmi.completion_status',
    'cmi.success_status',
    'cmi.score.raw',
    'cmi.score.min',
    'cmi.score.max',
    'cmi.score.scaled',
    'cmi.session_time',
    'cmi.total_time',
    'cmi.suspend_data',
    'cmi.launch_data',
  ];

  const fields = version === '1.2' ? scorm12Fields : scorm2004Fields;
  return fields.some((field) => fieldName.startsWith(field));
}

/**
 * Check if CMI field is read-only
 */
export function isReadOnlyCmiField(fieldName: string): boolean {
  const readOnlyFields = [
    'cmi.core.student_id',
    'cmi.core.student_name',
    'cmi.learner_id',
    'cmi.learner_name',
    'cmi.core.total_time',
    'cmi.total_time',
  ];

  return readOnlyFields.some((field) => fieldName === field);
}

/**
 * Format score for SCORM
 */
export function formatScormScore(score: number | null | undefined): string {
  if (score === null || score === undefined) return '';
  return String(score);
}

/**
 * Parse suspend data string to object
 */
export function parseSuspendData(
  suspendData: string | null | undefined
): Record<string, string> {
  if (!suspendData) return {};

  try {
    const pairs = suspendData.split(';');
    const result: Record<string, string> = {};

    for (const pair of pairs) {
      const [key, value] = pair.split('=');
      if (key && value !== undefined) {
        result[key] = value;
      }
    }

    return result;
  } catch {
    return {};
  }
}

/**
 * Serialize object to suspend data string
 */
export function serializeSuspendData(data: Record<string, string>): string {
  const pairs = Object.entries(data).map(([key, value]) => `${key}=${value}`);
  return pairs.join(';');
}

/**
 * Get lesson status from CMI data
 */
export function getLessonStatusFromCmi(
  cmiData: Record<string, unknown>,
  version: ScormVersion
): string {
  if (version === '1.2') {
    return (cmiData['cmi.core.lesson_status'] as string) || 'not attempted';
  } else {
    return (cmiData['cmi.completion_status'] as string) || 'unknown';
  }
}

/**
 * Get score from CMI data
 */
export function getScoreFromCmi(
  cmiData: Record<string, unknown>,
  version: ScormVersion
): {
  raw: number | null;
  min: number | null;
  max: number | null;
  scaled: number | null;
} {
  const prefix = version === '1.2' ? 'cmi.core.score' : 'cmi.score';

  const parseScore = (value: unknown): number | null => {
    if (value === null || value === undefined || value === '') return null;
    const num = parseFloat(String(value));
    return isNaN(num) ? null : num;
  };

  return {
    raw: parseScore(cmiData[`${prefix}.raw`]),
    min: parseScore(cmiData[`${prefix}.min`]),
    max: parseScore(cmiData[`${prefix}.max`]),
    scaled: version === '2004' ? parseScore(cmiData['cmi.score.scaled']) : null,
  };
}
