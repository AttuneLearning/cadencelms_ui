# Pattern: Entity Action Menu

**Category:** Architecture
**Created:** 2026-02-05
**Tags:** #pattern #ui #crud #fsd #dropdown-menu

## Problem

Entity list pages (courses, users, departments) need consistent CRUD action menus. Actions like publish, archive, delete should:
- Be accessible from each list item
- Show confirmation dialogs for destructive actions
- Provide toast feedback on success/failure
- Respect user permissions
- Trigger list refresh after mutations

## Solution

Create a reusable `EntityActionMenu` feature component following FSD architecture:

```
src/features/{entity}-actions/
├── ui/
│   └── {Entity}ActionMenu.tsx
└── index.ts
```

The component:
1. Uses `DropdownMenu` from shadcn/ui for the action list
2. Uses `ConfirmDialog` for destructive actions
3. Consumes existing entity mutation hooks
4. Accepts `onActionComplete` callback for list refresh
5. Accepts `canEdit` prop for permission-based rendering

## Example

```typescript
// features/course-actions/ui/CourseActionMenu.tsx
export const CourseActionMenu: React.FC<CourseActionMenuProps> = ({
  course,
  onActionComplete,
  canEdit = true,
}) => {
  const { toast } = useToast();
  const [activeDialog, setActiveDialog] = useState<DialogType>(null);

  // Use existing entity hooks
  const deleteMutation = useDeleteCourse();
  const publishMutation = usePublishCourse();

  const handlePublish = async () => {
    try {
      await publishMutation.mutateAsync({ id: course.id });
      toast({ title: 'Course published' });
      setActiveDialog(null);
      onActionComplete?.();
    } catch (error) {
      toast({ title: 'Failed', variant: 'destructive' });
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {canEdit && isDraft && (
            <DropdownMenuItem onClick={() => setActiveDialog('publish')}>
              <Eye className="mr-2 h-4 w-4" /> Publish
            </DropdownMenuItem>
          )}
          {/* More actions... */}
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={activeDialog === 'publish'}
        onConfirm={handlePublish}
        title="Publish Course"
        description={`Publish "${course.title}"?`}
      />
    </>
  );
};
```

## Integration

```typescript
// In page component
const { data, refetch } = useCourses(filters);

return (
  <EntityCard>
    <CardHeader>
      <div className="flex items-start justify-between">
        <div>{/* Card content */}</div>
        <CourseActionMenu
          course={course}
          canEdit={hasPermission('course:edit-department')}
          onActionComplete={() => refetch()}
        />
      </div>
    </CardHeader>
  </EntityCard>
);
```

## When to Use

- Entity list pages with CRUD operations
- Card-based or table-based layouts
- When actions need confirmation dialogs
- When multiple status-dependent actions exist

## When NOT to Use

- Single-item detail pages (use explicit buttons instead)
- Simple read-only lists
- When only 1-2 actions exist (use explicit buttons)

## Related Patterns

- [[type-sharing-between-entities]] - For shared types across entities

## Examples in Codebase

- `src/features/course-actions/ui/CourseActionMenu.tsx` - Course CRUD actions
- `src/pages/admin/courses/CourseManagementPage.tsx:563-632` - Admin table with inline actions
- `src/pages/staff/departments/DepartmentCoursesPage.tsx:392-396` - Integration in card

## Key Components Used

| Component | Source | Purpose |
|-----------|--------|---------|
| `DropdownMenu` | `@/shared/ui/dropdown-menu` | Action menu container |
| `ConfirmDialog` | `@/shared/ui/confirm-dialog` | Destructive action confirmation |
| `useToast` | `@/shared/ui/use-toast` | Success/error feedback |

## Links

- Memory log: [[../memory-log]]
- ADR: [[../../dev_communication/architecture/decisions/ADR-UI-001-FSD-ARCHITECTURE]]
