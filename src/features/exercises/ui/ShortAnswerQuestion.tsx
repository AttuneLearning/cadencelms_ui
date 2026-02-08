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
        className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-ring disabled:bg-muted disabled:opacity-70"
        aria-label="Short answer input"
      />
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <span>
          {value.length} / {maxLength} characters
        </span>
      </div>
      {showCorrectAnswer && question.correctAnswer && (
        <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
          <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300 mb-1">Sample Correct Answer:</p>
          <p className="text-emerald-700 dark:text-emerald-400">{question.correctAnswer}</p>
        </div>
      )}
    </div>
  );
}
