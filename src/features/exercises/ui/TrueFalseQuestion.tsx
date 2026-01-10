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

    if (isCorrect && isSelected) return 'bg-green-50 border-green-300';
    if (isCorrect) return 'bg-green-50 border-green-200';
    if (isSelected) return 'bg-red-50 border-red-300';

    return '';
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {options.map((option) => (
        <label
          key={option}
          className={`flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
            selectedAnswer === option ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          } ${getOptionClassName(option)} ${isReview ? 'cursor-default' : ''}`}
        >
          <input
            type="radio"
            name={`question-${question.id}`}
            value={option}
            checked={selectedAnswer === option}
            onChange={(e) => !isReview && onAnswerChange(e.target.value)}
            disabled={isReview}
            className="w-5 h-5 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
            aria-label={option}
          />
          <span className="ml-3 text-lg font-medium text-gray-900">{option}</span>
          {showCorrectAnswer && question.correctAnswer === option && (
            <span className="ml-auto text-green-600 font-medium">Correct Answer</span>
          )}
        </label>
      ))}
    </div>
  );
}
