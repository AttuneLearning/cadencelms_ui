/**
 * Flashcard Question Component
 * Card flip animation with front/back content and self-assessment
 */

import { useState, useCallback } from 'react';
import type { ExamQuestion } from '@/entities/exam-attempt/model/types';
import type { FlashcardData, MediaContent } from '@/entities/question';

export interface FlashcardQuestionProps {
  question: ExamQuestion & {
    flashcardData?: FlashcardData;
    correctAnswers?: string[];
  };
  selfAssessment: 'got_it' | 'need_review' | undefined;
  onAnswerChange: (value: string | string[]) => void;
  isReview?: boolean;
  showCorrectAnswer?: boolean;
  className?: string;
}

function MediaRenderer({ media }: { media?: MediaContent }) {
  if (!media?.media) return null;

  const { media: attachment, layout = 'media_above' } = media;

  if (attachment.type === 'image') {
    return (
      <div className={`${layout === 'media_above' ? 'mb-4' : layout === 'media_below' ? 'mt-4' : ''}`}>
        <img
          src={attachment.url}
          alt={attachment.altText || 'Flashcard media'}
          className="max-w-full h-auto rounded-lg mx-auto"
        />
        {attachment.caption && (
          <p className="text-sm text-gray-500 text-center mt-2">{attachment.caption}</p>
        )}
      </div>
    );
  }

  if (attachment.type === 'video') {
    return (
      <div className={`${layout === 'media_above' ? 'mb-4' : layout === 'media_below' ? 'mt-4' : ''}`}>
        <video
          src={attachment.url}
          controls
          className="max-w-full h-auto rounded-lg mx-auto"
          aria-label={attachment.altText || 'Flashcard video'}
        />
        {attachment.caption && (
          <p className="text-sm text-gray-500 text-center mt-2">{attachment.caption}</p>
        )}
      </div>
    );
  }

  if (attachment.type === 'audio') {
    return (
      <div className={`${layout === 'media_above' ? 'mb-4' : layout === 'media_below' ? 'mt-4' : ''}`}>
        <audio
          src={attachment.url}
          controls
          className="w-full"
          aria-label={attachment.altText || 'Flashcard audio'}
        />
        {attachment.caption && (
          <p className="text-sm text-gray-500 text-center mt-2">{attachment.caption}</p>
        )}
      </div>
    );
  }

  return null;
}

export function FlashcardQuestion({
  question,
  selfAssessment,
  onAnswerChange,
  isReview = false,
  showCorrectAnswer = false,
  className = '',
}: FlashcardQuestionProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const flashcardData = question.flashcardData;
  const frontText = question.questionText;
  const backText = question.correctAnswers?.[0] ??
    (Array.isArray(question.correctAnswer) ? question.correctAnswer[0] : question.correctAnswer) ??
    '';

  const handleFlip = useCallback(() => {
    if (!isReview || !showCorrectAnswer) {
      setIsFlipped((prev) => !prev);
    }
  }, [isReview, showCorrectAnswer]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleFlip();
      }
    },
    [handleFlip]
  );

  const handleSelfAssessment = useCallback(
    (value: 'got_it' | 'need_review') => {
      if (!isReview) {
        onAnswerChange(value);
      }
    },
    [isReview, onAnswerChange]
  );

  // In review mode with showCorrectAnswer, show both sides
  if (isReview && showCorrectAnswer) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Front Side */}
          <div className="p-6 bg-white border-2 border-blue-200 rounded-xl shadow-sm">
            <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-3">
              Front
            </div>
            <MediaRenderer media={flashcardData?.frontMedia} />
            <div className="text-lg text-gray-900">{frontText}</div>
            {flashcardData?.prompts && flashcardData.prompts.length > 0 && (
              <div className="mt-3 space-y-1">
                {flashcardData.prompts.map((prompt, idx) => (
                  <p key={idx} className="text-sm text-gray-500 italic">
                    {prompt}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* Back Side */}
          <div className="p-6 bg-white border-2 border-green-200 rounded-xl shadow-sm">
            <div className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-3">
              Back
            </div>
            <MediaRenderer media={flashcardData?.backMedia} />
            <div className="text-lg text-gray-900">{backText}</div>
          </div>
        </div>

        {/* Self-assessment result */}
        {selfAssessment && (
          <div className="flex justify-center">
            <div
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                selfAssessment === 'got_it'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              {selfAssessment === 'got_it' ? 'Marked: Got it!' : 'Marked: Need review'}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Flashcard with flip animation */}
      <div
        className="perspective-1000 cursor-pointer"
        onClick={handleFlip}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label={isFlipped ? 'Click to see front' : 'Click to flip card'}
      >
        <div
          className={`relative w-full min-h-[200px] transition-transform duration-500 transform-style-3d ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Front of card */}
          <div
            className="absolute inset-0 backface-hidden p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl shadow-lg"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-3">
              Front
            </div>
            <MediaRenderer media={flashcardData?.frontMedia} />
            <div className="text-xl text-gray-900 font-medium">{frontText}</div>
            {flashcardData?.prompts && flashcardData.prompts.length > 0 && (
              <div className="mt-4 space-y-1">
                {flashcardData.prompts.map((prompt, idx) => (
                  <p key={idx} className="text-sm text-gray-500 italic">
                    Hint: {prompt}
                  </p>
                ))}
              </div>
            )}
            <div className="absolute bottom-4 left-0 right-0 text-center">
              <span className="text-sm text-blue-500">Click to flip</span>
            </div>
          </div>

          {/* Back of card */}
          <div
            className="absolute inset-0 backface-hidden p-6 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-xl shadow-lg"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <div className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-3">
              Back
            </div>
            <MediaRenderer media={flashcardData?.backMedia} />
            <div className="text-xl text-gray-900 font-medium">{backText}</div>
            <div className="absolute bottom-4 left-0 right-0 text-center">
              <span className="text-sm text-green-500">Click to flip back</span>
            </div>
          </div>
        </div>
      </div>

      {/* Self-assessment buttons */}
      <div className="flex justify-center gap-4">
        <button
          type="button"
          onClick={() => handleSelfAssessment('got_it')}
          disabled={isReview}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            selfAssessment === 'got_it'
              ? 'bg-green-600 text-white shadow-md'
              : 'bg-green-100 text-green-700 hover:bg-green-200'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          aria-pressed={selfAssessment === 'got_it'}
        >
          Got it!
        </button>
        <button
          type="button"
          onClick={() => handleSelfAssessment('need_review')}
          disabled={isReview}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            selfAssessment === 'need_review'
              ? 'bg-amber-600 text-white shadow-md'
              : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          aria-pressed={selfAssessment === 'need_review'}
        >
          Need review
        </button>
      </div>
    </div>
  );
}
