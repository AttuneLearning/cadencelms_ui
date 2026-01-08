/**
 * Unit tests for ContentCard component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContentCard, ContentCardList, ContentCardSkeleton } from './ContentCard';
import {
  ContentType,
  ContentStatus,
  ScormVersion,
  VideoFormat,
  DocumentFormat,
  type Content,
  type ScormMetadata,
  type VideoMetadata,
  type DocumentMetadata,
  type QuizMetadata,
  type ExternalLinkMetadata,
} from '../model/types';

// Mock content data
const mockScormContent: Content = {
  id: 'content-1',
  title: 'Introduction to SCORM',
  description: 'Learn the basics of SCORM packages',
  type: ContentType.SCORM_12,
  status: ContentStatus.PUBLISHED,
  courseId: 'course-1',
  metadata: {
    scormVersion: ScormVersion.SCORM_12,
    packageSize: 1024000,
    manifestUrl: 'https://example.com/manifest.xml',
    launchUrl: 'https://example.com/launch.html',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  } as ScormMetadata,
  isRequired: true,
  sortOrder: 1,
  thumbnailUrl: 'https://example.com/thumbnail.jpg',
};

const mockVideoContent: Content = {
  id: 'content-2',
  title: 'JavaScript Tutorial',
  description: 'Complete JavaScript video course',
  type: ContentType.VIDEO,
  status: ContentStatus.PUBLISHED,
  courseId: 'course-1',
  metadata: {
    duration: 300,
    format: VideoFormat.MP4,
    fileSize: 5242880,
    streamingUrl: 'https://example.com/video.mp4',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  } as VideoMetadata,
  thumbnailUrl: 'https://example.com/video-thumb.jpg',
};

const mockDocumentContent: Content = {
  id: 'content-3',
  title: 'Course Manual',
  description: 'Complete course documentation',
  type: ContentType.DOCUMENT,
  status: ContentStatus.PUBLISHED,
  courseId: 'course-1',
  metadata: {
    format: DocumentFormat.PDF,
    fileSize: 1048576,
    pageCount: 25,
    downloadUrl: 'https://example.com/document.pdf',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  } as DocumentMetadata,
};

const mockQuizContent: Content = {
  id: 'content-4',
  title: 'Final Exam',
  description: 'Test your knowledge',
  type: ContentType.QUIZ,
  status: ContentStatus.PUBLISHED,
  courseId: 'course-1',
  metadata: {
    questionCount: 20,
    passingScore: 70,
    timeLimit: 60,
    attemptsAllowed: 3,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  } as QuizMetadata,
};

const mockExternalLinkContent: Content = {
  id: 'content-5',
  title: 'External Resource',
  description: 'Additional learning materials',
  type: ContentType.EXTERNAL_LINK,
  status: ContentStatus.PUBLISHED,
  courseId: 'course-1',
  metadata: {
    url: 'https://example.com/resource',
    openInNewTab: true,
    estimatedDuration: 30,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  } as ExternalLinkMetadata,
};

const mockContentWithTags: Content = {
  ...mockVideoContent,
  metadata: {
    ...mockVideoContent.metadata,
    tags: ['javascript', 'tutorial', 'beginner', 'web-development'],
  },
};

describe('ContentCard', () => {
  describe('Basic rendering', () => {
    it('should render content title and description', () => {
      render(<ContentCard content={mockScormContent} />);

      expect(screen.getByText('Introduction to SCORM')).toBeInTheDocument();
      expect(screen.getByText('Learn the basics of SCORM packages')).toBeInTheDocument();
    });

    it('should render thumbnail when provided', () => {
      render(<ContentCard content={mockScormContent} />);

      const img = screen.getByAltText('Introduction to SCORM thumbnail');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', 'https://example.com/thumbnail.jpg');
    });

    it('should not render thumbnail when showThumbnail is false', () => {
      render(<ContentCard content={mockScormContent} showThumbnail={false} />);

      expect(screen.queryByAltText('Introduction to SCORM thumbnail')).not.toBeInTheDocument();
    });

    it('should render required badge when content is required', () => {
      render(<ContentCard content={mockScormContent} />);

      expect(screen.getByText('Required')).toBeInTheDocument();
    });

    it('should not render required badge when content is not required', () => {
      render(<ContentCard content={{ ...mockScormContent, isRequired: false }} />);

      expect(screen.queryByText('Required')).not.toBeInTheDocument();
    });
  });

  describe('Content type badges', () => {
    it('should render SCORM badge', () => {
      render(<ContentCard content={mockScormContent} />);
      expect(screen.getByText('SCORM 1.2')).toBeInTheDocument();
    });

    it('should render Video badge', () => {
      render(<ContentCard content={mockVideoContent} />);
      expect(screen.getByText('Video')).toBeInTheDocument();
    });

    it('should render Document badge', () => {
      render(<ContentCard content={mockDocumentContent} />);
      expect(screen.getByText('Document')).toBeInTheDocument();
    });

    it('should render Quiz badge', () => {
      render(<ContentCard content={mockQuizContent} />);
      expect(screen.getByText('Quiz')).toBeInTheDocument();
    });

    it('should render External Link badge', () => {
      render(<ContentCard content={mockExternalLinkContent} />);
      expect(screen.getByText('External Link')).toBeInTheDocument();
    });
  });

  describe('Metadata display', () => {
    it('should display video metadata', () => {
      render(<ContentCard content={mockVideoContent} />);

      expect(screen.getByText('5m 0s')).toBeInTheDocument(); // duration
      expect(screen.getByText('5 MB')).toBeInTheDocument(); // file size
    });

    it('should display document metadata', () => {
      render(<ContentCard content={mockDocumentContent} />);

      expect(screen.getByText('1 MB')).toBeInTheDocument(); // file size
      expect(screen.getByText('25 pages')).toBeInTheDocument();
    });

    it('should display quiz metadata', () => {
      render(<ContentCard content={mockQuizContent} />);

      expect(screen.getByText('20 questions')).toBeInTheDocument();
      expect(screen.getByText('60 min')).toBeInTheDocument();
      expect(screen.getByText('70% to pass')).toBeInTheDocument();
    });

    it('should hide metadata when showMetadata is false', () => {
      render(<ContentCard content={mockVideoContent} showMetadata={false} />);

      expect(screen.queryByText('5m 0s')).not.toBeInTheDocument();
    });
  });

  describe('Tags display', () => {
    it('should display tags when available', () => {
      render(<ContentCard content={mockContentWithTags} />);

      expect(screen.getByText('javascript')).toBeInTheDocument();
      expect(screen.getByText('tutorial')).toBeInTheDocument();
      expect(screen.getByText('beginner')).toBeInTheDocument();
    });

    it('should show "+N" badge when more than 3 tags', () => {
      render(<ContentCard content={mockContentWithTags} />);

      expect(screen.getByText('+1')).toBeInTheDocument();
    });

    it('should hide tags when showTags is false', () => {
      render(<ContentCard content={mockContentWithTags} showTags={false} />);

      expect(screen.queryByText('javascript')).not.toBeInTheDocument();
    });
  });

  describe('Click handling', () => {
    it('should call onClick when card is clicked', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(<ContentCard content={mockScormContent} onClick={handleClick} />);

      const card = screen.getByRole('button', { name: /open introduction to scorm/i });
      await user.click(card);

      expect(handleClick).toHaveBeenCalledWith(mockScormContent);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should call onClick when Enter key is pressed', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(<ContentCard content={mockScormContent} onClick={handleClick} />);

      const card = screen.getByRole('button', { name: /open introduction to scorm/i });
      card.focus();
      await user.keyboard('{Enter}');

      expect(handleClick).toHaveBeenCalledWith(mockScormContent);
    });

    it('should call onClick when Space key is pressed', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(<ContentCard content={mockScormContent} onClick={handleClick} />);

      const card = screen.getByRole('button', { name: /open introduction to scorm/i });
      card.focus();
      await user.keyboard(' ');

      expect(handleClick).toHaveBeenCalledWith(mockScormContent);
    });

    it('should not be interactive when onClick is not provided', () => {
      render(<ContentCard content={mockScormContent} />);

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels when clickable', () => {
      render(<ContentCard content={mockScormContent} onClick={() => {}} />);

      const card = screen.getByRole('button', { name: /open introduction to scorm/i });
      expect(card).toBeInTheDocument();
      expect(card).toHaveAttribute('tabIndex', '0');
    });

    it('should not have button role when not clickable', () => {
      render(<ContentCard content={mockScormContent} />);

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });
});

describe('ContentCardSkeleton', () => {
  it('should render loading skeleton', () => {
    render(<ContentCardSkeleton />);

    // Skeleton should be present (checking structure)
    expect(document.querySelector('.aspect-video')).toBeInTheDocument();
  });

  it('should hide thumbnail skeleton when showThumbnail is false', () => {
    render(<ContentCardSkeleton showThumbnail={false} />);

    expect(document.querySelector('.aspect-video')).not.toBeInTheDocument();
  });
});

describe('ContentCardList', () => {
  const mockContents = [mockScormContent, mockVideoContent, mockDocumentContent];

  it('should render multiple content cards', () => {
    render(<ContentCardList contents={mockContents} />);

    expect(screen.getByText('Introduction to SCORM')).toBeInTheDocument();
    expect(screen.getByText('JavaScript Tutorial')).toBeInTheDocument();
    expect(screen.getByText('Course Manual')).toBeInTheDocument();
  });

  it('should apply correct grid layout for 3 columns', () => {
    const { container } = render(<ContentCardList contents={mockContents} columns={3} />);

    const grid = container.firstChild;
    expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3');
  });

  it('should apply correct grid layout for 2 columns', () => {
    const { container } = render(<ContentCardList contents={mockContents} columns={2} />);

    const grid = container.firstChild;
    expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-2');
  });

  it('should pass onClick handler to cards', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<ContentCardList contents={mockContents} onContentClick={handleClick} />);

    const firstCard = screen.getByRole('button', { name: /open introduction to scorm/i });
    await user.click(firstCard);

    expect(handleClick).toHaveBeenCalledWith(mockScormContent);
  });
});
