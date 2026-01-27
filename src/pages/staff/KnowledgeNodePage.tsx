/**
 * Knowledge Node Page
 * Manage knowledge graph for adaptive learning
 */

import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus } from 'lucide-react';

import { PageHeader } from '@/shared/ui/page-header';
import { ErrorPanel } from '@/shared/ui/error-panel';
import { Skeleton } from '@/shared/ui/skeleton';
import { Button } from '@/shared/ui/button';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';

import {
  useKnowledgeNodeTree,
  useDeleteKnowledgeNode,
} from '@/entities/knowledge-node';
import { KnowledgeNodeTree } from '@/entities/knowledge-node/ui';
import {
  CreateNodeDialog,
  EditNodeDialog,
  PrerequisiteManager,
} from '@/features/knowledge-node-management';

export function KnowledgeNodePage() {
  const { departmentId } = useParams<{ departmentId: string }>();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createParentId, setCreateParentId] = useState<string | undefined>();
  const [editTarget, setEditTarget] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const { data: tree, isLoading, error, refetch } = useKnowledgeNodeTree(departmentId!);

  const deleteMutation = useDeleteKnowledgeNode(departmentId!, {
    onSuccess: () => {
      setDeleteTarget(null);
      setSelectedNode(null);
    },
  });

  function handleAddChild(parentId: string) {
    setCreateParentId(parentId);
    setShowCreateDialog(true);
  }

  function handleCreateRoot() {
    setCreateParentId(undefined);
    setShowCreateDialog(true);
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorPanel
        error={error}
        onRetry={refetch}
        title="Failed to load knowledge nodes"
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Knowledge Graph"
        description="Manage the knowledge structure for adaptive learning"
      >
        <Button onClick={handleCreateRoot}>
          <Plus className="mr-2 h-4 w-4" />
          Create Root Node
        </Button>
      </PageHeader>

      <Tabs defaultValue="tree" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tree">Tree View</TabsTrigger>
          {selectedNode && <TabsTrigger value="prerequisites">Prerequisites</TabsTrigger>}
        </TabsList>

        <TabsContent value="tree" className="space-y-4">
          {tree && tree.length > 0 ? (
            <KnowledgeNodeTree
              tree={tree}
              onEdit={(nodeId) => {
                setEditTarget(nodeId);
                setSelectedNode(nodeId);
              }}
              onDelete={(nodeId) => {
                setDeleteTarget(nodeId);
              }}
              onAddChild={handleAddChild}
            />
          ) : (
            <div className="text-center py-12 border rounded-lg">
              <h3 className="text-lg font-medium mb-2">No knowledge nodes yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first knowledge node to start building the learning graph
              </p>
              <Button onClick={handleCreateRoot}>
                <Plus className="mr-2 h-4 w-4" />
                Create First Node
              </Button>
            </div>
          )}
        </TabsContent>

        {selectedNode && (
          <TabsContent value="prerequisites">
            <PrerequisiteManager
              departmentId={departmentId!}
              nodeId={selectedNode}
            />
          </TabsContent>
        )}
      </Tabs>

      <CreateNodeDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        departmentId={departmentId!}
        parentNodeId={createParentId}
      />

      {editTarget && (
        <EditNodeDialog
          open={!!editTarget}
          onOpenChange={() => setEditTarget(null)}
          departmentId={departmentId!}
          nodeId={editTarget}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteMutation.mutate(deleteTarget);
          }
        }}
        title="Delete Knowledge Node"
        description="Are you sure you want to delete this knowledge node? This will also remove it from any prerequisites and may affect the knowledge graph structure."
        confirmText="Delete"
        isDestructive={true}
        />
    </div>
  );
}
