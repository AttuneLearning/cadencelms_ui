/**
 * PreferencesForm Component
 *
 * Manages user preferences:
 * - Timezone
 * - Language preference
 * - Communication preferences (method, channels)
 * - Notification frequency
 * - Quiet hours
 *
 * Features auto-save with 2-minute debounce and blur trigger
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Badge } from '@/shared/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Switch } from '@/shared/ui/switch';
import { Separator } from '@/shared/ui/separator';
import { CheckCircle2, AlertCircle, Loader2, Globe, Bell, Moon } from 'lucide-react';
import type {
  IPerson,
  IPersonUpdateRequest,
  PreferredContactMethod,
  NotificationFrequency,
} from '@/shared/types/person';
import { useAutoSave, useBlurSave } from '../hooks/useAutoSave';
import { personApi } from '@/shared/api/personApi';

export interface PreferencesFormProps {
  person: IPerson;
  onSaveSuccess?: (updatedPerson: IPerson) => void;
}

// Common timezones
const COMMON_TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Phoenix',
  'America/Anchorage',
  'Pacific/Honolulu',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Dubai',
  'Australia/Sydney',
  'UTC',
];

// Common languages
const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'ar', name: 'Arabic' },
];

export const PreferencesForm: React.FC<PreferencesFormProps> = ({ person, onSaveSuccess }) => {
  const [formData, setFormData] = useState<IPersonUpdateRequest>({
    timezone: person.timezone,
    languagePreference: person.languagePreference,
    locale: person.locale,
    communicationPreferences: {
      preferredMethod: person.communicationPreferences.preferredMethod,
      allowEmail: person.communicationPreferences.allowEmail,
      allowSMS: person.communicationPreferences.allowSMS,
      allowPhoneCalls: person.communicationPreferences.allowPhoneCalls,
      quietHoursStart: person.communicationPreferences.quietHoursStart,
      quietHoursEnd: person.communicationPreferences.quietHoursEnd,
      notificationFrequency: person.communicationPreferences.notificationFrequency,
    },
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  /**
   * Validate form data
   */
  const validate = useCallback((data: IPersonUpdateRequest): boolean => {
    const errors: Record<string, string> = {};

    // Validate quiet hours
    if (data.communicationPreferences?.quietHoursStart && data.communicationPreferences?.quietHoursEnd) {
      const start = data.communicationPreferences.quietHoursStart;
      const end = data.communicationPreferences.quietHoursEnd;

      // Basic time format validation (HH:MM)
      const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
      if (!timeRegex.test(start)) {
        errors.quietHoursStart = 'Invalid time format (use HH:MM)';
      }
      if (!timeRegex.test(end)) {
        errors.quietHoursEnd = 'Invalid time format (use HH:MM)';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, []);

  /**
   * Handle save
   */
  const handleSave = useCallback(
    async (data: IPersonUpdateRequest) => {
      if (!validate(data)) {
        throw new Error('Validation failed');
      }

      const response = await personApi.updateMyPerson(data);
      if (onSaveSuccess && response.data) {
        onSaveSuccess(response.data);
      }
    },
    [validate, onSaveSuccess]
  );

  /**
   * Auto-save hook
   */
  const { status, error, save } = useAutoSave({
    data: formData,
    onSave: handleSave,
    debounceMs: 120000, // 2 minutes
    enabled: true,
  });

  const handleBlur = useBlurSave(save);

  /**
   * Handle field change
   */
  const handleChange = useCallback(
    (field: keyof IPersonUpdateRequest, value: any) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value === '' ? null : value,
      }));
    },
    []
  );

  /**
   * Handle communication preference change
   */
  const handleCommPrefChange = useCallback(
    (field: string, value: any) => {
      setFormData((prev) => ({
        ...prev,
        communicationPreferences: {
          ...prev.communicationPreferences!,
          [field]: value === '' ? null : value,
        },
      }));
    },
    []
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Customize your experience and communication settings</CardDescription>
          </div>
          <SaveStatusBadge status={status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Failed to save changes: {error.message}</AlertDescription>
          </Alert>
        )}

        {/* Localization */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-medium">Localization</h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                value={formData.timezone || ''}
                onValueChange={(value) => handleChange('timezone', value)}
              >
                <SelectTrigger id="timezone">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_TIMEZONES.map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="languagePreference">Language</Label>
              <Select
                value={formData.languagePreference || ''}
                onValueChange={(value) => handleChange('languagePreference', value)}
              >
                <SelectTrigger id="languagePreference">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="locale">Locale (Optional)</Label>
            <Input
              id="locale"
              placeholder="e.g., en-US, es-ES"
              value={formData.locale || ''}
              onChange={(e) => handleChange('locale', e.target.value)}
              onBlur={handleBlur}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Locale affects date, time, and number formatting
            </p>
          </div>
        </div>

        <Separator />

        {/* Communication Preferences */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-medium">Communication Preferences</h3>
          </div>

          <div>
            <Label htmlFor="preferredMethod">Preferred Contact Method</Label>
            <Select
              value={formData.communicationPreferences?.preferredMethod || ''}
              onValueChange={(value) =>
                handleCommPrefChange('preferredMethod', value as PreferredContactMethod)
              }
            >
              <SelectTrigger id="preferredMethod">
                <SelectValue placeholder="Select preferred method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="mail">Mail</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium">Allow communication via:</p>

            <div className="flex items-center justify-between">
              <Label htmlFor="allowEmail">Email</Label>
              <Switch
                id="allowEmail"
                checked={formData.communicationPreferences?.allowEmail ?? true}
                onCheckedChange={(checked) => handleCommPrefChange('allowEmail', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="allowSMS">SMS (Text Messages)</Label>
              <Switch
                id="allowSMS"
                checked={formData.communicationPreferences?.allowSMS ?? true}
                onCheckedChange={(checked) => handleCommPrefChange('allowSMS', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="allowPhoneCalls">Phone Calls</Label>
              <Switch
                id="allowPhoneCalls"
                checked={formData.communicationPreferences?.allowPhoneCalls ?? true}
                onCheckedChange={(checked) => handleCommPrefChange('allowPhoneCalls', checked)}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Notifications */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-medium">Notifications</h3>
          </div>

          <div>
            <Label htmlFor="notificationFrequency">Notification Frequency</Label>
            <Select
              value={formData.communicationPreferences?.notificationFrequency || ''}
              onValueChange={(value) =>
                handleCommPrefChange('notificationFrequency', value as NotificationFrequency)
              }
            >
              <SelectTrigger id="notificationFrequency">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Immediate</SelectItem>
                <SelectItem value="daily-digest">Daily Digest</SelectItem>
                <SelectItem value="weekly-digest">Weekly Digest</SelectItem>
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground mt-1">
              How often you receive notification emails
            </p>
          </div>
        </div>

        <Separator />

        {/* Quiet Hours */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Moon className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-medium">Quiet Hours</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Set hours when you prefer not to receive notifications
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="quietHoursStart">Start Time (24-hour format)</Label>
              <Input
                id="quietHoursStart"
                type="time"
                placeholder="22:00"
                value={formData.communicationPreferences?.quietHoursStart || ''}
                onChange={(e) => handleCommPrefChange('quietHoursStart', e.target.value || null)}
                onBlur={handleBlur}
                className={validationErrors.quietHoursStart ? 'border-red-500' : ''}
              />
              {validationErrors.quietHoursStart && (
                <p className="text-sm text-red-500 mt-1">{validationErrors.quietHoursStart}</p>
              )}
            </div>

            <div>
              <Label htmlFor="quietHoursEnd">End Time (24-hour format)</Label>
              <Input
                id="quietHoursEnd"
                type="time"
                placeholder="08:00"
                value={formData.communicationPreferences?.quietHoursEnd || ''}
                onChange={(e) => handleCommPrefChange('quietHoursEnd', e.target.value || null)}
                onBlur={handleBlur}
                className={validationErrors.quietHoursEnd ? 'border-red-500' : ''}
              />
              {validationErrors.quietHoursEnd && (
                <p className="text-sm text-red-500 mt-1">{validationErrors.quietHoursEnd}</p>
              )}
            </div>
          </div>

          {formData.communicationPreferences?.quietHoursStart &&
            formData.communicationPreferences?.quietHoursEnd && (
              <Alert>
                <Moon className="h-4 w-4" />
                <AlertDescription>
                  You won't receive notifications between {formData.communicationPreferences.quietHoursStart} and{' '}
                  {formData.communicationPreferences.quietHoursEnd}
                </AlertDescription>
              </Alert>
            )}
        </div>
      </CardContent>
    </Card>
  );
};

// ==================== Save Status Badge ====================

interface SaveStatusBadgeProps {
  status: 'idle' | 'saving' | 'saved' | 'error';
}

const SaveStatusBadge: React.FC<SaveStatusBadgeProps> = ({ status }) => {
  if (status === 'idle') return null;

  const configs = {
    saving: {
      icon: <Loader2 className="h-3 w-3 animate-spin" />,
      text: 'Saving...',
      className: 'bg-blue-500/10 text-blue-500',
    },
    saved: {
      icon: <CheckCircle2 className="h-3 w-3" />,
      text: 'Saved',
      className: 'bg-green-500/10 text-green-500',
    },
    error: {
      icon: <AlertCircle className="h-3 w-3" />,
      text: 'Error',
      className: 'bg-red-500/10 text-red-500',
    },
  };

  const config = configs[status];

  return (
    <Badge variant="outline" className={config.className}>
      {config.icon}
      <span className="ml-1">{config.text}</span>
    </Badge>
  );
};
