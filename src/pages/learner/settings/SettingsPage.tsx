import { useState, useEffect } from 'react';
import { PageHeader } from '@/shared/ui/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Switch } from '@/shared/ui/switch';
import { Label } from '@/shared/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { Button } from '@/shared/ui/button';
import { useThemeStore } from '@/features/theme';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { Bell, Monitor, Shield, User, ExternalLink } from 'lucide-react';

interface NotificationPreferences {
  emailNotifications: boolean;
  courseUpdates: boolean;
  gradeFeedback: boolean;
  deadlineReminders: boolean;
}

interface PrivacyPreferences {
  showProfile: boolean;
  showProgressToInstructors: boolean;
}

const STORAGE_KEY_NOTIFICATIONS = 'cadence-notification-prefs';
const STORAGE_KEY_PRIVACY = 'cadence-privacy-prefs';

function loadPreferences<T>(key: string, defaults: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return { ...defaults, ...JSON.parse(stored) };
    }
  } catch {
    // ignore parse errors
  }
  return defaults;
}

function savePreferences<T>(key: string, prefs: T): void {
  localStorage.setItem(key, JSON.stringify(prefs));
}

const DEFAULT_NOTIFICATIONS: NotificationPreferences = {
  emailNotifications: true,
  courseUpdates: true,
  gradeFeedback: true,
  deadlineReminders: true,
};

const DEFAULT_PRIVACY: PrivacyPreferences = {
  showProfile: true,
  showProgressToInstructors: true,
};

export const LearnerSettingsPage = () => {
  const { theme, setTheme } = useThemeStore();
  const { displayName, primaryEmail } = useCurrentUser();

  const [notifications, setNotifications] = useState<NotificationPreferences>(() =>
    loadPreferences(STORAGE_KEY_NOTIFICATIONS, DEFAULT_NOTIFICATIONS)
  );

  const [privacy, setPrivacy] = useState<PrivacyPreferences>(() =>
    loadPreferences(STORAGE_KEY_PRIVACY, DEFAULT_PRIVACY)
  );

  useEffect(() => {
    savePreferences(STORAGE_KEY_NOTIFICATIONS, notifications);
  }, [notifications]);

  useEffect(() => {
    savePreferences(STORAGE_KEY_PRIVACY, privacy);
  }, [privacy]);

  const updateNotification = (key: keyof NotificationPreferences, value: boolean) => {
    setNotifications((prev) => ({ ...prev, [key]: value }));
  };

  const updatePrivacy = (key: keyof PrivacyPreferences, value: boolean) => {
    setPrivacy((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6 p-8">
      <PageHeader
        title="Settings"
        description="Manage your notification, display, and privacy preferences."
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Notifications</CardTitle>
            </div>
            <CardDescription>
              Choose what notifications you receive.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifications" className="flex-1">
                Email notifications
                <p className="text-sm font-normal text-muted-foreground">
                  Receive notifications via email
                </p>
              </Label>
              <Switch
                id="email-notifications"
                checked={notifications.emailNotifications}
                onCheckedChange={(checked) => updateNotification('emailNotifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="course-updates" className="flex-1">
                Course updates
                <p className="text-sm font-normal text-muted-foreground">
                  Get notified when course content changes
                </p>
              </Label>
              <Switch
                id="course-updates"
                checked={notifications.courseUpdates}
                onCheckedChange={(checked) => updateNotification('courseUpdates', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="grade-feedback" className="flex-1">
                Grade and feedback alerts
                <p className="text-sm font-normal text-muted-foreground">
                  Get notified when grades or feedback are posted
                </p>
              </Label>
              <Switch
                id="grade-feedback"
                checked={notifications.gradeFeedback}
                onCheckedChange={(checked) => updateNotification('gradeFeedback', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="deadline-reminders" className="flex-1">
                Deadline reminders
                <p className="text-sm font-normal text-muted-foreground">
                  Receive reminders before assignment deadlines
                </p>
              </Label>
              <Switch
                id="deadline-reminders"
                checked={notifications.deadlineReminders}
                onCheckedChange={(checked) => updateNotification('deadlineReminders', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Display */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Monitor className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Display</CardTitle>
            </div>
            <CardDescription>
              Customize the appearance of the application.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="theme-select" className="flex-1">
                Theme
                <p className="text-sm font-normal text-muted-foreground">
                  Select your preferred color scheme
                </p>
              </Label>
              <Select value={theme} onValueChange={(value) => setTheme(value as 'light' | 'dark' | 'system')}>
                <SelectTrigger id="theme-select" className="w-[140px]">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Privacy */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Privacy</CardTitle>
            </div>
            <CardDescription>
              Control who can see your information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="show-profile" className="flex-1">
                Show my profile to other learners
                <p className="text-sm font-normal text-muted-foreground">
                  Allow other learners to view your profile
                </p>
              </Label>
              <Switch
                id="show-profile"
                checked={privacy.showProfile}
                onCheckedChange={(checked) => updatePrivacy('showProfile', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="show-progress" className="flex-1">
                Show progress to instructors
                <p className="text-sm font-normal text-muted-foreground">
                  Allow instructors to see your learning activity
                </p>
              </Label>
              <Switch
                id="show-progress"
                checked={privacy.showProgressToInstructors}
                onCheckedChange={(checked) => updatePrivacy('showProgressToInstructors', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Account */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Account</CardTitle>
            </div>
            <CardDescription>
              Your account information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-muted-foreground">Name</Label>
              <p className="text-sm font-medium">{displayName || 'Not set'}</p>
            </div>

            <div>
              <Label className="text-muted-foreground">Email</Label>
              <p className="text-sm font-medium">{primaryEmail || 'Not set'}</p>
            </div>

            <Button variant="outline" size="sm" asChild>
              <a href="/learner/profile">
                <ExternalLink className="mr-2 h-4 w-4" />
                Edit Profile
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
