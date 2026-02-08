/**
 * Fill in the Blank Question Component
 * Inline blank input renderer that parses [blank] or ___ markers
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { ExamQuestion } from '@/entities/exam-attempt/model/types';

export interface FillInBlankQuestionProps {
  question: ExamQuestion & {
    correctAnswers?: string[];
  };
  answers: string[] | undefined;
  onAnswerChange: (value: string | string[]) => void;
  isReview?: boolean;
  showCorrectAnswer?: boolean;
  className?: string;
}

interface TextSegment {
  type: 'text' | 'blank';
  content: string;
  blankIndex?: number;
}

/**
 * Parse question text to identify blanks marked by [blank] or ___ (3+ underscores)
 */
function parseQuestionText(text: string): TextSegment[] {
  // Pattern matches [blank], [BLANK], ___+ (3 or more underscores)
  const blankPattern = /\[blank\]|\[BLANK\]|_{3,}/gi;
  const segments: TextSegment[] = [];

  let lastIndex = 0;
  let blankIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = blankPattern.exec(text)) !== null) {
    // Add text before the blank
    if (match.index > lastIndex) {
      segments.push({
        type: 'text',
        content: text.slice(lastIndex, match.index),
      });
    }

    // Add the blank
    segments.push({
      type: 'blank',
      content: '',
      blankIndex: blankIndex,
    });
    blankIndex++;

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text after the last blank
  if (lastIndex < text.length) {
    segments.push({
      type: 'text',
      content: text.slice(lastIndex),
    });
  }

  // If no blanks found, treat the whole text as a single text segment
  if (segments.length === 0) {
    segments.push({
      type: 'text',
      content: text,
    });
  }

  return segments;
}

export function FillInBlankQuestion({
  question,
  answers,
  onAnswerChange,
  isReview = false,
  showCorrectAnswer = false,
  className = '',
}: FillInBlankQuestionProps) {
  const segments = useMemo(() => parseQuestionText(question.questionText), [question.questionText]);

  const blankCount = useMemo(
    () => segments.filter((s) => s.type === 'blank').length,
    [segments]
  );

  // Get correct answers from either correctAnswers array or legacy correctAnswer field
  const correctAnswers: string[] = question.correctAnswers ??
    (Array.isArray(question.correctAnswer)
      ? question.correctAnswer
      : question.correctAnswer
        ? [question.correctAnswer]
        : []);

  const [blankValues, setBlankValues] = useState<string[]>(
    answers || Array(blankCount).fill('')
  );

  useEffect(() => {
    const newValues = answers || Array(blankCount).fill('');
    // Ensure array is the right length
    while (newValues.length < blankCount) {
      newValues.push('');
    }
    setBlankValues(newValues.slice(0, blankCount));
  }, [answers, blankCount]);

  const handleBlankChange = useCallback(
    (index: number, value: string) => {
      if (isReview) return;

      const newValues = [...blankValues];
      newValues[index] = value;
      setBlankValues(newValues);
      onAnswerChange(newValues);
    },
    [isReview, blankValues, onAnswerChange]
  );

  const isBlankCorrect = useCallback(
    (index: number) => {
      if (!showCorrectAnswer || index >= correctAnswers.length) return null;

      const userAnswer = (blankValues[index] || '').trim().toLowerCase();
      const correct = (correctAnswers[index] || '').trim().toLowerCase();

      // Allow for multiple accepted answers separated by |
      const acceptedAnswers = correct.split('|').map((a) => a.trim().toLowerCase());
      return acceptedAnswers.includes(userAnswer);
    },
    [showCorrectAnswer, blankValues, correctAnswers]
  );

  const getInputClassName = (index: number) => {
    const baseClasses =
      'inline-block min-w-[120px] max-w-[200px] px-2 py-1 mx-1 border-b-2 text-center focus:outline-none transition-colors';

    if (!showCorrectAnswer) {
      return `${baseClasses} border-primary/60 focus:border-primary bg-primary/10`;
    }

    const correct = isBlankCorrect(index);
    if (correct === true) {
      return `${baseClasses} border-emerald-500 bg-emerald-500/10 text-emerald-900 dark:text-emerald-300`;
    }
    if (correct === false) {
      return `${baseClasses} border-destructive bg-destructive/10 text-destructive`;
    }
    return `${baseClasses} border-border bg-muted`;
  };

  // If no blanks found, show a fallback UI
  if (blankCount === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        <p className="text-foreground">{question.questionText}</p>
        <p className="text-sm text-amber-600">
          Note: No blanks detected in this question. Use [blank] or ___ markers to indicate blanks.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <p className="text-sm text-muted-foreground mb-2">
        Fill in the blank{blankCount > 1 ? 's' : ''} below.
      </p>

      {/* Question text with inline blanks */}
      <div className="text-lg leading-loose text-foreground">
        {segments.map((segment, idx) => {
          if (segment.type === 'text') {
            return <span key={idx}>{segment.content}</span>;
          }

          const blankIdx = segment.blankIndex!;
          const isCorrect = isBlankCorrect(blankIdx);

          return (
            <span key={idx} className="relative inline-block">
              <input
                type="text"
                value={blankValues[blankIdx] || ''}
                onChange={(e) => handleBlankChange(blankIdx, e.target.value)}
                disabled={isReview}
                className={getInputClassName(blankIdx)}
                placeholder={`Blank ${blankIdx + 1}`}
                aria-label={`Blank ${blankIdx + 1} of ${blankCount}`}
              />
              {showCorrectAnswer && (
                <span
                  className={`absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    isCorrect
                      ? 'bg-emerald-500 text-white'
                      : 'bg-destructive text-destructive-foreground'
                  }`}
                  aria-label={isCorrect ? 'Correct' : 'Incorrect'}
                >
                  {isCorrect ? '\u2713' : '\u2717'}
                </span>
              )}
            </span>
          );
        })}
      </div>

      {/* Show correct answers in review mode */}
      {showCorrectAnswer && (
        <div className="mt-4 p-4 bg-muted rounded-lg border border-border">
          <p className="text-sm font-medium text-foreground mb-2">Correct answers:</p>
          <div className="space-y-1">
            {correctAnswers.map((answer, index) => {
              const userAnswer = blankValues[index] || '';
              const isCorrect = isBlankCorrect(index);

              return (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-muted-foreground">Blank {index + 1}:</span>
                  {isCorrect ? (
                    <span className="text-emerald-600 dark:text-emerald-400">{userAnswer}</span>
                  ) : (
                    <>
                      {userAnswer && (
                        <span className="text-destructive line-through">{userAnswer}</span>
                      )}
                      <span className="text-emerald-600 dark:text-emerald-400">{answer}</span>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
