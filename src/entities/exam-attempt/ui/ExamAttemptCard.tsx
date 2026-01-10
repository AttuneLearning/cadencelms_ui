/**
 * Exam Attempt Card Component
 * Displays a single exam attempt in a card format
 */

import type { ExamAttemptListItem } from '../model/types';
import { calculateGradeLetter, getGradeColor } from '../lib/gradingUtils';
import { formatTimeRemaining } from '../lib/timerUtils';

export interface ExamAttemptCardProps {
  attempt: ExamAttemptListItem;
  onClick?: (attempt: ExamAttemptListItem) => void;
  showLearnerInfo?: boolean;
  className?: string;
}

export function ExamAttemptCard({
  attempt,
  onClick,
  showLearnerInfo = false,
  className = '',
}: ExamAttemptCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'started':
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'submitted':
      case 'grading':
        return 'bg-yellow-100 text-yellow-800';
      case 'graded':
        return attempt.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
  };

  const gradeLetter = attempt.gradeLetter || calculateGradeLetter(attempt.percentage);
  const gradeColor = getGradeColor(gradeLetter);

  const handleClick = () => {
    if (onClick) {
      onClick(attempt);
    }
  };

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
      onClick={handleClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleClick();
        }
      }}
      data-testid="exam-attempt-card"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{attempt.examTitle}</h3>
          {showLearnerInfo && (
            <p className="text-sm text-gray-600 mb-2">{attempt.learnerName}</p>
          )}
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                attempt.status
              )}`}
            >
              {getStatusLabel(attempt.status)}
            </span>
            <span className="text-sm text-gray-500">Attempt #{attempt.attemptNumber}</span>
          </div>
        </div>

        {attempt.status === 'graded' && (
          <div className="text-right ml-4">
            <div className={`text-3xl font-bold text-${gradeColor}-600`}>{gradeLetter}</div>
            <div className="text-sm text-gray-600">
              {attempt.score}/{attempt.maxScore}
            </div>
            <div className="text-xs text-gray-500">{attempt.percentage.toFixed(1)}%</div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-600">Started:</span>
          <span className="ml-2 text-gray-900">
            {new Date(attempt.startedAt).toLocaleDateString()}
          </span>
        </div>

        {attempt.submittedAt && (
          <div>
            <span className="text-gray-600">Submitted:</span>
            <span className="ml-2 text-gray-900">
              {new Date(attempt.submittedAt).toLocaleDateString()}
            </span>
          </div>
        )}

        {attempt.timeSpent > 0 && (
          <div>
            <span className="text-gray-600">Time Spent:</span>
            <span className="ml-2 text-gray-900">{formatTimeRemaining(attempt.timeSpent)}</span>
          </div>
        )}

        {attempt.status === 'graded' && (
          <div>
            <span className="text-gray-600">Status:</span>
            <span
              className={`ml-2 font-medium ${
                attempt.passed ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {attempt.passed ? 'Passed' : 'Failed'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
