/**
 * User Notification Settings Page
 * Phase 5: Uses Person v2.0 communication preferences
 *
 * Allows users to configure their notification and communication preferences
 * based on the person.communicationPreferences structure
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import { Label } from '@/shared/ui/label';
import { Switch } from '@/shared/ui/switch';
import { Input } from '@/shared/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import { useToast } from '@/shared/ui/use-toast';
import { Loader2, Save, ArrowLeft, Bell, Clock, Mail, Phone, MessageSquare } from 'lucide-react';
import { PageHeader } from '@/shared/ui/page-header';
import { usePersonData } from '@/features/auth/hooks/usePersonData';
import type { ICommunicationPreferences, NotificationFrequency, PreferredContactMethod } from '@/shared/types/person';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Separator } from '@/shared/ui/separator';

export const NotificationSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const person = usePersonData();

  const [isLoading, _setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state based on person communication preferences
  const [formData, setFormData] = useState<ICommunicationPreferences>({
    preferredMethod: 'email',
    allowEmail: true,
    allowSMS: false,
    allowPhoneCalls: false,
    quietHoursStart: null,
    quietHoursEnd: null,
    notificationFrequency: 'immediate',
  });

  // Initialize form from person data
  useEffect(() => {
    if (person?.communicationPreferences) {
      setFormData(person.communicationPreferences);
    }
  }, [person]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // TODO: Implement API call to update communication preferences
      // await updatePersonCommunicationPreferences(formData);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: 'Settings saved',
        description: 'Your notification preferences have been updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save notification settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreferredMethodChange = (value: PreferredContactMethod) => {
    setFormData({ ...formData, preferredMethod: value });
  };

  const handleFrequencyChange = (value: NotificationFrequency) => {
    setFormData({ ...formData, notificationFrequency: value });
  };

  if (!person) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Alert>
          <AlertDescription>
            Please log in to access notification settings.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8 max-w-4xl">
      <PageHeader
        title="Notification Settings"
        description="Manage how and when you receive notifications"
        backButton={
          <Button variant="ghost" size="sm" onClick={() => navigate('/profile')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Preferred Contact Method */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Preferred Contact Method
            </CardTitle>
            <CardDescription>
              Choose your preferred way to be contacted
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="preferredMethod">Preferred Method</Label>
                <Select
                  value={formData.preferredMethod || 'email'}
                  onValueChange={handlePreferredMethodChange as (value: string) => void}
                >
                  <SelectTrigger id="preferredMethod">
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Phone Call</SelectItem>
                    <SelectItem value="sms">SMS/Text Message</SelectItem>
                    <SelectItem value="mail">Physical Mail</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Communication Channels */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Communication Channels
            </CardTitle>
            <CardDescription>
              Enable or disable different communication methods
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="allowEmail" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via email
                </p>
              </div>
              <Switch
                id="allowEmail"
                checked={formData.allowEmail}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, allowEmail: checked })
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="allowSMS" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  SMS Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via text message
                </p>
              </div>
              <Switch
                id="allowSMS"
                checked={formData.allowSMS}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, allowSMS: checked })
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="allowPhoneCalls" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Calls
                </Label>
                <p className="text-sm text-muted-foreground">
                  Allow phone calls for important notifications
                </p>
              </div>
              <Switch
                id="allowPhoneCalls"
                checked={formData.allowPhoneCalls}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, allowPhoneCalls: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Frequency */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Notification Frequency
            </CardTitle>
            <CardDescription>
              Control how often you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="notificationFrequency">Frequency</Label>
                <Select
                  value={formData.notificationFrequency}
                  onValueChange={handleFrequencyChange}
                >
                  <SelectTrigger id="notificationFrequency">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="daily-digest">Daily Digest</SelectItem>
                    <SelectItem value="weekly-digest">Weekly Digest</SelectItem>
                    <SelectItem value="none">None (Disable All)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-2">
                  {formData.notificationFrequency === 'immediate' &&
                    'Receive notifications as they occur'}
                  {formData.notificationFrequency === 'daily-digest' &&
                    'Receive a daily summary of notifications'}
                  {formData.notificationFrequency === 'weekly-digest' &&
                    'Receive a weekly summary of notifications'}
                  {formData.notificationFrequency === 'none' &&
                    'You will not receive any notifications'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quiet Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Quiet Hours
            </CardTitle>
            <CardDescription>
              Set times when you don't want to be disturbed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="quietHoursStart">Start Time</Label>
                <Input
                  id="quietHoursStart"
                  type="time"
                  value={formData.quietHoursStart || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, quietHoursStart: e.target.value || null })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quietHoursEnd">End Time</Label>
                <Input
                  id="quietHoursEnd"
                  type="time"
                  value={formData.quietHoursEnd || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, quietHoursEnd: e.target.value || null })
                  }
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              During quiet hours, non-urgent notifications will be held until the end of the period
            </p>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/profile')}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
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
    </div>
  );
};
