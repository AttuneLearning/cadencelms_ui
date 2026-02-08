/**
 * Tests for AdminAnalyticsPage
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AdminAnalyticsPage } from '../AdminAnalyticsPage';

describe('AdminAnalyticsPage', () => {
  describe('Rendering', () => {
    it('should render page title and description', () => {
      render(<AdminAnalyticsPage />);

      expect(screen.getByText('System Analytics')).toBeInTheDocument();
      expect(
        screen.getByText('System-wide analytics and performance metrics')
      ).toBeInTheDocument();
    });
  });

  describe('Stat Cards', () => {
    it('should render all six stat cards', () => {
      render(<AdminAnalyticsPage />);

      expect(screen.getByText('Total Users')).toBeInTheDocument();
      expect(screen.getByText('Active Courses')).toBeInTheDocument();
      expect(screen.getByText('Completion Rate')).toBeInTheDocument();
      expect(screen.getByText('Certificates Issued')).toBeInTheDocument();
      expect(screen.getByText('Avg. Completion Time')).toBeInTheDocument();
      expect(screen.getByText('Active Enrollments')).toBeInTheDocument();
    });

    it('should render stat values', () => {
      render(<AdminAnalyticsPage />);

      expect(screen.getByText('1,247')).toBeInTheDocument();
      expect(screen.getByText('34')).toBeInTheDocument();
      expect(screen.getByText('73%')).toBeInTheDocument();
      expect(screen.getByText('892')).toBeInTheDocument();
      expect(screen.getByText('4.2 hrs')).toBeInTheDocument();
      expect(screen.getByText('2,156')).toBeInTheDocument();
    });

    it('should render positive trend indicators', () => {
      render(<AdminAnalyticsPage />);

      expect(screen.getByText('+12.5%')).toBeInTheDocument();
      expect(screen.getByText('+8.3%')).toBeInTheDocument();
      expect(screen.getByText('+4.2%')).toBeInTheDocument();
    });

    it('should render negative trend indicator for completion time', () => {
      render(<AdminAnalyticsPage />);

      expect(screen.getByText('-6.8%')).toBeInTheDocument();
    });

    it('should show "vs last month" context for trends', () => {
      render(<AdminAnalyticsPage />);

      const vsLabels = screen.getAllByText('vs last month');
      expect(vsLabels.length).toBe(6);
    });
  });

  describe('Recent Activity', () => {
    it('should render recent activity section', () => {
      render(<AdminAnalyticsPage />);

      expect(screen.getByText('Recent Activity')).toBeInTheDocument();
      expect(
        screen.getByText('Latest system events and user actions')
      ).toBeInTheDocument();
    });

    it('should render activity items', () => {
      render(<AdminAnalyticsPage />);

      expect(
        screen.getByText('Jane Smith completed "Safety Fundamentals"')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Certificate issued to Mark Johnson for "Compliance 101"')
      ).toBeInTheDocument();
      expect(
        screen.getByText('12 new enrollments in "Leadership Basics"')
      ).toBeInTheDocument();
      expect(
        screen.getByText('5 new users added to Engineering department')
      ).toBeInTheDocument();
    });

    it('should render timestamps for activity items', () => {
      render(<AdminAnalyticsPage />);

      expect(screen.getByText('2 minutes ago')).toBeInTheDocument();
      expect(screen.getByText('15 minutes ago')).toBeInTheDocument();
      expect(screen.getByText('1 hour ago')).toBeInTheDocument();
      expect(screen.getByText('2 hours ago')).toBeInTheDocument();
    });

    it('should render all 7 activity items', () => {
      render(<AdminAnalyticsPage />);

      const listItems = screen.getAllByRole('listitem');
      expect(listItems).toHaveLength(7);
    });
  });
});
