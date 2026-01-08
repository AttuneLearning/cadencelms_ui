/**
 * Content entity types
 * Defines content types, interfaces, and metadata for various content formats
 */

/**
 * Content type enumeration
 * Supports SCORM 1.2, SCORM 2004, video, document, quiz, and external link
 */
export enum ContentType {
  SCORM_12 = 'SCORM_12',
  SCORM_2004 = 'SCORM_2004',
  VIDEO = 'VIDEO',
  DOCUMENT = 'DOCUMENT',
  QUIZ = 'QUIZ',
  EXTERNAL_LINK = 'EXTERNAL_LINK',
}

/**
 * Content status enumeration
 */
export enum ContentStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

/**
 * SCORM version enumeration
 */
export enum ScormVersion {
  SCORM_12 = '1.2',
  SCORM_2004_3RD = '2004 3rd Edition',
  SCORM_2004_4TH = '2004 4th Edition',
}

/**
 * Video format enumeration
 */
export enum VideoFormat {
  MP4 = 'MP4',
  WEBM = 'WEBM',
  OGG = 'OGG',
  HLS = 'HLS',
  DASH = 'DASH',
}

/**
 * Document format enumeration
 */
export enum DocumentFormat {
  PDF = 'PDF',
  DOCX = 'DOCX',
  PPTX = 'PPTX',
  XLSX = 'XLSX',
  TXT = 'TXT',
  HTML = 'HTML',
}

/**
 * Base content metadata shared by all content types
 */
export interface BaseContentMetadata {
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  version?: string;
  tags?: string[];
}

/**
 * SCORM-specific metadata
 */
export interface ScormMetadata extends BaseContentMetadata {
  scormVersion: ScormVersion;
  packageSize: number; // in bytes
  manifestUrl: string;
  launchUrl: string;
  completionThreshold?: number; // percentage (0-100)
  masteryScore?: number; // percentage (0-100)
  objectives?: string[];
}

/**
 * Video-specific metadata
 */
export interface VideoMetadata extends BaseContentMetadata {
  duration: number; // in seconds
  format: VideoFormat;
  resolution?: string; // e.g., "1920x1080"
  fileSize: number; // in bytes
  thumbnailUrl?: string;
  subtitlesUrl?: string;
  transcriptUrl?: string;
  streamingUrl?: string;
}

/**
 * Document-specific metadata
 */
export interface DocumentMetadata extends BaseContentMetadata {
  format: DocumentFormat;
  fileSize: number; // in bytes
  pageCount?: number;
  downloadUrl: string;
  previewUrl?: string;
  thumbnailUrl?: string;
}

/**
 * Quiz-specific metadata
 */
export interface QuizMetadata extends BaseContentMetadata {
  questionCount: number;
  timeLimit?: number; // in minutes
  passingScore: number; // percentage (0-100)
  attemptsAllowed?: number;
  shuffleQuestions?: boolean;
  showCorrectAnswers?: boolean;
  randomizeAnswers?: boolean;
}

/**
 * External link-specific metadata
 */
export interface ExternalLinkMetadata extends BaseContentMetadata {
  url: string;
  openInNewTab?: boolean;
  requiresAuthentication?: boolean;
  estimatedDuration?: number; // in minutes
  thumbnailUrl?: string;
}

/**
 * Union type for all content-specific metadata
 */
export type ContentMetadata =
  | ScormMetadata
  | VideoMetadata
  | DocumentMetadata
  | QuizMetadata
  | ExternalLinkMetadata;

/**
 * Main content entity interface
 */
export interface Content {
  id: string;
  title: string;
  description?: string;
  type: ContentType;
  status: ContentStatus;
  courseId?: string;
  lessonId?: string;
  metadata: ContentMetadata;
  isRequired?: boolean;
  sortOrder?: number;
  thumbnailUrl?: string;
}

/**
 * Content creation payload
 */
export interface CreateContentPayload {
  title: string;
  description?: string;
  type: ContentType;
  status?: ContentStatus;
  courseId?: string;
  lessonId?: string;
  metadata: Partial<ContentMetadata>;
  isRequired?: boolean;
  sortOrder?: number;
  thumbnailUrl?: string;
}

/**
 * Content update payload
 */
export interface UpdateContentPayload {
  title?: string;
  description?: string;
  status?: ContentStatus;
  metadata?: Partial<ContentMetadata>;
  isRequired?: boolean;
  sortOrder?: number;
  thumbnailUrl?: string;
}

/**
 * Content filter parameters
 */
export interface ContentFilterParams {
  type?: ContentType;
  status?: ContentStatus;
  courseId?: string;
  lessonId?: string;
  search?: string;
  tags?: string[];
}

/**
 * Type guard to check if metadata is SCORM metadata
 */
export function isScormMetadata(
  metadata: ContentMetadata
): metadata is ScormMetadata {
  return (
    'scormVersion' in metadata &&
    'manifestUrl' in metadata &&
    'launchUrl' in metadata
  );
}

/**
 * Type guard to check if metadata is video metadata
 */
export function isVideoMetadata(
  metadata: ContentMetadata
): metadata is VideoMetadata {
  return 'duration' in metadata && 'format' in metadata && 'streamingUrl' in metadata;
}

/**
 * Type guard to check if metadata is document metadata
 */
export function isDocumentMetadata(
  metadata: ContentMetadata
): metadata is DocumentMetadata {
  return 'format' in metadata && 'downloadUrl' in metadata;
}

/**
 * Type guard to check if metadata is quiz metadata
 */
export function isQuizMetadata(
  metadata: ContentMetadata
): metadata is QuizMetadata {
  return (
    'questionCount' in metadata &&
    'passingScore' in metadata &&
    'attemptsAllowed' in metadata
  );
}

/**
 * Type guard to check if metadata is external link metadata
 */
export function isExternalLinkMetadata(
  metadata: ContentMetadata
): metadata is ExternalLinkMetadata {
  return 'url' in metadata && 'openInNewTab' in metadata;
}

/**
 * Helper function to get content type display name
 */
export function getContentTypeDisplayName(type: ContentType): string {
  const displayNames: Record<ContentType, string> = {
    [ContentType.SCORM_12]: 'SCORM 1.2',
    [ContentType.SCORM_2004]: 'SCORM 2004',
    [ContentType.VIDEO]: 'Video',
    [ContentType.DOCUMENT]: 'Document',
    [ContentType.QUIZ]: 'Quiz',
    [ContentType.EXTERNAL_LINK]: 'External Link',
  };
  return displayNames[type];
}

/**
 * Helper function to format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Helper function to format duration in seconds to readable time
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}
