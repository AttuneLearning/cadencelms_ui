/**
 * Tests for Settings API Client
 * Tests all settings management endpoints with comprehensive coverage
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { env } from '@/shared/config/env';
import {
  getSettingsDashboard,
  getSettingsByCategory,
  updateSettingsByCategory,
  resetSettingsByCategory,
  getSettingsChangelog,
  testEmailConnection,
} from '../settingsApi';
import type {
  SettingsDashboard,
  GeneralSettings,
  EmailSettings,
  NotificationSettings,
  SecuritySettings,
  AppearanceSettings,
  SettingsChangeLog,
  TestEmailResponse,
} from '../../model/types';

describe('settingsApi', () => {
  const baseUrl = env.apiBaseUrl;

  beforeEach(() => {
    server.resetHandlers();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  // Mock data
  const mockGeneralSettings: GeneralSettings = {
    systemName: 'LMS Platform',
    defaultLanguage: 'en',
    timezone: 'UTC',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: '24h',
    maxFileSize: 50,
    allowedFileTypes: ['pdf', 'doc', 'docx', 'jpg', 'png'],
  };

  const mockEmailSettings: EmailSettings = {
    smtpHost: 'smtp.example.com',
    smtpPort: 587,
    smtpSecure: true,
    smtpUsername: 'noreply@lms.com',
    smtpPassword: '***hidden***',
    senderName: 'LMS Platform',
    senderEmail: 'noreply@lms.com',
    replyToEmail: 'support@lms.com',
  };

  const mockNotificationSettings: NotificationSettings = {
    emailNotificationsEnabled: true,
    inAppNotificationsEnabled: true,
    enrollmentNotifications: true,
    completionNotifications: true,
    gradingNotifications: true,
    deadlineNotifications: true,
    digestFrequency: 'daily',
  };

  const mockSecuritySettings: SecuritySettings = {
    passwordMinLength: 8,
    passwordRequireUppercase: true,
    passwordRequireLowercase: true,
    passwordRequireNumbers: true,
    passwordRequireSpecialChars: true,
    sessionTimeout: 60,
    maxLoginAttempts: 5,
    twoFactorEnabled: false,
    ipWhitelist: [],
  };

  const mockAppearanceSettings: AppearanceSettings = {
    logoUrl: '/assets/logo.png',
    faviconUrl: '/assets/favicon.ico',
    primaryColor: '#1976d2',
    secondaryColor: '#dc004e',
    customCss: null,
  };

  const mockDashboard: SettingsDashboard = {
    lastModified: {
      general: '2024-01-10T10:00:00Z',
      email: '2024-01-09T15:30:00Z',
      notification: '2024-01-08T09:15:00Z',
      security: '2024-01-07T14:45:00Z',
      appearance: null,
    },
    recentChanges: [
      {
        id: '1',
        category: 'general',
        key: 'systemName',
        oldValue: 'Old LMS',
        newValue: 'LMS Platform',
        changedBy: { id: 'user-1', name: 'Admin User' },
        changedAt: '2024-01-10T10:00:00Z',
      },
    ],
    systemHealth: {
      status: 'healthy',
      emailConfigured: true,
      securityConfigured: true,
      issues: [],
    },
  };

  const mockChangelog: SettingsChangeLog[] = [
    {
      id: '1',
      category: 'general',
      key: 'systemName',
      oldValue: 'Old LMS',
      newValue: 'LMS Platform',
      changedBy: { id: 'user-1', name: 'Admin User' },
      changedAt: '2024-01-10T10:00:00Z',
    },
    {
      id: '2',
      category: 'security',
      key: 'passwordMinLength',
      oldValue: 6,
      newValue: 8,
      changedBy: { id: 'user-1', name: 'Admin User' },
      changedAt: '2024-01-09T14:30:00Z',
    },
  ];

  // =====================
  // GET SETTINGS DASHBOARD
  // =====================

  describe('getSettingsDashboard', () => {
    it('should fetch settings dashboard successfully', async () => {
      server.use(
        http.get(`${baseUrl}/settings/dashboard`, () => {
          return HttpResponse.json({
            success: true,
            data: mockDashboard,
          });
        })
      );

      const result = await getSettingsDashboard();

      expect(result).toEqual(mockDashboard);
      expect(result.systemHealth.status).toBe('healthy');
      expect(result.recentChanges).toHaveLength(1);
    });

    it('should include system health indicators', async () => {
      server.use(
        http.get(`${baseUrl}/settings/dashboard`, () => {
          return HttpResponse.json({
            success: true,
            data: mockDashboard,
          });
        })
      );

      const result = await getSettingsDashboard();

      expect(result.systemHealth.emailConfigured).toBe(true);
      expect(result.systemHealth.securityConfigured).toBe(true);
      expect(result.systemHealth.issues).toEqual([]);
    });

    it('should handle dashboard with warnings', async () => {
      const dashboardWithWarnings = {
        ...mockDashboard,
        systemHealth: {
          status: 'warning' as const,
          emailConfigured: false,
          securityConfigured: true,
          issues: ['Email settings not configured'],
        },
      };

      server.use(
        http.get(`${baseUrl}/settings/dashboard`, () => {
          return HttpResponse.json({
            success: true,
            data: dashboardWithWarnings,
          });
        })
      );

      const result = await getSettingsDashboard();

      expect(result.systemHealth.status).toBe('warning');
      expect(result.systemHealth.issues).toHaveLength(1);
    });

    it('should handle error response', async () => {
      server.use(
        http.get(`${baseUrl}/settings/dashboard`, () => {
          return HttpResponse.json(
            { success: false, message: 'Failed to fetch dashboard' },
            { status: 500 }
          );
        })
      );

      await expect(getSettingsDashboard()).rejects.toThrow();
    });
  });

  // =====================
  // GET SETTINGS BY CATEGORY - GENERAL
  // =====================

  describe('getSettingsByCategory - general', () => {
    it('should fetch general settings', async () => {
      server.use(
        http.get(`${baseUrl}/settings/general`, () => {
          return HttpResponse.json({
            success: true,
            data: mockGeneralSettings,
          });
        })
      );

      const result = await getSettingsByCategory('general');

      expect(result).toEqual(mockGeneralSettings);
      expect(result.systemName).toBe('LMS Platform');
      expect(result.maxFileSize).toBe(50);
    });

    it('should include all required general settings fields', async () => {
      server.use(
        http.get(`${baseUrl}/settings/general`, () => {
          return HttpResponse.json({
            success: true,
            data: mockGeneralSettings,
          });
        })
      );

      const result = await getSettingsByCategory('general');

      expect(result).toHaveProperty('systemName');
      expect(result).toHaveProperty('defaultLanguage');
      expect(result).toHaveProperty('timezone');
      expect(result).toHaveProperty('dateFormat');
      expect(result).toHaveProperty('timeFormat');
      expect(result).toHaveProperty('maxFileSize');
      expect(result).toHaveProperty('allowedFileTypes');
    });
  });

  // =====================
  // GET SETTINGS BY CATEGORY - EMAIL
  // =====================

  describe('getSettingsByCategory - email', () => {
    it('should fetch email settings', async () => {
      server.use(
        http.get(`${baseUrl}/settings/email`, () => {
          return HttpResponse.json({
            success: true,
            data: mockEmailSettings,
          });
        })
      );

      const result = await getSettingsByCategory('email');

      expect(result).toEqual(mockEmailSettings);
      expect(result.smtpHost).toBe('smtp.example.com');
      expect(result.smtpPort).toBe(587);
    });

    it('should mask sensitive email credentials', async () => {
      server.use(
        http.get(`${baseUrl}/settings/email`, () => {
          return HttpResponse.json({
            success: true,
            data: mockEmailSettings,
          });
        })
      );

      const result = await getSettingsByCategory('email');

      expect(result.smtpPassword).toBe('***hidden***');
    });
  });

  // =====================
  // GET SETTINGS BY CATEGORY - NOTIFICATION
  // =====================

  describe('getSettingsByCategory - notification', () => {
    it('should fetch notification settings', async () => {
      server.use(
        http.get(`${baseUrl}/settings/notification`, () => {
          return HttpResponse.json({
            success: true,
            data: mockNotificationSettings,
          });
        })
      );

      const result = await getSettingsByCategory('notification');

      expect(result).toEqual(mockNotificationSettings);
      expect(result.emailNotificationsEnabled).toBe(true);
      expect(result.digestFrequency).toBe('daily');
    });
  });

  // =====================
  // GET SETTINGS BY CATEGORY - SECURITY
  // =====================

  describe('getSettingsByCategory - security', () => {
    it('should fetch security settings', async () => {
      server.use(
        http.get(`${baseUrl}/settings/security`, () => {
          return HttpResponse.json({
            success: true,
            data: mockSecuritySettings,
          });
        })
      );

      const result = await getSettingsByCategory('security');

      expect(result).toEqual(mockSecuritySettings);
      expect(result.passwordMinLength).toBe(8);
      expect(result.twoFactorEnabled).toBe(false);
    });
  });

  // =====================
  // GET SETTINGS BY CATEGORY - APPEARANCE
  // =====================

  describe('getSettingsByCategory - appearance', () => {
    it('should fetch appearance settings', async () => {
      server.use(
        http.get(`${baseUrl}/settings/appearance`, () => {
          return HttpResponse.json({
            success: true,
            data: mockAppearanceSettings,
          });
        })
      );

      const result = await getSettingsByCategory('appearance');

      expect(result).toEqual(mockAppearanceSettings);
      expect(result.primaryColor).toBe('#1976d2');
      expect(result.customCss).toBeNull();
    });
  });

  // =====================
  // UPDATE SETTINGS BY CATEGORY
  // =====================

  describe('updateSettingsByCategory', () => {
    it('should update general settings', async () => {
      const updatePayload = {
        systemName: 'Updated LMS Platform',
        maxFileSize: 100,
      };

      const updatedSettings = {
        ...mockGeneralSettings,
        ...updatePayload,
      };

      server.use(
        http.put(`${baseUrl}/settings/general`, async ({ request }) => {
          const body = await request.json();
          expect(body).toEqual(updatePayload);

          return HttpResponse.json({
            success: true,
            data: updatedSettings,
          });
        })
      );

      const result = await updateSettingsByCategory('general', updatePayload);

      expect(result.systemName).toBe('Updated LMS Platform');
      expect(result.maxFileSize).toBe(100);
    });

    it('should update email settings', async () => {
      const updatePayload = {
        smtpHost: 'smtp.newhost.com',
        smtpPort: 465,
      };

      const updatedSettings = {
        ...mockEmailSettings,
        ...updatePayload,
      };

      server.use(
        http.put(`${baseUrl}/settings/email`, async ({ request }) => {
          const body = await request.json();
          expect(body).toEqual(updatePayload);

          return HttpResponse.json({
            success: true,
            data: updatedSettings,
          });
        })
      );

      const result = await updateSettingsByCategory('email', updatePayload);

      expect(result.smtpHost).toBe('smtp.newhost.com');
      expect(result.smtpPort).toBe(465);
    });

    it('should update notification settings', async () => {
      const updatePayload = {
        digestFrequency: 'weekly' as const,
        deadlineNotifications: false,
      };

      const updatedSettings = {
        ...mockNotificationSettings,
        ...updatePayload,
      };

      server.use(
        http.put(`${baseUrl}/settings/notification`, () => {
          return HttpResponse.json({
            success: true,
            data: updatedSettings,
          });
        })
      );

      const result = await updateSettingsByCategory('notification', updatePayload);

      expect(result.digestFrequency).toBe('weekly');
      expect(result.deadlineNotifications).toBe(false);
    });

    it('should update security settings', async () => {
      const updatePayload = {
        passwordMinLength: 12,
        twoFactorEnabled: true,
      };

      const updatedSettings = {
        ...mockSecuritySettings,
        ...updatePayload,
      };

      server.use(
        http.put(`${baseUrl}/settings/security`, () => {
          return HttpResponse.json({
            success: true,
            data: updatedSettings,
          });
        })
      );

      const result = await updateSettingsByCategory('security', updatePayload);

      expect(result.passwordMinLength).toBe(12);
      expect(result.twoFactorEnabled).toBe(true);
    });

    it('should update appearance settings', async () => {
      const updatePayload = {
        primaryColor: '#ff5722',
        customCss: 'body { font-family: Arial; }',
      };

      const updatedSettings = {
        ...mockAppearanceSettings,
        ...updatePayload,
      };

      server.use(
        http.put(`${baseUrl}/settings/appearance`, () => {
          return HttpResponse.json({
            success: true,
            data: updatedSettings,
          });
        })
      );

      const result = await updateSettingsByCategory('appearance', updatePayload);

      expect(result.primaryColor).toBe('#ff5722');
      expect(result.customCss).toBe('body { font-family: Arial; }');
    });

    it('should handle validation errors', async () => {
      server.use(
        http.put(`${baseUrl}/settings/general`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Validation failed',
              errors: { maxFileSize: ['Must be between 1 and 500'] },
            },
            { status: 400 }
          );
        })
      );

      await expect(
        updateSettingsByCategory('general', { maxFileSize: 1000 })
      ).rejects.toThrow();
    });
  });

  // =====================
  // RESET SETTINGS BY CATEGORY
  // =====================

  describe('resetSettingsByCategory', () => {
    it('should reset general settings to defaults', async () => {
      server.use(
        http.post(`${baseUrl}/settings/general/reset`, () => {
          return HttpResponse.json({
            success: true,
            data: mockGeneralSettings,
          });
        })
      );

      const result = await resetSettingsByCategory('general');

      expect(result).toEqual(mockGeneralSettings);
    });

    it('should reset security settings to defaults', async () => {
      server.use(
        http.post(`${baseUrl}/settings/security/reset`, () => {
          return HttpResponse.json({
            success: true,
            data: mockSecuritySettings,
          });
        })
      );

      const result = await resetSettingsByCategory('security');

      expect(result).toEqual(mockSecuritySettings);
    });

    it('should reset appearance settings to defaults', async () => {
      server.use(
        http.post(`${baseUrl}/settings/appearance/reset`, () => {
          return HttpResponse.json({
            success: true,
            data: mockAppearanceSettings,
          });
        })
      );

      const result = await resetSettingsByCategory('appearance');

      expect(result).toEqual(mockAppearanceSettings);
    });
  });

  // =====================
  // GET SETTINGS CHANGELOG
  // =====================

  describe('getSettingsChangelog', () => {
    it('should fetch changelog with default limit', async () => {
      server.use(
        http.get(`${baseUrl}/settings/changelog`, ({ request }) => {
          const url = new URL(request.url);
          expect(url.searchParams.get('limit')).toBe('10');

          return HttpResponse.json({
            success: true,
            data: mockChangelog,
          });
        })
      );

      const result = await getSettingsChangelog();

      expect(result).toEqual(mockChangelog);
      expect(result).toHaveLength(2);
    });

    it('should fetch changelog with custom limit', async () => {
      server.use(
        http.get(`${baseUrl}/settings/changelog`, ({ request }) => {
          const url = new URL(request.url);
          expect(url.searchParams.get('limit')).toBe('5');

          return HttpResponse.json({
            success: true,
            data: mockChangelog.slice(0, 1),
          });
        })
      );

      const result = await getSettingsChangelog(5);

      expect(result).toHaveLength(1);
    });

    it('should include change metadata', async () => {
      server.use(
        http.get(`${baseUrl}/settings/changelog`, () => {
          return HttpResponse.json({
            success: true,
            data: mockChangelog,
          });
        })
      );

      const result = await getSettingsChangelog();

      expect(result[0].changedBy.name).toBe('Admin User');
      expect(result[0].oldValue).toBe('Old LMS');
      expect(result[0].newValue).toBe('LMS Platform');
    });
  });

  // =====================
  // TEST EMAIL CONNECTION
  // =====================

  describe('testEmailConnection', () => {
    it('should test email connection successfully', async () => {
      const payload = { recipientEmail: 'test@example.com' };
      const mockResponse: TestEmailResponse = {
        success: true,
        message: 'Test email sent successfully',
      };

      server.use(
        http.post(`${baseUrl}/settings/email/test`, async ({ request }) => {
          const body = await request.json();
          expect(body).toEqual(payload);

          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await testEmailConnection(payload);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Test email sent successfully');
    });

    it('should handle email connection failure', async () => {
      const payload = { recipientEmail: 'test@example.com' };
      const mockResponse: TestEmailResponse = {
        success: false,
        message: 'Failed to connect to SMTP server',
        error: 'Connection timeout',
      };

      server.use(
        http.post(`${baseUrl}/settings/email/test`, () => {
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await testEmailConnection(payload);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Connection timeout');
    });

    it('should handle invalid email address', async () => {
      server.use(
        http.post(`${baseUrl}/settings/email/test`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Invalid email address',
            },
            { status: 400 }
          );
        })
      );

      await expect(
        testEmailConnection({ recipientEmail: 'invalid-email' })
      ).rejects.toThrow();
    });
  });
});
