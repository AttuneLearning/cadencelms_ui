# Staff Course Builder - Architecture Diagram

## Component Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                     Staff Course Builder                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  StaffCoursesPage  (/staff/courses)                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Header: "My Courses" + "Create Course" Button           │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  Search Bar + Filter Toggle                               │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  Course Cards Grid (3 columns)                            │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │  │
│  │  │ CourseCard   │  │ CourseCard   │  │ CourseCard   │   │  │
│  │  │ - Badge      │  │ - Badge      │  │ - Badge      │   │  │
│  │  │ - Title      │  │ - Title      │  │ - Title      │   │  │
│  │  │ - Stats      │  │ - Stats      │  │ - Stats      │   │  │
│  │  │ [Edit Btn]   │  │ [Edit Btn]   │  │ [Edit Btn]   │   │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  Pagination: [< Prev] Page 1 of 5 [Next >]              │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Click "Edit Course"
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  CourseEditorPage  (/staff/courses/:id/edit)                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Header: [< Back] "Edit Course" [Publish] [Save]         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────┬──────────────────────────────────┐ │
│  │  LEFT COLUMN           │  RIGHT COLUMN                    │ │
│  │  Course Details        │  Module Organizer                │ │
│  │                        │                                  │ │
│  │  ┌──────────────────┐  │  ┌────────────────────────────┐ │ │
│  │  │ Course Title *   │  │  │ [Add Module] Button        │ │ │
│  │  ├──────────────────┤  │  ├────────────────────────────┤ │ │
│  │  │ Course Code *    │  │  │                            │ │ │
│  │  ├──────────────────┤  │  │  ModuleList Component      │ │ │
│  │  │ Description      │  │  │                            │ │ │
│  │  ├──────────────────┤  │  │  ┌──────────────────────┐ │ │ │
│  │  │ Credits          │  │  │  │ [≡] Module 1         │ │ │ │
│  │  ├──────────────────┤  │  │  │ Title: Intro         │ │ │ │
│  │  │ Duration         │  │  │  │ [Draft] [Video] [⋮] │ │ │ │
│  │  ├──────────────────┤  │  │  └──────────────────────┘ │ │ │
│  │  │ Department *     │  │  │  ┌──────────────────────┐ │ │ │
│  │  ├──────────────────┤  │  │  │ [≡] Module 2         │ │ │ │
│  │  │ Program          │  │  │  │ Title: Advanced      │ │ │ │
│  │  └──────────────────┘  │  │  │ [Published] [⋮]     │ │ │ │
│  │                        │  │  └──────────────────────┘ │ │ │
│  │  ┌──────────────────┐  │  │                            │ │ │
│  │  │ Settings         │  │  │  Drag [≡] to reorder       │ │ │
│  │  │ □ Self-enroll    │  │  │                            │ │ │
│  │  │ Passing: 70%     │  │  └────────────────────────────┘ │ │
│  │  │ Max attempts: 3  │  │                                  │ │
│  │  │ □ Certificate    │  │                                  │ │
│  │  └──────────────────┘  │                                  │ │
│  └────────────────────────┴──────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Click "Add Module"
                              ↓
                    ┌────────────────────┐
                    │  ModuleDialog      │
                    │  ┌──────────────┐  │
                    │  │ Title *      │  │
                    │  ├──────────────┤  │
                    │  │ Description  │  │
                    │  ├──────────────┤  │
                    │  │ Type ▼       │  │
                    │  ├──────────────┤  │
                    │  │ Content ID   │  │
                    │  ├──────────────┤  │
                    │  │ Settings...  │  │
                    │  ├──────────────┤  │
                    │  │ [Cancel][OK] │  │
                    │  └──────────────┘  │
                    └────────────────────┘
```

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND LAYERS                             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  PAGES LAYER (User Interface)                                   │
│  ┌─────────────────────┐  ┌─────────────────────────────────┐  │
│  │ StaffCoursesPage    │  │ CourseEditorPage                │  │
│  │ - Layout            │  │ - Two-column layout             │  │
│  │ - Search/Filter UI  │  │ - Form handling                 │  │
│  │ - Navigation        │  │ - State coordination           │  │
│  └─────────────────────┘  └─────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ↓ uses
┌─────────────────────────────────────────────────────────────────┐
│  FEATURES LAYER (Reusable Business Features)                    │
│  ┌─────────────────────┐  ┌─────────────────────────────────┐  │
│  │ ModuleList          │  │ ModuleDialog                    │  │
│  │ - Drag & Drop       │  │ - Form wrapper                  │  │
│  │ - Visual feedback   │  │ - Validation                    │  │
│  │ - Actions menu      │  │ - Submit handling               │  │
│  └─────────────────────┘  └─────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ↓ uses
┌─────────────────────────────────────────────────────────────────┐
│  ENTITIES LAYER (Business Logic & API)                          │
│  ┌─────────────────────┐  ┌─────────────────────────────────┐  │
│  │ Course Entity       │  │ CourseSegment Entity            │  │
│  │ ├─ Types            │  │ ├─ Types                        │  │
│  │ ├─ API Functions    │  │ ├─ API Functions                │  │
│  │ ├─ React Query Hooks│  │ ├─ React Query Hooks            │  │
│  │ │  - useCourses()   │  │ │  - useCourseSegments()        │  │
│  │ │  - useCourse()    │  │ │  - useCreateCourseSegment()   │  │
│  │ │  - useCreateCourse│  │ │  - useUpdateCourseSegment()   │  │
│  │ │  - useUpdateCourse│  │ │  - useDeleteCourseSegment()   │  │
│  │ │  - usePublishCourse│ │ │  - useReorderCourseSegments() │  │
│  │ └─ UI Components    │  │ └─ UI Components                │  │
│  └─────────────────────┘  └─────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ↓ calls
┌─────────────────────────────────────────────────────────────────┐
│  SHARED LAYER (UI Components & Utilities)                       │
│  ┌─────────────────────┐  ┌─────────────────────────────────┐  │
│  │ shadcn/ui           │  │ Utilities                       │  │
│  │ - Card              │  │ - date-fns                      │  │
│  │ - Button            │  │ - React Query                   │  │
│  │ - Dialog            │  │ - React Hook Form               │  │
│  │ - Input/Textarea    │  │ - Zod validation                │  │
│  │ - Badge             │  │ - @dnd-kit                      │  │
│  └─────────────────────┘  └─────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ↓ HTTP
┌─────────────────────────────────────────────────────────────────┐
│  BACKEND API                                                     │
│  GET    /api/courses                    - List courses          │
│  GET    /api/courses/:id                - Get course            │
│  POST   /api/courses                    - Create course         │
│  PUT    /api/courses/:id                - Update course         │
│  POST   /api/courses/:id/publish        - Publish course        │
│  GET    /api/courses/:id/segments       - List modules          │
│  POST   /api/courses/:id/segments       - Create module         │
│  PUT    /api/courses/:id/segments/:sid  - Update module         │
│  DELETE /api/courses/:id/segments/:sid  - Delete module         │
│  PUT    /api/courses/:id/segments/reorder - Reorder modules     │
└─────────────────────────────────────────────────────────────────┘
```

## State Management Flow

```
┌──────────────────────────────────────────────────────────────────┐
│  STATE MANAGEMENT                                                 │
└──────────────────────────────────────────────────────────────────┘

Server State (React Query)
  ↓
┌─────────────────────────────────────────────────────────────────┐
│  Query Cache                                                     │
│  ┌────────────────┐  ┌────────────────┐  ┌─────────────────┐  │
│  │ courses[]      │  │ course         │  │ courseSegments[]│  │
│  │ - Paginated    │  │ - Full detail  │  │ - Per course    │  │
│  │ - Filtered     │  │ - Refetches    │  │ - Auto-updates  │  │
│  └────────────────┘  └────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
  ↓ invalidates on mutations
┌─────────────────────────────────────────────────────────────────┐
│  Mutations                                                       │
│  • createCourse      → invalidates courses[]                    │
│  • updateCourse      → invalidates course, courses[]            │
│  • publishCourse     → invalidates course                       │
│  • createSegment     → invalidates courseSegments[]             │
│  • updateSegment     → invalidates segment, courseSegments[]    │
│  • deleteSegment     → invalidates courseSegments[]             │
│  • reorderSegments   → invalidates courseSegments[]             │
└─────────────────────────────────────────────────────────────────┘

Local UI State (React useState)
  ↓
┌─────────────────────────────────────────────────────────────────┐
│  Component State                                                 │
│  • Dialog open/closed states                                    │
│  • Filter values (search, status)                               │
│  • Drag-and-drop active item                                    │
│  • Form dirty/touched states                                    │
│  • Confirmation dialog states                                   │
└─────────────────────────────────────────────────────────────────┘

Form State (React Hook Form)
  ↓
┌─────────────────────────────────────────────────────────────────┐
│  Form State                                                      │
│  • Course details form (CourseEditorPage)                       │
│  • Module form (ModuleDialog → CourseSegmentForm)               │
│  • Validation errors                                            │
│  • isDirty flag for unsaved changes                             │
└─────────────────────────────────────────────────────────────────┘
```

## Drag-and-Drop Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  @dnd-kit Architecture in ModuleList                            │
└─────────────────────────────────────────────────────────────────┘

DndContext (Root)
  ├─ Sensors
  │  ├─ PointerSensor (8px activation)
  │  └─ KeyboardSensor
  │
  ├─ Collision Detection: closestCenter
  │
  ├─ Event Handlers
  │  ├─ onDragStart → setActiveId(module.id)
  │  ├─ onDragEnd → arrayMove() + onReorder()
  │  └─ onDragCancel → setActiveId(null)
  │
  └─ Children
     ├─ SortableContext (with module IDs)
     │  │
     │  └─ SortableModuleCard[] (for each module)
     │     ├─ useSortable() hook
     │     ├─ Grip handle with listeners
     │     ├─ Transform/transition styles
     │     └─ Module content
     │
     └─ DragOverlay
        └─ Active module preview (if dragging)
```

## File Structure

```
/home/adam/github/lms_ui/1_lms_ui_v2/
│
├── src/
│   ├── pages/
│   │   └── staff/
│   │       └── courses/
│   │           ├── StaffCoursesPage.tsx      (344 lines)
│   │           ├── CourseEditorPage.tsx      (667 lines)
│   │           └── index.tsx                 (exports)
│   │
│   ├── features/
│   │   └── courses/
│   │       ├── ui/
│   │       │   ├── ModuleList.tsx            (367 lines)
│   │       │   ├── ModuleDialog.tsx          (69 lines)
│   │       │   └── index.ts                  (exports)
│   │       └── index.ts                      (exports)
│   │
│   ├── entities/
│   │   ├── course/                           (existing)
│   │   │   ├── api/
│   │   │   ├── model/
│   │   │   ├── hooks/
│   │   │   └── ui/
│   │   │
│   │   └── course-segment/                   (existing + updated)
│   │       ├── api/
│   │       ├── model/
│   │       ├── hooks/
│   │       │   └── useCourseSegments.ts      (updated)
│   │       └── ui/
│   │
│   └── shared/
│       └── ui/                                (shadcn/ui components)
│
├── STAFF_COURSE_BUILDER_README.md
├── STAFF_COURSE_BUILDER_SUMMARY.md
└── STAFF_COURSE_BUILDER_ARCHITECTURE.md      (this file)
```

## Technology Stack

```
┌─────────────────────────────────────────────────────────────────┐
│  TECHNOLOGY STACK                                                │
├─────────────────────────────────────────────────────────────────┤
│  React 18            - UI framework                              │
│  TypeScript          - Type safety                               │
│  React Router v6     - Routing                                   │
│  React Query         - Server state management                   │
│  React Hook Form     - Form handling                             │
│  Zod                 - Schema validation                         │
│  @dnd-kit            - Drag and drop                             │
│  shadcn/ui           - UI components                             │
│  Radix UI            - Headless UI primitives                    │
│  Tailwind CSS        - Styling                                   │
│  date-fns            - Date formatting                           │
│  Lucide React        - Icons                                     │
└─────────────────────────────────────────────────────────────────┘
```
