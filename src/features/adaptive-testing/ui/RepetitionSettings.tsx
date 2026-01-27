/**
 * Repetition Settings
 * Mastery-based repetition: questions "turn off" after N correct answers
 */

import { Label } from '@/shared/ui/label';
import { Input } from '@/shared/ui/input';
import { Switch } from '@/shared/ui/switch';
import { CheckCircle2, RefreshCw } from 'lucide-react';

export interface RepetitionSettingsProps {
  /** Number of correct answers to master (null = disabled) */
  threshold: number | null;
  /** Callback when threshold changes */
  onChange: (threshold: number | null) => void;
  /** Whether the settings are disabled */
  disabled?: boolean;
}

/**
 * RepetitionSettings Component
 *
 * Configures mastery-based question repetition where questions
 * automatically "turn off" after being answered correctly a certain
 * number of times.
 */
export function RepetitionSettings({
  threshold,
  onChange,
  disabled = false,
}: RepetitionSettingsProps) {
  const enabled = threshold !== null;

  const handleEnabledChange = (checked: boolean) => {
    onChange(checked ? 3 : null);
  };

  const handleThresholdChange = (value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num >= 1 && num <= 10) {
      onChange(num);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <RefreshCw className="h-5 w-5 text-muted-foreground" />
          <div className="space-y-0.5">
            <Label htmlFor="enable-repetition" className="font-medium">
              Mastery-Based Repetition
            </Label>
            <p className="text-sm text-muted-foreground">
              Questions stop appearing after being mastered
            </p>
          </div>
        </div>
        <Switch
          id="enable-repetition"
          checked={enabled}
          onCheckedChange={handleEnabledChange}
          disabled={disabled}
        />
      </div>

      {enabled && (
        <div className="ml-8 p-4 bg-muted/50 rounded-lg space-y-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <Label htmlFor="mastery-threshold">Correct answers to master:</Label>
            <Input
              id="mastery-threshold"
              type="number"
              min={1}
              max={10}
              value={threshold ?? 3}
              onChange={(e) => handleThresholdChange(e.target.value)}
              className="w-20"
              disabled={disabled}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Questions will stop appearing after this many correct answers in a row.
            This helps learners focus on questions they haven't mastered yet.
          </p>

          {/* Visual indicator */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Example progress:</span>
            <div className="flex gap-1">
              {Array.from({ length: threshold ?? 3 }).map((_, i) => (
                <div
                  key={i}
                  className="w-6 h-6 rounded-full bg-green-100 border-2 border-green-500 flex items-center justify-center text-green-600 text-xs font-medium"
                >
                  {i + 1}
                </div>
              ))}
              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-white" />
              </div>
            </div>
            <span className="text-green-600 font-medium">Mastered!</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default RepetitionSettings;
