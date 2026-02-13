/**
 * InjectedPracticeView
 * Targeted practice for specific weak knowledge nodes.
 * Uses adaptive question selection for the targeted nodes.
 */

import { useState, useCallback, useEffect } from 'react';
import { Loader2, Brain, CheckCircle2 } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Progress } from '@/shared/ui/progress';
import { QuestionRenderer } from '@/features/exercises/ui';
import type { ExtendedExamQuestion } from '@/features/exercises/ui';
import { useSelectQuestions, useRecordResponse } from '@/entities/adaptive-testing';
import type { AdaptiveQuestionResponse } from '@/entities/adaptive-testing';
import type { Answer } from '@/entities/exam-attempt/model/types';

export interface InjectedPracticeViewProps {
  /** Knowledge node IDs to practice */
  targetNodeIds: string[];
  /** Number of questions to present */
  questionCount: number;
  /** Title for the practice session */
  title: string;
  /** Department ID for adaptive question selection */
  departmentId: string;
  /** Callback when practice is complete */
  onComplete: () => void;
}

export function InjectedPracticeView({
  targetNodeIds,
  questionCount,
  title,
  departmentId,
  onComplete,
}: InjectedPracticeViewProps) {
  const [questions, setQuestions] = useState<AdaptiveQuestionResponse[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [correctCount, setCorrectCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { mutateAsync: selectQuestions } = useSelectQuestions();
  const { mutateAsync: recordResponse } = useRecordResponse();

  // Fetch practice questions
  useEffect(() => {
    let cancelled = false;

    async function fetchQuestions() {
      try {
        const selected = await selectQuestions({
          departmentId,
          knowledgeNodeId: targetNodeIds[0],
          contextType: 'practice',
          preferredStrategy: 'reinforcing',
          count: questionCount,
        });

        if (!cancelled) {
          setQuestions(selected);
          setIsLoading(false);
        }
      } catch {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchQuestions();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetNodeIds.join(','), questionCount]);

  const currentQuestion = questions[currentIndex];

  const mapToExamQuestion = useCallback(
    (aq: AdaptiveQuestionResponse): ExtendedExamQuestion => ({
      id: aq.question.id,
      questionText: aq.question.questionText,
      questionType: (aq.question.questionTypes[0] || 'multiple_choice') as ExtendedExamQuestion['questionType'],
      order: currentIndex + 1,
      points: aq.question.points,
      options: aq.question.options?.map((o) => o.text) || [],
      questionTypes: aq.question.questionTypes,
      correctAnswers: aq.question.correctAnswers,
    }),
    [currentIndex]
  );

  const handleAnswerChange = useCallback((answer: Answer) => {
    setAnswers((prev) => ({ ...prev, [answer.questionId]: answer }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!currentQuestion) return;

    const answer = answers[currentQuestion.question.id];
    const answerValue = answer?.answer;
    const correctAnswers = currentQuestion.question.correctAnswers || [];

    const isCorrect = Array.isArray(answerValue)
      ? answerValue.length === correctAnswers.length &&
        answerValue.every((a) => correctAnswers.includes(a))
      : correctAnswers.includes(answerValue as string);

    if (isCorrect) setCorrectCount((prev) => prev + 1);

    try {
      await recordResponse({
        questionId: currentQuestion.question.id,
        knowledgeNodeId: currentQuestion.question.knowledgeNodeId || targetNodeIds[0],
        cognitiveDepth: currentQuestion.cognitiveDepth,
        isCorrect,
      });
    } catch {
      // Continue even if recording fails
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsComplete(true);
    }
  }, [currentQuestion, answers, targetNodeIds, recordResponse, currentIndex, questions.length]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading practice questions...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center">
          <Brain className="h-12 w-12 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No practice questions available.</p>
          <Button onClick={onComplete}>Continue</Button>
        </div>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center max-w-md">
          <CheckCircle2 className="h-16 w-16 text-green-600" />
          <h3 className="text-xl font-semibold">Practice Complete</h3>
          <p className="text-sm text-muted-foreground">
            You got {correctCount}/{questions.length} correct.
          </p>
          <Button onClick={onComplete}>Continue</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <div className="mt-2 flex items-center gap-3">
          <Progress
            value={((currentIndex + 1) / questions.length) * 100}
            className="h-2 flex-1"
          />
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1}/{questions.length}
          </span>
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 overflow-y-auto p-6">
        {currentQuestion && (
          <QuestionRenderer
            question={mapToExamQuestion(currentQuestion)}
            answer={answers[currentQuestion.question.id]}
            onAnswerChange={handleAnswerChange}
          />
        )}
      </div>

      {/* Submit */}
      <div className="border-t p-4 flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={!answers[currentQuestion?.question.id]}
        >
          {currentIndex < questions.length - 1 ? 'Next' : 'Finish Practice'}
        </Button>
      </div>
    </div>
  );
}
