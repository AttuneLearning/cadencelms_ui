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
        ? 'border-blue-500 bg-blue-50'
        : 'border-gray-300';
    }

    const isCorrect = isOptionCorrect(option);
    const isSelected = isOptionSelected(option);

    // Correct and selected - green success
    if (isCorrect && isSelected) {
      return 'bg-green-50 border-green-400';
    }
    // Correct but not selected - subtle green to show it should have been selected
    if (isCorrect && !isSelected) {
      return 'bg-green-50 border-green-200';
    }
    // Incorrect but selected - red error
    if (!isCorrect && isSelected) {
      return 'bg-red-50 border-red-400';
    }
    // Incorrect and not selected - default
    return 'border-gray-300';
  };

  const getCheckboxClassName = (option: string) => {
    if (!showCorrectAnswer) {
      return 'text-blue-600 focus:ring-blue-500';
    }

    const isCorrect = isOptionCorrect(option);
    const isSelected = isOptionSelected(option);

    if (isCorrect && isSelected) return 'text-green-600 focus:ring-green-500';
    if (isCorrect && !isSelected) return 'text-green-400 focus:ring-green-400';
    if (!isCorrect && isSelected) return 'text-red-600 focus:ring-red-500';
    return 'text-gray-400 focus:ring-gray-400';
  };

  const getFeedbackText = (option: string) => {
    if (!showCorrectAnswer) return null;

    const isCorrect = isOptionCorrect(option);
    const isSelected = isOptionSelected(option);

    if (isCorrect && isSelected) return { text: 'Correct', className: 'text-green-600' };
    if (isCorrect && !isSelected) return { text: 'Should be selected', className: 'text-green-600' };
    if (!isCorrect && isSelected) return { text: 'Incorrect', className: 'text-red-600' };
    return null;
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <p className="text-sm text-gray-600 mb-2">
        Select all that apply.
      </p>
      {options.map((option, index) => {
        const feedback = getFeedbackText(option);
        return (
          <label
            key={index}
            className={`flex items-center p-3 border rounded-lg transition-colors ${
              isReview ? 'cursor-default' : 'cursor-pointer hover:bg-gray-50'
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
            <span className="ml-3 text-gray-900 flex-1">{option}</span>
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
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Your selections:</span>{' '}
            {selections.length > 0 ? selections.join(', ') : 'None'}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            <span className="font-medium">Correct answers:</span>{' '}
            {correctAnswers.length > 0 ? correctAnswers.join(', ') : 'None specified'}
          </p>
        </div>
      )}
    </div>
  );
}
