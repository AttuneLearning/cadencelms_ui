/**
 * Exercise Results Page
 * Displays detailed exam results with scores and feedback
 */

import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useExamAttemptResult } from '@/entities/exam-attempt/hooks/useExamAttempts';
import { ExamResultViewer } from '@/entities/exam-attempt/ui/ExamResultViewer';
import { Button } from '@/shared/ui/button';
import { useNavigation } from '@/shared/lib/navigation/useNavigation';

export function ExerciseResultsPage() {
  const { exerciseId, attemptId } = useParams<{ exerciseId: string; attemptId: string }>();
  const navigate = useNavigate();
  const { updateBreadcrumbs } = useNavigation();

  const { data: result, isLoading, error } = useExamAttemptResult(attemptId || '');

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

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="mb-4 text-red-600">
            <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to Load Results</h2>
          <p className="text-gray-600 mb-4">{error.message || 'An error occurred'}</p>
          <Button onClick={() => navigate('/learner/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Results Viewer */}
        <ExamResultViewer result={result} className="mb-6" />

        {/* Action Buttons */}
        <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div>
            <Button
              variant="outline"
              onClick={() => navigate('/learner/dashboard')}
            >
              Back to Dashboard
            </Button>
          </div>
          <div className="flex gap-3">
            {/* TODO: Add retry logic if attempts remaining */}
            {/* <Button variant="outline">
              Retry Exam
            </Button> */}
            <Button
              onClick={() => navigate(`/learner/courses/${exerciseId}`)}
              variant="default"
            >
              Back to Course
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
