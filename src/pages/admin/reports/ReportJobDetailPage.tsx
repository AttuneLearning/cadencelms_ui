/**
 * Report Job Detail Page
 * Displays detailed information about a specific report job
 */

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { useToast } from '@/shared/ui/use-toast';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { ArrowLeft, Download, Ban, RefreshCw, Trash2, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import {
  useReportJob,
  useReportJobStatus,
  useCancelReportJob,
  useRetryReportJob,
  useDeleteReportJob,
} from '@/entities/report-job';
import { JobStatusBadge, JobProgressBar } from '@/features/report-jobs';

export const ReportJobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  // Data fetching
  const { data: job, isLoading } = useReportJob(id || '', {
    enabled: !!id,
  });

  // Poll status for active jobs
  const { data: statusData } = useReportJobStatus(id || '', {
    enabled: !!id && !!job && ['pending', 'queued', 'processing', 'rendering', 'uploading'].includes(job.state),
  });

  // Mutations
  const cancelMutation = useCancelReportJob();
  const retryMutation = useRetryReportJob();
  const deleteMutation = useDeleteReportJob();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate('/admin/reports')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Reports
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Report job not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const canDownload = job.state === 'ready' || job.state === 'downloaded';
  const canCancel = ['pending', 'queued', 'processing', 'rendering', 'uploading'].includes(job.state);
  const canRetry = job.state === 'failed';

  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/v2/reports/jobs/${job._id}/download`);
      const data = await response.json();

      if (data.success && data.data.downloadUrl) {
        window.open(data.data.downloadUrl, '_blank');

        toast({
          title: 'Download Started',
          description: 'Your report download has started.',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Download Failed',
        description: error.message || 'Failed to download report',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = async () => {
    try {
      await cancelMutation.mutateAsync(job._id);

      toast({
        title: 'Job Cancelled',
        description: 'The report job has been cancelled.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to cancel job',
        variant: 'destructive',
      });
    }
  };

  const handleRetry = async () => {
    try {
      await retryMutation.mutateAsync(job._id);

      toast({
        title: 'Job Retried',
        description: 'The report job has been restarted.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to retry job',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(job._id);

      toast({
        title: 'Job Deleted',
        description: 'The report job has been deleted.',
      });

      navigate('/admin/reports');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete job',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Button variant="ghost" onClick={() => navigate('/admin/reports')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Reports
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{job.name}</h1>
          {job.description && (
            <p className="text-muted-foreground">{job.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {canDownload && (
            <Button onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          )}
          {canCancel && (
            <Button variant="outline" onClick={handleCancel}>
              <Ban className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          )}
          {canRetry && (
            <Button variant="outline" onClick={handleRetry}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          )}
          <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Status & Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Status</CardTitle>
            <JobStatusBadge state={job.state} />
          </div>
        </CardHeader>
        <CardContent>
          <JobProgressBar
            state={job.state}
            progress={statusData?.progress ?? job.metrics?.progress}
            message={statusData?.message ?? job.metrics?.message}
          />
        </CardContent>
      </Card>

      {/* Job Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Report Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Report Type</p>
              <p className="font-medium capitalize">{job.reportType.replace(/-/g, ' ')}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Output Format</p>
              <p className="font-medium uppercase">{job.outputFormat}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date Range</p>
              <p className="font-medium">
                {format(new Date(job.dateRange.start), 'MMM d, yyyy')} -{' '}
                {format(new Date(job.dateRange.end), 'MMM d, yyyy')}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Priority</p>
              <Badge variant="outline" className="capitalize">{job.priority}</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Visibility</p>
              <Badge variant="outline" className="capitalize">{job.visibility}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Job Metadata</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Job ID</p>
              <p className="font-mono text-sm">{job._id}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Created At</p>
              <p className="font-medium">
                {format(new Date(job.createdAt), 'MMM d, yyyy HH:mm:ss')}
              </p>
            </div>
            {job.startedAt && (
              <div>
                <p className="text-sm text-muted-foreground">Started At</p>
                <p className="font-medium">
                  {format(new Date(job.startedAt), 'MMM d, yyyy HH:mm:ss')}
                </p>
              </div>
            )}
            {job.completedAt && (
              <div>
                <p className="text-sm text-muted-foreground">Completed At</p>
                <p className="font-medium">
                  {format(new Date(job.completedAt), 'MMM d, yyyy HH:mm:ss')}
                </p>
              </div>
            )}
            {job.metrics?.duration && (
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-medium">{(job.metrics.duration / 1000).toFixed(1)}s</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Result Information */}
      {job.result && (
        <Card>
          <CardHeader>
            <CardTitle>Report File</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">File Name</p>
                <p className="font-medium">{job.result.fileName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">File Size</p>
                <p className="font-medium">{(job.result.fileSize / 1024).toFixed(2)} KB</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">MIME Type</p>
                <p className="font-medium text-sm">{job.result.mimeType}</p>
              </div>
            </div>
            {job.result.expiresAt && (
              <div>
                <p className="text-sm text-muted-foreground">Expires At</p>
                <p className="font-medium">
                  {format(new Date(job.result.expiresAt), 'MMM d, yyyy HH:mm:ss')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Error Information */}
      {job.error && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm text-muted-foreground">Error Code</p>
              <p className="font-mono text-sm">{job.error.code}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Error Message</p>
              <p className="font-medium">{job.error.message}</p>
            </div>
            {job.error.details && (
              <div>
                <p className="text-sm text-muted-foreground">Details</p>
                <pre className="mt-2 p-4 bg-muted rounded text-sm overflow-auto">
                  {JSON.stringify(job.error.details, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={handleDelete}
        title="Delete Report Job"
        description="Are you sure you want to delete this report job? This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
};
