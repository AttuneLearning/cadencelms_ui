/**
 * Quiz Scores List Component
 * Displays assessment scores and results
 */

import type { Assessment } from '@/entities/progress/model/types';

export interface QuizScoresListProps {
  assessments: Assessment[];
  className?: string;
}

export function QuizScoresList({ assessments, className = '' }: QuizScoresListProps) {
  const getStatusBadge = (assessment: Assessment) => {
    if (assessment.status === 'grading') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Grading
        </span>
      );
    }
    if (assessment.status === 'completed' && assessment.passed !== null) {
      return assessment.passed ? (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Passed
        </span>
      ) : (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Failed
        </span>
      );
    }
    if (assessment.status === 'in_progress') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          In Progress
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        Not Started
      </span>
    );
  };

  const getScoreColor = (assessment: Assessment) => {
    if (assessment.score === null) return 'text-gray-400';
    if (assessment.passed) return 'text-green-600';
    return 'text-red-600';
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assessment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Score
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Attempts
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Attempt
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {assessments.map((assessment) => (
              <tr key={assessment.assessmentId} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{assessment.title}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600 capitalize">
                    {assessment.type}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className={`text-sm font-semibold ${getScoreColor(assessment)}`}>
                    {assessment.score !== null
                      ? `${assessment.score} / ${assessment.maxScore}`
                      : '-'}
                  </div>
                  {assessment.score !== null && (
                    <div className="text-xs text-gray-500">
                      {Math.round((assessment.score / assessment.maxScore) * 100)}%
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="text-sm text-gray-900">
                    {assessment.attempts}
                    {assessment.maxAttempts && ` / ${assessment.maxAttempts}`}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {getStatusBadge(assessment)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">
                    {assessment.lastAttemptAt
                      ? new Date(assessment.lastAttemptAt).toLocaleDateString()
                      : '-'}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {assessments.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No assessments available</p>
          </div>
        )}
      </div>
    </div>
  );
}
