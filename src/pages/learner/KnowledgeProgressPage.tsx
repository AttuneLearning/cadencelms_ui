/**
 * Knowledge Progress Page (Learner View)
 * View learner's knowledge mastery progress
 */

import { useParams } from 'react-router-dom';

import { PageHeader } from '@/shared/ui/page-header';
import { ErrorPanel } from '@/shared/ui/error-panel';
import { Skeleton } from '@/shared/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Progress } from '@/shared/ui/progress';
import { Badge } from '@/shared/ui/badge';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/shared/ui/data-table';

import {
  useLearnerProgress,
  useProgressSummary,
  type LearnerKnowledgeProgress,
} from '@/entities/learner-progress';

export function KnowledgeProgressPage() {
  const { learnerId } = useParams<{ learnerId: string }>();

  const {
    data: summary,
    isLoading: summaryLoading,
    error: summaryError,
  } = useProgressSummary(learnerId!);

  const {
    data: progressData,
    isLoading: progressLoading,
    error: progressError,
    refetch,
  } = useLearnerProgress(learnerId!);

  const isLoading = summaryLoading || progressLoading;
  const error = summaryError || progressError;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorPanel
        error={error}
        onRetry={refetch}
        title="Failed to load progress"
      />
    );
  }

  const columns: ColumnDef<LearnerKnowledgeProgress>[] = [
    {
      accessorKey: 'knowledgeNodeName',
      header: 'Knowledge Area',
    },
    {
      accessorKey: 'currentDepth',
      header: 'Current Level',
      cell: ({ row }) => (
        <Badge variant="secondary">{row.original.currentDepth}</Badge>
      ),
    },
    {
      accessorKey: 'masteryScore',
      header: 'Mastery',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Progress value={row.original.masteryScore * 100} className="w-32" />
          <span className="text-sm text-muted-foreground">
            {(row.original.masteryScore * 100).toFixed(0)}%
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'totalAttempts',
      header: 'Attempts',
      cell: ({ row }) => (
        <span>
          {row.original.correctAttempts} / {row.original.totalAttempts}
        </span>
      ),
    },
    {
      accessorKey: 'consecutiveCorrect',
      header: 'Streak',
      cell: ({ row }) => (
        <Badge variant={row.original.consecutiveCorrect >= 3 ? 'default' : 'outline'}>
          🔥 {row.original.consecutiveCorrect}
        </Badge>
      ),
    },
    {
      accessorKey: 'isComplete',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.isComplete ? 'default' : 'secondary'}>
          {row.original.isComplete ? '✓ Complete' : 'In Progress'}
        </Badge>
      ),
    },
    {
      accessorKey: 'lastAttemptAt',
      header: 'Last Activity',
      cell: ({ row }) =>
        new Date(row.original.lastAttemptAt).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Knowledge Progress"
        description="Track your mastery across knowledge areas"
      />

      {summary && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Total Knowledge Areas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalNodes}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {summary.completedNodes}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {summary.inProgressNodes}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Average Mastery
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(summary.averageMastery * 100).toFixed(0)}%
              </div>
              <Progress value={summary.averageMastery * 100} className="mt-2" />
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Detailed Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={progressData?.progress ?? []}
            searchable
            searchPlaceholder="Search knowledge areas..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
