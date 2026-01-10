/**
 * Class Management Page
 * Admin interface for managing classes with CRUD operations
 */

import React from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { DataTable } from '@/shared/ui/data-table';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Checkbox } from '@/shared/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Skeleton } from '@/shared/ui/skeleton';
import { useToast } from '@/shared/ui/use-toast';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import {
  type ClassListItem,
  type ClassStatus,
  type CreateClassPayload,
  type UpdateClassPayload,
  type RosterItem,
  type ClassEnrollment,
  useClasses,
  useCreateClass,
  useUpdateClass,
  useDeleteClass,
  useClassRoster,
  useClassEnrollments,
  useDropLearner,
  useEnrollLearners,
  ClassForm,
} from '@/entities/class';
import { useLearnerList } from '@/entities/learner';
import {
  MoreHorizontal,
  Plus,
  Trash,
  Edit,
  Users,
  UserPlus,
  UserMinus,
  Loader2,
} from 'lucide-react';

export const ClassManagementPage: React.FC = () => {
  // State for dialogs and modals
  const [selectedClasses, setSelectedClasses] = React.useState<ClassListItem[]>([]);
  const [classToEdit, setClassToEdit] = React.useState<ClassListItem | null>(null);
  const [classToDelete, setClassToDelete] = React.useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = React.useState(false);
  const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = React.useState(false);
  const [rosterClassId, setRosterClassId] = React.useState<string | null>(null);
  const [enrollmentClassId, setEnrollmentClassId] = React.useState<string | null>(null);
  const [learnerToDropId, setLearnerToDropId] = React.useState<string | null>(null);
  const [enrollmentIdToDrop, setEnrollmentIdToDrop] = React.useState<string | null>(null);
  const [isAddLearnersDialogOpen, setIsAddLearnersDialogOpen] = React.useState(false);
  const [selectedLearners, setSelectedLearners] = React.useState<string[]>([]);
  const [learnerSearchQuery, setLearnerSearchQuery] = React.useState('');

  // Filters state
  const [filters, setFilters] = React.useState({
    status: '' as ClassStatus | '',
    course: '',
    program: '',
    instructor: '',
    term: '',
    search: '',
  });

  const { toast } = useToast();

  // Fetch classes with filters
  const { data, isLoading } = useClasses({
    ...filters,
    status: filters.status || undefined,
  });

  // Fetch roster when viewing
  const { data: rosterData, isLoading: isRosterLoading } = useClassRoster(
    rosterClassId || '',
    { includeProgress: true },
    { enabled: !!rosterClassId }
  );

  // Fetch enrollments when managing
  const { data: enrollmentsData, isLoading: isEnrollmentsLoading } = useClassEnrollments(
    enrollmentClassId || '',
    {},
    { enabled: !!enrollmentClassId }
  );

  // Create class mutation
  const createMutation = useCreateClass();

  // Update class mutation
  const updateMutation = useUpdateClass();

  // Delete class mutation
  const deleteMutation = useDeleteClass();

  // Drop learner mutation
  const dropMutation = useDropLearner();

  // Enroll learners mutation
  const enrollMutation = useEnrollLearners();

  // Fetch all learners for enrollment dialog
  const { data: learnersData } = useLearnerList({
    pageSize: 1000,
    filters: learnerSearchQuery ? { search: learnerSearchQuery } : undefined,
  });

  const handleDelete = (id: string) => {
    setClassToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  const handleBulkDelete = () => {
    setIsBulkDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (classToDelete) {
      deleteMutation.mutate(
        { id: classToDelete },
        {
          onSuccess: () => {
            toast({
              title: 'Class deleted',
              description: 'Class has been successfully deleted.',
            });
            setIsDeleteConfirmOpen(false);
            setClassToDelete(null);
          },
          onError: (error: any) => {
            toast({
              title: 'Error',
              description: error.message || 'Failed to delete class. Please try again.',
              variant: 'destructive',
            });
          },
        }
      );
    }
  };

  const confirmBulkDelete = () => {
    // Delete selected classes one by one
    Promise.all(
      selectedClasses.map((cls) => deleteMutation.mutateAsync({ id: cls.id }))
    )
      .then(() => {
        toast({
          title: 'Classes deleted',
          description: `${selectedClasses.length} class(es) have been successfully deleted.`,
        });
        setSelectedClasses([]);
        setIsBulkDeleteConfirmOpen(false);
      })
      .catch(() => {
        toast({
          title: 'Error',
          description: 'Failed to delete classes. Please try again.',
          variant: 'destructive',
        });
      });
  };

  const handleCreateClass = (payload: CreateClassPayload) => {
    createMutation.mutate(payload, {
      onSuccess: () => {
        toast({
          title: 'Class created',
          description: 'Class has been successfully created.',
        });
        setIsCreateDialogOpen(false);
      },
      onError: (error: any) => {
        toast({
          title: 'Error',
          description: error.message || 'Failed to create class. Please try again.',
          variant: 'destructive',
        });
      },
    });
  };

  const handleUpdateClass = (payload: UpdateClassPayload) => {
    if (classToEdit) {
      updateMutation.mutate(
        { id: classToEdit.id, payload },
        {
          onSuccess: () => {
            toast({
              title: 'Class updated',
              description: 'Class has been successfully updated.',
            });
            setClassToEdit(null);
          },
          onError: (error: any) => {
            toast({
              title: 'Error',
              description: error.message || 'Failed to update class. Please try again.',
              variant: 'destructive',
            });
          },
        }
      );
    }
  };

  const handleDropLearner = () => {
    if (learnerToDropId && enrollmentIdToDrop) {
      dropMutation.mutate(
        {
          id: learnerToDropId,
          enrollmentId: enrollmentIdToDrop,
          reason: 'Dropped by admin',
        },
        {
          onSuccess: () => {
            toast({
              title: 'Learner dropped',
              description: 'Learner has been successfully dropped from the class.',
            });
            setLearnerToDropId(null);
            setEnrollmentIdToDrop(null);
          },
          onError: (error: any) => {
            toast({
              title: 'Error',
              description: error.message || 'Failed to drop learner. Please try again.',
              variant: 'destructive',
            });
          },
        }
      );
    }
  };

  const handleAddLearners = () => {
    if (!enrollmentClassId || selectedLearners.length === 0) {
      toast({
        title: 'No learners selected',
        description: 'Please select at least one learner to enroll.',
        variant: 'destructive',
      });
      return;
    }

    enrollMutation.mutate(
      {
        id: enrollmentClassId,
        payload: {
          learnerIds: selectedLearners,
          enrollmentDate: new Date().toISOString(),
        },
      },
      {
        onSuccess: (result) => {
          toast({
            title: 'Learners enrolled',
            description: `Successfully enrolled ${result.successCount} learner(s) in the class.`,
          });
          setIsAddLearnersDialogOpen(false);
          setSelectedLearners([]);
          setLearnerSearchQuery('');
        },
        onError: (error: any) => {
          toast({
            title: 'Enrollment failed',
            description: error.message || 'Failed to enroll learners. Please try again.',
            variant: 'destructive',
          });
        },
      }
    );
  };

  const handleLearnerToggle = (learnerId: string) => {
    setSelectedLearners((prev) =>
      prev.includes(learnerId)
        ? prev.filter((id) => id !== learnerId)
        : [...prev, learnerId]
    );
  };

  // Define columns
  const columns: ColumnDef<ClassListItem>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'name',
      header: 'Class Name',
      cell: ({ row }) => {
        const cls = row.original;
        return (
          <div>
            <div className="font-medium">{cls.name}</div>
            <div className="text-sm text-muted-foreground">
              {cls.course.code} - {cls.course.title}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'program',
      header: 'Program',
      cell: ({ row }) => {
        const cls = row.original;
        return (
          <div>
            <div>{cls.program.name}</div>
            {cls.programLevel && (
              <div className="text-sm text-muted-foreground">
                Level {cls.programLevel.levelNumber}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'instructors',
      header: 'Instructors',
      cell: ({ row }) => {
        const instructors = row.original.instructors;
        const primary = instructors.find((i) => i.role === 'primary');
        const secondary = instructors.filter((i) => i.role === 'secondary');

        return (
          <div>
            {primary && (
              <div className="font-medium">
                {primary.firstName} {primary.lastName}
              </div>
            )}
            {secondary.length > 0 && (
              <div className="text-sm text-muted-foreground">
                +{secondary.length} more
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'dates',
      header: 'Dates',
      cell: ({ row }) => {
        const cls = row.original;
        return (
          <div className="text-sm">
            <div>{format(new Date(cls.startDate), 'MMM dd, yyyy')}</div>
            <div className="text-muted-foreground">
              to {format(new Date(cls.endDate), 'MMM dd, yyyy')}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'enrollment',
      header: 'Enrollment',
      cell: ({ row }) => {
        const cls = row.original;
        const capacity = cls.capacity || 0;
        const enrolled = cls.enrolledCount;
        const available = capacity - enrolled;
        const isFull = capacity > 0 && enrolled >= capacity;

        return (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {enrolled}
              {capacity > 0 && ` / ${capacity}`}
            </span>
            {isFull ? (
              <Badge variant="destructive">Full</Badge>
            ) : capacity > 0 && available <= 5 ? (
              <Badge variant="secondary">
                {available} left
              </Badge>
            ) : null}
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        return <Badge variant={getStatusVariant(status)}>{formatStatus(status)}</Badge>;
      },
    },
    {
      accessorKey: 'academicTerm',
      header: 'Term',
      cell: ({ row }) => {
        const term = row.original.academicTerm;
        return term ? (
          <div className="text-sm">{term.name}</div>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const cls = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setClassToEdit(cls)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Class
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setRosterClassId(cls.id)}>
                <Users className="mr-2 h-4 w-4" />
                View Roster
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setEnrollmentClassId(cls.id)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Manage Enrollments
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDelete(cls.id)}
                className="text-destructive"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete Class
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Class Management</h1>
          <p className="text-muted-foreground">Manage class schedules and enrollments</p>
        </div>
        <div className="flex items-center gap-2">
          {selectedClasses.length > 0 && (
            <Button variant="destructive" onClick={handleBulkDelete}>
              <Trash className="mr-2 h-4 w-4" />
              Delete Selected ({selectedClasses.length})
            </Button>
          )}
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Class
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="w-full sm:w-[200px]">
          <Label htmlFor="status-filter">Status</Label>
          <Select
            value={filters.status}
            onValueChange={(value) =>
              setFilters({ ...filters, status: value as ClassStatus | '' })
            }
          >
            <SelectTrigger id="status-filter">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All statuses</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-[200px]">
          <Label htmlFor="search-filter">Search</Label>
          <Input
            id="search-filter"
            placeholder="Search classes..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
      </div>

      {/* Data Table */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={data?.classes || []}
          searchable={false}
          onRowSelectionChange={setSelectedClasses}
        />
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        open={isCreateDialogOpen || !!classToEdit}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false);
            setClassToEdit(null);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{classToEdit ? 'Edit Class' : 'Create New Class'}</DialogTitle>
            <DialogDescription>
              {classToEdit
                ? 'Update class information and settings.'
                : 'Add a new class to the system.'}
            </DialogDescription>
          </DialogHeader>
          <ClassForm
            initialClass={classToEdit ? undefined : undefined}
            onSubmit={(data) => {
              if (classToEdit) {
                handleUpdateClass(data as UpdateClassPayload);
              } else {
                handleCreateClass(data);
              }
            }}
            onCancel={() => {
              setIsCreateDialogOpen(false);
              setClassToEdit(null);
            }}
            isLoading={createMutation.isPending || updateMutation.isPending}
            error={createMutation.error || updateMutation.error}
          />
        </DialogContent>
      </Dialog>

      {/* Roster View Modal */}
      <Dialog open={!!rosterClassId} onOpenChange={() => setRosterClassId(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Class Roster</DialogTitle>
            <DialogDescription>
              {rosterData?.className} - {rosterData?.totalEnrolled} enrolled learners
            </DialogDescription>
          </DialogHeader>
          {isRosterLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : (
            <div className="space-y-2">
              {rosterData?.roster.map((item: RosterItem) => (
                <div
                  key={item.enrollmentId}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex-1">
                    <div className="font-medium">
                      {item.learner.firstName} {item.learner.lastName}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {item.learner.email}
                      {item.learner.studentId && ` | ${item.learner.studentId}`}
                    </div>
                    {item.progress && (
                      <div className="mt-2 text-sm">
                        Progress: {item.progress.completionPercent}% | Score:{' '}
                        {item.progress.currentScore || 'N/A'}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getEnrollmentStatusVariant(item.status)}>
                      {item.status}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setLearnerToDropId(rosterClassId);
                        setEnrollmentIdToDrop(item.enrollmentId);
                      }}
                      disabled={item.status !== 'active'}
                    >
                      <UserMinus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {(!rosterData?.roster || rosterData.roster.length === 0) && (
                <div className="py-8 text-center text-muted-foreground">
                  No learners enrolled yet.
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Enrollment Management Modal */}
      <Dialog open={!!enrollmentClassId} onOpenChange={() => setEnrollmentClassId(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Manage Enrollments</DialogTitle>
            <DialogDescription>Add or remove learners from this class.</DialogDescription>
          </DialogHeader>
          {isEnrollmentsLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : (
            <div className="space-y-4">
              <Button onClick={() => setIsAddLearnersDialogOpen(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Learners
              </Button>
              <div className="space-y-2">
                {enrollmentsData?.enrollments.map((enrollment: ClassEnrollment) => (
                  <div
                    key={enrollment.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div>
                      <div className="font-medium">
                        {enrollment.learner.firstName} {enrollment.learner.lastName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Enrolled: {format(new Date(enrollment.enrolledAt), 'MMM dd, yyyy')}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getEnrollmentStatusVariant(enrollment.status)}>
                        {enrollment.status}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setLearnerToDropId(enrollmentClassId);
                          setEnrollmentIdToDrop(enrollment.id);
                        }}
                        disabled={enrollment.status !== 'active'}
                      >
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {(!enrollmentsData?.enrollments ||
                  enrollmentsData.enrollments.length === 0) && (
                  <div className="py-8 text-center text-muted-foreground">
                    No enrollments found.
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        onConfirm={confirmDelete}
        title="Delete Class"
        description="Are you sure you want to delete this class? This action cannot be undone and will affect all enrolled learners."
        confirmText="Delete"
        isDestructive
        isLoading={deleteMutation.isPending}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmDialog
        open={isBulkDeleteConfirmOpen}
        onOpenChange={setIsBulkDeleteConfirmOpen}
        onConfirm={confirmBulkDelete}
        title="Delete Multiple Classes"
        description={`Are you sure you want to delete ${selectedClasses.length} class(es)? This action cannot be undone.`}
        confirmText="Delete All"
        isDestructive
        isLoading={deleteMutation.isPending}
      />

      {/* Drop Learner Confirmation */}
      <ConfirmDialog
        open={!!learnerToDropId && !!enrollmentIdToDrop}
        onOpenChange={() => {
          setLearnerToDropId(null);
          setEnrollmentIdToDrop(null);
        }}
        onConfirm={handleDropLearner}
        title="Drop Learner"
        description="Are you sure you want to drop this learner from the class? They will be marked as withdrawn."
        confirmText="Drop Learner"
        isDestructive
        isLoading={dropMutation.isPending}
      />

      {/* Add Learners Dialog */}
      <Dialog
        open={isAddLearnersDialogOpen}
        onOpenChange={(open) => {
          setIsAddLearnersDialogOpen(open);
          if (!open) {
            setSelectedLearners([]);
            setLearnerSearchQuery('');
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Learners to Class</DialogTitle>
            <DialogDescription>
              Select learners to enroll in this class. Already enrolled learners are filtered out.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Search */}
            <div>
              <Label htmlFor="learner-search">Search Learners</Label>
              <Input
                id="learner-search"
                placeholder="Search by name or email..."
                value={learnerSearchQuery}
                onChange={(e) => setLearnerSearchQuery(e.target.value)}
              />
            </div>

            {/* Selected count */}
            {selectedLearners.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm font-medium">
                  {selectedLearners.length} learner(s) selected
                </p>
              </div>
            )}

            {/* Learners list */}
            <div className="border rounded-md max-h-[400px] overflow-y-auto">
              {learnersData?.learners && learnersData.learners.length > 0 ? (
                <div className="divide-y">
                  {learnersData.learners
                    .filter((learner) => {
                      // Filter out already enrolled learners
                      const isEnrolled = enrollmentsData?.enrollments.some(
                        (enrollment: ClassEnrollment) => enrollment.learner.id === learner.id
                      );
                      return !isEnrolled;
                    })
                    .map((learner) => (
                      <div
                        key={learner.id}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleLearnerToggle(learner.id)}
                      >
                        <Checkbox
                          checked={selectedLearners.includes(learner.id)}
                          onCheckedChange={() => handleLearnerToggle(learner.id)}
                        />
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            {learner.firstName} {learner.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">{learner.email}</p>
                          {learner.studentId && (
                            <p className="text-xs text-muted-foreground">
                              ID: {learner.studentId}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  {learnerSearchQuery
                    ? 'No learners found matching your search.'
                    : 'No learners available to enroll.'}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddLearnersDialogOpen(false);
                  setSelectedLearners([]);
                  setLearnerSearchQuery('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddLearners}
                disabled={selectedLearners.length === 0 || enrollMutation.isPending}
              >
                {enrollMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enrolling...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Enroll {selectedLearners.length > 0 && `(${selectedLearners.length})`}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Helper functions
function formatStatus(status: ClassStatus): string {
  switch (status) {
    case 'upcoming':
      return 'Upcoming';
    case 'active':
      return 'Active';
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status;
  }
}

function getStatusVariant(
  status: ClassStatus
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'active':
      return 'default';
    case 'upcoming':
      return 'secondary';
    case 'completed':
      return 'outline';
    case 'cancelled':
      return 'destructive';
    default:
      return 'secondary';
  }
}

function getEnrollmentStatusVariant(
  status: string
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'active':
      return 'default';
    case 'completed':
      return 'outline';
    case 'withdrawn':
      return 'destructive';
    default:
      return 'secondary';
  }
}
