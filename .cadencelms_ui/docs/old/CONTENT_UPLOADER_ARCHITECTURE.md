# Content Uploader Architecture

## Component Hierarchy

```
ContentUploaderPage (Main Page)
│
├── Header Section
│   ├── Back Button
│   ├── Title & Description
│   └── Context Info Card (when courseId/moduleId provided)
│
├── Tabs Component
│   │
│   ├── Tab 1: SCORM Upload
│   │   ├── Card Container
│   │   │   ├── Section Header
│   │   │   ├── FileUploader (SCORM .zip)
│   │   │   ├── Form Fields
│   │   │   │   ├── Title Input (Optional)
│   │   │   │   ├── Description Textarea
│   │   │   │   ├── Department Select
│   │   │   │   └── Thumbnail FileUploader
│   │   │   └── Upload Button (with progress)
│   │   └── Success/Error States
│   │
│   ├── Tab 2: Video/Audio Upload
│   │   ├── Card Container
│   │   │   ├── Section Header
│   │   │   ├── Media Type Select
│   │   │   ├── FileUploader (Video/Audio/Image)
│   │   │   ├── Form Fields
│   │   │   │   ├── Title Input (Required)
│   │   │   │   ├── Description Textarea
│   │   │   │   └── Department Select
│   │   │   └── Upload Button (with progress)
│   │   └── Success/Error States
│   │
│   ├── Tab 3: Document Upload
│   │   ├── Card Container
│   │   │   ├── Section Header
│   │   │   ├── FileUploader (PDF/Doc/PPT/Excel)
│   │   │   ├── Form Fields
│   │   │   │   ├── Title Input (Required)
│   │   │   │   ├── Description Textarea
│   │   │   │   └── Department Select
│   │   │   └── Upload Button (with progress)
│   │   └── Success/Error States
│   │
│   └── Tab 4: Content Library
│       ├── Card Container
│       │   ├── Section Header
│       │   ├── ContentSelector
│       │   │   ├── Search & Filter Bar
│       │   │   │   ├── Search Input
│       │   │   │   ├── Filter Button (with badge)
│       │   │   │   └── Clear Filters Button
│       │   │   ├── Filter Panel (collapsible)
│       │   │   │   ├── Content Type Select
│       │   │   │   └── Department Select
│       │   │   ├── Content Grid
│       │   │   │   └── Content Cards (repeating)
│       │   │   │       ├── Thumbnail Image
│       │   │   │       ├── Content Info
│       │   │   │       ├── Badges (Type, Department)
│       │   │   │       ├── Preview Button
│       │   │   │       └── Metadata (Author, Date)
│       │   │   └── Preview Dialog
│       │   │       ├── Content Details
│       │   │       ├── Thumbnail
│       │   │       ├── Metadata Grid
│       │   │       └── Action Buttons
│       │   └── Selected Content Card
│       │       └── Link to Module Button
│       └── Empty/Loading/Error States
│
└── Toast Notifications
```

## Component Dependencies

```
ContentUploaderPage
├── react-router-dom
│   ├── useNavigate
│   └── useSearchParams
├── @/shared/ui
│   ├── Tabs
│   ├── Card
│   ├── Button
│   ├── Input
│   ├── Label
│   ├── Textarea
│   ├── Select
│   ├── Badge
│   └── useToast
├── @/features/content/ui
│   ├── FileUploader
│   └── ContentSelector
├── @/entities/content
│   ├── useUploadScormPackage
│   ├── useUploadMediaFile
│   └── types
└── @/entities/department
    └── useDepartments

FileUploader
├── react (useState, useRef, useCallback)
├── lucide-react (icons)
├── @/shared/ui
│   ├── Card
│   ├── Button
│   └── Progress
└── @/shared/lib/utils (cn)

ContentSelector
├── react (useState)
├── date-fns (format)
├── lucide-react (icons)
├── @/shared/ui
│   ├── Card
│   ├── Input
│   ├── Button
│   ├── Badge
│   ├── Label
│   ├── Select
│   └── Dialog
├── @/entities/content
│   ├── useContents
│   └── types
├── @/entities/department
│   └── useDepartments
└── @/shared/lib/utils (cn)

QuickContentUploader
├── react (useState)
├── lucide-react (icons)
├── @/shared/ui
│   ├── Button
│   ├── Progress
│   ├── Dialog
│   ├── Input
│   ├── Label
│   ├── Textarea
│   ├── Select
│   └── useToast
└── @/entities/content
    ├── useUploadScormPackage
    ├── useUploadMediaFile
    └── types
```

## Data Flow

```
┌─────────────────────────────────────────────────┐
│           ContentUploaderPage (UI)              │
└────────────┬────────────────────────┬───────────┘
             │                        │
             │ User Actions           │ API Calls
             │                        │
             ▼                        ▼
┌────────────────────┐   ┌──────────────────────────┐
│   FileUploader     │   │  React Query Mutations   │
│   ----------------│   │  ----------------------  │
│   • File Select    │   │  • useUploadScormPackage │
│   • Drag & Drop    │   │  • useUploadMediaFile    │
│   • Validation     │   │  • useContents (query)   │
│   • Progress UI    │   └──────────┬───────────────┘
└────────────────────┘              │
             │                      │
             │ Files                │ HTTP Requests
             │                      │
             ▼                      ▼
┌────────────────────┐   ┌──────────────────────────┐
│   Upload State     │   │    Content API           │
│   --------------   │   │    -----------           │
│   • files[]        │   │    POST /content/scorm   │
│   • progress       │   │    POST /content/media   │
│   • status         │   │    GET  /content         │
│   • formData       │   │    GET  /departments     │
└────────────────────┘   └──────────┬───────────────┘
             │                      │
             │ Update State         │ Response
             │                      │
             ▼                      ▼
┌────────────────────┐   ┌──────────────────────────┐
│   User Feedback    │   │    Backend Services      │
│   --------------   │   │    ----------------      │
│   • Toast          │◄──┤    • File Storage        │
│   • Progress Bar   │   │    • SCORM Parser        │
│   • Success Icon   │   │    • Media Processing    │
│   • Error Message  │   │    • Database            │
└────────────────────┘   └──────────────────────────┘
```

## State Management Flow

```
User Action → Component State → React Query → API → Backend
    ↓             ↓                  ↓          ↓        ↓
  Click      setFiles()         mutate()    HTTP    Process
    ↓             ↓                  ↓          ↓        ↓
  Select     setProgress()      onProgress  Upload  Store
    ↓             ↓                  ↓          ↓        ↓
  Upload     setStatus()        onSuccess   200 OK  Return ID
    ↓             ↓                  ↓          ↓        ↓
  Wait       UI Update          Cache      Response Success
    ↓             ↓              Invalidate   ↓        ↓
  See        Progress Bar       Refetch     Toast   Complete
```

## File Upload Flow

```
┌──────────────────────────────────────────────────────────┐
│ 1. File Selection                                        │
│    • Drag & Drop OR Click to Browse                      │
│    • Validate file type                                  │
│    • Validate file size                                  │
│    • Create UploadedFile object                          │
└──────────────┬───────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────┐
│ 2. Form Input                                            │
│    • Enter title (optional for SCORM, required for media)│
│    • Enter description (optional)                        │
│    • Select department (optional)                        │
│    • Add thumbnail (SCORM only)                          │
└──────────────┬───────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────┐
│ 3. Upload Initiation                                     │
│    • Click Upload button                                 │
│    • Create FormData object                              │
│    • Set status to 'uploading'                           │
│    • Call mutation (uploadScorm/uploadMedia)             │
└──────────────┬───────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────┐
│ 4. Progress Tracking                                     │
│    • onProgress callback fired                           │
│    • Update progress percentage                          │
│    • Show progress bar                                   │
│    • Update file status                                  │
└──────────────┬───────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────┐
│ 5. Upload Complete                                       │
│    • onSuccess OR onError callback                       │
│    • Show toast notification                             │
│    • Update file status (success/error)                  │
│    • Invalidate React Query cache                        │
│    • Reset form (on success)                             │
└──────────────────────────────────────────────────────────┘
```

## Content Selection Flow

```
┌──────────────────────────────────────────────────────────┐
│ 1. Browse Library                                        │
│    • Navigate to Library tab                             │
│    • ContentSelector component loaded                    │
│    • Fetch published content (useContents)               │
└──────────────┬───────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────┐
│ 2. Search & Filter                                       │
│    • Enter search term (debounced)                       │
│    • Select content type filter                          │
│    • Select department filter                            │
│    • API refetches with new filters                      │
└──────────────┬───────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────┐
│ 3. View Results                                          │
│    • Display content cards in grid                       │
│    • Show thumbnails, titles, badges                     │
│    • Empty state if no results                           │
│    • Loading state during fetch                          │
└──────────────┬───────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────┐
│ 4. Preview Content (Optional)                            │
│    • Click preview button                                │
│    • Open preview dialog                                 │
│    • Show full content details                           │
│    • Can select from preview                             │
└──────────────┬───────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────┐
│ 5. Select Content                                        │
│    • Click content card OR Select button in preview      │
│    • Update selectedContent state                        │
│    • Show selection confirmation                         │
│    • Display selected content card                       │
└──────────────┬───────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────┐
│ 6. Link to Module (Optional)                             │
│    • If moduleId present, show Link button               │
│    • Call API to link content to module                  │
│    • Show success toast                                  │
│    • Navigate back to course                             │
└──────────────────────────────────────────────────────────┘
```

## API Integration Points

```
┌─────────────────────┐
│   Frontend (UI)     │
└──────────┬──────────┘
           │
           │ React Query
           │
┌──────────▼──────────────────────────────────┐
│           API Client (@/shared/api/client)   │
└──────────┬──────────────────────────────────┘
           │
           │ HTTP Requests
           │
┌──────────▼──────────────────────────────────┐
│            Backend API Endpoints             │
├──────────────────────────────────────────────┤
│  POST /api/v2/content/scorm                  │
│    • Upload SCORM package                    │
│    • Parse manifest                          │
│    • Store files                             │
│    • Return package details                  │
│                                              │
│  POST /api/v2/content/media                  │
│    • Upload media file                       │
│    • Process video/audio/image               │
│    • Generate thumbnails                     │
│    • Return media details                    │
│                                              │
│  GET  /api/v2/content                        │
│    • List all content                        │
│    • Support filters (type, dept, status)    │
│    • Support search                          │
│    • Return paginated results                │
│                                              │
│  GET  /api/v2/content/:id                    │
│    • Get content details                     │
│    • Return full metadata                    │
│                                              │
│  GET  /api/v2/departments                    │
│    • List all departments                    │
│    • Used for filter dropdown                │
└──────────────────────────────────────────────┘
```

## File System Structure

```
src/
├── features/
│   └── content/
│       └── ui/
│           ├── FileUploader.tsx         (305 lines)
│           ├── ContentSelector.tsx      (412 lines)
│           ├── QuickContentUploader.tsx (304 lines)
│           ├── examples.tsx             (389 lines)
│           └── index.ts                 (export file)
│
├── pages/
│   └── staff/
│       └── courses/
│           ├── ContentUploaderPage.tsx       (824 lines)
│           ├── README.md                     (documentation)
│           ├── INTEGRATION_GUIDE.md          (integration examples)
│           └── index.ts                      (export file)
│
└── entities/
    └── content/
        ├── api/
        │   └── contentApi.ts            (upload functions)
        ├── model/
        │   ├── types.ts                 (TypeScript types)
        │   └── useContent.ts            (React Query hooks)
        └── ui/
            └── ContentForm.tsx          (existing form)
```

## Technology Stack

```
┌─────────────────────────────────────────────┐
│              React 18+                      │
│  • Functional Components                    │
│  • Hooks (useState, useCallback, etc.)      │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│          React Router v6                    │
│  • useNavigate                              │
│  • useSearchParams                          │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│         TanStack React Query                │
│  • useMutation (uploads)                    │
│  • useQuery (fetch content)                 │
│  • Cache management                         │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│            TypeScript                       │
│  • Strict mode                              │
│  • Type safety                              │
│  • Interfaces                               │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│          shadcn/ui + Tailwind               │
│  • Pre-built components                     │
│  • Utility-first styling                    │
│  • Responsive design                        │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│            lucide-react                     │
│  • Icons                                    │
└─────────────────────────────────────────────┘
```

## Performance Optimizations

1. **React Query Caching**
   - Cache content lists with 5-minute stale time
   - Automatic cache invalidation after uploads
   - Optimistic updates

2. **Lazy Loading**
   - Content library loads on demand
   - Pagination for large content lists
   - Debounced search input

3. **File Upload**
   - Chunked upload for large files
   - Progress throttling
   - Automatic retry on failure

4. **Component Optimization**
   - useCallback for event handlers
   - Minimal re-renders
   - Efficient state updates

5. **Image Optimization**
   - Thumbnail generation
   - Lazy image loading
   - Object URL cleanup

## Security Considerations

1. **File Validation**
   - Client-side: Type and size checks
   - Server-side: Full validation and scanning

2. **Authentication**
   - Required for all uploads
   - Token-based auth

3. **Authorization**
   - Department-based access control
   - Staff permissions required

4. **Data Protection**
   - HTTPS only
   - CSRF protection
   - Sanitized inputs

## Accessibility Features

1. **Keyboard Navigation**
   - Tab order
   - Enter/Space for actions
   - Escape to close dialogs

2. **Screen Reader Support**
   - ARIA labels
   - Semantic HTML
   - Descriptive text

3. **Visual Indicators**
   - Focus states
   - Disabled states
   - Error messages
   - Success feedback

4. **Color Contrast**
   - WCAG AA compliance
   - Text readability
   - Icon visibility
