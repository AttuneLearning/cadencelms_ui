/**
 * SubmissionViewer Component
 * Displays student submission content for grading
 */

import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Separator } from '@/shared/ui/separator';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Clock, User, Calendar, FileText, CheckCircle2, XCircle } from 'lucide-react';
import type { ExamAttempt, ExamQuestion } from '@/entities/exam-attempt/model/types';

interface SubmissionViewerProps {
  attempt: ExamAttempt;
}

export function SubmissionViewer({ attempt }: SubmissionViewerProps) {
  const formatTimeSpent = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${minutes}m`;
  };

  const renderQuestionAnswer = (question: ExamQuestion) => {
    if (!question.hasAnswer || !question.userAnswer) {
      return (
        <div className="text-muted-foreground italic">No answer provided</div>
      );
    }

    const answer = question.userAnswer;

    switch (question.questionType) {
      case 'multiple_choice':
      case 'true_false':
        return (
          <div className="space-y-2">
            {question.options?.map((option) => {
              const isSelected = answer === option;
              const isCorrect = question.correctAnswer === option;

              return (
                <div
                  key={option}
                  className={`p-3 rounded-lg border ${
                    isSelected
                      ? question.isCorrect
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                      : isCorrect && attempt.status === 'graded'
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isSelected && (
                      <>
                        {question.isCorrect ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                      </>
                    )}
                    <span className={isSelected ? 'font-medium' : ''}>{option}</span>
                  </div>
                </div>
              );
            })}
          </div>
        );

      case 'short_answer':
      case 'essay':
        return (
          <div className="p-4 bg-muted rounded-lg">
            <div className="whitespace-pre-wrap">{answer}</div>
          </div>
        );

      case 'matching':
        return (
          <div className="p-4 bg-muted rounded-lg">
            <pre className="whitespace-pre-wrap">{JSON.stringify(answer, null, 2)}</pre>
          </div>
        );

      default:
        return <div className="text-muted-foreground">{String(answer)}</div>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Student and Submission Info */}
      <Card>
        <CardHeader>
          <CardTitle>Submission Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Student</div>
                <div className="font-medium">{attempt.learnerName}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Exam</div>
                <div className="font-medium">{attempt.examTitle}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="outline">Attempt #{attempt.attemptNumber}</Badge>
            </div>

            {attempt.submittedAt && (
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Submitted</div>
                  <div className="font-medium">
                    {format(new Date(attempt.submittedAt), 'MMM d, yyyy h:mm a')}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Time Spent</div>
                <div className="font-medium">{formatTimeSpent(attempt.timeSpent)}</div>
              </div>
            </div>

            {attempt.status === 'graded' && (
              <div>
                <div className="text-sm text-muted-foreground">Score</div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{attempt.percentage}%</span>
                  {attempt.gradeLetter && (
                    <Badge variant="outline" className="text-lg">
                      {attempt.gradeLetter}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>

          {attempt.status === 'graded' && attempt.feedback && (
            <>
              <Separator />
              <div>
                <div className="text-sm font-medium mb-2">Overall Feedback</div>
                <Alert>
                  <AlertDescription>{attempt.feedback}</AlertDescription>
                </Alert>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      {attempt.instructions && (
        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground whitespace-pre-wrap">
              {attempt.instructions}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Questions and Answers */}
      <Card>
        <CardHeader>
          <CardTitle>Questions and Answers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {attempt.questions.map((question, index) => (
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
                      <span className="text-sm text-muted-foreground">
                        {question.points} {question.points === 1 ? 'point' : 'points'}
                      </span>
                    </div>
                    <div className="text-lg font-medium">{question.questionText}</div>
                  </div>

                  {attempt.status === 'graded' && question.scoreEarned !== undefined && (
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Score</div>
                      <div className="text-lg font-bold">
                        {question.scoreEarned}/{question.points}
                      </div>
                    </div>
                  )}
                </div>

                {/* Question Explanation (if available) */}
                {question.explanation && (
                  <Alert>
                    <AlertDescription className="text-sm">
                      {question.explanation}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Student Answer */}
                <div>
                  <div className="text-sm font-medium mb-2">Student Answer:</div>
                  {renderQuestionAnswer(question)}
                </div>

                {/* Question Feedback */}
                {attempt.status === 'graded' && question.feedback && (
                  <div>
                    <div className="text-sm font-medium mb-2">Feedback:</div>
                    <Alert>
                      <AlertDescription>{question.feedback}</AlertDescription>
                    </Alert>
                  </div>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
