/**
 * React Query hooks for Student Actions
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  sendMessageToStudent,
  resetExamAttempt,
  extendEnrollmentDeadline,
  manualCompleteEnrollment,
  exportStudentProgress,
  type SendMessagePayload,
  type ResetExamAttemptPayload,
  type ExtendDeadlinePayload,
  type ManualCompleteEnrollmentPayload,
  type ExportStudentProgressPayload,
} from '../api/studentActionsApi';

/**
 * Hook to send message to student
 */
export function useSendMessageToStudent() {
  return useMutation({
    mutationFn: (payload: SendMessagePayload) => sendMessageToStudent(payload),
  });
}

/**
 * Hook to reset exam attempt
 */
export function useResetExamAttempt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ResetExamAttemptPayload) => resetExamAttempt(payload),
    onSuccess: (_, variables) => {
      // Invalidate enrollment queries to refresh data
      queryClient.invalidateQueries({
        queryKey: ['enrollments', variables.enrollmentId],
      });
      queryClient.invalidateQueries({
        queryKey: ['exams', variables.examId],
      });
    },
  });
}

/**
 * Hook to extend enrollment deadline
 */
export function useExtendEnrollmentDeadline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ExtendDeadlinePayload) => extendEnrollmentDeadline(payload),
    onSuccess: (_, variables) => {
      // Invalidate enrollment queries to refresh data
      queryClient.invalidateQueries({
        queryKey: ['enrollments', variables.enrollmentId],
      });
      queryClient.invalidateQueries({
        queryKey: ['students'],
      });
    },
  });
}

/**
 * Hook to manually complete enrollment
 */
export function useManualCompleteEnrollment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ManualCompleteEnrollmentPayload) => manualCompleteEnrollment(payload),
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: ['enrollments', variables.enrollmentId],
      });
      queryClient.invalidateQueries({
        queryKey: ['students'],
      });
      queryClient.invalidateQueries({
        queryKey: ['progress'],
      });
    },
  });
}

/**
 * Hook to export student progress
 */
export function useExportStudentProgress() {
  return useMutation({
    mutationFn: (payload: ExportStudentProgressPayload) => exportStudentProgress(payload),
  });
}
