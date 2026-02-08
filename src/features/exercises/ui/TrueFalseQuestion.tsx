/**
 * True/False Question Component
 * Two radio buttons for True/False selection
 */

import type { ExamQuestion } from '@/entities/exam-attempt/model/types';

export interface TrueFalseQuestionProps {
  question: ExamQuestion;
  selectedAnswer: string | undefined;
  onAnswerChange: (value: string | string[]) => void;
  isReview?: boolean;
  showCorrectAnswer?: boolean;
  className?: string;
}

export function TrueFalseQuestion({
  question,
  selectedAnswer,
  onAnswerChange,
  isReview = false,
  showCorrectAnswer = false,
  className = '',
}: TrueFalseQuestionProps) {
  const options = ['True', 'False'];

  const getOptionClassName = (option: string) => {
    if (!showCorrectAnswer) return '';

    const isCorrect = question.correctAnswer === option;
    const isSelected = selectedAnswer === option;

    if (isCorrect && isSelected) return 'bg-emerald-500/10 border-emerald-500/30';
    if (isCorrect) return 'bg-emerald-500/10 border-emerald-500/20';
    if (isSelected) return 'bg-destructive/10 border-destructive/30';

    return '';
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {options.map((option) => (
        <label
          key={option}
          className={`flex items-center p-4 border rounded-lg cursor-pointer hover:bg-muted transition-colors ${
            selectedAnswer === option ? 'border-primary bg-primary/10' : 'border-input'
          } ${getOptionClassName(option)} ${isReview ? 'cursor-default' : ''}`}
        >
          <input
            type="radio"
            name={`question-${question.id}`}
            value={option}
            checked={selectedAnswer === option}
            onChange={(e) => !isReview && onAnswerChange(e.target.value)}
            disabled={isReview}
            className="w-5 h-5 text-primary focus:ring-ring disabled:opacity-50"
            aria-label={option}
          />
          <span className="ml-3 text-lg font-medium text-foreground">{option}</span>
          {showCorrectAnswer && question.correctAnswer === option && (
            <span className="ml-auto text-emerald-600 dark:text-emerald-400 font-medium">Correct Answer</span>
          )}
        </label>
      ))}
    </div>
  );
}
