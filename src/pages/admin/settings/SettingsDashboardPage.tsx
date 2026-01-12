/**
 * Settings Dashboard Page
 * Overview of system settings with quick access to all configuration sections
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Loader2, Settings, Mail, Bell, Shield, Palette, ChevronRight, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { useSettingsDashboard } from '@/entities/settings';

const settingsCategories = [
  {
    id: 'general',
    title: 'General Settings',
    description: 'System name, language, timezone, and file upload settings',
    icon: Settings,
    path: '/admin/settings/general',
  },
  {
    id: 'email',
    title: 'Email Settings',
    description: 'SMTP configuration and sender information',
    icon: Mail,
    path: '/admin/settings/email',
  },
  {
    id: 'notification',
    title: 'Notification Settings',
    description: 'Configure email and in-app notifications',
    icon: Bell,
    path: '/admin/settings/notifications',
  },
  {
    id: 'security',
    title: 'Security Settings',
    description: 'Password policies, session timeout, and authentication',
    icon: Shield,
    path: '/admin/settings/security',
  },
  {
    id: 'appearance',
    title: 'Appearance Settings',
    description: 'Logo, colors, and custom styling',
    icon: Palette,
    path: '/admin/settings/appearance',
  },
] as const;

export const SettingsDashboardPage: React.FC = () => {
  const { data: dashboard, isLoading, error } = useSettingsDashboard();

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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
          <p className="text-muted-foreground">
            Manage system configuration and preferences
          </p>
        </div>
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <div>
                <h3 className="font-semibold">Error loading settings dashboard</h3>
                <p className="text-sm">{error.message}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getHealthIcon = () => {
    switch (dashboard?.systemHealth.status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      default:
        return <AlertCircle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getHealthBadgeVariant = () => {
    switch (dashboard?.systemHealth.status) {
      case 'healthy':
        return 'default';
      case 'warning':
        return 'secondary';
      case 'error':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
        <p className="text-muted-foreground">
          Manage system configuration and preferences
        </p>
      </div>

      {/* System Health */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>System Health</CardTitle>
            <Badge variant={getHealthBadgeVariant()}>
              {dashboard?.systemHealth.status.charAt(0).toUpperCase() +
                dashboard?.systemHealth.status.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              {getHealthIcon()}
              <div className="flex-1">
                {dashboard?.systemHealth.issues && dashboard.systemHealth.issues.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Issues detected:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {dashboard.systemHealth.issues.map((issue, index) => (
                        <li key={index} className="text-sm text-muted-foreground">
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    All systems are operating normally
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Email: {dashboard?.systemHealth.emailConfigured ? 'Configured' : 'Not configured'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Security: {dashboard?.systemHealth.securityConfigured ? 'Configured' : 'Not configured'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Categories */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Configuration Sections</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {settingsCategories.map((category) => {
            const Icon = category.icon;
            const lastModified = dashboard?.lastModified[category.id];

            return (
              <Card key={category.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{category.title}</CardTitle>
                      </div>
                    </div>
                  </div>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      {lastModified ? (
                        <>
                          Last updated:{' '}
                          {format(new Date(lastModified), 'MMM dd, yyyy')}
                        </>
                      ) : (
                        'Never updated'
                      )}
                    </div>
                    <Button asChild variant="ghost" size="sm">
                      <Link to={category.path}>
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Changes */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Changes</CardTitle>
          <CardDescription>Last 10 settings modifications</CardDescription>
        </CardHeader>
        <CardContent>
          {dashboard?.recentChanges && dashboard.recentChanges.length > 0 ? (
            <div className="space-y-4">
              {dashboard.recentChanges.map((change) => (
                <div key={change.id} className="flex items-start gap-3 pb-4 border-b last:border-0 last:pb-0">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {change.category}
                      </Badge>
                      <span className="text-sm font-medium">{change.key}</span>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div className="flex items-center gap-2">
                        <span>From:</span>
                        <code className="px-1 py-0.5 bg-muted rounded text-xs">
                          {String(change.oldValue)}
                        </code>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>To:</span>
                        <code className="px-1 py-0.5 bg-muted rounded text-xs">
                          {String(change.newValue)}
                        </code>
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <div>{change.changedBy.name}</div>
                    <div>{format(new Date(change.changedAt), 'MMM dd, HH:mm')}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No recent changes
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
