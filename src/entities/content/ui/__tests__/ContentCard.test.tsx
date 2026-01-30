/**
 * Tests for ContentCard Component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContentCard } from '../ContentCard';
import {
  mockContentListItems,
  mockContents,
  mockScormPackageListItems,
  mockScormPackages,
  mockMediaFileListItems,
  mockMediaFiles,
  createMockContentListItem,
  createMockScormPackage,
  createMockMediaFile,
} from '@/test/mocks/data/content';

describe('ContentCard', () => {
  describe('Rendering', () => {
    it('should render with content list item data', () => {
      const content = mockContentListItems[0];
      render(<ContentCard content={content} />);

      expect(screen.getByText(content.title)).toBeInTheDocument();
      expect(screen.getByText(content.description!)).toBeInTheDocument();
    });

    it('should render with full content data', () => {
      render(<ContentCard content={mockContents[0]} />);

      expect(screen.getByText(mockContents[0].title)).toBeInTheDocument();
      expect(screen.getByText(mockContents[0].description!)).toBeInTheDocument();
    });

    it('should render with SCORM package list item', () => {
      const scormPackage = mockScormPackageListItems[0];
      render(<ContentCard content={scormPackage} />);

      expect(screen.getByText(scormPackage.title)).toBeInTheDocument();
      expect(screen.getByText(scormPackage.description!)).toBeInTheDocument();
    });

    it('should render with full SCORM package data', () => {
      render(<ContentCard content={mockScormPackages[0]} />);

      expect(screen.getByText(mockScormPackages[0].title)).toBeInTheDocument();
    });

    it('should render with media file list item', () => {
      const mediaFile = mockMediaFileListItems[0];
      render(<ContentCard content={mediaFile} />);

      expect(screen.getByText(mediaFile.title)).toBeInTheDocument();
    });

    it('should render with full media file data', () => {
      render(<ContentCard content={mockMediaFiles[0]} />);

      expect(screen.getByText(mockMediaFiles[0].title)).toBeInTheDocument();
    });

    it('should display content title', () => {
      const content = mockContentListItems[0];
      render(<ContentCard content={content} />);

      const title = screen.getByText(content.title);
      expect(title).toBeInTheDocument();
    });

    it('should display content description', () => {
      const content = mockContentListItems[0];
      render(<ContentCard content={content} />);

      expect(screen.getByText(content.description!)).toBeInTheDocument();
    });

    it('should not render description when not provided', () => {
      const content = createMockContentListItem({
        description: null,
      });
      const { container } = render(<ContentCard content={content} />);

      const description = container.querySelector('.line-clamp-2');
      expect(description).not.toBeInTheDocument();
    });
  });

  describe('Status Badges', () => {
    it('should display draft status badge', () => {
      const content = createMockContentListItem({ status: 'draft' });
      render(<ContentCard content={content} />);

      expect(screen.getByText('draft')).toBeInTheDocument();
    });

    it('should display published status badge', () => {
      const content = createMockContentListItem({ status: 'published' });
      render(<ContentCard content={content} />);

      expect(screen.getByText('published')).toBeInTheDocument();
    });

    it('should display archived status badge', () => {
      const content = createMockContentListItem({ status: 'archived' });
      render(<ContentCard content={content} />);

      expect(screen.getByText('archived')).toBeInTheDocument();
    });

    it('should display published badge for published SCORM package', () => {
      const scormPackage = createMockScormPackage({ isPublished: true, status: 'published' });
      render(<ContentCard content={scormPackage} />);

      expect(screen.getByText('Published')).toBeInTheDocument();
    });

    it('should display draft badge for unpublished SCORM package', () => {
      const scormPackage = createMockScormPackage({ isPublished: false, status: 'draft' });
      render(<ContentCard content={scormPackage} />);

      expect(screen.getByText('Draft')).toBeInTheDocument();
    });
  });

  describe('Type Badges', () => {
    it('should display scorm type badge', () => {
      const content = createMockContentListItem({ type: 'scorm' });
      render(<ContentCard content={content} />);

      expect(screen.getByText('scorm')).toBeInTheDocument();
    });

    it('should display media type badge', () => {
      const content = createMockContentListItem({ type: 'media' });
      render(<ContentCard content={content} />);

      expect(screen.getByText('media')).toBeInTheDocument();
    });

    it('should display exercise type badge', () => {
      const content = createMockContentListItem({ type: 'exercise' });
      render(<ContentCard content={content} />);

      expect(screen.getByText('exercise')).toBeInTheDocument();
    });

    it('should display video media type badge', () => {
      const mediaFile = createMockMediaFile({ type: 'video' });
      render(<ContentCard content={mediaFile} />);

      expect(screen.getByText('video')).toBeInTheDocument();
    });

    it('should display audio media type badge', () => {
      const mediaFile = createMockMediaFile({ type: 'audio' });
      render(<ContentCard content={mediaFile} />);

      expect(screen.getByText('audio')).toBeInTheDocument();
    });

    it('should display image media type badge', () => {
      const mediaFile = createMockMediaFile({ type: 'image' });
      render(<ContentCard content={mediaFile} />);

      expect(screen.getByText('image')).toBeInTheDocument();
    });

    it('should display document media type badge', () => {
      const mediaFile = createMockMediaFile({ type: 'document' });
      render(<ContentCard content={mediaFile} />);

      expect(screen.getByText('document')).toBeInTheDocument();
    });
  });

  describe('Department Information', () => {
    it('should display department name', () => {
      const content = mockContentListItems[0];
      render(<ContentCard content={content} />);

      expect(screen.getByText(content.department!.name)).toBeInTheDocument();
    });

    it('should display department icon', () => {
      const content = mockContentListItems[0];
      const { container } = render(<ContentCard content={content} />);

      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should not display department when not provided', () => {
      const content = createMockContentListItem({ department: null, departmentId: null });
      render(<ContentCard content={content} />);

      expect(screen.queryByTestId('department-info')).not.toBeInTheDocument();
    });
  });

  describe('Thumbnail Display', () => {
    it('should display thumbnail image when provided', () => {
      const content = mockContentListItems[0];
      render(<ContentCard content={content} />);

      const thumbnail = screen.getByAltText(content.title);
      expect(thumbnail).toBeInTheDocument();
      expect(thumbnail).toHaveAttribute('src', content.thumbnailUrl);
    });

    it('should not display thumbnail when not provided', () => {
      const content = createMockContentListItem({ thumbnailUrl: null });
      render(<ContentCard content={content} />);

      const thumbnail = screen.queryByAltText(content.title);
      expect(thumbnail).not.toBeInTheDocument();
    });
  });

  describe('File Size Display', () => {
    it('should display file size for SCORM package', () => {
      const scormPackage = mockScormPackageListItems[0];
      render(<ContentCard content={scormPackage} />);

      // 50MB = 52428800 bytes
      expect(screen.getByText('50.0 MB')).toBeInTheDocument();
    });

    it('should display file size for media file', () => {
      const mediaFile = mockMediaFileListItems[0];
      render(<ContentCard content={mediaFile} />);

      // 150MB = 157286400 bytes
      expect(screen.getByText('150.0 MB')).toBeInTheDocument();
    });

    it('should format bytes correctly', () => {
      const scormPackage = createMockScormPackage({ fileSize: 1024 });
      render(<ContentCard content={scormPackage} />);

      expect(screen.getByText('1.0 KB')).toBeInTheDocument();
    });

    it('should format kilobytes correctly', () => {
      const scormPackage = createMockScormPackage({ fileSize: 1024 * 1024 });
      render(<ContentCard content={scormPackage} />);

      expect(screen.getByText('1.0 MB')).toBeInTheDocument();
    });

    it('should format gigabytes correctly', () => {
      const scormPackage = createMockScormPackage({ fileSize: 1024 * 1024 * 1024 * 2 });
      render(<ContentCard content={scormPackage} />);

      expect(screen.getByText('2.0 GB')).toBeInTheDocument();
    });
  });

  describe('Duration Display', () => {
    it('should display duration for video media file', () => {
      const mediaFile = mockMediaFileListItems[0]; // 1800 seconds = 30 minutes
      render(<ContentCard content={mediaFile} />);

      expect(screen.getByText('30m')).toBeInTheDocument();
    });

    it('should display duration in hours and minutes', () => {
      const mediaFile = createMockMediaFile({ duration: 7200 }); // 2 hours
      render(<ContentCard content={mediaFile} />);

      expect(screen.getByText('2h 0m')).toBeInTheDocument();
    });

    it('should display duration with hours and minutes', () => {
      const mediaFile = createMockMediaFile({ duration: 5400 }); // 1h 30m
      render(<ContentCard content={mediaFile} />);

      expect(screen.getByText('1h 30m')).toBeInTheDocument();
    });

    it('should not display duration when null', () => {
      const mediaFile = createMockMediaFile({ duration: null });
      render(<ContentCard content={mediaFile} />);

      // Check that no time duration pattern is rendered (e.g., "30m", "1h 30m")
      const durationElements = screen.queryAllByText(/^\d+[hm](\s+\d+m)?$/);
      expect(durationElements).toHaveLength(0);
    });
  });

  describe('Usage Statistics', () => {
    it('should display usage count for content detail', () => {
      render(<ContentCard content={mockContents[0]} />);

      expect(screen.getByText('Used in courses')).toBeInTheDocument();
      expect(screen.getByText(mockContents[0].usageCount.toString())).toBeInTheDocument();
    });

    it('should display usage count for SCORM package detail', () => {
      render(<ContentCard content={mockScormPackages[0]} />);

      expect(screen.getByText('Used in courses')).toBeInTheDocument();
      expect(screen.getByText(mockScormPackages[0].usageCount.toString())).toBeInTheDocument();
    });

    it('should display usage count for media file detail', () => {
      render(<ContentCard content={mockMediaFiles[0]} />);

      expect(screen.getByText('Used in courses')).toBeInTheDocument();
      expect(screen.getByText(mockMediaFiles[0].usageCount.toString())).toBeInTheDocument();
    });

    it('should not display usage count for list items', () => {
      render(<ContentCard content={mockContentListItems[0]} />);

      expect(screen.queryByText('Used in courses')).not.toBeInTheDocument();
    });
  });

  describe('SCORM Statistics', () => {
    it('should display total attempts for SCORM package', () => {
      render(<ContentCard content={mockScormPackages[0]} />);

      expect(screen.getByText('Total Attempts')).toBeInTheDocument();
      expect(screen.getByText(mockScormPackages[0].totalAttempts.toString())).toBeInTheDocument();
    });

    it('should display average score for SCORM package', () => {
      render(<ContentCard content={mockScormPackages[0]} />);

      expect(screen.getByText('Average Score')).toBeInTheDocument();
      expect(screen.getByText('85.5%')).toBeInTheDocument();
    });

    it('should not display average score when null', () => {
      const scormPackage = createMockScormPackage({
        totalAttempts: 0,
        averageScore: null,
      });
      render(<ContentCard content={scormPackage} />);

      expect(screen.queryByText('Average Score')).not.toBeInTheDocument();
    });

    it('should not display SCORM stats when attempts are zero', () => {
      const scormPackage = createMockScormPackage({
        totalAttempts: 0,
        averageScore: null,
      });
      render(<ContentCard content={scormPackage} />);

      expect(screen.queryByText('Total Attempts')).not.toBeInTheDocument();
    });
  });

  describe('Metadata Display', () => {
    it('should display metadata by default', () => {
      const content = mockContentListItems[0];
      render(<ContentCard content={content} showMetadata={true} />);

      expect(screen.getByText(content.department!.name)).toBeInTheDocument();
    });

    it('should hide metadata when showMetadata is false', () => {
      const content = mockContentListItems[0];
      render(<ContentCard content={content} showMetadata={false} />);

      expect(screen.queryByText(content.department!.name)).not.toBeInTheDocument();
    });

    it('should display created date', () => {
      const content = mockContentListItems[0];
      render(<ContentCard content={content} />);

      const createdDate = new Date(content.createdAt).toLocaleDateString();
      expect(screen.getByText(`Created ${createdDate}`)).toBeInTheDocument();
    });
  });

  describe('Content Type Icons', () => {
    it('should display package icon for SCORM content', () => {
      const content = createMockContentListItem({ type: 'scorm' });
      const { container } = render(<ContentCard content={content} />);

      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should display video icon for video media', () => {
      const mediaFile = createMockMediaFile({ type: 'video' });
      const { container } = render(<ContentCard content={mediaFile} />);

      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should display music icon for audio media', () => {
      const mediaFile = createMockMediaFile({ type: 'audio' });
      const { container } = render(<ContentCard content={mediaFile} />);

      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should display image icon for image media', () => {
      const mediaFile = createMockMediaFile({ type: 'image' });
      const { container } = render(<ContentCard content={mediaFile} />);

      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should display document icon for document media', () => {
      const mediaFile = createMockMediaFile({ type: 'document' });
      const { container } = render(<ContentCard content={mediaFile} />);

      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  describe('Click Interaction', () => {
    it('should call onClick when card is clicked', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      const content = mockContentListItems[0];

      render(<ContentCard content={content} onClick={onClick} />);

      const card = screen.getByText(content.title).closest('div[class*="cursor-pointer"]');
      expect(card).toBeInTheDocument();

      await user.click(card!);

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should not be clickable when onClick is not provided', () => {
      const content = mockContentListItems[0];
      const { container } = render(<ContentCard content={content} />);

      const clickableCard = container.querySelector('[class*="cursor-pointer"]');
      expect(clickableCard).not.toBeInTheDocument();
    });

    it('should have hover styles when clickable', () => {
      const content = mockContentListItems[0];
      render(<ContentCard content={content} onClick={() => {}} />);

      const card = screen.getByText(content.title).closest('div[class*="cursor-pointer"]');
      expect(card).toHaveClass('cursor-pointer');
      expect(card).toHaveClass('hover:bg-accent');
    });
  });

  describe('Edge Cases', () => {
    it('should handle content with zero usage count', () => {
      const content = createMockScormPackage({ usageCount: 0 });
      render(<ContentCard content={content} />);

      expect(screen.getByText('Used in courses')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should handle very long content title', () => {
      const longTitle = 'A'.repeat(200);
      const content = createMockContentListItem({ title: longTitle });
      const { container } = render(<ContentCard content={content} />);

      const title = container.querySelector('.truncate');
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent(longTitle);
    });

    it('should handle very long description', () => {
      const longDescription = 'B'.repeat(500);
      const content = createMockContentListItem({ description: longDescription });
      const { container } = render(<ContentCard content={content} />);

      const description = container.querySelector('.line-clamp-2');
      expect(description).toBeInTheDocument();
      expect(description).toHaveTextContent(longDescription);
    });

    it('should handle empty description', () => {
      const content = createMockContentListItem({ description: '' });
      const { container } = render(<ContentCard content={content} />);

      const description = container.querySelector('.line-clamp-2');
      expect(description).not.toBeInTheDocument();
    });

    it('should handle SCORM package with no attempts', () => {
      const scormPackage = createMockScormPackage({
        totalAttempts: 0,
        averageScore: null,
      });
      render(<ContentCard content={scormPackage} />);

      expect(screen.queryByText('Total Attempts')).not.toBeInTheDocument();
      expect(screen.queryByText('Average Score')).not.toBeInTheDocument();
    });

    it('should handle media file with zero duration', () => {
      const mediaFile = createMockMediaFile({ duration: 0 });
      render(<ContentCard content={mediaFile} />);

      expect(screen.getByText('0m')).toBeInTheDocument();
    });

    it('should handle very large file sizes', () => {
      const scormPackage = createMockScormPackage({
        fileSize: 1024 * 1024 * 1024 * 10, // 10GB
      });
      render(<ContentCard content={scormPackage} />);

      expect(screen.getByText('10.0 GB')).toBeInTheDocument();
    });

    it('should handle very small file sizes', () => {
      const scormPackage = createMockScormPackage({ fileSize: 512 });
      render(<ContentCard content={scormPackage} />);

      expect(screen.getByText('512 B')).toBeInTheDocument();
    });
  });

  describe('Snapshot Tests', () => {
    it('should match snapshot with content list item', () => {
      const { container } = render(
        <ContentCard content={mockContentListItems[0]} />
      );

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot with SCORM package', () => {
      const { container } = render(
        <ContentCard content={mockScormPackages[0]} />
      );

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot with media file', () => {
      const { container } = render(
        <ContentCard content={mockMediaFiles[0]} />
      );

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot with onClick handler', () => {
      const { container } = render(
        <ContentCard content={mockContentListItems[0]} onClick={() => {}} />
      );

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot without metadata', () => {
      const { container } = render(
        <ContentCard content={mockContentListItems[0]} showMetadata={false} />
      );

      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
