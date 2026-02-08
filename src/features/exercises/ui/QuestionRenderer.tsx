/**
 * Question Renderer Component
 * Dynamically renders different question types
 */

import type { ExamQuestion, Answer } from '@/entities/exam-attempt/model/types';
import type { QuestionType, FlashcardData } from '@/entities/question';
import { MultipleChoiceQuestion } from './MultipleChoiceQuestion';
import { TrueFalseQuestion } from './TrueFalseQuestion';
import { ShortAnswerQuestion } from './ShortAnswerQuestion';
import { EssayQuestion } from './EssayQuestion';
import { MatchingQuestion } from './MatchingQuestion';
import { FlashcardQuestion } from './FlashcardQuestion';
import { MultipleSelectQuestion } from './MultipleSelectQuestion';
import { FillInBlankQuestion } from './FillInBlankQuestion';

// Extended question type that supports monolithic design with questionTypes array
export interface ExtendedExamQuestion extends ExamQuestion {
  questionTypes?: QuestionType[];
  correctAnswers?: string[];
  flashcardData?: FlashcardData;
}

export interface QuestionRendererProps {
  question: ExtendedExamQuestion;
  answer: Answer | undefined;
  onAnswerChange: (answer: Answer) => void;
  isReview?: boolean;
  showCorrectAnswer?: boolean;
  className?: string;
}

export function QuestionRenderer({
  question,
  answer,
  onAnswerChange,
  isReview = false,
  showCorrectAnswer = false,
  className = '',
}: QuestionRendererProps) {
  const handleAnswerChange = (value: string | string[]) => {
    onAnswerChange({
      questionId: question.id,
      answer: value,
    });
  };

  // Use first type from questionTypes array (monolithic design)
  const effectiveType: QuestionType | string = question.questionTypes?.[0] ?? 'multiple_choice';

  switch (effectiveType) {
    case 'multiple_choice':
      return (
        <MultipleChoiceQuestion
          question={question}
          selectedAnswer={answer?.answer as string | undefined}
          onAnswerChange={handleAnswerChange}
          isReview={isReview}
          showCorrectAnswer={showCorrectAnswer}
          className={className}
        />
      );

    case 'true_false':
      return (
        <TrueFalseQuestion
          question={question}
          selectedAnswer={answer?.answer as string | undefined}
          onAnswerChange={handleAnswerChange}
          isReview={isReview}
          showCorrectAnswer={showCorrectAnswer}
          className={className}
        />
      );

    case 'short_answer':
      return (
        <ShortAnswerQuestion
          question={question}
          answer={answer?.answer as string | undefined}
          onAnswerChange={handleAnswerChange}
          isReview={isReview}
          showCorrectAnswer={showCorrectAnswer}
          className={className}
        />
      );

    case 'essay':
      return (
        <EssayQuestion
          question={question}
          answer={answer?.answer as string | undefined}
          onAnswerChange={handleAnswerChange}
          isReview={isReview}
          showCorrectAnswer={showCorrectAnswer}
          className={className}
        />
      );

    case 'matching':
      return (
        <MatchingQuestion
          question={question}
          answers={answer?.answer as string[] | undefined}
          onAnswerChange={handleAnswerChange}
          isReview={isReview}
          showCorrectAnswer={showCorrectAnswer}
          className={className}
        />
      );

    case 'flashcard':
      return (
        <FlashcardQuestion
          question={question}
          selfAssessment={answer?.answer as 'got_it' | 'need_review' | undefined}
          onAnswerChange={handleAnswerChange}
          isReview={isReview}
          showCorrectAnswer={showCorrectAnswer}
          className={className}
        />
      );

    case 'multiple_select':
      return (
        <MultipleSelectQuestion
          question={question}
          selectedAnswers={answer?.answer as string[] | undefined}
          onAnswerChange={handleAnswerChange}
          isReview={isReview}
          showCorrectAnswer={showCorrectAnswer}
          className={className}
        />
      );

    case 'fill_in_blank':
    case 'fill_blank': // Support legacy alias
      return (
        <FillInBlankQuestion
          question={question}
          answers={answer?.answer as string[] | undefined}
          onAnswerChange={handleAnswerChange}
          isReview={isReview}
          showCorrectAnswer={showCorrectAnswer}
          className={className}
        />
      );

    default:
      return (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-destructive">Unsupported question type: {effectiveType}</p>
        </div>
      );
  }
}
