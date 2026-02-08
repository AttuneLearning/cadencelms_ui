/**
 * Email Settings Page
 * SMTP configuration and sender information
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Switch } from '@/shared/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { useToast } from '@/shared/ui/use-toast';
import { Loader2, Save, ArrowLeft, Mail, CheckCircle, XCircle, Send } from 'lucide-react';
import { PageHeader } from '@/shared/ui/page-header';
import {
  useSettingsByCategory,
  useUpdateSettings,
  useTestEmailConnection,
  type EmailSettings,
} from '@/entities/settings';

export const EmailSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: settings, isLoading, error } = useSettingsByCategory('email');
  const updateMutation = useUpdateSettings('email');
  const testMutation = useTestEmailConnection();

  const [formData, setFormData] = useState<EmailSettings>({
    smtpHost: '',
    smtpPort: 587,
    smtpSecure: true,
    smtpUsername: '',
    smtpPassword: '',
    senderName: '',
    senderEmail: '',
    replyToEmail: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, _setShowPassword] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'success' | 'error'>('unknown');

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.smtpHost.trim()) {
      newErrors.smtpHost = 'SMTP host is required';
    }

    if (formData.smtpPort <= 0) {
      newErrors.smtpPort = 'Port must be greater than 0';
    }

    if (!formData.smtpUsername.trim()) {
      newErrors.smtpUsername = 'SMTP username is required';
    }

    if (!formData.senderName.trim()) {
      newErrors.senderName = 'Sender name is required';
    }

    if (!formData.senderEmail.trim()) {
      newErrors.senderEmail = 'Sender email is required';
    } else if (!validateEmail(formData.senderEmail)) {
      newErrors.senderEmail = 'Invalid email format';
    }

    if (!formData.replyToEmail.trim()) {
      newErrors.replyToEmail = 'Reply-to email is required';
    } else if (!validateEmail(formData.replyToEmail)) {
      newErrors.replyToEmail = 'Invalid email format';
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
      await updateMutation.mutateAsync(formData);
      setConnectionStatus('unknown');
      toast({
        title: 'Settings saved',
        description: 'Email settings have been updated successfully',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleTestConnection = async () => {
    if (!testEmail.trim() || !validateEmail(testEmail)) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return;
    }

    try {
      const result = await testMutation.mutateAsync({ recipientEmail: testEmail });
      if (result.success) {
        setConnectionStatus('success');
        toast({
          title: 'Test email sent',
          description: result.message || 'Test email sent successfully',
        });
      } else {
        setConnectionStatus('error');
        toast({
          title: 'Test failed',
          description: result.error || 'Failed to send test email',
          variant: 'destructive',
        });
      }
    } catch (err) {
      setConnectionStatus('error');
      toast({
        title: 'Error',
        description: 'Failed to test email connection',
        variant: 'destructive',
      });
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
        <PageHeader
          title="Email Settings"
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
        title="Email Settings"
        description="Configure SMTP and email notification settings"
        backButton={
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin/settings')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        }
      />

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle>Connection Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            {connectionStatus === 'success' && (
              <>
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm">Connected successfully</span>
              </>
            )}
            {connectionStatus === 'error' && (
              <>
                <XCircle className="h-5 w-5 text-destructive" />
                <span className="text-sm">Connection failed</span>
              </>
            )}
            {connectionStatus === 'unknown' && (
              <>
                <Mail className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm">Not tested</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SMTP Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>SMTP Configuration</CardTitle>
            <CardDescription>
              Configure your SMTP server settings for sending emails
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="smtpHost">
                  SMTP Host <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="smtpHost"
                  value={formData.smtpHost}
                  onChange={(e) => setFormData({ ...formData, smtpHost: e.target.value })}
                  placeholder="smtp.example.com"
                  disabled={updateMutation.isPending}
                />
                {errors.smtpHost && (
                  <p className="text-sm text-destructive">{errors.smtpHost}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtpPort">
                  SMTP Port <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="smtpPort"
                  type="number"
                  min={1}
                  value={formData.smtpPort}
                  onChange={(e) =>
                    setFormData({ ...formData, smtpPort: parseInt(e.target.value, 10) })
                  }
                  disabled={updateMutation.isPending}
                />
                {errors.smtpPort && (
                  <p className="text-sm text-destructive">{errors.smtpPort}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="smtpSecure"
                checked={formData.smtpSecure}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, smtpSecure: checked })
                }
                disabled={updateMutation.isPending}
              />
              <Label htmlFor="smtpSecure">Use Secure Connection (SSL/TLS)</Label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="smtpUsername">
                  SMTP Username <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="smtpUsername"
                  value={formData.smtpUsername}
                  onChange={(e) => setFormData({ ...formData, smtpUsername: e.target.value })}
                  placeholder="user@example.com"
                  disabled={updateMutation.isPending}
                />
                {errors.smtpUsername && (
                  <p className="text-sm text-destructive">{errors.smtpUsername}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtpPassword">
                  SMTP Password <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="smtpPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.smtpPassword}
                  onChange={(e) => setFormData({ ...formData, smtpPassword: e.target.value })}
                  placeholder="••••••••"
                  disabled={updateMutation.isPending}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sender Information */}
        <Card>
          <CardHeader>
            <CardTitle>Sender Information</CardTitle>
            <CardDescription>
              Configure the sender details for outgoing emails
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="senderName">
                Sender Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="senderName"
                value={formData.senderName}
                onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                placeholder="Learning Management System"
                disabled={updateMutation.isPending}
              />
              {errors.senderName && (
                <p className="text-sm text-destructive">{errors.senderName}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="senderEmail">
                  Sender Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="senderEmail"
                  type="email"
                  value={formData.senderEmail}
                  onChange={(e) => setFormData({ ...formData, senderEmail: e.target.value })}
                  placeholder="noreply@example.com"
                  disabled={updateMutation.isPending}
                />
                {errors.senderEmail && (
                  <p className="text-sm text-destructive">{errors.senderEmail}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="replyToEmail">
                  Reply-To Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="replyToEmail"
                  type="email"
                  value={formData.replyToEmail}
                  onChange={(e) => setFormData({ ...formData, replyToEmail: e.target.value })}
                  placeholder="support@example.com"
                  disabled={updateMutation.isPending}
                />
                {errors.replyToEmail && (
                  <p className="text-sm text-destructive">{errors.replyToEmail}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Connection */}
        <Card>
          <CardHeader>
            <CardTitle>Test Email Connection</CardTitle>
            <CardDescription>
              Send a test email to verify your configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test@example.com"
                disabled={testMutation.isPending}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleTestConnection}
                disabled={testMutation.isPending}
              >
                {testMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Test Connection
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end">
          <Button type="submit" disabled={updateMutation.isPending}>
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
    </div>
  );
};
