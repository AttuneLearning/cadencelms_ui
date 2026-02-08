/**
 * VoluntaryBadge Component
 * Indicates that demographic fields are voluntary
 */

import { Badge } from '@/shared/ui/badge';

interface VoluntaryBadgeProps {
  context?: 'eeo' | 'ipeds' | 'title-ix' | 'vevraa' | 'ada' | 'section-504' | 'general';
}

const contextLabels: Record<NonNullable<VoluntaryBadgeProps['context']>, string> = {
  'eeo': 'Voluntary - EEO Reporting',
  'ipeds': 'Voluntary - IPEDS Reporting',
  'title-ix': 'Voluntary - Title IX',
  'vevraa': 'Voluntary - VEVRAA Compliance',
  'ada': 'Voluntary - ADA Compliance',
  'section-504': 'Voluntary - Disability Services',
  'general': 'Voluntary',
};

export function VoluntaryBadge({ context = 'general' }: VoluntaryBadgeProps) {
  return (
    <Badge variant="secondary" className="text-xs">
      {contextLabels[context]}
    </Badge>
  );
}
