/**
 * Exercise Taking Page
 * Main page for learners to take quizzes and exams
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useStartExamAttempt,
  useExamAttempt,
  useSaveAnswer,
  useSubmitExamAttempt,
} from '@/entities/exam-attempt/hooks/useExamAttempts';
import { AttemptTimer } from '@/entities/exam-attempt/ui/AttemptTimer';
import type { Answer } from '@/entities/exam-attempt/model/types';
import { QuestionRenderer } from '@/features/exercises/ui/QuestionRenderer';
import { QuestionNavigator } from '@/features/exercises/ui/QuestionNavigator';
import { SubmitConfirmDialog } from '@/features/exercises/ui/SubmitConfirmDialog';
import { Button } from '@/shared/ui/button';
import { useToast } from '@/shared/ui/use-toast';
import { useNavigation } from '@/shared/lib/navigation/useNavigation';

export function ExerciseTakingPage() {
  const { exerciseId } = useParams<{ exerciseId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { updateBreadcrumbs } = useNavigation();

  // State
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set());
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);

  // Hooks
  const startAttemptMutation = useStartExamAttempt();
  const { data: attempt, isLoading, error } = useExamAttempt(attemptId || '');
  const saveAnswerMutation = useSaveAnswer();
  const submitExamMutation = useSubmitExamAttempt();

  // Start exam attempt on mount
  useEffect(() => {
    if (exerciseId && !attemptId && !startAttemptMutation.isPending) {
      startAttemptMutation.mutate(
        { examId: exerciseId },
        {
          onSuccess: (data) => {
            setAttemptId(data.id);
          },
          onError: (err) => {
            toast({
              title: 'Failed to Start',
              description: err.message || 'Could not start the exam. Please try again.',
              variant: 'destructive',
            });
          },
        }
      );
    }
  }, [exerciseId, attemptId, startAttemptMutation, toast]);

  // Update breadcrumbs
  useEffect(() => {
    if (attempt) {
      updateBreadcrumbs([
        { label: 'Dashboard', path: '/learner/dashboard' },
        { label: 'Exercises', path: '/learner/exercises' },
        { label: attempt.examTitle, path: '#' },
      ]);
    }
  }, [attempt, updateBreadcrumbs]);

  // Auto-submit when time expires
  useEffect(() => {
    if (attempt && attempt.remainingTime === 0 && attempt.status === 'in_progress') {
      handleSubmitExam();
    }
  }, [attempt?.remainingTime, attempt?.status]);

  // Handlers
  const handleAnswerChange = useCallback(
    (answer: Answer) => {
      if (!attemptId) return;

      // Update local state
      setAnswers((prev) => ({
        ...prev,
        [answer.questionId]: answer,
      }));

      // Auto-save with debouncing
      saveAnswerMutation.mutateDebounced({
        attemptId,
        answers: [answer],
      });
    },
    [attemptId, saveAnswerMutation]
  );

  const handleNextQuestion = () => {
    if (attempt && currentQuestionIndex < attempt.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleQuestionSelect = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const handleToggleMarkForReview = () => {
    if (!attempt) return;

    const currentQuestion = attempt.questions[currentQuestionIndex];
    setMarkedForReview((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(currentQuestion.id)) {
        newSet.delete(currentQuestion.id);
      } else {
        newSet.add(currentQuestion.id);
      }
      return newSet;
    });
  };

  const handleSubmitClick = () => {
    setShowSubmitDialog(true);
  };

  const handleSubmitExam = () => {
    if (!attemptId) return;

    submitExamMutation.mutate(
      { attemptId, data: { confirmSubmit: true } },
      {
        onSuccess: () => {
          toast({
            title: 'Exam Submitted',
            description: 'Your exam has been submitted successfully.',
          });
          navigate(`/learner/exercises/${exerciseId}/results/${attemptId}`);
        },
        onError: (err) => {
          toast({
            title: 'Submission Failed',
            description: err.message || 'Failed to submit exam. Please try again.',
            variant: 'destructive',
          });
        },
      }
    );
  };

  // Loading state
  if (isLoading || startAttemptMutation.isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading exam...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || startAttemptMutation.isError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="mb-4 text-red-600">
            <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to Start Exam</h2>
          <p className="text-gray-600 mb-4">
            {error?.message || startAttemptMutation.error?.message || 'An error occurred'}
          </p>
          <Button onClick={() => navigate('/learner/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  if (!attempt) {
    return null;
  }

  const currentQuestion = attempt.questions[currentQuestionIndex];
  const answeredQuestions = new Set(Object.keys(answers));
  const answeredCount = answeredQuestions.size;
  const unansweredCount = attempt.questions.length - answeredCount;
  const isLastQuestion = currentQuestionIndex === attempt.questions.length - 1;
  const isCurrentQuestionMarked = markedForReview.has(currentQuestion.id);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{attempt.examTitle}</h1>
              <p className="text-sm text-gray-600 mt-1">
                Attempt #{attempt.attemptNumber} | Question {currentQuestionIndex + 1} of{' '}
                {attempt.questions.length}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <AttemptTimer
                remainingTime={attempt.remainingTime}
                onTimeExpired={handleSubmitExam}
              />
              <Button
                onClick={handleSubmitClick}
                disabled={submitExamMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                Submit Exam
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Instructions */}
        {attempt.instructions && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h2 className="text-sm font-semibold text-blue-900 mb-1">Instructions</h2>
            <p className="text-sm text-blue-800">{attempt.instructions}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Navigator - Sidebar */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="sticky top-24">
              <QuestionNavigator
                questions={attempt.questions}
                currentQuestionIndex={currentQuestionIndex}
                answeredQuestions={answeredQuestions}
                markedForReview={markedForReview}
                onQuestionSelect={handleQuestionSelect}
              />
            </div>
          </div>

          {/* Question Content - Main Area */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {/* Question Header */}
              <div className="mb-6 pb-4 border-b border-gray-200">
                <div className="flex items-start justify-between mb-2">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Question {currentQuestionIndex + 1}
                  </h2>
                  <span className="text-sm font-medium text-gray-600">
                    {currentQuestion.points} points
                  </span>
                </div>
                <p className="text-gray-800 text-lg">{currentQuestion.questionText}</p>
              </div>

              {/* Question Renderer */}
              <div className="mb-6">
                <QuestionRenderer
                  question={currentQuestion}
                  answer={answers[currentQuestion.id]}
                  onAnswerChange={handleAnswerChange}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <div>
                  <Button
                    variant="outline"
                    onClick={handleToggleMarkForReview}
                    className="gap-2"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" />
                    </svg>
                    {isCurrentQuestionMarked ? 'Unmark for Review' : 'Mark for Review'}
                  </Button>
                </div>

                <div className="flex gap-3">
                  {currentQuestionIndex > 0 && (
                    <Button variant="outline" onClick={handlePreviousQuestion}>
                      Previous
                    </Button>
                  )}
                  {!isLastQuestion && (
                    <Button onClick={handleNextQuestion}>Next</Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      <SubmitConfirmDialog
        open={showSubmitDialog}
        onOpenChange={setShowSubmitDialog}
        onConfirm={handleSubmitExam}
        totalQuestions={attempt.questions.length}
        answeredCount={answeredCount}
        unansweredCount={unansweredCount}
        markedForReviewCount={markedForReview.size}
        isSubmitting={submitExamMutation.isPending}
      />
    </div>
  );
}
