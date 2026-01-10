/**
 * Export Dialog Component
 * Dialog for exporting analytics reports in CSV or PDF format
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Label } from '@/shared/ui/label';
import { RadioGroup, RadioGroupItem } from '@/shared/ui/radio-group';
import { format } from 'date-fns';
import type { AnalyticsFiltersType, MetricsData } from './types';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: AnalyticsFiltersType;
  metrics: MetricsData;
}

type ExportFormat = 'csv' | 'pdf';

export const ExportDialog: React.FC<ExportDialogProps> = ({
  open,
  onOpenChange,
  filters,
  metrics,
}) => {
  const [exportFormat, setExportFormat] = useState<ExportFormat>('csv');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);

    try {
      if (exportFormat === 'csv') {
        exportToCSV();
      } else {
        exportToPDF();
      }

      // Close dialog after export
      setTimeout(() => {
        setIsExporting(false);
        onOpenChange(false);
      }, 1000);
    } catch (error) {
      console.error('Export failed:', error);
      setIsExporting(false);
    }
  };

  const exportToCSV = () => {
    const csvData = [
      ['Metric', 'Value'],
      ['Total Students', metrics.totalStudents.toString()],
      ['Average Completion', `${metrics.avgCompletion.toFixed(1)}%`],
      ['Average Quiz Score', metrics.avgScore.toFixed(1)],
      ['Average Session Duration', `${metrics.avgSessionDuration} minutes`],
      [''],
      ['Export Date', format(new Date(), 'yyyy-MM-dd HH:mm:ss')],
      ['Date Range', filters.dateRange || 'last30Days'],
      ['Course Filter', filters.courseId || 'All Courses'],
      ['Class Filter', filters.classId || 'All Classes'],
    ];

    const csv = csvData.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    // Basic PDF export using data URL
    // In production, you'd use a library like jsPDF or html2pdf
    const content = `
Analytics Report
Generated: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}

Key Metrics:
- Total Students: ${metrics.totalStudents}
- Average Completion: ${metrics.avgCompletion.toFixed(1)}%
- Average Quiz Score: ${metrics.avgScore.toFixed(1)}
- Average Session Duration: ${metrics.avgSessionDuration} minutes

Filters Applied:
- Date Range: ${filters.dateRange || 'last30Days'}
- Course: ${filters.courseId || 'All Courses'}
- Class: ${filters.classId || 'All Classes'}
    `.trim();

    // Create a simple text file for demo (in production, use proper PDF generation)
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-report-${format(new Date(), 'yyyy-MM-dd')}.txt`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Analytics Report</DialogTitle>
          <DialogDescription>
            Choose a format to export your analytics data
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Export Format</Label>
            <RadioGroup value={exportFormat} onValueChange={(v) => setExportFormat(v as ExportFormat)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv" className="font-normal">
                  CSV (Comma-Separated Values)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pdf" id="pdf" />
                <Label htmlFor="pdf" className="font-normal">
                  PDF (Portable Document Format)
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="rounded-md bg-muted p-4 text-sm">
            <p className="font-medium mb-2">Report will include:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Key metrics summary</li>
              <li>Course completion rates</li>
              <li>Student engagement data</li>
              <li>Performance statistics</li>
              <li>Applied filters</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isExporting}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
