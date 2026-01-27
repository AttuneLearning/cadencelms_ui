/**
 * Save Template Dialog
 * Save custom report definition as a reusable template
 */

import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { TagInput } from '@/shared/ui/tag-input';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/shared/ui/use-toast';
import { useCreateReportTemplate } from '@/entities/report-template';
import type { CreateReportTemplateRequest, ReportTemplateCategory, ReportTemplateVisibility } from '@/entities/report-template';
import type { CustomReportDefinition, ReportOutputFormat } from '@/shared/types/report-builder';

interface SaveTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  definition: CustomReportDefinition;
  outputFormat: ReportOutputFormat;
}

const CATEGORIES: Array<{ value: ReportTemplateCategory; label: string }> = [
  { value: 'enrollment', label: 'Enrollment' },
  { value: 'performance', label: 'Performance' },
  { value: 'completion', label: 'Completion' },
  { value: 'activity', label: 'Activity' },
  { value: 'custom', label: 'Custom' },
];

const VISIBILITY_OPTIONS: Array<{ value: ReportTemplateVisibility; label: string; description: string }> = [
  { value: 'private', label: 'Private', description: 'Only you can use this template' },
  { value: 'department', label: 'Department', description: 'Anyone in your department can use this template' },
  { value: 'organization', label: 'Organization', description: 'Anyone in your organization can use this template' },
];

export const SaveTemplateDialog: React.FC<SaveTemplateDialogProps> = ({
  open,
  onOpenChange,
  definition,
  outputFormat,
}) => {
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [category, setCategory] = React.useState<ReportTemplateCategory>('custom');
  const [visibility, setVisibility] = React.useState<ReportTemplateVisibility>('private');
  const [tags, setTags] = React.useState<string[]>([]);

  const { toast } = useToast();
  const createMutation = useCreateReportTemplate();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Template name is required',
        variant: 'destructive',
      });
      return;
    }

    const tagArray = tags;

    const request: CreateReportTemplateRequest = {
      name: name.trim(),
      description: description.trim() || undefined,
      type: 'custom',
      customDefinition: definition,
      category,
      visibility,
      tags: tagArray.length > 0 ? tagArray : undefined,
      defaultOutputFormat: outputFormat,
    };

    try {
      await createMutation.mutateAsync(request);

      toast({
        title: 'Template Saved',
        description: 'Your report template has been saved successfully.',
      });

      handleClose();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save template',
        variant: 'destructive',
      });
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setCategory('custom');
    setVisibility('private');
    setTags([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Save as Template</DialogTitle>
          <DialogDescription>
            Save this report definition as a reusable template for future reports
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Template Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Template Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Monthly Enrollment Summary"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this template is used for..."
              rows={3}
            />
          </div>

          {/* Category and Visibility */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={category} onValueChange={(value) => setCategory(value as ReportTemplateCategory)}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="visibility">Visibility *</Label>
              <Select value={visibility} onValueChange={(value) => setVisibility(value as ReportTemplateVisibility)}>
                <SelectTrigger id="visibility">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VISIBILITY_OPTIONS.map((vis) => (
                    <SelectItem key={vis.value} value={vis.value}>
                      {vis.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (optional)</Label>
            <TagInput
              id="tags"
              value={tags}
              onChange={setTags}
              placeholder="Add tags..."
              maxTagLength={50}
            />
            <p className="text-xs text-muted-foreground">
              Press Enter or comma to add a tag
            </p>
          </div>

          {/* Template Summary */}
          <div className="rounded-lg border border-border bg-muted/50 p-3">
            <h3 className="text-sm font-semibold mb-2">Template Summary</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-lg font-bold">{definition.dimensions.length}</p>
                <p className="text-xs text-muted-foreground">Dimensions</p>
              </div>
              <div>
                <p className="text-lg font-bold">{definition.measures.length}</p>
                <p className="text-xs text-muted-foreground">Measures</p>
              </div>
              <div>
                <p className="text-lg font-bold">{(definition.filters?.length || 0) + (definition.slicers?.length || 0)}</p>
                <p className="text-xs text-muted-foreground">Filters</p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Template
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
