/**
 * ModuleList Component
 * Drag-and-drop sortable list of course modules
 */

import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { Alert } from '@/shared/ui/alert';
import type { CourseModuleListItem } from '@/entities/course-module';
import {
  GripVertical,
  MoreVertical,
  Edit,
  Trash,
  Plus,
  BookOpen,
  Clock,
  Eye,
  EyeOff,
} from 'lucide-react';

interface ModuleListProps {
  modules: CourseModuleListItem[];
  onReorder: (reorderedModules: CourseModuleListItem[]) => void;
  onEdit: (module: CourseModuleListItem) => void;
  onDelete: (module: CourseModuleListItem) => void;
  onAdd: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export const ModuleList: React.FC<ModuleListProps> = ({
  modules,
  onReorder,
  onEdit,
  onDelete,
  onAdd,
  isLoading = false,
  disabled = false,
}) => {
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [items, setItems] = React.useState(modules);

  // Update items when modules prop changes
  React.useEffect(() => {
    setItems(modules);
  }, [modules]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before starting drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      const reordered = arrayMove(items, oldIndex, newIndex).map((item, index) => ({
        ...item,
        order: index + 1,
      }));

      setItems(reordered);
      onReorder(reordered);
    }

    setActiveId(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const activeModule = items.find((item) => item.id === activeId);

  if (modules.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BookOpen className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">No modules yet</h3>
          <p className="mb-4 text-center text-muted-foreground">
            Start building your course by adding modules
          </p>
          <Button onClick={onAdd} disabled={disabled || isLoading}>
            <Plus className="mr-2 h-4 w-4" />
            Add First Module
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Course Modules</h3>
          <p className="text-sm text-muted-foreground">
            {disabled ? 'View course modules' : 'Drag to reorder, click to edit'}
          </p>
        </div>
        <Button onClick={onAdd} disabled={disabled || isLoading}>
          <Plus className="mr-2 h-4 w-4" />
          Add Module
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext items={items.map((m) => m.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {items.map((module) => (
              <SortableModuleCard
                key={module.id}
                module={module}
                onEdit={onEdit}
                onDelete={onDelete}
                isActive={activeId === module.id}
                disabled={disabled}
              />
            ))}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeModule ? (
            <ModuleCard module={activeModule} isDragging />
          ) : null}
        </DragOverlay>
      </DndContext>

      {items.length > 0 && (
        <Alert>
          <p className="text-sm">
            <strong>Tip:</strong> Drag modules by the grip handle to reorder them. Changes are saved automatically.
          </p>
        </Alert>
      )}
    </div>
  );
};

// Sortable Module Card Wrapper
interface SortableModuleCardProps {
  module: CourseModuleListItem;
  onEdit: (module: CourseModuleListItem) => void;
  onDelete: (module: CourseModuleListItem) => void;
  isActive?: boolean;
  disabled?: boolean;
}

const SortableModuleCard: React.FC<SortableModuleCardProps> = ({
  module,
  onEdit,
  onDelete,
  disabled = false,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: module.id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <ModuleCard
        module={module}
        onEdit={onEdit}
        onDelete={onDelete}
        dragHandleProps={disabled ? undefined : { ...attributes, ...listeners }}
        isDragging={isDragging}
        disabled={disabled}
      />
    </div>
  );
};

// Module Card Component
interface ModuleCardProps {
  module: CourseModuleListItem;
  onEdit?: (module: CourseModuleListItem) => void;
  onDelete?: (module: CourseModuleListItem) => void;
  dragHandleProps?: any;
  isDragging?: boolean;
  disabled?: boolean;
}

const ModuleCard: React.FC<ModuleCardProps> = ({
  module,
  onEdit,
  onDelete,
  dragHandleProps,
  isDragging = false,
  disabled = false,
}) => {
  return (
    <Card
      className={`transition-shadow ${
        isDragging
          ? 'shadow-lg ring-2 ring-primary'
          : 'hover:shadow-md'
      }`}
    >
      <CardHeader className="p-4">
        <div className="flex items-start gap-3">
          {/* Drag Handle */}
          {dragHandleProps && (
            <button
              {...dragHandleProps}
              className="mt-1 cursor-grab touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing"
            >
              <GripVertical className="h-5 w-5" />
            </button>
          )}

          {/* Module Icon */}
          <div className="flex-shrink-0">
            {getModuleIcon(module.type)}
          </div>

          {/* Module Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    Module {module.order}
                  </Badge>
                  {module.isPublished ? (
                    <Badge variant="default" className="text-xs">
                      <Eye className="mr-1 h-3 w-3" />
                      Published
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      <EyeOff className="mr-1 h-3 w-3" />
                      Draft
                    </Badge>
                  )}
                </div>
                <h4 className="truncate font-semibold">{module.title}</h4>
                {module.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {module.description}
                  </p>
                )}
              </div>

              {/* Actions Menu */}
              {onEdit && onDelete && !disabled && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(module)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Module
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(module)}
                      className="text-destructive"
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Delete Module
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Module Stats */}
            <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
              {module.duration && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatDuration(module.duration)}</span>
                </div>
              )}
              {module.passingScore && (
                <div className="flex items-center gap-1">
                  <span>Passing: {module.passingScore}%</span>
                </div>
              )}
              {module.contentId && (
                <div className="flex items-center gap-1">
                  <span>Content: {module.contentId.substring(0, 8)}...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};

// Helper Functions
function getModuleIcon(_type: string) {
  // Modules are organizational containers (chapters), so use a generic book icon
  // Content types are on Learning Units, not modules
  return <BookOpen className="h-5 w-5 text-muted-foreground" />;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}
