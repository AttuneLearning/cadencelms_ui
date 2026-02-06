/**
 * FlashcardDeckPage
 * Staff page for creating and managing flashcard decks for a module
 */

import { useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Upload, BookOpen } from 'lucide-react';
import { PageHeader } from '@/shared/ui/page-header';
import { Button } from '@/shared/ui/button';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { useToast } from '@/shared/ui/use-toast';
import {
  FlashcardEditor,
  FlashcardList,
  FlashcardBulkImport,
  FlashcardPreview,
  useFlashcards,
  useCreateFlashcard,
  useUpdateFlashcard,
  useDeleteFlashcard,
  useBulkImportFlashcards,
  useReorderFlashcards,
  type FlashcardItem,
  type CreateFlashcardRequest,
  type BulkFlashcardItem,
} from '@/features/flashcard-builder';

interface FlashcardDeckPageParams {
  courseId: string;
  moduleId: string;
}

export const FlashcardDeckPage: React.FC = () => {
  const { courseId, moduleId } = useParams<Record<keyof FlashcardDeckPageParams, string>>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Modal states
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<FlashcardItem | undefined>();
  const [importOpen, setImportOpen] = useState(false);
  const [previewCard, setPreviewCard] = useState<FlashcardItem | null>(null);
  const [previewIndex, setPreviewIndex] = useState(0);

  // Queries and mutations
  const { data: flashcardsData, isLoading, error } = useFlashcards(moduleId || '');
  const createFlashcard = useCreateFlashcard(moduleId || '');
  const updateFlashcard = useUpdateFlashcard(moduleId || '');
  const deleteFlashcard = useDeleteFlashcard(moduleId || '');
  const bulkImport = useBulkImportFlashcards(moduleId || '');
  const reorderFlashcards = useReorderFlashcards(moduleId || '');

  const cards = flashcardsData?.cards || [];

  // Navigation
  const handleBack = useCallback(() => {
    navigate(`/staff/courses/${courseId}/modules/${moduleId}/edit`);
  }, [navigate, courseId, moduleId]);

  // Editor handlers
  const handleOpenEditor = useCallback((card?: FlashcardItem) => {
    setEditingCard(card);
    setEditorOpen(true);
  }, []);

  const handleCloseEditor = useCallback(() => {
    setEditorOpen(false);
    setEditingCard(undefined);
  }, []);

  const handleSaveCard = useCallback(
    async (data: CreateFlashcardRequest) => {
      try {
        if (editingCard) {
          await updateFlashcard.mutateAsync({
            cardId: editingCard.id,
            data: {
              front: data.front,
              back: data.back,
              tags: data.tags,
            },
          });
          toast({
            title: 'Flashcard updated',
            description: 'Your changes have been saved.',
          });
        } else {
          await createFlashcard.mutateAsync(data);
          toast({
            title: 'Flashcard created',
            description: 'New flashcard has been added to the deck.',
          });
        }
        handleCloseEditor();
      } catch {
        toast({
          title: editingCard ? 'Failed to update flashcard' : 'Failed to create flashcard',
          description: 'Please try again.',
          variant: 'destructive',
        });
      }
    },
    [editingCard, createFlashcard, updateFlashcard, handleCloseEditor, toast]
  );

  // Delete handler
  const handleDeleteCard = useCallback(
    async (cardId: string) => {
      try {
        await deleteFlashcard.mutateAsync(cardId);
        toast({
          title: 'Flashcard deleted',
          description: 'The flashcard has been removed from the deck.',
        });
      } catch {
        toast({
          title: 'Failed to delete flashcard',
          description: 'Please try again.',
          variant: 'destructive',
        });
      }
    },
    [deleteFlashcard, toast]
  );

  // Reorder handler
  const handleReorder = useCallback(
    async (cardIds: string[]) => {
      try {
        await reorderFlashcards.mutateAsync({ cardIds });
      } catch {
        toast({
          title: 'Failed to reorder flashcards',
          description: 'Please try again.',
          variant: 'destructive',
        });
      }
    },
    [reorderFlashcards, toast]
  );

  // Bulk import handlers
  const handleOpenImport = useCallback(() => {
    setImportOpen(true);
  }, []);

  const handleCloseImport = useCallback(() => {
    setImportOpen(false);
  }, []);

  const handleBulkImport = useCallback(
    async (importedCards: BulkFlashcardItem[], appendToExisting: boolean) => {
      try {
        const result = await bulkImport.mutateAsync({
          cards: importedCards,
          appendToExisting,
        });
        toast({
          title: 'Import complete',
          description: `Successfully imported ${result.imported} flashcard${result.imported > 1 ? 's' : ''}.`,
        });
        handleCloseImport();
      } catch {
        throw new Error('Import failed');
      }
    },
    [bulkImport, handleCloseImport, toast]
  );

  // Preview handlers
  const handlePreview = useCallback(
    (card: FlashcardItem) => {
      const index = cards.findIndex((c) => c.id === card.id);
      setPreviewIndex(index >= 0 ? index : 0);
      setPreviewCard(card);
    },
    [cards]
  );

  const handleClosePreview = useCallback(() => {
    setPreviewCard(null);
  }, []);

  const handleNavigatePreview = useCallback(
    (direction: 'prev' | 'next') => {
      const newIndex = direction === 'prev' ? previewIndex - 1 : previewIndex + 1;
      if (newIndex >= 0 && newIndex < cards.length) {
        setPreviewIndex(newIndex);
        setPreviewCard(cards[newIndex]);
      }
    },
    [previewIndex, cards]
  );

  // Validation
  if (!courseId || !moduleId) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertDescription>Missing required parameters</AlertDescription>
        </Alert>
      </div>
    );
  }

  const isAnyMutationPending =
    createFlashcard.isPending ||
    updateFlashcard.isPending ||
    deleteFlashcard.isPending ||
    bulkImport.isPending ||
    reorderFlashcards.isPending;

  return (
    <div className="container mx-auto py-8">
      <PageHeader
        title="Flashcard Deck"
        description={
          flashcardsData?.moduleName
            ? `Manage flashcards for ${flashcardsData.moduleName}`
            : 'Create and manage flashcards for this module'
        }
        className="mb-6"
        backButton={
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Module
          </Button>
        }
      >
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleOpenImport} disabled={isAnyMutationPending}>
            <Upload className="mr-2 h-4 w-4" />
            Import CSV
          </Button>
          <Button onClick={() => handleOpenEditor()} disabled={isAnyMutationPending}>
            <Plus className="mr-2 h-4 w-4" />
            Add Flashcard
          </Button>
        </div>
      </PageHeader>

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32 mt-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load flashcards: {error.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      {!isLoading && !error && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Flashcards ({cards.length})
                </CardTitle>
                <CardDescription>
                  Drag cards to reorder. Click to preview or use the menu to edit/delete.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <FlashcardList
              cards={cards}
              onEdit={handleOpenEditor}
              onDelete={handleDeleteCard}
              onPreview={handlePreview}
              onReorder={handleReorder}
              isLoading={isAnyMutationPending}
            />
          </CardContent>
        </Card>
      )}

      {/* Flashcard Editor Modal */}
      <FlashcardEditor
        open={editorOpen}
        onClose={handleCloseEditor}
        onSave={handleSaveCard}
        initialData={editingCard}
        isLoading={createFlashcard.isPending || updateFlashcard.isPending}
      />

      {/* Bulk Import Modal */}
      <FlashcardBulkImport
        open={importOpen}
        onClose={handleCloseImport}
        onImport={handleBulkImport}
        existingCardCount={cards.length}
        isLoading={bulkImport.isPending}
      />

      {/* Preview Modal */}
      <FlashcardPreview
        open={!!previewCard}
        onClose={handleClosePreview}
        card={previewCard}
        cards={cards}
        currentIndex={previewIndex}
        onNavigate={handleNavigatePreview}
      />
    </div>
  );
};

export default FlashcardDeckPage;
