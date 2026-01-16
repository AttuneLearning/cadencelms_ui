/**
 * Create Report Job Dialog
 * Dialog for creating a new report generation job
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
import { Textarea } from '@/shared/ui/textarea';
import { useToast } from '@/shared/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { useCreateReportJob, type CreateReportJobRequest } from '@/entities/report-job';
import type { ReportType, ReportOutputFormat } from '@/shared/types/report-builder';
import { EmailNotificationForm } from '@/features/report-notifications';

interface CreateReportJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PREDEFINED_REPORT_TYPES: Array<{ value: ReportType; label: string }> = [
  { value: 'enrollment-summary', label: 'Enrollment Summary' },
  { value: 'completion-rates', label: 'Completion Rates' },
  { value: 'performance-analysis', label: 'Performance Analysis' },
  { value: 'learner-activity', label: 'Learner Activity' },
  { value: 'course-analytics', label: 'Course Analytics' },
  { value: 'instructor-workload', label: 'Instructor Workload' },
  { value: 'department-overview', label: 'Department Overview' },
];

const OUTPUT_FORMATS: Array<{ value: ReportOutputFormat; label: string }> = [
  { value: 'pdf', label: 'PDF' },
  { value: 'excel', label: 'Excel (XLSX)' },
  { value: 'csv', label: 'CSV' },
  { value: 'json', label: 'JSON' },
];

export const CreateReportJobDialog: React.FC<CreateReportJobDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [reportType, setReportType] = React.useState<ReportType>('enrollment-summary');
  const [outputFormat, setOutputFormat] = React.useState<ReportOutputFormat>('pdf');
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');
  const [notificationEmail, setNotificationEmail] = React.useState('');
  const [notifyMe, setNotifyMe] = React.useState(false);

  const { toast } = useToast();
  const createMutation = useCreateReportJob();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Report name is required',
        variant: 'destructive',
      });
      return;
    }

    if (!startDate || !endDate) {
      toast({
        title: 'Validation Error',
        description: 'Start date and end date are required',
        variant: 'destructive',
      });
      return;
    }

    const request: CreateReportJobRequest = {
      type: 'predefined',
      predefinedType: reportType,
      name: name.trim(),
      description: description.trim() || undefined,
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
        description: 'Your report is being generated. You will be notified when it is ready.',
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
    setDescription('');
    setReportType('enrollment-summary');
    setOutputFormat('pdf');
    setStartDate('');
    setEndDate('');
    setNotificationEmail('');
    setNotifyMe(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Report</DialogTitle>
          <DialogDescription>
            Generate a new report from predefined templates
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
              placeholder="e.g., Q1 2026 Enrollment Report"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description for this report..."
              rows={2}
            />
          </div>

          {/* Report Type */}
          <div className="space-y-2">
            <Label htmlFor="reportType">Report Type *</Label>
            <Select value={reportType} onValueChange={(value) => setReportType(value as ReportType)}>
              <SelectTrigger id="reportType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PREDEFINED_REPORT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

          {/* Email Notifications */}
          <div className="pt-4 border-t">
            <EmailNotificationForm
              defaultEmail={notificationEmail}
              onEmailChange={setNotificationEmail}
              onNotifyChange={setNotifyMe}
            />
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
