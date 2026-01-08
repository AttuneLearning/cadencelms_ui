/**
 * Course Management Page
 * Admin interface for managing courses with CRUD operations
 */

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { type ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { DataTable } from '@/shared/ui/data-table';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Checkbox } from '@/shared/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { useToast } from '@/shared/ui/use-toast';
import { type Course, type CourseStatus } from '@/entities/course/model/types';
import { MoreHorizontal, Plus, Trash, Edit, Eye, EyeOff } from 'lucide-react';
import { CourseFormDialog } from '@/features/course-management';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { client } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';

interface CourseListResponse {
  courses: Course[];
  total: number;
}

const fetchCourses = async (): Promise<CourseListResponse> => {
  const response = await client.get(endpoints.admin.courses.list);
  return response.data;
};

const deleteCourse = async (id: string): Promise<void> => {
  await client.delete(endpoints.admin.courses.delete(id));
};

const bulkDeleteCourses = async (ids: string[]): Promise<void> => {
  await client.post(`${endpoints.admin.courses.list}/bulk-delete`, { ids });
};

const updateCourseStatus = async (id: string, status: CourseStatus): Promise<Course> => {
  const response = await client.patch(endpoints.admin.courses.update(id), { status });
  return response.data;
};

export const CourseManagementPage: React.FC = () => {
  const [selectedCourses, setSelectedCourses] = React.useState<Course[]>([]);
  const [courseToEdit, setCourseToEdit] = React.useState<Course | null>(null);
  const [courseToDelete, setCourseToDelete] = React.useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = React.useState(false);
  const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = React.useState(false);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch courses
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'courses'],
    queryFn: fetchCourses,
  });

  // Delete course mutation
  const deleteMutation = useMutation({
    mutationFn: deleteCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] });
      toast({
        title: 'Course deleted',
        description: 'Course has been successfully deleted.',
      });
      setIsDeleteConfirmOpen(false);
      setCourseToDelete(null);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete course. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: bulkDeleteCourses,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] });
      toast({
        title: 'Courses deleted',
        description: `${selectedCourses.length} course(s) have been successfully deleted.`,
      });
      setSelectedCourses([]);
      setIsBulkDeleteConfirmOpen(false);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete courses. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: CourseStatus }) =>
      updateCourseStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] });
      toast({
        title: 'Status updated',
        description: `Course has been ${variables.status === 'published' ? 'published' : 'unpublished'}.`,
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update course status. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleDelete = (id: string) => {
    setCourseToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  const handleBulkDelete = () => {
    setIsBulkDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (courseToDelete) {
      deleteMutation.mutate(courseToDelete);
    }
  };

  const confirmBulkDelete = () => {
    const ids = selectedCourses.map((course) => course._id);
    bulkDeleteMutation.mutate(ids);
  };

  const togglePublish = (course: Course) => {
    const newStatus: CourseStatus = course.status === 'published' ? 'draft' : 'published';
    updateStatusMutation.mutate({ id: course._id, status: newStatus });
  };

  // Define columns
  const columns: ColumnDef<Course>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'title',
      header: 'Course',
      cell: ({ row }) => {
        const course = row.original;
        return (
          <div className="flex items-center gap-3">
            {course.thumbnail && (
              <img
                src={course.thumbnail}
                alt={course.title}
                className="h-10 w-10 rounded object-cover"
              />
            )}
            <div>
              <div className="font-medium">{course.title}</div>
              {course.shortDescription && (
                <div className="line-clamp-1 text-sm text-muted-foreground">
                  {course.shortDescription}
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        return <Badge variant={getStatusVariant(status)}>{status}</Badge>;
      },
    },
    {
      accessorKey: 'level',
      header: 'Level',
      cell: ({ row }) => {
        const level = row.original.level;
        if (!level) return <span className="text-muted-foreground">-</span>;
        return <Badge variant="secondary">{level}</Badge>;
      },
    },
    {
      accessorKey: 'lessonCount',
      header: 'Lessons',
      cell: ({ row }) => {
        const count = row.original.lessonCount;
        return count ?? 0;
      },
    },
    {
      accessorKey: 'enrollmentCount',
      header: 'Enrollments',
      cell: ({ row }) => {
        const count = row.original.enrollmentCount;
        return count ?? 0;
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => {
        const created = row.original.createdAt;
        return format(new Date(created), 'MMM dd, yyyy');
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const course = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setCourseToEdit(course)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Course
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => togglePublish(course)}>
                {course.status === 'published' ? (
                  <>
                    <EyeOff className="mr-2 h-4 w-4" />
                    Unpublish
                  </>
                ) : (
                  <>
                    <Eye className="mr-2 h-4 w-4" />
                    Publish
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDelete(course._id)}
                className="text-destructive"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete Course
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Course Management</h1>
          <p className="text-muted-foreground">Manage courses and content</p>
        </div>
        <div className="flex items-center gap-2">
          {selectedCourses.length > 0 && (
            <Button variant="destructive" onClick={handleBulkDelete}>
              <Trash className="mr-2 h-4 w-4" />
              Delete Selected ({selectedCourses.length})
            </Button>
          )}
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Course
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={data?.courses || []}
        searchable
        searchPlaceholder="Search courses..."
        onRowSelectionChange={setSelectedCourses}
      />

      {/* Create/Edit Dialog */}
      <CourseFormDialog
        open={isCreateDialogOpen || !!courseToEdit}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false);
            setCourseToEdit(null);
          }
        }}
        course={courseToEdit || undefined}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        onConfirm={confirmDelete}
        title="Delete Course"
        description="Are you sure you want to delete this course? This action cannot be undone and will remove all associated lessons and enrollments."
        confirmText="Delete"
        isDestructive
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmDialog
        open={isBulkDeleteConfirmOpen}
        onOpenChange={setIsBulkDeleteConfirmOpen}
        onConfirm={confirmBulkDelete}
        title="Delete Multiple Courses"
        description={`Are you sure you want to delete ${selectedCourses.length} course(s)? This action cannot be undone and will remove all associated content.`}
        confirmText="Delete All"
        isDestructive
      />
    </div>
  );
};

// Helper function
function getStatusVariant(status: CourseStatus): 'default' | 'secondary' | 'destructive' {
  switch (status) {
    case 'published':
      return 'default';
    case 'draft':
      return 'secondary';
    case 'archived':
      return 'destructive';
    default:
      return 'secondary';
  }
}
