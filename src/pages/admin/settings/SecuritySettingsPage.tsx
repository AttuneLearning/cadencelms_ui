/**
 * Security Settings Page
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Switch } from '@/shared/ui/switch';
import { Textarea } from '@/shared/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { useToast } from '@/shared/ui/use-toast';
import { Loader2, Save, ArrowLeft } from 'lucide-react';
import { useSettingsByCategory, useUpdateSettings, type SecuritySettings } from '@/entities/settings';

export const SecuritySettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: settings, isLoading, error } = useSettingsByCategory('security');
  const updateMutation = useUpdateSettings('security');

  const [formData, setFormData] = useState<SecuritySettings>({
    passwordMinLength: 8,
    passwordRequireUppercase: true,
    passwordRequireLowercase: true,
    passwordRequireNumbers: true,
    passwordRequireSpecialChars: true,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    twoFactorEnabled: false,
    ipWhitelist: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [ipWhitelistText, setIpWhitelistText] = useState('');

  useEffect(() => {
    if (settings) {
      setFormData(settings);
      setIpWhitelistText(settings.ipWhitelist.join('\n'));
    }
  }, [settings]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (formData.passwordMinLength < 6) {
      newErrors.passwordMinLength = 'Password length must be at least 6';
    }
    if (formData.sessionTimeout <= 0) {
      newErrors.sessionTimeout = 'Session timeout must be greater than 0';
    }
    if (formData.maxLoginAttempts <= 0) {
      newErrors.maxLoginAttempts = 'Max login attempts must be greater than 0';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast({ title: 'Validation Error', description: 'Please fix the errors', variant: 'destructive' });
      return;
    }
    try {
      const ipList = ipWhitelistText.split('\n').map((ip) => ip.trim()).filter(Boolean);
      await updateMutation.mutateAsync({ ...formData, ipWhitelist: ipList });
      toast({ title: 'Settings saved', description: 'Security settings updated successfully' });
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
            <ArrowLeft className="h-4 w-4 mr-2" />Back
          </Button>
          <h1 className="text-3xl font-bold">Security Settings</h1>
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
          <ArrowLeft className="h-4 w-4 mr-2" />Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Security Settings</h1>
          <p className="text-muted-foreground">Configure security and authentication settings</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Password Policy</CardTitle>
            <CardDescription>Set requirements for user passwords</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="passwordMinLength">Minimum Password Length *</Label>
              <Input id="passwordMinLength" type="number" min={6} value={formData.passwordMinLength} onChange={(e) => setFormData({ ...formData, passwordMinLength: parseInt(e.target.value, 10) })} />
              {errors.passwordMinLength && <p className="text-sm text-destructive">{errors.passwordMinLength}</p>}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="requireUppercase">Require Uppercase Letters</Label>
                <Switch id="requireUppercase" checked={formData.passwordRequireUppercase} onCheckedChange={(c) => setFormData({ ...formData, passwordRequireUppercase: c })} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="requireLowercase">Require Lowercase Letters</Label>
                <Switch id="requireLowercase" checked={formData.passwordRequireLowercase} onCheckedChange={(c) => setFormData({ ...formData, passwordRequireLowercase: c })} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="requireNumbers">Require Numbers</Label>
                <Switch id="requireNumbers" checked={formData.passwordRequireNumbers} onCheckedChange={(c) => setFormData({ ...formData, passwordRequireNumbers: c })} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="requireSpecialChars">Require Special Characters</Label>
                <Switch id="requireSpecialChars" checked={formData.passwordRequireSpecialChars} onCheckedChange={(c) => setFormData({ ...formData, passwordRequireSpecialChars: c })} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Session Settings</CardTitle>
            <CardDescription>Configure session and login security</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">Session Timeout (minutes) *</Label>
              <Input id="sessionTimeout" type="number" min={1} value={formData.sessionTimeout} onChange={(e) => setFormData({ ...formData, sessionTimeout: parseInt(e.target.value, 10) })} />
              {errors.sessionTimeout && <p className="text-sm text-destructive">{errors.sessionTimeout}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxLoginAttempts">Max Login Attempts *</Label>
              <Input id="maxLoginAttempts" type="number" min={1} value={formData.maxLoginAttempts} onChange={(e) => setFormData({ ...formData, maxLoginAttempts: parseInt(e.target.value, 10) })} />
              {errors.maxLoginAttempts && <p className="text-sm text-destructive">{errors.maxLoginAttempts}</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Two-Factor Authentication</CardTitle>
            <CardDescription>Enable additional authentication layer</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Label htmlFor="twoFactor">Enable Two-Factor Authentication</Label>
              <Switch id="twoFactor" checked={formData.twoFactorEnabled} onCheckedChange={(c) => setFormData({ ...formData, twoFactorEnabled: c })} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>IP Whitelist</CardTitle>
            <CardDescription>Restrict access to specific IP addresses (one per line)</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea id="ipWhitelist" value={ipWhitelistText} onChange={(e) => setIpWhitelistText(e.target.value)} placeholder="192.168.1.0/24&#10;10.0.0.0/8" rows={5} />
            <Label htmlFor="ipWhitelist" className="sr-only">IP Whitelist</Label>
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
