/**
 * GradingDetailPage
 * Page for grading a single student submission
 */

import { useParams, useNavigate } from 'react-router-dom';
import { useExamAttempt, useGradeExam } from '@/entities/exam-attempt/hooks/useExamAttempts';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Skeleton } from '@/shared/ui/skeleton';
import { SubmissionViewer } from '@/features/grading/ui/SubmissionViewer';
import { GradingForm } from '@/features/grading/ui/GradingForm';
import { ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/shared/ui/use-toast';

export function GradingDetailPage() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: attempt, isLoading, error } = useExamAttempt(attemptId!);
  const gradeMutation = useGradeExam();

  const handleBack = () => {
    navigate('/staff/grading');
  };

  const handleSubmitGrade = async (gradeData: any) => {
    try {
      await gradeMutation.mutateAsync({
        attemptId: attemptId!,
        data: {
          questionGrades: gradeData.questionGrades,
          overallFeedback: gradeData.overallFeedback,
          notifyLearner: true,
        },
      });

      toast({
        title: 'Success',
        description: 'Grade submitted successfully',
      });

      // Navigate back to grading list after a short delay
      setTimeout(() => {
        navigate('/staff/grading');
      }, 1500);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit grade. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSaveDraft = (gradeData: any) => {
    // In a real implementation, this would save a draft to the server
    console.log('Saving draft:', gradeData);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <Card>
          <CardContent className="py-12">
            <div className="space-y-4">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-64 w-full" />
            </div>
            <div className="text-center mt-4 text-muted-foreground">Loading submission...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !attempt) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error loading submission. The submission may not exist or you may not have permission
            to access it.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const isAlreadyGraded = attempt.status === 'graded';

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Grade Submission</h1>
            <p className="text-muted-foreground mt-1">
              Review and grade {attempt.learnerName}'s submission
            </p>
          </div>
        </div>
      </div>

      {/* Already Graded Warning */}
      {isAlreadyGraded && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            This submission has already been graded. You can update the grade below.
          </AlertDescription>
        </Alert>
      )}

      {/* Submission Viewer */}
      <SubmissionViewer attempt={attempt} />

      {/* Grading Form */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">
          {isAlreadyGraded ? 'Update Grade' : 'Grade Submission'}
        </h2>
        <GradingForm
          attemptId={attemptId!}
          questions={attempt.questions}
          maxScore={attempt.maxScore}
          initialData={
            isAlreadyGraded
              ? {
                  questionGrades: attempt.questions.map((q) => ({
                    questionId: q.id,
                    scoreEarned: q.scoreEarned || 0,
                    feedback: q.feedback || '',
                  })),
                  overallFeedback: attempt.feedback || '',
                }
              : undefined
          }
          isSubmitting={gradeMutation.isPending}
          onSubmit={handleSubmitGrade}
          onSaveDraft={handleSaveDraft}
        />
      </div>
    </div>
  );
}
