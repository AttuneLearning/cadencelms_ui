/**
 * Report Builder Page
 * Admin interface for building and generating reports
 */

import React from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import {
  FileBarChart,
  TrendingUp,
  Calendar as CalendarIcon,
  Users,
  Download,
  Trash,
  Loader2,
  RotateCcw,
  FileSpreadsheet,
  FileText,
  ClipboardList,
} from 'lucide-react';
import { DataTable } from '@/shared/ui/data-table';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { useToast } from '@/shared/ui/use-toast';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { PageHeader } from '@/shared/ui/page-header';
import { DateRangePicker } from '@/shared/ui/date-range-picker';
import {
  useReports,
  useCreateReport,
  useDeleteReport,
  type ReportType,
  type ExportFormat,
  type Report,
  type ReportStatus,
} from '@/entities/report';

const reportTypes = [
  {
    type: 'enrollment' as ReportType,
    label: 'Enrollment Reports',
    description: 'Track student enrollments and registration data',
    icon: ClipboardList,
  },
  {
    type: 'performance' as ReportType,
    label: 'Performance Reports',
    description: 'Analyze student grades and assessment results',
    icon: TrendingUp,
  },
  {
    type: 'attendance' as ReportType,
    label: 'Attendance Reports',
    description: 'Monitor class attendance and participation',
    icon: CalendarIcon,
  },
  {
    type: 'student-progress' as ReportType,
    label: 'Student Progress Reports',
    description: 'View detailed learner activity and progress',
    icon: Users,
  },
];

export const ReportBuilderPage: React.FC = () => {
  const [selectedType, setSelectedType] = React.useState<ReportType | null>(null);
  const [reportName, setReportName] = React.useState('');
  const [reportDescription, setReportDescription] = React.useState('');
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>();
  const [exportFormat, setExportFormat] = React.useState<ExportFormat>('pdf');
  const [reportToDelete, setReportToDelete] = React.useState<string | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = React.useState(false);
  const [validationErrors, setValidationErrors] = React.useState<Record<string, string>>({});

  const { toast } = useToast();

  // Fetch reports
  const { data: reportsData, isLoading, error } = useReports();

  // Mutations
  const generateMutation = useCreateReport();
  const deleteMutation = useDeleteReport();

  // Handle mutation success/error
  React.useEffect(() => {
    if (generateMutation.isSuccess) {
      toast({
        title: 'Report generation started',
        description: 'Your report is being generated. You will be notified when it is ready.',
      });
      handleReset();
    }
  }, [generateMutation.isSuccess]);

  React.useEffect(() => {
    if (generateMutation.isError) {
      toast({
        title: 'Error',
        description: (generateMutation.error as any)?.message || 'Failed to generate report. Please try again.',
        variant: 'destructive',
      });
    }
  }, [generateMutation.isError]);

  React.useEffect(() => {
    if (deleteMutation.isSuccess) {
      toast({
        title: 'Report deleted',
        description: 'Report has been successfully deleted.',
      });
      setIsDeleteConfirmOpen(false);
      setReportToDelete(null);
    }
  }, [deleteMutation.isSuccess]);

  React.useEffect(() => {
    if (deleteMutation.isError) {
      toast({
        title: 'Error',
        description: (deleteMutation.error as any)?.message || 'Failed to delete report. Please try again.',
        variant: 'destructive',
      });
    }
  }, [deleteMutation.isError]);

  // Validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!reportName.trim()) {
      errors.reportName = 'Report name is required';
    }

    if (!selectedType) {
      errors.reportType = 'Report type is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handlers
  const handleGenerate = () => {
    if (!validateForm()) {
      return;
    }

    generateMutation.mutate({
      name: reportName,
      description: reportDescription || undefined,
      type: selectedType!,
      filters: {
        dateRange: dateRange?.from && dateRange?.to ? {
          start: format(dateRange.from, 'yyyy-MM-dd'),
          end: format(dateRange.to, 'yyyy-MM-dd'),
        } : undefined,
      },
    });
  };

  const handleReset = () => {
    setSelectedType(null);
    setReportName('');
    setReportDescription('');
    setDateRange(undefined);
    setExportFormat('pdf');
    setValidationErrors({});
  };

  const handleDelete = (id: string) => {
    setReportToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (reportToDelete) {
      deleteMutation.mutate(reportToDelete);
    }
  };

  const handleDownload = async (report: Report) => {
    if (report.fileUrl) {
      window.open(report.fileUrl, '_blank');
    }
  };

  const getStatusBadge = (status: ReportStatus) => {
    const variants: Record<ReportStatus, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      ready: { variant: 'default', label: 'ready' },
      generating: { variant: 'secondary', label: 'generating' },
      pending: { variant: 'outline', label: 'pending' },
      failed: { variant: 'destructive', label: 'failed' },
    };

    const config = variants[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Define columns for reports table
  const columns: ColumnDef<Report>[] = [
    {
      accessorKey: 'name',
      header: 'Report Name',
      cell: ({ row }) => {
        const report = row.original;
        return (
          <div>
            <div className="font-medium">{report.name}</div>
            <div className="text-sm text-muted-foreground capitalize">
              {report.type.replace('-', ' ')}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => {
        const created = row.original.createdAt;
        return (
          <span className="text-sm text-muted-foreground">
            {format(new Date(created), 'MMM dd, yyyy HH:mm')}
          </span>
        );
      },
    },
    {
      accessorKey: 'generatedAt',
      header: 'Completed',
      cell: ({ row }) => {
        const completed = row.original.generatedAt;
        return completed ? (
          <span className="text-sm text-muted-foreground">
            {format(new Date(completed), 'MMM dd, yyyy HH:mm')}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const report = row.original;
        return (
          <div className="flex items-center gap-2">
            {report.status === 'ready' && report.fileUrl && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDownload(report)}
                aria-label="Download report"
              >
                <Download className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(report.id)}
              className="text-destructive"
              aria-label="Delete report"
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-8 p-8">
      <PageHeader
        title="Report Builder"
        description="Build and generate reports for enrollment, performance, and attendance"
      />

      {/* Report Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Report Type</CardTitle>
          <CardDescription>Choose the type of report you want to generate</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {reportTypes.map((reportType) => {
              const Icon = reportType.icon;
              return (
                <button
                  key={reportType.type}
                  onClick={() => setSelectedType(reportType.type)}
                  className={`p-4 border rounded-lg text-left hover:border-primary transition-colors ${
                    selectedType === reportType.type ? 'border-primary ring-2 ring-primary/20' : ''
                  }`}
                >
                  <Icon className="h-8 w-8 mb-2 text-primary" />
                  <h3 className="font-semibold mb-1">{reportType.label}</h3>
                  <p className="text-sm text-muted-foreground">{reportType.description}</p>
                </button>
              );
            })}
          </div>
          {validationErrors.reportType && (
            <p className="text-sm text-destructive mt-2">{validationErrors.reportType}</p>
          )}
        </CardContent>
      </Card>

      {/* Report Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Report Configuration</CardTitle>
          <CardDescription>Configure your report settings and filters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Report Name and Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="report-name">Report Name *</Label>
              <Input
                id="report-name"
                placeholder="e.g., Q1 2024 Enrollment Report"
                value={reportName}
                onChange={(e) => {
                  setReportName(e.target.value);
                  if (validationErrors.reportName) {
                    setValidationErrors({ ...validationErrors, reportName: '' });
                  }
                }}
              />
              {validationErrors.reportName && (
                <p className="text-sm text-destructive">{validationErrors.reportName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="export-format">Export Format</Label>
              <Select value={exportFormat} onValueChange={(value) => setExportFormat(value as ExportFormat)}>
                <SelectTrigger id="export-format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="report-description">Description (Optional)</Label>
            <Textarea
              id="report-description"
              placeholder="Add a description for this report..."
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <Label>Date Range (Optional)</Label>
            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
              placeholder="Select date range"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-4">
            <Button
              onClick={handleGenerate}
              disabled={generateMutation.isPending}
            >
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileBarChart className="mr-2 h-4 w-4" />
                  Generate Report
                </>
              )}
            </Button>
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
          <CardDescription>View and manage your generated reports</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Error State */}
          {error && (
            <div className="text-destructive p-4 border border-destructive rounded-md">
              <h3 className="font-semibold mb-2">Error loading reports</h3>
              <p className="text-sm">{(error as any).message}</p>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading reports...</span>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && (!reportsData?.reports || reportsData.reports.length === 0) && (
            <div className="text-center py-12">
              <FileBarChart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No reports generated yet</h3>
              <p className="text-muted-foreground">
                Generate your first report using the form above
              </p>
            </div>
          )}

          {/* Data Table */}
          {!isLoading && !error && reportsData?.reports && reportsData.reports.length > 0 && (
            <DataTable
              columns={columns}
              data={reportsData.reports}
            />
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        onConfirm={confirmDelete}
        title="Delete Report"
        description="Are you sure you want to delete this report? This action cannot be undone."
        confirmText="Delete"
        isDestructive
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
