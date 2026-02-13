/**
 * GradingForm Component
 * Form for grading student submissions with validation and auto-save
 */

import { useState, useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { Label } from '@/shared/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Separator } from '@/shared/ui/separator';
import { Save, CheckCircle, AlertCircle } from 'lucide-react';
import type { ExamQuestion } from '@/entities/exam-attempt/model/types';
import { useDebounce } from '@/shared/hooks/useDebounce';

interface QuestionGrade {
  questionIndex: number;
  questionId: string;
  scoreEarned: number;
  feedback?: string;
}

interface GradeFormData {
  questionGrades: QuestionGrade[];
  overallFeedback?: string;
}

interface GradingFormProps {
  attemptId: string;
  questions: ExamQuestion[];
  maxScore: number;
  initialData?: GradeFormData;
  isSubmitting?: boolean;
  onSubmit: (data: GradeFormData) => void;
  onSaveDraft?: (data: GradeFormData) => void;
}

// Create validation schema dynamically based on questions
const createGradingSchema = (questions: ExamQuestion[]) => {
  return z.object({
    questionGrades: z
      .array(
        z.object({
          questionIndex: z.number().int().nonnegative(),
          questionId: z.string(),
          scoreEarned: z.number().nullable().refine((val) => val === null || val >= 0, {
            message: 'Score must be positive',
          }),
          feedback: z.string().optional(),
        })
      )
      .superRefine((grades, ctx) => {
        // Validate each grade against its question's max points
        grades.forEach((grade, index) => {
          const question = questions.find((q) => q.id === grade.questionId);
          if (question && grade.scoreEarned !== null && grade.scoreEarned > question.points) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Score cannot exceed maximum points for question',
              path: [index, 'scoreEarned'],
            });
          }
        });
      }),
    overallFeedback: z.string().optional(),
  });
};

export function GradingForm({
  questions,
  maxScore,
  initialData,
  isSubmitting = false,
  onSubmit,
  onSaveDraft,
}: GradingFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Initialize form with validation
  const schema = useMemo(() => createGradingSchema(questions), [questions]);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<GradeFormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: initialData || {
      questionGrades: questions.map((q, index) => ({
        questionIndex: index,
        questionId: q.id,
        scoreEarned: q.scoreEarned !== undefined ? q.scoreEarned : (null as any),
        feedback: q.feedback || '',
      })),
      overallFeedback: '',
    },
  });

  // Watch all form values for auto-save
  const formValues = watch();
  const debouncedFormValues = useDebounce(formValues, 2000);

  // Auto-save effect
  useEffect(() => {
    if (onSaveDraft && debouncedFormValues && !isSubmitting) {
      setIsSaving(true);
      onSaveDraft(debouncedFormValues);
      setIsSaving(false);
      setLastSaved(new Date());
    }
  }, [debouncedFormValues, onSaveDraft, isSubmitting]);

  // Calculate total score
  const totalScore = useMemo(() => {
    return formValues.questionGrades?.reduce(
      (sum, grade) => sum + (grade.scoreEarned || 0),
      0
    ) || 0;
  }, [formValues.questionGrades]);

  const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  const handleFormSubmit = (data: GradeFormData) => {
    // Clear any previous error
    setSubmitError(null);

    // Validate all questions have scores
    const allGraded = data.questionGrades.every((g) => g.scoreEarned !== undefined && g.scoreEarned !== null);

    if (!allGraded) {
      setSubmitError('All questions must be graded before submitting');
      return;
    }

    onSubmit(data);
  };

  const getQuestionError = (questionId: string) => {
    const gradeIndex = formValues.questionGrades?.findIndex(
      (g) => g.questionId === questionId
    );
    if (gradeIndex !== undefined && gradeIndex >= 0) {
      return errors.questionGrades?.[gradeIndex]?.scoreEarned?.message;
    }
    return undefined;
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Grading Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Grade Submission</CardTitle>
            <div className="flex items-center gap-4">
              {isSaving && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Save className="h-4 w-4 animate-pulse" />
                  <span>Saving...</span>
                </div>
              )}
              {lastSaved && !isSaving && (
                <div className="text-sm text-muted-foreground">
                  Saved {lastSaved.toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <div className="text-sm text-muted-foreground">Total Score</div>
              <div className="text-3xl font-bold">
                {totalScore} / {maxScore}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Percentage</div>
              <div className="text-3xl font-bold">{percentage}%</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question Grading */}
      <Card>
        <CardHeader>
          <CardTitle>Grade Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {questions.map((question, index) => {
            const error = getQuestionError(question.id);

            return (
              <div key={question.id}>
                {index > 0 && <Separator className="my-6" />}

                <div className="space-y-4">
                  {/* Question Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">Question {question.order}</Badge>
                        <Badge variant="secondary" className="capitalize">
                          {question.questionType.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="font-medium">{question.questionText}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Max Points</div>
                      <div className="text-lg font-bold">{question.points}</div>
                    </div>
                  </div>

                  {/* Student Answer Display */}
                  <div>
                    <Label className="text-sm text-muted-foreground">Student Answer:</Label>
                    <div className="mt-1 p-3 bg-muted rounded-lg">
                      {question.userAnswer ? (
                        <div className="whitespace-pre-wrap">
                          {Array.isArray(question.userAnswer)
                            ? question.userAnswer.join(', ')
                            : question.userAnswer}
                        </div>
                      ) : (
                        <div className="text-muted-foreground italic">No answer provided</div>
                      )}
                    </div>
                  </div>

                  {/* Score Input */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`score-${question.id}`}>
                        Score Earned <span className="text-destructive">*</span>
                      </Label>
                      <Controller
                        name={`questionGrades.${index}.scoreEarned`}
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            value={field.value === null ? '' : field.value}
                            id={`score-${question.id}`}
                            type="number"
                            step="0.5"
                            placeholder="0"
                            className={error ? 'border-destructive' : ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              // Allow empty (null), parse to number (including negative)
                              field.onChange(value === '' ? null : parseFloat(value));
                            }}
                            aria-label={`Score for Question ${question.order}`}
                          />
                        )}
                      />
                      {error && (
                        <Alert variant="destructive" className="mt-2">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}
                    </div>

                    {/* Auto-calculated percentage for this question */}
                    <div>
                      <Label>Question Score</Label>
                      <div className="h-10 px-3 py-2 bg-muted rounded-md flex items-center justify-between">
                        <span>
                          {formValues.questionGrades?.[index]?.scoreEarned || 0} /{' '}
                          {question.points}
                        </span>
                        <Badge variant="outline">
                          {question.points > 0
                            ? Math.round(
                                ((formValues.questionGrades?.[index]?.scoreEarned || 0) /
                                  question.points) *
                                  100
                              )
                            : 0}
                          %
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Feedback Input */}
                  <div>
                    <Label htmlFor={`feedback-${question.id}`}>
                      Question Feedback (Optional)
                    </Label>
                    <Controller
                      name={`questionGrades.${index}.feedback`}
                      control={control}
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          id={`feedback-${question.id}`}
                          placeholder="Provide specific feedback for this answer..."
                          rows={3}
                          aria-label={`Feedback for Question ${question.order}`}
                        />
                      )}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Overall Feedback */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <Controller
            name="overallFeedback"
            control={control}
            render={({ field }) => (
              <Textarea
                {...field}
                placeholder="Provide overall feedback for the entire submission..."
                rows={5}
                aria-label="Overall feedback"
              />
            )}
          />
        </CardContent>
      </Card>

      {/* Form Errors */}
      {submitError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}
      {errors.questionGrades && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please correct the errors above before submitting.
          </AlertDescription>
        </Alert>
      )}

      {/* Submit Button */}
      <div className="flex items-center justify-end gap-4">
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Save className="h-4 w-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Submit Grade
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
