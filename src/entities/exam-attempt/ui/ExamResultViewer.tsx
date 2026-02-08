/**
 * Exam Result Viewer Component
 * Displays detailed exam results with score, feedback, and question results
 */

import type { ExamResult } from '../model/types';
import { getGradeColor, getGradeDescription } from '../lib/gradingUtils';
import { formatTimeRemaining } from '../lib/timerUtils';

export interface ExamResultViewerProps {
  result: ExamResult;
  gradingPolicy?: 'best' | 'last' | 'average';
  className?: string;
}

function getGradingPolicyLabel(policy?: 'best' | 'last' | 'average'): string | null {
  switch (policy) {
    case 'best': return 'Best Attempt';
    case 'last': return 'Latest Attempt';
    case 'average': return 'Average of Attempts';
    default: return null;
  }
}

export function ExamResultViewer({ result, gradingPolicy, className = '' }: ExamResultViewerProps) {
  const gradeColor = getGradeColor(result.gradeLetter);
  const gradeDescription = getGradeDescription(result.gradeLetter);
  const gradingPolicyLabel = getGradingPolicyLabel(gradingPolicy);

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header Section */}
      <div className={`p-6 border-b border-gray-200 ${result.passed ? 'bg-green-50' : 'bg-red-50'}`}>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{result.examTitle}</h1>
            <p className="text-sm text-gray-600">
              Attempt #{result.attemptNumber} by {result.learnerName}
            </p>
          </div>
          <div className="text-right">
            <div className={`text-5xl font-bold text-${gradeColor}-600 mb-1`}>
              {result.gradeLetter}
            </div>
            <p className={`text-sm font-medium text-${gradeColor}-600`}>{gradeDescription}</p>
          </div>
        </div>
      </div>

      {/* Score Summary */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Score Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">
              {gradingPolicyLabel ? `Score (${gradingPolicyLabel})` : 'Score'}
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {result.score}/{result.maxScore}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Percentage</p>
            <p className="text-2xl font-bold text-gray-900">{result.percentage.toFixed(1)}%</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Passing Score</p>
            <p className="text-2xl font-bold text-gray-900">{result.passingScore}%</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Status</p>
            <p
              className={`text-2xl font-bold ${
                result.passed ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {result.passed ? 'Passed' : 'Failed'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div>
            <p className="text-sm text-gray-600">Correct Answers</p>
            <p className="text-lg font-semibold text-green-600">{result.summary.correctCount}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Incorrect Answers</p>
            <p className="text-lg font-semibold text-red-600">{result.summary.incorrectCount}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Unanswered</p>
            <p className="text-lg font-semibold text-gray-600">
              {result.summary.unansweredCount}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Time Spent</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatTimeRemaining(result.timeSpent)}
            </p>
          </div>
        </div>
      </div>

      {/* Overall Feedback */}
      {result.overallFeedback && (
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Instructor Feedback</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{result.overallFeedback}</p>
          {result.gradedBy && (
            <p className="text-sm text-gray-500 mt-2">
              Graded by {result.gradedBy.firstName} {result.gradedBy.lastName} on{' '}
              {new Date(result.gradedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      )}

      {/* Question Results */}
      {result.showCorrectAnswers && result.allowReview && (
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Question Results ({result.summary.totalQuestions})
          </h2>
          <div className="space-y-4">
            {result.questionResults.map((question, index) => (
              <div
                key={question.id}
                className={`p-4 rounded-lg border ${
                  question.isCorrect
                    ? 'border-green-200 bg-green-50'
                    : question.isCorrect === false
                      ? 'border-red-200 bg-red-50'
                      : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Question {index + 1}
                      <span className="ml-2 text-sm font-normal text-gray-600">
                        ({question.points} points)
                      </span>
                    </h3>
                    <p className="text-gray-700">{question.questionText}</p>
                  </div>
                  <div className="ml-4 text-right">
                    <p className="text-sm font-medium text-gray-600">Score</p>
                    <p className="text-lg font-bold text-gray-900">
                      {question.scoreEarned || 0}/{question.points}
                    </p>
                  </div>
                </div>

                {question.userAnswer && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">Your Answer:</p>
                    <p className="text-gray-900">
                      {Array.isArray(question.userAnswer)
                        ? question.userAnswer.join(', ')
                        : question.userAnswer}
                    </p>
                  </div>
                )}

                {question.correctAnswer && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-gray-700 mb-1">Correct Answer:</p>
                    <p className="text-green-700 font-medium">
                      {Array.isArray(question.correctAnswer)
                        ? question.correctAnswer.join(', ')
                        : question.correctAnswer}
                    </p>
                  </div>
                )}

                {question.explanation && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-gray-700 mb-1">Explanation:</p>
                    <p className="text-gray-600 text-sm">{question.explanation}</p>
                  </div>
                )}

                {question.feedback && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-gray-700 mb-1">Feedback:</p>
                    <p className="text-gray-600 text-sm">{question.feedback}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {!result.allowReview && (
        <div className="p-6 text-center text-gray-500">
          <p>Review is not allowed for this exam.</p>
        </div>
      )}
    </div>
  );
}
