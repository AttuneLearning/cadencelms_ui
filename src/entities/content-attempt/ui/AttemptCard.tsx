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
      className={`attempt-card rounded-lg border border-border bg-card p-4 shadow-sm hover:shadow-md transition-shadow ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={handleClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground">
            {attempt.content?.title || 'Content'}
          </h3>
          <p className="text-sm text-muted-foreground">Attempt #{attempt.attemptNumber}</p>
        </div>

        {/* Status Badge */}
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            statusColor === 'green'
              ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300'
              : statusColor === 'blue'
                ? 'bg-primary/10 text-primary'
                : statusColor === 'red'
                  ? 'bg-destructive/10 text-destructive'
                  : statusColor === 'yellow'
                    ? 'bg-yellow-500/10 text-yellow-800 dark:text-yellow-300'
                    : 'bg-muted text-muted-foreground'
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
            <span className="text-muted-foreground">Score: </span>
            <span className="font-medium text-foreground">{attempt.score}%</span>
          </div>
        )}

        {/* Time Spent */}
        <div>
          <span className="text-muted-foreground">Time Spent: </span>
          <span className="font-medium text-foreground">
            {formatAttemptDuration(attempt.timeSpentSeconds)}
          </span>
        </div>

        {/* Started At */}
        {attempt.startedAt && (
          <div>
            <span className="text-muted-foreground">Started: </span>
            <span className="font-medium text-foreground">
              {new Date(attempt.startedAt).toLocaleDateString()}
            </span>
          </div>
        )}

        {/* Completed At */}
        {attempt.completedAt && (
          <div>
            <span className="text-muted-foreground">Completed: </span>
            <span className="font-medium text-foreground">
              {new Date(attempt.completedAt).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      {showActions && (canResume || canContinue) && (
        <div className="flex gap-2 pt-3 border-t border-border">
          {canResume && (
            <button
              onClick={handleResume}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Resume
            </button>
          )}
          {canContinue && (
            <button
              onClick={handleContinue}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Continue
            </button>
          )}
        </div>
      )}
    </article>
  );
}
