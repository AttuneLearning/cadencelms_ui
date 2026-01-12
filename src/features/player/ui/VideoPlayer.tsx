/**
 * VideoPlayer Component
 * HTML5 video player with progress tracking and controls
 */

import { useEffect, useRef, useState } from 'react';
import {
  useSaveVideoProgress,
  useCompleteContentAttempt,
  calculateWatchPercentage,
  formatVideoTime,
} from '@/entities/content-attempt';
import { AlertCircle, Loader2, Maximize, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/shared/ui/button';

export interface VideoPlayerProps {
  attemptId: string;
  videoUrl: string;
  lastPosition?: number;
  completionThreshold?: number; // Default 95%
  onComplete?: () => void;
  onProgress?: (progress: number) => void;
  onError?: (error: string) => void;
}

export function VideoPlayer({
  attemptId,
  videoUrl,
  lastPosition = 0,
  completionThreshold = 95,
  onComplete,
  onProgress,
  onError,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  const { debouncedSave } = useSaveVideoProgress(5000);
  const { mutate: completeAttempt } = useCompleteContentAttempt();

  useEffect(() => {
    if (!videoUrl) {
      setError('Invalid video URL');
      setIsLoading(false);
      return;
    }
  }, [videoUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      // Resume from last position
      if (lastPosition > 0 && lastPosition < video.duration) {
        video.currentTime = lastPosition;
      }
    };

    const handleLoadedData = () => {
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      const current = video.currentTime;
      const dur = video.duration;

      setCurrentTime(current);

      if (dur > 0) {
        const watchPercentage = calculateWatchPercentage(current, dur);

        // Save progress (debounced)
        debouncedSave(attemptId, current, watchPercentage);

        // Notify parent of progress
        if (onProgress) {
          onProgress(watchPercentage);
        }

        // Check for completion
        if (!isCompleted && watchPercentage >= completionThreshold) {
          setIsCompleted(true);
          completeAttempt({
            attemptId,
            data: {
              passed: true,
              timeSpentSeconds: Math.floor(current),
            },
          });

          if (onComplete) {
            onComplete();
          }
        }
      }
    };

    const handlePause = () => {
      // Save progress immediately on pause (no debounce)
      const current = video.currentTime;
      const dur = video.duration;
      if (dur > 0) {
        const watchPercentage = calculateWatchPercentage(current, dur);
        debouncedSave(attemptId, current, watchPercentage);
      }
    };

    const handleError = () => {
      setError('Error loading video');
      setIsLoading(false);
      if (onError) {
        onError('Failed to load video');
      }
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('pause', handlePause);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('error', handleError);

      // Save progress on unmount
      const current = video.currentTime;
      const dur = video.duration;
      if (dur > 0) {
        const watchPercentage = calculateWatchPercentage(current, dur);
        debouncedSave(attemptId, current, watchPercentage);
      }
    };
  }, [
    attemptId,
    lastPosition,
    completionThreshold,
    isCompleted,
    debouncedSave,
    completeAttempt,
    onComplete,
    onProgress,
    onError,
  ]);

  const handleSpeedChange = (rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
      setShowSpeedMenu(false);
    }
  };

  const handleToggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  if (error) {
    return (
      <div className="flex h-full items-center justify-center bg-muted/10">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <div>
            <h3 className="text-lg font-semibold">Error Loading Video</h3>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full bg-black">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/80">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
            <p className="text-sm text-white">Loading video...</p>
          </div>
        </div>
      )}

      <video
        ref={videoRef}
        data-testid="video-player"
        src={videoUrl}
        controls
        className="h-full w-full"
        controlsList="nodownload"
      />

      {/* Custom Controls Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-4">
            {/* Time Display */}
            <div className="text-sm">
              <span>{formatVideoTime(currentTime)}</span>
              <span className="mx-1">/</span>
              <span>{formatVideoTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Playback Speed */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="text-white hover:bg-white/20"
                role="button"
                aria-label={`${playbackRate}x`}
              >
                {playbackRate}x
              </Button>
              {showSpeedMenu && (
                <div className="absolute bottom-full right-0 mb-2 rounded bg-black/90 py-1">
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => handleSpeedChange(rate)}
                      className="block w-full px-4 py-1 text-left text-sm hover:bg-white/20"
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mute Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleMute}
              className="text-white hover:bg-white/20"
              aria-label="Toggle mute"
            >
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>

            {/* Fullscreen */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFullscreen}
              className="text-white hover:bg-white/20"
              aria-label="Fullscreen"
            >
              <Maximize className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-2 h-1 w-full rounded-full bg-white/30">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
          />
        </div>
      </div>
    </div>
  );
}
