/**
 * Tests for Export Utilities
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  exportToCSV,
  exportToExcel,
  exportToPDF,
  exportAnalyticsReport,
  type AnalyticsExportData,
} from '../exportUtils';

describe('exportUtils', () => {
  let createElementSpy: any;
  let clickSpy: any;
  let createObjectURLSpy: any;
  let revokeObjectURLSpy: any;

  beforeEach(() => {
    // Mock DOM APIs
    clickSpy = vi.fn();
    const mockLink = {
      href: '',
      download: '',
      click: clickSpy,
    };

    createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any);
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any);

    // Create URL mock if it doesn't exist
    if (!global.URL.createObjectURL) {
      global.URL.createObjectURL = vi.fn();
    }
    if (!global.URL.revokeObjectURL) {
      global.URL.revokeObjectURL = vi.fn();
    }

    createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
    revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('exportToCSV', () => {
    it('should export data to CSV format', () => {
      const data = [
        { name: 'John', age: 30, score: 85 },
        { name: 'Jane', age: 25, score: 92 },
      ];

      exportToCSV(data, 'test-export');

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(clickSpy).toHaveBeenCalled();
      expect(createObjectURLSpy).toHaveBeenCalled();
      expect(revokeObjectURLSpy).toHaveBeenCalled();
    });

    it('should handle values with commas', () => {
      const data = [
        { name: 'Smith, John', location: 'New York, NY' },
      ];

      exportToCSV(data, 'test-commas');

      expect(clickSpy).toHaveBeenCalled();
    });

    it('should handle values with quotes', () => {
      const data = [
        { name: 'John "Johnny" Doe', quote: 'He said "hello"' },
      ];

      exportToCSV(data, 'test-quotes');

      expect(clickSpy).toHaveBeenCalled();
    });

    it('should throw error for empty data', () => {
      expect(() => exportToCSV([], 'empty')).toThrow('No data to export');
    });

    it('should handle null/undefined values', () => {
      const data = [
        { name: 'John', age: null, score: undefined },
      ];

      exportToCSV(data, 'test-null');

      expect(clickSpy).toHaveBeenCalled();
    });
  });

  describe('exportToExcel', () => {
    it('should export data to Excel format', () => {
      const data = [
        { name: 'John', age: 30 },
        { name: 'Jane', age: 25 },
      ];

      exportToExcel(data, 'test-excel');

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(clickSpy).toHaveBeenCalled();
    });

    it('should handle complex data', () => {
      const data = [
        { id: 1, name: 'Course 1', enrollments: 100, completion: '75%' },
        { id: 2, name: 'Course 2', enrollments: 150, completion: '82%' },
      ];

      exportToExcel(data, 'complex-data');

      expect(clickSpy).toHaveBeenCalled();
    });
  });

  describe('exportToPDF', () => {
    it('should export data to PDF format', () => {
      const data = {
        title: 'Analytics Report',
        sections: [
          {
            heading: 'Overview',
            content: 'This is a test report',
          },
        ],
      };

      exportToPDF(data, 'test-pdf');

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(clickSpy).toHaveBeenCalled();
    });

    it('should handle multiple sections', () => {
      const data = {
        title: 'Comprehensive Report',
        sections: [
          {
            heading: 'Section 1',
            content: 'Content 1',
          },
          {
            heading: 'Section 2',
            content: 'Content 2',
          },
        ],
      };

      exportToPDF(data, 'multi-section');

      expect(clickSpy).toHaveBeenCalled();
    });

    it('should handle array content in sections', () => {
      const data = {
        title: 'Data Report',
        sections: [
          {
            heading: 'Student Data',
            content: [
              { name: 'John', score: 85 },
              { name: 'Jane', score: 92 },
            ],
          },
        ],
      };

      exportToPDF(data, 'array-content');

      expect(clickSpy).toHaveBeenCalled();
    });
  });

  describe('exportAnalyticsReport', () => {
    const mockAnalyticsData: AnalyticsExportData = {
      courseTitle: 'Introduction to React',
      timeRange: 'Last 6 Months',
      metrics: {
        totalEnrollments: 198,
        completionRate: '68%',
        averageScore: '82.5',
        avgTimeSpent: '4.2h',
      },
      enrollmentTrends: [
        { month: 'Jan', enrollments: 45, completions: 32, activeStudents: 38 },
        { month: 'Feb', enrollments: 52, completions: 38, activeStudents: 45 },
      ],
      completionData: [
        { status: 'Completed', count: 68, percentage: '68%' },
        { status: 'In Progress', count: 25, percentage: '25%' },
      ],
      scoreDistribution: [
        { range: '81-100', count: 45 },
        { range: '61-80', count: 28 },
      ],
    };

    it('should export analytics as CSV', () => {
      exportAnalyticsReport(mockAnalyticsData, 'csv');

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(clickSpy).toHaveBeenCalled();
    });

    it('should export analytics as Excel', () => {
      exportAnalyticsReport(mockAnalyticsData, 'excel');

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(clickSpy).toHaveBeenCalled();
    });

    it('should export analytics as PDF', () => {
      exportAnalyticsReport(mockAnalyticsData, 'pdf');

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(clickSpy).toHaveBeenCalled();
    });

    it('should use custom filename when provided', () => {
      const mockLink = {
        href: '',
        download: '',
        click: clickSpy,
      };

      createElementSpy.mockReturnValue(mockLink);

      exportAnalyticsReport(mockAnalyticsData, 'csv', 'custom-filename');

      expect(clickSpy).toHaveBeenCalled();
    });

    it('should use default filename with timestamp', () => {
      const mockLink = {
        href: '',
        download: '',
        click: clickSpy,
      };

      createElementSpy.mockReturnValue(mockLink);

      exportAnalyticsReport(mockAnalyticsData, 'csv');

      expect(clickSpy).toHaveBeenCalled();
    });
  });
});
