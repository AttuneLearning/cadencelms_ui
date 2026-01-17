/**
 * Report Jobs Page
 * Admin interface for managing report generation jobs
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { useToast } from '@/shared/ui/use-toast';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { Plus, RefreshCw } from 'lucide-react';
import { PageHeader } from '@/shared/ui/page-header';
import {
  useReportJobs,
  useCancelReportJob,
  useRetryReportJob,
  useDeleteReportJob,
  useBulkDeleteReportJobs,
  useReportJobDownload,
  type ListReportJobsParams,
} from '@/entities/report-job';
import {
  ReportJobsTable,
  CreateReportJobDialog,
} from '@/features/report-jobs';
import { ShareReportDialog } from '@/features/report-sharing';

export const ReportJobsPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // State
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [jobToDelete, setJobToDelete] = React.useState<string | null>(null);
  const [jobsToDelete, setJobsToDelete] = React.useState<string[]>([]);
  const [jobToShare, setJobToShare] = React.useState<string | null>(null);

  // Filters
  const [filters, setFilters] = React.useState<ListReportJobsParams>({
    page: 1,
    limit: 50,
  });

  // Data fetching
  const { data: jobsData, isLoading, refetch } = useReportJobs(filters, {
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Mutations
  const cancelMutation = useCancelReportJob();
  const retryMutation = useRetryReportJob();
  const deleteMutation = useDeleteReportJob();
  const bulkDeleteMutation = useBulkDeleteReportJobs();

  // Handlers
  const handleDownload = async (jobId: string) => {
    try {
      // Use the download hook to get the URL
      const response = await fetch(`/api/v2/reports/jobs/${jobId}/download`);
      const data = await response.json();

      if (data.success && data.data.downloadUrl) {
        // Trigger browser download
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

  const handleCancel = async (jobId: string) => {
    try {
      await cancelMutation.mutateAsync(jobId);

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

  const handleRetry = async (jobId: string) => {
    try {
      await retryMutation.mutateAsync(jobId);

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

  const handleDelete = async (jobId: string) => {
    try {
      await deleteMutation.mutateAsync(jobId);

      toast({
        title: 'Job Deleted',
        description: 'The report job has been deleted.',
      });

      setJobToDelete(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete job',
        variant: 'destructive',
      });
    }
  };

  const handleBulkDelete = async (jobIds: string[]) => {
    setJobsToDelete(jobIds);
  };

  const confirmBulkDelete = async () => {
    try {
      await bulkDeleteMutation.mutateAsync(jobsToDelete);

      toast({
        title: 'Jobs Deleted',
        description: `${jobsToDelete.length} job(s) have been deleted.`,
      });

      setJobsToDelete([]);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete jobs',
        variant: 'destructive',
      });
    }
  };

  const handleViewDetails = (jobId: string) => {
    navigate(`/admin/reports/jobs/${jobId}`);
  };

  const handleShare = (jobId: string) => {
    setJobToShare(jobId);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Report Jobs"
        description="Manage and monitor your report generation jobs"
      >
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Report
        </Button>
      </PageHeader>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Jobs</CardDescription>
            <CardTitle className="text-3xl">{jobsData?.totalCount || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active</CardDescription>
            <CardTitle className="text-3xl text-primary">
              {jobsData?.jobs.filter((j) =>
                ['pending', 'queued', 'processing', 'rendering', 'uploading'].includes(j.state)
              ).length || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Ready</CardDescription>
            <CardTitle className="text-3xl text-green-600">
              {jobsData?.jobs.filter((j) => j.state === 'ready').length || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Failed</CardDescription>
            <CardTitle className="text-3xl text-destructive">
              {jobsData?.jobs.filter((j) => j.state === 'failed').length || 0}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Jobs Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Jobs</CardTitle>
          <CardDescription>
            View and manage all report generation jobs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReportJobsTable
            jobs={jobsData?.jobs || []}
            onDownload={handleDownload}
            onCancel={handleCancel}
            onRetry={handleRetry}
            onDelete={(id) => setJobToDelete(id)}
            onViewDetails={handleViewDetails}
            onShare={handleShare}
            onBulkDelete={handleBulkDelete}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <CreateReportJobDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />

      {/* Share Dialog */}
      {jobToShare && (
        <ShareReportDialog
          open={!!jobToShare}
          onOpenChange={(open) => !open && setJobToShare(null)}
          reportId={jobToShare}
          reportName={
            jobsData?.jobs.find((j) => j._id === jobToShare)?.name || 'Report'
          }
          currentVisibility={
            jobsData?.jobs.find((j) => j._id === jobToShare)?.visibility || 'private'
          }
          sharedWith={[]}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!jobToDelete}
        onOpenChange={(open) => !open && setJobToDelete(null)}
        onConfirm={() => jobToDelete && handleDelete(jobToDelete)}
        title="Delete Report Job"
        description="Are you sure you want to delete this report job? This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmDialog
        open={jobsToDelete.length > 0}
        onOpenChange={(open) => !open && setJobsToDelete([])}
        onConfirm={confirmBulkDelete}
        title="Delete Multiple Jobs"
        description={`Are you sure you want to delete ${jobsToDelete.length} job(s)? This action cannot be undone.`}
        confirmText="Delete All"
        variant="destructive"
      />
    </div>
  );
};
