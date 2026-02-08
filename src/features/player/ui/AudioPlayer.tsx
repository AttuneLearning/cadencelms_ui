/**
 * AudioPlayer Component
 * HTML5 audio player with progress tracking and controls
 */

import { useEffect, useRef, useState } from 'react';
import {
  useSaveVideoProgress,
  useCompleteContentAttempt,
  calculateWatchPercentage,
  formatVideoTime,
} from '@/entities/content-attempt';
import { AlertCircle, Loader2, Volume2, VolumeX, Play, Pause } from 'lucide-react';
import { Button } from '@/shared/ui/button';

export interface AudioPlayerProps {
  attemptId: string;
  audioUrl: string;
  lastPosition?: number;
  completionThreshold?: number; // Default 95%
  onComplete?: () => void;
  onProgress?: (progress: number) => void;
  onError?: (error: string) => void;
}

export function AudioPlayer({
  attemptId,
  audioUrl,
  lastPosition = 0,
  completionThreshold = 95,
  onComplete,
  onProgress,
  onError,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  const { debouncedSave } = useSaveVideoProgress(5000);
  const { mutate: completeAttempt } = useCompleteContentAttempt();

  useEffect(() => {
    if (!audioUrl) {
      setError('Invalid audio URL');
      setIsLoading(false);
      return;
    }
  }, [audioUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      // Resume from last position
      if (lastPosition > 0 && lastPosition < audio.duration) {
        audio.currentTime = lastPosition;
      }
    };

    const handleLoadedData = () => {
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      const current = audio.currentTime;
      const dur = audio.duration;

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

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
      // Save progress immediately on pause (no debounce)
      const current = audio.currentTime;
      const dur = audio.duration;
      if (dur > 0) {
        const watchPercentage = calculateWatchPercentage(current, dur);
        debouncedSave(attemptId, current, watchPercentage);
      }
    };

    const handleError = () => {
      setError('Error loading audio');
      setIsLoading(false);
      if (onError) {
        onError('Failed to load audio');
      }
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);

      // Save progress on unmount
      const current = audio.currentTime;
      const dur = audio.duration;
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
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
      setPlaybackRate(rate);
      setShowSpeedMenu(false);
    }
  };

  const handleToggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  const handleTogglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || duration === 0) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;

    audioRef.current.currentTime = newTime;
  };

  if (error) {
    return (
      <div className="flex h-full items-center justify-center bg-muted/10">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <div>
            <h3 className="text-lg font-semibold">Error Loading Audio</h3>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/80">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
            <p className="text-sm text-white">Loading audio...</p>
          </div>
        </div>
      )}

      <audio
        ref={audioRef}
        data-testid="audio-player"
        src={audioUrl}
        className="hidden"
      />

      {/* Audio Player UI */}
      <div className="w-full max-w-2xl px-8">
        {/* Visual Display Area */}
        <div className="mb-8 flex items-center justify-center">
          <div className="relative h-64 w-64 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 shadow-2xl">
            {/* Center Play/Pause Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleTogglePlay}
              className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
              aria-label={isPlaying ? 'Pause' : 'Play'}
              disabled={isLoading}
            >
              {isPlaying ? (
                <Pause className="h-10 w-10" />
              ) : (
                <Play className="h-10 w-10 translate-x-0.5" />
              )}
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div
            className="h-2 w-full cursor-pointer rounded-full bg-white/20"
            onClick={handleSeek}
            role="slider"
            aria-label="Seek"
            aria-valuemin={0}
            aria-valuemax={duration}
            aria-valuenow={currentTime}
          >
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Time Display */}
        <div className="mb-6 flex items-center justify-between text-sm text-white">
          <span>{formatVideoTime(currentTime)}</span>
          <span>{formatVideoTime(duration)}</span>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
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
              <div className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded bg-black/90 py-1">
                {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => handleSpeedChange(rate)}
                    className="block w-full px-4 py-1 text-left text-sm text-white hover:bg-white/20"
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
        </div>
      </div>
    </div>
  );
}
