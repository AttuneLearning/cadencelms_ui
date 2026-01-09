/**
 * LearnerDetail Component
 * Displays detailed information about a learner
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
import { UserAvatar } from '@/entities/user';
import { Mail, Phone, Calendar, MapPin, User, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/shared/ui/skeleton';
import type { Learner } from '../model/types';
import { format } from 'date-fns';

interface LearnerDetailProps {
  learner: Learner;
  isLoading?: boolean;
}

export const LearnerDetail: React.FC<LearnerDetailProps> = ({
  learner,
  isLoading = false,
}) => {
  if (isLoading) {
    return <LearnerDetailSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start gap-6">
            <UserAvatar
              firstName={learner.firstName}
              lastName={learner.lastName}
              className="h-20 w-20"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <CardTitle className="text-2xl">
                  {learner.firstName} {learner.lastName}
                </CardTitle>
                <Badge variant={learner.isActive ? 'default' : 'secondary'}>
                  {learner.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              {learner.dateOfBirth && (
                <CardDescription className="mt-2">
                  Born {format(new Date(learner.dateOfBirth), 'MMMM dd, yyyy')}
                </CardDescription>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {learner.email && (
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Email</div>
                <div className="text-sm text-muted-foreground">{learner.email}</div>
              </div>
            </div>
          )}

          {learner.phoneNumber && (
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Phone</div>
                <div className="text-sm text-muted-foreground">{learner.phoneNumber}</div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="text-sm font-medium">Member Since</div>
              <div className="text-sm text-muted-foreground">
                {format(new Date(learner.createdAt), 'MMM dd, yyyy')}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address Card */}
      {learner.address && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-sm">
              {learner.address.street && <div>{learner.address.street}</div>}
              <div>
                {[learner.address.city, learner.address.state, learner.address.zipCode]
                  .filter(Boolean)
                  .join(', ')}
              </div>
              {learner.address.country && <div>{learner.address.country}</div>}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Emergency Contact Card */}
      {learner.emergencyContact && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Emergency Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {learner.emergencyContact.name && (
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Name</div>
                  <div className="text-sm text-muted-foreground">
                    {learner.emergencyContact.name}
                  </div>
                </div>
              </div>
            )}

            {learner.emergencyContact.relationship && (
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Relationship</div>
                  <div className="text-sm text-muted-foreground">
                    {learner.emergencyContact.relationship}
                  </div>
                </div>
              </div>
            )}

            {learner.emergencyContact.phoneNumber && (
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Phone</div>
                  <div className="text-sm text-muted-foreground">
                    {learner.emergencyContact.phoneNumber}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

function LearnerDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start gap-6">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
