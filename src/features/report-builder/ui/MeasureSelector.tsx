/**
 * Measure Selector Component
 * Configure measure settings (label, field, aggregation)
 */

import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import type { ReportMeasure, AggregationFunction } from '@/shared/types/report-builder';

interface MeasureSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  measure: ReportMeasure | null;
  onSave: (measure: ReportMeasure) => void;
}

const AGGREGATION_FUNCTIONS: Array<{ value: AggregationFunction; label: string; description: string }> = [
  { value: 'sum', label: 'Sum', description: 'Total of all values' },
  { value: 'avg', label: 'Average', description: 'Mean of all values' },
  { value: 'min', label: 'Minimum', description: 'Smallest value' },
  { value: 'max', label: 'Maximum', description: 'Largest value' },
  { value: 'count', label: 'Count', description: 'Number of records' },
];

export const MeasureSelector: React.FC<MeasureSelectorProps> = ({
  open,
  onOpenChange,
  measure,
  onSave,
}) => {
  const [label, setLabel] = React.useState('');
  const [field, setField] = React.useState('');
  const [aggregation, setAggregation] = React.useState<AggregationFunction | undefined>(undefined);

  React.useEffect(() => {
    if (measure) {
      setLabel(measure.label || '');
      setField(measure.field || '');
      setAggregation(measure.aggregation);
    } else {
      setLabel('');
      setField('');
      setAggregation(undefined);
    }
  }, [measure, open]);

  const handleSave = () => {
    if (!measure) return;

    onSave({
      ...measure,
      label: label.trim() || undefined,
      field: field.trim() || undefined,
      aggregation,
    });

    onOpenChange(false);
  };

  if (!measure) return null;

  const selectedAggregation = aggregation
    ? AGGREGATION_FUNCTIONS.find((f) => f.value === aggregation)
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configure Measure</DialogTitle>
          <DialogDescription>
            Customize how this measure is calculated and displayed
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Measure Type (readonly) */}
          <div className="space-y-2">
            <Label>Measure Type</Label>
            <div className="p-2 rounded-md bg-muted text-sm capitalize">
              {measure.type.replace('-', ' ')}
            </div>
          </div>

          {/* Custom Label */}
          <div className="space-y-2">
            <Label htmlFor="label">Custom Label (optional)</Label>
            <Input
              id="label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={`Default: ${measure.type.replace('-', ' ')}`}
            />
            <p className="text-xs text-muted-foreground">
              Leave blank to use the default label
            </p>
          </div>

          {/* Field (optional) */}
          <div className="space-y-2">
            <Label htmlFor="field">Field (optional)</Label>
            <Input
              id="field"
              value={field}
              onChange={(e) => setField(e.target.value)}
              placeholder="e.g., score, timeSpent"
            />
            <p className="text-xs text-muted-foreground">
              Specify a specific field to use for this measure
            </p>
          </div>

          {/* Aggregation Function */}
          <div className="space-y-2">
            <Label htmlFor="aggregation">Aggregation Function</Label>
            <Select
              value={aggregation || 'none'}
              onValueChange={(value) =>
                setAggregation(value === 'none' ? undefined : (value as AggregationFunction))
              }
            >
              <SelectTrigger id="aggregation">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Default</SelectItem>
                {AGGREGATION_FUNCTIONS.map((func) => (
                  <SelectItem key={func.value} value={func.value}>
                    {func.label} - {func.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedAggregation && (
              <p className="text-xs text-muted-foreground">{selectedAggregation.description}</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
