/**
 * Essay Question Component
 * Textarea for long-form answers with word count
 */

import { useState, useEffect, useRef } from 'react';
import type { ExamQuestion } from '@/entities/exam-attempt/model/types';

export interface EssayQuestionProps {
  question: ExamQuestion;
  answer: string | undefined;
  onAnswerChange: (value: string | string[]) => void;
  isReview?: boolean;
  showCorrectAnswer?: boolean;
  className?: string;
  maxWords?: number;
}

export function EssayQuestion({
  question,
  answer,
  onAnswerChange,
  isReview = false,
  showCorrectAnswer = false,
  className = '',
  maxWords = 1000,
}: EssayQuestionProps) {
  const [value, setValue] = useState(answer || '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setValue(answer || '');
  }, [answer]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    onAnswerChange(newValue);
  };

  const wordCount = value.trim().split(/\s+/).filter(Boolean).length;
  const charCount = value.length;

  return (
    <div className={`space-y-3 ${className}`}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        disabled={isReview}
        placeholder="Write your essay answer here..."
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:opacity-70 min-h-[200px] resize-none"
        aria-label="Essay answer textarea"
        rows={8}
      />
      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>Words: {wordCount}</span>
        <span>Characters: {charCount}</span>
      </div>
      {maxWords && wordCount > maxWords && (
        <p className="text-sm text-red-600">
          Word limit exceeded: {wordCount} / {maxWords} words
        </p>
      )}
      {showCorrectAnswer && question.explanation && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-medium text-blue-800 mb-1">Grading Criteria / Sample Answer:</p>
          <p className="text-blue-700 whitespace-pre-wrap">{question.explanation}</p>
        </div>
      )}
    </div>
  );
}
