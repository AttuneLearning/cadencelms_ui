/**
 * Attempt History Component
 * Displays a table of previous exam attempts with score, date, and pass/fail status
 */

import type { ExamAttemptListItem } from '../model/types';
import { formatTimeRemaining } from '../lib/timerUtils';
import { Badge } from '@/shared/ui/badge';

export interface AttemptHistoryProps {
  attempts: ExamAttemptListItem[];
  maxAttempts?: number | null;
  className?: string;
}

export function AttemptHistory({ attempts, maxAttempts, className = '' }: AttemptHistoryProps) {
  if (attempts.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`} data-testid="attempt-history-empty">
        No previous attempts found.
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`} data-testid="attempt-history">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          Attempt History ({maxAttempts != null
            ? `${attempts.length} of ${maxAttempts}`
            : attempts.length})
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left" data-testid="attempt-history-table">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-6 py-3 font-medium">Attempt</th>
              <th className="px-6 py-3 font-medium">Date</th>
              <th className="px-6 py-3 font-medium">Score</th>
              <th className="px-6 py-3 font-medium">Percentage</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Time Spent</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {attempts.map((attempt) => (
              <tr key={attempt.id} className="hover:bg-gray-50" data-testid="attempt-history-row">
                <td className="px-6 py-4 font-medium text-gray-900">
                  {maxAttempts != null
                    ? `${attempt.attemptNumber} of ${maxAttempts}`
                    : `#${attempt.attemptNumber}`}
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {attempt.submittedAt
                    ? new Date(attempt.submittedAt).toLocaleDateString()
                    : 'In Progress'}
                </td>
                <td className="px-6 py-4 text-gray-900">
                  {attempt.score}/{attempt.maxScore}
                </td>
                <td className="px-6 py-4 text-gray-900">
                  {attempt.percentage.toFixed(1)}%
                </td>
                <td className="px-6 py-4">
                  {attempt.status === 'graded' ? (
                    <Badge
                      className={
                        attempt.passed
                          ? 'bg-green-100 text-green-800 border-green-200'
                          : 'bg-red-100 text-red-800 border-red-200'
                      }
                    >
                      {attempt.passed ? 'Passed' : 'Failed'}
                    </Badge>
                  ) : (
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                      {attempt.status === 'submitted' ? 'Pending' : 'In Progress'}
                    </Badge>
                  )}
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {attempt.timeSpent > 0 ? formatTimeRemaining(attempt.timeSpent) : '--'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
