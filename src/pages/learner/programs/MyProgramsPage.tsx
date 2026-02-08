/**
 * MyProgramsPage
 * Display learner's enrolled programs with progress
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMyPrograms } from '@/entities/program';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';
import { PageHeader } from '@/shared/ui/page-header';
import { GraduationCap, ArrowRight, Award, Calendar } from 'lucide-react';
import type { LearnerProgram } from '@/entities/program/api/learnerProgramApi';

const ProgramCard: React.FC<{ program: LearnerProgram }> = ({ program }) => {
  const statusColors = {
    active: 'bg-blue-500',
    completed: 'bg-green-500',
    withdrawn: 'bg-gray-500',
  };

  const credentialLabels = {
    certificate: 'Certificate',
    diploma: 'Diploma',
    degree: 'Degree',
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2">{program.name}</CardTitle>
            <CardDescription className="line-clamp-2">{program.description}</CardDescription>
          </div>
          <Badge variant="outline" className="ml-2">
            {credentialLabels[program.credential]}
          </Badge>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-3">
          <div className="flex items-center gap-1">
            <GraduationCap className="h-4 w-4" />
            <span>{program.department.name}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>
              {program.duration} {program.durationUnit}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Progress Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Overall Progress</span>
              <span className="text-muted-foreground">{program.enrollment.progress}%</span>
            </div>
            <Progress value={program.enrollment.progress} className="h-2" />
          </div>

          {/* Course Completion Stats */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Courses Completed</span>
            <span className="font-semibold">
              {program.coursesCompleted} / {program.coursesTotal}
            </span>
          </div>

          {/* Certificate Info */}
          {program.certificate?.enabled && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Award className="h-4 w-4" />
              <span>Certificate available upon completion</span>
            </div>
          )}

          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${statusColors[program.enrollment.status]}`} />
            <span className="text-sm capitalize">{program.enrollment.status}</span>
          </div>

          {/* Action Button */}
          <Button asChild className="w-full" variant={program.enrollment.status === 'completed' ? 'outline' : 'default'}>
            <Link to={`/learner/programs/${program.id}`}>
              {program.enrollment.status === 'completed' ? 'View Details' : 'Continue Learning'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const MyProgramsPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const { data, isLoading, error } = useMyPrograms({
    page: currentPage,
    limit: 12,
  });

  const programs = data?.programs || [];
  const pagination = data?.pagination;

  return (
    <div className="container mx-auto py-8 px-4">
      <PageHeader
        title="My Programs"
        description="Track your progress across structured learning paths"
        className="mb-8"
      />

      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              <p className="font-semibold">Error loading programs</p>
              <p className="text-sm mt-1">
                {error instanceof Error ? error.message : 'An error occurred'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <div data-testid="loading-skeleton">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-2 w-full mb-4" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && programs.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                You haven't enrolled in any programs yet
              </h3>
              <p className="text-muted-foreground mb-4">
                Programs are structured learning paths that guide you through a series of courses
              </p>
              <Button asChild>
                <Link to="/learner/catalog">Browse Catalog</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Program Grid */}
      {!isLoading && !error && programs.length > 0 && (
        <>
          <div className="mb-4 text-sm text-muted-foreground">
            Showing {programs.length} of {pagination?.total || 0} programs
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((program) => (
              <ProgramCard key={program.id} program={program} />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => p - 1)}
                  disabled={!pagination.hasPrev}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={!pagination.hasNext}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
