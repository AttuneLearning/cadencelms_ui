/**
 * Report Viewer Page
 * View and manage generated reports
 */

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Progress } from '@/shared/ui/progress';
import { Separator } from '@/shared/ui/separator';
import { useToast } from '@/shared/ui/use-toast';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import {
  ArrowLeft,
  Download,
  FileText,
  Table,
  FileSpreadsheet,
  Trash,
  RefreshCw,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react';
import {
  useReport,
  useDeleteReport,
  useCreateReport,
  type Report,
  type ReportStatus,
  type ExportFormat,
} from '@/entities/report';

export const ReportViewerPage: React.FC = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = React.useState(false);

  // Fetch report with auto-refresh for generating status
  const { data: report, isLoading, error, refetch } = useReport(reportId!, {
    refetchInterval: (data) => {
      // Auto-refresh every 5 seconds if report is generating or pending
      return data?.status === 'generating' || data?.status === 'pending' ? 5000 : false;
    },
  });

  const deleteMutation = useDeleteReport();
  const createMutation = useCreateReport();
  const [isDownloading, setIsDownloading] = React.useState(false);

  const handleDownload = async (format: ExportFormat) => {
    if (!reportId) return;

    setIsDownloading(true);
    try {
      // In a real implementation, this would call the download API
      // For now, we'll use the report's fileUrl
      toast({
        title: 'Download started',
        description: `Your ${format.toUpperCase()} report is downloading.`,
      });
    } catch (error) {
      toast({
        title: 'Download failed',
        description: 'Failed to download report. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDelete = () => {
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (!reportId) return;

    deleteMutation.mutate(reportId, {
      onSuccess: () => {
        toast({
          title: 'Report deleted',
          description: 'Report has been successfully deleted.',
        });
        navigate('/admin/reports');
      },
      onError: () => {
        toast({
          title: 'Error',
          description: 'Failed to delete report. Please try again.',
          variant: 'destructive',
        });
      },
    });
  };

  const handleGenerateAgain = () => {
    if (!report) return;

    const payload = {
      name: `${report.name} (Copy)`,
      description: report.description,
      type: report.type,
      filters: report.filters,
    };

    createMutation.mutate(payload, {
      onSuccess: (newReport) => {
        toast({
          title: 'Report generated',
          description: 'A new report has been queued for generation.',
        });
        navigate(`/admin/reports/${newReport.id}`);
      },
      onError: () => {
        toast({
          title: 'Error',
          description: 'Failed to generate report. Please try again.',
          variant: 'destructive',
        });
      },
    });
  };

  const handleRetry = () => {
    // In a real app, this would call a retry endpoint
    refetch();
    toast({
      title: 'Retrying',
      description: 'Retrying report generation...',
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <Progress value={undefined} className="w-64" />
          <p className="text-muted-foreground">Loading report...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <CardTitle>Error</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Failed to load report. The report may not exist or you don't have permission to view it.
            </p>
            <Button onClick={() => navigate('/admin/reports')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Reports
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/admin/reports')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Reports
        </Button>

        <div className="flex items-center gap-2">
          {report.status === 'ready' && (
            <>
              <Button variant="outline" onClick={handleGenerateAgain}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Generate Again
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </>
          )}
          {report.status === 'failed' && (
            <>
              <Button variant="outline" onClick={handleRetry}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Report Metadata */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl">{report.name}</CardTitle>
              {report.description && (
                <CardDescription>{report.description}</CardDescription>
              )}
            </div>
            <ReportStatusBadge status={report.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Report Type</p>
              <Badge variant="outline" className="mt-1">
                {report.type}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Created By</p>
              <p className="mt-1 text-sm">{report.createdByName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Created</p>
              <p className="mt-1 text-sm">{format(new Date(report.createdAt), 'PPp')}</p>
            </div>
            {report.generatedAt && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Generated</p>
                <p className="mt-1 text-sm">{format(new Date(report.generatedAt), 'PPp')}</p>
              </div>
            )}
            {report.rowCount !== undefined && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Row Count</p>
                <p className="mt-1 text-sm font-medium">{report.rowCount.toLocaleString()} rows</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Applied Filters */}
      {Object.keys(report.filters).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Applied Filters</CardTitle>
            <CardDescription>Filters used to generate this report</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {report.filters.dateRange && (
                <div>
                  <p className="text-sm font-medium">Date Range</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(report.filters.dateRange.start), 'PP')} -{' '}
                    {format(new Date(report.filters.dateRange.end), 'PP')}
                  </p>
                </div>
              )}
              {report.filters.programs && report.filters.programs.length > 0 && (
                <div>
                  <p className="text-sm font-medium">Programs</p>
                  <p className="text-sm text-muted-foreground">
                    {report.filters.programs.length} program(s) selected
                  </p>
                </div>
              )}
              {report.filters.courses && report.filters.courses.length > 0 && (
                <div>
                  <p className="text-sm font-medium">Courses</p>
                  <p className="text-sm text-muted-foreground">
                    {report.filters.courses.length} course(s) selected
                  </p>
                </div>
              )}
              {report.filters.departments && report.filters.departments.length > 0 && (
                <div>
                  <p className="text-sm font-medium">Departments</p>
                  <p className="text-sm text-muted-foreground">
                    {report.filters.departments.length} department(s) selected
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status-specific content */}
      {report.status === 'pending' && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <Clock className="h-12 w-12 mx-auto text-muted-foreground animate-pulse" />
              <div>
                <h3 className="text-lg font-semibold">Report Pending</h3>
                <p className="text-muted-foreground">
                  This report is waiting to be processed. It will begin generating shortly.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {report.status === 'generating' && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 mx-auto text-primary animate-spin" />
              <div>
                <h3 className="text-lg font-semibold">Generating Report</h3>
                <p className="text-muted-foreground">
                  Your report is being generated. This page will update automatically.
                </p>
              </div>
              <Progress value={undefined} className="w-64 mx-auto" />
            </div>
          </CardContent>
        </Card>
      )}

      {report.status === 'failed' && (
        <Card className="border-destructive">
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <XCircle className="h-12 w-12 mx-auto text-destructive" />
              <div>
                <h3 className="text-lg font-semibold text-destructive">Report Failed</h3>
                <p className="text-muted-foreground">
                  {report.error || 'Failed to generate report. Please try again.'}
                </p>
              </div>
              <Button onClick={handleRetry}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {report.status === 'ready' && (
        <>
          {/* Download Options */}
          <Card>
            <CardHeader>
              <CardTitle>Download Report</CardTitle>
              <CardDescription>Download your report in various formats</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  className="h-auto py-6 flex-col gap-2"
                  onClick={() => handleDownload('pdf')}
                  disabled={isDownloading}
                >
                  <FileText className="h-8 w-8" />
                  <div className="text-center">
                    <p className="font-semibold">PDF</p>
                    <p className="text-xs text-muted-foreground">Portable Document Format</p>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto py-6 flex-col gap-2"
                  onClick={() => handleDownload('excel')}
                  disabled={isDownloading}
                >
                  <Table className="h-8 w-8" />
                  <div className="text-center">
                    <p className="font-semibold">Excel</p>
                    <p className="text-xs text-muted-foreground">Microsoft Excel Format</p>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto py-6 flex-col gap-2"
                  onClick={() => handleDownload('csv')}
                  disabled={isDownloading}
                >
                  <FileSpreadsheet className="h-8 w-8" />
                  <div className="text-center">
                    <p className="font-semibold">CSV</p>
                    <p className="text-xs text-muted-foreground">Comma-Separated Values</p>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Report Preview (if available) */}
          {report.fileUrl && (
            <Card>
              <CardHeader>
                <CardTitle>Report Preview</CardTitle>
                <CardDescription>First 50 rows of the report</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Preview functionality coming soon</p>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        onConfirm={confirmDelete}
        title="Delete Report"
        description="Are you sure you want to delete this report? This action cannot be undone."
        confirmText="Delete"
        isDestructive
      />
    </div>
  );
};

// Report Status Badge Component
interface ReportStatusBadgeProps {
  status: ReportStatus;
}

const ReportStatusBadge: React.FC<ReportStatusBadgeProps> = ({ status }) => {
  const config = {
    pending: {
      icon: Clock,
      label: 'Pending',
      variant: 'secondary' as const,
    },
    generating: {
      icon: Loader2,
      label: 'Generating',
      variant: 'default' as const,
      className: 'animate-spin',
    },
    ready: {
      icon: CheckCircle2,
      label: 'Ready',
      variant: 'default' as const,
      className: 'text-green-600',
    },
    failed: {
      icon: XCircle,
      label: 'Failed',
      variant: 'destructive' as const,
    },
  };

  const { icon: Icon, label, variant, className } = config[status];

  return (
    <Badge variant={variant} className="gap-1">
      <Icon className={`h-3 w-3 ${className || ''}`} />
      {label}
    </Badge>
  );
};
