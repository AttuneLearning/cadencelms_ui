/**
 * Learner List Component
 * Displays a list of learners with pagination
 */

import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { LearnerCard } from './LearnerCard';
import type { LearnerSummary, Pagination } from '../model/types';

interface LearnerListProps {
  learners: LearnerSummary[];
  pagination?: Pagination;
  isLoading?: boolean;
  error?: Error | null;
  onLearnerClick?: (learner: LearnerSummary) => void;
  onPageChange?: (page: number) => void;
}

export function LearnerList({
  learners,
  pagination,
  isLoading,
  error,
  onLearnerClick,
  onPageChange,
}: LearnerListProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load learners: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  // Empty state
  if (!learners || learners.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No learners found. Try adjusting your filters.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {/* Learner cards grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {learners.map((learner) => (
          <LearnerCard
            key={learner.id}
            learner={learner}
            onClick={onLearnerClick ? () => onLearnerClick(learner) : undefined}
          />
        ))}
      </div>

      {/* Pagination controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t pt-4">
          <div className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(pagination.page - 1)}
              disabled={!pagination.hasPrev}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(pagination.page + 1)}
              disabled={!pagination.hasNext}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
