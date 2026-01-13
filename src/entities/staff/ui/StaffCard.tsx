/**
 * StaffCard Component
 * Displays a staff member as a card
 * Phase 5: Updated to use Person v2.0 data structure
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { UserAvatar } from '@/entities/user';
import { Mail, Briefcase, Building2, Phone } from 'lucide-react';
import type { StaffListItem } from '../model/types';
import type { IPerson } from '@/shared/types/person';
import { cn } from '@/shared/lib/utils';
import { getDisplayName, getPrimaryEmail, getPrimaryPhone, formatPhoneNumber } from '@/shared/lib/person-helpers';

interface StaffCardProps {
  staff: StaffListItem;
  person?: IPerson;
  className?: string;
  onClick?: () => void;
}

export const StaffCard: React.FC<StaffCardProps> = ({ staff, person, className, onClick }) => {
  const primaryDepartment = staff.departmentMemberships.find((d) => d.isPrimary);

  // Use person data if available, fallback to legacy staff data
  const displayName = person ? getDisplayName(person) : `${staff.firstName} ${staff.lastName}`;
  const primaryEmail = person ? getPrimaryEmail(person)?.email : staff.email;
  const primaryPhoneObj = person ? getPrimaryPhone(person) : undefined;
  const primaryPhone = primaryPhoneObj
    ? formatPhoneNumber(primaryPhoneObj)
    : staff.phone || staff.phoneNumber;
  const pronouns = person?.pronouns;
  const professionalTitle = staff.title;

  const cardContent = (
    <Card className={cn('h-full transition-shadow hover:shadow-lg', className)}>
        <CardHeader>
          <div className="flex items-start gap-4">
            <UserAvatar
              firstName={person?.firstName || staff.firstName}
              lastName={person?.lastName || staff.lastName}
              avatarUrl={person?.avatar}
              className="h-12 w-12"
            />
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg">
                {displayName}
                {pronouns && (
                  <span className="text-sm font-normal text-muted-foreground ml-2">({pronouns})</span>
                )}
              </CardTitle>
              {professionalTitle && (
                <CardDescription className="flex items-center gap-1 mt-1">
                  <Briefcase className="h-3 w-3" />
                  {professionalTitle}
                </CardDescription>
              )}
            </div>
            <Badge variant={staff.isActive ? 'default' : 'secondary'}>
              {staff.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {primaryEmail && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span className="truncate">{primaryEmail}</span>
            </div>
          )}

          {primaryPhone && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span className="truncate">{primaryPhone}</span>
            </div>
          )}

          {primaryDepartment && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 className="h-4 w-4" />
              <span className="truncate">Primary Department</span>
            </div>
          )}

          {staff.departmentMemberships.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {staff.departmentMemberships.slice(0, 3).map((membership, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {membership.roles.join(', ')}
                </Badge>
              ))}
              {staff.departmentMemberships.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{staff.departmentMemberships.length - 3} more
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
  );

  if (onClick) {
    return (
      <div onClick={onClick} className="cursor-pointer">
        {cardContent}
      </div>
    );
  }

  return <Link to={`/admin/staff/${staff._id}`}>{cardContent}</Link>;
};
