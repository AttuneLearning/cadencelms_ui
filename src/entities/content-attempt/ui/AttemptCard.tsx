/**
 * AttemptCard Component
 * Displays a single content attempt with status, progress, and actions
 */

import type { ContentAttempt } from '../model/types';
import { getAttemptStatusLabel, getAttemptStatusColor, formatAttemptDuration } from '../lib/attemptUtils';
import { AttemptProgress } from './AttemptProgress';

interface AttemptCardProps {
  attempt: ContentAttempt;
  onClick?: (attempt: ContentAttempt) => void;
  onResume?: (attemptId: string) => void;
  onContinue?: (attemptId: string) => void;
  showActions?: boolean;
}

export function AttemptCard({
  attempt,
  onClick,
  onResume,
  onContinue,
  showActions = true,
}: AttemptCardProps) {
  const statusColor = getAttemptStatusColor(attempt.status);
  const statusLabel = getAttemptStatusLabel(attempt.status);

  const handleClick = () => {
    if (onClick) {
      onClick(attempt);
    }
  };

  const handleResume = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onResume) {
      onResume(attempt.id);
    }
  };

  const handleContinue = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onContinue) {
      onContinue(attempt.id);
    }
  };

  const canResume = attempt.status === 'suspended';
  const canContinue = attempt.status === 'started' || attempt.status === 'in-progress';

  return (
    <article
      className={`attempt-card rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={handleClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">
            {attempt.content?.title || 'Content'}
          </h3>
          <p className="text-sm text-gray-600">Attempt #{attempt.attemptNumber}</p>
        </div>

        {/* Status Badge */}
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            statusColor === 'green'
              ? 'bg-green-100 text-green-800'
              : statusColor === 'blue'
                ? 'bg-blue-100 text-blue-800'
                : statusColor === 'red'
                  ? 'bg-red-100 text-red-800'
                  : statusColor === 'yellow'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
          }`}
        >
          {statusLabel}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <AttemptProgress
          progress={attempt.progressPercent || 0}
          status={attempt.status}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
        {/* Score */}
        {attempt.score !== null && attempt.score !== undefined && (
          <div>
            <span className="text-gray-600">Score: </span>
            <span className="font-medium text-gray-900">{attempt.score}%</span>
          </div>
        )}

        {/* Time Spent */}
        <div>
          <span className="text-gray-600">Time Spent: </span>
          <span className="font-medium text-gray-900">
            {formatAttemptDuration(attempt.timeSpentSeconds)}
          </span>
        </div>

        {/* Started At */}
        {attempt.startedAt && (
          <div>
            <span className="text-gray-600">Started: </span>
            <span className="font-medium text-gray-900">
              {new Date(attempt.startedAt).toLocaleDateString()}
            </span>
          </div>
        )}

        {/* Completed At */}
        {attempt.completedAt && (
          <div>
            <span className="text-gray-600">Completed: </span>
            <span className="font-medium text-gray-900">
              {new Date(attempt.completedAt).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      {showActions && (canResume || canContinue) && (
        <div className="flex gap-2 pt-3 border-t border-gray-200">
          {canResume && (
            <button
              onClick={handleResume}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Resume
            </button>
          )}
          {canContinue && (
            <button
              onClick={handleContinue}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Continue
            </button>
          )}
        </div>
      )}
    </article>
  );
}
