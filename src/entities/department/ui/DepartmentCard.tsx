/**
 * Department Card Component
 * Displays department information in a card layout
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Building2, Users, BookOpen, GraduationCap, Calendar } from 'lucide-react';
import type { DepartmentListItem, DepartmentDetails } from '../model/types';

interface DepartmentCardProps {
  department: DepartmentListItem | DepartmentDetails;
  showMetadata?: boolean;
  onClick?: () => void;
}

export function DepartmentCard({
  department,
  showMetadata = true,
  onClick,
}: DepartmentCardProps) {
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-500';
      case 'inactive':
        return 'bg-gray-500/10 text-gray-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  const getLevelBadgeColor = (level: number) => {
    if (level === 1) return 'bg-purple-500/10 text-purple-500';
    if (level === 2) return 'bg-blue-500/10 text-blue-500';
    if (level === 3) return 'bg-cyan-500/10 text-cyan-500';
    return 'bg-gray-500/10 text-gray-500';
  };

  const isClickable = !!onClick;

  return (
    <Card
      className={isClickable ? 'cursor-pointer transition-colors hover:bg-accent' : ''}
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="flex items-center gap-2 flex-wrap">
              <Building2 className="h-5 w-5 flex-shrink-0" />
              <span className="truncate">{department.name}</span>
              <Badge variant="outline" className="flex-shrink-0">
                {department.code}
              </Badge>
            </CardTitle>
            {department.description && (
              <CardDescription className="mt-2 line-clamp-2">
                {department.description}
              </CardDescription>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Badge variant="outline" className={getStatusBadgeColor(department.status)}>
              {department.status}
            </Badge>
            <Badge variant="outline" className={getLevelBadgeColor(department.level)}>
              Level {department.level}
            </Badge>
          </div>
        </div>
      </CardHeader>

      {showMetadata && 'metadata' in department && (
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-medium">{department.metadata.totalStaff}</div>
                <div className="text-xs text-muted-foreground">Staff</div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-medium">{department.metadata.totalPrograms}</div>
                <div className="text-xs text-muted-foreground">Programs</div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-medium">{department.metadata.totalCourses}</div>
                <div className="text-xs text-muted-foreground">Courses</div>
              </div>
            </div>

            {'activeEnrollments' in department.metadata && (
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">{department.metadata.activeEnrollments}</div>
                  <div className="text-xs text-muted-foreground">Enrollments</div>
                </div>
              </div>
            )}
          </div>

          {department.hasChildren && (
            <div className="mt-4 pt-4 border-t text-sm text-muted-foreground">
              <Building2 className="h-4 w-4 inline mr-1" />
              Has child departments
              {'childCount' in department && ` (${department.childCount})`}
            </div>
          )}

          {'parent' in department && department.parent && (
            <div className="mt-4 pt-4 border-t text-sm">
              <div className="text-muted-foreground mb-1">Parent Department</div>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span className="font-medium">{department.parent.name}</span>
                <Badge variant="outline" className="text-xs">
                  {department.parent.code}
                </Badge>
              </div>
            </div>
          )}

          <div className="mt-4 pt-4 border-t flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>Created {new Date(department.createdAt).toLocaleDateString()}</span>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
