/**
 * Tests for Student Actions API
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { env } from '@/shared/config/env';
import {
  sendMessageToStudent,
  resetExamAttempt,
  extendEnrollmentDeadline,
  manualCompleteEnrollment,
  exportStudentProgress,
  type SendMessageResponse,
  type ResetExamAttemptResponse,
  type ExtendDeadlineResponse,
  type ManualCompleteEnrollmentResponse,
  type ExportStudentProgressResponse,
} from '../studentActionsApi';

describe('studentActionsApi', () => {
  const baseUrl = env.apiFullUrl;
  const studentId = 'student-1';
  const enrollmentId = 'enrollment-1';
  const examId = 'exam-1';

  beforeEach(() => {
    server.resetHandlers();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  describe('sendMessageToStudent', () => {
    it('should send message to student successfully', async () => {
      const mockResponse: SendMessageResponse = {
        messageId: 'msg-123',
        studentId,
        sentAt: new Date().toISOString(),
        status: 'sent',
      };

      let capturedRequestBody: any = null;

      server.use(
        http.post(`${baseUrl}/students/${studentId}/messages`, async ({ request }) => {
          capturedRequestBody = await request.json();
          return HttpResponse.json({ data: mockResponse });
        })
      );

      const result = await sendMessageToStudent({
        studentId,
        subject: 'Test Subject',
        message: 'Test message content',
      });

      expect(result).toEqual(mockResponse);
      expect(capturedRequestBody.subject).toBe('Test Subject');
      expect(capturedRequestBody.message).toBe('Test message content');
    });

    it('should send urgent message', async () => {
      const mockResponse: SendMessageResponse = {
        messageId: 'msg-124',
        studentId,
        sentAt: new Date().toISOString(),
        status: 'sent',
      };

      let capturedRequestBody: any = null;

      server.use(
        http.post(`${baseUrl}/students/${studentId}/messages`, async ({ request }) => {
          capturedRequestBody = await request.json();
          return HttpResponse.json({ data: mockResponse });
        })
      );

      await sendMessageToStudent({
        studentId,
        subject: 'Urgent',
        message: 'Urgent message',
        urgent: true,
      });

      expect(capturedRequestBody.urgent).toBe(true);
    });

    it('should handle message send failure', async () => {
      server.use(
        http.post(`${baseUrl}/students/${studentId}/messages`, () => {
          return HttpResponse.json(
            { message: 'Failed to send message' },
            { status: 500 }
          );
        })
      );

      await expect(
        sendMessageToStudent({
          studentId,
          subject: 'Test',
          message: 'Test',
        })
      ).rejects.toThrow();
    });

    it('should handle student not found', async () => {
      server.use(
        http.post(`${baseUrl}/students/${studentId}/messages`, () => {
          return HttpResponse.json(
            { message: 'Student not found' },
            { status: 404 }
          );
        })
      );

      await expect(
        sendMessageToStudent({
          studentId,
          subject: 'Test',
          message: 'Test',
        })
      ).rejects.toThrow();
    });
  });

  describe('resetExamAttempt', () => {
    it('should reset exam attempt successfully', async () => {
      const mockResponse: ResetExamAttemptResponse = {
        attemptId: 'attempt-123',
        enrollmentId,
        examId,
        resetAt: new Date().toISOString(),
        previousAttempts: 2,
        message: 'Exam attempt reset successfully',
      };

      let capturedRequestBody: any = null;

      server.use(
        http.post(
          `${baseUrl}/enrollments/${enrollmentId}/exams/${examId}/reset`,
          async ({ request }) => {
            capturedRequestBody = await request.json();
            return HttpResponse.json({ data: mockResponse });
          }
        )
      );

      const result = await resetExamAttempt({
        enrollmentId,
        examId,
        reason: 'Technical issues during exam',
      });

      expect(result).toEqual(mockResponse);
      expect(capturedRequestBody.reason).toBe('Technical issues during exam');
      expect(result.previousAttempts).toBe(2);
    });

    it('should handle enrollment not found', async () => {
      server.use(
        http.post(
          `${baseUrl}/enrollments/${enrollmentId}/exams/${examId}/reset`,
          () => {
            return HttpResponse.json(
              { message: 'Enrollment not found' },
              { status: 404 }
            );
          }
        )
      );

      await expect(
        resetExamAttempt({
          enrollmentId,
          examId,
          reason: 'Test',
        })
      ).rejects.toThrow();
    });

    it('should handle exam not found', async () => {
      server.use(
        http.post(
          `${baseUrl}/enrollments/${enrollmentId}/exams/${examId}/reset`,
          () => {
            return HttpResponse.json(
              { message: 'Exam not found' },
              { status: 404 }
            );
          }
        )
      );

      await expect(
        resetExamAttempt({
          enrollmentId,
          examId,
          reason: 'Test',
        })
      ).rejects.toThrow();
    });

    it('should handle no attempts to reset', async () => {
      server.use(
        http.post(
          `${baseUrl}/enrollments/${enrollmentId}/exams/${examId}/reset`,
          () => {
            return HttpResponse.json(
              { message: 'No attempts found to reset' },
              { status: 400 }
            );
          }
        )
      );

      await expect(
        resetExamAttempt({
          enrollmentId,
          examId,
          reason: 'Test',
        })
      ).rejects.toThrow();
    });
  });

  describe('extendEnrollmentDeadline', () => {
    it('should extend enrollment deadline successfully', async () => {
      const newDeadline = new Date('2024-12-31').toISOString();
      const mockResponse: ExtendDeadlineResponse = {
        enrollmentId,
        previousDeadline: new Date('2024-11-30').toISOString(),
        newDeadline,
        extendedAt: new Date().toISOString(),
        extendedBy: 'staff-123',
        reason: 'Medical reasons',
      };

      let capturedRequestBody: any = null;

      server.use(
        http.patch(`${baseUrl}/enrollments/${enrollmentId}/deadline`, async ({ request }) => {
          capturedRequestBody = await request.json();
          return HttpResponse.json({ data: mockResponse });
        })
      );

      const result = await extendEnrollmentDeadline({
        enrollmentId,
        newDeadline,
        reason: 'Medical reasons',
      });

      expect(result).toEqual(mockResponse);
      expect(capturedRequestBody.newDeadline).toBe(newDeadline);
      expect(capturedRequestBody.reason).toBe('Medical reasons');
    });

    it('should handle invalid deadline date', async () => {
      server.use(
        http.patch(`${baseUrl}/enrollments/${enrollmentId}/deadline`, () => {
          return HttpResponse.json(
            { message: 'New deadline must be after current deadline' },
            { status: 400 }
          );
        })
      );

      await expect(
        extendEnrollmentDeadline({
          enrollmentId,
          newDeadline: '2020-01-01',
          reason: 'Test',
        })
      ).rejects.toThrow();
    });

    it('should handle enrollment not found', async () => {
      server.use(
        http.patch(`${baseUrl}/enrollments/${enrollmentId}/deadline`, () => {
          return HttpResponse.json(
            { message: 'Enrollment not found' },
            { status: 404 }
          );
        })
      );

      await expect(
        extendEnrollmentDeadline({
          enrollmentId,
          newDeadline: new Date().toISOString(),
          reason: 'Test',
        })
      ).rejects.toThrow();
    });
  });

  describe('manualCompleteEnrollment', () => {
    it('should manually complete enrollment successfully', async () => {
      const mockResponse: ManualCompleteEnrollmentResponse = {
        enrollmentId,
        studentId: 'student-1',
        courseId: 'course-1',
        completedAt: new Date().toISOString(),
        completedBy: 'staff-123',
        reason: 'Completed offline coursework',
        finalScore: 85,
        certificateIssued: true,
      };

      let capturedRequestBody: any = null;

      server.use(
        http.post(
          `${baseUrl}/enrollments/${enrollmentId}/manual-complete`,
          async ({ request }) => {
            capturedRequestBody = await request.json();
            return HttpResponse.json({ data: mockResponse });
          }
        )
      );

      const result = await manualCompleteEnrollment({
        enrollmentId,
        reason: 'Completed offline coursework',
        finalScore: 85,
      });

      expect(result).toEqual(mockResponse);
      expect(capturedRequestBody.reason).toBe('Completed offline coursework');
      expect(capturedRequestBody.finalScore).toBe(85);
      expect(result.certificateIssued).toBe(true);
    });

    it('should complete without final score', async () => {
      const mockResponse: ManualCompleteEnrollmentResponse = {
        enrollmentId,
        studentId: 'student-1',
        courseId: 'course-1',
        completedAt: new Date().toISOString(),
        completedBy: 'staff-123',
        reason: 'Special circumstances',
        certificateIssued: false,
      };

      server.use(
        http.post(`${baseUrl}/enrollments/${enrollmentId}/manual-complete`, () => {
          return HttpResponse.json({ data: mockResponse });
        })
      );

      const result = await manualCompleteEnrollment({
        enrollmentId,
        reason: 'Special circumstances',
      });

      expect(result.finalScore).toBeUndefined();
    });

    it('should handle already completed enrollment', async () => {
      server.use(
        http.post(`${baseUrl}/enrollments/${enrollmentId}/manual-complete`, () => {
          return HttpResponse.json(
            { message: 'Enrollment already completed' },
            { status: 409 }
          );
        })
      );

      await expect(
        manualCompleteEnrollment({
          enrollmentId,
          reason: 'Test',
        })
      ).rejects.toThrow();
    });

    it('should handle enrollment not found', async () => {
      server.use(
        http.post(`${baseUrl}/enrollments/${enrollmentId}/manual-complete`, () => {
          return HttpResponse.json(
            { message: 'Enrollment not found' },
            { status: 404 }
          );
        })
      );

      await expect(
        manualCompleteEnrollment({
          enrollmentId,
          reason: 'Test',
        })
      ).rejects.toThrow();
    });
  });

  describe('exportStudentProgress', () => {
    it('should export student progress to CSV', async () => {
      const mockResponse: ExportStudentProgressResponse = {
        downloadUrl: 'https://example.com/downloads/progress-export.csv',
        filename: 'student-progress-2024-01-10.csv',
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
        recordCount: 150,
      };

      let capturedRequestBody: any = null;

      server.use(
        http.post(`${baseUrl}/students/progress/export`, async ({ request }) => {
          capturedRequestBody = await request.json();
          return HttpResponse.json({ data: mockResponse });
        })
      );

      const result = await exportStudentProgress({
        format: 'csv',
        includeDetails: true,
      });

      expect(result).toEqual(mockResponse);
      expect(capturedRequestBody.format).toBe('csv');
      expect(result.recordCount).toBe(150);
    });

    it('should export with filters', async () => {
      const mockResponse: ExportStudentProgressResponse = {
        downloadUrl: 'https://example.com/downloads/filtered-export.xlsx',
        filename: 'filtered-progress-2024-01-10.xlsx',
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
        recordCount: 25,
      };

      let capturedRequestBody: any = null;

      server.use(
        http.post(`${baseUrl}/students/progress/export`, async ({ request }) => {
          capturedRequestBody = await request.json();
          return HttpResponse.json({ data: mockResponse });
        })
      );

      const result = await exportStudentProgress({
        format: 'excel',
        filters: {
          courseId: 'course-1',
          status: 'active',
        },
      });

      expect(result.recordCount).toBe(25);
      expect(capturedRequestBody.filters.courseId).toBe('course-1');
      expect(capturedRequestBody.filters.status).toBe('active');
    });

    it('should handle no data to export', async () => {
      server.use(
        http.post(`${baseUrl}/students/progress/export`, () => {
          return HttpResponse.json(
            { message: 'No data matching filters' },
            { status: 404 }
          );
        })
      );

      await expect(
        exportStudentProgress({
          format: 'csv',
          filters: { courseId: 'invalid-course' },
        })
      ).rejects.toThrow();
    });

    it('should handle export generation failure', async () => {
      server.use(
        http.post(`${baseUrl}/students/progress/export`, () => {
          return HttpResponse.json(
            { message: 'Export generation failed' },
            { status: 500 }
          );
        })
      );

      await expect(
        exportStudentProgress({
          format: 'excel',
        })
      ).rejects.toThrow();
    });
  });
});
