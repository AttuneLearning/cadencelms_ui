/**
 * Notification Settings Page
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import { Label } from '@/shared/ui/label';
import { Switch } from '@/shared/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { useToast } from '@/shared/ui/use-toast';
import { Loader2, Save, ArrowLeft } from 'lucide-react';
import { useSettingsByCategory, useUpdateSettings, type NotificationSettings } from '@/entities/settings';

export const NotificationSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: settings, isLoading, error } = useSettingsByCategory('notification');
  const updateMutation = useUpdateSettings('notification');

  const [formData, setFormData] = useState<NotificationSettings>({
    emailNotificationsEnabled: true,
    inAppNotificationsEnabled: true,
    enrollmentNotifications: true,
    completionNotifications: true,
    gradingNotifications: true,
    deadlineNotifications: true,
    digestFrequency: 'immediate',
  });

  useEffect(() => {
    if (settings) setFormData(settings);
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateMutation.mutateAsync(formData);
      toast({ title: 'Settings saved', description: 'Notification settings updated successfully' });
    } catch {
      toast({ title: 'Error', description: 'Failed to save settings', variant: 'destructive' });
    }
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
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin/settings')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Notification Settings</h1>
        </div>
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
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/admin/settings')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Notification Settings</h1>
          <p className="text-muted-foreground">Configure notification preferences</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Global Notification Settings</CardTitle>
            <CardDescription>Enable or disable notification channels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="emailNotifications">Email Notifications</Label>
              <Switch id="emailNotifications" checked={formData.emailNotificationsEnabled} onCheckedChange={(c) => setFormData({ ...formData, emailNotificationsEnabled: c })} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="inAppNotifications">In-App Notifications</Label>
              <Switch id="inAppNotifications" checked={formData.inAppNotificationsEnabled} onCheckedChange={(c) => setFormData({ ...formData, inAppNotificationsEnabled: c })} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notification Types</CardTitle>
            <CardDescription>Choose which events trigger notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="enrollmentNotifications">Enrollment Notifications</Label>
              <Switch id="enrollmentNotifications" checked={formData.enrollmentNotifications} onCheckedChange={(c) => setFormData({ ...formData, enrollmentNotifications: c })} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="completionNotifications">Completion Notifications</Label>
              <Switch id="completionNotifications" checked={formData.completionNotifications} onCheckedChange={(c) => setFormData({ ...formData, completionNotifications: c })} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="gradingNotifications">Grading Notifications</Label>
              <Switch id="gradingNotifications" checked={formData.gradingNotifications} onCheckedChange={(c) => setFormData({ ...formData, gradingNotifications: c })} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="deadlineNotifications">Deadline Notifications</Label>
              <Switch id="deadlineNotifications" checked={formData.deadlineNotifications} onCheckedChange={(c) => setFormData({ ...formData, deadlineNotifications: c })} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Digest Frequency</CardTitle>
            <CardDescription>How often to send notification digests</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={formData.digestFrequency} onValueChange={(v: any) => setFormData({ ...formData, digestFrequency: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Immediate</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : <><Save className="h-4 w-4 mr-2" />Save Settings</>}
          </Button>
        </div>
      </form>
    </div>
  );
};
