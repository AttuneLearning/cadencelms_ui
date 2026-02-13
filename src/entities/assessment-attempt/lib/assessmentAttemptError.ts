import { ApiClientError } from '@/shared/api/client';

export type AssessmentAttemptAction = 'start' | 'save' | 'submit' | 'retry' | 'load';

interface ErrorDetails {
  title: string;
  description: string;
  status?: number;
  code?: string;
}

interface ParsedError {
  message?: string;
  status?: number;
  code?: string;
  errors?: Record<string, string[]>;
}

function parseError(error: unknown): ParsedError {
  if (error instanceof ApiClientError) {
    return {
      message: error.message,
      status: error.status,
      code: error.code,
      errors: error.errors,
    };
  }

  if (error instanceof Error) {
    return { message: error.message };
  }

  if (error && typeof error === 'object') {
    const candidate = error as Record<string, unknown>;
    return {
      message: typeof candidate.message === 'string' ? candidate.message : undefined,
      status: typeof candidate.status === 'number' ? candidate.status : undefined,
      code: typeof candidate.code === 'string' ? candidate.code : undefined,
      errors:
        candidate.errors && typeof candidate.errors === 'object'
          ? (candidate.errors as Record<string, string[]>)
          : undefined,
    };
  }

  return {};
}

function firstValidationMessage(errors?: Record<string, string[]>): string | null {
  if (!errors) return null;
  for (const value of Object.values(errors)) {
    if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'string') {
      return value[0];
    }
  }
  return null;
}

function fallbackTitle(action: AssessmentAttemptAction): string {
  switch (action) {
    case 'start':
    case 'retry':
      return 'Unable to Start Assessment';
    case 'save':
      return 'Unable to Save Answer';
    case 'submit':
      return 'Unable to Submit Assessment';
    case 'load':
    default:
      return 'Unable to Load Assessment';
  }
}

function fallbackDescription(action: AssessmentAttemptAction): string {
  switch (action) {
    case 'save':
      return 'Your latest answer could not be saved. Please try again.';
    case 'submit':
      return 'Your submission did not complete. Please try again.';
    case 'start':
    case 'retry':
      return 'Please relaunch this assessment from the course player and try again.';
    case 'load':
    default:
      return 'Please try again or return to the course player.';
  }
}

export function getAssessmentAttemptErrorDetails(
  error: unknown,
  action: AssessmentAttemptAction
): ErrorDetails {
  const parsed = parseError(error);
  const status = parsed.status;
  const code = parsed.code;
  const message = parsed.message?.toLowerCase() || '';

  if (code === 'LEARNING_UNIT_ASSESSMENT_MISMATCH') {
    return {
      title: 'Assessment Launch Mismatch',
      description:
        'This learning unit no longer matches the selected assessment. Relaunch from the course player.',
      status,
      code,
    };
  }

  if (code === 'LEARNING_UNIT_NOT_FOUND') {
    return {
      title: 'Learning Unit Not Found',
      description:
        'The learning unit context could not be found. Relaunch this assessment from the course player.',
      status,
      code,
    };
  }

  if (status === 409) {
    if (message.includes('max attempt')) {
      return {
        title: 'No Attempts Remaining',
        description:
          'You have reached the maximum number of attempts for this assessment.',
        status,
        code,
      };
    }

    if (message.includes('already in progress')) {
      return {
        title: 'Attempt Already In Progress',
        description:
          'An assessment attempt is already active. Return to the active attempt and continue.',
        status,
        code,
      };
    }

    if (message.includes('not in progress')) {
      return {
        title: 'Attempt No Longer Active',
        description:
          'This attempt is no longer in progress. Refresh and start a new attempt if available.',
        status,
        code,
      };
    }

    return {
      title: 'Assessment Conflict',
      description:
        parsed.message || 'This assessment action conflicts with the current attempt state.',
      status,
      code,
    };
  }

  if (status === 422) {
    const validationMessage = firstValidationMessage(parsed.errors);
    return {
      title: 'Invalid Assessment Request',
      description:
        validationMessage ||
        parsed.message ||
        'Required assessment data is missing or invalid.',
      status,
      code,
    };
  }

  if (status === 404) {
    if (action === 'load') {
      return {
        title: 'Assessment Attempt Not Found',
        description:
          'This assessment attempt could not be found. Return to the course player and relaunch.',
        status,
        code,
      };
    }

    return {
      title: 'Assessment Context Not Found',
      description:
        parsed.message || 'The requested assessment context could not be found.',
      status,
      code,
    };
  }

  return {
    title: fallbackTitle(action),
    description: parsed.message || fallbackDescription(action),
    status,
    code,
  };
}
