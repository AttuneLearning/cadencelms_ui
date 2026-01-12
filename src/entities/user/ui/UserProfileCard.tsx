/**
 * UserProfileCard Component
 * Displays user profile information in a card
 */

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Separator } from '@/shared/ui/separator';
import { UserAvatar } from './UserAvatar';
import { Mail, Phone, Briefcase, Calendar, Shield } from 'lucide-react';
import type { User } from '../model/types';
import { format } from 'date-fns';

interface UserProfileCardProps {
  user: User;
  className?: string;
}

export const UserProfileCard: React.FC<UserProfileCardProps> = ({ user, className }) => {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start gap-6">
          <UserAvatar
            firstName={user.firstName}
            lastName={user.lastName}
            avatar={user.avatar}
            className="h-20 w-20"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <CardTitle className="text-2xl">
                {user.firstName} {user.lastName}
              </CardTitle>
              <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                {user.status}
              </Badge>
            </div>
            {user.jobTitle && (
              <CardDescription className="flex items-center gap-2 mt-2">
                <Briefcase className="h-4 w-4" />
                {user.jobTitle}
              </CardDescription>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Mail className="h-5 w-5 text-muted-foreground" />
          <div>
            <div className="text-sm font-medium">Email</div>
            <div className="text-sm text-muted-foreground">{user.email}</div>
          </div>
        </div>

        {user.phoneNumber && (
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="text-sm font-medium">Phone</div>
              <div className="text-sm text-muted-foreground">{user.phoneNumber}</div>
            </div>
          </div>
        )}

        {user.department && (
          <div className="flex items-center gap-3">
            <Briefcase className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="text-sm font-medium">Department</div>
              <div className="text-sm text-muted-foreground">{user.department}</div>
            </div>
          </div>
        )}

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium">Roles</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {user.roles.map((role) => (
              <Badge key={role} variant="outline">
                {role}
              </Badge>
            ))}
          </div>
        </div>

        <Separator />

        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Joined {format(new Date(user.createdAt), 'MMM dd, yyyy')}</span>
          </div>
          {user.lastLoginAt && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Last login {format(new Date(user.lastLoginAt), 'MMM dd, yyyy')}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
