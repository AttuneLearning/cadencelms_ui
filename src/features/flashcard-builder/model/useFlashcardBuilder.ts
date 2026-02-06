/**
 * Flashcard Builder React Query Hooks
 * Provides hooks for module-level flashcard authoring
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import {
  getFlashcards,
  createFlashcard,
  updateFlashcard,
  deleteFlashcard,
  bulkImportFlashcards,
  reorderFlashcards,
  type FlashcardsListResponse,
  type FlashcardItem,
  type CreateFlashcardRequest,
  type UpdateFlashcardRequest,
  type BulkImportRequest,
  type BulkImportResponse,
  type ReorderRequest,
} from '../api/flashcardBuilderApi';

// ============================================================================
// Query Keys
// ============================================================================

export const flashcardBuilderKeys = {
  all: ['flashcard-builder'] as const,
  lists: () => [...flashcardBuilderKeys.all, 'list'] as const,
  list: (moduleId: string) => [...flashcardBuilderKeys.lists(), moduleId] as const,
};

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook to fetch flashcards for a module
 * GET /modules/:moduleId/flashcards
 */
export function useFlashcards(
  moduleId: string,
  options?: Omit<
    UseQueryOptions<
      FlashcardsListResponse,
      Error,
      FlashcardsListResponse,
      ReturnType<typeof flashcardBuilderKeys.list>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: flashcardBuilderKeys.list(moduleId),
    queryFn: () => getFlashcards(moduleId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!moduleId,
    ...options,
  });
}

/**
 * Hook to create a flashcard
 * POST /modules/:moduleId/flashcards
 */
export function useCreateFlashcard(
  moduleId: string,
  options?: UseMutationOptions<FlashcardItem, Error, CreateFlashcardRequest>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => createFlashcard(moduleId, data),
    onSuccess: (newCard) => {
      // Update cached list with new card
      queryClient.setQueryData(
        flashcardBuilderKeys.list(moduleId),
        (old: FlashcardsListResponse | undefined) => {
          if (!old) return old;
          return {
            ...old,
            cards: [...old.cards, newCard],
            totalCards: old.totalCards + 1,
          };
        }
      );
    },
    ...options,
  });
}

/**
 * Hook to update a flashcard
 * PUT /modules/:moduleId/flashcards/:cardId
 */
export function useUpdateFlashcard(
  moduleId: string,
  options?: UseMutationOptions<FlashcardItem, Error, { cardId: string; data: UpdateFlashcardRequest }>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cardId, data }) => updateFlashcard(moduleId, cardId, data),
    onSuccess: (updatedCard) => {
      // Update cached list with updated card
      queryClient.setQueryData(
        flashcardBuilderKeys.list(moduleId),
        (old: FlashcardsListResponse | undefined) => {
          if (!old) return old;
          return {
            ...old,
            cards: old.cards.map((card) =>
              card.id === updatedCard.id ? updatedCard : card
            ),
          };
        }
      );
    },
    ...options,
  });
}

/**
 * Hook to delete a flashcard
 * DELETE /modules/:moduleId/flashcards/:cardId
 */
export function useDeleteFlashcard(
  moduleId: string,
  options?: UseMutationOptions<void, Error, string>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cardId) => deleteFlashcard(moduleId, cardId),
    onSuccess: (_, cardId) => {
      // Remove card from cached list
      queryClient.setQueryData(
        flashcardBuilderKeys.list(moduleId),
        (old: FlashcardsListResponse | undefined) => {
          if (!old) return old;
          return {
            ...old,
            cards: old.cards.filter((card) => card.id !== cardId),
            totalCards: old.totalCards - 1,
          };
        }
      );
    },
    ...options,
  });
}

/**
 * Hook to bulk import flashcards
 * POST /modules/:moduleId/flashcards/bulk
 */
export function useBulkImportFlashcards(
  moduleId: string,
  options?: UseMutationOptions<BulkImportResponse, Error, BulkImportRequest>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => bulkImportFlashcards(moduleId, data),
    onSuccess: () => {
      // Invalidate list to refetch with new cards
      queryClient.invalidateQueries({ queryKey: flashcardBuilderKeys.list(moduleId) });
    },
    ...options,
  });
}

/**
 * Hook to reorder flashcards
 * PATCH /modules/:moduleId/flashcards/reorder
 */
export function useReorderFlashcards(moduleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ReorderRequest) => reorderFlashcards(moduleId, data),
    onMutate: async (newOrder) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: flashcardBuilderKeys.list(moduleId) });

      // Snapshot previous value
      const previousData = queryClient.getQueryData<FlashcardsListResponse>(
        flashcardBuilderKeys.list(moduleId)
      );

      // Optimistically update with new order
      if (previousData) {
        const cardMap = new Map(previousData.cards.map((c) => [c.id, c]));
        const reorderedCards = newOrder.cardIds
          .map((id, index) => {
            const card = cardMap.get(id);
            return card ? { ...card, sequence: index } : null;
          })
          .filter((c): c is FlashcardItem => c !== null);

        queryClient.setQueryData(flashcardBuilderKeys.list(moduleId), {
          ...previousData,
          cards: reorderedCards,
        });
      }

      return { previousData };
    },
    onError: (_err, _newOrder, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(
          flashcardBuilderKeys.list(moduleId),
          context.previousData
        );
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: flashcardBuilderKeys.list(moduleId) });
    },
  });
}
