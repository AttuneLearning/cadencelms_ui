/**
 * Randomization Selector
 * Allows instructors to set question order preferences
 */

import { Label } from '@/shared/ui/label';
import { Checkbox } from '@/shared/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { Shuffle, ListOrdered, TrendingUp } from 'lucide-react';
import type { RandomizationLevel } from '../model/types';

export interface RandomizationSelectorProps {
  /** Current randomization level */
  value: RandomizationLevel;
  /** Callback when level changes */
  onChange: (level: RandomizationLevel) => void;
  /** Whether learners can choose their preferred order */
  allowUserChoice: boolean;
  /** Callback when user choice setting changes */
  onAllowUserChoiceChange: (allow: boolean) => void;
  /** Whether the selector is disabled */
  disabled?: boolean;
}

const RANDOMIZATION_OPTIONS: {
  value: RandomizationLevel;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    value: 'in_order',
    label: 'In Order',
    description: 'Questions appear in their defined sequence',
    icon: <ListOrdered className="h-4 w-4" />,
  },
  {
    value: 'by_difficulty',
    label: 'By Difficulty',
    description: 'Easy questions first, progressing to harder ones',
    icon: <TrendingUp className="h-4 w-4" />,
  },
  {
    value: 'completely_random',
    label: 'Completely Random',
    description: 'Questions appear in random order each attempt',
    icon: <Shuffle className="h-4 w-4" />,
  },
];

/**
 * RandomizationSelector Component
 *
 * Provides controls for instructors to configure how questions
 * are ordered during exercises and assessments.
 */
export function RandomizationSelector({
  value,
  onChange,
  allowUserChoice,
  onAllowUserChoiceChange,
  disabled = false,
}: RandomizationSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="randomization-level">Question Order</Label>
        <Select
          value={value}
          onValueChange={(v) => onChange(v as RandomizationLevel)}
          disabled={disabled}
        >
          <SelectTrigger id="randomization-level">
            <SelectValue placeholder="Select ordering" />
          </SelectTrigger>
          <SelectContent>
            {RANDOMIZATION_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-2">
                  {option.icon}
                  <span>{option.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          {RANDOMIZATION_OPTIONS.find((o) => o.value === value)?.description}
        </p>
      </div>

      <div className="flex items-start gap-2">
        <Checkbox
          id="allow-user-choice"
          checked={allowUserChoice}
          onCheckedChange={(checked) => onAllowUserChoiceChange(!!checked)}
          disabled={disabled}
        />
        <div className="grid gap-1.5 leading-none">
          <Label
            htmlFor="allow-user-choice"
            className="cursor-pointer font-normal"
          >
            Allow learner to choose their preferred order
          </Label>
          <p className="text-xs text-muted-foreground">
            Learners can override this setting when starting the activity
          </p>
        </div>
      </div>
    </div>
  );
}

export default RandomizationSelector;
