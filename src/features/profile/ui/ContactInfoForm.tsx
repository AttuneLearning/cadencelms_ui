/**
 * ContactInfoForm Component
 *
 * Manages contact information arrays:
 * - Emails (add/edit/remove, mark primary)
 * - Phones (add/edit/remove, mark primary)
 * - Addresses (add/edit/remove, mark primary)
 *
 * Features auto-save with 2-minute debounce and blur trigger
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Button } from '@/shared/ui/button';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Badge } from '@/shared/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Switch } from '@/shared/ui/switch';
import { Separator } from '@/shared/ui/separator';
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Plus,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Star,
} from 'lucide-react';
import type {
  IPerson,
  IPersonUpdateRequest,
  IEmail,
  IPhone,
  IAddress,
  EmailType,
  PhoneType,
  AddressType,
} from '@/shared/types/person';
import { useAutoSave, useBlurSave } from '../hooks/useAutoSave';
import { personApi } from '@/shared/api/personApi';

export interface ContactInfoFormProps {
  person: IPerson;
  onSaveSuccess?: (updatedPerson: IPerson) => void;
}

export const ContactInfoForm: React.FC<ContactInfoFormProps> = ({ person, onSaveSuccess }) => {
  const [formData, setFormData] = useState<IPersonUpdateRequest>({
    emails: [...person.emails],
    phones: [...person.phones],
    addresses: [...person.addresses],
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  /**
   * Validate email format
   */
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * Validate phone format (basic)
   */
  const isValidPhone = (phone: string): boolean => {
    // Allow various formats: +1-234-567-8900, (234) 567-8900, 234-567-8900, etc.
    const phoneRegex = /^[\d\s\-+()]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
  };

  /**
   * Validate form data
   */
  const validate = useCallback((data: IPersonUpdateRequest): boolean => {
    const errors: Record<string, string> = {};

    // Validate emails
    if (data.emails) {
      data.emails.forEach((email, index) => {
        if (!isValidEmail(email.email)) {
          errors[`email-${index}`] = 'Invalid email format';
        }
      });

      const primaryEmails = data.emails.filter((e) => e.isPrimary);
      if (data.emails.length > 0 && primaryEmails.length === 0) {
        errors.emails = 'At least one email must be marked as primary';
      }
    }

    // Validate phones
    if (data.phones) {
      data.phones.forEach((phone, index) => {
        if (!isValidPhone(phone.number)) {
          errors[`phone-${index}`] = 'Invalid phone number';
        }
      });

      const primaryPhones = data.phones.filter((p) => p.isPrimary);
      if (data.phones.length > 0 && primaryPhones.length === 0) {
        errors.phones = 'At least one phone must be marked as primary';
      }
    }

    // Validate addresses
    if (data.addresses) {
      data.addresses.forEach((address, index) => {
        if (!address.street1 || !address.city || !address.state || !address.postalCode) {
          errors[`address-${index}`] = 'All required fields must be filled';
        }
      });

      const primaryAddresses = data.addresses.filter((a) => a.isPrimary);
      if (data.addresses.length > 0 && primaryAddresses.length === 0) {
        errors.addresses = 'At least one address must be marked as primary';
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

  // ==================== Email Management ====================

  const addEmail = useCallback(() => {
    const newEmail: IEmail = {
      email: '',
      type: 'personal',
      isPrimary: (formData.emails?.length || 0) === 0,
      verified: false,
      allowNotifications: true,
      label: null,
    };
    setFormData((prev) => ({
      ...prev,
      emails: [...(prev.emails || []), newEmail],
    }));
  }, [formData.emails]);

  const updateEmail = useCallback((index: number, updates: Partial<IEmail>) => {
    setFormData((prev) => {
      const emails = [...(prev.emails || [])];
      emails[index] = { ...emails[index], ...updates };

      // If setting as primary, unset others
      if (updates.isPrimary) {
        emails.forEach((email, i) => {
          if (i !== index) {
            email.isPrimary = false;
          }
        });
      }

      return { ...prev, emails };
    });
  }, []);

  const removeEmail = useCallback((index: number) => {
    setFormData((prev) => {
      const emails = [...(prev.emails || [])];
      const removedEmail = emails[index];
      emails.splice(index, 1);

      // If removed email was primary, make first one primary
      if (removedEmail.isPrimary && emails.length > 0) {
        emails[0].isPrimary = true;
      }

      return { ...prev, emails };
    });
  }, []);

  // ==================== Phone Management ====================

  const addPhone = useCallback(() => {
    const newPhone: IPhone = {
      number: '',
      type: 'mobile',
      isPrimary: (formData.phones?.length || 0) === 0,
      verified: false,
      allowSMS: true,
      label: null,
    };
    setFormData((prev) => ({
      ...prev,
      phones: [...(prev.phones || []), newPhone],
    }));
  }, [formData.phones]);

  const updatePhone = useCallback((index: number, updates: Partial<IPhone>) => {
    setFormData((prev) => {
      const phones = [...(prev.phones || [])];
      phones[index] = { ...phones[index], ...updates };

      // If setting as primary, unset others
      if (updates.isPrimary) {
        phones.forEach((phone, i) => {
          if (i !== index) {
            phone.isPrimary = false;
          }
        });
      }

      return { ...prev, phones };
    });
  }, []);

  const removePhone = useCallback((index: number) => {
    setFormData((prev) => {
      const phones = [...(prev.phones || [])];
      const removedPhone = phones[index];
      phones.splice(index, 1);

      // If removed phone was primary, make first one primary
      if (removedPhone.isPrimary && phones.length > 0) {
        phones[0].isPrimary = true;
      }

      return { ...prev, phones };
    });
  }, []);

  // ==================== Address Management ====================

  const addAddress = useCallback(() => {
    const newAddress: IAddress = {
      street1: '',
      street2: null,
      city: '',
      state: '',
      postalCode: '',
      country: 'USA',
      type: 'home',
      isPrimary: (formData.addresses?.length || 0) === 0,
      label: null,
    };
    setFormData((prev) => ({
      ...prev,
      addresses: [...(prev.addresses || []), newAddress],
    }));
  }, [formData.addresses]);

  const updateAddress = useCallback((index: number, updates: Partial<IAddress>) => {
    setFormData((prev) => {
      const addresses = [...(prev.addresses || [])];
      addresses[index] = { ...addresses[index], ...updates };

      // If setting as primary, unset others
      if (updates.isPrimary) {
        addresses.forEach((address, i) => {
          if (i !== index) {
            address.isPrimary = false;
          }
        });
      }

      return { ...prev, addresses };
    });
  }, []);

  const removeAddress = useCallback((index: number) => {
    setFormData((prev) => {
      const addresses = [...(prev.addresses || [])];
      const removedAddress = addresses[index];
      addresses.splice(index, 1);

      // If removed address was primary, make first one primary
      if (removedAddress.isPrimary && addresses.length > 0) {
        addresses[0].isPrimary = true;
      }

      return { ...prev, addresses };
    });
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>Manage your email addresses, phone numbers, and addresses</CardDescription>
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

        {/* Email Addresses */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-medium">Email Addresses</h3>
            </div>
            <Button onClick={addEmail} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              Add Email
            </Button>
          </div>

          {validationErrors.emails && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{validationErrors.emails}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            {formData.emails?.map((email, index) => (
              <EmailField
                key={index}
                email={email}
                index={index}
                error={validationErrors[`email-${index}`]}
                onUpdate={(updates) => updateEmail(index, updates)}
                onRemove={() => removeEmail(index)}
                onBlur={handleBlur}
                canRemove={(formData.emails?.length || 0) > 1}
              />
            ))}
            {(!formData.emails || formData.emails.length === 0) && (
              <p className="text-sm text-muted-foreground">No email addresses added yet.</p>
            )}
          </div>
        </div>

        <Separator />

        {/* Phone Numbers */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-medium">Phone Numbers</h3>
            </div>
            <Button onClick={addPhone} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              Add Phone
            </Button>
          </div>

          {validationErrors.phones && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{validationErrors.phones}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            {formData.phones?.map((phone, index) => (
              <PhoneField
                key={index}
                phone={phone}
                index={index}
                error={validationErrors[`phone-${index}`]}
                onUpdate={(updates) => updatePhone(index, updates)}
                onRemove={() => removePhone(index)}
                onBlur={handleBlur}
                canRemove={(formData.phones?.length || 0) > 1}
              />
            ))}
            {(!formData.phones || formData.phones.length === 0) && (
              <p className="text-sm text-muted-foreground">No phone numbers added yet.</p>
            )}
          </div>
        </div>

        <Separator />

        {/* Addresses */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-medium">Addresses</h3>
            </div>
            <Button onClick={addAddress} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              Add Address
            </Button>
          </div>

          {validationErrors.addresses && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{validationErrors.addresses}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            {formData.addresses?.map((address, index) => (
              <AddressField
                key={index}
                address={address}
                index={index}
                error={validationErrors[`address-${index}`]}
                onUpdate={(updates) => updateAddress(index, updates)}
                onRemove={() => removeAddress(index)}
                onBlur={handleBlur}
                canRemove={(formData.addresses?.length || 0) > 1}
              />
            ))}
            {(!formData.addresses || formData.addresses.length === 0) && (
              <p className="text-sm text-muted-foreground">No addresses added yet.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ==================== Email Field Component ====================

interface EmailFieldProps {
  email: IEmail;
  index: number;
  error?: string;
  onUpdate: (updates: Partial<IEmail>) => void;
  onRemove: () => void;
  onBlur: () => void;
  canRemove: boolean;
}

const EmailField: React.FC<EmailFieldProps> = ({
  email,
  index,
  error,
  onUpdate,
  onRemove,
  onBlur,
  canRemove,
}) => {
  return (
    <div className="p-4 border rounded-lg space-y-3">
      <div className="flex items-start gap-3">
        <div className="flex-1 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor={`email-${index}`}>Email Address</Label>
              <Input
                id={`email-${index}`}
                type="email"
                value={email.email}
                onChange={(e) => onUpdate({ email: e.target.value })}
                onBlur={onBlur}
                className={error ? 'border-red-500' : ''}
              />
              {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
            </div>
            <div>
              <Label htmlFor={`email-type-${index}`}>Type</Label>
              <Select value={email.type} onValueChange={(value) => onUpdate({ type: value as EmailType })}>
                <SelectTrigger id={`email-type-${index}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="institutional">Institutional</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="work">Work</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                id={`email-primary-${index}`}
                checked={email.isPrimary}
                onCheckedChange={(checked) => onUpdate({ isPrimary: checked })}
              />
              <Label htmlFor={`email-primary-${index}`} className="flex items-center gap-1">
                <Star className="h-3 w-3" />
                Primary
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id={`email-notifications-${index}`}
                checked={email.allowNotifications}
                onCheckedChange={(checked) => onUpdate({ allowNotifications: checked })}
              />
              <Label htmlFor={`email-notifications-${index}`}>Allow Notifications</Label>
            </div>
          </div>
        </div>

        {canRemove && (
          <Button onClick={onRemove} size="icon" variant="ghost" className="text-red-500 hover:text-red-700">
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

// ==================== Phone Field Component ====================

interface PhoneFieldProps {
  phone: IPhone;
  index: number;
  error?: string;
  onUpdate: (updates: Partial<IPhone>) => void;
  onRemove: () => void;
  onBlur: () => void;
  canRemove: boolean;
}

const PhoneField: React.FC<PhoneFieldProps> = ({
  phone,
  index,
  error,
  onUpdate,
  onRemove,
  onBlur,
  canRemove,
}) => {
  return (
    <div className="p-4 border rounded-lg space-y-3">
      <div className="flex items-start gap-3">
        <div className="flex-1 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor={`phone-${index}`}>Phone Number</Label>
              <Input
                id={`phone-${index}`}
                type="tel"
                placeholder="+1 (234) 567-8900"
                value={phone.number}
                onChange={(e) => onUpdate({ number: e.target.value })}
                onBlur={onBlur}
                className={error ? 'border-red-500' : ''}
              />
              {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
            </div>
            <div>
              <Label htmlFor={`phone-type-${index}`}>Type</Label>
              <Select value={phone.type} onValueChange={(value) => onUpdate({ type: value as PhoneType })}>
                <SelectTrigger id={`phone-type-${index}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mobile">Mobile</SelectItem>
                  <SelectItem value="home">Home</SelectItem>
                  <SelectItem value="work">Work</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                id={`phone-primary-${index}`}
                checked={phone.isPrimary}
                onCheckedChange={(checked) => onUpdate({ isPrimary: checked })}
              />
              <Label htmlFor={`phone-primary-${index}`} className="flex items-center gap-1">
                <Star className="h-3 w-3" />
                Primary
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id={`phone-sms-${index}`}
                checked={phone.allowSMS}
                onCheckedChange={(checked) => onUpdate({ allowSMS: checked })}
              />
              <Label htmlFor={`phone-sms-${index}`}>Allow SMS</Label>
            </div>
          </div>
        </div>

        {canRemove && (
          <Button onClick={onRemove} size="icon" variant="ghost" className="text-red-500 hover:text-red-700">
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

// ==================== Address Field Component ====================

interface AddressFieldProps {
  address: IAddress;
  index: number;
  error?: string;
  onUpdate: (updates: Partial<IAddress>) => void;
  onRemove: () => void;
  onBlur: () => void;
  canRemove: boolean;
}

const AddressField: React.FC<AddressFieldProps> = ({
  address,
  index,
  error,
  onUpdate,
  onRemove,
  onBlur,
  canRemove,
}) => {
  return (
    <div className="p-4 border rounded-lg space-y-3">
      <div className="flex items-start gap-3">
        <div className="flex-1 space-y-3">
          <div className="grid gap-3">
            <div>
              <Label htmlFor={`address-street1-${index}`}>
                Street Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id={`address-street1-${index}`}
                value={address.street1}
                onChange={(e) => onUpdate({ street1: e.target.value })}
                onBlur={onBlur}
                className={error ? 'border-red-500' : ''}
              />
            </div>
            <div>
              <Label htmlFor={`address-street2-${index}`}>Apartment, Suite, etc.</Label>
              <Input
                id={`address-street2-${index}`}
                value={address.street2 || ''}
                onChange={(e) => onUpdate({ street2: e.target.value || null })}
                onBlur={onBlur}
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <Label htmlFor={`address-city-${index}`}>
                City <span className="text-red-500">*</span>
              </Label>
              <Input
                id={`address-city-${index}`}
                value={address.city}
                onChange={(e) => onUpdate({ city: e.target.value })}
                onBlur={onBlur}
              />
            </div>
            <div>
              <Label htmlFor={`address-state-${index}`}>
                State <span className="text-red-500">*</span>
              </Label>
              <Input
                id={`address-state-${index}`}
                value={address.state}
                onChange={(e) => onUpdate({ state: e.target.value })}
                onBlur={onBlur}
              />
            </div>
            <div>
              <Label htmlFor={`address-postal-${index}`}>
                Postal Code <span className="text-red-500">*</span>
              </Label>
              <Input
                id={`address-postal-${index}`}
                value={address.postalCode}
                onChange={(e) => onUpdate({ postalCode: e.target.value })}
                onBlur={onBlur}
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor={`address-country-${index}`}>Country</Label>
              <Input
                id={`address-country-${index}`}
                value={address.country}
                onChange={(e) => onUpdate({ country: e.target.value })}
                onBlur={onBlur}
              />
            </div>
            <div>
              <Label htmlFor={`address-type-${index}`}>Type</Label>
              <Select value={address.type} onValueChange={(value) => onUpdate({ type: value as AddressType })}>
                <SelectTrigger id={`address-type-${index}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="home">Home</SelectItem>
                  <SelectItem value="work">Work</SelectItem>
                  <SelectItem value="mailing">Mailing</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id={`address-primary-${index}`}
              checked={address.isPrimary}
              onCheckedChange={(checked) => onUpdate({ isPrimary: checked })}
            />
            <Label htmlFor={`address-primary-${index}`} className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              Primary
            </Label>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        {canRemove && (
          <Button onClick={onRemove} size="icon" variant="ghost" className="text-red-500 hover:text-red-700">
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
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
