/**
 * Unit tests for content types and helper functions
 */

import { describe, it, expect } from 'vitest';
import {
  ContentType,
  ContentStatus,
  ScormVersion,
  VideoFormat,
  DocumentFormat,
  getContentTypeDisplayName,
  formatFileSize,
  formatDuration,
  isScormMetadata,
  isVideoMetadata,
  isDocumentMetadata,
  isQuizMetadata,
  isExternalLinkMetadata,
  type ScormMetadata,
  type VideoMetadata,
  type DocumentMetadata,
  type QuizMetadata,
  type ExternalLinkMetadata,
} from './types';

describe('Content Types', () => {
  describe('ContentType enum', () => {
    it('should have all expected content types', () => {
      expect(ContentType.SCORM_12).toBe('SCORM_12');
      expect(ContentType.SCORM_2004).toBe('SCORM_2004');
      expect(ContentType.VIDEO).toBe('VIDEO');
      expect(ContentType.DOCUMENT).toBe('DOCUMENT');
      expect(ContentType.QUIZ).toBe('QUIZ');
      expect(ContentType.EXTERNAL_LINK).toBe('EXTERNAL_LINK');
    });
  });

  describe('getContentTypeDisplayName', () => {
    it('should return correct display name for SCORM 1.2', () => {
      expect(getContentTypeDisplayName(ContentType.SCORM_12)).toBe('SCORM 1.2');
    });

    it('should return correct display name for SCORM 2004', () => {
      expect(getContentTypeDisplayName(ContentType.SCORM_2004)).toBe('SCORM 2004');
    });

    it('should return correct display name for Video', () => {
      expect(getContentTypeDisplayName(ContentType.VIDEO)).toBe('Video');
    });

    it('should return correct display name for Document', () => {
      expect(getContentTypeDisplayName(ContentType.DOCUMENT)).toBe('Document');
    });

    it('should return correct display name for Quiz', () => {
      expect(getContentTypeDisplayName(ContentType.QUIZ)).toBe('Quiz');
    });

    it('should return correct display name for External Link', () => {
      expect(getContentTypeDisplayName(ContentType.EXTERNAL_LINK)).toBe(
        'External Link'
      );
    });
  });

  describe('formatFileSize', () => {
    it('should format 0 bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
    });

    it('should format bytes correctly', () => {
      expect(formatFileSize(500)).toBe('500 Bytes');
    });

    it('should format kilobytes correctly', () => {
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
    });

    it('should format megabytes correctly', () => {
      expect(formatFileSize(1048576)).toBe('1 MB');
      expect(formatFileSize(5242880)).toBe('5 MB');
    });

    it('should format gigabytes correctly', () => {
      expect(formatFileSize(1073741824)).toBe('1 GB');
      expect(formatFileSize(2147483648)).toBe('2 GB');
    });

    it('should round to 2 decimal places', () => {
      expect(formatFileSize(1536000)).toBe('1.46 MB');
    });
  });

  describe('formatDuration', () => {
    it('should format seconds only', () => {
      expect(formatDuration(30)).toBe('30s');
      expect(formatDuration(59)).toBe('59s');
    });

    it('should format minutes and seconds', () => {
      expect(formatDuration(60)).toBe('1m 0s');
      expect(formatDuration(90)).toBe('1m 30s');
      expect(formatDuration(125)).toBe('2m 5s');
    });

    it('should format hours and minutes', () => {
      expect(formatDuration(3600)).toBe('1h 0m');
      expect(formatDuration(3660)).toBe('1h 1m');
      expect(formatDuration(7200)).toBe('2h 0m');
    });

    it('should format hours, minutes and seconds correctly', () => {
      expect(formatDuration(3661)).toBe('1h 1m');
    });
  });

  describe('Type guards', () => {
    const scormMetadata: ScormMetadata = {
      scormVersion: ScormVersion.SCORM_12,
      packageSize: 1024000,
      manifestUrl: 'https://example.com/manifest.xml',
      launchUrl: 'https://example.com/launch.html',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    const videoMetadata: VideoMetadata = {
      duration: 300,
      format: VideoFormat.MP4,
      fileSize: 5242880,
      streamingUrl: 'https://example.com/video.mp4',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    const documentMetadata: DocumentMetadata = {
      format: DocumentFormat.PDF,
      fileSize: 1048576,
      downloadUrl: 'https://example.com/document.pdf',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    const quizMetadata: QuizMetadata = {
      questionCount: 10,
      passingScore: 70,
      attemptsAllowed: 3,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    const externalLinkMetadata: ExternalLinkMetadata = {
      url: 'https://example.com',
      openInNewTab: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    describe('isScormMetadata', () => {
      it('should return true for SCORM metadata', () => {
        expect(isScormMetadata(scormMetadata)).toBe(true);
      });

      it('should return false for non-SCORM metadata', () => {
        expect(isScormMetadata(videoMetadata)).toBe(false);
        expect(isScormMetadata(documentMetadata)).toBe(false);
        expect(isScormMetadata(quizMetadata)).toBe(false);
        expect(isScormMetadata(externalLinkMetadata)).toBe(false);
      });
    });

    describe('isVideoMetadata', () => {
      it('should return true for video metadata', () => {
        expect(isVideoMetadata(videoMetadata)).toBe(true);
      });

      it('should return false for non-video metadata', () => {
        expect(isVideoMetadata(scormMetadata)).toBe(false);
        expect(isVideoMetadata(documentMetadata)).toBe(false);
        expect(isVideoMetadata(quizMetadata)).toBe(false);
        expect(isVideoMetadata(externalLinkMetadata)).toBe(false);
      });
    });

    describe('isDocumentMetadata', () => {
      it('should return true for document metadata', () => {
        expect(isDocumentMetadata(documentMetadata)).toBe(true);
      });

      it('should return false for non-document metadata', () => {
        expect(isDocumentMetadata(scormMetadata)).toBe(false);
        expect(isDocumentMetadata(videoMetadata)).toBe(false);
        expect(isDocumentMetadata(quizMetadata)).toBe(false);
        expect(isDocumentMetadata(externalLinkMetadata)).toBe(false);
      });
    });

    describe('isQuizMetadata', () => {
      it('should return true for quiz metadata', () => {
        expect(isQuizMetadata(quizMetadata)).toBe(true);
      });

      it('should return false for non-quiz metadata', () => {
        expect(isQuizMetadata(scormMetadata)).toBe(false);
        expect(isQuizMetadata(videoMetadata)).toBe(false);
        expect(isQuizMetadata(documentMetadata)).toBe(false);
        expect(isQuizMetadata(externalLinkMetadata)).toBe(false);
      });
    });

    describe('isExternalLinkMetadata', () => {
      it('should return true for external link metadata', () => {
        expect(isExternalLinkMetadata(externalLinkMetadata)).toBe(true);
      });

      it('should return false for non-external link metadata', () => {
        expect(isExternalLinkMetadata(scormMetadata)).toBe(false);
        expect(isExternalLinkMetadata(videoMetadata)).toBe(false);
        expect(isExternalLinkMetadata(documentMetadata)).toBe(false);
        expect(isExternalLinkMetadata(quizMetadata)).toBe(false);
      });
    });
  });

  describe('Enums', () => {
    it('should have correct ContentStatus values', () => {
      expect(ContentStatus.DRAFT).toBe('DRAFT');
      expect(ContentStatus.PUBLISHED).toBe('PUBLISHED');
      expect(ContentStatus.ARCHIVED).toBe('ARCHIVED');
    });

    it('should have correct ScormVersion values', () => {
      expect(ScormVersion.SCORM_12).toBe('1.2');
      expect(ScormVersion.SCORM_2004_3RD).toBe('2004 3rd Edition');
      expect(ScormVersion.SCORM_2004_4TH).toBe('2004 4th Edition');
    });

    it('should have correct VideoFormat values', () => {
      expect(VideoFormat.MP4).toBe('MP4');
      expect(VideoFormat.WEBM).toBe('WEBM');
      expect(VideoFormat.OGG).toBe('OGG');
      expect(VideoFormat.HLS).toBe('HLS');
      expect(VideoFormat.DASH).toBe('DASH');
    });

    it('should have correct DocumentFormat values', () => {
      expect(DocumentFormat.PDF).toBe('PDF');
      expect(DocumentFormat.DOCX).toBe('DOCX');
      expect(DocumentFormat.PPTX).toBe('PPTX');
      expect(DocumentFormat.XLSX).toBe('XLSX');
      expect(DocumentFormat.TXT).toBe('TXT');
      expect(DocumentFormat.HTML).toBe('HTML');
    });
  });
});
