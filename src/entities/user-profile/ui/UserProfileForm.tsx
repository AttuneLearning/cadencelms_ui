/**
 * User Profile Edit Form Component
 * Allows users to update their profile information
 */

import { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { Loader2, Save } from 'lucide-react';
import { useUpdateUserProfile } from '../model/useUserProfile';
import type { UserProfile, UpdateProfilePayload } from '../model/types';

interface UserProfileFormProps {
  profile: UserProfile;
  onSuccess?: () => void;
}

export function UserProfileForm({ profile, onSuccess }: UserProfileFormProps) {
  const updateProfile = useUpdateUserProfile();

  const [formData, setFormData] = useState<UpdateProfilePayload>({
    firstName: profile.firstName,
    lastName: profile.lastName,
    phone: profile.phone || '',
    profileImage: profile.profileImage,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateProfile.mutateAsync(formData);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleChange = (field: keyof UpdateProfilePayload, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value || undefined,
    }));
  };

  const initials = `${formData.firstName?.[0] || ''}${formData.lastName?.[0] || ''}`.toUpperCase();
  const isLoading = updateProfile.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
        <CardDescription>Update your personal information</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Image Preview */}
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={formData.profileImage || undefined} />
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Label htmlFor="profileImage">Profile Image URL</Label>
              <Input
                id="profileImage"
                type="url"
                value={formData.profileImage || ''}
                onChange={(e) => handleChange('profileImage', e.target.value)}
                placeholder="https://example.com/avatar.jpg"
              />
            </div>
          </div>

          {/* First Name */}
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

          {/* Last Name */}
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

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+1-555-0123"
              pattern="^\+?[1-9]\d{1,14}$"
            />
            <p className="text-sm text-muted-foreground">
              E.164 format (e.g., +1-555-0123)
            </p>
          </div>

          {/* Email (read-only) */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={profile.email}
              disabled
              className="bg-muted"
            />
            <p className="text-sm text-muted-foreground">
              Email cannot be changed. Contact an administrator.
            </p>
          </div>

          {/* Error Message */}
          {updateProfile.isError && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              Failed to update profile. Please try again.
            </div>
          )}

          {/* Success Message */}
          {updateProfile.isSuccess && (
            <div className="rounded-md bg-green-500/10 p-3 text-sm text-green-600">
              Profile updated successfully!
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
