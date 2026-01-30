/**
 * BasicInfoForm Component
 *
 * Edits basic person information:
 * - Name fields (first, middle, last, suffix)
 * - Preferred name fields
 * - Pronouns
 * - Avatar URL
 * - Bio
 *
 * Features auto-save with 2-minute debounce and blur trigger
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Badge } from '@/shared/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { CheckCircle2, AlertCircle, Loader2, User } from 'lucide-react';
import type { IPerson, IPersonUpdateRequest } from '@/shared/types/person';
import { useAutoSave, useBlurSave } from '../hooks/useAutoSave';
import { personApi } from '@/shared/api/personApi';

export interface BasicInfoFormProps {
  person: IPerson;
  onSaveSuccess?: (updatedPerson: IPerson) => void;
}

export const BasicInfoForm: React.FC<BasicInfoFormProps> = ({ person, onSaveSuccess }) => {
  const [formData, setFormData] = useState<IPersonUpdateRequest>({
    firstName: person.firstName,
    middleName: person.middleName,
    lastName: person.lastName,
    suffix: person.suffix,
    preferredFirstName: person.preferredFirstName,
    preferredLastName: person.preferredLastName,
    pronouns: person.pronouns,
    avatar: person.avatar,
    bio: person.bio,
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  /**
   * Validate form data
   */
  const validate = useCallback((data: IPersonUpdateRequest): boolean => {
    const errors: Record<string, string> = {};

    if (!data.firstName || data.firstName.trim().length < 1) {
      errors.firstName = 'First name is required';
    }

    if (!data.lastName || data.lastName.trim().length < 1) {
      errors.lastName = 'Last name is required';
    }

    if (data.firstName && data.firstName.length > 100) {
      errors.firstName = 'First name must be less than 100 characters';
    }

    if (data.lastName && data.lastName.length > 100) {
      errors.lastName = 'Last name must be less than 100 characters';
    }

    if (data.avatar && data.avatar.trim().length > 0) {
      try {
        new URL(data.avatar);
      } catch {
        errors.avatar = 'Avatar must be a valid URL';
      }
    }

    if (data.bio && data.bio.length > 500) {
      errors.bio = 'Bio must be less than 500 characters';
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
    (field: keyof IPersonUpdateRequest, value: string | null) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value === '' ? null : value,
      }));
    },
    []
  );

  /**
   * Get initials for avatar fallback
   */
  const getInitials = () => {
    const first = formData.preferredFirstName || formData.firstName || '';
    const last = formData.preferredLastName || formData.lastName || '';
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Your name, photo, and bio</CardDescription>
          </div>
          <SaveStatusBadge status={status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to save changes: {error.message}
            </AlertDescription>
          </Alert>
        )}

        {/* Avatar Preview */}
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={formData.avatar || undefined} alt="Profile" />
            <AvatarFallback>
              {getInitials() || <User className="h-10 w-10" />}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Label htmlFor="avatar">Avatar URL</Label>
            <Input
              id="avatar"
              type="url"
              placeholder="https://example.com/avatar.jpg"
              value={formData.avatar || ''}
              onChange={(e) => handleChange('avatar', e.target.value)}
              onBlur={handleBlur}
              className={validationErrors.avatar ? 'border-red-500' : ''}
            />
            {validationErrors.avatar && (
              <p className="text-sm text-red-500 mt-1">{validationErrors.avatar}</p>
            )}
          </div>
        </div>

        {/* Legal Name */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">Legal Name</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="firstName">
                First Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="firstName"
                value={formData.firstName || ''}
                onChange={(e) => handleChange('firstName', e.target.value)}
                onBlur={handleBlur}
                required
                className={validationErrors.firstName ? 'border-red-500' : ''}
              />
              {validationErrors.firstName && (
                <p className="text-sm text-red-500 mt-1">{validationErrors.firstName}</p>
              )}
            </div>
            <div>
              <Label htmlFor="middleName">Middle Name</Label>
              <Input
                id="middleName"
                value={formData.middleName || ''}
                onChange={(e) => handleChange('middleName', e.target.value)}
                onBlur={handleBlur}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="lastName">
                Last Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="lastName"
                value={formData.lastName || ''}
                onChange={(e) => handleChange('lastName', e.target.value)}
                onBlur={handleBlur}
                required
                className={validationErrors.lastName ? 'border-red-500' : ''}
              />
              {validationErrors.lastName && (
                <p className="text-sm text-red-500 mt-1">{validationErrors.lastName}</p>
              )}
            </div>
            <div>
              <Label htmlFor="suffix">Suffix</Label>
              <Input
                id="suffix"
                placeholder="Jr., Sr., III, etc."
                value={formData.suffix || ''}
                onChange={(e) => handleChange('suffix', e.target.value)}
                onBlur={handleBlur}
              />
            </div>
          </div>
        </div>

        {/* Preferred Name */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">Preferred Name (Optional)</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="preferredFirstName">Preferred First Name</Label>
              <Input
                id="preferredFirstName"
                placeholder="How you prefer to be called"
                value={formData.preferredFirstName || ''}
                onChange={(e) => handleChange('preferredFirstName', e.target.value)}
                onBlur={handleBlur}
              />
            </div>
            <div>
              <Label htmlFor="preferredLastName">Preferred Last Name</Label>
              <Input
                id="preferredLastName"
                value={formData.preferredLastName || ''}
                onChange={(e) => handleChange('preferredLastName', e.target.value)}
                onBlur={handleBlur}
              />
            </div>
          </div>
        </div>

        {/* Pronouns */}
        <div>
          <Label htmlFor="pronouns">Pronouns</Label>
          <Input
            id="pronouns"
            placeholder="e.g., she/her, he/him, they/them"
            value={formData.pronouns || ''}
            onChange={(e) => handleChange('pronouns', e.target.value)}
            onBlur={handleBlur}
          />
        </div>

        {/* Bio */}
        <div>
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            placeholder="Tell us about yourself..."
            value={formData.bio || ''}
            onChange={(e) => handleChange('bio', e.target.value)}
            onBlur={handleBlur}
            rows={4}
            className={validationErrors.bio ? 'border-red-500' : ''}
          />
          <div className="flex justify-between mt-1">
            {validationErrors.bio && (
              <p className="text-sm text-red-500">{validationErrors.bio}</p>
            )}
            <p className="text-sm text-muted-foreground ml-auto">
              {(formData.bio || '').length} / 500
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Save Status Badge Component
 */
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
