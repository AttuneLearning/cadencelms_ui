/**
 * Content Entity Types
 * Represents various types of learning content
 */

export type ContentType = 'video' | 'document' | 'scorm' | 'quiz' | 'assignment' | 'external-link';
export type ContentStatus = 'draft' | 'published' | 'archived';

export interface Content {
  _id: string;
  title: string;
  description?: string;
  type: ContentType;
  status: ContentStatus;
  fileUrl?: string;
  externalUrl?: string;
  mimeType?: string;
  fileSize?: number; // in bytes
  duration?: number; // Duration in minutes for video content
  transcript?: string;
  metadata?: Record<string, unknown>;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  isDownloadable?: boolean;
  thumbnailUrl?: string;
}

export interface VideoContent extends Content {
  type: 'video';
  videoUrl: string;
  subtitles?: Array<{
    language: string;
    url: string;
  }>;
  chapters?: Array<{
    time: number;
    title: string;
  }>;
}

export interface DocumentContent extends Content {
  type: 'document';
  documentUrl: string;
  pageCount?: number;
}

export interface SCORMContent extends Content {
  type: 'scorm';
  scormVersion: '1.2' | '2004';
  scormPackageId: string;
  launchUrl: string;
}

export interface QuizContent extends Content {
  type: 'quiz';
  questions: QuizQuestion[];
  passingScore: number;
  timeLimit?: number; // in minutes
  allowReview: boolean;
  shuffleQuestions: boolean;
}

export interface QuizQuestion {
  _id: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay';
  question: string;
  options?: string[]; // For multiple-choice
  correctAnswer?: string | number;
  points: number;
  explanation?: string;
}

export interface ContentListItem {
  _id: string;
  title: string;
  type: ContentType;
  thumbnailUrl?: string;
  duration?: number;
  fileSize?: number;
  isDownloadable?: boolean;
}

export interface CreateContentPayload {
  title: string;
  description?: string;
  type: ContentType;
  fileUrl?: string;
  externalUrl?: string;
  mimeType?: string;
  duration?: number;
  metadata?: Record<string, unknown>;
  thumbnailUrl?: string;
}

export interface UpdateContentPayload {
  title?: string;
  description?: string;
  fileUrl?: string;
  externalUrl?: string;
  mimeType?: string;
  duration?: number;
  metadata?: Record<string, unknown>;
  thumbnailUrl?: string;
}

export interface ContentFilterParams {
  type?: ContentType;
  status?: ContentStatus;
  search?: string;
  courseId?: string;
}
