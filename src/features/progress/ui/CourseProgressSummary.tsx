/**
 * Course Progress Summary Component
 * Displays overall progress statistics and charts
 */

import type { CourseProgress } from '@/entities/progress/model/types';

export interface CourseProgressSummaryProps {
  progress: CourseProgress;
  className?: string;
}

export function CourseProgressSummary({ progress, className = '' }: CourseProgressSummaryProps) {
  const { overallProgress } = progress;
  const completionPercent = Math.round(overallProgress.completionPercent);

  const getStatusColor = () => {
    if (progress.status === 'completed') return 'text-green-600';
    if (progress.status === 'in_progress') return 'text-blue-600';
    return 'text-gray-600';
  };

  const getStatusText = () => {
    if (progress.status === 'completed') return 'Completed';
    if (progress.status === 'in_progress') return 'In Progress';
    return 'Not Started';
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900">Overall Progress</h2>
          <span className={`text-sm font-medium ${getStatusColor()}`}>{getStatusText()}</span>
        </div>

        {/* Progress Bar */}
        <div className="relative">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-600">Completion</span>
            <span className="text-sm font-semibold text-gray-900">{completionPercent}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Modules Completed</p>
          <p className="text-2xl font-bold text-gray-900">
            {overallProgress.modulesCompleted} / {overallProgress.modulesTotal}
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Average Score</p>
          <p className="text-2xl font-bold text-gray-900">
            {overallProgress.score !== null ? `${overallProgress.score}%` : 'N/A'}
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Time Spent</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatTime(overallProgress.timeSpent)}
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Current Streak</p>
          <p className="text-2xl font-bold text-gray-900">
            {overallProgress.streak} {overallProgress.streak === 1 ? 'day' : 'days'}
          </p>
        </div>
      </div>

      {/* Dates */}
      <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-600">Enrolled:</p>
          <p className="font-medium text-gray-900">
            {new Date(progress.enrolledAt).toLocaleDateString()}
          </p>
        </div>
        {progress.completedAt && (
          <div>
            <p className="text-gray-600">Completed:</p>
            <p className="font-medium text-green-600">
              {new Date(progress.completedAt).toLocaleDateString()}
            </p>
          </div>
        )}
        {overallProgress.lastAccessedAt && (
          <div>
            <p className="text-gray-600">Last Accessed:</p>
            <p className="font-medium text-gray-900">
              {new Date(overallProgress.lastAccessedAt).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
