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
      <p className="text-sm text-muted-foreground mb-4">
        Match each item on the left with its corresponding answer on the right.
      </p>
      {prompts.map((prompt, index) => (
        <div key={index} className="flex items-center gap-4 p-3 bg-muted rounded-lg">
          <div className="flex-1">
            <span className="font-medium text-foreground">{prompt}</span>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="flex-1">
            <select
              value={selections[index] || ''}
              onChange={(e) => handleSelectionChange(index, e.target.value)}
              disabled={isReview}
              className="w-full px-3 py-2 border border-input rounded-md focus:ring-2 focus:ring-ring focus:border-ring disabled:bg-muted disabled:opacity-70"
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
                <span className="text-emerald-600 dark:text-emerald-400 text-sm font-medium">Correct</span>
              ) : (
                <div className="text-sm">
                  <span className="text-destructive">Incorrect</span>
                  <p className="text-muted-foreground mt-1">Correct: {getCorrectMatch(index)}</p>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
