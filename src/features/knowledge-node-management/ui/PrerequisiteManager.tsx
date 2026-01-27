/**
 * Prerequisite Manager Component
 * Manage prerequisites for a knowledge node
 */

import { useState } from 'react';
import { Plus, X } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';

import {
  useKnowledgeNode,
  useKnowledgeNodes,
  useAddPrerequisite,
  useRemovePrerequisite,
} from '@/entities/knowledge-node';

interface PrerequisiteManagerProps {
  departmentId: string;
  nodeId: string;
}

export function PrerequisiteManager({
  departmentId,
  nodeId,
}: PrerequisiteManagerProps) {
  const [selectedPrereqId, setSelectedPrereqId] = useState<string>('');

  const { data: node } = useKnowledgeNode(departmentId, nodeId);
  const { data: allNodes } = useKnowledgeNodes(departmentId);

  const addPrereqMutation = useAddPrerequisite(departmentId, {
    onSuccess: () => setSelectedPrereqId(''),
  });

  const removePrereqMutation = useRemovePrerequisite(departmentId);

  const availableNodes = allNodes?.nodes.filter(
    (n) =>
      n.id !== nodeId &&
      !node?.prerequisiteNodeIds.includes(n.id)
  ) ?? [];

  const prerequisiteNodes = allNodes?.nodes.filter((n) =>
    node?.prerequisiteNodeIds.includes(n.id)
  ) ?? [];

  function handleAddPrerequisite() {
    if (selectedPrereqId) {
      addPrereqMutation.mutate({
        nodeId,
        payload: { prerequisiteNodeId: selectedPrereqId },
      });
    }
  }

  function handleRemovePrerequisite(prerequisiteId: string) {
    removePrereqMutation.mutate({ nodeId, prerequisiteId });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prerequisites</CardTitle>
        <CardDescription>
          Knowledge nodes that learners must master before this one
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Select value={selectedPrereqId} onValueChange={setSelectedPrereqId}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select a prerequisite node..." />
            </SelectTrigger>
            <SelectContent>
              {availableNodes.map((node) => (
                <SelectItem key={node.id} value={node.id}>
                  {node.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handleAddPrerequisite}
            disabled={!selectedPrereqId || addPrereqMutation.isPending}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>

        {prerequisiteNodes.length > 0 ? (
          <div className="space-y-2">
            {prerequisiteNodes.map((prereq) => (
              <div
                key={prereq.id}
                className="flex items-center justify-between p-2 rounded border"
              >
                <div>
                  <div className="font-medium">{prereq.name}</div>
                  {prereq.description && (
                    <div className="text-sm text-muted-foreground">
                      {prereq.description}
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemovePrerequisite(prereq.id)}
                  disabled={removePrereqMutation.isPending}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No prerequisites set. This is a foundational knowledge node.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
