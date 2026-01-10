/**
 * Export Utilities
 * Functions for exporting data to various formats (CSV, Excel, PDF)
 */

/**
 * Convert data to CSV format
 */
export function exportToCSV(data: Record<string, any>[], filename: string): void {
  if (data.length === 0) {
    throw new Error('No data to export');
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);

  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header];
        // Handle values that contain commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? '';
      }).join(',')
    )
  ].join('\n');

  downloadFile(csvContent, `${filename}.csv`, 'text/csv;charset=utf-8;');
}

/**
 * Convert data to Excel format (using CSV as fallback)
 * For true Excel support, consider using libraries like xlsx
 */
export function exportToExcel(data: Record<string, any>[], filename: string): void {
  // For now, we'll use CSV format with .xlsx extension
  // In production, you'd want to use a library like xlsx for proper Excel format
  exportToCSV(data, filename);
}

/**
 * Export analytics data to PDF
 * This is a simplified version - for production use a library like jsPDF
 */
export function exportToPDF(
  data: {
    title: string;
    sections: Array<{
      heading: string;
      content: string | Record<string, any>[];
    }>;
  },
  filename: string
): void {
  // Create a simple text-based PDF representation
  // In production, use jsPDF or similar library for proper PDF generation
  let content = `${data.title}\n${'='.repeat(data.title.length)}\n\n`;

  data.sections.forEach(section => {
    content += `${section.heading}\n${'-'.repeat(section.heading.length)}\n`;

    if (typeof section.content === 'string') {
      content += `${section.content}\n\n`;
    } else if (Array.isArray(section.content)) {
      // Format table data
      section.content.forEach(row => {
        content += Object.entries(row)
          .map(([key, value]) => `${key}: ${value}`)
          .join(' | ');
        content += '\n';
      });
      content += '\n';
    }
  });

  downloadFile(content, `${filename}.pdf`, 'application/pdf');
}

/**
 * Helper function to trigger file download
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Format analytics data for export
 */
export interface AnalyticsExportData {
  courseTitle: string;
  timeRange: string;
  metrics: {
    totalEnrollments: number;
    completionRate: string;
    averageScore: string;
    avgTimeSpent: string;
  };
  enrollmentTrends: Array<{
    month: string;
    enrollments: number;
    completions: number;
    activeStudents: number;
  }>;
  completionData: Array<{
    status: string;
    count: number;
    percentage: string;
  }>;
  scoreDistribution: Array<{
    range: string;
    count: number;
  }>;
}

/**
 * Export analytics report to specified format
 */
export function exportAnalyticsReport(
  data: AnalyticsExportData,
  format: 'csv' | 'excel' | 'pdf',
  filename?: string
): void {
  const timestamp = new Date().toISOString().split('T')[0];
  const defaultFilename = `analytics-report-${timestamp}`;
  const finalFilename = filename || defaultFilename;

  if (format === 'csv') {
    // Export enrollment trends as CSV
    const csvData = data.enrollmentTrends.map(trend => ({
      Month: trend.month,
      Enrollments: trend.enrollments,
      Completions: trend.completions,
      'Active Students': trend.activeStudents,
    }));
    exportToCSV(csvData, finalFilename);
  } else if (format === 'excel') {
    // Export comprehensive data as Excel
    const excelData = data.enrollmentTrends.map(trend => ({
      Month: trend.month,
      Enrollments: trend.enrollments,
      Completions: trend.completions,
      'Active Students': trend.activeStudents,
    }));
    exportToExcel(excelData, finalFilename);
  } else if (format === 'pdf') {
    // Export formatted report as PDF
    const pdfData = {
      title: `Analytics Report: ${data.courseTitle}`,
      sections: [
        {
          heading: 'Report Period',
          content: data.timeRange,
        },
        {
          heading: 'Key Metrics',
          content: [
            {
              'Total Enrollments': data.metrics.totalEnrollments,
              'Completion Rate': data.metrics.completionRate,
              'Average Score': data.metrics.averageScore,
              'Avg Time Spent': data.metrics.avgTimeSpent,
            },
          ],
        },
        {
          heading: 'Enrollment Trends',
          content: data.enrollmentTrends.map(t => ({
            Month: t.month,
            Enrollments: t.enrollments,
            Completions: t.completions,
            Active: t.activeStudents,
          })),
        },
        {
          heading: 'Completion Status',
          content: data.completionData.map(c => ({
            Status: c.status,
            Count: c.count,
            Percentage: c.percentage,
          })),
        },
        {
          heading: 'Score Distribution',
          content: data.scoreDistribution.map(s => ({
            Range: s.range,
            Students: s.count,
          })),
        },
      ],
    };
    exportToPDF(pdfData, finalFilename);
  }
}
