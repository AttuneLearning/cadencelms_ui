/**
 * Student Entity
 * Public API for student entity
 */

// API
export {
  sendMessageToStudent,
  resetExamAttempt,
  extendEnrollmentDeadline,
  manualCompleteEnrollment,
  exportStudentProgress,
  type SendMessagePayload,
  type SendMessageResponse,
  type ResetExamAttemptPayload,
  type ResetExamAttemptResponse,
  type ExtendDeadlinePayload,
  type ExtendDeadlineResponse,
  type ManualCompleteEnrollmentPayload,
  type ManualCompleteEnrollmentResponse,
  type ExportStudentProgressPayload,
  type ExportStudentProgressResponse,
} from './api/studentActionsApi';

// Hooks
export {
  useSendMessageToStudent,
  useResetExamAttempt,
  useExtendEnrollmentDeadline,
  useManualCompleteEnrollment,
  useExportStudentProgress,
} from './hooks/useStudentActions';
