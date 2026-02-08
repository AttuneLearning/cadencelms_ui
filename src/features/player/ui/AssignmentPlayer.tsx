/**
 * AssignmentPlayer Component
 * Handles assignment submission with text and file uploads
 */

import { useEffect, useState, useCallback } from 'react';
import { Loader2, Upload, X, FileText, CheckCircle2 } from 'lucide-react';
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
  useMySubmissions,
  useCreateSubmission,
  useUpdateSubmission,
  useSubmitAssignment,
  useUploadFile,
  useDeleteFile,
  type Assignment,
} from '@/entities/assignment';
import { useCompleteContentAttempt } from '@/entities/content-attempt';

export interface AssignmentPlayerProps {
  attemptId: string;
  assignment: Assignment;
  onComplete?: () => void;
  onError?: (error: string) => void;
}

export function AssignmentPlayer({
  attemptId,
  assignment,
  onComplete,
  onError,
}: AssignmentPlayerProps) {
  const [textContent, setTextContent] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());

  // Fetch existing submissions
  const { data: submissions, isLoading: submissionsLoading } = useMySubmissions(assignment.id);

  // Get latest submission
  const latestSubmission = submissions?.[0];
  const isSubmitted = latestSubmission?.status === 'submitted';
  const isGraded = latestSubmission?.status === 'graded';
  const canResubmit =
    isSubmitted &&
    assignment.allowResubmission &&
    (!assignment.maxSubmissions ||
      (latestSubmission?.attemptNumber ?? 0) < assignment.maxSubmissions);

  // Mutations
  const { mutate: createSubmission, isPending: isCreating } = useCreateSubmission();
  const { mutate: updateSubmission, isPending: isUpdating } = useUpdateSubmission();
  const { mutate: submitAssignment, isPending: isSubmitting } = useSubmitAssignment();
  const { mutate: uploadFile, isPending: isUploadingFile } = useUploadFile();
  const { mutate: deleteFile, isPending: isDeletingFile } = useDeleteFile();
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
          textContent,
          status: 'draft',
        },
        {
          onSuccess: () => {
            setIsDirty(false);
          },
          onError: (error) => {
            if (onError) {
              onError('Failed to save draft');
            }
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
          onError: (error) => {
            if (onError) {
              onError('Failed to save draft');
            }
            console.error('Failed to save draft:', error);
          },
        }
      );
    }
  }, [
    latestSubmission,
    textContent,
    assignment.id,
    createSubmission,
    updateSubmission,
    onError,
  ]);

  // Submit assignment
  const handleSubmit = useCallback(() => {
    const submissionToSubmit = latestSubmission;

    if (!submissionToSubmit) {
      // Create and submit in one go
      createSubmission(
        {
          assignmentId: assignment.id,
          textContent,
          status: 'submitted',
        },
        {
          onSuccess: () => {
            setIsDirty(false);
            setShowSubmitDialog(false);

            // Mark content attempt as complete
            completeAttempt({
              attemptId,
              data: {
                passed: true,
              },
            });

            if (onComplete) {
              onComplete();
            }
          },
          onError: (error) => {
            if (onError) {
              onError('Failed to submit assignment');
            }
            console.error('Failed to submit assignment:', error);
          },
        }
      );
    } else {
      // Submit existing draft
      submitAssignment(
        {
          submissionId: submissionToSubmit.id,
          textContent,
        },
        {
          onSuccess: () => {
            setIsDirty(false);
            setShowSubmitDialog(false);

            // Mark content attempt as complete
            completeAttempt({
              attemptId,
              data: {
                passed: true,
              },
            });

            if (onComplete) {
              onComplete();
            }
          },
          onError: (error) => {
            if (onError) {
              onError('Failed to submit assignment');
            }
            console.error('Failed to submit assignment:', error);
          },
        }
      );
    }
  }, [
    latestSubmission,
    textContent,
    assignment.id,
    attemptId,
    createSubmission,
    submitAssignment,
    completeAttempt,
    onComplete,
    onError,
  ]);

  // Handle file upload
  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files || files.length === 0) return;

      // Ensure we have a submission to attach files to
      if (!latestSubmission || latestSubmission.status !== 'draft') {
        // Create draft first
        createSubmission(
          {
            assignmentId: assignment.id,
            textContent,
            status: 'draft',
          },
          {
            onSuccess: (data) => {
              setIsDirty(false);
              // Upload file to new submission
              uploadFileToSubmission(data.id, files[0]);
            },
            onError: (error) => {
              if (onError) {
                onError('Failed to create submission for file upload');
              }
              console.error('Failed to create submission:', error);
            },
          }
        );
      } else {
        uploadFileToSubmission(latestSubmission.id, files[0]);
      }

      // Reset input
      event.target.value = '';
    },
    [latestSubmission, textContent, assignment.id, createSubmission, onError]
  );

  const uploadFileToSubmission = useCallback(
    (submissionId: string, file: File) => {
      // Check file size
      if (assignment.maxFileSize && file.size > assignment.maxFileSize) {
        if (onError) {
          const maxSizeMB = (assignment.maxFileSize / (1024 * 1024)).toFixed(2);
          onError(`File size exceeds maximum allowed size of ${maxSizeMB}MB`);
        }
        return;
      }

      // Check file type
      if (assignment.allowedFileTypes && assignment.allowedFileTypes.length > 0) {
        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        if (!fileExtension || !assignment.allowedFileTypes.includes(fileExtension)) {
          if (onError) {
            onError(
              `File type not allowed. Allowed types: ${assignment.allowedFileTypes.join(', ')}`
            );
          }
          return;
        }
      }

      // Check max files
      if (assignment.maxFiles && (latestSubmission?.files?.length ?? 0) >= assignment.maxFiles) {
        if (onError) {
          onError(`Maximum number of files (${assignment.maxFiles}) reached`);
        }
        return;
      }

      setUploadingFiles((prev) => new Set(prev).add(file.name));

      uploadFile(
        {
          submissionId,
          file,
        },
        {
          onSuccess: () => {
            setUploadingFiles((prev) => {
              const next = new Set(prev);
              next.delete(file.name);
              return next;
            });
          },
          onError: (error) => {
            setUploadingFiles((prev) => {
              const next = new Set(prev);
              next.delete(file.name);
              return next;
            });
            if (onError) {
              onError('Failed to upload file');
            }
            console.error('Failed to upload file:', error);
          },
        }
      );
    },
    [assignment, latestSubmission, uploadFile, onError]
  );

  // Handle file delete
  const handleFileDelete = useCallback(
    (fileId: string) => {
      if (!latestSubmission) return;

      deleteFile(
        {
          submissionId: latestSubmission.id,
          fileId,
        },
        {
          onError: (error) => {
            if (onError) {
              onError('Failed to delete file');
            }
            console.error('Failed to delete file:', error);
          },
        }
      );
    },
    [latestSubmission, deleteFile, onError]
  );

  // Handle resubmit
  const handleResubmit = useCallback(() => {
    // Create new draft submission for resubmission
    createSubmission(
      {
        assignmentId: assignment.id,
        status: 'draft',
      },
      {
        onSuccess: () => {
          setTextContent('');
          setIsDirty(false);
        },
        onError: (error) => {
          if (onError) {
            onError('Failed to create resubmission');
          }
          console.error('Failed to create resubmission:', error);
        },
      }
    );
  }, [assignment.id, createSubmission, onError]);

  const showTextInput = assignment.type === 'text' || assignment.type === 'text_and_file';
  const showFileUpload = assignment.type === 'file' || assignment.type === 'text_and_file';
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
                {assignment.dueDate && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    Due: {new Date(assignment.dueDate).toLocaleDateString()}
                  </p>
                )}
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
              dangerouslySetInnerHTML={{ __html: assignment.description }}
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

        {/* Grade Display */}
        {isGraded && latestSubmission?.grade && (
          <Card>
            <CardHeader>
              <CardTitle>Grade</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">
                  {latestSubmission.grade.score} / {latestSubmission.grade.maxScore}
                </span>
                <span className="text-muted-foreground">
                  ({Math.round((latestSubmission.grade.score / latestSubmission.grade.maxScore) * 100)}%)
                </span>
              </div>
              {latestSubmission.grade.feedback && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold">Feedback</h4>
                  <p className="text-sm text-muted-foreground">{latestSubmission.grade.feedback}</p>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Graded on {new Date(latestSubmission.grade.gradedAt).toLocaleString()}
              </p>
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
                    Attempt {latestSubmission?.attemptNumber ?? 0} of {assignment.maxSubmissions}
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

              {/* File Upload */}
              {showFileUpload && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Files</label>

                  {/* Upload Button */}
                  <div>
                    <Button variant="outline" className="relative" asChild disabled={isUploadingFile}>
                      <label>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload File
                        <input
                          type="file"
                          className="absolute inset-0 cursor-pointer opacity-0"
                          onChange={handleFileUpload}
                          disabled={isUploadingFile}
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

                  {/* File List */}
                  {latestSubmission?.files && latestSubmission.files.length > 0 && (
                    <div className="space-y-2">
                      {latestSubmission.files.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between rounded-lg border p-3"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">{file.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {(file.size / 1024).toFixed(2)} KB
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleFileDelete(file.id)}
                            disabled={isDeletingFile}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Uploading Files */}
                  {Array.from(uploadingFiles).map((fileName) => (
                    <div
                      key={fileName}
                      className="flex items-center gap-2 rounded-lg border border-dashed p-3"
                    >
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <p className="text-sm text-muted-foreground">Uploading {fileName}...</p>
                    </div>
                  ))}
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
                        key={file.id}
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-lg border p-3 transition-colors hover:bg-muted"
                      >
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(file.size / 1024).toFixed(2)} KB
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
              {!assignment.allowResubmission && ' You will not be able to make changes after submitting.'}
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
