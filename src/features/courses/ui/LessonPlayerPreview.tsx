/**
 * Lesson Player Preview Component
 * Preview different content types in read-only mode
 * Simulates the learner experience without tracking actual progress
 */

import { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Play,
  Pause,
  Volume2,
  Maximize,
  FileText,
  Video,
  Package,
  ClipboardList,
  Lock,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { CourseModule, CourseModuleListItem } from '@/entities/course-module/model/types';

interface LessonPlayerPreviewProps {
  module: CourseModule | CourseModuleListItem;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
  isLocked?: boolean;
  className?: string;
}

export function LessonPlayerPreview({
  module,
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false,
  isLocked = false,
  className,
}: LessonPlayerPreviewProps) {
  const [simulatedProgress, setSimulatedProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleCompleteSimulation = () => {
    setSimulatedProgress(100);
    setIsCompleted(true);
  };

  const handleStartSimulation = () => {
    setIsPlaying(true);
    // Simulate progress
    let progress = simulatedProgress;
    const interval = setInterval(() => {
      progress += 10;
      setSimulatedProgress(progress);
      if (progress >= 100) {
        setSimulatedProgress(100);
        setIsPlaying(false);
        clearInterval(interval);
      }
    }, 1000);
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'scorm':
        return <Package className="h-5 w-5" />;
      case 'video':
        return <Video className="h-5 w-5" />;
      case 'document':
        return <FileText className="h-5 w-5" />;
      case 'exercise':
        return <ClipboardList className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const renderContentPreview = () => {
    if (isLocked) {
      return (
        <div className="flex flex-col items-center justify-center h-96 bg-muted/30 rounded-lg">
          <Lock className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Module Locked</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            Complete the previous modules to unlock this content.
          </p>
        </div>
      );
    }

    switch (module.type) {
      case 'scorm':
        return (
          <div className="space-y-4">
            <div className="aspect-video bg-muted rounded-lg flex flex-col items-center justify-center p-8">
              <Package className="h-20 w-20 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">SCORM Package Preview</h3>
              <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
                This is a preview of a SCORM package. In the learner view, this would launch the
                interactive SCORM content in a player.
              </p>
              <Badge variant="outline" className="text-xs">
                Read-Only Preview Mode
              </Badge>
            </div>
            <Alert>
              <Eye className="h-4 w-4" />
              <AlertDescription>
                Learners will experience the full interactive SCORM content with progress tracking
                and scoring.
              </AlertDescription>
            </Alert>
          </div>
        );

      case 'video':
        return (
          <div className="space-y-4">
            <div className="aspect-video bg-black rounded-lg flex items-center justify-center relative">
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Video className="h-20 w-20 text-white/80 mb-4" />
                <p className="text-white/80 text-sm mb-6">Video Preview</p>
                <Button
                  size="lg"
                  onClick={handleStartSimulation}
                  disabled={isPlaying || simulatedProgress === 100}
                  className="bg-white/90 text-black hover:bg-white"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="h-5 w-5 mr-2" />
                      Playing...
                    </>
                  ) : simulatedProgress === 100 ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 mr-2" />
                      Completed
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5 mr-2" />
                      Play Preview
                    </>
                  )}
                </Button>
              </div>
              {simulatedProgress > 0 && (
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="flex items-center gap-3 text-white">
                    <Button size="sm" variant="ghost" className="text-white hover:text-white">
                      {isPlaying ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    <div className="flex-1">
                      <Progress value={simulatedProgress} className="h-1 bg-white/20" />
                    </div>
                    <span className="text-xs">{simulatedProgress}%</span>
                    <Volume2 className="h-4 w-4" />
                    <Maximize className="h-4 w-4" />
                  </div>
                </div>
              )}
            </div>
            <Alert>
              <Eye className="h-4 w-4" />
              <AlertDescription>
                Learners will see the actual video with full playback controls and progress tracking.
              </AlertDescription>
            </Alert>
          </div>
        );

      case 'document':
        return (
          <div className="space-y-4">
            <div className="bg-muted rounded-lg p-8 min-h-96">
              <div className="bg-white rounded shadow-sm p-8 max-w-3xl mx-auto">
                <div className="flex items-start gap-4 mb-6">
                  <FileText className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="text-xl font-bold mb-2">Document Preview</h3>
                    <p className="text-sm text-muted-foreground">
                      This is a preview of document content (PDF, images, or other files).
                    </p>
                  </div>
                </div>
                <div className="space-y-4 text-sm">
                  <p className="leading-relaxed">
                    In the learner view, the actual document would be displayed here using a
                    document viewer that supports:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>PDF viewing with zoom and navigation controls</li>
                    <li>Image display with zoom and pan capabilities</li>
                    <li>Document download options</li>
                    <li>Progress tracking as learners scroll through content</li>
                  </ul>
                  <div className="mt-6 p-4 bg-muted rounded">
                    <p className="text-xs text-muted-foreground italic">
                      Document content would be rendered here...
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <Alert>
              <Eye className="h-4 w-4" />
              <AlertDescription>
                Learners will see the full document with navigation and reading progress tracking.
              </AlertDescription>
            </Alert>
          </div>
        );

      case 'exercise':
        return (
          <div className="space-y-4">
            <div className="bg-muted rounded-lg p-8">
              <div className="bg-white rounded shadow-sm p-6 max-w-2xl mx-auto">
                <div className="flex items-start gap-4 mb-6">
                  <ClipboardList className="h-8 w-8 text-primary" />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">Exercise/Quiz Preview</h3>
                    <p className="text-sm text-muted-foreground">
                      Interactive assessment with questions and feedback
                    </p>
                  </div>
                  {module.passingScore && (
                    <Badge variant="outline">Passing: {module.passingScore}%</Badge>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="p-4 border rounded-lg">
                    <p className="font-medium mb-4">Example Question 1</p>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 p-2 rounded hover:bg-muted cursor-pointer">
                        <input type="radio" name="q1" className="text-primary" />
                        <span className="text-sm">Option A</span>
                      </label>
                      <label className="flex items-center gap-2 p-2 rounded hover:bg-muted cursor-pointer">
                        <input type="radio" name="q1" className="text-primary" />
                        <span className="text-sm">Option B</span>
                      </label>
                      <label className="flex items-center gap-2 p-2 rounded hover:bg-muted cursor-pointer">
                        <input type="radio" name="q1" className="text-primary" />
                        <span className="text-sm">Option C</span>
                      </label>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <p className="font-medium mb-4">Example Question 2</p>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 p-2 rounded hover:bg-muted cursor-pointer">
                        <input type="checkbox" className="text-primary" />
                        <span className="text-sm">Option A</span>
                      </label>
                      <label className="flex items-center gap-2 p-2 rounded hover:bg-muted cursor-pointer">
                        <input type="checkbox" className="text-primary" />
                        <span className="text-sm">Option B</span>
                      </label>
                    </div>
                  </div>

                  {module.settings.showFeedback && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Immediate feedback is enabled for this exercise
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            </div>
            <Alert>
              <Eye className="h-4 w-4" />
              <AlertDescription>
                Learners will see the actual quiz questions with scoring, feedback, and attempt
                tracking.
              </AlertDescription>
            </Alert>
          </div>
        );

      default:
        return (
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">Content preview not available</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <Card className="flex-1 flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              {getContentTypeIcon(module.type)}
              <div className="flex-1 min-w-0">
                <CardTitle className="text-xl mb-1">{module.title}</CardTitle>
                {module.description && (
                  <CardDescription className="mt-2">{module.description}</CardDescription>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Badge variant="outline" className="capitalize">
                {module.type}
              </Badge>
              {!module.isPublished && (
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500">
                  Draft
                </Badge>
              )}
              {isLocked && (
                <Badge variant="outline" className="bg-red-500/10 text-red-500">
                  <Lock className="h-3 w-3 mr-1" />
                  Locked
                </Badge>
              )}
            </div>
          </div>

          {!isLocked && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="flex items-center gap-4 text-sm">
                {module.duration && (
                  <span className="text-muted-foreground">Duration: {module.duration} min</span>
                )}
                {module.passingScore && (
                  <span className="text-muted-foreground">
                    Passing Score: {module.passingScore}%
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Progress value={simulatedProgress} className="w-32 h-2" />
                <span className="text-sm text-muted-foreground">{simulatedProgress}%</span>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-6">{renderContentPreview()}</CardContent>

        <div className="border-t p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={onPrevious}
              disabled={!hasPrevious}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            {!isLocked && !isCompleted && (
              <Button onClick={handleCompleteSimulation} className="gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Mark as Complete (Preview)
              </Button>
            )}

            {isCompleted && (
              <Badge variant="outline" className="bg-green-500/10 text-green-500 px-4 py-2">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Completed
              </Badge>
            )}

            <Button variant="outline" onClick={onNext} disabled={!hasNext} className="gap-2">
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
