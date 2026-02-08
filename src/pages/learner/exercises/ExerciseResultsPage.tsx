/**
 * Exercise Results Page
 * Displays detailed exam results with scores, feedback, retry capability, and attempt history
 */

import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useExamAttemptResult,
  useExamAttemptHistory,
  useStartExamAttempt,
} from '@/entities/exam-attempt/hooks/useExamAttempts';
import { ExamResultViewer } from '@/entities/exam-attempt/ui/ExamResultViewer';
import { AttemptHistory } from '@/entities/exam-attempt/ui/AttemptHistory';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { useNavigation } from '@/shared/lib/navigation/useNavigation';

export function ExerciseResultsPage() {
  const { exerciseId, attemptId } = useParams<{ exerciseId: string; attemptId: string }>();
  const navigate = useNavigate();
  const { updateBreadcrumbs } = useNavigation();

  const { data: result, isLoading, error } = useExamAttemptResult(attemptId || '');
  const { data: historyData } = useExamAttemptHistory(exerciseId || '');
  const startAttemptMutation = useStartExamAttempt();

  useEffect(() => {
    if (result) {
      updateBreadcrumbs([
        { label: 'Dashboard', path: '/learner/dashboard' },
        { label: 'Exercises', path: '/learner/exercises' },
        { label: result.examTitle, path: '#' },
        { label: 'Results', path: '#' },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  const handleRetry = () => {
    if (!exerciseId) return;

    startAttemptMutation.mutate(
      { examId: exerciseId },
      {
        onSuccess: () => {
          navigate(`/learner/exercises/${exerciseId}/take`);
        },
      }
    );
  };

  // Derive retry eligibility from result
  const canRetry = result
    ? !result.passed &&
      (result.maxAttempts === null || result.attemptsUsed < result.maxAttempts)
    : false;

  const attemptsExhausted = result
    ? !result.passed &&
      result.maxAttempts !== null &&
      result.attemptsUsed >= result.maxAttempts
    : false;

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading results...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="mb-4 text-destructive">
            <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Failed to Load Results</h2>
          <p className="text-muted-foreground mb-4">{error.message || 'An error occurred'}</p>
          <Button onClick={() => navigate('/learner/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Screen reader announcement for results */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {result.passed ? 'You passed!' : 'You did not pass.'} Score: {result.score} out of {result.maxScore}.
        </div>

        {/* Attempt Badge */}
        <div className="mb-4 flex items-center gap-3">
          <Badge
            variant="secondary"
            data-testid="attempt-badge"
          >
            {result.maxAttempts !== null
              ? `Attempt ${result.attemptNumber} of ${result.maxAttempts}`
              : `Attempt ${result.attemptNumber} — Unlimited`}
          </Badge>
        </div>

        {/* Results Viewer */}
        <ExamResultViewer result={result} className="mb-6" />

        {/* Attempts Exhausted Warning */}
        {attemptsExhausted && (
          <div
            className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800"
            data-testid="no-attempts-remaining"
          >
            <p className="font-medium">No attempts remaining</p>
            <p className="text-sm mt-1">
              You have used all {result.maxAttempts} attempts for this exam. Please contact your instructor if you need additional attempts.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between bg-card rounded-lg shadow-sm border border-border p-6">
          <div>
            <Button
              variant="outline"
              onClick={() => navigate('/learner/dashboard')}
            >
              Back to Dashboard
            </Button>
          </div>
          <div className="flex gap-3">
            {canRetry && (
              <Button
                variant="outline"
                onClick={handleRetry}
                disabled={startAttemptMutation.isPending}
                data-testid="retry-exam-button"
              >
                {startAttemptMutation.isPending ? 'Starting...' : 'Retry Exam'}
              </Button>
            )}
            <Button
              onClick={() => navigate(`/learner/courses/${exerciseId}`)}
              variant="default"
            >
              Back to Course
            </Button>
          </div>
        </div>

        {/* Attempt History */}
        {historyData && historyData.attempts.length > 0 && (
          <div className="mt-6">
            <AttemptHistory attempts={historyData.attempts} maxAttempts={result.maxAttempts} />
          </div>
        )}
      </div>
    </div>
  );
}
