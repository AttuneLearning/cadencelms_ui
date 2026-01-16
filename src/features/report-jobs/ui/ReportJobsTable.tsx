/**
 * Report Jobs Table Component
 * Table view of all report jobs with filtering and actions
 */

import React from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/shared/ui/data-table';
import { Button } from '@/shared/ui/button';
import { Checkbox } from '@/shared/ui/checkbox';
import { format } from 'date-fns';
import type { ReportJob } from '@/entities/report-job';
import { JobStatusBadge } from './JobStatusBadge';
import { JobActionsMenu } from './JobActionsMenu';
import { cn } from '@/shared/lib/utils';

interface ReportJobsTableProps {
  jobs: ReportJob[];
  onDownload?: (jobId: string) => void;
  onCancel?: (jobId: string) => void;
  onRetry?: (jobId: string) => void;
  onDelete?: (jobId: string) => void;
  onViewDetails?: (jobId: string) => void;
  onBulkDelete?: (jobIds: string[]) => void;
  isLoading?: boolean;
}

export const ReportJobsTable: React.FC<ReportJobsTableProps> = ({
  jobs,
  onDownload,
  onCancel,
  onRetry,
  onDelete,
  onViewDetails,
  onBulkDelete,
  isLoading,
}) => {
  const [selectedJobs, setSelectedJobs] = React.useState<ReportJob[]>([]);

  const columns: ColumnDef<ReportJob>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'name',
      header: 'Report Name',
      cell: ({ row }) => {
        const job = row.original;
        return (
          <div className="space-y-1">
            <p className="font-medium">{job.name}</p>
            {job.description && (
              <p className="text-sm text-muted-foreground">{job.description}</p>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'reportType',
      header: 'Type',
      cell: ({ row }) => (
        <span className="capitalize">{row.original.reportType.replace(/-/g, ' ')}</span>
      ),
    },
    {
      accessorKey: 'state',
      header: 'Status',
      cell: ({ row }) => <JobStatusBadge state={row.original.state} />,
    },
    {
      accessorKey: 'outputFormat',
      header: 'Format',
      cell: ({ row }) => (
        <span className="uppercase text-sm font-mono">{row.original.outputFormat}</span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => (
        <span className="text-sm">
          {format(new Date(row.original.createdAt), 'MMM d, yyyy HH:mm')}
        </span>
      ),
    },
    {
      accessorKey: 'metrics.progress',
      header: 'Progress',
      cell: ({ row }) => {
        const job = row.original;
        const isActive = ['pending', 'queued', 'processing', 'rendering', 'uploading'].includes(
          job.state
        );

        if (!isActive) return null;

        const progress = job.metrics?.progress ?? 0;

        return (
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm text-muted-foreground">{progress}%</span>
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <JobActionsMenu
          job={row.original}
          onDownload={onDownload}
          onCancel={onCancel}
          onRetry={onRetry}
          onDelete={onDelete}
          onViewDetails={onViewDetails}
        />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {selectedJobs.length > 0 && onBulkDelete && (
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
            {selectedJobs.length} job(s) selected
          </p>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              onBulkDelete(selectedJobs.map((j) => j._id));
              setSelectedJobs([]);
            }}
          >
            Delete Selected
          </Button>
        </div>
      )}

      <DataTable
        columns={columns}
        data={jobs}
        isLoading={isLoading}
        onRowSelectionChange={(selection) => {
          const selected = jobs.filter((_, index) => selection[index]);
          setSelectedJobs(selected);
        }}
      />
    </div>
  );
};
