/**
 * StaffDetail Component
 * Displays detailed information about a staff member
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
import { UserAvatar } from '@/entities/user';
import { Mail, Phone, Briefcase, Building2, Calendar, Shield } from 'lucide-react';
import { Skeleton } from '@/shared/ui/skeleton';
import type { Staff } from '../model/types';
import { format } from 'date-fns';

interface StaffDetailProps {
  staff: Staff;
  isLoading?: boolean;
}

export const StaffDetail: React.FC<StaffDetailProps> = ({ staff, isLoading = false }) => {
  if (isLoading) {
    return <StaffDetailSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start gap-6">
            <UserAvatar
              firstName={staff.firstName}
              lastName={staff.lastName}
              className="h-20 w-20"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <CardTitle className="text-2xl">
                  {staff.firstName} {staff.lastName}
                </CardTitle>
                <Badge variant={staff.isActive ? 'default' : 'secondary'}>
                  {staff.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              {staff.title && (
                <CardDescription className="flex items-center gap-2 mt-2">
                  <Briefcase className="h-4 w-4" />
                  {staff.title}
                </CardDescription>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {staff.email && (
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Email</div>
                <div className="text-sm text-muted-foreground">{staff.email}</div>
              </div>
            </div>
          )}

          {staff.phoneNumber && (
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Phone</div>
                <div className="text-sm text-muted-foreground">{staff.phoneNumber}</div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="text-sm font-medium">Member Since</div>
              <div className="text-sm text-muted-foreground">
                {format(new Date(staff.createdAt), 'MMM dd, yyyy')}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Department Memberships Card */}
      {staff.departmentMemberships.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Department Memberships
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {staff.departmentMemberships.map((membership, index) => (
                <div key={index}>
                  {index > 0 && <Separator className="my-4" />}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Department ID:</span>
                      <span className="text-sm text-muted-foreground">
                        {membership.departmentId}
                      </span>
                      {membership.isPrimary && (
                        <Badge variant="default" className="ml-2">
                          Primary
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Roles:</span>
                      {membership.roles.map((role) => (
                        <Badge key={role} variant="outline">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Roles Card */}
      {staff.roles && staff.roles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              System Roles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {staff.roles.map((role) => (
                <Badge key={role} variant="secondary">
                  {role}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

function StaffDetailSkeleton() {
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
