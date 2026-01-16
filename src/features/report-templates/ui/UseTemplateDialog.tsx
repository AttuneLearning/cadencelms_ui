/**
 * Use Template Dialog
 * Dialog for creating a report job from a template
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { useToast } from '@/shared/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { useCreateReportJob, type CreateReportJobRequest } from '@/entities/report-job';
import type { ReportTemplate } from '@/entities/report-template';
import type { ReportOutputFormat } from '@/shared/types/report-builder';

interface UseTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: ReportTemplate | null;
}

const OUTPUT_FORMATS: Array<{ value: ReportOutputFormat; label: string }> = [
  { value: 'pdf', label: 'PDF' },
  { value: 'excel', label: 'Excel (XLSX)' },
  { value: 'csv', label: 'CSV' },
  { value: 'json', label: 'JSON' },
];

export const UseTemplateDialog: React.FC<UseTemplateDialogProps> = ({
  open,
  onOpenChange,
  template,
}) => {
  const [name, setName] = React.useState('');
  const [outputFormat, setOutputFormat] = React.useState<ReportOutputFormat>(
    template?.defaultOutputFormat || 'pdf'
  );
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');

  const { toast } = useToast();
  const createMutation = useCreateReportJob();

  React.useEffect(() => {
    if (template) {
      setName(`${template.name} - ${new Date().toLocaleDateString()}`);
      setOutputFormat(template.defaultOutputFormat || 'pdf');
    }
  }, [template]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!template || !name.trim() || !startDate || !endDate) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    const request: CreateReportJobRequest = {
      type: 'from-template',
      templateId: template._id,
      name: name.trim(),
      dateRange: {
        start: startDate,
        end: endDate,
      },
      outputFormat,
      visibility: 'private',
    };

    try {
      await createMutation.mutateAsync(request);

      toast({
        title: 'Report Job Created',
        description: 'Your report is being generated from the template.',
      });

      handleClose();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create report job',
        variant: 'destructive',
      });
    }
  };

  const handleClose = () => {
    setName('');
    setOutputFormat('pdf');
    setStartDate('');
    setEndDate('');
    onOpenChange(false);
  };

  if (!template) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Use Template: {template.name}</DialogTitle>
          <DialogDescription>
            Configure and generate a report using this template
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Report Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Report Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter report name"
              required
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Output Format */}
          <div className="space-y-2">
            <Label htmlFor="outputFormat">Output Format *</Label>
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

          {/* Template Info */}
          <div className="rounded-md bg-muted p-4 space-y-2">
            <p className="text-sm font-medium">Template Configuration</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Type:</span>{' '}
                <span className="capitalize">{template.reportType.replace(/-/g, ' ')}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Category:</span>{' '}
                <span className="capitalize">{template.category}</span>
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
              Generate Report
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
