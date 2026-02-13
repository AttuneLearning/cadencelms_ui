import { describe, expect, it } from 'vitest';
import { ApiClientError } from '@/shared/api/client';
import { getAssessmentAttemptErrorDetails } from '../assessmentAttemptError';

describe('getAssessmentAttemptErrorDetails', () => {
  it('maps learning unit and assessment mismatch code', () => {
    const error = new ApiClientError(
      'Learning unit does not match assessment',
      400,
      'LEARNING_UNIT_ASSESSMENT_MISMATCH'
    );

    const details = getAssessmentAttemptErrorDetails(error, 'start');

    expect(details.title).toBe('Assessment Launch Mismatch');
    expect(details.description).toContain('Relaunch from the course player');
  });

  it('maps learning unit not found code', () => {
    const error = new ApiClientError(
      'Learning unit not found',
      404,
      'LEARNING_UNIT_NOT_FOUND'
    );

    const details = getAssessmentAttemptErrorDetails(error, 'retry');

    expect(details.title).toBe('Learning Unit Not Found');
    expect(details.description).toContain('could not be found');
  });

  it('maps max attempts conflict', () => {
    const error = new ApiClientError('Max attempts reached', 409, 'ATTEMPT_CONFLICT');

    const details = getAssessmentAttemptErrorDetails(error, 'start');

    expect(details.title).toBe('No Attempts Remaining');
    expect(details.description).toContain('maximum number of attempts');
  });

  it('maps already-in-progress conflict', () => {
    const error = new ApiClientError('Attempt already in progress', 409, 'ATTEMPT_CONFLICT');

    const details = getAssessmentAttemptErrorDetails(error, 'start');

    expect(details.title).toBe('Attempt Already In Progress');
  });

  it('maps 422 validation with field error details', () => {
    const error = new ApiClientError(
      'Validation failed',
      422,
      'VALIDATION_ERROR',
      { enrollmentId: ['Enrollment ID is required'] }
    );

    const details = getAssessmentAttemptErrorDetails(error, 'start');

    expect(details.title).toBe('Invalid Assessment Request');
    expect(details.description).toBe('Enrollment ID is required');
  });

  it('maps 404 load failures to attempt-not-found', () => {
    const error = new ApiClientError('Not found', 404, 'NOT_FOUND');

    const details = getAssessmentAttemptErrorDetails(error, 'load');

    expect(details.title).toBe('Assessment Attempt Not Found');
  });

  it('falls back to action-specific defaults', () => {
    const details = getAssessmentAttemptErrorDetails(new Error(''), 'submit');

    expect(details.title).toBe('Unable to Submit Assessment');
    expect(details.description).toBe('Your submission did not complete. Please try again.');
  });
});
