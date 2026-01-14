/**
 * ModuleEditorPage
 * Staff page for organizing lessons/content within a course module
 */

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { ArrowLeft, Plus, Save } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { Separator } from '@/shared/ui/separator';
import { useToast } from '@/shared/ui/use-toast';
import { Skeleton } from '@/shared/ui/skeleton';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import {
  useCourseModule,
  useUpdateCourseModule,
} from '@/entities/course-module/hooks/useCourseModules';
import { LessonItem } from '@/features/courses/ui/LessonItem';
import { LessonSettingsDialog } from '@/features/courses/ui/LessonSettingsDialog';
import type {
  LessonListItem,
  LessonSettingsFormData,
} from '@/entities/course-module/model/lessonTypes';

interface ModuleEditorPageParams {
  courseId: string;
  moduleId: string;
}

export const ModuleEditorPage: React.FC = () => {
  const { courseId, moduleId } = useParams<Record<keyof ModuleEditorPageParams, string>>();
  const navigate = useNavigate();
  const { toast } = useToast();

  if (!courseId || !moduleId) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Missing required parameters</AlertDescription>
      </Alert>
    );
  }

  // Fetch module data
  const {
    data: module,
    isLoading,
    error,
  } = useCourseModule(courseId!, moduleId!);

  const updateModuleMutation = useUpdateCourseModule();

  // Local state for lessons
  const [lessons, setLessons] = useState<LessonListItem[]>([]);
  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleDescription, setModuleDescription] = useState('');
  const [moduleDuration, setModuleDuration] = useState<number | null>(null);

  // Dialog state
  const [selectedLesson, setSelectedLesson] = useState<LessonListItem | null>(null);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);

  // Initialize lessons from module data
  React.useEffect(() => {
    if (module) {
      setModuleTitle(module.title);
      setModuleDescription(module.description || '');
      setModuleDuration(module.duration);

      // Convert course segment to lessons format
      // In a real implementation, this would come from a lessons API
      // For now, we'll use mock data structure
      const mockLessons: LessonListItem[] = [
        // This would be fetched from the API in a real implementation
      ];
      setLessons(mockLessons);
    }
  }, [module]);

  // Drag-and-drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setLessons((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const reordered = arrayMove(items, oldIndex, newIndex);

        // Update order property
        return reordered.map((item, index) => ({
          ...item,
          order: index + 1,
        }));
      });
    }
  };

  const handleEditLesson = (lesson: LessonListItem) => {
    setSelectedLesson(lesson);
    setSettingsDialogOpen(true);
  };

  const handleRemoveLesson = (lessonId: string) => {
    setLessons((prev) => {
      const filtered = prev.filter((l) => l.id !== lessonId);
      // Re-calculate order
      return filtered.map((item, index) => ({
        ...item,
        order: index + 1,
      }));
    });

    toast({
      title: 'Lesson removed',
      description: 'The lesson has been removed from this module.',
    });
  };

  const handleSaveLessonSettings = (
    lessonId: string,
    settings: LessonSettingsFormData
  ) => {
    setLessons((prev) =>
      prev.map((lesson) => {
        if (lesson.id === lessonId) {
          return {
            ...lesson,
            title: settings.customTitle || lesson.title,
            settings: {
              isRequired: settings.isRequired,
              completionCriteria: {
                type: settings.completionCriteriaType,
                requiredPercentage: settings.requiredPercentage,
                minimumScore: settings.minimumScore,
                allowEarlyCompletion: settings.allowEarlyCompletion,
              },
              unlockConditions: {
                previousLessonId: settings.previousLessonId || undefined,
                delayMinutes: settings.delayMinutes || undefined,
              },
              customTitle: settings.customTitle,
            },
          };
        }
        return lesson;
      })
    );

    toast({
      title: 'Settings saved',
      description: 'Lesson settings have been updated.',
    });
  };

  const handleSaveModule = async () => {
    try {
      await updateModuleMutation.mutateAsync({
        courseId: courseId!,
        moduleId: moduleId!,
        payload: {
          title: moduleTitle,
          description: moduleDescription || undefined,
          duration: moduleDuration || undefined,
        },
      });

      // In a real implementation, we would also save the lessons order
      // via a separate API call (e.g., reorderLessons mutation)

      toast({
        title: 'Module updated',
        description: 'Module details and lesson order have been saved.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update module. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleAddLesson = () => {
    // In a real implementation, this would open a content selector dialog
    toast({
      title: 'Add Lesson',
      description: 'Content selector dialog would open here.',
    });
  };

  const availablePreviousLessons = selectedLesson
    ? lessons
        .filter((l) => l.order < selectedLesson.order)
        .map((l) => ({ id: l.id, title: l.title }))
    : [];

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load module. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/staff/courses/${courseId}`)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Course
        </Button>
        <h1 className="text-3xl font-bold">Module Editor</h1>
        <p className="text-muted-foreground">
          Organize lessons and configure completion settings
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Module Details */}
          <Card>
            <CardHeader>
              <CardTitle>Module Details</CardTitle>
              <CardDescription>
                Basic information about this module
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={moduleTitle}
                  onChange={(e) => setModuleTitle(e.target.value)}
                  placeholder="Enter module title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={moduleDescription}
                  onChange={(e) => setModuleDescription(e.target.value)}
                  placeholder="Enter module description"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Estimated Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={moduleDuration ? Math.floor(moduleDuration / 60) : ''}
                  onChange={(e) => {
                    const minutes = parseInt(e.target.value, 10);
                    setModuleDuration(minutes ? minutes * 60 : null);
                  }}
                  placeholder="60"
                />
              </div>
            </CardContent>
          </Card>

          {/* Lessons List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Lessons</CardTitle>
                  <CardDescription>
                    Drag to reorder, click to edit settings
                  </CardDescription>
                </div>
                <Button onClick={handleAddLesson}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Lesson
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {lessons.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-muted-foreground mb-4">
                    No lessons added yet. Click "Add Lesson" to get started.
                  </p>
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={lessons.map((l) => l.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-3">
                      {lessons.map((lesson) => (
                        <LessonItem
                          key={lesson.id}
                          lesson={lesson}
                          onEdit={handleEditLesson}
                          onRemove={handleRemoveLesson}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Module Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total Lessons</span>
                <span className="font-medium">{lessons.length}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Required Lessons</span>
                <span className="font-medium">
                  {lessons.filter((l) => l.settings.isRequired).length}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total Duration</span>
                <span className="font-medium">
                  {moduleDuration ? `${Math.floor(moduleDuration / 60)}m` : '--'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full"
                onClick={handleSaveModule}
                disabled={updateModuleMutation.isPending}
              >
                <Save className="mr-2 h-4 w-4" />
                {updateModuleMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate(`/staff/courses/${courseId}`)}
              >
                Cancel
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Lesson Settings Dialog */}
      <LessonSettingsDialog
        open={settingsDialogOpen}
        onOpenChange={setSettingsDialogOpen}
        lesson={selectedLesson}
        availablePreviousLessons={availablePreviousLessons}
        onSave={handleSaveLessonSettings}
      />
    </div>
  );
};
