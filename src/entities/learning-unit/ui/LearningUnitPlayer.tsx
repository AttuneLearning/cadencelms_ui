/**
 * LearningUnitPlayer Component
 * Renders the appropriate player/viewer for different learning unit types
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import {
  FileText,
  Video,
  Package,
  PenTool,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Settings,
  Download,
} from 'lucide-react';
import type { LearningUnit, LearningUnitType } from '../model/types';
import { cn } from '@/shared/lib/utils';

interface LearningUnitPlayerProps {
  unit: LearningUnit;
  className?: string;
  onComplete?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
  isCompleted?: boolean;
}

export const LearningUnitPlayer: React.FC<LearningUnitPlayerProps> = ({
  unit,
  className,
  onComplete,
  onNext,
  onPrevious,
  hasNext = false,
  hasPrevious = false,
  isCompleted = false,
}) => {
  const TypeIcon = getTypeIcon(unit.type);

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <TypeIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">{unit.title}</CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="outline">{getTypeLabel(unit.type)}</Badge>
                  {unit.estimatedDuration && (
                    <span>{unit.estimatedDuration} min</span>
                  )}
                </div>
              </div>
            </div>
            {isCompleted && (
              <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                <CheckCircle className="mr-1 h-3 w-3" />
                Completed
              </Badge>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Content Area */}
      <Card className="flex-1">
        <CardContent className="p-6">
          {renderContent(unit)}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={!hasPrevious}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Previous
        </Button>

        <div className="flex items-center gap-2">
          {!isCompleted && onComplete && (
            <Button variant="secondary" onClick={onComplete}>
              <CheckCircle className="mr-1 h-4 w-4" />
              Mark Complete
            </Button>
          )}
        </div>

        <Button
          variant="outline"
          onClick={onNext}
          disabled={!hasNext}
        >
          Next
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

function getTypeIcon(type: LearningUnitType): React.ComponentType<{ className?: string }> {
  switch (type) {
    case 'video':
      return Video;
    case 'document':
      return FileText;
    case 'scorm':
      return Package;
    case 'exercise':
      return PenTool;
    case 'assessment':
      return HelpCircle;
    case 'custom':
    default:
      return Settings;
  }
}

function getTypeLabel(type: LearningUnitType): string {
  const labels: Record<LearningUnitType, string> = {
    video: 'Video',
    media: 'Media',
    document: 'Document',
    scorm: 'SCORM',
    exercise: 'Exercise',
    assessment: 'Assessment',
    assignment: 'Assignment',
    custom: 'Custom',
  };
  return labels[type] || type;
}

function renderContent(unit: LearningUnit): React.ReactNode {
  switch (unit.type) {
    case 'video':
      return <VideoContent unit={unit} />;
    case 'document':
      return <DocumentContent unit={unit} />;
    case 'scorm':
      return <ScormContent unit={unit} />;
    case 'exercise':
      return <ExerciseContent unit={unit} />;
    case 'assessment':
      return <AssessmentContent unit={unit} />;
    case 'custom':
    default:
      return <CustomContent unit={unit} />;
  }
}

// Content type components

interface ContentProps {
  unit: LearningUnit;
}

const VideoContent: React.FC<ContentProps> = ({ unit }) => (
  <div className="space-y-4">
    <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted">
      {unit.contentId ? (
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <Video className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              Video content: {unit.contentId}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex h-full items-center justify-center text-muted-foreground">
          <Video className="mr-2 h-8 w-8" />
          Video content not available
        </div>
      )}
    </div>
    {unit.description && (
      <p className="text-muted-foreground">{unit.description}</p>
    )}
  </div>
);

const DocumentContent: React.FC<ContentProps> = ({ unit }) => {
  const documentUrl = unit.contentId ? `/api/content/${unit.contentId}/file` : '';
  const isPdf = documentUrl.toLowerCase().endsWith('.pdf') || unit.type === 'document';

  if (!documentUrl) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-dashed p-8">
        <div className="text-center">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-2 font-medium">Document not available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative min-h-[500px] w-full rounded-lg border bg-muted/5">
        {isPdf ? (
          <iframe
            src={documentUrl}
            title={unit.title}
            className="h-[500px] w-full rounded-lg border-0"
          />
        ) : (
          <div className="flex h-[500px] items-center justify-center p-8">
            <img
              src={documentUrl}
              alt={unit.title}
              className="max-h-full max-w-full object-contain"
            />
          </div>
        )}
        <div className="absolute right-3 top-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => window.open(documentUrl, '_blank')}
          >
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>
      </div>
      {unit.description && (
        <p className="text-muted-foreground">{unit.description}</p>
      )}
    </div>
  );
};

const ScormContent: React.FC<ContentProps> = ({ unit }) => (
  <div className="space-y-4">
    <div className="rounded-lg border border-dashed p-8 text-center">
      <Package className="mx-auto h-12 w-12 text-muted-foreground" />
      <p className="mt-2 font-medium">SCORM Package</p>
      <p className="text-sm text-muted-foreground">
        {unit.description || 'Interactive SCORM content will be loaded here.'}
      </p>
      {unit.contentId && (
        <p className="mt-2 text-xs text-muted-foreground">
          Content ID: {unit.contentId}
        </p>
      )}
    </div>
  </div>
);

const ExerciseContent: React.FC<ContentProps> = ({ unit }) => (
  <div className="space-y-4">
    <div className="rounded-lg border border-dashed p-8 text-center">
      <PenTool className="mx-auto h-12 w-12 text-muted-foreground" />
      <p className="mt-2 font-medium">Practice Exercise</p>
      <p className="text-sm text-muted-foreground">
        {unit.description || 'Complete the exercise to practice your skills.'}
      </p>
      {unit.contentId && (
        <Button variant="default" className="mt-4">
          Start Exercise
        </Button>
      )}
    </div>
  </div>
);

const AssessmentContent: React.FC<ContentProps> = ({ unit }) => (
  <div className="space-y-4">
    <div className="rounded-lg border border-dashed p-8 text-center">
      <HelpCircle className="mx-auto h-12 w-12 text-muted-foreground" />
      <p className="mt-2 font-medium">Assessment</p>
      <p className="text-sm text-muted-foreground">
        {unit.description || 'Complete this assessment to test your knowledge.'}
      </p>
      {unit.contentId && (
        <Button variant="default" className="mt-4">
          Start Assessment
        </Button>
      )}
    </div>
  </div>
);

const CustomContent: React.FC<ContentProps> = ({ unit }) => (
  <div className="rounded-lg border border-dashed p-8 text-center">
    <Settings className="mx-auto h-12 w-12 text-muted-foreground" />
    <p className="mt-2 font-medium">{unit.title}</p>
    <p className="text-sm text-muted-foreground">
      {unit.description || 'Custom content for this learning unit will be displayed here.'}
    </p>
    {unit.contentId && (
      <p className="mt-2 text-xs text-muted-foreground">
        Content ID: {unit.contentId}
      </p>
    )}
  </div>
);
