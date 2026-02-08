/**
 * Job Actions Menu Component
 * Dropdown menu for report job actions (cancel, retry, delete, download)
 */

import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { Button } from '@/shared/ui/button';
import { MoreHorizontal, Download, Ban, RefreshCw, Trash2, Eye, Share2 } from 'lucide-react';
import type { ReportJob } from '@/entities/report-job';

interface JobActionsMenuProps {
  job: ReportJob;
  onDownload?: (jobId: string) => void;
  onCancel?: (jobId: string) => void;
  onRetry?: (jobId: string) => void;
  onDelete?: (jobId: string) => void;
  onViewDetails?: (jobId: string) => void;
  onShare?: (jobId: string) => void;
}

export const JobActionsMenu: React.FC<JobActionsMenuProps> = ({
  job,
  onDownload,
  onCancel,
  onRetry,
  onDelete,
  onViewDetails,
  onShare,
}) => {
  const canDownload = job.state === 'ready' || job.state === 'downloaded';
  const canCancel = ['pending', 'queued', 'processing', 'rendering', 'uploading'].includes(
    job.state
  );
  const canRetry = job.state === 'failed';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {onViewDetails && (
          <DropdownMenuItem onClick={() => onViewDetails(job._id)}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
        )}

        {canDownload && onDownload && (
          <DropdownMenuItem onClick={() => onDownload(job._id)}>
            <Download className="mr-2 h-4 w-4" />
            Download Report
          </DropdownMenuItem>
        )}

        {onShare && (
          <DropdownMenuItem onClick={() => onShare(job._id)}>
            <Share2 className="mr-2 h-4 w-4" />
            Share Report
          </DropdownMenuItem>
        )}

        {canCancel && onCancel && (
          <DropdownMenuItem onClick={() => onCancel(job._id)}>
            <Ban className="mr-2 h-4 w-4" />
            Cancel Job
          </DropdownMenuItem>
        )}

        {canRetry && onRetry && (
          <DropdownMenuItem onClick={() => onRetry(job._id)}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry Job
          </DropdownMenuItem>
        )}

        {onDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(job._id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Job
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
