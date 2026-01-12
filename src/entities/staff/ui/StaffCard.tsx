/**
 * StaffCard Component
 * Displays a staff member as a card
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
import { Mail, Briefcase, Building2 } from 'lucide-react';
import type { StaffListItem } from '../model/types';
import { cn } from '@/shared/lib/utils';

interface StaffCardProps {
  staff: StaffListItem;
  className?: string;
  onClick?: () => void;
}

export const StaffCard: React.FC<StaffCardProps> = ({ staff, className, onClick }) => {
  const primaryDepartment = staff.departmentMemberships.find((d) => d.isPrimary);

  const cardContent = (
    <Card className={cn('h-full transition-shadow hover:shadow-lg', className)}>
        <CardHeader>
          <div className="flex items-start gap-4">
            <UserAvatar
              firstName={staff.firstName}
              lastName={staff.lastName}
              className="h-12 w-12"
            />
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg">
                {staff.firstName} {staff.lastName}
              </CardTitle>
              {staff.title && (
                <CardDescription className="flex items-center gap-1 mt-1">
                  <Briefcase className="h-3 w-3" />
                  {staff.title}
                </CardDescription>
              )}
            </div>
            <Badge variant={staff.isActive ? 'default' : 'secondary'}>
              {staff.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {staff.email && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span className="truncate">{staff.email}</span>
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
