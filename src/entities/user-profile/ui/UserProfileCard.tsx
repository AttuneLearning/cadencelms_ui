/**
 * User Profile Card Component
 * Displays user profile information
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { User, Mail, Phone, Calendar, Shield } from 'lucide-react';
import type { UserProfile } from '../model/types';

interface UserProfileCardProps {
  profile: UserProfile;
  showDetails?: boolean;
}

export function UserProfileCard({ profile, showDetails = true }: UserProfileCardProps) {
  const firstName = profile.firstName?.trim() || '';
  const lastName = profile.lastName?.trim() || '';
  const fullName = [firstName, lastName].filter(Boolean).join(' ') || profile.email || 'User';
  const initials =
    `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase() ||
    (fullName[0] ? fullName[0].toUpperCase() : 'U');

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'global-admin':
        return 'bg-red-500/10 text-red-500';
      case 'staff':
        return 'bg-blue-500/10 text-blue-500';
      case 'learner':
        return 'bg-green-500/10 text-green-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-500';
      case 'inactive':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'withdrawn':
        return 'bg-gray-500/10 text-gray-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile.profileImage || undefined} alt={fullName} />
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              Welcome, {firstName || fullName}
              <Badge variant="outline" className={getRoleBadgeColor(profile.role)}>
                {profile.role === 'global-admin' ? 'Admin' : profile.role}
              </Badge>
              <Badge variant="outline" className={getStatusBadgeColor(profile.status)}>
                {profile.status}
              </Badge>
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <Mail className="h-4 w-4" />
              {profile.email}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      {showDetails && (
        <CardContent className="space-y-3">
          {profile.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{profile.phone}</span>
            </div>
          )}

          {profile.studentId && (
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>Student ID: {profile.studentId}</span>
            </div>
          )}

          {profile.permissions && profile.permissions.length > 0 && (
            <div className="flex items-start gap-2 text-sm">
              <Shield className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex flex-wrap gap-1">
                {profile.permissions.map((permission) => (
                  <Badge key={permission} variant="secondary" className="text-xs">
                    {permission}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              Joined {new Date(profile.createdAt).toLocaleDateString()}
            </span>
          </div>

          {profile.lastLoginAt && (
            <div className="text-sm text-muted-foreground">
              Last login: {new Date(profile.lastLoginAt).toLocaleString()}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
