/**
 * Dimension Selector Component
 * Configure dimension settings (label, field, sorting)
 */

import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/label';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import type { ReportDimension } from '@/shared/types/report-builder';

interface DimensionSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dimension: ReportDimension | null;
  onSave: (dimension: ReportDimension) => void;
}

export const DimensionSelector: React.FC<DimensionSelectorProps> = ({
  open,
  onOpenChange,
  dimension,
  onSave,
}) => {
  const [label, setLabel] = React.useState('');
  const [field, setField] = React.useState('');
  const [sortBy, setSortBy] = React.useState<'asc' | 'desc' | undefined>(undefined);

  React.useEffect(() => {
    if (dimension) {
      setLabel(dimension.label || '');
      setField(dimension.field || '');
      setSortBy(dimension.sortBy);
    } else {
      setLabel('');
      setField('');
      setSortBy(undefined);
    }
  }, [dimension, open]);

  const handleSave = () => {
    if (!dimension) return;

    onSave({
      ...dimension,
      label: label.trim() || undefined,
      field: field.trim() || undefined,
      sortBy,
    });

    onOpenChange(false);
  };

  if (!dimension) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configure Dimension</DialogTitle>
          <DialogDescription>
            Customize how this dimension appears in your report
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Dimension Type (readonly) */}
          <div className="space-y-2">
            <Label>Dimension Type</Label>
            <div className="p-2 rounded-md bg-muted text-sm capitalize">
              {dimension.type.replace('-', ' ')}
            </div>
          </div>

          {/* Custom Label */}
          <div className="space-y-2">
            <Label htmlFor="label">Custom Label (optional)</Label>
            <Input
              id="label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={`Default: ${dimension.type.replace('-', ' ')}`}
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
              placeholder="e.g., firstName, courseName"
            />
            <p className="text-xs text-muted-foreground">
              Specify a specific field to use for this dimension
            </p>
          </div>

          {/* Sort By */}
          <div className="space-y-2">
            <Label htmlFor="sortBy">Sort Order</Label>
            <Select
              value={sortBy || 'none'}
              onValueChange={(value) =>
                setSortBy(value === 'none' ? undefined : (value as 'asc' | 'desc'))
              }
            >
              <SelectTrigger id="sortBy">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No sorting</SelectItem>
                <SelectItem value="asc">Ascending (A-Z, 0-9)</SelectItem>
                <SelectItem value="desc">Descending (Z-A, 9-0)</SelectItem>
              </SelectContent>
            </Select>
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
