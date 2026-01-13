/**
 * Staff Card Component
 * Displays staff member information in a card format
 * Phase 5: Updated to use Person v2.0 data structure
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { Mail, Calendar, Shield, Briefcase, Activity } from 'lucide-react';
import type { Staff } from '../model/types';
import type { IPerson } from '@/shared/types/person';
import { getDisplayName, getPrimaryEmail } from '@/shared/lib/person-helpers';

interface StaffCardProps {
  staff: Staff;
  person?: IPerson;
  showDetails?: boolean;
  showMetadata?: boolean;
}

export function StaffCard({ staff, person, showDetails = true, showMetadata = false }: StaffCardProps) {
  // Use person data if available, fallback to legacy staff data
  const displayName = person ? getDisplayName(person) : `${staff.firstName} ${staff.lastName}`;
  const primaryEmail = person ? getPrimaryEmail(person)?.email : staff.email;
  const avatar = person?.avatar || staff.profileImage;
  const pronouns = person?.pronouns;

  const initials = person
    ? `${person.firstName[0] || ''}${person.lastName[0] || ''}`.toUpperCase()
    : `${staff.firstName[0]}${staff.lastName[0]}`.toUpperCase();

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

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'dept-admin':
        return 'bg-purple-500/10 text-purple-500';
      case 'content-admin':
        return 'bg-blue-500/10 text-blue-500';
      case 'instructor':
        return 'bg-teal-500/10 text-teal-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={avatar || undefined} alt={displayName} />
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 flex-wrap">
              {displayName}
              {pronouns && (
                <span className="text-sm font-normal text-muted-foreground">({pronouns})</span>
              )}
              <Badge variant="outline" className={getStatusBadgeColor(staff.status)}>
                {staff.status}
              </Badge>
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <Mail className="h-4 w-4" />
              {primaryEmail || 'No email'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      {showDetails && (
        <CardContent className="space-y-4">
          {/* Department Assignments */}
          {staff.departments && staff.departments.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span>Departments</span>
              </div>
              <div className="flex flex-wrap gap-2 pl-6">
                {staff.departments.map((dept, index) => (
                  <div
                    key={`${dept.departmentId}-${index}`}
                    className="flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs"
                  >
                    <span className="font-medium">{dept.departmentName}</span>
                    <Badge variant="secondary" className={getRoleBadgeColor(dept.roleInDepartment)}>
                      {dept.roleInDepartment}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Permissions */}
          {staff.permissions && staff.permissions.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span>Permissions</span>
              </div>
              <div className="flex flex-wrap gap-1 pl-6">
                {staff.permissions.map((permission) => (
                  <Badge key={permission} variant="secondary" className="text-xs">
                    {permission}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Metadata Statistics */}
          {showMetadata && staff.metadata && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <span>Activity</span>
              </div>
              <div className="grid grid-cols-3 gap-4 pl-6">
                <div className="text-sm">
                  <div className="text-muted-foreground">Courses Created</div>
                  <div className="text-lg font-semibold">{staff.metadata.coursesCreated}</div>
                </div>
                <div className="text-sm">
                  <div className="text-muted-foreground">Courses Managed</div>
                  <div className="text-lg font-semibold">{staff.metadata.coursesManaged}</div>
                </div>
                <div className="text-sm">
                  <div className="text-muted-foreground">Content Created</div>
                  <div className="text-lg font-semibold">{staff.metadata.contentCreated}</div>
                </div>
              </div>
              {staff.metadata.lastActivityAt && (
                <div className="text-sm text-muted-foreground pl-6">
                  Last activity: {new Date(staff.metadata.lastActivityAt).toLocaleString()}
                </div>
              )}
            </div>
          )}

          {/* Timestamps */}
          <div className="space-y-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Joined {new Date(staff.createdAt).toLocaleDateString()}</span>
            </div>
            {staff.lastLogin && (
              <div className="text-sm text-muted-foreground pl-6">
                Last login: {new Date(staff.lastLogin).toLocaleString()}
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
