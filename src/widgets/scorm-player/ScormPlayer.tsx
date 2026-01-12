/**
 * SCORM Player Widget
 * Embeds and manages SCORM content packages with API support
 */

import React, { useRef, useEffect, useState } from 'react';
import { Card } from '@/shared/ui/card';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';

export interface ScormPlayerProps {
  packageUrl: string;
  lessonId: string;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
  offlineMode?: boolean;
}

export const ScormPlayer: React.FC<ScormPlayerProps> = ({
  packageUrl,
  lessonId,
  onProgress,
  onComplete,
  offlineMode = false,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize SCORM API
    if (typeof window !== 'undefined') {
      // @ts-expect-error SCORM API attached to window
      window.API = {
        LMSInitialize: () => 'true',
        LMSFinish: () => {
          onComplete?.();
          return 'true';
        },
        LMSGetValue: (element: string) => {
          // Handle SCORM data retrieval
          const storage = offlineMode ? localStorage : sessionStorage;
          return storage.getItem(`scorm_${lessonId}_${element}`) || '';
        },
        LMSSetValue: (element: string, value: string) => {
          // Handle SCORM data storage
          const storage = offlineMode ? localStorage : sessionStorage;
          storage.setItem(`scorm_${lessonId}_${element}`, value);

          // Track progress
          if (element === 'cmi.core.lesson_status' && value === 'completed') {
            onComplete?.();
          }
          if (element === 'cmi.core.score.raw') {
            const score = parseInt(value, 10);
            onProgress?.(score);
          }
          return 'true';
        },
        LMSCommit: () => 'true',
        LMSGetLastError: () => '0',
        LMSGetErrorString: () => '',
        LMSGetDiagnostic: () => '',
      };
    }

    // Cleanup
    return () => {
      if (typeof window !== 'undefined') {
        // @ts-expect-error SCORM API cleanup
        delete window.API;
      }
    };
  }, [lessonId, offlineMode, onComplete, onProgress]);

  const handleLoad = () => {
    setLoading(false);
  };

  const handleError = () => {
    setError('Failed to load SCORM content');
    setLoading(false);
  };

  return (
    <Card className="relative h-full w-full overflow-hidden">
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="m-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {offlineMode && !error && (
        <div className="bg-muted p-2 text-center text-sm text-muted-foreground">
          Offline Mode - Progress will sync when online
        </div>
      )}

      <iframe
        ref={iframeRef}
        src={packageUrl}
        className="h-full w-full border-0"
        onLoad={handleLoad}
        onError={handleError}
        title="SCORM Content"
        sandbox="allow-scripts allow-same-origin allow-forms"
      />
    </Card>
  );
};
