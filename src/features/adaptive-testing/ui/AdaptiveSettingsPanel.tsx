/**
 * Adaptive Settings Panel
 * Full adaptive testing configuration for instructors
 */

import { Label } from '@/shared/ui/label';
import { Input } from '@/shared/ui/input';
import { Switch } from '@/shared/ui/switch';
import { Checkbox } from '@/shared/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import {
  Brain,
  SkipForward,
  RotateCcw,
  TrendingUp,
  Target,
  Zap,
} from 'lucide-react';
import type {
  AdaptiveConfig,
  DifficultyProgression,
  ConceptMasteryAction,
} from '../model/types';

export interface AdaptiveSettingsPanelProps {
  /** Current adaptive configuration */
  config: AdaptiveConfig;
  /** Callback when configuration changes */
  onChange: (config: AdaptiveConfig) => void;
  /** Whether the panel is disabled */
  disabled?: boolean;
}

const DIFFICULTY_PROGRESSION_OPTIONS: {
  value: DifficultyProgression;
  label: string;
  description: string;
}[] = [
  {
    value: 'increase_on_correct',
    label: 'Increase on Correct',
    description: 'Move to harder questions after correct answers',
  },
  {
    value: 'decrease_on_wrong',
    label: 'Decrease on Wrong',
    description: 'Move to easier questions after incorrect answers',
  },
  {
    value: 'maintain',
    label: 'Maintain Level',
    description: 'Keep the same difficulty throughout',
  },
];

const CONCEPT_MASTERY_ACTION_OPTIONS: {
  value: ConceptMasteryAction;
  label: string;
  description: string;
}[] = [
  {
    value: 'skip_related',
    label: 'Skip Related Questions',
    description: 'Skip questions on the same concept',
  },
  {
    value: 'reduce_weight',
    label: 'Reduce Weight',
    description: 'Show related questions less frequently',
  },
  {
    value: 'complete',
    label: 'Mark Complete',
    description: 'Mark entire concept as completed',
  },
];

/**
 * AdaptiveSettingsPanel Component
 *
 * Provides comprehensive controls for configuring adaptive testing
 * behavior including difficulty progression, question skipping,
 * and concept mastery settings.
 */
export function AdaptiveSettingsPanel({
  config,
  onChange,
  disabled = false,
}: AdaptiveSettingsPanelProps) {
  const updateConfig = (updates: Partial<AdaptiveConfig>) => {
    onChange({ ...config, ...updates });
  };

  const updateConceptMastery = (updates: Partial<AdaptiveConfig['conceptMastery']>) => {
    onChange({
      ...config,
      conceptMastery: { ...config.conceptMastery, ...updates },
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-base">Adaptive Testing</CardTitle>
              <CardDescription>
                Adjust question flow based on learner performance
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {config.enabled && (
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                <Zap className="h-3 w-3 mr-1" />
                Active
              </Badge>
            )}
            <Switch
              checked={config.enabled}
              onCheckedChange={(enabled) => updateConfig({ enabled })}
              disabled={disabled}
            />
          </div>
        </div>
      </CardHeader>

      {config.enabled && (
        <CardContent className="space-y-6">
          {/* Skip Related Questions */}
          <div className="flex items-start gap-3">
            <Checkbox
              id="skip-related"
              checked={config.skipRelatedOnCorrect}
              onCheckedChange={(checked) =>
                updateConfig({ skipRelatedOnCorrect: !!checked })
              }
              disabled={disabled}
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="skip-related" className="flex items-center gap-2 cursor-pointer">
                <SkipForward className="h-4 w-4 text-muted-foreground" />
                Skip related questions on correct answer
              </Label>
              <p className="text-xs text-muted-foreground">
                When a learner answers correctly, related questions on the same concept are skipped
              </p>
            </div>
          </div>

          {/* Repeat Wrong Answers */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Checkbox
                id="repeat-wrong"
                checked={config.repeatWrongAnswers}
                onCheckedChange={(checked) =>
                  updateConfig({ repeatWrongAnswers: !!checked })
                }
                disabled={disabled}
              />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="repeat-wrong" className="flex items-center gap-2 cursor-pointer">
                  <RotateCcw className="h-4 w-4 text-muted-foreground" />
                  Repeat incorrect answers
                </Label>
                <p className="text-xs text-muted-foreground">
                  Questions answered incorrectly will reappear later in the session
                </p>
              </div>
            </div>

            {config.repeatWrongAnswers && (
              <div className="ml-6 flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Label htmlFor="repeat-delay" className="whitespace-nowrap">
                  Delay:
                </Label>
                <Input
                  id="repeat-delay"
                  type="number"
                  min={1}
                  max={20}
                  value={config.repeatDelay}
                  onChange={(e) =>
                    updateConfig({ repeatDelay: parseInt(e.target.value) || 3 })
                  }
                  className="w-20"
                  disabled={disabled}
                />
                <span className="text-sm text-muted-foreground">
                  questions before repeat
                </span>
              </div>
            )}
          </div>

          {/* Difficulty Progression */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              Difficulty Progression
            </Label>
            <Select
              value={config.difficultyProgression}
              onValueChange={(value) =>
                updateConfig({ difficultyProgression: value as DifficultyProgression })
              }
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DIFFICULTY_PROGRESSION_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {DIFFICULTY_PROGRESSION_OPTIONS.find(
                (o) => o.value === config.difficultyProgression
              )?.description}
            </p>
          </div>

          {/* Concept Mastery */}
          <div className="space-y-4 pt-4 border-t">
            <Label className="flex items-center gap-2 text-base">
              <Target className="h-4 w-4 text-muted-foreground" />
              Concept Mastery
            </Label>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="mastery-threshold">Correct answers required:</Label>
                <Input
                  id="mastery-threshold"
                  type="number"
                  min={1}
                  max={10}
                  value={config.conceptMastery.correctThreshold}
                  onChange={(e) =>
                    updateConceptMastery({
                      correctThreshold: parseInt(e.target.value) || 3,
                    })
                  }
                  className="w-24"
                  disabled={disabled}
                />
                <p className="text-xs text-muted-foreground">
                  Number of correct answers to master a concept
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mastery-action">When mastered:</Label>
                <Select
                  value={config.conceptMastery.action}
                  onValueChange={(value) =>
                    updateConceptMastery({ action: value as ConceptMasteryAction })
                  }
                  disabled={disabled}
                >
                  <SelectTrigger id="mastery-action">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONCEPT_MASTERY_ACTION_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {CONCEPT_MASTERY_ACTION_OPTIONS.find(
                    (o) => o.value === config.conceptMastery.action
                  )?.description}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export default AdaptiveSettingsPanel;
