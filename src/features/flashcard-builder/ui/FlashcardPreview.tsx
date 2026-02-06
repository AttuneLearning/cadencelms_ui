/**
 * Flashcard Preview Component
 * Interactive card flip preview for testing flashcard content
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { cn } from '@/shared/lib/utils';
import {
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  Eye,
  EyeOff,
} from 'lucide-react';
import type { FlashcardItem } from '../api/flashcardBuilderApi';

// ============================================================================
// Types
// ============================================================================

interface FlashcardPreviewProps {
  open: boolean;
  onClose: () => void;
  card: FlashcardItem | null;
  cards?: FlashcardItem[];
  onNavigate?: (direction: 'prev' | 'next') => void;
  currentIndex?: number;
}

// ============================================================================
// Component
// ============================================================================

export function FlashcardPreview({
  open,
  onClose,
  card,
  cards = [],
  onNavigate,
  currentIndex = 0,
}: FlashcardPreviewProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHints, setShowHints] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    setIsFlipped(false);
    setShowHints(false);
    onNavigate?.(direction);
  };

  const handleClose = () => {
    setIsFlipped(false);
    setShowHints(false);
    onClose();
  };

  const hasNavigation = cards.length > 1;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < cards.length - 1;

  if (!card) return null;

  const hints = card.front.hints || [];

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Flashcard Preview</span>
            {hasNavigation && (
              <span className="text-sm font-normal text-muted-foreground">
                {currentIndex + 1} of {cards.length}
              </span>
            )}
          </DialogTitle>
          <DialogDescription>
            Click the card to flip between front and back.
          </DialogDescription>
        </DialogHeader>

        {/* Card Container */}
        <div className="perspective-1000">
          <div
            onClick={handleFlip}
            className={cn(
              'relative w-full h-[300px] cursor-pointer transition-transform duration-500 transform-style-preserve-3d',
              isFlipped && 'rotate-y-180'
            )}
            style={{
              transformStyle: 'preserve-3d',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              transition: 'transform 0.5s ease-in-out',
            }}
          >
            {/* Front Face */}
            <div
              className={cn(
                'absolute inset-0 backface-hidden rounded-xl border-2 p-6 flex flex-col',
                'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950',
                'border-blue-200 dark:border-blue-800'
              )}
              style={{ backfaceVisibility: 'hidden' }}
            >
              <Badge variant="outline" className="self-start mb-4">
                <Eye className="mr-1 h-3 w-3" />
                Front
              </Badge>
              <div className="flex-1 flex items-center justify-center">
                <p className="text-lg text-center font-medium">{card.front.text}</p>
              </div>
              <p className="text-xs text-center text-muted-foreground mt-4">
                Click to reveal answer
              </p>
            </div>

            {/* Back Face */}
            <div
              className={cn(
                'absolute inset-0 backface-hidden rounded-xl border-2 p-6 flex flex-col',
                'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950',
                'border-green-200 dark:border-green-800'
              )}
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}
            >
              <Badge variant="secondary" className="self-start mb-4">
                <EyeOff className="mr-1 h-3 w-3" />
                Back
              </Badge>
              <div className="flex-1 flex flex-col items-center justify-center">
                <p className="text-lg text-center font-medium">{card.back.text}</p>
                {card.back.explanation && (
                  <p className="text-sm text-center text-muted-foreground mt-4 italic">
                    {card.back.explanation}
                  </p>
                )}
              </div>
              <p className="text-xs text-center text-muted-foreground mt-4">
                Click to see question
              </p>
            </div>
          </div>
        </div>

        {/* Hints Section */}
        {hints.length > 0 && !isFlipped && (
          <div className="mt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setShowHints(!showHints);
              }}
              className="w-full justify-start"
            >
              <Lightbulb className="mr-2 h-4 w-4 text-amber-500" />
              {showHints ? 'Hide Hints' : `Show ${hints.length} Hint${hints.length > 1 ? 's' : ''}`}
            </Button>
            {showHints && (
              <ul className="mt-2 space-y-1 pl-8">
                {hints.map((hint, index) => (
                  <li key={index} className="text-sm text-muted-foreground list-disc">
                    {hint}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Tags */}
        {card.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {card.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFlipped(false)}
            disabled={!isFlipped}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>

          {hasNavigation && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleNavigate('prev')}
                disabled={!hasPrev}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleNavigate('next')}
                disabled={!hasNext}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default FlashcardPreview;
