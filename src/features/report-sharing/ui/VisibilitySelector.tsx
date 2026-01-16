/**
 * Visibility Selector Component
 * Radio group for selecting report visibility level
 */

import React from 'react';
import { Label } from '@/shared/ui/label';
import { RadioGroup, RadioGroupItem } from '@/shared/ui/radio-group';
import { Lock, Users, Globe, Eye } from 'lucide-react';
import type { ReportVisibility } from '@/shared/types/report-builder';
import { cn } from '@/shared/lib/utils';

interface VisibilitySelectorProps {
  value: ReportVisibility;
  onChange: (value: ReportVisibility) => void;
  disabled?: boolean;
  className?: string;
}

const VISIBILITY_OPTIONS: Array<{
  value: ReportVisibility;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    value: 'private',
    label: 'Private',
    description: 'Only you can access this report',
    icon: Lock,
  },
  {
    value: 'team',
    label: 'Team',
    description: 'Only your team members can access',
    icon: Eye,
  },
  {
    value: 'department',
    label: 'Department',
    description: 'Anyone in your department can access',
    icon: Users,
  },
  {
    value: 'organization',
    label: 'Organization',
    description: 'Anyone in your organization can access',
    icon: Globe,
  },
];

export const VisibilitySelector: React.FC<VisibilitySelectorProps> = ({
  value,
  onChange,
  disabled = false,
  className,
}) => {
  return (
    <RadioGroup
      value={value}
      onValueChange={(val) => onChange(val as ReportVisibility)}
      disabled={disabled}
      className={cn('space-y-2', className)}
    >
      {VISIBILITY_OPTIONS.map((option) => {
        const Icon = option.icon;
        const isSelected = value === option.value;

        return (
          <div
            key={option.value}
            className={cn(
              'flex items-start space-x-3 p-3 rounded-lg border transition-colors cursor-pointer',
              isSelected
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            onClick={() => !disabled && onChange(option.value)}
          >
            <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
            <div className="flex-1">
              <Label
                htmlFor={option.value}
                className="flex items-center gap-2 font-medium cursor-pointer"
              >
                <Icon className="h-4 w-4" />
                {option.label}
              </Label>
              <p className="text-sm text-muted-foreground mt-0.5">
                {option.description}
              </p>
            </div>
          </div>
        );
      })}
    </RadioGroup>
  );
};
