/**
 * Student Progress Page
 * View all students with individual progress, filtering by course, and search functionality
 */

import React, { useState, useMemo } from 'react';
import { ProgressTable, type ProgressTableRow } from '@/widgets/analytics';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';
import { useToast } from '@/shared/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Search, Filter, Download, User, BookOpen, TrendingUp, Clock, Loader2 } from 'lucide-react';
import { useExportStudentProgress } from '@/entities/student';

// Mock data - Replace with actual API calls
const mockCourses = [
  { id: 'all', name: 'All Courses' },
  { id: '1', name: 'Introduction to React' },
  { id: '2', name: 'Advanced TypeScript' },
  { id: '3', name: 'Web Development Basics' },
  { id: '4', name: 'UI/UX Design Principles' },
];

const mockStudents: ProgressTableRow[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    course: 'Introduction to React',
    progress: 85,
    status: 'in-progress',
    lastActivity: '2 hours ago',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    course: 'Advanced TypeScript',
    progress: 100,
    status: 'completed',
    lastActivity: '1 day ago',
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    course: 'Web Development Basics',
    progress: 45,
    status: 'in-progress',
    lastActivity: '30 minutes ago',
  },
  {
    id: '4',
    name: 'Alice Williams',
    email: 'alice@example.com',
    course: 'UI/UX Design Principles',
    progress: 0,
    status: 'not-started',
    lastActivity: '3 days ago',
  },
  {
    id: '5',
    name: 'Charlie Brown',
    email: 'charlie@example.com',
    course: 'Introduction to React',
    progress: 78,
    status: 'in-progress',
    lastActivity: '1 hour ago',
  },
  {
    id: '6',
    name: 'Diana Prince',
    email: 'diana@example.com',
    course: 'Web Development Basics',
    progress: 92,
    status: 'in-progress',
    lastActivity: '4 hours ago',
  },
  {
    id: '7',
    name: 'Ethan Hunt',
    email: 'ethan@example.com',
    course: 'Advanced TypeScript',
    progress: 34,
    status: 'in-progress',
    lastActivity: '2 days ago',
  },
  {
    id: '8',
    name: 'Fiona Green',
    email: 'fiona@example.com',
    course: 'UI/UX Design Principles',
    progress: 100,
    status: 'completed',
    lastActivity: '5 hours ago',
  },
  {
    id: '9',
    name: 'George Miller',
    email: 'george@example.com',
    course: 'Introduction to React',
    progress: 12,
    status: 'in-progress',
    lastActivity: '6 hours ago',
  },
  {
    id: '10',
    name: 'Hannah Lee',
    email: 'hannah@example.com',
    course: 'Web Development Basics',
    progress: 67,
    status: 'in-progress',
    lastActivity: '1 hour ago',
  },
];

// Mock detailed student data
const getStudentDetails = (studentId: string) => {
  return {
    id: studentId,
    name: 'John Doe',
    email: 'john@example.com',
    enrolledCourses: [
      {
        id: '1',
        name: 'Introduction to React',
        progress: 85,
        lessonsCompleted: 17,
        totalLessons: 20,
        timeSpent: '12h 30m',
        averageScore: 88,
        status: 'in-progress' as const,
      },
      {
        id: '2',
        name: 'Advanced TypeScript',
        progress: 100,
        lessonsCompleted: 15,
        totalLessons: 15,
        timeSpent: '8h 45m',
        averageScore: 92,
        status: 'completed' as const,
      },
    ],
    overallProgress: 92,
    totalTimeSpent: '21h 15m',
    certificatesEarned: 1,
  };
};

export const StudentProgressPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const exportProgress = useExportStudentProgress();

  // Filter students based on search and filters
  const filteredStudents = useMemo(() => {
    return mockStudents.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCourse = selectedCourse === 'all' || student.course === mockCourses.find(c => c.id === selectedCourse)?.name;

      const matchesStatus = selectedStatus === 'all' || student.status === selectedStatus;

      return matchesSearch && matchesCourse && matchesStatus;
    });
  }, [searchQuery, selectedCourse, selectedStatus]);

  const handleStudentClick = (student: ProgressTableRow) => {
    setSelectedStudent(student.id);
  };

  const handleExportData = async () => {
    setIsExporting(true);

    try {
      const filters: any = {};
      if (selectedCourse !== 'all') {
        filters.courseId = selectedCourse;
      }
      if (selectedStatus !== 'all') {
        filters.status = selectedStatus;
      }

      const result = await exportProgress.mutateAsync({
        format: 'excel',
        filters,
        includeDetails: true,
      });

      // Download the file from the URL
      if (result.downloadUrl) {
        window.open(result.downloadUrl, '_blank');

        toast({
          title: 'Export successful',
          description: `Exported ${result.recordCount} student records. File: ${result.filename}`,
        });
      }
    } catch (error: any) {
      toast({
        title: 'Export failed',
        description: error.message || 'Failed to export student progress data.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const studentDetails = selectedStudent ? getStudentDetails(selectedStudent) : null;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Progress</h1>
          <p className="text-muted-foreground">
            Monitor and manage individual student progress
          </p>
        </div>
        <Button onClick={handleExportData} disabled={isExporting}>
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Export Data
            </>
          )}
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStudents.length}</div>
            <p className="text-xs text-muted-foreground">across all courses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Students</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockStudents.filter((s) => s.status === 'in-progress').length}
            </div>
            <p className="text-xs text-muted-foreground">currently learning</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockStudents.filter((s) => s.status === 'completed').length}
            </div>
            <p className="text-xs text-muted-foreground">finished courses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(
                mockStudents.reduce((sum, s) => sum + s.progress, 0) / mockStudents.length
              )}%
            </div>
            <p className="text-xs text-muted-foreground">across all students</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="w-[200px]">
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by course" />
                </SelectTrigger>
                <SelectContent>
                  {mockCourses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-[200px]">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="not-started">Not Started</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Showing {filteredStudents.length} of {mockStudents.length} students
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Student Table */}
      <ProgressTable
        title="All Students"
        description="Click on a student to view detailed progress"
        data={filteredStudents}
        onRowClick={handleStudentClick}
      />

      {/* Student Detail Modal */}
      <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
            <DialogDescription>
              Detailed progress information for {studentDetails?.name}
            </DialogDescription>
          </DialogHeader>
          {studentDetails && (
            <div className="space-y-6">
              {/* Student Info */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p className="text-lg font-semibold">{studentDetails.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-lg">{studentDetails.email}</p>
                </div>
              </div>

              {/* Overall Stats */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{studentDetails.overallProgress}%</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Total Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{studentDetails.totalTimeSpent}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Certificates</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{studentDetails.certificatesEarned}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Enrolled Courses */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Enrolled Courses</h3>
                <div className="space-y-4">
                  {studentDetails.enrolledCourses.map((course) => (
                    <Card key={course.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{course.name}</CardTitle>
                          <Badge
                            variant={
                              course.status === 'completed'
                                ? 'default'
                                : course.status === 'in-progress'
                                  ? 'secondary'
                                  : 'outline'
                            }
                          >
                            {course.status === 'completed'
                              ? 'Completed'
                              : course.status === 'in-progress'
                                ? 'In Progress'
                                : 'Not Started'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{course.progress}%</span>
                          </div>
                          <Progress value={course.progress} className="h-2" />
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Lessons Completed</p>
                            <p className="font-medium">
                              {course.lessonsCompleted} / {course.totalLessons}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Time Spent</p>
                            <p className="font-medium">{course.timeSpent}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Average Score</p>
                            <p className="font-medium">{course.averageScore}%</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
