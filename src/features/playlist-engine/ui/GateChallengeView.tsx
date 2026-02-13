/**
 * GateChallengeView
 * Renders a gate challenge using adaptive question selection and the QuestionRenderer.
 * Selects questions for assessed nodes, presents them, and reports pass/fail.
 */

import { useState, useCallback, useEffect } from 'react';
import { Loader2, ShieldCheck, ShieldX } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Progress } from '@/shared/ui/progress';
import { QuestionRenderer } from '@/features/exercises/ui';
import type { ExtendedExamQuestion } from '@/features/exercises/ui';
import { useSelectQuestions, useRecordResponse } from '@/entities/adaptive-testing';
import type { AdaptiveQuestionResponse } from '@/entities/adaptive-testing';
import type { Answer } from '@/entities/exam-attempt/model/types';
import type { GateResult, GateConfig } from '@/shared/lib/business-logic/playlist-engine';

export interface GateChallengeViewProps {
  /** The learning unit ID for this gate */
  luId: string;
  /** Title of the gate */
  title: string;
  /** Knowledge node IDs this gate assesses */
  assessesNodes: string[];
  /** Gate configuration */
  gateConfig: GateConfig;
  /** Department ID for adaptive question selection */
  departmentId: string;
  /** Which attempt number this is */
  attemptNumber: number;
  /** Callback when the gate challenge is complete */
  onResult: (result: GateResult) => void;
}

export function GateChallengeView({
  luId,
  title,
  assessesNodes,
  gateConfig,
  departmentId,
  attemptNumber,
  onResult,
}: GateChallengeViewProps) {
  const [questions, setQuestions] = useState<AdaptiveQuestionResponse[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [results, setResults] = useState<Record<string, { isCorrect: boolean; nodeId: string }>>({});
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { mutateAsync: selectQuestions } = useSelectQuestions();
  const { mutateAsync: recordResponse } = useRecordResponse();

  // Fetch questions on mount
  useEffect(() => {
    let cancelled = false;

    async function fetchQuestions() {
      try {
        // Select questions across all assessed nodes
        const selected = await selectQuestions({
          departmentId,
          knowledgeNodeId: assessesNodes[0], // Primary node
          contextType: 'assessment',
          count: gateConfig.minQuestions,
        });

        if (!cancelled) {
          setQuestions(selected);
          setIsLoading(false);
        }
      } catch {
        // If question selection fails, report as failed gate
        if (!cancelled) {
          setIsLoading(false);
          onResult({
            luId,
            passed: false,
            score: 0,
            attemptNumber,
            failedNodes: assessesNodes,
          });
        }
      }
    }

    fetchQuestions();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [luId, attemptNumber]);

  const currentQuestion = questions[currentQuestionIndex];

  // Map adaptive question to ExtendedExamQuestion format
  const mapToExamQuestion = useCallback(
    (aq: AdaptiveQuestionResponse): ExtendedExamQuestion => ({
      id: aq.question.id,
      questionText: aq.question.questionText,
      questionType: (aq.question.questionTypes[0] || 'multiple_choice') as ExtendedExamQuestion['questionType'],
      order: currentQuestionIndex + 1,
      points: aq.question.points,
      options: aq.question.options?.map((o) => o.text) || [],
      questionTypes: aq.question.questionTypes,
      correctAnswers: aq.question.correctAnswers,
    }),
    [currentQuestionIndex]
  );

  const handleAnswerChange = useCallback((answer: Answer) => {
    setAnswers((prev) => ({ ...prev, [answer.questionId]: answer }));
  }, []);

  const handleSubmitAnswer = useCallback(async () => {
    if (!currentQuestion) return;

    const answer = answers[currentQuestion.question.id];
    const answerValue = answer?.answer;
    const correctAnswers = currentQuestion.question.correctAnswers || [];

    // Determine correctness
    const isCorrect = Array.isArray(answerValue)
      ? answerValue.length === correctAnswers.length &&
        answerValue.every((a) => correctAnswers.includes(a))
      : correctAnswers.includes(answerValue as string);

    // Record the response via adaptive API
    try {
      await recordResponse({
        questionId: currentQuestion.question.id,
        knowledgeNodeId: currentQuestion.question.knowledgeNodeId || assessesNodes[0],
        cognitiveDepth: currentQuestion.cognitiveDepth,
        isCorrect,
      });
    } catch {
      // Continue even if recording fails
    }

    const nodeId = currentQuestion.question.knowledgeNodeId || assessesNodes[0];
    setResults((prev) => ({
      ...prev,
      [currentQuestion.question.id]: { isCorrect, nodeId },
    }));

    // Move to next question or complete
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Calculate final result
      const allResults = {
        ...results,
        [currentQuestion.question.id]: { isCorrect, nodeId },
      };

      const totalCorrect = Object.values(allResults).filter((r) => r.isCorrect).length;
      const score = totalCorrect / questions.length;
      const passed = score >= gateConfig.masteryThreshold;

      // Determine which nodes failed
      const nodeScores: Record<string, { correct: number; total: number }> = {};
      for (const r of Object.values(allResults)) {
        if (!nodeScores[r.nodeId]) {
          nodeScores[r.nodeId] = { correct: 0, total: 0 };
        }
        nodeScores[r.nodeId].total += 1;
        if (r.isCorrect) nodeScores[r.nodeId].correct += 1;
      }

      const failedNodes = Object.entries(nodeScores)
        .filter(([, s]) => s.total > 0 && s.correct / s.total < gateConfig.masteryThreshold)
        .map(([nodeId]) => nodeId);

      setIsComplete(true);
      onResult({ luId, passed, score, attemptNumber, failedNodes });
    }
  }, [
    currentQuestion,
    answers,
    assessesNodes,
    recordResponse,
    currentQuestionIndex,
    questions.length,
    results,
    gateConfig.masteryThreshold,
    luId,
    attemptNumber,
    onResult,
  ]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading gate challenge...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center">
          <ShieldX className="h-12 w-12 text-destructive" />
          <p className="text-sm text-muted-foreground">No questions available for this gate.</p>
        </div>
      </div>
    );
  }

  if (isComplete) {
    const totalCorrect = Object.values(results).filter((r) => r.isCorrect).length;
    const score = totalCorrect / questions.length;
    const passed = score >= gateConfig.masteryThreshold;

    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center max-w-md">
          {passed ? (
            <ShieldCheck className="h-16 w-16 text-green-600" />
          ) : (
            <ShieldX className="h-16 w-16 text-destructive" />
          )}
          <h3 className="text-xl font-semibold">{passed ? 'Gate Passed!' : 'Gate Not Passed'}</h3>
          <p className="text-sm text-muted-foreground">
            Score: {totalCorrect}/{questions.length} ({Math.round(score * 100)}%)
            {!passed && ` — Required: ${Math.round(gateConfig.masteryThreshold * 100)}%`}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b p-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="mt-2 flex items-center gap-3">
          <Progress
            value={((currentQuestionIndex + 1) / questions.length) * 100}
            className="h-2 flex-1"
          />
          <span className="text-sm text-muted-foreground">
            {currentQuestionIndex + 1}/{questions.length}
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
          onClick={handleSubmitAnswer}
          disabled={!answers[currentQuestion?.question.id]}
        >
          {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Submit Gate'}
        </Button>
      </div>
    </div>
  );
}
