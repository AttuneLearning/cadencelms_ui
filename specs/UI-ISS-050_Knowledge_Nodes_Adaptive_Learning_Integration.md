# UI-ISS-050: Knowledge Nodes & Adaptive Learning Integration

**Created:** 2026-01-24
**Status:** Planning
**Priority:** High
**Depends On:** API Phases 1-7 (Complete)

---

## Summary

Integrate the Knowledge Node and Adaptive Learning system into the UI's question forms, exercise editor, and assessment editor. This enables intelligent question selection based on learner mastery and conceptual topic organization.

---

## Background

The API team has completed the full adaptive learning system (Phases 1-7):

1. **Cognitive Depth Levels**: Mastery progression (exposure → practice → proficiency → mastery)
2. **Knowledge Nodes**: Conceptual topic organization (separate from Question Banks)
3. **Learner Progress Tracking**: Per-node mastery scores and depth advancement
4. **Adaptive Question Selection**: AI-driven question selection based on learner progress

### Key Concepts

| Concept | Description |
|---------|-------------|
| **Question Bank** | Administrative grouping (who can access) |
| **Knowledge Node** | Conceptual grouping (what topic) |
| **Cognitive Depth** | Learning level (exposure, practice, proficiency, mastery) |
| **Adaptive Selection** | Auto-selects questions based on learner's current mastery |

Questions can belong to:
- **Multiple Question Banks** (administrative)
- **Zero or one Knowledge Node** (conceptual, optional)

---

## API Contracts Reference

New question fields (optional):
```typescript
{
  knowledgeNodeId?: string;  // ObjectId reference to KnowledgeNode
  cognitiveDepth?: 'exposure' | 'practice' | 'proficiency' | 'mastery';
}
```

New API endpoints:
- `GET /api/v2/departments/:departmentId/knowledge-nodes` - List nodes
- `GET /api/v2/departments/:departmentId/knowledge-nodes/tree` - Hierarchical tree
- `GET /api/v2/departments/:departmentId/cognitive-depth-levels` - Depth levels
- `POST /api/v2/adaptive/select-question` - Adaptive question selection
- `POST /api/v2/adaptive/record-response` - Record response & update progress

---

## Changes Required

### 1. Question Types Model (`model/question-types.ts`)

**Add new optional fields to `Question` interface:**

```typescript
export interface Question {
  // ... existing fields ...

  // NEW: Adaptive learning fields (optional)
  knowledgeNodeId?: string | null;
  knowledgeNodeName?: string | null;  // Denormalized for display
  cognitiveDepth?: CognitiveDepthLevel | null;
}

// NEW: Cognitive depth type
export type CognitiveDepthLevel = 'exposure' | 'practice' | 'proficiency' | 'mastery';

// NEW: Cognitive depth display config
export const COGNITIVE_DEPTH_CONFIGS: Record<CognitiveDepthLevel, { label: string; description: string; color: string }> = {
  exposure: { label: 'Exposure', description: 'Initial introduction to concept', color: 'blue' },
  practice: { label: 'Practice', description: 'Building familiarity', color: 'green' },
  proficiency: { label: 'Proficiency', description: 'Demonstrating understanding', color: 'yellow' },
  mastery: { label: 'Mastery', description: 'Expert-level knowledge', color: 'purple' },
};
```

**Add to `CreateQuestionRequest` interface:**

```typescript
export interface CreateQuestionRequest {
  // ... existing fields ...
  knowledgeNodeId?: string;
  cognitiveDepth?: CognitiveDepthLevel;
}
```

---

### 2. QuestionEditorModal (`ui/question-bank/QuestionEditorModal.tsx`)

**Add new form fields:**

| Field | Type | Location | Description |
|-------|------|----------|-------------|
| Knowledge Node | Combobox/Select | After "Tags" | Optional dropdown of department knowledge nodes |
| Cognitive Depth | Select | After Knowledge Node | Only shown when Knowledge Node is selected |

**Form schema additions:**

```typescript
const questionSchema = z.object({
  // ... existing fields ...

  // NEW: Adaptive learning fields
  knowledgeNodeId: z.string().optional(),
  cognitiveDepth: z.enum(['exposure', 'practice', 'proficiency', 'mastery']).optional(),
});
```

**UI Section (collapsible "Adaptive Learning" section):**

```
┌─────────────────────────────────────────────────────┐
│ ▼ Adaptive Learning (optional)                      │
├─────────────────────────────────────────────────────┤
│ Knowledge Node                                      │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Select a knowledge node...              ▼       │ │
│ └─────────────────────────────────────────────────┘ │
│ Links this question to a conceptual topic           │
│                                                     │
│ Cognitive Depth                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Practice                                ▼       │ │
│ └─────────────────────────────────────────────────┘ │
│ Learning level for adaptive selection               │
└─────────────────────────────────────────────────────┘
```

**Implementation notes:**
- Knowledge Node selector should be a searchable combobox (nodes can be numerous)
- Cognitive Depth selector only appears when a Knowledge Node is selected
- Both fields are optional to maintain backward compatibility

---

### 3. QuestionImportPicker (`ui/question-bank/QuestionImportPicker.tsx`)

**Add new filter options:**

| Filter | Type | Description |
|--------|------|-------------|
| Knowledge Node | Combobox | Filter by knowledge node |
| Cognitive Depth | Select | Filter by depth level |
| Has Knowledge Node | Checkbox | Show only adaptive-enabled questions |

**Update QuestionCard to show:**
- Knowledge Node badge (if assigned)
- Cognitive Depth badge (if assigned)

**UI mockup:**

```
┌──────────────────────────────────────────────────────────────┐
│ Filters                                                      │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐           │
│ │ All Types ▼  │ │ All Levels ▼ │ │ All Nodes ▼  │           │
│ └──────────────┘ └──────────────┘ └──────────────┘           │
│ ┌──────────────────┐                                         │
│ │ □ Adaptive only  │                                         │
│ └──────────────────┘                                         │
├──────────────────────────────────────────────────────────────┤
│ Question Card                                                │
│ ┌────────────────────────────────────────────────────────┐   │
│ │ □ What is the capital of France?                       │   │
│ │   [MC] [SA] [easy] [Geography] [Practice]              │   │
│ │                            ↑              ↑            │   │
│ │                       Node badge    Depth badge        │   │
│ └────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

---

### 4. ExerciseEditor (`ui/page-editors/ExerciseEditor.tsx`)

**Add new "Adaptive Learning" section in Settings tab:**

```
┌─────────────────────────────────────────────────────────────┐
│ Adaptive Learning                                           │
├─────────────────────────────────────────────────────────────┤
│ Enable Adaptive Mode                              [toggle]  │
│ Automatically adjust questions based on learner mastery     │
│                                                             │
│ ─────────────────────────────────────────────────────────── │
│ (When enabled:)                                             │
│                                                             │
│ Knowledge Node                                              │
│ ┌─────────────────────────────────────────────────────┐     │
│ │ Geography Fundamentals                        ▼     │     │
│ └─────────────────────────────────────────────────────┘     │
│ Questions will be selected from this conceptual topic       │
│                                                             │
│ Selection Mode                                              │
│ ○ Fixed Order - Present questions in defined order          │
│ ● Adaptive - Select based on learner's mastery level        │
│ ○ Random from Node - Randomly select from knowledge node    │
│                                                             │
│ Questions per Session                                       │
│ ┌────────┐                                                  │
│ │   10   │ questions                                        │
│ └────────┘                                                  │
└─────────────────────────────────────────────────────────────┘
```

**New form fields:**

```typescript
interface ExerciseFormData {
  // ... existing fields ...

  adaptiveSettings?: {
    enabled: boolean;
    knowledgeNodeId?: string;
    selectionMode: 'fixed' | 'adaptive' | 'random';
    questionsPerSession?: number;
  };
}
```

---

### 5. AssessmentEditor (`ui/page-editors/AssessmentEditor.tsx`)

**Add same "Adaptive Learning" section as ExerciseEditor, plus:**

Additional options for graded assessments:
- **Cognitive Depth Override**: Force all questions to a specific depth level
- **Adaptive Question Pool Size**: How many questions to select from

```
┌─────────────────────────────────────────────────────────────┐
│ Adaptive Assessment Options                                 │
├─────────────────────────────────────────────────────────────┤
│ Generate from Knowledge Node                      [toggle]  │
│ Automatically select questions based on learner mastery     │
│                                                             │
│ Knowledge Node                                              │
│ ┌─────────────────────────────────────────────────────┐     │
│ │ Chemistry Basics                              ▼     │     │
│ └─────────────────────────────────────────────────────┘     │
│                                                             │
│ Target Depth Level                                          │
│ ┌─────────────────────────────────────────────────────┐     │
│ │ Use learner's current level (adaptive)        ▼     │     │
│ └─────────────────────────────────────────────────────┘     │
│   Options: Use learner's current | Exposure | Practice |    │
│            Proficiency | Mastery                            │
│                                                             │
│ Question Count                                              │
│ ┌────────┐                                                  │
│ │   20   │ questions from pool                              │
│ └────────┘                                                  │
└─────────────────────────────────────────────────────────────┘
```

---

### 6. New Shared Components

#### KnowledgeNodeSelector

**File:** `src/shared/ui/knowledge-node-selector.tsx`

A combobox component for selecting knowledge nodes.

```typescript
interface KnowledgeNodeSelectorProps {
  departmentId: string;
  value?: string;
  onChange: (nodeId: string | undefined) => void;
  disabled?: boolean;
  placeholder?: string;
}
```

Features:
- Searchable dropdown
- Shows node hierarchy (indented children)
- Shows node description in tooltip
- Supports clear/reset

#### CognitiveDepthSelector

**File:** `src/shared/ui/cognitive-depth-selector.tsx`

A select component for cognitive depth levels.

```typescript
interface CognitiveDepthSelectorProps {
  departmentId?: string;  // For custom department levels
  value?: CognitiveDepthLevel;
  onChange: (depth: CognitiveDepthLevel | undefined) => void;
  disabled?: boolean;
  includeAdaptive?: boolean;  // Include "Use learner's current" option
}
```

Features:
- Shows depth level with description
- Color-coded badges
- Supports department-specific level overrides

#### KnowledgeNodeBadge

**File:** `src/shared/ui/knowledge-node-badge.tsx`

A badge component showing knowledge node assignment.

```typescript
interface KnowledgeNodeBadgeProps {
  nodeName: string;
  nodeId?: string;
  cognitiveDepth?: CognitiveDepthLevel;
  onClick?: () => void;
}
```

---

### 7. Knowledge Node Designer Page (NEW)

**Route:** `/staff/knowledge-nodes/:nodeId/design`
**File:** `src/pages/staff/knowledge-nodes/KnowledgeNodeDesignerPage.tsx`

A dedicated page for designing and managing the question distribution within a Knowledge Node. Shows all linked questions organized by cognitive depth level in a Kanban-style board.

#### Page Layout

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ ← Back to Knowledge Nodes                                                       │
│                                                                                 │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ 🧠 Geography Fundamentals                                          [Edit]   │ │
│ │ Understanding basic geography concepts including capitals, continents...    │ │
│ │ Prerequisites: None  |  Related: World History, Cultural Studies           │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ Questions: 24 total  |  Coverage: ████████░░ 80%  |  [+ Add Question]       │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │  EXPOSURE (6)    │  PRACTICE (8)    │  PROFICIENCY (7) │  MASTERY (3)      │ │
│ │  ───────────────────────────────────────────────────────────────────────── │ │
│ │  Min: 2 attempts │  Min: 3 attempts │  Min: 4 attempts │  Min: 5 attempts  │ │
│ │  Pass: 70%       │  Pass: 80%       │  Pass: 85%       │  Pass: 90%        │ │
│ │  ═══════════════════════════════════════════════════════════════════════   │ │
│ │                  │                  │                  │                   │ │
│ │  ┌────────────┐  │  ┌────────────┐  │  ┌────────────┐  │  ┌────────────┐  │ │
│ │  │ Q: What is │  │  │ Q: Name 3  │  │  │ Q: Compare │  │  │ Q: Analyze │  │ │
│ │  │ the capital│  │  │ European   │  │  │ the climate│  │  │ the geopo- │  │ │
│ │  │ of France? │  │  │ capitals   │  │  │ zones of...│  │  │ litical... │  │ │
│ │  │ [MC] [SA]  │  │  │ [SA]       │  │  │ [LA]       │  │  │ [LA]       │  │ │
│ │  │ ⋮ drag     │  │  │ ⋮ drag     │  │  │ ⋮ drag     │  │  │ ⋮ drag     │  │ │
│ │  └────────────┘  │  └────────────┘  │  └────────────┘  │  └────────────┘  │ │
│ │                  │                  │                  │                   │ │
│ │  ┌────────────┐  │  ┌────────────┐  │  ┌────────────┐  │                   │ │
│ │  │ Q: True or │  │  │ Q: Match   │  │  │ Q: Explain │  │                   │ │
│ │  │ False: The │  │  │ countries  │  │  │ why...     │  │                   │ │
│ │  │ Earth is...│  │  │ to their...│  │  │            │  │                   │ │
│ │  │ [TF]       │  │  │ [MA]       │  │  │ [LA]       │  │                   │ │
│ │  │ ⋮ drag     │  │  │ ⋮ drag     │  │  │ ⋮ drag     │  │                   │ │
│ │  └────────────┘  │  └────────────┘  │  └────────────┘  │                   │ │
│ │                  │                  │                  │                   │ │
│ │  ┌────────────┐  │  ┌────────────┐  │  ...             │                   │ │
│ │  │ ...        │  │  │ ...        │  │                  │                   │ │
│ │  └────────────┘  │  └────────────┘  │                  │                   │ │
│ │                  │                  │                  │                   │ │
│ │  [+ Add to      │  [+ Add to       │  [+ Add to       │  [+ Add to        │ │
│ │   Exposure]     │   Practice]      │   Proficiency]   │   Mastery]        │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ Unassigned Questions (12)                                    [Assign All ▼] │ │
│ │ Questions linked to this node but without a cognitive depth                 │ │
│ │ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐                 │ │
│ │ │ Q: Which   │ │ Q: What... │ │ Q: How...  │ │ Q: When... │  ...            │ │
│ │ │ continent..│ │            │ │            │ │            │                 │ │
│ │ │ [MC]       │ │ [TF]       │ │ [SA]       │ │ [MC]       │                 │ │
│ │ └────────────┘ └────────────┘ └────────────┘ └────────────┘                 │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
```

#### Features

**Header Section:**
- Knowledge Node name and description
- Edit button to modify node properties
- Prerequisites and related nodes display
- Breadcrumb navigation back to node list

**Statistics Bar:**
- Total question count
- Coverage indicator (% of depths with adequate questions)
- Quick action to add new question

**Cognitive Depth Columns (Kanban Board):**
- One column per depth level (exposure, practice, proficiency, mastery)
- Column header shows:
  - Depth name and question count
  - Minimum attempts required
  - Pass threshold percentage
- Drag-and-drop questions between columns to change depth
- Questions show:
  - Truncated question text
  - Question type badges
  - Drag handle
- "Add to [Depth]" button at bottom of each column

**Unassigned Questions Section:**
- Questions linked to node but without `cognitiveDepth` set
- Horizontal scrollable list
- Drag to columns to assign depth
- "Assign All" dropdown for bulk assignment

**Question Card (Mini):**
```typescript
interface QuestionMiniCardProps {
  question: Question;
  onEdit: () => void;
  onRemove: () => void;
  draggable?: boolean;
}
```

Display:
- Question text (truncated to 2 lines)
- Question type badges (MC, SA, etc.)
- Points (if graded context)
- Edit/Remove actions on hover

#### Component Structure

```
src/pages/staff/knowledge-nodes/
├── KnowledgeNodeDesignerPage.tsx      # Main page component
├── index.ts                            # Exports
└── components/
    ├── NodeHeader.tsx                  # Node info header
    ├── DepthColumn.tsx                 # Single depth column
    ├── QuestionMiniCard.tsx            # Draggable question card
    ├── UnassignedSection.tsx           # Unassigned questions area
    ├── DepthStatistics.tsx             # Coverage stats
    └── AddQuestionToDepth.tsx          # Add question modal/dropdown
```

#### State Management

```typescript
interface KnowledgeNodeDesignerState {
  node: KnowledgeNode;
  questions: Question[];
  depthLevels: CognitiveDepthLevel[];
  draggedQuestion: Question | null;
  isLoading: boolean;
}

// Group questions by depth
const questionsByDepth = useMemo(() => {
  return {
    exposure: questions.filter(q => q.cognitiveDepth === 'exposure'),
    practice: questions.filter(q => q.cognitiveDepth === 'practice'),
    proficiency: questions.filter(q => q.cognitiveDepth === 'proficiency'),
    mastery: questions.filter(q => q.cognitiveDepth === 'mastery'),
    unassigned: questions.filter(q => !q.cognitiveDepth),
  };
}, [questions]);
```

#### API Interactions

```typescript
// Load node questions
GET /api/v2/departments/:departmentId/knowledge-nodes/:nodeId/questions

// Update question depth (on drag-drop)
PATCH /api/v2/departments/:departmentId/questions/:questionId
{
  "cognitiveDepth": "practice"
}

// Bulk assign depth
PATCH /api/v2/departments/:departmentId/questions/bulk
{
  "questionIds": ["q1", "q2", "q3"],
  "cognitiveDepth": "exposure"
}
```

#### Drag and Drop

Use `@dnd-kit/core` for drag-and-drop functionality:

```typescript
import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

function KnowledgeNodeDesigner() {
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const questionId = active.id as string;
    const newDepth = over.id as CognitiveDepthLevel;

    // Update question's cognitive depth
    await updateQuestionDepth(questionId, newDepth);
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      {/* Depth columns as drop targets */}
    </DndContext>
  );
}
```

#### Route Configuration

```typescript
// src/app/router/index.tsx
{
  path: '/staff/knowledge-nodes/:nodeId/design',
  element: <KnowledgeNodeDesignerPage />,
  meta: {
    title: 'Design Knowledge Node',
    requiredPermissions: ['content:department:manage'],
  },
}
```

#### Sidebar Navigation Addition

Add to staff sidebar:
```typescript
{
  label: 'Knowledge Nodes',
  icon: Brain,
  href: '/staff/knowledge-nodes',
  children: [
    { label: 'All Nodes', href: '/staff/knowledge-nodes' },
    { label: 'Node Tree', href: '/staff/knowledge-nodes/tree' },
  ],
}
```

#### Cognitive Depth Settings Configuration

The Designer page includes a settings panel for configuring cognitive depth thresholds. Settings cascade in a hierarchy:

```
System Defaults → Department Overrides → Course Overrides (if allowed)
```

**Settings Panel (accessible via gear icon in column header):**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ ⚙️ Cognitive Depth Settings                                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│ Settings Level: [Department ▼]     □ Allow course-level overrides               │
│                                                                                 │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ EXPOSURE                                                          [Reset]   │ │
│ │ ─────────────────────────────────────────────────────────────────────────── │ │
│ │ Minimum Attempts    ┌────┐                                                  │ │
│ │                     │  2 │                                                  │ │
│ │                     └────┘                                                  │ │
│ │ Pass Threshold      ┌────┐                                                  │ │
│ │                     │ 70 │ %                                                │ │
│ │                     └────┘                                                  │ │
│ │ Description         ┌──────────────────────────────────────────────────┐    │ │
│ │                     │ Initial introduction to concept                  │    │ │
│ │                     └──────────────────────────────────────────────────┘    │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ PRACTICE                                                          [Reset]   │ │
│ │ ... (same fields)                                                           │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ PROFICIENCY                                                       [Reset]   │ │
│ │ ... (same fields)                                                           │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ MASTERY                                                           [Reset]   │ │
│ │ ... (same fields)                                                           │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│ [+ Add Custom Depth Level]                                                      │
│                                                                                 │
│                                              [Cancel]  [Save Settings]          │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Configuration Hierarchy:**

| Level | Who Can Edit | Scope | Override Behavior |
|-------|--------------|-------|-------------------|
| **System** | Platform Admin | All departments | Base defaults |
| **Department** | Dept Admin | All courses in dept | Overrides system |
| **Course** | Course Designer | Single course | Overrides dept (if allowed) |

**Department Settings:**
- Edit via Knowledge Node Designer settings panel
- Toggle: "Allow course-level overrides" (default: false)
- Can add custom depth levels beyond the 4 defaults
- Reset button reverts to system defaults

**Course Settings (when allowed):**
- Course designer sees "Customize for this course" option
- Creates course-specific copy of depth settings
- Only applies to adaptive activities in that course
- Badge indicates "Using course settings" vs "Using department settings"

**API Endpoints for Settings:**

```typescript
// Get merged settings (system + department + course if applicable)
GET /api/v2/departments/:departmentId/cognitive-depth-levels
GET /api/v2/courses/:courseId/cognitive-depth-levels

// Update department settings
PUT /api/v2/departments/:departmentId/cognitive-depth-levels/:slug

// Update course settings (if allowed)
PUT /api/v2/courses/:courseId/cognitive-depth-levels/:slug

// Check if course overrides are allowed
GET /api/v2/departments/:departmentId/settings
{
  "allowCourseDepthOverrides": true
}
```

**Data Model:**

```typescript
interface CognitiveDepthLevel {
  slug: string;                    // 'exposure', 'practice', etc.
  name: string;                    // Display name
  description: string;
  advanceThreshold: number;        // 0-100 (pass %)
  minAttempts: number;
  order: number;                   // Sort order
  isSystem: boolean;               // True if system default
  departmentId?: string;           // Set if department override
  courseId?: string;               // Set if course override
}

interface DepartmentAdaptiveSettings {
  allowCourseDepthOverrides: boolean;
  customDepthLevels: CognitiveDepthLevel[];
}
```

**UI States:**

1. **Viewing System Defaults** (read-only for non-platform-admins):
   - Shows "System Default" badge
   - "Customize for Department" button

2. **Viewing Department Settings**:
   - Shows "Department Settings" badge
   - Editable by dept admins
   - Toggle for course overrides

3. **Viewing Course Settings** (when in course context):
   - Shows "Course Settings" badge
   - "Reset to Department Settings" button
   - Only visible if department allows overrides

---

### 8. Knowledge Node List Page

**Route:** `/staff/knowledge-nodes`
**File:** `src/pages/staff/knowledge-nodes/KnowledgeNodeListPage.tsx`

List view of all knowledge nodes in the department.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ Knowledge Nodes                                              [+ Create Node]    │
│ Organize questions by conceptual topics for adaptive learning                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│ 🔍 Search nodes...                    │ Filter: [All ▼] │ View: [List] [Tree]  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ 🧠 Geography Fundamentals                                                   │ │
│ │ Understanding basic geography concepts                                      │ │
│ │ Questions: 24  │  Depth Range: Exposure → Mastery  │  [Design] [Edit] [⋮]  │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ 🧠 European Capitals (child of Geography Fundamentals)                      │ │
│ │ Capital cities of European countries                                        │ │
│ │ Questions: 12  │  Depth Range: Exposure → Proficiency  │  [Design] [Edit]  │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ 🧠 Chemistry Basics                                                         │ │
│ │ Fundamental chemistry concepts                                              │ │
│ │ Questions: 45  │  Depth Range: Exposure → Mastery  │  [Design] [Edit] [⋮]  │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Actions:**
- **Design**: Navigate to `/staff/knowledge-nodes/:nodeId/design`
- **Edit**: Open edit modal for node properties
- **Delete**: Delete node (with confirmation)
- **View Tree**: Toggle tree view showing parent/child relationships

---

### 9. New API Hooks

**File:** `src/entities/knowledge-node/hooks/useKnowledgeNodes.ts`

```typescript
// List knowledge nodes for a department
export function useKnowledgeNodes(departmentId: string, options?: { enabled?: boolean });

// Get knowledge node tree
export function useKnowledgeNodeTree(departmentId: string);

// Get single knowledge node
export function useKnowledgeNode(nodeId: string);
```

**File:** `src/entities/cognitive-depth/hooks/useCognitiveDepthLevels.ts`

```typescript
// Get cognitive depth levels (merged system + department)
export function useCognitiveDepthLevels(departmentId?: string);
```

**File:** `src/features/adaptive-learning/hooks/useAdaptiveSelection.ts`

```typescript
// Select questions adaptively
export function useAdaptiveQuestionSelection();

// Record response and update progress
export function useRecordAdaptiveResponse();
```

---

## Implementation Plan

### Phase 1: Foundation (Model & Types)
1. Update `Question` interface with new fields
2. Add `CognitiveDepthLevel` type and configs
3. Create Knowledge Node types

### Phase 2: API Integration (Hooks)
1. Create knowledge-node entity with API hooks
2. Create cognitive-depth entity with API hooks
3. Create adaptive-selection hooks

### Phase 3: Shared Components
1. Build `KnowledgeNodeSelector` component
2. Build `CognitiveDepthSelector` component
3. Build `KnowledgeNodeBadge` component
4. Build `QuestionMiniCard` component (draggable)

### Phase 4: Knowledge Node Pages (NEW)
1. Create Knowledge Node List page
2. Create Knowledge Node Designer page (Kanban board)
3. Implement drag-and-drop with @dnd-kit
4. Add sidebar navigation for Knowledge Nodes
5. Create Node CRUD modal (create/edit)

### Phase 5: QuestionEditorModal Update
1. Add Adaptive Learning collapsible section
2. Integrate Knowledge Node selector
3. Integrate Cognitive Depth selector
4. Update form schema and submission

### Phase 6: QuestionImportPicker Update
1. Add Knowledge Node filter
2. Add Cognitive Depth filter
3. Add "Adaptive only" checkbox
4. Update question cards with badges

### Phase 7: ExerciseEditor Update
1. Add Adaptive Learning settings section
2. Implement adaptive mode toggle
3. Add knowledge node selection
4. Add selection mode options

### Phase 8: AssessmentEditor Update
1. Add Adaptive Assessment section
2. Implement generate from node option
3. Add target depth level selector
4. Add question count configuration

### Phase 9: Testing & Polish
1. Unit tests for new components
2. Integration tests for adaptive flows
3. E2E tests for full adaptive journey
4. Drag-and-drop accessibility testing

---

## Acceptance Criteria

### Knowledge Node List Page
- [ ] Lists all knowledge nodes for department
- [ ] Shows question count and depth range per node
- [ ] Can create new knowledge node
- [ ] Can edit node properties
- [ ] Can delete node (with confirmation)
- [ ] Can toggle between list and tree view
- [ ] Search/filter functionality works
- [ ] "Design" button navigates to designer page

### Knowledge Node Designer Page
- [ ] Displays node header with name, description, prerequisites
- [ ] Shows statistics bar (question count, coverage %)
- [ ] Renders 4 columns for cognitive depth levels (or custom levels)
- [ ] Column headers show depth config (min attempts, pass %)
- [ ] Questions display as draggable cards
- [ ] Drag-and-drop updates question depth via API
- [ ] Unassigned questions section shows questions without depth
- [ ] Can bulk assign depth to unassigned questions
- [ ] "Add Question" opens question selector/creator
- [ ] Edit/remove actions work on question cards
- [ ] Optimistic updates with error rollback

### Cognitive Depth Settings (Designer Page)
- [ ] Settings accessible via gear icon in column header
- [ ] Shows current settings level (System/Department/Course)
- [ ] Department admins can edit depth thresholds
- [ ] Department admins can toggle "Allow course overrides"
- [ ] Department admins can add custom depth levels
- [ ] Reset button reverts individual levels to parent defaults
- [ ] Course designers see "Customize for this course" (if allowed)
- [ ] Course settings show "Using course settings" badge
- [ ] Course designers can reset to department settings

### QuestionEditorModal
- [ ] Can select a Knowledge Node (optional)
- [ ] Can select Cognitive Depth when node is selected
- [ ] Fields are optional and don't break existing questions
- [ ] Saves `knowledgeNodeId` and `cognitiveDepth` to API

### QuestionImportPicker
- [ ] Can filter by Knowledge Node
- [ ] Can filter by Cognitive Depth
- [ ] Can filter to show only adaptive-enabled questions
- [ ] Question cards show node and depth badges

### ExerciseEditor
- [ ] Can enable/disable Adaptive Mode
- [ ] Can select Knowledge Node for adaptive selection
- [ ] Can choose selection mode (fixed, adaptive, random)
- [ ] Can set questions per session

### AssessmentEditor
- [ ] Can enable "Generate from Knowledge Node"
- [ ] Can select target Knowledge Node
- [ ] Can override depth level or use adaptive
- [ ] Can set question count from pool

### Shared Components
- [ ] KnowledgeNodeSelector is searchable and shows hierarchy
- [ ] CognitiveDepthSelector supports custom department levels
- [ ] KnowledgeNodeBadge displays correctly in all contexts
- [ ] QuestionMiniCard is draggable and shows essential info

---

## Dependencies

### Existing (Complete)
- API Phases 1-7 deployed (COMPLETE)
- Knowledge Node endpoints available
- Cognitive Depth Level endpoints available (department-level)
- Adaptive Selection endpoints available

### API Enhancements Needed
The following API enhancements are needed for full settings hierarchy support:

| Feature | Endpoint | Status |
|---------|----------|--------|
| Course-level depth overrides | `GET/PUT /api/v2/courses/:courseId/cognitive-depth-levels` | **Needs API** |
| Department override permission | `allowCourseDepthOverrides` in department settings | **Needs API** |
| Bulk question depth update | `PATCH /api/v2/departments/:departmentId/questions/bulk` | **Needs API** |

**Note to API Team:** The course-level override feature allows course designers to customize cognitive depth thresholds for their specific course (e.g., lowering the mastery threshold from 90% to 85%). This is gated by a department-level permission flag. If not implemented, the UI will hide course-level customization options.

---

## Notes

- All adaptive learning fields are **optional** to maintain backward compatibility
- Existing Question Bank workflows continue unchanged
- Adaptive features are opt-in per exercise/assessment
- Department can customize cognitive depth thresholds

### UX Decision: Knowledge Node Designer as Dedicated Page

The Knowledge Node Designer is implemented as a **dedicated page** rather than a view mode within the Question Bank for these reasons:

1. **Different Mental Model**: Question Banks are administrative containers (who can access), while Knowledge Nodes are conceptual containers (what topic). Mixing them in one view conflates these distinct purposes.

2. **Drag-and-Drop UX**: The Kanban-style depth column layout requires significant horizontal space and dedicated interaction patterns. This works best as a full-page experience.

3. **Task Focus**: Content designers organizing adaptive learning sequences are performing a different task than those managing question banks. Dedicated tooling reduces cognitive load.

4. **Future Extensibility**: The designer page can evolve to include:
   - Visual graph editor for prerequisites
   - Learner progress analytics overlay
   - AI-suggested depth assignments
   - Question gap analysis

**Alternative Considered**: Adding a "View by Depth" toggle to Question Bank pages. This was rejected because it would require filtering to a single node first, and the Kanban layout doesn't fit the table-based Question Bank UI pattern.

**Navigation Integration**: The Knowledge Node Designer is accessible from:
- Staff sidebar → Knowledge Nodes → [Node] → Design
- Question Bank page → Questions filtered by node → "Design Node" button
- Question Editor → Knowledge Node field → "Design" link

---

## Related Documents

- API Contract: `contracts/api/knowledge-nodes.contract.ts`
- API Contract: `contracts/api/cognitive-depth-levels.contract.ts`
- API Contract: `contracts/api/adaptive-selection.contract.ts`
- API Message: `agent_coms/messages/2026-01-24_api_knowledge_nodes_foundation.md`
- API Message: `agent_coms/messages/2026-01-24_api_adaptive_learning_phase3_4.md`
- API Message: `agent_coms/messages/2026-01-24_api_adaptive_learning_phase5_6.md`
- Implementation Plan: `agent_coms/api/specs/LEARNER_ACTIVITY_KNOWLEDGE_NODE_IMPLEMENTATION_PLAN.md`
