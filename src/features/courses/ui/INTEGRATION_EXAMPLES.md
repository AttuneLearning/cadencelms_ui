# Course Preview Integration Examples

## Quick Start

### 1. Basic Preview Button
Add a preview button to any page where you have a course ID:

```typescript
import { CoursePreviewButton } from '@/features/courses/ui';

function MyCourseCard({ course }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{course.title}</CardTitle>
      </CardHeader>
      <CardFooter>
        <CoursePreviewButton courseId={course.id} />
      </CardFooter>
    </Card>
  );
}
```

### 2. Course List with Preview
Add preview to a course management list:

```typescript
import { CoursePreviewButton } from '@/features/courses/ui';
import { useCourses } from '@/entities/course/model/useCourse';

function CourseListPage() {
  const { data, isLoading } = useCourses();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      {data?.courses.map((course) => (
        <Card key={course.id}>
          <CardHeader>
            <CardTitle>{course.title}</CardTitle>
            <CardDescription>{course.code}</CardDescription>
          </CardHeader>
          <CardContent>
            <p>{course.description}</p>
          </CardContent>
          <CardFooter className="gap-2">
            <Button variant="outline">Edit</Button>
            <CoursePreviewButton courseId={course.id} />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
```

### 3. Course Editor Header
Add preview button to course editor toolbar:

```typescript
import { CoursePreviewButton } from '@/features/courses/ui';
import { Save, Eye, Settings } from 'lucide-react';

function CourseEditorHeader({ courseId, onSave }) {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <h1>Course Editor</h1>
      <div className="flex gap-2">
        <Button onClick={onSave}>
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
        <CoursePreviewButton courseId={courseId} />
        <Button variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>
    </div>
  );
}
```

### 4. Custom Preview Link
If you need more control over the navigation:

```typescript
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import { Eye } from 'lucide-react';

function CustomPreviewButton({ courseId, moduleId }) {
  const navigate = useNavigate();

  const handlePreview = () => {
    if (moduleId) {
      // Preview specific module
      navigate(`/staff/courses/${courseId}/preview/${moduleId}`);
    } else {
      // Preview course overview
      navigate(`/staff/courses/${courseId}/preview`);
    }
  };

  return (
    <Button onClick={handlePreview} variant="outline">
      <Eye className="h-4 w-4 mr-2" />
      Preview {moduleId ? 'Module' : 'Course'}
    </Button>
  );
}
```

## Advanced Examples

### 5. Dropdown Menu with Preview Option
Add preview to a dropdown menu:

```typescript
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { MoreVertical, Eye, Edit, Trash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function CourseActionsMenu({ course }) {
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => navigate(`/staff/courses/${course.id}/preview`)}>
          <Eye className="h-4 w-4 mr-2" />
          Preview as Learner
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate(`/staff/courses/${course.id}/edit`)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Course
        </DropdownMenuItem>
        <DropdownMenuItem className="text-destructive">
          <Trash className="h-4 w-4 mr-2" />
          Delete Course
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

### 6. Module List with Individual Preview
Preview specific modules from a module list:

```typescript
import { useCourseSegments } from '@/entities/course-segment/hooks/useCourseSegments';
import { useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';

function ModuleList({ courseId }) {
  const { data, isLoading } = useCourseSegments(courseId);
  const navigate = useNavigate();

  if (isLoading) return <div>Loading modules...</div>;

  return (
    <div className="space-y-2">
      {data?.modules.map((module) => (
        <Card key={module.id}>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">{module.title}</CardTitle>
              <CardDescription>{module.type}</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/staff/courses/${courseId}/preview/${module.id}`)}
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
```

### 7. Toast Notification with Preview Link
Show a toast after publishing with preview link:

```typescript
import { useToast } from '@/shared/ui/use-toast';
import { usePublishCourse } from '@/entities/course/model/useCourse';
import { useNavigate } from 'react-router-dom';

function PublishCourseButton({ courseId }) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const publishMutation = usePublishCourse();

  const handlePublish = async () => {
    try {
      await publishMutation.mutateAsync({ id: courseId });
      toast({
        title: 'Course Published',
        description: 'Your course is now live for learners.',
        action: (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/staff/courses/${courseId}/preview`)}
          >
            Preview
          </Button>
        ),
      });
    } catch (error) {
      toast({
        title: 'Publish Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return <Button onClick={handlePublish}>Publish Course</Button>;
}
```

### 8. Conditional Preview Button
Only show preview for published courses:

```typescript
import { CoursePreviewButton } from '@/features/courses/ui';
import { Badge } from '@/shared/ui/badge';

function CourseStatusCard({ course }) {
  const canPreview = course.status === 'published' || course.status === 'draft';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{course.title}</CardTitle>
          <Badge
            variant={course.status === 'published' ? 'success' : 'default'}
          >
            {course.status}
          </Badge>
        </div>
      </CardHeader>
      <CardFooter>
        {canPreview ? (
          <CoursePreviewButton courseId={course.id} />
        ) : (
          <Button variant="outline" disabled>
            Preview Unavailable
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
```

### 9. Table Row with Preview Action
Add preview to a data table:

```typescript
import { ColumnDef } from '@tanstack/react-table';
import { CoursePreviewButton } from '@/features/courses/ui';
import { Course } from '@/entities/course/model/types';

export const columns: ColumnDef<Course>[] = [
  {
    accessorKey: 'title',
    header: 'Course Title',
  },
  {
    accessorKey: 'code',
    header: 'Code',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <Badge variant={row.original.status === 'published' ? 'success' : 'default'}>
        {row.original.status}
      </Badge>
    ),
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Button variant="ghost" size="sm">
          Edit
        </Button>
        <CoursePreviewButton
          courseId={row.original.id}
          variant="ghost"
          size="sm"
        />
      </div>
    ),
  },
];
```

### 10. Breadcrumb Navigation with Preview
Add preview link to breadcrumbs:

```typescript
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/shared/ui/breadcrumb';
import { Eye } from 'lucide-react';

function CourseEditorBreadcrumb({ course }) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/staff/courses">Courses</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{course.title}</BreadcrumbPage>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href={`/staff/courses/${course.id}/preview`}>
            <Eye className="h-3 w-3 mr-1 inline" />
            Preview
          </BreadcrumbLink>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
```

## Using Individual Components

### 11. CourseNavigation Standalone
Use the navigation component in your own layouts:

```typescript
import { CourseNavigation } from '@/features/courses/ui';
import { useCourseSegments } from '@/entities/course-segment/hooks/useCourseSegments';
import { useState } from 'react';

function CustomCoursePage({ courseId }) {
  const { data } = useCourseSegments(courseId);
  const [currentModuleId, setCurrentModuleId] = useState<string>();
  const [simulatedProgress, setSimulatedProgress] = useState({});

  return (
    <div className="grid grid-cols-4 gap-6">
      <div className="col-span-1">
        <CourseNavigation
          modules={data?.modules || []}
          currentModuleId={currentModuleId}
          onModuleClick={setCurrentModuleId}
          simulatedProgress={simulatedProgress}
        />
      </div>
      <div className="col-span-3">
        {/* Your custom content here */}
      </div>
    </div>
  );
}
```

### 12. LessonPlayerPreview Standalone
Use the lesson player in a modal or custom view:

```typescript
import { LessonPlayerPreview } from '@/features/courses/ui';
import { useCourseSegment } from '@/entities/course-segment/hooks/useCourseSegments';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';

function ModulePreviewDialog({ courseId, moduleId, open, onClose }) {
  const { data: module } = useCourseSegment(courseId, moduleId);

  if (!module) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh]">
        <DialogHeader>
          <DialogTitle>Module Preview</DialogTitle>
        </DialogHeader>
        <LessonPlayerPreview
          module={module}
          onPrevious={() => {/* Handle previous */}}
          onNext={() => {/* Handle next */}}
          hasPrevious={true}
          hasNext={true}
        />
      </DialogContent>
    </Dialog>
  );
}
```

## Tips and Best Practices

1. **Always provide courseId**: The preview feature requires a valid course ID
2. **Check course status**: You may want to disable preview for archived courses
3. **Handle loading states**: Always handle loading and error states when fetching course data
4. **Customize button styles**: Use variant and size props to match your UI design
5. **Consider mobile**: The preview is responsive, but test on mobile devices
6. **Use toast notifications**: Inform users when navigating to preview mode
7. **Add analytics**: Track preview usage to understand staff behavior
8. **Provide context**: Add tooltips or hints about what preview mode shows
9. **Test with real data**: Use actual course content to test the preview
10. **Handle errors gracefully**: Show appropriate error messages if preview fails

## Common Patterns

### Pattern: Preview Button with Confirmation
```typescript
function PreviewWithConfirmation({ courseId, hasUnsavedChanges }) {
  const [showDialog, setShowDialog] = useState(false);
  const navigate = useNavigate();

  const handlePreview = () => {
    if (hasUnsavedChanges) {
      setShowDialog(true);
    } else {
      navigate(`/staff/courses/${courseId}/preview`);
    }
  };

  return (
    <>
      <Button onClick={handlePreview}>
        <Eye className="h-4 w-4 mr-2" />
        Preview
      </Button>
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Do you want to save before previewing?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => navigate(`/staff/courses/${courseId}/preview`)}>
              Preview Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
```

### Pattern: Preview with Analytics Tracking
```typescript
import { CoursePreviewButton } from '@/features/courses/ui';
import { analytics } from '@/shared/lib/analytics';

function TrackedPreviewButton({ courseId, courseName }) {
  const handleClick = () => {
    analytics.track('course_preview_clicked', {
      courseId,
      courseName,
      timestamp: new Date().toISOString(),
    });
  };

  return (
    <div onClick={handleClick}>
      <CoursePreviewButton courseId={courseId} />
    </div>
  );
}
```
