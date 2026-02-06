/**
 * MatchingPairList - Sortable list of matching pairs with drag-drop reordering
 */

import { useState, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, MoreVertical, Edit2, Trash2, Eye, Lightbulb, ArrowRight } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Card } from '@/shared/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/alert-dialog';
import type { MatchingPairItem } from '../api/matchingBuilderApi';

// ============================================================================
// Types
// ============================================================================

interface MatchingPairListProps {
  pairs: MatchingPairItem[];
  onEdit: (pair: MatchingPairItem) => void;
  onDelete: (pairId: string) => void;
  onPreview?: (pair: MatchingPairItem) => void;
  onReorder: (pairIds: string[]) => void;
  isLoading?: boolean;
}

// ============================================================================
// Sortable Item Component
// ============================================================================

interface SortablePairItemProps {
  pair: MatchingPairItem;
  onEdit: () => void;
  onDelete: () => void;
  onPreview?: () => void;
}

function SortablePairItem({
  pair,
  onEdit,
  onDelete,
  onPreview,
}: SortablePairItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: pair.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const truncate = (text: string, maxLength = 60) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  const leftHintsCount = pair.left.hints?.length || 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 bg-card border rounded-lg hover:bg-muted/50 transition-colors"
    >
      {/* Drag Handle */}
      <button
        type="button"
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5" />
      </button>

      {/* Sequence Number */}
      <span className="text-sm font-medium text-muted-foreground w-6">
        {pair.sequence + 1}.
      </span>

      {/* Left Side (Column A) */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{truncate(pair.left.text)}</p>
        {pair.left.media && (
          <span className="text-xs text-muted-foreground">[has media]</span>
        )}
      </div>

      {/* Arrow */}
      <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />

      {/* Right Side (Column B) */}
      <div className="flex-1 min-w-0">
        <p className="text-sm truncate">{truncate(pair.right.text)}</p>
        {pair.right.media && (
          <span className="text-xs text-muted-foreground">[has media]</span>
        )}
      </div>

      {/* Hints Indicator */}
      {leftHintsCount > 0 && (
        <Badge variant="secondary" className="flex items-center gap-1 flex-shrink-0">
          <Lightbulb className="h-3 w-3" />
          {leftHintsCount} hint{leftHintsCount > 1 ? 's' : ''}
        </Badge>
      )}

      {/* Actions Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {onPreview && (
            <DropdownMenuItem onClick={onPreview}>
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={onEdit}>
            <Edit2 className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={onDelete}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function MatchingPairList({
  pairs,
  onEdit,
  onDelete,
  onPreview,
  onReorder,
  isLoading = false,
}: MatchingPairListProps) {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // DnD Kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end - reorder pairs
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        const oldIndex = pairs.findIndex((p) => p.id === active.id);
        const newIndex = pairs.findIndex((p) => p.id === over.id);
        const newOrder = arrayMove(pairs, oldIndex, newIndex);
        onReorder(newOrder.map((p) => p.id));
      }
    },
    [pairs, onReorder]
  );

  // Handle delete confirmation
  const handleDeleteClick = useCallback((pairId: string) => {
    setDeleteConfirmId(pairId);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (deleteConfirmId) {
      onDelete(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  }, [deleteConfirmId, onDelete]);

  // Empty state
  if (pairs.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center text-muted-foreground">
          <p className="font-medium">No matching pairs yet</p>
          <p className="text-sm mt-1">
            Add your first matching pair to get started
          </p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={pairs.map((p) => p.id)}
          strategy={verticalListSortingStrategy}
        >
          <div
            className={`space-y-2 ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
          >
            {pairs.map((pair) => (
              <SortablePairItem
                key={pair.id}
                pair={pair}
                onEdit={() => onEdit(pair)}
                onDelete={() => handleDeleteClick(pair.id)}
                onPreview={onPreview ? () => onPreview(pair) : undefined}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteConfirmId}
        onOpenChange={(open) => !open && setDeleteConfirmId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Matching Pair</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this matching pair? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
