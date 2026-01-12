/**
 * Question Renderer Component
 * Dynamically renders different question types
 */

import type { ExamQuestion, Answer } from '@/entities/exam-attempt/model/types';
import { MultipleChoiceQuestion } from './MultipleChoiceQuestion';
import { TrueFalseQuestion } from './TrueFalseQuestion';
import { ShortAnswerQuestion } from './ShortAnswerQuestion';
import { EssayQuestion } from './EssayQuestion';
import { MatchingQuestion } from './MatchingQuestion';

export interface QuestionRendererProps {
  question: ExamQuestion;
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

  switch (question.questionType) {
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

    default:
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">Unsupported question type: {question.questionType}</p>
        </div>
      );
  }
}
