/**
 * Flashcard List Component
 * Sortable list of flashcards with drag-drop reordering
 */

import { useState } from 'react';
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
import { Card, CardContent } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
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
import {
  GripVertical,
  MoreVertical,
  Pencil,
  Trash2,
  Eye,
  BookOpen,
} from 'lucide-react';
import type { FlashcardItem } from '../api/flashcardBuilderApi';

// ============================================================================
// Types
// ============================================================================

interface FlashcardListProps {
  cards: FlashcardItem[];
  onEdit: (card: FlashcardItem) => void;
  onDelete: (cardId: string) => void;
  onPreview: (card: FlashcardItem) => void;
  onReorder: (cardIds: string[]) => void;
  isLoading?: boolean;
}

interface SortableCardProps {
  card: FlashcardItem;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  onPreview: () => void;
  isLoading?: boolean;
}

// ============================================================================
// Sortable Card Component
// ============================================================================

function SortableCard({
  card,
  index,
  onEdit,
  onDelete,
  onPreview,
  isLoading,
}: SortableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className={`mb-3 ${isDragging ? 'ring-2 ring-primary' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Drag Handle */}
            <button
              type="button"
              className="mt-1 cursor-grab text-muted-foreground hover:text-foreground focus:outline-none"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-5 w-5" />
            </button>

            {/* Card Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-3">
                {/* Index */}
                <span className="text-sm font-medium text-muted-foreground shrink-0">
                  {index + 1}.
                </span>

                {/* Front/Back Preview */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="shrink-0">
                      <BookOpen className="mr-1 h-3 w-3" />
                      Front
                    </Badge>
                    <span className="text-sm truncate">{truncateText(card.front.text, 60)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="shrink-0">Back</Badge>
                    <span className="text-sm text-muted-foreground truncate">
                      {truncateText(card.back.text, 60)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {card.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2 ml-6">
                  {card.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {card.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{card.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              {/* Hints indicator */}
              {card.front.hints && card.front.hints.length > 0 && (
                <div className="mt-2 ml-6 text-xs text-muted-foreground">
                  {card.front.hints.length} hint{card.front.hints.length > 1 ? 's' : ''} available
                </div>
              )}
            </div>

            {/* Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" disabled={isLoading}>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onPreview}>
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onEdit}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// Flashcard List Component
// ============================================================================

export function FlashcardList({
  cards,
  onEdit,
  onDelete,
  onPreview,
  onReorder,
  isLoading = false,
}: FlashcardListProps) {
  const [deleteDialogCard, setDeleteDialogCard] = useState<FlashcardItem | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = cards.findIndex((c) => c.id === active.id);
      const newIndex = cards.findIndex((c) => c.id === over.id);
      const newOrder = arrayMove(cards, oldIndex, newIndex);
      onReorder(newOrder.map((c) => c.id));
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteDialogCard) {
      onDelete(deleteDialogCard.id);
      setDeleteDialogCard(null);
    }
  };

  if (cards.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium mb-2">No flashcards yet</p>
        <p className="text-sm">Create your first flashcard or import from CSV</p>
      </div>
    );
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {cards.map((card, index) => (
            <SortableCard
              key={card.id}
              card={card}
              index={index}
              onEdit={() => onEdit(card)}
              onDelete={() => setDeleteDialogCard(card)}
              onPreview={() => onPreview(card)}
              isLoading={isLoading}
            />
          ))}
        </SortableContext>
      </DndContext>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteDialogCard} onOpenChange={() => setDeleteDialogCard(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Flashcard</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this flashcard? This action cannot be undone.
              {deleteDialogCard && (
                <span className="block mt-2 font-medium text-foreground">
                  "{deleteDialogCard.front.text.substring(0, 50)}
                  {deleteDialogCard.front.text.length > 50 ? '...' : ''}"
                </span>
              )}
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

export default FlashcardList;
