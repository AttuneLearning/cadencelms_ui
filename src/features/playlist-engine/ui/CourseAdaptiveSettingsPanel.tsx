/**
 * CourseAdaptiveSettingsPanel
 * Instructor-facing panel for configuring adaptive playlist settings on a course.
 */

import { useState, useCallback } from 'react';
import { Settings2 } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Label } from '@/shared/ui/label';
import { Switch } from '@/shared/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import type { CourseAdaptiveSettings, AdaptiveMode } from '@/shared/lib/business-logic/playlist-engine';

export interface CourseAdaptiveSettingsPanelProps {
  /** Current settings */
  settings: CourseAdaptiveSettings;
  /** Callback when settings change */
  onSave: (settings: CourseAdaptiveSettings) => void;
  /** Whether the save is in progress */
  isSaving?: boolean;
}

const MODE_LABELS: Record<AdaptiveMode, { label: string; description: string }> = {
  off: {
    label: 'Off',
    description: 'Linear progression through all learning units.',
  },
  guided: {
    label: 'Guided',
    description: 'Gate checkpoints block progress until mastery is demonstrated.',
  },
  full: {
    label: 'Full Adaptive',
    description: 'Skip mastered content, inject practice for weak areas, retry failed gates.',
  },
};

export function CourseAdaptiveSettingsPanel({
  settings,
  onSave,
  isSaving = false,
}: CourseAdaptiveSettingsPanelProps) {
  const [draft, setDraft] = useState<CourseAdaptiveSettings>(settings);

  const handleModeChange = useCallback((mode: string) => {
    setDraft((prev) => ({ ...prev, mode: mode as AdaptiveMode }));
  }, []);

  const handleToggle = useCallback(
    (field: 'allowLearnerChoice' | 'preAssessmentEnabled') => (checked: boolean) => {
      setDraft((prev) => ({ ...prev, [field]: checked }));
    },
    []
  );

  const handleSave = useCallback(() => {
    onSave(draft);
  }, [draft, onSave]);

  const hasChanges =
    draft.mode !== settings.mode ||
    draft.allowLearnerChoice !== settings.allowLearnerChoice ||
    draft.preAssessmentEnabled !== settings.preAssessmentEnabled;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings2 className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-lg font-semibold">Adaptive Learning</h3>
      </div>

      {/* Mode Selector */}
      <div className="space-y-2">
        <Label htmlFor="adaptive-mode">Adaptive Mode</Label>
        <Select value={draft.mode} onValueChange={handleModeChange}>
          <SelectTrigger id="adaptive-mode">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.entries(MODE_LABELS) as [AdaptiveMode, typeof MODE_LABELS[AdaptiveMode]][]).map(
              ([mode, { label }]) => (
                <SelectItem key={mode} value={mode}>
                  {label}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          {MODE_LABELS[draft.mode].description}
        </p>
      </div>

      {/* Toggles (only show when mode is not off) */}
      {draft.mode !== 'off' && (
        <>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="allow-learner-choice">Allow Learner Choice</Label>
              <p className="text-sm text-muted-foreground">
                Let learners switch between off and {draft.mode} modes.
              </p>
            </div>
            <Switch
              id="allow-learner-choice"
              checked={draft.allowLearnerChoice}
              onCheckedChange={handleToggle('allowLearnerChoice')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="pre-assessment">Pre-Assessment</Label>
              <p className="text-sm text-muted-foreground">
                Run a diagnostic assessment before learners start the module.
              </p>
            </div>
            <Switch
              id="pre-assessment"
              checked={draft.preAssessmentEnabled}
              onCheckedChange={handleToggle('preAssessmentEnabled')}
            />
          </div>
        </>
      )}

      {/* Save */}
      {hasChanges && (
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      )}
    </div>
  );
}
