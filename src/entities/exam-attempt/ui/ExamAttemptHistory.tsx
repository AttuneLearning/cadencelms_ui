/**
 * Exam Attempt History Component
 * Displays list of past exam attempts
 */

import type { ExamAttemptListItem } from '../model/types';
import { ExamAttemptCard } from './ExamAttemptCard';

export interface ExamAttemptHistoryProps {
  attempts: ExamAttemptListItem[];
  onAttemptClick?: (attempt: ExamAttemptListItem) => void;
  showLearnerInfo?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function ExamAttemptHistory({
  attempts,
  onAttemptClick,
  showLearnerInfo = false,
  emptyMessage = 'No previous attempts found',
  className = '',
}: ExamAttemptHistoryProps) {
  if (attempts.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`} data-testid="empty-message">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`} data-testid="exam-attempt-history">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Attempt History ({attempts.length})
      </h2>
      <div className="space-y-3">
        {attempts.map((attempt) => (
          <ExamAttemptCard
            key={attempt.id}
            attempt={attempt}
            onClick={onAttemptClick}
            showLearnerInfo={showLearnerInfo}
          />
        ))}
      </div>
    </div>
  );
}
