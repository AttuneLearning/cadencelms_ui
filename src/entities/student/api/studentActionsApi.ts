/**
 * Student Actions API
 * API functions for student management actions (messages, quiz resets, deadline extensions, manual completions)
 */

import { client } from '@/shared/api/client';
import type { ApiResponse } from '@/shared/api/types';

// =====================
// SEND MESSAGE
// =====================

export interface SendMessagePayload {
  studentId: string;
  subject: string;
  message: string;
  urgent?: boolean;
}

export interface SendMessageResponse {
  messageId: string;
  studentId: string;
  sentAt: string;
  status: 'sent' | 'delivered' | 'failed';
}

export async function sendMessageToStudent(
  payload: SendMessagePayload
): Promise<SendMessageResponse> {
  const response = await client.post<ApiResponse<SendMessageResponse>>(
    `/students/${payload.studentId}/messages`,
    {
      subject: payload.subject,
      message: payload.message,
      urgent: payload.urgent,
    }
  );
  return response.data.data;
}

// =====================
// RESET QUIZ/EXAM ATTEMPT
// =====================

export interface ResetExamAttemptPayload {
  enrollmentId: string;
  examId: string;
  reason: string;
}

export interface ResetExamAttemptResponse {
  attemptId: string;
  enrollmentId: string;
  examId: string;
  resetAt: string;
  previousAttempts: number;
  message: string;
}

export async function resetExamAttempt(
  payload: ResetExamAttemptPayload
): Promise<ResetExamAttemptResponse> {
  const response = await client.post<ApiResponse<ResetExamAttemptResponse>>(
    `/enrollments/${payload.enrollmentId}/exams/${payload.examId}/reset`,
    {
      reason: payload.reason,
    }
  );
  return response.data.data;
}

// =====================
// EXTEND DEADLINE
// =====================

export interface ExtendDeadlinePayload {
  enrollmentId: string;
  newDeadline: string; // ISO date string
  reason: string;
}

export interface ExtendDeadlineResponse {
  enrollmentId: string;
  previousDeadline: string;
  newDeadline: string;
  extendedAt: string;
  extendedBy: string;
  reason: string;
}

export async function extendEnrollmentDeadline(
  payload: ExtendDeadlinePayload
): Promise<ExtendDeadlineResponse> {
  const response = await client.patch<ApiResponse<ExtendDeadlineResponse>>(
    `/enrollments/${payload.enrollmentId}/deadline`,
    {
      newDeadline: payload.newDeadline,
      reason: payload.reason,
    }
  );
  return response.data.data;
}

// =====================
// MANUAL COMPLETION
// =====================

export interface ManualCompleteEnrollmentPayload {
  enrollmentId: string;
  reason: string;
  completionDate?: string; // ISO date string, defaults to now
  finalScore?: number;
}

export interface ManualCompleteEnrollmentResponse {
  enrollmentId: string;
  studentId: string;
  courseId: string;
  completedAt: string;
  completedBy: string;
  reason: string;
  finalScore?: number;
  certificateIssued: boolean;
}

export async function manualCompleteEnrollment(
  payload: ManualCompleteEnrollmentPayload
): Promise<ManualCompleteEnrollmentResponse> {
  const response = await client.post<ApiResponse<ManualCompleteEnrollmentResponse>>(
    `/enrollments/${payload.enrollmentId}/manual-complete`,
    {
      reason: payload.reason,
      completionDate: payload.completionDate,
      finalScore: payload.finalScore,
    }
  );
  return response.data.data;
}

// =====================
// EXPORT STUDENT PROGRESS
// =====================

export interface ExportStudentProgressPayload {
  filters?: {
    courseId?: string;
    programId?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  };
  format: 'csv' | 'excel';
  includeDetails?: boolean;
}

export interface ExportStudentProgressResponse {
  downloadUrl: string;
  filename: string;
  expiresAt: string;
  recordCount: number;
}

export async function exportStudentProgress(
  payload: ExportStudentProgressPayload
): Promise<ExportStudentProgressResponse> {
  const response = await client.post<ApiResponse<ExportStudentProgressResponse>>(
    '/students/progress/export',
    payload
  );
  return response.data.data;
}
