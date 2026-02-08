/**
 * Multiple Select Question Component
 * Checkbox-based multiple answer selector
 */

import { useState, useEffect, useCallback } from 'react';
import type { ExamQuestion } from '@/entities/exam-attempt/model/types';

export interface MultipleSelectQuestionProps {
  question: ExamQuestion & {
    correctAnswers?: string[];
  };
  selectedAnswers: string[] | undefined;
  onAnswerChange: (value: string | string[]) => void;
  isReview?: boolean;
  showCorrectAnswer?: boolean;
  className?: string;
}

export function MultipleSelectQuestion({
  question,
  selectedAnswers,
  onAnswerChange,
  isReview = false,
  showCorrectAnswer = false,
  className = '',
}: MultipleSelectQuestionProps) {
  const options = question.options || [];

  // Get correct answers from either correctAnswers array or legacy correctAnswer field
  const correctAnswers: string[] = question.correctAnswers ??
    (Array.isArray(question.correctAnswer)
      ? question.correctAnswer
      : question.correctAnswer
        ? [question.correctAnswer]
        : []);

  const [selections, setSelections] = useState<string[]>(selectedAnswers || []);

  useEffect(() => {
    setSelections(selectedAnswers || []);
  }, [selectedAnswers]);

  const handleCheckboxChange = useCallback(
    (option: string, checked: boolean) => {
      if (isReview) return;

      const newSelections = checked
        ? [...selections, option]
        : selections.filter((s) => s !== option);

      setSelections(newSelections);
      onAnswerChange(newSelections);
    },
    [isReview, selections, onAnswerChange]
  );

  const isOptionCorrect = useCallback(
    (option: string) => correctAnswers.includes(option),
    [correctAnswers]
  );

  const isOptionSelected = useCallback(
    (option: string) => selections.includes(option),
    [selections]
  );

  const getOptionClassName = (option: string) => {
    if (!showCorrectAnswer) {
      return isOptionSelected(option)
        ? 'border-primary bg-primary/10'
        : 'border-input';
    }

    const isCorrect = isOptionCorrect(option);
    const isSelected = isOptionSelected(option);

    // Correct and selected - green success
    if (isCorrect && isSelected) {
      return 'bg-emerald-500/10 border-emerald-500/40';
    }
    // Correct but not selected - subtle green to show it should have been selected
    if (isCorrect && !isSelected) {
      return 'bg-emerald-500/10 border-emerald-500/20';
    }
    // Incorrect but selected - red error
    if (!isCorrect && isSelected) {
      return 'bg-destructive/10 border-destructive/40';
    }
    // Incorrect and not selected - default
    return 'border-input';
  };

  const getCheckboxClassName = (option: string) => {
    if (!showCorrectAnswer) {
      return 'text-primary focus:ring-ring';
    }

    const isCorrect = isOptionCorrect(option);
    const isSelected = isOptionSelected(option);

    if (isCorrect && isSelected) return 'text-emerald-600 focus:ring-emerald-500';
    if (isCorrect && !isSelected) return 'text-emerald-400 focus:ring-emerald-400';
    if (!isCorrect && isSelected) return 'text-destructive focus:ring-destructive';
    return 'text-muted-foreground focus:ring-ring';
  };

  const getFeedbackText = (option: string) => {
    if (!showCorrectAnswer) return null;

    const isCorrect = isOptionCorrect(option);
    const isSelected = isOptionSelected(option);

    if (isCorrect && isSelected) return { text: 'Correct', className: 'text-emerald-600 dark:text-emerald-400' };
    if (isCorrect && !isSelected) return { text: 'Should be selected', className: 'text-emerald-600 dark:text-emerald-400' };
    if (!isCorrect && isSelected) return { text: 'Incorrect', className: 'text-destructive' };
    return null;
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <p className="text-sm text-muted-foreground mb-2">
        Select all that apply.
      </p>
      {options.map((option, index) => {
        const feedback = getFeedbackText(option);
        return (
          <label
            key={index}
            className={`flex items-center p-3 border rounded-lg transition-colors ${
              isReview ? 'cursor-default' : 'cursor-pointer hover:bg-muted'
            } ${getOptionClassName(option)}`}

          >
            <input
              type="checkbox"
              name={`question-${question.id}-${index}`}
              value={option}
              checked={isOptionSelected(option)}
              onChange={(e) => handleCheckboxChange(option, e.target.checked)}
              disabled={isReview}
              className={`w-4 h-4 rounded focus:ring-2 disabled:opacity-50 ${getCheckboxClassName(option)}`}
              aria-label={option}
            />
            <span className="ml-3 text-foreground flex-1">{option}</span>
            {feedback && (
              <span className={`ml-auto text-sm font-medium ${feedback.className}`}>
                {feedback.text}
              </span>
            )}
          </label>
        );
      })}

      {/* Summary in review mode */}
      {showCorrectAnswer && (
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Your selections:</span>{' '}
            {selections.length > 0 ? selections.join(', ') : 'None'}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            <span className="font-medium">Correct answers:</span>{' '}
            {correctAnswers.length > 0 ? correctAnswers.join(', ') : 'None specified'}
          </p>
        </div>
      )}
    </div>
  );
}
