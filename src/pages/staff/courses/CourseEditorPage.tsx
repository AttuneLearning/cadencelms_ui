/**
 * Course Editor Page
 * Two-column layout for editing course details and organizing modules
 */

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Checkbox } from '@/shared/ui/checkbox';
import { Separator } from '@/shared/ui/separator';
import { useToast } from '@/shared/ui/use-toast';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import {
  useCourse,
  useCreateCourse,
  useUpdateCourse,
  usePublishCourse,
  useUnpublishCourse,
  type CreateCoursePayload,
  type UpdateCoursePayload,
  type CourseStatus,
} from '@/entities/course';
import {
  useCourseModules,
  useCreateCourseModule,
  useUpdateCourseModule,
  useDeleteCourseModule,
  useReorderCourseModules,
  type CourseModuleListItem,
  type CreateCourseModulePayload,
  type UpdateCourseModulePayload,
} from '@/entities/course-module';
import { ModuleList } from '@/features/courses/ui/ModuleList';
import { ModuleDialog } from '@/features/courses/ui/ModuleDialog';
import {
  ArrowLeft,
  Save,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Lock,
} from 'lucide-react';
import { PageHeader } from '@/shared/ui/page-header';
import { useAuthStore } from '@/features/auth/model/authStore';
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert';

// Form validation schema
const courseFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  code: z.string().regex(/^[A-Z]{2,4}[0-9]{3}$/, 'Format: 2-4 letters followed by 3 digits (e.g., WEB101)'),
  description: z.string().max(2000, 'Description must be less than 2000 characters').optional(),
  department: z.string().min(1, 'Department is required'),
  program: z.string().optional(),
  credits: z.number().min(0).max(10).optional(),
  duration: z.number().min(0).optional(),
  settings: z.object({
    allowSelfEnrollment: z.boolean(),
    passingScore: z.number().min(0).max(100),
    maxAttempts: z.number().min(1),
    certificateEnabled: z.boolean(),
  }),
});

type CourseFormData = z.infer<typeof courseFormSchema>;

type ModuleDialogState = {
  open: boolean;
  mode: 'create' | 'edit';
  module?: CourseModuleListItem;
};

type ConfirmDialogState = {
  open: boolean;
  type: 'delete-module' | 'publish' | 'unpublish' | null;
  module?: CourseModuleListItem;
};

export interface CourseEditorPageProps {
  defaultDepartmentId?: string;
}

export const CourseEditorPage: React.FC<CourseEditorPageProps> = ({ defaultDepartmentId }) => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const isNewCourse = courseId === 'new';

  // Check if user is billing-admin (read-only access)
  const isBillingAdmin = user?.roles?.includes('billing-admin');
  const isReadOnly = isBillingAdmin && !user?.roles?.includes('content-admin');

  // State
  const [moduleDialog, setModuleDialog] = React.useState<ModuleDialogState>({
    open: false,
    mode: 'create',
  });
  const [confirmDialog, setConfirmDialog] = React.useState<ConfirmDialogState>({
    open: false,
    type: null,
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);

  // Fetch course data
  const { data: course, isLoading: isLoadingCourse } = useCourse(
    courseId || '',
    { enabled: !isNewCourse }
  );

  // Fetch course segments
  const { data: segmentsData, isLoading: isLoadingSegments } = useCourseModules(
    courseId || '',
    undefined,
    { enabled: !isNewCourse }
  );

  // Mutations
  const createCourseMutation = useCreateCourse();
  const updateCourseMutation = useUpdateCourse();
  const publishMutation = usePublishCourse();
  const unpublishMutation = useUnpublishCourse();

  const createSegmentMutation = useCreateCourseModule();
  const updateSegmentMutation = useUpdateCourseModule();
  const deleteSegmentMutation = useDeleteCourseModule();
  const reorderSegmentsMutation = useReorderCourseModules();

  // Form
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: '',
      code: '',
      description: '',
      department: defaultDepartmentId || '',
      program: '',
      credits: 3,
      duration: 40,
      settings: {
        allowSelfEnrollment: false,
        passingScore: 70,
        maxAttempts: 3,
        certificateEnabled: false,
      },
    },
  });

  // Update form when course loads
  React.useEffect(() => {
    if (course) {
      setValue('title', course.title);
      setValue('code', course.code);
      setValue('description', course.description || '');
      setValue('department', course.department.id);
      setValue('program', course.program?.id || '');
      setValue('credits', course.credits || 3);
      setValue('duration', course.duration || 40);
      setValue('settings', course.settings);
    }
  }, [course, setValue]);

  // Track unsaved changes
  React.useEffect(() => {
    setHasUnsavedChanges(isDirty);
  }, [isDirty]);

  // Handlers - Course
  const handleSaveCourse = async (data: CourseFormData) => {
    try {
      const payload: CreateCoursePayload | UpdateCoursePayload = {
        title: data.title,
        code: data.code,
        description: data.description || undefined,
        department: data.department,
        program: data.program || undefined,
        credits: data.credits,
        duration: data.duration,
        settings: data.settings,
      };

      if (isNewCourse) {
        const newCourse = await createCourseMutation.mutateAsync(payload as CreateCoursePayload);
        toast({
          title: 'Course created',
          description: 'Your course has been successfully created.',
        });
        navigate(`/staff/courses/${newCourse.id}/edit`, { replace: true });
      } else {
        await updateCourseMutation.mutateAsync({
          id: courseId!,
          payload: payload as UpdateCoursePayload,
        });
        toast({
          title: 'Course saved',
          description: 'Your changes have been saved successfully.',
        });
        setHasUnsavedChanges(false);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save course. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handlePublishToggle = () => {
    if (!course) return;

    if (course.status === 'published') {
      setConfirmDialog({ open: true, type: 'unpublish' });
    } else {
      setConfirmDialog({ open: true, type: 'publish' });
    }
  };

  const handleConfirmPublish = async () => {
    if (!courseId) return;

    try {
      await publishMutation.mutateAsync({ id: courseId });
      toast({
        title: 'Course published',
        description: 'Your course is now visible to students.',
      });
      setConfirmDialog({ open: false, type: null });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to publish course.',
        variant: 'destructive',
      });
    }
  };

  const handleConfirmUnpublish = async () => {
    if (!courseId) return;

    try {
      await unpublishMutation.mutateAsync({ id: courseId });
      toast({
        title: 'Course unpublished',
        description: 'Your course is no longer visible to students.',
      });
      setConfirmDialog({ open: false, type: null });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to unpublish course.',
        variant: 'destructive',
      });
    }
  };

  // Handlers - Modules
  const handleAddModule = () => {
    setModuleDialog({
      open: true,
      mode: 'create',
      module: undefined,
    });
  };

  const handleEditModule = (module: CourseModuleListItem) => {
    setModuleDialog({
      open: true,
      mode: 'edit',
      module,
    });
  };

  const handleDeleteModule = (module: CourseModuleListItem) => {
    setConfirmDialog({
      open: true,
      type: 'delete-module',
      module,
    });
  };

  const handleConfirmDeleteModule = async () => {
    if (!courseId || !confirmDialog.module) return;

    try {
      await deleteSegmentMutation.mutateAsync({
        courseId,
        moduleId: confirmDialog.module.id,
      });
      toast({
        title: 'Module deleted',
        description: 'The module has been successfully deleted.',
      });
      setConfirmDialog({ open: false, type: null });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete module.',
        variant: 'destructive',
      });
    }
  };

  const handleModuleSubmit = async (
    data: CreateCourseModulePayload | UpdateCourseModulePayload
  ) => {
    if (!courseId || isNewCourse) return;

    try {
      if (moduleDialog.mode === 'create') {
        await createSegmentMutation.mutateAsync({
          courseId,
          payload: data as CreateCourseModulePayload,
        });
        toast({
          title: 'Module added',
          description: 'The module has been successfully added.',
        });
      } else if (moduleDialog.module) {
        await updateSegmentMutation.mutateAsync({
          courseId,
          moduleId: moduleDialog.module.id,
          payload: data as UpdateCourseModulePayload,
        });
        toast({
          title: 'Module updated',
          description: 'The module has been successfully updated.',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save module.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleReorderModules = async (reorderedModules: CourseModuleListItem[]) => {
    if (!courseId || isNewCourse) return;

    try {
      await reorderSegmentsMutation.mutateAsync({
        courseId,
        payload: {
          moduleIds: reorderedModules.map((m) => m.id),
        },
      });
      toast({
        title: 'Modules reordered',
        description: 'Module order has been updated.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reorder modules.',
        variant: 'destructive',
      });
    }
  };

  const handleBack = () => {
    if (hasUnsavedChanges) {
      if (
        window.confirm(
          'You have unsaved changes. Are you sure you want to leave?'
        )
      ) {
        navigate('/staff/courses');
      }
    } else {
      navigate('/staff/courses');
    }
  };

  // Loading state
  if (!isNewCourse && (isLoadingCourse || isLoadingSegments)) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const modules = segmentsData?.modules || [];
  const nextModuleOrder = modules.length + 1;
  const courseStatus = course?.status;

  return (
    <div className="space-y-6 p-8">
      <PageHeader
        title={isNewCourse ? 'Create Course' : 'Edit Course'}
        description={
          course ? (
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={getStatusVariant(course.status)}>
                {formatStatus(course.status)}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {course.code}
              </span>
            </div>
          ) : undefined
        }
        backButton={
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        }
      >
        {hasUnsavedChanges && (
          <Badge variant="secondary" className="mr-2">
            <AlertCircle className="mr-1 h-3 w-3" />
            Unsaved changes
          </Badge>
        )}

        {!isNewCourse && course && (
          <Button
            variant={courseStatus === 'published' ? 'outline' : 'default'}
            onClick={handlePublishToggle}
            disabled={isReadOnly || publishMutation.isPending || unpublishMutation.isPending}
          >
            {courseStatus === 'published' ? (
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
          </Button>
        )}

        <Button
          onClick={handleSubmit(handleSaveCourse)}
          disabled={
            isReadOnly || createCourseMutation.isPending || updateCourseMutation.isPending
          }
        >
          {(createCourseMutation.isPending || updateCourseMutation.isPending) && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          <Save className="mr-2 h-4 w-4" />
          {isNewCourse ? 'Create Course' : 'Save Changes'}
        </Button>
      </PageHeader>

      {/* Read-only Alert */}
      {isReadOnly && (
        <Alert variant="default" className="border-amber-600 bg-amber-50">
          <Lock className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-900">Read-Only Access</AlertTitle>
          <AlertDescription className="text-amber-800">
            You have view-only access to courses. Contact your administrator if you need edit permissions.
          </AlertDescription>
        </Alert>
      )}

      {/* Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column - Course Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Details</CardTitle>
              <CardDescription>
                Basic information about the course
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Course Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  {...register('title')}
                  placeholder="e.g., Introduction to Web Development"
                  disabled={isReadOnly}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">
                  Course Code <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="code"
                  {...register('code')}
                  placeholder="e.g., WEB101"
                  className="font-mono uppercase"
                  disabled={isReadOnly || !isNewCourse}
                />
                {errors.code && (
                  <p className="text-sm text-destructive">{errors.code.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Format: 2-4 uppercase letters followed by 3 digits
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Describe what students will learn"
                  rows={4}
                  disabled={isReadOnly}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="credits">Credits</Label>
                  <Input
                    id="credits"
                    type="number"
                    {...register('credits', { valueAsNumber: true })}
                    min={0}
                    max={10}
                    disabled={isReadOnly}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (hours)</Label>
                  <Input
                    id="duration"
                    type="number"
                    {...register('duration', { valueAsNumber: true })}
                    min={0}
                    disabled={isReadOnly}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">
                  Department <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="department"
                  {...register('department')}
                  placeholder="Department ID"
                  disabled={isReadOnly}
                />
                {errors.department && (
                  <p className="text-sm text-destructive">{errors.department.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="program">Program</Label>
                <Input
                  id="program"
                  {...register('program')}
                  disabled={isReadOnly}
                  placeholder="Program ID (optional)"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Course Settings</CardTitle>
              <CardDescription>
                Configure enrollment and completion requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="allowSelfEnrollment">Allow Self-Enrollment</Label>
                  <p className="text-sm text-muted-foreground">
                    Students can enroll without instructor approval
                  </p>
                </div>
                <Checkbox
                  id="allowSelfEnrollment"
                  checked={watch('settings.allowSelfEnrollment')}
                  onCheckedChange={(checked) =>
                    setValue('settings.allowSelfEnrollment', checked as boolean, {
                      shouldDirty: true,
                    })
                  }
                  disabled={isReadOnly}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="passingScore">Passing Score (%)</Label>
                <Input
                  id="passingScore"
                  type="number"
                  {...register('settings.passingScore', { valueAsNumber: true })}
                  min={0}
                  max={100}
                  disabled={isReadOnly}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxAttempts">Maximum Attempts</Label>
                <Input
                  id="maxAttempts"
                  type="number"
                  {...register('settings.maxAttempts', { valueAsNumber: true })}
                  min={1}
                  disabled={isReadOnly}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="certificateEnabled">Enable Certificate</Label>
                  <p className="text-sm text-muted-foreground">
                    Award certificate upon completion
                  </p>
                </div>
                <Checkbox
                  id="certificateEnabled"
                  checked={watch('settings.certificateEnabled')}
                  onCheckedChange={(checked) =>
                    setValue('settings.certificateEnabled', checked as boolean, {
                      shouldDirty: true,
                    })
                  }
                  disabled={isReadOnly}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Module Organizer */}
        <div>
          {isNewCourse ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold">Save course first</h3>
                <p className="text-center text-muted-foreground">
                  Create the course before adding modules
                </p>
              </CardContent>
            </Card>
          ) : (
            <ModuleList
              modules={modules}
              onReorder={handleReorderModules}
              onEdit={handleEditModule}
              onDelete={handleDeleteModule}
              onAdd={handleAddModule}
              disabled={isReadOnly}
              isLoading={
                createSegmentMutation.isPending ||
                updateSegmentMutation.isPending ||
                deleteSegmentMutation.isPending ||
                reorderSegmentsMutation.isPending
              }
            />
          )}
        </div>
      </div>

      {/* Module Dialog */}
      <ModuleDialog
        open={moduleDialog.open}
        onOpenChange={(open) =>
          setModuleDialog((prev) => ({ ...prev, open }))
        }
        mode={moduleDialog.mode}
        module={moduleDialog.module}
        nextOrder={nextModuleOrder}
        onSubmit={handleModuleSubmit}
        isLoading={createSegmentMutation.isPending || updateSegmentMutation.isPending}
      />

      {/* Confirm Dialogs */}
      <ConfirmDialog
        open={confirmDialog.open && confirmDialog.type === 'delete-module'}
        onOpenChange={(open) =>
          setConfirmDialog((prev) => ({ ...prev, open }))
        }
        onConfirm={handleConfirmDeleteModule}
        title="Delete Module"
        description={`Are you sure you want to delete "${confirmDialog.module?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        isDestructive
        isLoading={deleteSegmentMutation.isPending}
      />

      <ConfirmDialog
        open={confirmDialog.open && confirmDialog.type === 'publish'}
        onOpenChange={(open) =>
          setConfirmDialog((prev) => ({ ...prev, open }))
        }
        onConfirm={handleConfirmPublish}
        title="Publish Course"
        description="Are you sure you want to publish this course? It will become visible to students."
        confirmText="Publish"
        isLoading={publishMutation.isPending}
      />

      <ConfirmDialog
        open={confirmDialog.open && confirmDialog.type === 'unpublish'}
        onOpenChange={(open) =>
          setConfirmDialog((prev) => ({ ...prev, open }))
        }
        onConfirm={handleConfirmUnpublish}
        title="Unpublish Course"
        description="Are you sure you want to unpublish this course? It will no longer be visible to students."
        confirmText="Unpublish"
        isLoading={unpublishMutation.isPending}
      />
    </div>
  );
};

// Helper functions
function formatStatus(status: CourseStatus): string {
  switch (status) {
    case 'draft':
      return 'Draft';
    case 'published':
      return 'Published';
    case 'archived':
      return 'Archived';
    default:
      return status;
  }
}

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
