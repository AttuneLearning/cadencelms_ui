/**
 * Notification Settings Component
 * Configure report notification preferences
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Label } from '@/shared/ui/label';
import { Switch } from '@/shared/ui/switch';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { Bell, Mail, CheckCircle } from 'lucide-react';
import { useToast } from '@/shared/ui/use-toast';
import { useReportNotifications } from '../lib/useReportNotifications';
import { cn } from '@/shared/lib/utils';

interface NotificationSettingsProps {
  className?: string;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({ className }) => {
  const { toast } = useToast();
  const { preferences, updatePreferences } = useReportNotifications();
  const [emailAddress, setEmailAddress] = React.useState(preferences.emailAddress || '');
  const [hasChanges, setHasChanges] = React.useState(false);

  const handleToggle = (key: keyof typeof preferences, value: boolean) => {
    updatePreferences({ [key]: value });
    setHasChanges(true);
  };

  const handleSaveEmail = () => {
    if (emailAddress && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress)) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address.',
        variant: 'destructive',
      });
      return;
    }

    updatePreferences({ emailAddress });
    setHasChanges(false);

    toast({
      title: 'Settings Saved',
      description: 'Your notification preferences have been updated.',
    });
  };

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          <CardTitle>Notification Settings</CardTitle>
        </div>
        <CardDescription>
          Configure how you want to be notified about report generation
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* In-App Notifications */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              In-App Notifications
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Show toast notifications in the application
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="inApp">Enable in-app notifications</Label>
              <p className="text-xs text-muted-foreground">
                Get instant notifications when reports are ready
              </p>
            </div>
            <Switch
              id="inApp"
              checked={preferences.inAppNotifications}
              onCheckedChange={(checked) => handleToggle('inAppNotifications', checked)}
            />
          </div>
        </div>

        {/* Email Notifications */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Notifications
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Receive email alerts for report events
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="flex gap-2">
              <Input
                id="email"
                type="email"
                value={emailAddress}
                onChange={(e) => {
                  setEmailAddress(e.target.value);
                  setHasChanges(true);
                }}
                placeholder="your.email@example.com"
              />
              <Button
                onClick={handleSaveEmail}
                disabled={!hasChanges}
                variant={hasChanges ? 'default' : 'outline'}
              >
                Save
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="emailComplete">Email when report completes</Label>
              <p className="text-xs text-muted-foreground">
                Get an email when your report is ready to download
              </p>
            </div>
            <Switch
              id="emailComplete"
              checked={preferences.emailOnComplete}
              onCheckedChange={(checked) => handleToggle('emailOnComplete', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="emailFailed">Email when report fails</Label>
              <p className="text-xs text-muted-foreground">
                Get notified if report generation fails
              </p>
            </div>
            <Switch
              id="emailFailed"
              checked={preferences.emailOnFailure}
              onCheckedChange={(checked) => handleToggle('emailOnFailure', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="emailScheduled">Email for scheduled reports</Label>
              <p className="text-xs text-muted-foreground">
                Get notified when scheduled reports complete
              </p>
            </div>
            <Switch
              id="emailScheduled"
              checked={preferences.notifyForScheduled}
              onCheckedChange={(checked) => handleToggle('notifyForScheduled', checked)}
            />
          </div>
        </div>

        {/* Info Box */}
        <div className="rounded-lg border border-border bg-muted/50 p-3">
          <p className="text-xs text-muted-foreground">
            <strong>Note:</strong> Email notifications require a verified email address.
            In-app notifications work immediately and are recommended for real-time updates.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
