/**
 * LearningUnitAdaptiveEditor
 * Editor for adaptive metadata on a learning unit (node tagging, gate config).
 */

import { useState, useCallback } from 'react';
import { Shield, Tag } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Switch } from '@/shared/ui/switch';
import { Badge } from '@/shared/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import type { LearningUnitAdaptive, GateConfig, GateFailStrategy } from '@/shared/lib/business-logic/playlist-engine';

export interface LearningUnitAdaptiveEditorProps {
  /** Current adaptive metadata (undefined if not yet configured) */
  adaptive?: LearningUnitAdaptive;
  /** Available knowledge nodes for tagging */
  availableNodes: Array<{ id: string; name: string }>;
  /** Callback when metadata changes */
  onSave: (adaptive: LearningUnitAdaptive) => void;
  /** Whether save is in progress */
  isSaving?: boolean;
}

const DEFAULT_GATE_CONFIG: GateConfig = {
  masteryThreshold: 0.8,
  minQuestions: 3,
  maxRetries: 2,
  failStrategy: 'hold',
};

const FAIL_STRATEGIES: { value: GateFailStrategy; label: string }[] = [
  { value: 'hold', label: 'Block Progress' },
  { value: 'allow-continue', label: 'Allow Continue' },
  { value: 'inject-practice', label: 'Inject Practice' },
  { value: 'prescribe-review', label: 'Prescribe Review' },
];

export function LearningUnitAdaptiveEditor({
  adaptive,
  availableNodes,
  onSave,
  isSaving = false,
}: LearningUnitAdaptiveEditorProps) {
  const [draft, setDraft] = useState<LearningUnitAdaptive>(
    adaptive || {
      teachesNodes: [],
      assessesNodes: [],
      isGate: false,
      isSkippable: false,
    }
  );

  const toggleNode = useCallback(
    (field: 'teachesNodes' | 'assessesNodes', nodeId: string) => {
      setDraft((prev) => {
        const current = prev[field];
        const updated = current.includes(nodeId)
          ? current.filter((id) => id !== nodeId)
          : [...current, nodeId];
        return { ...prev, [field]: updated };
      });
    },
    []
  );

  const handleToggleGate = useCallback((checked: boolean) => {
    setDraft((prev) => ({
      ...prev,
      isGate: checked,
      gateConfig: checked ? (prev.gateConfig || DEFAULT_GATE_CONFIG) : undefined,
    }));
  }, []);

  const handleToggleSkippable = useCallback((checked: boolean) => {
    setDraft((prev) => ({ ...prev, isSkippable: checked }));
  }, []);

  const handleGateConfigChange = useCallback(
    (field: keyof GateConfig, value: number | string) => {
      setDraft((prev) => ({
        ...prev,
        gateConfig: {
          ...(prev.gateConfig || DEFAULT_GATE_CONFIG),
          [field]: value,
        },
      }));
    },
    []
  );

  const handleSave = useCallback(() => {
    onSave(draft);
  }, [draft, onSave]);

  return (
    <div className="space-y-6">
      {/* Teaches Nodes */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-muted-foreground" />
          <Label>Teaches Nodes</Label>
        </div>
        <p className="text-sm text-muted-foreground">
          Knowledge nodes that this learning unit teaches.
        </p>
        <div className="flex flex-wrap gap-1.5">
          {availableNodes.map((node) => (
            <Badge
              key={node.id}
              variant={draft.teachesNodes.includes(node.id) ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => toggleNode('teachesNodes', node.id)}
            >
              {node.name}
            </Badge>
          ))}
          {availableNodes.length === 0 && (
            <p className="text-sm text-muted-foreground italic">No knowledge nodes available.</p>
          )}
        </div>
      </div>

      {/* Assesses Nodes */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-muted-foreground" />
          <Label>Assesses Nodes</Label>
        </div>
        <p className="text-sm text-muted-foreground">
          Knowledge nodes that this learning unit assesses.
        </p>
        <div className="flex flex-wrap gap-1.5">
          {availableNodes.map((node) => (
            <Badge
              key={node.id}
              variant={draft.assessesNodes.includes(node.id) ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => toggleNode('assessesNodes', node.id)}
            >
              {node.name}
            </Badge>
          ))}
          {availableNodes.length === 0 && (
            <p className="text-sm text-muted-foreground italic">No knowledge nodes available.</p>
          )}
        </div>
      </div>

      {/* Skippable Toggle */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Skippable</Label>
          <p className="text-sm text-muted-foreground">
            Allow the engine to skip this LU if taught nodes are already mastered.
          </p>
        </div>
        <Switch checked={draft.isSkippable} onCheckedChange={handleToggleSkippable} />
      </div>

      {/* Gate Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-muted-foreground" />
          <div className="space-y-0.5">
            <Label>Gate Checkpoint</Label>
            <p className="text-sm text-muted-foreground">
              Block progress until learner demonstrates mastery.
            </p>
          </div>
        </div>
        <Switch checked={draft.isGate} onCheckedChange={handleToggleGate} />
      </div>

      {/* Gate Configuration */}
      {draft.isGate && draft.gateConfig && (
        <div className="ml-6 space-y-4 rounded-lg border p-4">
          <div className="space-y-2">
            <Label htmlFor="mastery-threshold">Mastery Threshold (%)</Label>
            <Input
              id="mastery-threshold"
              type="number"
              min={0}
              max={100}
              value={Math.round(draft.gateConfig.masteryThreshold * 100)}
              onChange={(e) =>
                handleGateConfigChange('masteryThreshold', parseInt(e.target.value, 10) / 100)
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="min-questions">Minimum Questions</Label>
            <Input
              id="min-questions"
              type="number"
              min={1}
              max={50}
              value={draft.gateConfig.minQuestions}
              onChange={(e) =>
                handleGateConfigChange('minQuestions', parseInt(e.target.value, 10))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="max-retries">Max Retries (-1 = unlimited)</Label>
            <Input
              id="max-retries"
              type="number"
              min={-1}
              max={20}
              value={draft.gateConfig.maxRetries}
              onChange={(e) =>
                handleGateConfigChange('maxRetries', parseInt(e.target.value, 10))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fail-strategy">Fail Strategy</Label>
            <Select
              value={draft.gateConfig.failStrategy}
              onValueChange={(v) => handleGateConfigChange('failStrategy', v)}
            >
              <SelectTrigger id="fail-strategy">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FAIL_STRATEGIES.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Save */}
      <Button onClick={handleSave} disabled={isSaving}>
        {isSaving ? 'Saving...' : 'Save Adaptive Settings'}
      </Button>
    </div>
  );
}
