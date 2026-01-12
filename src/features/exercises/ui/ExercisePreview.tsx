/**
 * Exercise Preview Component
 * Shows how the exercise will appear to learners
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { RadioGroup, RadioGroupItem } from '@/shared/ui/radio-group';
import { Checkbox } from '@/shared/ui/checkbox';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Separator } from '@/shared/ui/separator';
import type { ExerciseQuestion, ExerciseType, ExerciseDifficulty } from '@/entities/exercise';
import {
  Clock,
  Award,
  CheckCircle2,
  AlertCircle,
  Info,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface ExercisePreviewProps {
  exercise: {
    id: string;
    title: string;
    description?: string;
    type: ExerciseType;
    difficulty: ExerciseDifficulty;
    timeLimit: number;
    passingScore: number;
    shuffleQuestions: boolean;
    showFeedback: boolean;
    allowReview: boolean;
    instructions?: string;
    totalPoints: number;
    questionCount: number;
    status: string;
  };
  questions: ExerciseQuestion[];
  showAnswers?: boolean;
}

export const ExercisePreview: React.FC<ExercisePreviewProps> = ({
  exercise,
  questions,
  showAnswers = true,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);

  const currentQuestion = questions[currentQuestionIndex];
  const hasMultipleQuestions = questions.length > 1;

  // Navigation handlers
  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleQuestionSelect = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  // Render question based on type
  const renderQuestionInput = (question: ExerciseQuestion) => {
    switch (question.questionType) {
      case 'multiple_choice':
        return (
          <RadioGroup className="space-y-3">
            {question.options?.map((option, idx) => (
              <div
                key={idx}
                className={cn(
                  'flex items-center space-x-3 p-3 rounded-md border',
                  showAnswers && option === question.correctAnswer && 'bg-green-50 border-green-200'
                )}
              >
                <RadioGroupItem value={option} id={`option-${idx}`} disabled />
                <Label
                  htmlFor={`option-${idx}`}
                  className={cn(
                    'flex-1 cursor-pointer',
                    showAnswers && option === question.correctAnswer && 'font-medium text-green-700'
                  )}
                >
                  {option}
                  {showAnswers && option === question.correctAnswer && (
                    <CheckCircle2 className="inline-block ml-2 h-4 w-4 text-green-600" />
                  )}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'true_false':
        return (
          <RadioGroup className="space-y-3">
            {['True', 'False'].map((option) => (
              <div
                key={option}
                className={cn(
                  'flex items-center space-x-3 p-3 rounded-md border',
                  showAnswers &&
                    option.toLowerCase() === String(question.correctAnswer).toLowerCase() &&
                    'bg-green-50 border-green-200'
                )}
              >
                <RadioGroupItem value={option} id={`tf-${option}`} disabled />
                <Label
                  htmlFor={`tf-${option}`}
                  className={cn(
                    'flex-1 cursor-pointer',
                    showAnswers &&
                      option.toLowerCase() === String(question.correctAnswer).toLowerCase() &&
                      'font-medium text-green-700'
                  )}
                >
                  {option}
                  {showAnswers &&
                    option.toLowerCase() === String(question.correctAnswer).toLowerCase() && (
                      <CheckCircle2 className="inline-block ml-2 h-4 w-4 text-green-600" />
                    )}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'matching':
        return (
          <div className="space-y-3">
            {question.options?.map((option, idx) => (
              <div key={idx} className="flex items-center space-x-3 p-3 rounded-md border">
                <Checkbox id={`match-${idx}`} disabled />
                <Label htmlFor={`match-${idx}`} className="flex-1 cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        );

      case 'short_answer':
        return (
          <div className="space-y-2">
            <Textarea
              placeholder="Type your answer here..."
              className="min-h-[100px]"
              disabled
            />
            {showAnswers && question.correctAnswer && (
              <Alert>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  <span className="font-medium">Expected answer:</span>{' '}
                  {String(question.correctAnswer)}
                </AlertDescription>
              </Alert>
            )}
          </div>
        );

      case 'essay':
        return (
          <div className="space-y-2">
            <Textarea
              placeholder="Write your essay here..."
              className="min-h-[200px]"
              disabled
            />
            {showAnswers && question.correctAnswer && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <span className="font-medium">Evaluation criteria:</span>{' '}
                  {String(question.correctAnswer)}
                </AlertDescription>
              </Alert>
            )}
          </div>
        );

      default:
        return <div className="text-muted-foreground">Question type not supported for preview</div>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Exercise Info Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{formatExerciseType(exercise.type)}</Badge>
                <Badge variant={getDifficultyVariant(exercise.difficulty)}>
                  {formatDifficulty(exercise.difficulty)}
                </Badge>
                <Badge variant="outline">{exercise.status}</Badge>
              </div>
              <CardTitle className="text-2xl">{exercise.title}</CardTitle>
              {exercise.description && (
                <CardDescription className="mt-2 text-base">{exercise.description}</CardDescription>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Time Limit</div>
                <div className="text-sm text-muted-foreground">
                  {exercise.timeLimit > 0
                    ? `${Math.floor(exercise.timeLimit / 60)} minutes`
                    : 'Unlimited'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Total Points</div>
                <div className="text-sm text-muted-foreground">{exercise.totalPoints} points</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Passing Score</div>
                <div className="text-sm text-muted-foreground">{exercise.passingScore}%</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Questions</div>
                <div className="text-sm text-muted-foreground">
                  {exercise.questionCount} question{exercise.questionCount !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </div>

          {/* Exercise Settings Info */}
          <Separator className="my-4" />
          <div className="flex flex-wrap gap-2">
            {exercise.shuffleQuestions && (
              <Badge variant="outline">Questions will be shuffled</Badge>
            )}
            {exercise.showFeedback && <Badge variant="outline">Feedback enabled</Badge>}
            {exercise.allowReview && <Badge variant="outline">Review allowed</Badge>}
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      {exercise.instructions && showInstructions && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-medium mb-1">Instructions</p>
                <p className="text-sm">{exercise.instructions}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowInstructions(false)}>
                Dismiss
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Question Navigator */}
      {hasMultipleQuestions && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">Question Navigator</h3>
              <span className="text-sm text-muted-foreground">
                {currentQuestionIndex + 1} of {questions.length}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {questions.map((_q, idx) => (
                <Button
                  key={idx}
                  variant={idx === currentQuestionIndex ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleQuestionSelect(idx)}
                  className="w-10 h-10 p-0"
                >
                  {idx + 1}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Question */}
      {currentQuestion ? (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">Question {currentQuestionIndex + 1}</Badge>
                  <Badge variant="secondary">
                    {formatQuestionType(currentQuestion.questionType)}
                  </Badge>
                  <Badge>{formatDifficulty(currentQuestion.difficulty)}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {currentQuestion.points} points
                  </span>
                </div>
                <CardTitle className="text-lg">{currentQuestion.questionText}</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Question Input */}
            {renderQuestionInput(currentQuestion)}

            {/* Explanation (if show answers is enabled) */}
            {showAnswers && currentQuestion.explanation && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-medium mb-1">Explanation</p>
                  <p className="text-sm">{currentQuestion.explanation}</p>
                </AlertDescription>
              </Alert>
            )}

            {/* Tags */}
            {currentQuestion.tags && currentQuestion.tags.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Tags:</span>
                {currentQuestion.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Navigation */}
            {hasMultipleQuestions && (
              <div className="flex items-center justify-between pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                <Button
                  variant="outline"
                  onClick={handleNext}
                  disabled={currentQuestionIndex === questions.length - 1}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Questions Added</h3>
              <p className="text-muted-foreground">
                Add questions to this exercise to see a preview
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Staff-only notice */}
      {showAnswers && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <p className="text-sm">
              <strong>Staff View:</strong> Correct answers and explanations are shown in this
              preview. Learners will not see this information unless feedback is enabled and they
              submit their answers.
            </p>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

// Helper functions
function formatExerciseType(type: ExerciseType): string {
  const map: Record<ExerciseType, string> = {
    quiz: 'Quiz',
    exam: 'Exam',
    practice: 'Practice',
    assessment: 'Assessment',
  };
  return map[type] || type;
}

function formatDifficulty(difficulty: ExerciseDifficulty): string {
  const map: Record<ExerciseDifficulty, string> = {
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
  };
  return map[difficulty] || difficulty;
}

function getDifficultyVariant(
  difficulty: ExerciseDifficulty
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (difficulty) {
    case 'easy':
      return 'secondary';
    case 'medium':
      return 'default';
    case 'hard':
      return 'destructive';
    default:
      return 'outline';
  }
}

function formatQuestionType(type: string): string {
  const map: Record<string, string> = {
    multiple_choice: 'Multiple Choice',
    true_false: 'True/False',
    short_answer: 'Short Answer',
    essay: 'Essay',
    matching: 'Matching',
  };
  return map[type] || type;
}
