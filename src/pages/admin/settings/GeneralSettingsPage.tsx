/**
 * General Settings Page
 * System name, language, timezone, and file upload settings
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { useToast } from '@/shared/ui/use-toast';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { Switch } from '@/shared/ui/switch';
import { Loader2, Save, RotateCcw, ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/shared/ui/page-header';
import { useErrorDetailsPreference } from '@/shared/hooks/useErrorDetailsPreference';
import {
  useSettingsByCategory,
  useUpdateSettings,
  useResetSettings,
  type GeneralSettings,
} from '@/entities/settings';

const languages = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'zh', label: 'Chinese' },
];

const timezones = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'Eastern Time (US & Canada)' },
  { value: 'America/Chicago', label: 'Central Time (US & Canada)' },
  { value: 'America/Denver', label: 'Mountain Time (US & Canada)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)' },
  { value: 'Europe/London', label: 'London' },
  { value: 'Europe/Paris', label: 'Paris' },
  { value: 'Asia/Tokyo', label: 'Tokyo' },
];

const dateFormats = [
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2024-01-15)' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (01/15/2024)' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (15/01/2024)' },
  { value: 'DD.MM.YYYY', label: 'DD.MM.YYYY (15.01.2024)' },
];

const fileTypes = [
  { value: 'pdf', label: 'PDF' },
  { value: 'doc', label: 'DOC' },
  { value: 'docx', label: 'DOCX' },
  { value: 'xls', label: 'XLS' },
  { value: 'xlsx', label: 'XLSX' },
  { value: 'ppt', label: 'PPT' },
  { value: 'pptx', label: 'PPTX' },
  { value: 'jpg', label: 'JPG' },
  { value: 'jpeg', label: 'JPEG' },
  { value: 'png', label: 'PNG' },
  { value: 'gif', label: 'GIF' },
  { value: 'svg', label: 'SVG' },
  { value: 'mp4', label: 'MP4' },
  { value: 'mp3', label: 'MP3' },
  { value: 'zip', label: 'ZIP' },
];

export const GeneralSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: settings, isLoading, error } = useSettingsByCategory('general');
  const updateMutation = useUpdateSettings('general');
  const resetMutation = useResetSettings('general');

  const [formData, setFormData] = useState<GeneralSettings>({
    systemName: '',
    defaultLanguage: 'en',
    timezone: 'UTC',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: '24h',
    maxFileSize: 10,
    allowedFileTypes: ['pdf', 'doc', 'docx'],
  });

  const [selectedFileTypes, setSelectedFileTypes] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [showErrorDetails, setShowErrorDetails] = useErrorDetailsPreference();

  useEffect(() => {
    if (settings) {
      setFormData(settings);
      setSelectedFileTypes(new Set(settings.allowedFileTypes));
    }
  }, [settings]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.systemName.trim()) {
      newErrors.systemName = 'System name is required';
    }

    if (formData.maxFileSize <= 0) {
      newErrors.maxFileSize = 'Max file size must be greater than 0';
    }

    if (selectedFileTypes.size === 0) {
      newErrors.allowedFileTypes = 'At least one file type must be selected';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors in the form',
        variant: 'destructive',
      });
      return;
    }

    try {
      await updateMutation.mutateAsync({
        ...formData,
        allowedFileTypes: Array.from(selectedFileTypes),
      });

      toast({
        title: 'Settings saved',
        description: 'General settings have been updated successfully',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleReset = async () => {
    try {
      const defaultSettings = await resetMutation.mutateAsync();
      setFormData(defaultSettings);
      setSelectedFileTypes(new Set(defaultSettings.allowedFileTypes));
      setIsResetDialogOpen(false);

      toast({
        title: 'Settings reset',
        description: 'General settings have been reset to defaults',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to reset settings. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const toggleFileType = (type: string) => {
    const newSelected = new Set(selectedFileTypes);
    if (newSelected.has(type)) {
      newSelected.delete(type);
    } else {
      newSelected.add(type);
    }
    setSelectedFileTypes(newSelected);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading settings...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8 p-8">
        <PageHeader
          title="General Settings"
          backButton={
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/settings')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          }
        />
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-destructive">
              <h3 className="font-semibold mb-2">Error loading settings</h3>
              <p className="text-sm">{error.message}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8">
      <PageHeader
        title="General Settings"
        description="Configure system-wide general settings"
        backButton={
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin/settings')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              System identification and display settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="systemName">
                System Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="systemName"
                value={formData.systemName}
                onChange={(e) =>
                  setFormData({ ...formData, systemName: e.target.value })
                }
                placeholder="Learning Management System"
                disabled={updateMutation.isPending}
              />
              {errors.systemName && (
                <p className="text-sm text-destructive">{errors.systemName}</p>
              )}
              <p className="text-xs text-muted-foreground">
                The name of your system shown in the header and emails
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Localization */}
        <Card>
          <CardHeader>
            <CardTitle>Localization</CardTitle>
            <CardDescription>
              Language, timezone, and date/time formatting
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="defaultLanguage">Default Language</Label>
                <Select
                  value={formData.defaultLanguage}
                  onValueChange={(value) =>
                    setFormData({ ...formData, defaultLanguage: value })
                  }
                  disabled={updateMutation.isPending}
                >
                  <SelectTrigger id="defaultLanguage">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  value={formData.timezone}
                  onValueChange={(value) =>
                    setFormData({ ...formData, timezone: value })
                  }
                  disabled={updateMutation.isPending}
                >
                  <SelectTrigger id="timezone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timezones.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateFormat">Date Format</Label>
                <Select
                  value={formData.dateFormat}
                  onValueChange={(value) =>
                    setFormData({ ...formData, dateFormat: value })
                  }
                  disabled={updateMutation.isPending}
                >
                  <SelectTrigger id="dateFormat">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {dateFormats.map((format) => (
                      <SelectItem key={format.value} value={format.value}>
                        {format.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeFormat">Time Format</Label>
                <Select
                  value={formData.timeFormat}
                  onValueChange={(value: '12h' | '24h') =>
                    setFormData({ ...formData, timeFormat: value })
                  }
                  disabled={updateMutation.isPending}
                >
                  <SelectTrigger id="timeFormat">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12h">12-hour (3:00 PM)</SelectItem>
                    <SelectItem value="24h">24-hour (15:00)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* File Upload Settings */}
        <Card>
          <CardHeader>
            <CardTitle>File Upload Settings</CardTitle>
            <CardDescription>
              Configure file size limits and allowed file types
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="maxFileSize">
                Maximum File Size (MB) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="maxFileSize"
                type="number"
                min={1}
                value={formData.maxFileSize}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxFileSize: parseInt(e.target.value, 10),
                  })
                }
                disabled={updateMutation.isPending}
              />
              {errors.maxFileSize && (
                <p className="text-sm text-destructive">{errors.maxFileSize}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Maximum file size in megabytes for uploads
              </p>
            </div>

            <div className="space-y-2">
              <Label>
                Allowed File Types <span className="text-destructive">*</span>
              </Label>
              <div className="flex flex-wrap gap-2">
                {fileTypes.map((type) => (
                  <Badge
                    key={type.value}
                    variant={
                      selectedFileTypes.has(type.value) ? 'default' : 'outline'
                    }
                    className="cursor-pointer"
                    onClick={() => toggleFileType(type.value)}
                  >
                    {type.label}
                  </Badge>
                ))}
              </div>
              {errors.allowedFileTypes && (
                <p className="text-sm text-destructive">{errors.allowedFileTypes}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Select file types that users can upload
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Diagnostics */}
        <Card>
          <CardHeader>
            <CardTitle>Diagnostics</CardTitle>
            <CardDescription>
              Control visibility of technical error details for troubleshooting
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <Label htmlFor="error-details-toggle">Show error details</Label>
                <p className="text-xs text-muted-foreground">
                  Exposes endpoint, status code, request ID, and stack trace in error panels.
                </p>
              </div>
              <Switch
                id="error-details-toggle"
                checked={showErrorDetails}
                onCheckedChange={setShowErrorDetails}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsResetDialogOpen(true)}
            disabled={updateMutation.isPending || resetMutation.isPending}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button
            type="submit"
            disabled={updateMutation.isPending || resetMutation.isPending}
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        open={isResetDialogOpen}
        onOpenChange={setIsResetDialogOpen}
        onConfirm={handleReset}
        title="Reset to Defaults"
        description="Are you sure you want to reset all general settings to their default values? This action cannot be undone."
        confirmText="Reset"
        isDestructive
        isLoading={resetMutation.isPending}
      />
    </div>
  );
};
