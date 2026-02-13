/**
 * GateIndicator
 * Visual indicator for gate status in the sidebar.
 */

import { Shield, ShieldCheck, ShieldX } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { GateDisplayStatus } from '@/shared/lib/business-logic/playlist-engine';

export interface GateIndicatorProps {
  status: GateDisplayStatus;
  className?: string;
}

const statusConfig: Record<GateDisplayStatus, { icon: typeof Shield; className: string; label: string }> = {
  pending: { icon: Shield, className: 'text-muted-foreground', label: 'Gate: pending' },
  passed: { icon: ShieldCheck, className: 'text-green-600', label: 'Gate: passed' },
  failed: { icon: ShieldX, className: 'text-destructive', label: 'Gate: failed' },
};

export function GateIndicator({ status, className }: GateIndicatorProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Icon
      className={cn('h-4 w-4', config.className, className)}
      aria-label={config.label}
    />
  );
}
