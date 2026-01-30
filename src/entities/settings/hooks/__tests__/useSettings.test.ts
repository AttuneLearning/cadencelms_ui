/**
 * Tests for Settings React Query Hooks
 * Tests all hooks with cache invalidation and mutations
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { waitFor, act } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { env } from '@/shared/config/env';
import { renderHook } from '@/test/utils/renderHook';
import {
  useSettingsDashboard,
  useSettingsByCategory,
  useUpdateSettings,
  useResetSettings,
  useSettingsChangelog,
  useTestEmailConnection,
} from '../useSettings';
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

describe('Settings Hooks', () => {
  const baseUrl = env.apiFullUrl;

  beforeEach(() => {
    server.resetHandlers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
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
  ];

  // =====================
  // SETTINGS DASHBOARD
  // =====================

  describe('useSettingsDashboard', () => {
    it('should fetch settings dashboard', async () => {
      server.use(
        http.get(`${baseUrl}/settings/dashboard`, () => {
          return HttpResponse.json({
            success: true,
            data: mockDashboard,
          });
        })
      );

      const { result } = renderHook(() => useSettingsDashboard());

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockDashboard);
    });

    it('should handle dashboard loading state', () => {
      const { result } = renderHook(() => useSettingsDashboard());

      expect(result.current.isPending).toBe(true);
    });

    it('should handle dashboard error', async () => {
      server.use(
        http.get(`${baseUrl}/settings/dashboard`, () => {
          return HttpResponse.json(
            { success: false, message: 'Failed to fetch dashboard' },
            { status: 500 }
          );
        })
      );

      const { result } = renderHook(() => useSettingsDashboard());

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  // =====================
  // SETTINGS BY CATEGORY
  // =====================

  describe('useSettingsByCategory', () => {
    it('should fetch general settings', async () => {
      server.use(
        http.get(`${baseUrl}/settings/general`, () => {
          return HttpResponse.json({
            success: true,
            data: mockGeneralSettings,
          });
        })
      );

      const { result } = renderHook(() => useSettingsByCategory('general'));

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockGeneralSettings);
    });

    it('should fetch email settings', async () => {
      server.use(
        http.get(`${baseUrl}/settings/email`, () => {
          return HttpResponse.json({
            success: true,
            data: mockEmailSettings,
          });
        })
      );

      const { result } = renderHook(() => useSettingsByCategory('email'));

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockEmailSettings);
    });

    it('should fetch notification settings', async () => {
      server.use(
        http.get(`${baseUrl}/settings/notification`, () => {
          return HttpResponse.json({
            success: true,
            data: mockNotificationSettings,
          });
        })
      );

      const { result } = renderHook(() => useSettingsByCategory('notification'));

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockNotificationSettings);
    });

    it('should fetch security settings', async () => {
      server.use(
        http.get(`${baseUrl}/settings/security`, () => {
          return HttpResponse.json({
            success: true,
            data: mockSecuritySettings,
          });
        })
      );

      const { result } = renderHook(() => useSettingsByCategory('security'));

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockSecuritySettings);
    });

    it('should fetch appearance settings', async () => {
      server.use(
        http.get(`${baseUrl}/settings/appearance`, () => {
          return HttpResponse.json({
            success: true,
            data: mockAppearanceSettings,
          });
        })
      );

      const { result } = renderHook(() => useSettingsByCategory('appearance'));

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockAppearanceSettings);
    });
  });

  // =====================
  // UPDATE SETTINGS
  // =====================

  describe('useUpdateSettings', () => {
    it('should update general settings', async () => {
      const updatedSettings = {
        ...mockGeneralSettings,
        systemName: 'Updated LMS',
      };

      server.use(
        http.put(`${baseUrl}/settings/general`, () => {
          return HttpResponse.json({
            success: true,
            data: updatedSettings,
          });
        })
      );

      const { result, queryClient } = renderHook(() => useUpdateSettings('general'));

      act(() => {
        result.current.mutate({ systemName: 'Updated LMS' });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(updatedSettings);
    });

    it('should update email settings', async () => {
      const updatedSettings = {
        ...mockEmailSettings,
        smtpHost: 'smtp.newhost.com',
      };

      server.use(
        http.put(`${baseUrl}/settings/email`, () => {
          return HttpResponse.json({
            success: true,
            data: updatedSettings,
          });
        })
      );

      const { result } = renderHook(() => useUpdateSettings('email'));

      act(() => {
        result.current.mutate({ smtpHost: 'smtp.newhost.com' });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(updatedSettings);
    });

    it('should invalidate cache after successful update', async () => {
      server.use(
        http.put(`${baseUrl}/settings/general`, () => {
          return HttpResponse.json({
            success: true,
            data: mockGeneralSettings,
          });
        })
      );

      const { result, queryClient } = renderHook(() => useUpdateSettings('general'));
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

      act(() => {
        result.current.mutate({ systemName: 'Test' });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(invalidateQueriesSpy).toHaveBeenCalled();
    });

    it('should handle update error', async () => {
      server.use(
        http.put(`${baseUrl}/settings/general`, () => {
          return HttpResponse.json(
            { success: false, message: 'Validation error' },
            { status: 400 }
          );
        })
      );

      const { result } = renderHook(() => useUpdateSettings('general'));

      act(() => {
        result.current.mutate({ maxFileSize: 1000 });
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  // =====================
  // RESET SETTINGS
  // =====================

  describe('useResetSettings', () => {
    it('should reset general settings', async () => {
      server.use(
        http.post(`${baseUrl}/settings/general/reset`, () => {
          return HttpResponse.json({
            success: true,
            data: mockGeneralSettings,
          });
        })
      );

      const { result } = renderHook(() => useResetSettings('general'));

      act(() => {
        result.current.mutate();
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockGeneralSettings);
    });

    it('should reset security settings', async () => {
      server.use(
        http.post(`${baseUrl}/settings/security/reset`, () => {
          return HttpResponse.json({
            success: true,
            data: mockSecuritySettings,
          });
        })
      );

      const { result } = renderHook(() => useResetSettings('security'));

      act(() => {
        result.current.mutate();
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockSecuritySettings);
    });

    it('should invalidate cache after reset', async () => {
      server.use(
        http.post(`${baseUrl}/settings/general/reset`, () => {
          return HttpResponse.json({
            success: true,
            data: mockGeneralSettings,
          });
        })
      );

      const { result, queryClient } = renderHook(() => useResetSettings('general'));
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

      act(() => {
        result.current.mutate();
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(invalidateQueriesSpy).toHaveBeenCalled();
    });
  });

  // =====================
  // SETTINGS CHANGELOG
  // =====================

  describe('useSettingsChangelog', () => {
    it('should fetch changelog with default limit', async () => {
      server.use(
        http.get(`${baseUrl}/settings/changelog`, () => {
          return HttpResponse.json({
            success: true,
            data: mockChangelog,
          });
        })
      );

      const { result } = renderHook(() => useSettingsChangelog());

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockChangelog);
    });

    it('should fetch changelog with custom limit', async () => {
      server.use(
        http.get(`${baseUrl}/settings/changelog`, () => {
          return HttpResponse.json({
            success: true,
            data: mockChangelog,
          });
        })
      );

      const { result } = renderHook(() => useSettingsChangelog(20));

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockChangelog);
    });
  });

  // =====================
  // TEST EMAIL CONNECTION
  // =====================

  describe('useTestEmailConnection', () => {
    it('should test email connection successfully', async () => {
      const mockResponse: TestEmailResponse = {
        success: true,
        message: 'Test email sent successfully',
      };

      server.use(
        http.post(`${baseUrl}/settings/email/test`, () => {
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const { result } = renderHook(() => useTestEmailConnection());

      act(() => {
        result.current.mutate({ recipientEmail: 'test@example.com' });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockResponse);
    });

    it('should handle email test failure', async () => {
      const mockResponse: TestEmailResponse = {
        success: false,
        message: 'Failed to connect',
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

      const { result } = renderHook(() => useTestEmailConnection());

      act(() => {
        result.current.mutate({ recipientEmail: 'test@example.com' });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.success).toBe(false);
      expect(result.current.data?.error).toBe('Connection timeout');
    });

    it('should handle invalid email error', async () => {
      server.use(
        http.post(`${baseUrl}/settings/email/test`, () => {
          return HttpResponse.json(
            { success: false, message: 'Invalid email' },
            { status: 400 }
          );
        })
      );

      const { result } = renderHook(() => useTestEmailConnection());

      act(() => {
        result.current.mutate({ recipientEmail: 'invalid-email' });
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });
});
