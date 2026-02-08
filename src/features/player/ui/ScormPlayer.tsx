/**
 * ScormPlayer Component
 * Renders SCORM content in an iframe with full API support
 */

import { useEffect, useRef, useState } from 'react';
import { ScormAPI } from '@/shared/lib/scorm/scormApi';
import type { ScormVersion } from '@/entities/content-attempt';
import {
  useUpdateContentAttempt,
  useCompleteContentAttempt,
  useSaveScormData,
} from '@/entities/content-attempt';
import { AlertCircle, Loader2 } from 'lucide-react';

export interface ScormPlayerProps {
  attemptId: string;
  scormUrl: string;
  scormVersion: ScormVersion;
  savedData?: Record<string, string>;
  learnerId?: string;
  learnerName?: string;
  onComplete?: () => void;
  onError?: (error: { errorCode: string; errorMessage: string }) => void;
  onProgress?: (progress: number) => void;
}

export function ScormPlayer({
  attemptId,
  scormUrl,
  scormVersion,
  savedData = {},
  learnerId,
  learnerName,
  onComplete,
  onError,
  onProgress,
}: ScormPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const scormApiRef = useRef<ScormAPI | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { mutate: saveScormData } = useSaveScormData();
  const { mutate: completeAttempt } = useCompleteContentAttempt();
  const { debouncedMutate: updateAttempt } = useUpdateContentAttempt(30000);

  useEffect(() => {
    // Validate URL
    if (!scormUrl) {
      setError('Invalid SCORM URL');
      setIsLoading(false);
      return;
    }

    // Initialize SCORM API
    const scormApi = new ScormAPI(scormVersion, {
      savedData,
      learnerId,
      learnerName,
      autoSaveInterval: 30000, // Auto-save every 30 seconds
      debug: import.meta.env.DEV,
      onCommit: (data) => {
        // Save SCORM data to backend
        saveScormData({
          attemptId,
          data: {
            cmiData: data,
            autoCommit: true,
          },
        });

        // Extract progress if available
        const progress = extractProgress(data, scormVersion);
        if (progress !== null && onProgress) {
          onProgress(progress);
        }

        // Update attempt with latest data
        updateAttempt(attemptId, {
          suspendData: data['cmi.suspend_data'] || data['cmi.suspendData'],
          location: data['cmi.core.lesson_location'] || data['cmi.location'],
        });
      },
      onTerminate: (data) => {
        // Save final SCORM data
        saveScormData({
          attemptId,
          data: {
            cmiData: data,
            autoCommit: true,
          },
        });

        // Check if completed
        const status = getLessonStatus(data, scormVersion);
        const score = getScore(data, scormVersion);

        if (isCompletionStatus(status)) {
          completeAttempt({
            attemptId,
            data: {
              score: score.raw || undefined,
              scoreRaw: score.raw || undefined,
              scoreScaled: score.scaled || undefined,
              passed: status === 'passed',
            },
          });

          if (onComplete) {
            onComplete();
          }
        }
      },
      onError: (err) => {
        console.error('[SCORM Error]', err);
        if (onError) {
          onError(err);
        }
      },
    });

    scormApi.initialize();
    scormApiRef.current = scormApi;

    // Handle page unload - save data
    const handleBeforeUnload = () => {
      if (scormApiRef.current) {
        scormApiRef.current.updateSessionTime();
        scormApiRef.current.getAllData();

        // Use sendBeacon for reliable data sending on unload
        if (navigator.sendBeacon && typeof navigator.sendBeacon === 'function') {
          // In production, this would send to your API endpoint
          // const blob = new Blob([JSON.stringify({ attemptId, data })], {
          //   type: 'application/json',
          // });
          // navigator.sendBeacon('/api/content-attempts/save', blob);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup
    return () => {
      if (scormApiRef.current) {
        scormApiRef.current.destroy();
      }
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [
    attemptId,
    scormUrl,
    scormVersion,
    learnerId,
    learnerName,
    saveScormData,
    completeAttempt,
    updateAttempt,
    onComplete,
    onError,
    onProgress,
  ]);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setError('Failed to load SCORM content');
    setIsLoading(false);
    if (onError) {
      onError({
        errorCode: 'LOAD_ERROR',
        errorMessage: 'Failed to load SCORM content',
      });
    }
  };

  if (error) {
    return (
      <div className="flex h-full items-center justify-center bg-muted/10">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <div>
            <h3 className="text-lg font-semibold">Error Loading Content</h3>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading SCORM content...</p>
          </div>
        </div>
      )}
      <iframe
        ref={iframeRef}
        src={scormUrl}
        title="SCORM Content"
        className="h-full w-full border-0"
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        allow="autoplay; fullscreen"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
      />
    </div>
  );
}

/**
 * Helper functions
 */

function getLessonStatus(data: Record<string, string>, version: ScormVersion): string {
  if (version === '1.2') {
    return data['cmi.core.lesson_status'] || 'not attempted';
  } else {
    return data['cmi.completion_status'] || 'unknown';
  }
}

function getScore(
  data: Record<string, string>,
  version: ScormVersion
): {
  raw: number | null;
  scaled: number | null;
} {
  const prefix = version === '1.2' ? 'cmi.core.score' : 'cmi.score';

  const parseScore = (value: string | undefined): number | null => {
    if (!value) return null;
    const num = parseFloat(value);
    return isNaN(num) ? null : num;
  };

  return {
    raw: parseScore(data[`${prefix}.raw`]),
    scaled: version === '2004' ? parseScore(data['cmi.score.scaled']) : null,
  };
}

function isCompletionStatus(status: string): boolean {
  const completionStatuses = [
    'completed',
    'passed',
    'failed',
    'complete', // Some SCORM packages use this
  ];
  return completionStatuses.includes(status.toLowerCase());
}

function extractProgress(data: Record<string, string>, version: ScormVersion): number | null {
  // Try to extract progress from lesson status
  const status = getLessonStatus(data, version);

  if (status === 'completed' || status === 'passed') {
    return 100;
  }

  if (status === 'incomplete' || status === 'failed') {
    // Try to estimate from score if available
    const score = getScore(data, version);
    if (score.raw !== null) {
      // Assume score is out of 100
      return Math.min(Math.max(score.raw, 0), 100);
    }
    return 50; // Default to 50% for incomplete
  }

  return null;
}
