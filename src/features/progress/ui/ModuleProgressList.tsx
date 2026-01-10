/**
 * Module Progress List Component
 * Displays progress for each module in a course
 */

import type { ModuleProgress } from '@/entities/progress/model/types';

export interface ModuleProgressListProps {
  modules: ModuleProgress[];
  className?: string;
}

export function ModuleProgressList({ modules, className = '' }: ModuleProgressListProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'in_progress':
        return (
          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z"
              clipRule="evenodd"
            />
          </svg>
        );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'border-green-300 bg-green-50';
      case 'in_progress':
        return 'border-blue-300 bg-blue-50';
      default:
        return 'border-gray-300 bg-white';
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {modules.map((module, index) => (
        <div
          key={module.moduleId}
          className={`border rounded-lg p-4 transition-all ${getStatusColor(module.status)}`}
        >
          <div className="flex items-start gap-4">
            {/* Status Icon */}
            <div className="flex-shrink-0 mt-1">{getStatusIcon(module.status)}</div>

            {/* Module Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">
                    {index + 1}. {module.moduleTitle}
                  </h3>
                  <p className="text-sm text-gray-600 capitalize">
                    {module.moduleType.replace('_', ' ')}
                    {module.isRequired && (
                      <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">
                        Required
                      </span>
                    )}
                  </p>
                </div>
                {module.score !== null && (
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{module.score}%</p>
                    {module.passed !== null && (
                      <p
                        className={`text-xs font-medium ${
                          module.passed ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {module.passed ? 'Passed' : 'Failed'}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              {module.status !== 'completed' && (
                <div className="mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">Progress</span>
                    <span className="text-xs font-semibold text-gray-900">
                      {Math.round(module.completionPercent)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${module.completionPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center gap-4 text-xs text-gray-600">
                {module.timeSpent > 0 && (
                  <span>Time: {formatTime(module.timeSpent)}</span>
                )}
                {module.attempts > 0 && <span>Attempts: {module.attempts}</span>}
                {module.lastAccessedAt && (
                  <span>
                    Last accessed: {new Date(module.lastAccessedAt).toLocaleDateString()}
                  </span>
                )}
              </div>

              {/* Completion Date */}
              {module.completedAt && (
                <p className="text-xs text-green-600 mt-1">
                  Completed on {new Date(module.completedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}

      {modules.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No modules available</p>
        </div>
      )}
    </div>
  );
}
