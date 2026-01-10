/**
 * Matching Question Component
 * Uses dropdowns for matching prompts to options
 */

import { useState, useEffect } from 'react';
import type { ExamQuestion } from '@/entities/exam-attempt/model/types';

export interface MatchingQuestionProps {
  question: ExamQuestion;
  answers: string[] | undefined;
  onAnswerChange: (value: string | string[]) => void;
  isReview?: boolean;
  showCorrectAnswer?: boolean;
  className?: string;
}

export function MatchingQuestion({
  question,
  answers,
  onAnswerChange,
  isReview = false,
  showCorrectAnswer = false,
  className = '',
}: MatchingQuestionProps) {
  // Options should be an array of strings in format "Prompt::Option"
  const options = question.options || [];
  const prompts = options.map((opt) => opt.split('::')[0]);
  const choices = options.map((opt) => opt.split('::')[1]);

  const [selections, setSelections] = useState<string[]>(
    answers || Array(prompts.length).fill('')
  );

  useEffect(() => {
    setSelections(answers || Array(prompts.length).fill(''));
  }, [answers]);

  const handleSelectionChange = (index: number, value: string) => {
    const newSelections = [...selections];
    newSelections[index] = value;
    setSelections(newSelections);
    onAnswerChange(newSelections);
  };

  const getCorrectMatch = (index: number) => {
    if (!showCorrectAnswer || !question.correctAnswer) return null;
    const correctAnswers = Array.isArray(question.correctAnswer)
      ? question.correctAnswer
      : [question.correctAnswer];
    return correctAnswers[index] || choices[index];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <p className="text-sm text-gray-600 mb-4">
        Match each item on the left with its corresponding answer on the right.
      </p>
      {prompts.map((prompt, index) => (
        <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex-1">
            <span className="font-medium text-gray-900">{prompt}</span>
          </div>
          <div className="w-px h-8 bg-gray-300" />
          <div className="flex-1">
            <select
              value={selections[index] || ''}
              onChange={(e) => handleSelectionChange(index, e.target.value)}
              disabled={isReview}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:opacity-70"
              aria-label={`Match for ${prompt}`}
            >
              <option value="">-- Select --</option>
              {choices.map((choice, choiceIndex) => (
                <option key={choiceIndex} value={choice}>
                  {choice}
                </option>
              ))}
            </select>
          </div>
          {showCorrectAnswer && (
            <div className="flex-shrink-0 w-32">
              {selections[index] === getCorrectMatch(index) ? (
                <span className="text-green-600 text-sm font-medium">Correct</span>
              ) : (
                <div className="text-sm">
                  <span className="text-red-600">Incorrect</span>
                  <p className="text-gray-600 mt-1">Correct: {getCorrectMatch(index)}</p>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
