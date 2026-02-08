/**
 * AttemptHistory Component
 * Displays list of past content attempts
 */

import type { ContentAttempt } from '../model/types';
import { AttemptCard } from './AttemptCard';

interface AttemptHistoryProps {
  attempts: ContentAttempt[];
  isLoading?: boolean;
  onAttemptClick?: (attempt: ContentAttempt) => void;
  onResume?: (attemptId: string) => void;
  onContinue?: (attemptId: string) => void;
  emptyMessage?: string;
}

export function AttemptHistory({
  attempts,
  isLoading = false,
  onAttemptClick,
  onResume,
  onContinue,
  emptyMessage = 'No attempts found',
}: AttemptHistoryProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse bg-muted rounded-lg h-32"
          />
        ))}
      </div>
    );
  }

  if (attempts.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="mt-2 text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {attempts.map((attempt) => (
        <AttemptCard
          key={attempt.id}
          attempt={attempt}
          onClick={onAttemptClick}
          onResume={onResume}
          onContinue={onContinue}
        />
      ))}
    </div>
  );
}
