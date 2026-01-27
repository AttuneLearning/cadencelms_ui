/**
 * Knowledge Node Tree Component
 * Hierarchical tree view for knowledge graph
 */

import { useState } from 'react';
import { ChevronRight, ChevronDown, Plus, Edit, Trash2 } from 'lucide-react';

import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shared/ui/collapsible';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/ui/tooltip';

import type { KnowledgeNodeTree as NodeTree } from '../model/types';

interface KnowledgeNodeTreeProps {
  tree: NodeTree[];
  onEdit: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
  onAddChild: (parentId: string) => void;
}

export function KnowledgeNodeTree({
  tree,
  onEdit,
  onDelete,
  onAddChild,
}: KnowledgeNodeTreeProps) {
  return (
    <TooltipProvider>
      <div className="space-y-2">
        {tree.map((item) => (
          <TreeNode
            key={item.node.id}
            item={item}
            onEdit={onEdit}
            onDelete={onDelete}
            onAddChild={onAddChild}
            depth={0}
          />
        ))}
      </div>
    </TooltipProvider>
  );
}

function TreeNode({
  item,
  onEdit,
  onDelete,
  onAddChild,
  depth,
}: {
  item: NodeTree;
  onEdit: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
  onAddChild: (parentId: string) => void;
  depth: number;
}) {
  const [isOpen, setIsOpen] = useState(depth < 2);
  const hasChildren = item.children.length > 0;

  return (
    <div style={{ marginLeft: depth * 24 }}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center gap-2 p-2 rounded hover:bg-muted">
          {hasChildren ? (
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                {isOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
          ) : (
            <div className="w-6" />
          )}

          <div className="flex-1">
            <div className="font-medium">{item.node.name}</div>
            {item.node.description && (
              <div className="text-sm text-muted-foreground line-clamp-1">
                {item.node.description}
              </div>
            )}
            <div className="flex gap-2 mt-1">
              <Badge variant="secondary">
                {item.node.questionCount} questions
              </Badge>
              <Badge variant="outline">
                Depth {item.node.depthRange.min}–{item.node.depthRange.max}
              </Badge>
              {item.node.prerequisiteNodeIds.length > 0 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline">
                      {item.node.prerequisiteNodeIds.length} prereqs
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    Prerequisites must be mastered first
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>

          <div className="flex gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onAddChild(item.node.id)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add child node</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(item.node.id)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit node</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(item.node.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete node</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {hasChildren && (
          <CollapsibleContent>
            {item.children.map((child) => (
              <TreeNode
                key={child.node.id}
                item={child}
                onEdit={onEdit}
                onDelete={onDelete}
                onAddChild={onAddChild}
                depth={depth + 1}
              />
            ))}
          </CollapsibleContent>
        )}
      </Collapsible>
    </div>
  );
}
