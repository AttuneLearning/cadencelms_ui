/**
 * Question Navigator Component
 * Displays question numbers with status indicators
 */

import type { ExamQuestion } from '@/entities/exam-attempt/model/types';

export interface QuestionNavigatorProps {
  questions: ExamQuestion[];
  currentQuestionIndex: number;
  answeredQuestions: Set<string>;
  markedForReview: Set<string>;
  onQuestionSelect: (index: number) => void;
  className?: string;
}

export function QuestionNavigator({
  questions,
  currentQuestionIndex,
  answeredQuestions,
  markedForReview,
  onQuestionSelect,
  className = '',
}: QuestionNavigatorProps) {
  const getQuestionStatus = (question: ExamQuestion, index: number) => {
    if (index === currentQuestionIndex) return 'current';
    if (markedForReview.has(question.id)) return 'review';
    if (answeredQuestions.has(question.id)) return 'answered';
    return 'unanswered';
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'current':
        return 'bg-blue-600 text-white border-blue-600 ring-2 ring-blue-300';
      case 'review':
        return 'bg-yellow-100 text-yellow-800 border-yellow-400';
      case 'answered':
        return 'bg-green-100 text-green-800 border-green-400';
      default:
        return 'bg-white text-gray-600 border-gray-300 hover:border-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'review':
        return (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" />
            </svg>
          </span>
        );
      case 'answered':
        return (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`} data-testid="question-navigator">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Questions</h3>
      <div className="grid grid-cols-5 gap-2">
        {questions.map((question, index) => {
          const status = getQuestionStatus(question, index);
          return (
            <button
              key={question.id}
              onClick={() => onQuestionSelect(index)}
              className={`relative h-10 w-10 rounded-lg border-2 font-medium text-sm transition-all ${getStatusStyles(
                status
              )} ${status === 'current' ? 'active' : ''}`}
              aria-label={`Question ${index + 1}`}
              aria-current={index === currentQuestionIndex ? 'step' : undefined}
            >
              {index + 1}
              {getStatusIcon(status)}
            </button>
          );
        })}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <div className="w-4 h-4 rounded border-2 border-blue-600 bg-blue-600"></div>
          <span>Current</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <div className="w-4 h-4 rounded border-2 border-green-400 bg-green-100"></div>
          <span>Answered</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <div className="w-4 h-4 rounded border-2 border-yellow-400 bg-yellow-100"></div>
          <span>Review</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <div className="w-4 h-4 rounded border-2 border-gray-300 bg-white"></div>
          <span>Unanswered</span>
        </div>
      </div>
    </div>
  );
}
