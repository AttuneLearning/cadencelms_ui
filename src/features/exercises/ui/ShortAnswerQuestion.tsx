/**
 * Short Answer Question Component
 * Text input field for brief answers
 */

import { useState, useEffect } from 'react';
import type { ExamQuestion } from '@/entities/exam-attempt/model/types';

export interface ShortAnswerQuestionProps {
  question: ExamQuestion;
  answer: string | undefined;
  onAnswerChange: (value: string | string[]) => void;
  isReview?: boolean;
  showCorrectAnswer?: boolean;
  className?: string;
  maxLength?: number;
}

export function ShortAnswerQuestion({
  question,
  answer,
  onAnswerChange,
  isReview = false,
  showCorrectAnswer = false,
  className = '',
  maxLength = 500,
}: ShortAnswerQuestionProps) {
  const [value, setValue] = useState(answer || '');

  useEffect(() => {
    setValue(answer || '');
  }, [answer]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    onAnswerChange(newValue);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        disabled={isReview}
        maxLength={maxLength}
        placeholder="Enter your answer..."
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:opacity-70"
        aria-label="Short answer input"
      />
      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>
          {value.length} / {maxLength} characters
        </span>
      </div>
      {showCorrectAnswer && question.correctAnswer && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm font-medium text-green-800 mb-1">Sample Correct Answer:</p>
          <p className="text-green-700">{question.correctAnswer}</p>
        </div>
      )}
    </div>
  );
}
