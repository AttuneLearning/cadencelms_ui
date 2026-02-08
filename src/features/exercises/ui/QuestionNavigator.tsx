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
        return 'bg-primary text-primary-foreground border-primary ring-2 ring-ring';
      case 'review':
        return 'bg-yellow-500/10 text-yellow-800 dark:text-yellow-300 border-yellow-500/40';
      case 'answered':
        return 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/40';
      default:
        return 'bg-background text-muted-foreground border-border hover:border-muted-foreground';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'current': return 'current';
      case 'review': return 'marked for review';
      case 'answered': return 'answered';
      default: return 'unanswered';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'review':
        return (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center" aria-hidden="true">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" />
            </svg>
          </span>
        );
      case 'answered':
        return (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center" aria-hidden="true">
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
    <div className={`bg-card border border-border rounded-lg p-4 ${className}`} data-testid="question-navigator">
      <h3 className="text-sm font-semibold text-foreground mb-3">Questions</h3>
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
              aria-label={`Question ${index + 1}, ${getStatusLabel(status)}`}
              aria-current={index === currentQuestionIndex ? 'step' : undefined}
            >
              {index + 1}
              {getStatusIcon(status)}
            </button>
          );
        })}
      </div>
      <div className="mt-4 pt-4 border-t border-border space-y-2" role="legend" aria-label="Question status legend">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-4 h-4 rounded border-2 border-primary bg-primary flex items-center justify-center" aria-hidden="true">
            <span className="text-[8px] text-primary-foreground font-bold">&#9679;</span>
          </div>
          <span>Current</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-4 h-4 rounded border-2 border-emerald-500/40 bg-emerald-500/10 flex items-center justify-center" aria-hidden="true">
            <svg className="w-3 h-3 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
          </div>
          <span>Answered</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-4 h-4 rounded border-2 border-yellow-500/40 bg-yellow-500/10 flex items-center justify-center" aria-hidden="true">
            <svg className="w-3 h-3 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" /></svg>
          </div>
          <span>Marked for review</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-4 h-4 rounded border-2 border-border bg-background flex items-center justify-center" aria-hidden="true">
            <span className="text-[8px] text-muted-foreground">&#9675;</span>
          </div>
          <span>Unanswered</span>
        </div>
      </div>
    </div>
  );
}
