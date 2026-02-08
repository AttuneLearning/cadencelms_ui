/**
 * Assignment Editor
 * Full-page editor for file submission assignments with rubric
 */

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Switch } from '@/shared/ui/switch';
import { Badge } from '@/shared/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Checkbox } from '@/shared/ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form';
import {
  Plus,
  Trash2,
  GripVertical,
  FileText,
  FileImage,
  Video,
  File,
  Target,
} from 'lucide-react';
import { assignmentSchema, type AssignmentFormData } from '../../lib/validation';
import { EDITOR_CONFIGS } from '../../model/editor-config';

const FILE_TYPE_OPTIONS = [
  { id: 'pdf', label: 'PDF', icon: FileText },
  { id: 'docx', label: 'Word (DOCX)', icon: FileText },
  { id: 'txt', label: 'Text (TXT)', icon: FileText },
  { id: 'images', label: 'Images', icon: FileImage },
  { id: 'video', label: 'Video', icon: Video },
  { id: 'any', label: 'Any File Type', icon: File },
];

/**
 * Rubric criterion with performance levels
 */
interface RubricCriterion {
  id: string;
  name: string;
  points: number;
  levels: {
    label: string;
    points: number;
    description?: string;
  }[];
}

const DEFAULT_RUBRIC: RubricCriterion[] = [
  {
    id: '1',
    name: 'Content Quality',
    points: 40,
    levels: [
      { label: 'Excellent', points: 40, description: 'Demonstrates thorough understanding' },
      { label: 'Good', points: 30, description: 'Shows good understanding with minor gaps' },
      { label: 'Fair', points: 20, description: 'Basic understanding with notable gaps' },
      { label: 'Poor', points: 10, description: 'Minimal understanding demonstrated' },
    ],
  },
  {
    id: '2',
    name: 'Formatting',
    points: 20,
    levels: [
      { label: 'Excellent', points: 20 },
      { label: 'Good', points: 15 },
      { label: 'Fair', points: 10 },
      { label: 'Poor', points: 5 },
    ],
  },
  {
    id: '3',
    name: 'Timeliness',
    points: 40,
    levels: [
      { label: 'On Time', points: 40 },
      { label: '1 Day Late', points: 30 },
      { label: '2+ Days Late', points: 0 },
    ],
  },
];

export interface AssignmentEditorProps {
  moduleId: string;
  courseId: string;
  onSubmit: (data: AssignmentFormData) => void | Promise<void>;
  onDirtyChange?: (isDirty: boolean) => void;
  initialData?: Partial<AssignmentFormData>;
  isLoading?: boolean;
}

/**
 * Rubric Criterion Card Component
 */
function RubricCriterionCard({
  criterion,
  index,
  onEdit,
  onDelete,
}: {
  criterion: RubricCriterion;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="mb-3">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <button type="button" className="mt-1 cursor-grab text-muted-foreground hover:text-foreground">
            <GripVertical className="h-5 w-5" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">{index + 1}. {criterion.name}</span>
                <Badge variant="outline">
                  <Target className="mr-1 h-3 w-3" />
                  {criterion.points} points
                </Badge>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={onEdit}>
                  Edit
                </Button>
                <Button variant="ghost" size="sm" onClick={onDelete}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {criterion.levels.map((level, i) => (
                <div
                  key={i}
                  className="text-xs bg-muted rounded px-2 py-1"
                >
                  <span className="font-medium">{level.label}</span>
                  <span className="text-muted-foreground ml-1">({level.points})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Assignment Editor Component
 *
 * Provides tabbed editing for file submission assignments:
 * - Details: Basic metadata and total points
 * - Instructions: Assignment instructions (rich text)
 * - Rubric: Grading criteria builder
 * - Submission: File type and attempt settings
 */
export function AssignmentEditor({
  moduleId: _moduleId,
  courseId: _courseId,
  onSubmit,
  onDirtyChange,
  initialData,
  isLoading = false,
}: AssignmentEditorProps) {
  const config = EDITOR_CONFIGS.assignment;
  const [activeTab, setActiveTab] = useState('details');
  const [rubric, setRubric] = useState<RubricCriterion[]>(DEFAULT_RUBRIC);
  const [allowedFileTypes, setAllowedFileTypes] = useState<string[]>(['pdf', 'docx']);

  const totalPoints = rubric.reduce((sum, c) => sum + c.points, 0);

  const form = useForm<AssignmentFormData>({
    resolver: zodResolver(assignmentSchema),
    mode: 'onChange',
    defaultValues: {
      type: 'assignment',
      title: initialData?.title || '',
      description: initialData?.description || '',
      category: initialData?.category || config.defaultCategory,
      estimatedDuration: initialData?.estimatedDuration,
      isRequired: initialData?.isRequired ?? true,
      isReplayable: initialData?.isReplayable ?? true,
      weight: initialData?.weight || 100,
      settings: {
        allowMultipleAttempts: initialData?.settings?.allowMultipleAttempts ?? true,
        maxAttempts: initialData?.settings?.maxAttempts ?? 3,
      },
    },
  });

  const allowMultipleAttempts = form.watch('settings.allowMultipleAttempts') ?? false;
  const { isDirty } = form.formState;

  // Notify parent of dirty state
  if (onDirtyChange && isDirty) {
    onDirtyChange(isDirty);
  }

  const handleAddCriterion = useCallback(() => {
    const newCriterion: RubricCriterion = {
      id: Date.now().toString(),
      name: 'New Criterion',
      points: 10,
      levels: [
        { label: 'Excellent', points: 10 },
        { label: 'Good', points: 7 },
        { label: 'Fair', points: 4 },
        { label: 'Poor', points: 1 },
      ],
    };
    setRubric((prev) => [...prev, newCriterion]);
  }, []);

  const handleEditCriterion = useCallback((_id: string) => {
    // TODO: Implement criterion editing
  }, []);

  const handleDeleteCriterion = useCallback((id: string) => {
    setRubric((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const handleFileTypeToggle = useCallback((typeId: string, checked: boolean) => {
    if (typeId === 'any') {
      setAllowedFileTypes(checked ? ['any'] : []);
    } else {
      if (checked) {
        setAllowedFileTypes((prev) => prev.filter((t) => t !== 'any').concat(typeId));
      } else {
        setAllowedFileTypes((prev) => prev.filter((t) => t !== typeId));
      }
    }
  }, []);

  const onFormSubmit = (data: AssignmentFormData) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form id="activity-editor-form" onSubmit={form.handleSubmit(onFormSubmit)}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="instructions">Instructions</TabsTrigger>
            <TabsTrigger value="rubric">Rubric</TabsTrigger>
            <TabsTrigger value="submission">Submission</TabsTrigger>
          </TabsList>

        {/* Details Tab */}
        <TabsContent value="details" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Assignment Details</CardTitle>
              <CardDescription>
                Basic information about this assignment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Title <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter assignment title"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brief Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Short description shown in the course outline"
                        rows={2}
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Total Points & Weight */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Total Points</div>
                  <div className="flex items-center gap-2">
                    <div className="bg-muted rounded-md px-4 py-2 text-lg font-semibold">
                      {totalPoints}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      (from rubric)
                    </span>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          disabled={isLoading}
                          value={field.value ?? ''}
                          onChange={(event) => {
                            const value = event.target.value;
                            field.onChange(value === '' ? undefined : Number(value));
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Contribution to final grade
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Required Setting */}
              <div className="pt-4 border-t">
                <FormField
                  control={form.control}
                  name="isRequired"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between space-y-0">
                      <div className="space-y-0.5">
                        <FormLabel>Required for Completion</FormLabel>
                        <FormDescription>
                          Learners must submit this to complete the module
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={!!field.value}
                          onCheckedChange={field.onChange}
                          disabled={isLoading}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Instructions Tab */}
        <TabsContent value="instructions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Assignment Instructions</CardTitle>
              <CardDescription>
                Detailed instructions for learners
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* TODO: Replace with rich text editor in future */}
              <Textarea
                placeholder="Enter detailed instructions for this assignment...

Example:
- What learners need to submit
- Format requirements
- Key topics to address
- Resources they can use"
                rows={12}
                disabled={isLoading}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Rich text editor will be available in a future update
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rubric Tab */}
        <TabsContent value="rubric" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-3">
                    Rubric Criteria
                    <Badge variant="outline">
                      <Target className="mr-1 h-3 w-3" />
                      Total: {totalPoints} points
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Define grading criteria and point distribution
                  </CardDescription>
                </div>
                <Button variant="outline" onClick={handleAddCriterion}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Criterion
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {rubric.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No rubric criteria</p>
                  <p className="text-sm">Add criteria to define how this assignment will be graded</p>
                </div>
              ) : (
                <div>
                  {rubric.map((criterion, index) => (
                    <RubricCriterionCard
                      key={criterion.id}
                      criterion={criterion}
                      index={index}
                      onEdit={() => handleEditCriterion(criterion.id)}
                      onDelete={() => handleDeleteCriterion(criterion.id)}
                    />
                  ))}
                </div>
              )}

              {/* Rubric Preview */}
              {rubric.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-medium mb-3">Rubric Preview</h4>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted">
                        <tr>
                          <th className="text-left p-3 font-medium">Criterion</th>
                          {rubric[0]?.levels.map((_, i) => (
                            <th key={i} className="text-center p-3 font-medium">
                              Level {i + 1}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rubric.map((criterion) => (
                          <tr key={criterion.id} className="border-t">
                            <td className="p-3">
                              <div className="font-medium">{criterion.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {criterion.points} points max
                              </div>
                            </td>
                            {criterion.levels.map((level, i) => (
                              <td key={i} className="text-center p-3 border-l">
                                <div className="font-medium">{level.label}</div>
                                <div className="text-xs text-muted-foreground">
                                  {level.points} pts
                                </div>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Submission Settings Tab */}
        <TabsContent value="submission" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Submission Settings</CardTitle>
              <CardDescription>
                Configure file types and submission rules
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Allowed File Types */}
              <div className="space-y-3">
                <div className="text-sm font-medium">Allowed File Types</div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {FILE_TYPE_OPTIONS.map((type) => (
                    <label
                      key={type.id}
                      className={`
                        flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors
                        ${allowedFileTypes.includes(type.id) ? 'border-primary bg-primary/5' : 'hover:bg-muted'}
                        ${allowedFileTypes.includes('any') && type.id !== 'any' ? 'opacity-50' : ''}
                      `}
                    >
                      <Checkbox
                        checked={allowedFileTypes.includes(type.id) || (type.id !== 'any' && allowedFileTypes.includes('any'))}
                        onCheckedChange={(checked) => handleFileTypeToggle(type.id, !!checked)}
                        disabled={type.id !== 'any' && allowedFileTypes.includes('any')}
                      />
                      <type.icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Max File Size */}
              <div className="space-y-2">
                <div className="text-sm font-medium">Maximum File Size</div>
                <div className="flex items-center gap-2">
                  <Input
                    id="maxFileSize"
                    type="number"
                    min={1}
                    defaultValue={50}
                    className="w-24"
                    disabled={isLoading}
                  />
                  <span className="text-muted-foreground">MB</span>
                </div>
              </div>

              {/* Multiple Submissions */}
              <div className="space-y-4 pt-4 border-t">
                <FormField
                  control={form.control}
                  name="settings.allowMultipleAttempts"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between space-y-0">
                      <div className="space-y-0.5">
                        <FormLabel>Allow Resubmission</FormLabel>
                        <FormDescription>
                          Learners can submit multiple times
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={!!field.value}
                          onCheckedChange={field.onChange}
                          disabled={isLoading}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {allowMultipleAttempts && (
                  <FormField
                    control={form.control}
                    name="settings.maxAttempts"
                    render={({ field }) => (
                      <FormItem className="space-y-2 ml-4 pl-4 border-l">
                        <FormLabel>Maximum Submissions</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            className="w-24"
                            disabled={isLoading}
                            value={field.value ?? ''}
                            onChange={(event) => {
                              const value = event.target.value;
                              field.onChange(value === '' ? undefined : Number(value));
                            }}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Leave empty for unlimited submissions
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              {/* Late Submissions */}
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">Allow Late Submissions</div>
                    <p className="text-sm text-muted-foreground">
                      Accept submissions after the due date
                    </p>
                  </div>
                  <Switch
                    id="allowLate"
                    defaultChecked={true}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2 ml-4 pl-4 border-l">
                  <div className="text-sm font-medium">Late Penalty</div>
                  <div className="flex items-center gap-2">
                    <Input
                      id="latePenalty"
                      type="number"
                      min={0}
                      max={100}
                      defaultValue={10}
                      className="w-24"
                      disabled={isLoading}
                    />
                    <span className="text-muted-foreground">% per day</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        </Tabs>
      </form>
    </Form>
  );
}

export default AssignmentEditor;
