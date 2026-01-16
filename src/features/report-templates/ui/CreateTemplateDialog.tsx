/**
 * Create Template Dialog
 * Dialog for creating a new report template (simplified version for Phase 2)
 */

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { useToast } from '@/shared/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { useCreateReportTemplate, type CreateReportTemplateRequest } from '@/entities/report-template';
import type { ReportType, ReportOutputFormat } from '@/shared/types/report-builder';

interface CreateTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PREDEFINED_TYPES: Array<{ value: ReportType; label: string }> = [
  { value: 'enrollment-summary', label: 'Enrollment Summary' },
  { value: 'completion-rates', label: 'Completion Rates' },
  { value: 'performance-analysis', label: 'Performance Analysis' },
  { value: 'learner-activity', label: 'Learner Activity' },
  { value: 'course-analytics', label: 'Course Analytics' },
];

const CATEGORIES = [
  { value: 'enrollment', label: 'Enrollment' },
  { value: 'analytics', label: 'Analytics' },
  { value: 'performance', label: 'Performance' },
  { value: 'activity', label: 'Activity' },
  { value: 'assessment', label: 'Assessment' },
];

const OUTPUT_FORMATS: Array<{ value: ReportOutputFormat; label: string }> = [
  { value: 'pdf', label: 'PDF' },
  { value: 'excel', label: 'Excel' },
  { value: 'csv', label: 'CSV' },
];

export const CreateTemplateDialog: React.FC<CreateTemplateDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [predefinedType, setPredefinedType] = React.useState<ReportType>('enrollment-summary');
  const [category, setCategory] = React.useState('enrollment');
  const [outputFormat, setOutputFormat] = React.useState<ReportOutputFormat>('pdf');

  const { toast } = useToast();
  const createMutation = useCreateReportTemplate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Template name is required',
        variant: 'destructive',
      });
      return;
    }

    const request: CreateReportTemplateRequest = {
      name: name.trim(),
      description: description.trim() || undefined,
      type: 'predefined',
      predefinedType,
      category,
      defaultOutputFormat: outputFormat,
      visibility: 'private',
      tags: [category],
    };

    try {
      await createMutation.mutateAsync(request);

      toast({
        title: 'Template Created',
        description: 'Your report template has been created successfully.',
      });

      handleClose();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create template',
        variant: 'destructive',
      });
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setPredefinedType('enrollment-summary');
    setCategory('enrollment');
    setOutputFormat('pdf');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Report Template</DialogTitle>
          <DialogDescription>
            Create a reusable template for generating reports
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Template Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Template Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Monthly Enrollment Report"
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
              placeholder="Describe what this template generates..."
              rows={3}
            />
          </div>

          {/* Report Type */}
          <div className="space-y-2">
            <Label htmlFor="predefinedType">Report Type *</Label>
            <Select
              value={predefinedType}
              onValueChange={(value) => setPredefinedType(value as ReportType)}
            >
              <SelectTrigger id="predefinedType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PREDEFINED_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={category} onValueChange={setCategory}>
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

          {/* Default Output Format */}
          <div className="space-y-2">
            <Label htmlFor="outputFormat">Default Output Format *</Label>
            <Select
              value={outputFormat}
              onValueChange={(value) => setOutputFormat(value as ReportOutputFormat)}
            >
              <SelectTrigger id="outputFormat">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OUTPUT_FORMATS.map((format) => (
                  <SelectItem key={format.value} value={format.value}>
                    {format.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Template
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
