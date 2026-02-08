/**
 * Quick Actions Card Component
 * Navigation Redesign Phase 3 - 2026-02-05
 *
 * Displays contextual quick actions in a card format.
 * Actions are verb-based tasks with real data, NOT navigation duplicates.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { Badge } from '@/shared/ui/badge';
import { AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useQuickActions, type DashboardRole, type QuickAction } from '../hooks/useQuickActions';

// ============================================================================
// Types
// ============================================================================

interface QuickActionsCardProps {
  role: DashboardRole;
  title?: string;
  description?: string;
  className?: string;
  /** Maximum number of actions to display */
  limit?: number;
}

// ============================================================================
// Priority Badge
// ============================================================================

const PriorityBadge: React.FC<{ priority: QuickAction['priority']; count?: number }> = ({
  priority,
  count,
}) => {
  if (priority === 'low') return null;

  return (
    <Badge
      variant={priority === 'urgent' ? 'destructive' : 'secondary'}
      className="ml-auto text-xs"
    >
      {count ?? (priority === 'urgent' ? 'Urgent' : '')}
    </Badge>
  );
};

// ============================================================================
// Action Item
// ============================================================================

const ActionItem: React.FC<{ action: QuickAction }> = ({ action }) => {
  const Icon = action.icon;

  return (
    <Button
      variant="outline"
      className={cn(
        'w-full justify-start h-auto py-3 px-4',
        action.priority === 'urgent' && 'border-destructive/50 bg-destructive/5'
      )}
      asChild
    >
      <Link to={action.path}>
        <Icon
          className={cn(
            'mr-3 h-4 w-4 flex-shrink-0',
            action.priority === 'urgent' ? 'text-destructive' : 'text-muted-foreground'
          )}
        />
        <div className="flex flex-col items-start flex-1 min-w-0">
          <span className="text-sm font-medium truncate w-full text-left">
            {action.label}
          </span>
          {action.description && (
            <span className="text-xs text-muted-foreground truncate w-full text-left">
              {action.description}
            </span>
          )}
        </div>
        <PriorityBadge priority={action.priority} count={action.count} />
        <ArrowRight className="ml-2 h-4 w-4 flex-shrink-0 text-muted-foreground" />
      </Link>
    </Button>
  );
};

// ============================================================================
// Loading State
// ============================================================================

const LoadingState: React.FC = () => (
  <div className="space-y-2">
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex items-center gap-3 p-3">
        <Skeleton className="h-4 w-4 rounded" />
        <div className="flex-1 space-y-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

// ============================================================================
// Empty State
// ============================================================================

const EmptyState: React.FC<{ role: DashboardRole }> = ({ role }) => {
  const messages: Record<DashboardRole, string> = {
    staff: 'No pending tasks. Great job keeping up!',
    learner: 'Browse the course catalog to start learning.',
    admin: 'No urgent items requiring attention.',
  };

  return (
    <div className="py-6 text-center">
      <p className="text-sm text-muted-foreground">{messages[role]}</p>
    </div>
  );
};

// ============================================================================
// Error State
// ============================================================================

const ErrorState: React.FC<{ error: Error }> = ({ error }) => (
  <div className="py-6 text-center">
    <AlertCircle className="h-8 w-8 mx-auto text-destructive/50 mb-2" />
    <p className="text-sm text-muted-foreground">
      Failed to load quick actions
    </p>
    <p className="text-xs text-muted-foreground mt-1">{error.message}</p>
  </div>
);

// ============================================================================
// Component
// ============================================================================

export const QuickActionsCard: React.FC<QuickActionsCardProps> = ({
  role,
  title = 'Quick Actions',
  description = 'Tasks requiring your attention',
  className,
  limit = 4,
}) => {
  const { actions, isLoading, error } = useQuickActions(role, { limit });

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {title}
          {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading && <LoadingState />}
        {error && <ErrorState error={error} />}
        {!isLoading && !error && actions.length === 0 && <EmptyState role={role} />}
        {!isLoading && !error && actions.map((action) => (
          <ActionItem key={action.id} action={action} />
        ))}
      </CardContent>
    </Card>
  );
};

export default QuickActionsCard;
