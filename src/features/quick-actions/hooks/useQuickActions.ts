/**
 * Quick Actions Hook
 * Navigation Redesign Phase 3 - 2026-02-05
 *
 * Provides contextual, verb-based quick actions based on user role and data.
 * Actions are actionable tasks, NOT navigation duplicates.
 *
 * Design principles:
 * - Actions are verbs (e.g., "Grade 5 pending submissions", not "View Grading")
 * - Actions are contextual (based on real data, not static links)
 * - Actions show counts/urgency when available
 */

import { useMemo } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  CheckSquare,
  AlertCircle,
  Play,
  FileText,
  UserPlus,
  BookOpen,
  Award,
  Calendar,
  TrendingUp,
} from 'lucide-react';
import { useMyEnrollments } from '@/entities/enrollment/hooks/useEnrollments';
import { useDepartmentContext } from '@/shared/hooks';

// ============================================================================
// Types
// ============================================================================

export type QuickActionPriority = 'urgent' | 'normal' | 'low';

export interface QuickAction {
  id: string;
  label: string;
  description?: string;
  icon: LucideIcon;
  path: string;
  priority: QuickActionPriority;
  count?: number;
  isLoading?: boolean;
}

export type DashboardRole = 'staff' | 'learner' | 'admin';

interface UseQuickActionsOptions {
  /** Maximum number of actions to return */
  limit?: number;
}

interface UseQuickActionsReturn {
  actions: QuickAction[];
  isLoading: boolean;
  error: Error | null;
}

// ============================================================================
// Staff Quick Actions
// ============================================================================

function useStaffQuickActions(limit: number): UseQuickActionsReturn {
  const { currentDepartmentId } = useDepartmentContext();

  // TODO: Replace with real hooks when available
  // const { data: pendingGrading } = useGradingQueue({ status: 'pending' });
  // const { data: upcomingClasses } = useMyClasses({ upcoming: true });

  const actions = useMemo((): QuickAction[] => {
    const result: QuickAction[] = [];

    // Mock data - replace with real data from hooks
    // TODO: These will come from real API hooks when available
    const pendingGradingCount = 5 as number;
    const upcomingClassCount = 2 as number;
    const draftCoursesCount = 1 as number;

    // Urgent: Grading needed
    if (pendingGradingCount > 0) {
      result.push({
        id: 'grade-submissions',
        label: `Grade ${pendingGradingCount} pending submission${pendingGradingCount === 1 ? '' : 's'}`,
        description: 'Students awaiting feedback',
        icon: CheckSquare,
        path: '/staff/grading',
        priority: 'urgent',
        count: pendingGradingCount,
      });
    }

    // Normal: Upcoming classes
    if (upcomingClassCount > 0) {
      result.push({
        id: 'upcoming-classes',
        label: `${upcomingClassCount} class${upcomingClassCount === 1 ? '' : 'es'} this week`,
        description: 'View schedule and prepare',
        icon: Calendar,
        path: '/staff/classes',
        priority: 'normal',
        count: upcomingClassCount,
      });
    }

    // Normal: Draft courses
    if (draftCoursesCount > 0) {
      result.push({
        id: 'finish-drafts',
        label: `Finish ${draftCoursesCount} draft course${draftCoursesCount === 1 ? '' : 's'}`,
        description: 'Complete and publish',
        icon: FileText,
        path: '/staff/courses?status=draft',
        priority: 'normal',
        count: draftCoursesCount,
      });
    }

    // Department-specific actions
    if (currentDepartmentId) {
      result.push({
        id: 'add-students',
        label: 'Enroll new students',
        description: 'Add learners to your department',
        icon: UserPlus,
        path: `/staff/departments/${currentDepartmentId}/students`,
        priority: 'low',
      });
    }

    return result.slice(0, limit);
  }, [currentDepartmentId, limit]);

  return {
    actions,
    isLoading: false,
    error: null,
  };
}

// ============================================================================
// Learner Quick Actions
// ============================================================================

function useLearnerQuickActions(limit: number): UseQuickActionsReturn {
  const { data: enrollments, isLoading, error } = useMyEnrollments({
    status: 'active',
    limit: 5,
  });

  const actions = useMemo((): QuickAction[] => {
    const result: QuickAction[] = [];

    if (!enrollments) return result;

    const inProgressCourses = enrollments.enrollments.filter(
      (e) => e.status === 'active' && e.progress.percentage > 0 && e.progress.percentage < 100
    );
    const notStartedCourses = enrollments.enrollments.filter(
      (e) => e.status === 'active' && e.progress.percentage === 0
    );

    // Urgent: Continue where you left off
    if (inProgressCourses.length > 0) {
      const mostRecent = inProgressCourses[0];
      result.push({
        id: 'continue-course',
        label: `Continue "${mostRecent.target.name}"`,
        description: `${mostRecent.progress.percentage}% complete`,
        icon: Play,
        path: `/learner/courses/${mostRecent.target.id}/play`,
        priority: 'urgent',
      });
    }

    // Normal: Start new courses
    if (notStartedCourses.length > 0) {
      result.push({
        id: 'start-courses',
        label: `Start ${notStartedCourses.length} new course${notStartedCourses.length !== 1 ? 's' : ''}`,
        description: 'Begin your learning',
        icon: BookOpen,
        path: '/learner/classes',
        priority: 'normal',
        count: notStartedCourses.length,
      });
    }

    // Low: View progress
    if (inProgressCourses.length > 0 || notStartedCourses.length > 0) {
      result.push({
        id: 'track-progress',
        label: 'Track your progress',
        description: "See how far you've come",
        icon: TrendingUp,
        path: '/learner/progress',
        priority: 'low',
      });
    }

    // Low: View certificates
    result.push({
      id: 'view-certificates',
      label: 'View certificates',
      description: 'Your earned achievements',
      icon: Award,
      path: '/learner/certificates',
      priority: 'low',
    });

    return result.slice(0, limit);
  }, [enrollments, limit]);

  return {
    actions,
    isLoading,
    error: error || null,
  };
}

// ============================================================================
// Admin Quick Actions
// ============================================================================

function useAdminQuickActions(limit: number): UseQuickActionsReturn {
  // TODO: Replace with real hooks when available
  // const { data: pendingUsers } = usePendingUsers();
  // const { data: systemAlerts } = useSystemAlerts();

  const actions = useMemo((): QuickAction[] => {
    const result: QuickAction[] = [];

    // Mock data - replace with real data
    // TODO: These will come from real API hooks when available
    const pendingUserApprovals = 3 as number;
    const systemAlertsCount = 1 as number;

    // Urgent: System alerts
    if (systemAlertsCount > 0) {
      result.push({
        id: 'system-alerts',
        label: `${systemAlertsCount} system alert${systemAlertsCount === 1 ? '' : 's'}`,
        description: 'Requires attention',
        icon: AlertCircle,
        path: '/admin/alerts',
        priority: 'urgent',
        count: systemAlertsCount,
      });
    }

    // Urgent: Pending approvals
    if (pendingUserApprovals > 0) {
      result.push({
        id: 'approve-users',
        label: `Approve ${pendingUserApprovals} pending user${pendingUserApprovals === 1 ? '' : 's'}`,
        description: 'User registration requests',
        icon: UserPlus,
        path: '/admin/users?status=pending',
        priority: 'urgent',
        count: pendingUserApprovals,
      });
    }

    // Normal: Review reports
    result.push({
      id: 'review-reports',
      label: 'Review system reports',
      description: 'Daily analytics summary',
      icon: FileText,
      path: '/admin/reports',
      priority: 'normal',
    });

    return result.slice(0, limit);
  }, [limit]);

  return {
    actions,
    isLoading: false,
    error: null,
  };
}

// ============================================================================
// Main Hook
// ============================================================================

/**
 * Hook to get contextual quick actions for a dashboard
 *
 * @param role - The dashboard role ('staff', 'learner', 'admin')
 * @param options - Configuration options
 * @returns Quick actions with loading and error state
 */
export function useQuickActions(
  role: DashboardRole,
  options: UseQuickActionsOptions = {}
): UseQuickActionsReturn {
  const { limit = 4 } = options;

  const staffActions = useStaffQuickActions(limit);
  const learnerActions = useLearnerQuickActions(limit);
  const adminActions = useAdminQuickActions(limit);

  return useMemo(() => {
    switch (role) {
      case 'staff':
        return staffActions;
      case 'learner':
        return learnerActions;
      case 'admin':
        return adminActions;
      default:
        return { actions: [], isLoading: false, error: null };
    }
  }, [role, staffActions, learnerActions, adminActions]);
}

export default useQuickActions;
