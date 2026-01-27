/**
 * Type Selection Modal
 * Entry point for creating new learning activities
 * Displays a card grid for selecting activity type
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Card, CardContent } from '@/shared/ui/card';
import { cn } from '@/shared/lib/utils';
import { EDITOR_CONFIGS, type EditorConfig } from '../model/editor-config';
import type { LearningUnitType } from '@/entities/learning-unit';

export interface TypeSelectionModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Callback when a type is selected */
  onSelectType: (type: LearningUnitType) => void;
  /** Module ID for context */
  moduleId: string;
  /** Course ID for context */
  courseId: string;
}

/**
 * Type card component for the selection grid
 */
interface TypeCardProps {
  config: EditorConfig;
  onClick: () => void;
}

function TypeCard({ config, onClick }: TypeCardProps) {
  return (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-200',
        'hover:border-primary hover:shadow-md',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
      )}
      onClick={onClick}
      tabIndex={0}
      role="button"
      aria-label={`Create ${config.label} activity`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <CardContent className="flex flex-col items-center p-4 text-center">
        <span className="text-3xl mb-2" role="img" aria-hidden="true">
          {config.icon}
        </span>
        <span className="font-medium text-sm">{config.label}</span>
        <span className="text-xs text-muted-foreground mt-1 line-clamp-2">
          {config.description}
        </span>
      </CardContent>
    </Card>
  );
}

/**
 * Type Selection Modal Component
 *
 * Displays a grid of available activity types for the user to select from.
 * On selection, determines the appropriate UI pattern (drawer vs page)
 * and triggers the corresponding editor.
 *
 * @example
 * ```tsx
 * <TypeSelectionModal
 *   open={showTypeSelector}
 *   onClose={() => setShowTypeSelector(false)}
 *   onSelectType={handleTypeSelect}
 *   moduleId={moduleId}
 *   courseId={courseId}
 * />
 * ```
 */
export function TypeSelectionModal({
  open,
  onClose,
  onSelectType,
  moduleId: _moduleId,
  courseId: _courseId,
}: TypeSelectionModalProps) {
  // moduleId and courseId are available for future use (e.g., filtering available types)
  const types = Object.values(EDITOR_CONFIGS);

  const handleSelect = (type: LearningUnitType) => {
    onSelectType(type);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Learning Activity</DialogTitle>
          <DialogDescription>
            What type of activity would you like to create?
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
          {types.map((config) => (
            <TypeCard
              key={config.type}
              config={config}
              onClick={() => handleSelect(config.type)}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default TypeSelectionModal;
