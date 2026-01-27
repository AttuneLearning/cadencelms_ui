/**
 * Appearance Settings Page
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { useToast } from '@/shared/ui/use-toast';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { Loader2, Save, ArrowLeft, RotateCcw, Eye } from 'lucide-react';
import { useSettingsByCategory, useUpdateSettings, useResetSettings, type AppearanceSettings } from '@/entities/settings';
import { PageHeader } from '@/shared/ui/page-header';

export const AppearanceSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: settings, isLoading, error } = useSettingsByCategory('appearance');
  const updateMutation = useUpdateSettings('appearance');
  const resetMutation = useResetSettings('appearance');

  const [formData, setFormData] = useState<AppearanceSettings>({
    logoUrl: null,
    faviconUrl: null,
    primaryColor: '#3b82f6',
    secondaryColor: '#8b5cf6',
    customCss: null,
  });

  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  useEffect(() => {
    if (settings) setFormData(settings);
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateMutation.mutateAsync(formData);
      toast({ title: 'Settings saved', description: 'Appearance settings updated successfully' });
    } catch {
      toast({ title: 'Error', description: 'Failed to save settings', variant: 'destructive' });
    }
  };

  const handleReset = async () => {
    try {
      const defaults = await resetMutation.mutateAsync();
      setFormData(defaults);
      setIsResetDialogOpen(false);
      toast({ title: 'Settings reset', description: 'Appearance settings reset to defaults' });
    } catch {
      toast({ title: 'Error', description: 'Failed to reset settings', variant: 'destructive' });
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
          title="Appearance Settings"
          backButton={
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/settings')}>
              <ArrowLeft className="h-4 w-4 mr-2" />Back
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
        title="Appearance Settings"
        description="Customize the look and feel of your system"
        backButton={
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin/settings')}>
            <ArrowLeft className="h-4 w-4 mr-2" />Back
          </Button>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Branding</CardTitle>
            <CardDescription>Upload your logo and favicon</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="logoUrl">Logo URL</Label>
              <Input id="logoUrl" value={formData.logoUrl || ''} onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value || null })} placeholder="https://example.com/logo.png" />
              {formData.logoUrl && (
                <div className="mt-2">
                  <img src={formData.logoUrl} alt="Logo preview" className="h-12 object-contain" />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="faviconUrl">Favicon URL</Label>
              <Input id="faviconUrl" value={formData.faviconUrl || ''} onChange={(e) => setFormData({ ...formData, faviconUrl: e.target.value || null })} placeholder="https://example.com/favicon.ico" />
              {formData.faviconUrl && (
                <div className="mt-2">
                  <img src={formData.faviconUrl} alt="Favicon preview" className="h-8 object-contain" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Colors</CardTitle>
            <CardDescription>Customize your theme colors</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex gap-2">
                  <Input id="primaryColor" type="color" value={formData.primaryColor} onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })} className="w-20 h-10" />
                  <Input value={formData.primaryColor} onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })} placeholder="#3b82f6" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondaryColor">Secondary Color</Label>
                <div className="flex gap-2">
                  <Input id="secondaryColor" type="color" value={formData.secondaryColor} onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })} className="w-20 h-10" />
                  <Input value={formData.secondaryColor} onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })} placeholder="#8b5cf6" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Custom CSS</CardTitle>
            <CardDescription>Add custom CSS to override default styles</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea id="customCss" value={formData.customCss || ''} onChange={(e) => setFormData({ ...formData, customCss: e.target.value || null })} placeholder="/* Custom styles */" rows={10} className="font-mono text-sm" />
            <Label htmlFor="customCss" className="sr-only">Custom CSS</Label>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setIsResetDialogOpen(true)} disabled={updateMutation.isPending || resetMutation.isPending}>
              <RotateCcw className="h-4 w-4 mr-2" />Reset to Defaults
            </Button>
            <Button type="button" variant="outline" disabled>
              <Eye className="h-4 w-4 mr-2" />Preview
            </Button>
          </div>
          <Button type="submit" disabled={updateMutation.isPending || resetMutation.isPending}>
            {updateMutation.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : <><Save className="h-4 w-4 mr-2" />Save Settings</>}
          </Button>
        </div>
      </form>

      <ConfirmDialog
        open={isResetDialogOpen}
        onOpenChange={setIsResetDialogOpen}
        onConfirm={handleReset}
        title="Reset to Defaults"
        description="Are you sure you want to reset all appearance settings to their default values? This action cannot be undone."
        confirmText="Reset"
        isDestructive
        isLoading={resetMutation.isPending}
      />
    </div>
  );
};
