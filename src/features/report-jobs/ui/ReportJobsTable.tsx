/**
 * Report Jobs Table Component
 * Table view of all report jobs with filtering and actions
 */

import React from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/shared/ui/data-table';
import { Button } from '@/shared/ui/button';
import { Checkbox } from '@/shared/ui/checkbox';
import { format, isValid } from 'date-fns';
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
  onShare?: (jobId: string) => void;
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
  onShare,
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
      cell: ({ row }) => {
        const reportType = row.original.reportType;
        const label =
          typeof reportType === 'string'
            ? reportType.replace(/-/g, ' ')
            : 'Unknown';
        return <span className="capitalize">{label}</span>;
      },
    },
    {
      accessorKey: 'state',
      header: 'Status',
      cell: ({ row }) => <JobStatusBadge state={row.original.state} />,
    },
    {
      accessorKey: 'outputFormat',
      header: 'Format',
      cell: ({ row }) => {
        const outputFormat = row.original.outputFormat;
        const label =
          typeof outputFormat === 'string'
            ? outputFormat.toUpperCase()
            : 'N/A';
        return <span className="uppercase text-sm font-mono">{label}</span>;
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => {
        const createdAt = row.original.createdAt;
        const createdDate = createdAt ? new Date(createdAt) : null;
        const label =
          createdDate && isValid(createdDate)
            ? format(createdDate, 'MMM d, yyyy HH:mm')
            : 'Unknown';
        return <span className="text-sm">{label}</span>;
      },
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

        const progress =
          typeof job.metrics?.progress === 'number' ? job.metrics.progress : 0;

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
          onShare={onShare}
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
        onRowSelectionChange={(selectedRows) => {
          // DataTable passes the actual selected row data, not a selection state object
          setSelectedJobs(selectedRows as ReportJob[]);
        }}
      />
    </div>
  );
};
