/**
 * Job Status Badge Component
 * Displays the current state of a report job with appropriate styling
 */

import React from 'react';
import { Badge } from '@/shared/ui/badge';
import type { ReportJobState } from '@/entities/report-job';
import {
  Clock,
  Loader2,
  CheckCircle2,
  XCircle,
  Ban,
  AlertTriangle,
  Download,
} from 'lucide-react';

interface JobStatusBadgeProps {
  state?: ReportJobState | string | null;
  className?: string;
}

const STATE_CONFIG: Record<
  ReportJobState,
  {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
    icon: React.ComponentType<{ className?: string }>;
    customClass?: string;
  }
> = {
  pending: {
    label: 'Pending',
    variant: 'secondary',
    icon: Clock,
  },
  queued: {
    label: 'Queued',
    variant: 'secondary',
    icon: Clock,
  },
  processing: {
    label: 'Processing',
    variant: 'default',
    icon: Loader2,
  },
  rendering: {
    label: 'Rendering',
    variant: 'default',
    icon: Loader2,
  },
  uploading: {
    label: 'Uploading',
    variant: 'default',
    icon: Loader2,
  },
  ready: {
    label: 'Ready',
    variant: 'outline',
    icon: CheckCircle2,
    customClass: 'border-green-600 text-green-600 bg-green-50',
  },
  downloaded: {
    label: 'Downloaded',
    variant: 'outline',
    icon: Download,
  },
  failed: {
    label: 'Failed',
    variant: 'destructive',
    icon: XCircle,
  },
  cancelled: {
    label: 'Cancelled',
    variant: 'outline',
    icon: Ban,
  },
  expired: {
    label: 'Expired',
    variant: 'outline',
    icon: AlertTriangle,
    customClass: 'border-orange-600 text-orange-600 bg-orange-50',
  },
};

export const JobStatusBadge: React.FC<JobStatusBadgeProps> = ({ state, className }) => {
  const config = state ? STATE_CONFIG[state as ReportJobState] : undefined;

  if (!config) {
    return (
      <Badge variant="secondary" className={className}>
        <AlertTriangle className="mr-1 h-3 w-3" />
        Unknown
      </Badge>
    );
  }

  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant}
      className={config.customClass ? `${config.customClass} ${className}` : className}
    >
      <Icon className="mr-1 h-3 w-3" />
      {config.label}
    </Badge>
  );
};
