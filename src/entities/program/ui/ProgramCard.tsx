/**
 * Program Card Component
 * Displays program information in a card layout
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { BookOpen, Building2, Clock, Award, Calendar, Eye, EyeOff } from 'lucide-react';
import type { ProgramListItem, Program } from '../model/types';

interface ProgramCardProps {
  program: ProgramListItem | Program;
  showMetadata?: boolean;
  onClick?: () => void;
}

export function ProgramCard({
  program,
  showMetadata = true,
  onClick,
}: ProgramCardProps) {
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-500';
      case 'inactive':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'archived':
        return 'bg-gray-500/10 text-gray-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  const getCredentialBadgeColor = (credential: string) => {
    switch (credential) {
      case 'certificate':
        return 'bg-blue-500/10 text-blue-500';
      case 'diploma':
        return 'bg-purple-500/10 text-purple-500';
      case 'degree':
        return 'bg-amber-500/10 text-amber-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  const getDurationText = (duration: number, unit: string) => {
    return `${duration} ${unit}`;
  };

  const isClickable = !!onClick;
  const totalLevels = 'statistics' in program ? program.statistics.totalLevels : program.totalLevels;
  const totalCourses = 'statistics' in program ? program.statistics.totalCourses : program.totalCourses;
  const activeEnrollments = 'statistics' in program ? program.statistics.activeEnrollments : program.activeEnrollments;

  return (
    <Card
      className={isClickable ? 'cursor-pointer transition-colors hover:bg-accent' : ''}
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="flex items-center gap-2 flex-wrap">
              <BookOpen className="h-5 w-5 flex-shrink-0" />
              <span className="truncate">{program.name}</span>
              <Badge variant="outline" className="flex-shrink-0">
                {program.code}
              </Badge>
            </CardTitle>
            {program.description && (
              <CardDescription className="mt-2 line-clamp-2">
                {program.description}
              </CardDescription>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Badge variant="outline" className={getStatusBadgeColor(program.status)}>
              {program.status}
            </Badge>
            {program.isPublished ? (
              <Badge variant="outline" className="bg-green-500/10 text-green-500">
                <Eye className="h-3 w-3 mr-1" />
                Published
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-gray-500/10 text-gray-500">
                <EyeOff className="h-3 w-3 mr-1" />
                Draft
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      {showMetadata && (
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{program.department.name}</span>
            </div>

            <div className="flex items-center gap-4 flex-wrap text-sm">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-muted-foreground" />
                <Badge variant="outline" className={getCredentialBadgeColor(program.credential)}>
                  {program.credential}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {getDurationText(program.duration, program.durationUnit)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold">{totalLevels}</div>
                <div className="text-xs text-muted-foreground">Levels</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{totalCourses}</div>
                <div className="text-xs text-muted-foreground">Courses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{activeEnrollments}</div>
                <div className="text-xs text-muted-foreground">Enrolled</div>
              </div>
            </div>

            {'statistics' in program && (
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Completion Rate</span>
                  <span className="font-medium">
                    {Math.round(program.statistics.completionRate * 100)}%
                  </span>
                </div>
              </div>
            )}

            <div className="pt-4 border-t flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>Created {new Date(program.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
