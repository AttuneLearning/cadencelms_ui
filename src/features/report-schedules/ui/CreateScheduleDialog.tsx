/**
 * Create Schedule Dialog
 * Dialog for creating a new report schedule (simplified version)
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
import { useCreateReportSchedule, type CreateReportScheduleRequest } from '@/entities/report-schedule';
import type { ReportType, ReportOutputFormat } from '@/shared/types/report-builder';
import type { ScheduleFrequency } from '@/entities/report-schedule';

interface CreateScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FREQUENCIES: Array<{ value: ScheduleFrequency; label: string }> = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
];

const REPORT_TYPES: Array<{ value: ReportType; label: string }> = [
  { value: 'enrollment-summary', label: 'Enrollment Summary' },
  { value: 'completion-rates', label: 'Completion Rates' },
  { value: 'performance-analysis', label: 'Performance Analysis' },
  { value: 'learner-activity', label: 'Learner Activity' },
];

const OUTPUT_FORMATS: Array<{ value: ReportOutputFormat; label: string }> = [
  { value: 'pdf', label: 'PDF' },
  { value: 'excel', label: 'Excel' },
  { value: 'csv', label: 'CSV' },
];

export const CreateScheduleDialog: React.FC<CreateScheduleDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [reportType, setReportType] = React.useState<ReportType>('enrollment-summary');
  const [frequency, setFrequency] = React.useState<ScheduleFrequency>('weekly');
  const [time, setTime] = React.useState('09:00');
  const [dayOfWeek, setDayOfWeek] = React.useState(1);
  const [outputFormat, setOutputFormat] = React.useState<ReportOutputFormat>('excel');
  const [recipients, setRecipients] = React.useState('');

  const { toast } = useToast();
  const createMutation = useCreateReportSchedule();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Schedule name is required',
        variant: 'destructive',
      });
      return;
    }

    if (!recipients.trim()) {
      toast({
        title: 'Validation Error',
        description: 'At least one email recipient is required',
        variant: 'destructive',
      });
      return;
    }

    const recipientEmails = recipients.split(',').map((email) => email.trim()).filter(Boolean);

    const request: CreateReportScheduleRequest = {
      name: name.trim(),
      description: description.trim() || undefined,
      reportType,
      definition: {
        dimensions: [{ type: 'learner' }],
        measures: [{ type: 'count' }],
        slicers: [],
        groups: [],
      },
      schedule: {
        frequency,
        timezone: 'America/New_York',
        time,
        ...(frequency === 'weekly' || frequency === 'biweekly' ? { dayOfWeek } : {}),
      },
      outputFormat,
      delivery: {
        email: {
          recipients: recipientEmails,
          attachReport: true,
        },
      },
      visibility: 'private',
    };

    try {
      await createMutation.mutateAsync(request);

      toast({
        title: 'Schedule Created',
        description: 'Your report schedule has been created successfully.',
      });

      handleClose();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create schedule',
        variant: 'destructive',
      });
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setReportType('enrollment-summary');
    setFrequency('weekly');
    setTime('09:00');
    setDayOfWeek(1);
    setOutputFormat('excel');
    setRecipients('');
    onOpenChange(false);
  };

  const showDayOfWeek = frequency === 'weekly' || frequency === 'biweekly';

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Report Schedule</DialogTitle>
          <DialogDescription>
            Schedule automatic report generation and delivery
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Schedule Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Schedule Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Weekly Enrollment Report"
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
              placeholder="Describe this scheduled report..."
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
                {REPORT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Frequency */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency *</Label>
              <Select value={frequency} onValueChange={(value) => setFrequency(value as ScheduleFrequency)}>
                <SelectTrigger id="frequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FREQUENCIES.map((freq) => (
                    <SelectItem key={freq.value} value={freq.value}>
                      {freq.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time *</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Day of Week (for weekly/biweekly) */}
          {showDayOfWeek && (
            <div className="space-y-2">
              <Label htmlFor="dayOfWeek">Day of Week *</Label>
              <Select value={String(dayOfWeek)} onValueChange={(value) => setDayOfWeek(Number(value))}>
                <SelectTrigger id="dayOfWeek">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Sunday</SelectItem>
                  <SelectItem value="1">Monday</SelectItem>
                  <SelectItem value="2">Tuesday</SelectItem>
                  <SelectItem value="3">Wednesday</SelectItem>
                  <SelectItem value="4">Thursday</SelectItem>
                  <SelectItem value="5">Friday</SelectItem>
                  <SelectItem value="6">Saturday</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

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

          {/* Email Recipients */}
          <div className="space-y-2">
            <Label htmlFor="recipients">Email Recipients *</Label>
            <Input
              id="recipients"
              value={recipients}
              onChange={(e) => setRecipients(e.target.value)}
              placeholder="email1@example.com, email2@example.com"
              required
            />
            <p className="text-xs text-muted-foreground">
              Separate multiple emails with commas
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Schedule
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
