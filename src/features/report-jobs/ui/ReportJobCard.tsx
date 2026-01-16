/**
 * Report Job Card Component
 * Displays a report job in card format with status, progress, and actions
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Download, FileText } from 'lucide-react';
import { format } from 'date-fns';
import type { ReportJob } from '@/entities/report-job';
import { JobStatusBadge } from './JobStatusBadge';
import { JobProgressBar } from './JobProgressBar';
import { JobActionsMenu } from './JobActionsMenu';
import { cn } from '@/shared/lib/utils';

interface ReportJobCardProps {
  job: ReportJob;
  onDownload?: (jobId: string) => void;
  onCancel?: (jobId: string) => void;
  onRetry?: (jobId: string) => void;
  onDelete?: (jobId: string) => void;
  onViewDetails?: (jobId: string) => void;
  className?: string;
}

export const ReportJobCard: React.FC<ReportJobCardProps> = ({
  job,
  onDownload,
  onCancel,
  onRetry,
  onDelete,
  onViewDetails,
  className,
}) => {
  const canDownload = job.state === 'ready' || job.state === 'downloaded';
  const isActive = ['pending', 'queued', 'processing', 'rendering', 'uploading'].includes(
    job.state
  );

  return (
    <Card className={cn('hover:shadow-md transition-shadow', className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{job.name}</CardTitle>
            {job.description && (
              <CardDescription>{job.description}</CardDescription>
            )}
          </div>
          <div className="flex items-center gap-2">
            <JobStatusBadge state={job.state} />
            <JobActionsMenu
              job={job}
              onDownload={onDownload}
              onCancel={onCancel}
              onRetry={onRetry}
              onDelete={onDelete}
              onViewDetails={onViewDetails}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar for active jobs */}
        {isActive && (
          <JobProgressBar
            state={job.state}
            progress={job.metrics?.progress}
            message={job.metrics?.message}
          />
        )}

        {/* Job Metadata */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Type</p>
            <p className="font-medium">{job.reportType}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Format</p>
            <p className="font-medium uppercase">{job.outputFormat}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Created</p>
            <p className="font-medium">
              {format(new Date(job.createdAt), 'MMM d, yyyy HH:mm')}
            </p>
          </div>
          {job.completedAt && (
            <div>
              <p className="text-muted-foreground">Completed</p>
              <p className="font-medium">
                {format(new Date(job.completedAt), 'MMM d, yyyy HH:mm')}
              </p>
            </div>
          )}
        </div>

        {/* Error Message */}
        {job.state === 'failed' && job.error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            <p className="font-medium">Error:</p>
            <p>{job.error.message}</p>
          </div>
        )}

        {/* Download Button */}
        {canDownload && onDownload && (
          <Button onClick={() => onDownload(job._id)} className="w-full">
            <Download className="mr-2 h-4 w-4" />
            Download Report
          </Button>
        )}

        {/* File Info */}
        {job.result && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span>
              {job.result.fileName} ({(job.result.fileSize / 1024).toFixed(0)} KB)
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
