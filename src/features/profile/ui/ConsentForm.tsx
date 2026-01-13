/**
 * ConsentForm Component
 *
 * Manages legal consent preferences:
 * - FERPA consent
 * - GDPR consent
 * - Photo consent
 * - Marketing consent
 * - Third-party data sharing
 *
 * Shows consent dates and provides clear explanations.
 * Features auto-save with 2-minute debounce and blur trigger.
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Label } from '@/shared/ui/label';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Badge } from '@/shared/ui/badge';
import { Switch } from '@/shared/ui/switch';
import { Separator } from '@/shared/ui/separator';
import { CheckCircle2, AlertCircle, Loader2, Shield, Info } from 'lucide-react';
import type { IPerson, IPersonUpdateRequest } from '@/shared/types/person';
import { useAutoSave, useBlurSave } from '../hooks/useAutoSave';
import { personApi } from '@/shared/api/personApi';

export interface ConsentFormProps {
  person: IPerson;
  onSaveSuccess?: (updatedPerson: IPerson) => void;
}

export const ConsentForm: React.FC<ConsentFormProps> = ({ person, onSaveSuccess }) => {
  const [formData, setFormData] = useState<IPersonUpdateRequest>({
    legalConsent: {
      ferpaConsent: person.legalConsent.ferpaConsent,
      ferpaConsentDate: person.legalConsent.ferpaConsentDate,
      gdprConsent: person.legalConsent.gdprConsent,
      gdprConsentDate: person.legalConsent.gdprConsentDate,
      photoConsent: person.legalConsent.photoConsent,
      photoConsentDate: person.legalConsent.photoConsentDate,
      marketingConsent: person.legalConsent.marketingConsent,
      marketingConsentDate: person.legalConsent.marketingConsentDate,
      thirdPartyDataSharing: person.legalConsent.thirdPartyDataSharing,
      thirdPartyDataSharingDate: person.legalConsent.thirdPartyDataSharingDate,
    },
  });

  /**
   * Handle save
   */
  const handleSave = useCallback(
    async (data: IPersonUpdateRequest) => {
      // Update consent dates when consent changes
      const updatedData = { ...data };
      const now = new Date();

      if (updatedData.legalConsent) {
        if (
          updatedData.legalConsent.ferpaConsent !== null &&
          updatedData.legalConsent.ferpaConsent !== person.legalConsent.ferpaConsent
        ) {
          updatedData.legalConsent.ferpaConsentDate = now;
        }

        if (
          updatedData.legalConsent.gdprConsent !== null &&
          updatedData.legalConsent.gdprConsent !== person.legalConsent.gdprConsent
        ) {
          updatedData.legalConsent.gdprConsentDate = now;
        }

        if (
          updatedData.legalConsent.photoConsent !== null &&
          updatedData.legalConsent.photoConsent !== person.legalConsent.photoConsent
        ) {
          updatedData.legalConsent.photoConsentDate = now;
        }

        if (
          updatedData.legalConsent.marketingConsent !== null &&
          updatedData.legalConsent.marketingConsent !== person.legalConsent.marketingConsent
        ) {
          updatedData.legalConsent.marketingConsentDate = now;
        }

        if (
          updatedData.legalConsent.thirdPartyDataSharing !== null &&
          updatedData.legalConsent.thirdPartyDataSharing !== person.legalConsent.thirdPartyDataSharing
        ) {
          updatedData.legalConsent.thirdPartyDataSharingDate = now;
        }
      }

      const response = await personApi.updateMyPerson(updatedData);
      if (onSaveSuccess && response.data) {
        onSaveSuccess(response.data);
      }
    },
    [person, onSaveSuccess]
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
   * Handle consent change
   */
  const handleConsentChange = useCallback((field: string, value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      legalConsent: {
        ...prev.legalConsent!,
        [field]: value,
      },
    }));
  }, []);

  /**
   * Format date for display
   */
  const formatDate = (date: Date | null): string => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Legal Consent & Privacy
            </CardTitle>
            <CardDescription>
              Manage your consent preferences for data usage and privacy
            </CardDescription>
          </div>
          <SaveStatusBadge status={status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Failed to save changes: {error.message}</AlertDescription>
          </Alert>
        )}

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Your privacy is important to us. You can change these settings at any time. Changes are
            automatically saved.
          </AlertDescription>
        </Alert>

        {/* FERPA Consent */}
        <ConsentItem
          id="ferpaConsent"
          title="FERPA Consent (Education Records)"
          description="The Family Educational Rights and Privacy Act (FERPA) protects the privacy of student education records. By consenting, you allow us to share your educational information with authorized parties such as parents, guardians, or other educational institutions."
          checked={formData.legalConsent?.ferpaConsent ?? false}
          onChange={(checked) => handleConsentChange('ferpaConsent', checked)}
          onBlur={handleBlur}
          consentDate={formData.legalConsent?.ferpaConsentDate}
        />

        <Separator />

        {/* GDPR Consent */}
        <ConsentItem
          id="gdprConsent"
          title="GDPR Consent (Data Processing)"
          description="The General Data Protection Regulation (GDPR) protects your personal data. By consenting, you allow us to process your personal information for providing educational services, communications, and improving our platform."
          checked={formData.legalConsent?.gdprConsent ?? false}
          onChange={(checked) => handleConsentChange('gdprConsent', checked)}
          onBlur={handleBlur}
          consentDate={formData.legalConsent?.gdprConsentDate}
        />

        <Separator />

        {/* Photo Consent */}
        <ConsentItem
          id="photoConsent"
          title="Photo & Media Consent"
          description="Allow us to use your photos, videos, or other media for promotional materials, websites, social media, and publications. You can revoke this consent at any time."
          checked={formData.legalConsent?.photoConsent ?? false}
          onChange={(checked) => handleConsentChange('photoConsent', checked)}
          onBlur={handleBlur}
          consentDate={formData.legalConsent?.photoConsentDate}
        />

        <Separator />

        {/* Marketing Consent */}
        <ConsentItem
          id="marketingConsent"
          title="Marketing Communications"
          description="Receive promotional emails, newsletters, and updates about new courses, features, and special offers. We will never share your email with third parties for marketing purposes."
          checked={formData.legalConsent?.marketingConsent ?? false}
          onChange={(checked) => handleConsentChange('marketingConsent', checked)}
          onBlur={handleBlur}
          consentDate={formData.legalConsent?.marketingConsentDate}
        />

        <Separator />

        {/* Third-Party Data Sharing */}
        <ConsentItem
          id="thirdPartyDataSharing"
          title="Third-Party Data Sharing"
          description="Allow us to share your anonymized data with trusted third-party partners for analytics, research, and improving educational outcomes. Your personal identification information will never be shared without explicit consent."
          checked={formData.legalConsent?.thirdPartyDataSharing ?? false}
          onChange={(checked) => handleConsentChange('thirdPartyDataSharing', checked)}
          onBlur={handleBlur}
          consentDate={formData.legalConsent?.thirdPartyDataSharingDate}
        />

        {/* Information Alert */}
        <Alert className="mt-6">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Your Rights:</strong> You have the right to access, correct, or delete your personal
            data at any time. You can also withdraw consent for any of these items. For more information,
            please review our Privacy Policy or contact our Data Protection Officer.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

// ==================== Consent Item Component ====================

interface ConsentItemProps {
  id: string;
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  onBlur: () => void;
  consentDate?: Date | null;
}

const ConsentItem: React.FC<ConsentItemProps> = ({
  id,
  title,
  description,
  checked,
  onChange,
  onBlur,
  consentDate,
}) => {
  const formatDate = (date: Date | null): string => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor={id} className="text-base font-medium">
              {title}
            </Label>
            {checked && (
              <Badge variant="outline" className="bg-green-500/10 text-green-500">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Granted
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
          {consentDate && checked && (
            <p className="text-xs text-muted-foreground">
              Last updated: {formatDate(consentDate)}
            </p>
          )}
        </div>
        <Switch
          id={id}
          checked={checked}
          onCheckedChange={(value) => {
            onChange(value);
            onBlur();
          }}
          className="ml-4"
        />
      </div>
    </div>
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
