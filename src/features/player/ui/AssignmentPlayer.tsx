/**
 * AssignmentPlayer Component
 * Handles assignment submission with text and file uploads
 * Aligned with API-ISS-029 assignment contracts
 */

import { useEffect, useState, useCallback } from 'react';
import { Loader2, Upload, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Textarea } from '@/shared/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Badge } from '@/shared/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/alert-dialog';
import {
  useSubmissions,
  useCreateSubmission,
  useUpdateSubmission,
  useSubmitSubmission,
  type Assignment,
  type AssignmentSubmission,
} from '@/entities/assignment';
import { useCompleteContentAttempt } from '@/entities/content-attempt';

export interface AssignmentPlayerProps {
  attemptId: string;
  assignment: Assignment;
  enrollmentId?: string;
  onComplete?: () => void;
  onError?: (error: string) => void;
}

export function AssignmentPlayer({
  attemptId,
  assignment,
  enrollmentId,
  onComplete,
  onError,
}: AssignmentPlayerProps) {
  const [textContent, setTextContent] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);

  // Fetch existing submissions for this assignment
  const { data: submissionsData, isLoading: submissionsLoading } = useSubmissions(assignment.id);

  // Get latest submission (first in list, sorted by server)
  const submissions = submissionsData?.submissions ?? [];
  const latestSubmission = submissions[0] as AssignmentSubmission | undefined;
  const isSubmitted = latestSubmission?.status === 'submitted';
  const isGraded = latestSubmission?.status === 'graded';
  const isReturned = latestSubmission?.status === 'returned';
  const canResubmit =
    (isSubmitted || isReturned) &&
    assignment.maxResubmissions !== null &&
    assignment.maxResubmissions > 0 &&
    (latestSubmission?.submissionNumber ?? 0) < (assignment.maxResubmissions ?? 0) + 1;

  // Mutations
  const { mutate: createSubmission, isPending: isCreating } = useCreateSubmission();
  const { mutate: updateSubmission, isPending: isUpdating } = useUpdateSubmission();
  const { mutate: submitSubmission, isPending: isSubmitting } = useSubmitSubmission();
  const { mutate: completeAttempt } = useCompleteContentAttempt();

  // Load existing submission data
  useEffect(() => {
    if (latestSubmission && latestSubmission.status === 'draft') {
      setTextContent(latestSubmission.textContent || '');
    }
  }, [latestSubmission]);

  // Handle text change
  const handleTextChange = useCallback((value: string) => {
    setTextContent(value);
    setIsDirty(true);
  }, []);

  // Save draft
  const handleSaveDraft = useCallback(() => {
    if (!latestSubmission) {
      // Create new submission as draft
      createSubmission(
        {
          assignmentId: assignment.id,
          data: {
            enrollmentId: enrollmentId || '',
            textContent,
          },
        },
        {
          onSuccess: () => {
            setIsDirty(false);
          },
          onError: (error: Error) => {
            onError?.('Failed to save draft');
            console.error('Failed to save draft:', error);
          },
        }
      );
    } else if (latestSubmission.status === 'draft') {
      // Update existing draft
      updateSubmission(
        {
          id: latestSubmission.id,
          data: {
            textContent,
          },
        },
        {
          onSuccess: () => {
            setIsDirty(false);
          },
          onError: (error: Error) => {
            onError?.('Failed to save draft');
            console.error('Failed to save draft:', error);
          },
        }
      );
    }
  }, [
    latestSubmission,
    textContent,
    assignment.id,
    enrollmentId,
    createSubmission,
    updateSubmission,
    onError,
  ]);

  // Submit assignment
  const handleSubmit = useCallback(() => {
    const submissionToSubmit = latestSubmission;

    if (!submissionToSubmit) {
      // Create draft first, then submit
      createSubmission(
        {
          assignmentId: assignment.id,
          data: {
            enrollmentId: enrollmentId || '',
            textContent,
          },
        },
        {
          onSuccess: (data) => {
            // Now submit the newly created submission
            submitSubmission(data.id, {
              onSuccess: () => {
                setIsDirty(false);
                setShowSubmitDialog(false);

                completeAttempt({
                  attemptId,
                  data: { passed: true },
                });

                onComplete?.();
              },
              onError: (error: Error) => {
                onError?.('Failed to submit assignment');
                console.error('Failed to submit assignment:', error);
              },
            });
          },
          onError: (error: Error) => {
            onError?.('Failed to create submission');
            console.error('Failed to create submission:', error);
          },
        }
      );
    } else {
      // Save any pending text changes first, then submit
      if (isDirty && submissionToSubmit.status === 'draft') {
        updateSubmission(
          {
            id: submissionToSubmit.id,
            data: { textContent },
          },
          {
            onSuccess: () => {
              submitSubmission(submissionToSubmit.id, {
                onSuccess: () => {
                  setIsDirty(false);
                  setShowSubmitDialog(false);

                  completeAttempt({
                    attemptId,
                    data: { passed: true },
                  });

                  onComplete?.();
                },
                onError: (error: Error) => {
                  onError?.('Failed to submit assignment');
                  console.error('Failed to submit assignment:', error);
                },
              });
            },
          }
        );
      } else {
        submitSubmission(submissionToSubmit.id, {
          onSuccess: () => {
            setIsDirty(false);
            setShowSubmitDialog(false);

            completeAttempt({
              attemptId,
              data: { passed: true },
            });

            onComplete?.();
          },
          onError: (error: Error) => {
            onError?.('Failed to submit assignment');
            console.error('Failed to submit assignment:', error);
          },
        });
      }
    }
  }, [
    latestSubmission,
    textContent,
    isDirty,
    assignment.id,
    enrollmentId,
    attemptId,
    createSubmission,
    updateSubmission,
    submitSubmission,
    completeAttempt,
    onComplete,
    onError,
  ]);

  // Handle resubmit
  const handleResubmit = useCallback(() => {
    createSubmission(
      {
        assignmentId: assignment.id,
        data: {
          enrollmentId: enrollmentId || '',
        },
      },
      {
        onSuccess: () => {
          setTextContent('');
          setIsDirty(false);
        },
        onError: (error: Error) => {
          onError?.('Failed to create resubmission');
          console.error('Failed to create resubmission:', error);
        },
      }
    );
  }, [assignment.id, enrollmentId, createSubmission, onError]);

  const showTextInput =
    assignment.submissionType === 'text' || assignment.submissionType === 'text_and_file';
  const showFileUpload =
    assignment.submissionType === 'file' || assignment.submissionType === 'text_and_file';
  const canEdit = !latestSubmission || latestSubmission.status === 'draft';

  if (submissionsLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading assignment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-auto bg-background p-6">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        {/* Assignment Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>{assignment.title}</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Max score: {assignment.maxScore}
                </p>
              </div>
              {latestSubmission && (
                <Badge
                  variant={
                    isGraded
                      ? 'default'
                      : isSubmitted
                      ? 'secondary'
                      : 'outline'
                  }
                >
                  {latestSubmission.status}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: assignment.instructions }}
            />
          </CardContent>
        </Card>

        {/* Submission Status - Submitted */}
        {isSubmitted && !canResubmit && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              Assignment submitted on{' '}
              {latestSubmission?.submittedAt &&
                new Date(latestSubmission.submittedAt).toLocaleString()}
            </AlertDescription>
          </Alert>
        )}

        {/* Returned for resubmission */}
        {isReturned && latestSubmission?.returnReason && (
          <Alert>
            <AlertDescription>
              <strong>Returned by instructor:</strong> {latestSubmission.returnReason}
            </AlertDescription>
          </Alert>
        )}

        {/* Grade Display */}
        {isGraded && latestSubmission?.grade != null && (
          <Card>
            <CardHeader>
              <CardTitle>Grade</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">
                  {latestSubmission.grade} / {assignment.maxScore}
                </span>
                <span className="text-muted-foreground">
                  ({Math.round((latestSubmission.grade / assignment.maxScore) * 100)}%)
                </span>
              </div>
              {latestSubmission.feedback && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold">Feedback</h4>
                  <p className="text-sm text-muted-foreground">{latestSubmission.feedback}</p>
                </div>
              )}
              {latestSubmission.gradedAt && (
                <p className="text-xs text-muted-foreground">
                  Graded on {new Date(latestSubmission.gradedAt).toLocaleString()}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Resubmit Option */}
        {canResubmit && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Resubmission Available</p>
                  <p className="text-sm text-muted-foreground">
                    Submission {latestSubmission?.submissionNumber ?? 0} of{' '}
                    {(assignment.maxResubmissions ?? 0) + 1}
                  </p>
                </div>
                <Button onClick={handleResubmit} disabled={isCreating}>
                  Start Resubmission
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submission Form */}
        {canEdit && (
          <Card>
            <CardHeader>
              <CardTitle>Your Submission</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Text Input */}
              {showTextInput && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Response</label>
                  <Textarea
                    value={textContent}
                    onChange={(e) => handleTextChange(e.target.value)}
                    placeholder="Type your response here..."
                    rows={10}
                    className="resize-y"
                  />
                </div>
              )}

              {/* File Upload Placeholder */}
              {showFileUpload && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Files</label>
                  <div>
                    <Button variant="outline" className="relative" asChild>
                      <label>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload File
                        <input
                          type="file"
                          className="absolute inset-0 cursor-pointer opacity-0"
                          disabled
                        />
                      </label>
                    </Button>
                    {assignment.allowedFileTypes && assignment.allowedFileTypes.length > 0 && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Allowed types: {assignment.allowedFileTypes.join(', ')}
                      </p>
                    )}
                    {assignment.maxFileSize && (
                      <p className="text-xs text-muted-foreground">
                        Max size: {(assignment.maxFileSize / (1024 * 1024)).toFixed(2)}MB
                      </p>
                    )}
                  </div>

                  {/* Existing File List */}
                  {latestSubmission?.files && latestSubmission.files.length > 0 && (
                    <div className="space-y-2">
                      {latestSubmission.files.map((file) => (
                        <div
                          key={file.fileId}
                          className="flex items-center justify-between rounded-lg border p-3"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">{file.fileName}</p>
                              <p className="text-xs text-muted-foreground">
                                {(file.fileSize / 1024).toFixed(2)} KB
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={handleSaveDraft}
                  disabled={!isDirty || isCreating || isUpdating}
                >
                  {isCreating || isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Draft'
                  )}
                </Button>
                <Button
                  onClick={() => setShowSubmitDialog(true)}
                  disabled={isSubmitting || isCreating}
                >
                  Submit Assignment
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submitted Content Display */}
        {(isSubmitted || isGraded) && latestSubmission && (
          <Card>
            <CardHeader>
              <CardTitle>Submitted Work</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {latestSubmission.textContent && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold">Response</h4>
                  <div className="whitespace-pre-wrap rounded-lg bg-muted p-4 text-sm">
                    {latestSubmission.textContent}
                  </div>
                </div>
              )}

              {latestSubmission.files && latestSubmission.files.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold">Files</h4>
                  <div className="space-y-2">
                    {latestSubmission.files.map((file) => (
                      <a
                        key={file.fileId}
                        href={file.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-lg border p-3 transition-colors hover:bg-muted"
                      >
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{file.fileName}</p>
                          <p className="text-xs text-muted-foreground">
                            {(file.fileSize / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Assignment?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to submit this assignment? This action cannot be undone.
              {assignment.maxResubmissions === null &&
                ' You will not be able to make changes after submitting.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit} disabled={isSubmitting || isCreating}>
              {isSubmitting || isCreating ? 'Submitting...' : 'Submit'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
