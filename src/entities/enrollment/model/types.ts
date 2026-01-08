/**
 * Enrollment Entity Types
 * Represents a user's enrollment in a course
 */

export type EnrollmentStatus = 'active' | 'completed' | 'dropped' | 'expired';

export interface Enrollment {
  _id: string;
  userId: string;
  courseId: string;
  status: EnrollmentStatus;
  enrolledAt: string;
  startedAt?: string;
  completedAt?: string;
  expiresAt?: string;
  progress: number; // 0-100
  lastAccessedAt?: string;
  certificateId?: string;
  isCertificateIssued: boolean;
  metadata?: {
    enrollmentSource?: 'self' | 'admin' | 'manager';
    enrolledBy?: string;
    notes?: string;
  };
}

export interface EnrollmentWithCourse extends Enrollment {
  course: {
    _id: string;
    title: string;
    shortDescription?: string;
    thumbnail?: string;
    duration?: number;
    level?: 'beginner' | 'intermediate' | 'advanced';
    lessonCount?: number;
  };
}

export interface EnrollmentFormData {
  courseId: string;
  userId?: string;
  expiresAt?: string;
}

export interface EnrollmentStats {
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  averageProgress: number;
  averageCompletionTime?: number; // in days
}
