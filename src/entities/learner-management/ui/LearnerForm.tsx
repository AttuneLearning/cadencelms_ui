/**
 * Learner Form Component
 * Form for creating or editing learner profiles
 */

import { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Loader2, Save, UserPlus } from 'lucide-react';
import { useRegisterLearner, useUpdateLearner } from '../model/useLearner';
import type {
  RegisterLearnerPayload,
  UpdateLearnerPayload,
  LearnerResponse,
  Address,
} from '../model/types';

interface LearnerFormProps {
  mode: 'create' | 'edit';
  learner?: LearnerResponse;
  onSuccess?: (learner: LearnerResponse) => void;
  onCancel?: () => void;
}

export function LearnerForm({ mode, learner, onSuccess, onCancel }: LearnerFormProps) {
  const registerLearner = useRegisterLearner();
  const updateLearner = useUpdateLearner();

  const [formData, setFormData] = useState<RegisterLearnerPayload | UpdateLearnerPayload>({
    email: learner?.email || '',
    firstName: learner?.firstName || '',
    lastName: learner?.lastName || '',
    studentId: learner?.studentId || '',
    department: learner?.department?.id || '',
    phone: learner?.phone || '',
    dateOfBirth: learner?.dateOfBirth
      ? new Date(learner.dateOfBirth).toISOString().split('T')[0]
      : '',
    ...(mode === 'create' && { password: '' }),
    address: {
      street: learner?.address?.street || '',
      city: learner?.address?.city || '',
      state: learner?.address?.state || '',
      zipCode: learner?.address?.zipCode || '',
      country: learner?.address?.country || '',
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Clean up empty address fields
      const cleanedAddress: Address | undefined =
        formData.address &&
        (formData.address.street ||
          formData.address.city ||
          formData.address.state ||
          formData.address.zipCode ||
          formData.address.country)
          ? {
              ...(formData.address.street && { street: formData.address.street }),
              ...(formData.address.city && { city: formData.address.city }),
              ...(formData.address.state && { state: formData.address.state }),
              ...(formData.address.zipCode && { zipCode: formData.address.zipCode }),
              ...(formData.address.country && { country: formData.address.country }),
            }
          : undefined;

      const payload = {
        ...formData,
        studentId: formData.studentId || undefined,
        department: formData.department || undefined,
        phone: formData.phone || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
        address: cleanedAddress,
      };

      let result: LearnerResponse;

      if (mode === 'create') {
        result = await registerLearner.mutateAsync(payload as RegisterLearnerPayload);
      } else {
        if (!learner?.id) throw new Error('Learner ID is required for update');
        result = await updateLearner.mutateAsync({
          id: learner.id,
          payload: payload as UpdateLearnerPayload,
        });
      }

      onSuccess?.(result);
    } catch (error) {
      console.error(`Failed to ${mode} learner:`, error);
    }
  };

  const handleChange = (field: string, value: string) => {
    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        address: {
          ...(prev.address || {}),
          [addressField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const isLoading = registerLearner.isPending || updateLearner.isPending;
  const error = registerLearner.error || updateLearner.error;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === 'create' ? 'Register New Learner' : 'Edit Learner'}</CardTitle>
        <CardDescription>
          {mode === 'create'
            ? 'Create a new learner account'
            : 'Update learner profile information'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Basic Information</h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  First Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  required
                  minLength={1}
                  maxLength={100}
                  placeholder="John"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">
                  Last Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  required
                  minLength={1}
                  maxLength={100}
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email Address <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
                placeholder="john.doe@example.com"
              />
            </div>

            {mode === 'create' && (
              <div className="space-y-2">
                <Label htmlFor="password">
                  Password <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={(formData as RegisterLearnerPayload).password || ''}
                  onChange={(e) => handleChange('password', e.target.value)}
                  required
                  minLength={8}
                  placeholder="Min 8 characters"
                />
                <p className="text-xs text-muted-foreground">
                  Should include uppercase, lowercase, numbers, and special characters
                </p>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="studentId">Student ID</Label>
                <Input
                  id="studentId"
                  type="text"
                  value={formData.studentId}
                  onChange={(e) => handleChange('studentId', e.target.value.toUpperCase())}
                  placeholder="STU-2026-001"
                  pattern="^[A-Z0-9-]*$"
                  maxLength={50}
                />
                <p className="text-xs text-muted-foreground">
                  Uppercase letters, numbers, and hyphens only
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  type="text"
                  value={formData.department}
                  onChange={(e) => handleChange('department', e.target.value)}
                  placeholder="Department ID"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Contact Information</h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+1-555-0100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Address</h3>

            <div className="space-y-2">
              <Label htmlFor="street">Street</Label>
              <Input
                id="street"
                type="text"
                value={formData.address?.street || ''}
                onChange={(e) => handleChange('address.street', e.target.value)}
                placeholder="123 Main St"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  type="text"
                  value={formData.address?.city || ''}
                  onChange={(e) => handleChange('address.city', e.target.value)}
                  placeholder="Springfield"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  type="text"
                  value={formData.address?.state || ''}
                  onChange={(e) => handleChange('address.state', e.target.value)}
                  placeholder="IL"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="zipCode">Zip Code</Label>
                <Input
                  id="zipCode"
                  type="text"
                  value={formData.address?.zipCode || ''}
                  onChange={(e) => handleChange('address.zipCode', e.target.value)}
                  placeholder="62701"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  type="text"
                  value={formData.address?.country || ''}
                  onChange={(e) => handleChange('address.country', e.target.value)}
                  placeholder="USA"
                />
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              Failed to {mode} learner: {error.message}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex gap-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === 'create' ? 'Creating...' : 'Saving...'}
                </>
              ) : (
                <>
                  {mode === 'create' ? (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Register Learner
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </>
              )}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
