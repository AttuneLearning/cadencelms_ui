/**
 * Course Progress Page
 * Displays detailed progress tracking for a specific course
 */

import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCourseProgress } from '@/entities/progress/hooks/useProgress';
import { CourseProgressSummary } from '@/features/progress/ui/CourseProgressSummary';
import { ModuleProgressList } from '@/features/progress/ui/ModuleProgressList';
import { QuizScoresList } from '@/features/progress/ui/QuizScoresList';
import { Button } from '@/shared/ui/button';
import { useNavigation } from '@/shared/lib/navigation/useNavigation';

export function CourseProgressPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { updateBreadcrumbs } = useNavigation();

  const { data: progress, isLoading, error } = useCourseProgress(courseId || '');

  useEffect(() => {
    if (progress) {
      updateBreadcrumbs([
        { label: 'Dashboard', path: '/learner/dashboard' },
        { label: 'Courses', path: '/learner/courses' },
        { label: progress.courseTitle, path: `/learner/courses/${courseId}` },
        { label: 'Progress', path: '#' },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress, courseId]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading progress...</p>
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
          <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to Load Progress</h2>
          <p className="text-gray-600 mb-4">{error.message || 'An error occurred'}</p>
          <Button onClick={() => navigate('/learner/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  if (!progress) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{progress.courseTitle}</h1>
              <p className="text-gray-600 mt-1">Track your progress and performance</p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate(`/learner/courses/${courseId}`)}
            >
              Back to Course
            </Button>
          </div>
        </div>

        {/* Overall Progress Summary */}
        <CourseProgressSummary progress={progress} className="mb-6" />

        {/* Module Progress */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Module Progress</h2>
          <ModuleProgressList modules={progress.moduleProgress} />
        </div>

        {/* Quiz Scores */}
        {progress.assessments && progress.assessments.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Assessment Scores</h2>
            <QuizScoresList assessments={progress.assessments} />
          </div>
        )}

        {/* Activity Timeline */}
        {progress.activityLog && progress.activityLog.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {progress.activityLog.slice(0, 10).map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.details}</p>
                    {activity.moduleTitle && (
                      <p className="text-xs text-gray-600 mt-1">{activity.moduleTitle}</p>
                    )}
                  </div>
                  <div className="flex-shrink-0 text-xs text-gray-500">
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
