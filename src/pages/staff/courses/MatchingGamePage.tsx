/**
 * MatchingGamePage
 * Staff page for creating and managing matching exercises for a module
 */

import { useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Upload, Puzzle, Settings } from 'lucide-react';
import { PageHeader } from '@/shared/ui/page-header';
import { Button } from '@/shared/ui/button';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { Label } from '@/shared/ui/label';
import { Switch } from '@/shared/ui/switch';
import { Badge } from '@/shared/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shared/ui/collapsible';
import { useToast } from '@/shared/ui/use-toast';
import {
  MatchingPairList,
  MatchingPairEditor,
  MatchingBulkImport,
  useMatchingExercise,
  useCreateMatchingExercise,
  useUpdateMatchingExercise,
  useUpdateMatchingPairs,
  useBulkImportMatchingPairs,
  useReorderMatchingPairs,
  type MatchingPairItem,
  type BulkMatchingPairItem,
} from '@/features/matching-builder';

// ============================================================================
// Types
// ============================================================================

interface MatchingGamePageParams {
  courseId: string;
  moduleId: string;
  exerciseId?: string;
}

interface ExerciseSettings {
  shufflePairs: boolean;
  timeLimit: number;
  attemptsAllowed: number;
  showFeedback: boolean;
  pointsPerMatch: number;
}

// ============================================================================
// Component
// ============================================================================

export const MatchingGamePage: React.FC = () => {
  const { courseId, moduleId, exerciseId } = useParams<
    Record<keyof MatchingGamePageParams, string>
  >();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Modal states
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingPair, setEditingPair] = useState<MatchingPairItem | undefined>();
  const [importOpen, setImportOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Form state for new exercise
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState(
    'Match each item on the left with its corresponding item on the right.'
  );
  const [localPairs, setLocalPairs] = useState<MatchingPairItem[]>([]);
  const [settings, setSettings] = useState<ExerciseSettings>({
    shufflePairs: true,
    timeLimit: 0,
    attemptsAllowed: 3,
    showFeedback: true,
    pointsPerMatch: 10,
  });

  // Determine if editing existing or creating new
  const isEditMode = !!exerciseId;

  // Queries and mutations
  const {
    data: exerciseData,
    isLoading,
    error,
  } = useMatchingExercise(moduleId || '', exerciseId || '');

  const createExercise = useCreateMatchingExercise(moduleId || '');
  const updateExercise = useUpdateMatchingExercise(moduleId || '');
  const updatePairs = useUpdateMatchingPairs(moduleId || '', exerciseId || '');
  const bulkImport = useBulkImportMatchingPairs(moduleId || '', exerciseId || '');
  const reorderPairs = useReorderMatchingPairs(moduleId || '', exerciseId || '');

  // Use exercise data if in edit mode, otherwise use local state
  const pairs = isEditMode
    ? exerciseData?.exercise?.pairs || []
    : localPairs;

  // Navigation
  const handleBack = useCallback(() => {
    navigate(`/staff/courses/${courseId}/modules/${moduleId}/edit`);
  }, [navigate, courseId, moduleId]);

  // Editor handlers
  const handleOpenEditor = useCallback((pair?: MatchingPairItem) => {
    setEditingPair(pair);
    setEditorOpen(true);
  }, []);

  const handleCloseEditor = useCallback(() => {
    setEditorOpen(false);
    setEditingPair(undefined);
  }, []);

  const handleSavePair = useCallback(
    async (data: { left: { text: string; hints?: string[] }; right: { text: string; explanation?: string } }) => {
      if (isEditMode && exerciseId) {
        // Update existing exercise pairs via API
        try {
          const existingPairs = pairs.map((p) => ({
            id: p.id,
            left: { text: p.left.text, hints: p.left.hints },
            right: { text: p.right.text, explanation: p.right.explanation },
          }));

          if (editingPair) {
            // Update existing pair
            const updatedPairs = existingPairs.map((p) =>
              p.id === editingPair.id
                ? { ...p, left: data.left, right: data.right }
                : p
            );
            await updatePairs.mutateAsync({ pairs: updatedPairs });
            toast({
              title: 'Pair updated',
              description: 'Your changes have been saved.',
            });
          } else {
            // Add new pair
            await updatePairs.mutateAsync({
              pairs: [...existingPairs, { left: data.left, right: data.right }],
            });
            toast({
              title: 'Pair added',
              description: 'New matching pair has been added.',
            });
          }
          handleCloseEditor();
        } catch {
          toast({
            title: 'Failed to save pair',
            description: 'Please try again.',
            variant: 'destructive',
          });
        }
      } else {
        // Local state for new exercise
        if (editingPair) {
          setLocalPairs((prev) =>
            prev.map((p) =>
              p.id === editingPair.id
                ? { ...p, left: { ...p.left, ...data.left }, right: { ...p.right, ...data.right } }
                : p
            )
          );
        } else {
          const newPair: MatchingPairItem = {
            id: `temp-${Date.now()}`,
            left: { text: data.left.text, hints: data.left.hints },
            right: { text: data.right.text, explanation: data.right.explanation },
            sequence: localPairs.length,
          };
          setLocalPairs((prev) => [...prev, newPair]);
        }
        handleCloseEditor();
      }
    },
    [isEditMode, exerciseId, pairs, editingPair, updatePairs, handleCloseEditor, toast, localPairs.length]
  );

  // Delete handler
  const handleDeletePair = useCallback(
    async (pairId: string) => {
      if (isEditMode && exerciseId) {
        try {
          const updatedPairs = pairs
            .filter((p) => p.id !== pairId)
            .map((p) => ({
              id: p.id,
              left: { text: p.left.text, hints: p.left.hints },
              right: { text: p.right.text, explanation: p.right.explanation },
            }));
          await updatePairs.mutateAsync({ pairs: updatedPairs });
          toast({
            title: 'Pair deleted',
            description: 'The matching pair has been removed.',
          });
        } catch {
          toast({
            title: 'Failed to delete pair',
            description: 'Please try again.',
            variant: 'destructive',
          });
        }
      } else {
        setLocalPairs((prev) => prev.filter((p) => p.id !== pairId));
      }
    },
    [isEditMode, exerciseId, pairs, updatePairs, toast]
  );

  // Reorder handler
  const handleReorder = useCallback(
    async (pairIds: string[]) => {
      if (isEditMode && exerciseId) {
        try {
          await reorderPairs.mutateAsync({ pairIds });
        } catch {
          toast({
            title: 'Failed to reorder pairs',
            description: 'Please try again.',
            variant: 'destructive',
          });
        }
      } else {
        const pairMap = new Map(localPairs.map((p) => [p.id, p]));
        const reorderedPairs = pairIds
          .map((id, index) => {
            const pair = pairMap.get(id);
            return pair ? { ...pair, sequence: index } : null;
          })
          .filter((p): p is MatchingPairItem => p !== null);
        setLocalPairs(reorderedPairs);
      }
    },
    [isEditMode, exerciseId, reorderPairs, localPairs, toast]
  );

  // Bulk import handlers
  const handleOpenImport = useCallback(() => {
    setImportOpen(true);
  }, []);

  const handleCloseImport = useCallback(() => {
    setImportOpen(false);
  }, []);

  const handleBulkImport = useCallback(
    async (importedPairs: BulkMatchingPairItem[], appendToExisting: boolean) => {
      if (isEditMode && exerciseId) {
        try {
          const result = await bulkImport.mutateAsync({
            pairs: importedPairs,
            appendToExisting,
          });
          toast({
            title: 'Import complete',
            description: `Successfully imported ${result.imported} pair${result.imported > 1 ? 's' : ''}.`,
          });
          handleCloseImport();
        } catch {
          throw new Error('Import failed');
        }
      } else {
        // Local import for new exercise
        const newPairs: MatchingPairItem[] = importedPairs.map((p, index) => ({
          id: `temp-${Date.now()}-${index}`,
          left: { text: p.left, hints: p.leftHints },
          right: { text: p.right, explanation: p.rightExplanation },
          sequence: appendToExisting ? localPairs.length + index : index,
        }));

        if (appendToExisting) {
          setLocalPairs((prev) => [...prev, ...newPairs]);
        } else {
          setLocalPairs(newPairs);
        }
        handleCloseImport();
      }
    },
    [isEditMode, exerciseId, bulkImport, handleCloseImport, toast, localPairs.length]
  );

  // Save new exercise
  const handleSaveExercise = useCallback(async () => {
    if (!title.trim()) {
      toast({
        title: 'Title required',
        description: 'Please enter a title for the matching exercise.',
        variant: 'destructive',
      });
      return;
    }

    if (localPairs.length < 2) {
      toast({
        title: 'More pairs needed',
        description: 'Please add at least 2 matching pairs.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createExercise.mutateAsync({
        title,
        description: description || undefined,
        instructions,
        pairs: localPairs.map((p) => ({
          left: { text: p.left.text, hints: p.left.hints },
          right: { text: p.right.text, explanation: p.right.explanation },
        })),
        settings,
      });

      toast({
        title: 'Matching exercise created',
        description: `"${title}" has been created with ${localPairs.length} pairs.`,
      });

      handleBack();
    } catch {
      toast({
        title: 'Failed to create exercise',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  }, [title, description, instructions, localPairs, settings, createExercise, toast, handleBack]);

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
    createExercise.isPending ||
    updateExercise.isPending ||
    updatePairs.isPending ||
    bulkImport.isPending ||
    reorderPairs.isPending;

  return (
    <div className="container mx-auto py-8">
      <PageHeader
        title={isEditMode ? 'Edit Matching Exercise' : 'Create Matching Exercise'}
        description={
          isEditMode && exerciseData?.moduleName
            ? `Edit matching pairs for ${exerciseData.moduleName}`
            : 'Create a matching exercise for this module'
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
            Add Pair
          </Button>
        </div>
      </PageHeader>

      {/* Loading State (edit mode only) */}
      {isEditMode && isLoading && (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32 mt-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load matching exercise: {error.message}
          </AlertDescription>
        </Alert>
      )}

      {/* New Exercise Form (create mode only) */}
      {!isEditMode && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Exercise Details</CardTitle>
            <CardDescription>
              Configure the matching exercise settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g., Vocabulary Matching"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Describe this matching exercise..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructions">Instructions</Label>
              <Textarea
                id="instructions"
                placeholder="Instructions for learners..."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              />
            </div>

            {/* Settings Collapsible */}
            <Collapsible open={settingsOpen} onOpenChange={setSettingsOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-start p-0 h-auto">
                  <Settings className="mr-2 h-4 w-4" />
                  <span className="text-sm font-medium">Advanced Settings</span>
                  <Badge variant="secondary" className="ml-2">
                    {settingsOpen ? 'Hide' : 'Show'}
                  </Badge>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-4 space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="timeLimit">Time Limit (min)</Label>
                    <Input
                      id="timeLimit"
                      type="number"
                      min={0}
                      max={60}
                      value={settings.timeLimit}
                      onChange={(e) =>
                        setSettings((s) => ({
                          ...s,
                          timeLimit: parseInt(e.target.value) || 0,
                        }))
                      }
                    />
                    <p className="text-xs text-muted-foreground">0 = unlimited</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="attempts">Attempts</Label>
                    <Input
                      id="attempts"
                      type="number"
                      min={0}
                      max={10}
                      value={settings.attemptsAllowed}
                      onChange={(e) =>
                        setSettings((s) => ({
                          ...s,
                          attemptsAllowed: parseInt(e.target.value) || 0,
                        }))
                      }
                    />
                    <p className="text-xs text-muted-foreground">0 = unlimited</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="points">Points per Match</Label>
                    <Input
                      id="points"
                      type="number"
                      min={1}
                      max={100}
                      value={settings.pointsPerMatch}
                      onChange={(e) =>
                        setSettings((s) => ({
                          ...s,
                          pointsPerMatch: parseInt(e.target.value) || 10,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-2">
                      <Switch
                        id="shuffle"
                        checked={settings.shufflePairs}
                        onCheckedChange={(checked) =>
                          setSettings((s) => ({ ...s, shufflePairs: checked }))
                        }
                      />
                      <Label htmlFor="shuffle">Shuffle pairs</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        id="feedback"
                        checked={settings.showFeedback}
                        onCheckedChange={(checked) =>
                          setSettings((s) => ({ ...s, showFeedback: checked }))
                        }
                      />
                      <Label htmlFor="feedback">Show feedback</Label>
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>
      )}

      {/* Main Content - Pairs List */}
      {(!isEditMode || (!isLoading && !error)) && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Puzzle className="h-5 w-5" />
                  Matching Pairs ({pairs.length})
                </CardTitle>
                <CardDescription>
                  Drag pairs to reorder. Click to edit or use the menu to delete.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <MatchingPairList
              pairs={pairs}
              onEdit={handleOpenEditor}
              onDelete={handleDeletePair}
              onReorder={handleReorder}
              isLoading={isAnyMutationPending}
            />
          </CardContent>
        </Card>
      )}

      {/* Save Button (create mode only) */}
      {!isEditMode && (
        <div className="flex justify-end mt-6">
          <Button
            size="lg"
            onClick={handleSaveExercise}
            disabled={isAnyMutationPending}
          >
            Create Matching Exercise
          </Button>
        </div>
      )}

      {/* Pair Editor Modal */}
      <MatchingPairEditor
        open={editorOpen}
        onClose={handleCloseEditor}
        onSave={handleSavePair}
        initialData={editingPair}
        isLoading={updatePairs.isPending}
      />

      {/* Bulk Import Modal */}
      <MatchingBulkImport
        open={importOpen}
        onClose={handleCloseImport}
        onImport={handleBulkImport}
        existingPairCount={pairs.length}
        isLoading={bulkImport.isPending}
      />
    </div>
  );
};

export default MatchingGamePage;
