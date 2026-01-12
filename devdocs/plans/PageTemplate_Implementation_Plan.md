# PageTemplate Component - Implementation Plan

**Document Version:** 1.0.0
**Date:** 2026-01-10
**Status:** Planning - Not Started
**Priority:** Medium (Quality of Life Improvement)

---

## Executive Summary

This document outlines the implementation plan for a standardized `PageTemplate` component that will serve as a consistent wrapper for all staff, admin, and learner pages in the LMS application. This component will eliminate repetitive code, ensure UI consistency, and provide built-in support for common page features like loading states, error handling, and navigation.

**Current State:** All pages implement their own header, back button, loading states, and error handling independently.

**Goal:** Create a reusable PageTemplate component that provides these features out-of-the-box while remaining flexible for unique page requirements.

**Estimated Effort:** ~800 lines of code + migration of 40+ existing pages
**Timeline:** 2-3 weeks (1 week implementation + 1-2 weeks migration)

---

## Problem Statement

### Current Issues

1. **Code Duplication:** Every page repeats the same header structure:
   ```tsx
   <div className="flex items-center gap-4">
     <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
       <ArrowLeft className="h-5 w-5" />
     </Button>
     <div>
       <h1 className="text-3xl font-bold tracking-tight">Page Title</h1>
       <p className="text-muted-foreground">Description</p>
     </div>
   </div>
   ```
   **Impact:** This pattern exists in 40+ pages, totaling ~600 lines of duplicated code.

2. **Inconsistent Loading States:** Some pages show spinners, others show skeletons, some show messages.

3. **Inconsistent Error Handling:** Error states are implemented differently across pages:
   - Some use Alert components
   - Some use Card with error styling
   - Some just show raw error text
   - Some have retry buttons, others don't

4. **Inconsistent Empty States:** Some pages handle empty data well, others just show blank content.

5. **Missing Features:** Some pages would benefit from breadcrumbs, badges, or sticky action bars but don't have them.

6. **Maintenance Burden:** Any change to the standard page layout requires updating 40+ files.

### Benefits of PageTemplate

✅ **Consistency:** All pages look and behave the same way
✅ **Less Code:** Reduce ~30 lines per page to ~10 lines
✅ **Faster Development:** New pages are quicker to build
✅ **Better UX:** Standardized loading, error, and empty states
✅ **Easier Maintenance:** Fix once, apply everywhere
✅ **Accessibility:** Centralized place to add ARIA labels, keyboard shortcuts, etc.

---

## Component Specification

### Component Location
```
src/
  widgets/
    layout/
      PageTemplate.tsx        # Main component
      PageTemplate.types.ts   # TypeScript interfaces
      PageTemplate.test.tsx   # Unit tests
      index.ts                # Exports
```

### Component API (Props Interface)

```tsx
interface PageTemplateProps {
  // ===== TIER 1: ESSENTIAL (Always Available) =====

  /** Page title */
  title: string;

  /** Page description/subtitle (optional) */
  description?: string;

  /** Show back button (default: true) */
  showBackButton?: boolean;

  /** Custom back navigation function (default: navigate(-1)) */
  onBack?: () => void;

  /** Action buttons in top-right corner (e.g., Export, Create, Save) */
  actions?: React.ReactNode;

  /** Main page content */
  children: React.ReactNode;

  /** Loading state - shows spinner instead of content */
  isLoading?: boolean;
  loadingMessage?: string;

  /** Error state - shows error alert with optional retry */
  error?: Error | string | null;
  onRetry?: () => void;

  /** Empty state - shows when no data is available */
  isEmpty?: boolean;
  emptyState?: {
    icon?: React.ReactNode;
    title: string;
    description: string;
    action?: {
      label: string;
      onClick: () => void;
    };
  };

  // ===== TIER 2: VERY COMMON =====

  /** Breadcrumbs navigation */
  breadcrumbs?: Array<{ label: string; href?: string }>;

  /** Status badge next to title (Draft, Published, etc.) */
  badge?: {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  };

  /** Tab navigation for multi-view pages */
  tabs?: Array<{
    id: string;
    label: string;
    icon?: React.ReactNode;
  }>;
  activeTab?: string;
  onTabChange?: (tabId: string) => void;

  /** Filter section (rendered as a card above content) */
  filters?: React.ReactNode;

  /** Summary statistics (rendered as grid of cards) */
  stats?: React.ReactNode;

  // ===== TIER 3: NICE TO HAVE =====

  /** Pagination controls */
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    hasNext: boolean;
    hasPrev: boolean;
  };

  /** Sticky action bar for forms */
  stickyActions?: React.ReactNode;

  /** Bulk actions bar (for list pages with selection) */
  bulkActions?: {
    selectedCount: number;
    actions: React.ReactNode;
    onClearSelection?: () => void;
  };

  /** Custom className for container */
  className?: string;

  /** Disable default padding (for full-width content) */
  noPadding?: boolean;

  /** Maximum width container size */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}
```

---

## Implementation Phases

### Phase 1: Core Component (Week 1)

**Goal:** Build the base PageTemplate component with Tier 1 features

**Tasks:**
- [ ] Create `/src/widgets/layout/PageTemplate.tsx`
- [ ] Implement core structure (header, back button, title, description)
- [ ] Add loading state handler
- [ ] Add error state handler
- [ ] Add empty state handler
- [: Add action buttons slot
- [ ] Add className and fullWidth props
- [ ] Write comprehensive JSDoc comments
- [ ] Create Storybook stories for all states
- [ ] Write unit tests

**Files to Create:**
```
src/
  widgets/
    layout/
      PageTemplate.tsx          (new - ~400 lines)
      PageTemplate.test.tsx     (new - unit tests)
      PageTemplate.stories.tsx  (optional - Storybook stories)
```

**Acceptance Criteria:**
- [ ] PageTemplate component created with Tier 1 features
- [ ] Loading state renders correctly
- [ ] Error state renders with retry functionality
- [ ] Empty state renders with custom icon, message, and action
- [ ] Back button navigates correctly
- [ ] Component is fully typed with TypeScript
- [ ] Unit tests written (90%+ coverage)
- [ ] Storybook stories created (if using Storybook)

---

## Phase 2: Tier 2 Features - Common Patterns

**Timeline:** Week 2
**Status:** Not Started

### Features to Implement

1. **Breadcrumbs Support**
   ```tsx
   breadcrumbs={[
     { label: "Courses", href: "/staff/courses" },
     { label: "Advanced React", href: "/staff/courses/123" },
     { label: "Edit" }
   ]}
   ```

2. **Status Badge**
   ```tsx
   badge={{ label: "Draft", variant: "secondary" }}
   ```

3. **Tab Navigation**
   ```tsx
   tabs={[
     { id: 'overview', label: 'Overview', icon: <Home /> },
     { id: 'stats', label: 'Statistics', icon: <BarChart /> }
   ]}
   ```

4. **Filter Section Slot**
   ```tsx
   filters={<YourCustomFilters />}
   ```

5. **Stats Cards Slot**
   ```tsx
   stats={<>
     <StatCard title="Total" value={100} />
     <StatCard title="Active" value={50} />
   </>}
   ```

6. **Pagination Controls**
   ```tsx
   pagination={{
     currentPage: 1,
     totalPages: 10,
     hasNext: true,
     hasPrev: false,
     onPageChange: (page) => {}
   }}
   ```

### Acceptance Criteria

- [ ] Breadcrumbs component integrated with React Router
- [ ] Badge component supports all shadcn/ui variants
- [ ] Tabs component properly manages active state
- [ ] Filter/Stats sections render correctly with custom content
- [ ] Pagination controls are fully functional
- [ ] All Tier 2 features are optional (don't break basic usage)

---

## Phase 3: Tier 3 Features - Advanced Patterns

**Timeline:** Week 3
**Status:** Not Started

### Features to Implement

1. **Sticky Action Bar** (for long forms)
   ```tsx
   stickyActions={
     <>
       <Button variant="outline">Cancel</Button>
       <Button>Save Changes</Button>
     </>
   }
   ```

2. **Bulk Actions Bar** (for list pages with selection)
   ```tsx
   bulkActions={{
     selectedCount: 3,
     actions: <>
       <Button>Delete</Button>
       <Button>Export</Button>
     </>
   }}
   ```

3. **Custom Layouts** (fullWidth, no padding, etc.)
   ```tsx
   fullWidth={true}
   disablePadding={true}
   ```

### Acceptance Criteria

- [ ] Sticky action bar stays visible when scrolling
- [ ] Bulk actions bar shows/hides based on selection count
- [ ] Layout variants work correctly
- [ ] Advanced features don't interfere with basic usage

---

## Phase 4: Page Migration

**Timeline:** Weeks 4-5
**Status:** Not Started

### Migration Strategy

**Order of Migration:**
1. **Pilot Pages** (2-3 simple pages to validate approach)
2. **Staff Pages** (40 pages total)
3. **Admin Pages** (30 pages total)
4. **Learner Pages** (20 pages total)

### Pilot Pages (Start Here)

Test the PageTemplate with these pages first:

- [ ] `/src/pages/staff/reports/StaffReportsPage.tsx` (Simple list page)
- [ ] `/src/pages/staff/students/StudentProgressPage.tsx` (Has filters and stats)
- [ ] `/src/pages/staff/courses/CourseEditorPage.tsx` (Complex form with tabs)

### Staff Pages Migration Checklist

#### Dashboard & Analytics (6 pages)
- [ ] `/src/pages/staff/dashboard/StaffDashboardPage.tsx`
- [ ] `/src/pages/staff/analytics/AnalyticsDashboardPage.tsx`
- [ ] `/src/pages/staff/analytics/CourseAnalyticsPage.tsx`

#### Student Management (3 pages)
- [ ] `/src/pages/staff/students/StudentProgressPage.tsx`
- [ ] `/src/pages/staff/students/StudentDetailPage.tsx`

#### Course Management (8 pages)
- [ ] `/src/pages/staff/courses/StaffCoursesPage.tsx`
- [ ] `/src/pages/staff/courses/CourseEditorPage.tsx`
- [ ] `/src/pages/staff/courses/ModuleEditorPage.tsx`
- [ ] `/src/pages/staff/courses/CoursePreviewPage.tsx`
- [ ] `/src/pages/staff/courses/ContentUploaderPage.tsx`
- [ ] `/src/pages/staff/courses/ExerciseBuilderPage.tsx`

#### Class Management (2 pages)
- [ ] `/src/pages/staff/classes/ClassManagementPage.tsx`
- [ ] `/src/pages/staff/classes/ClassDetailsPage.tsx`

#### Grading (2 pages)
- [ ] `/src/pages/staff/grading/GradingPage.tsx`
- [ ] `/src/pages/staff/grading/GradingDetailPage.tsx`

#### Reports (1 page)
- [ ] `/src/pages/staff/reports/StaffReportsPage.tsx`

### Admin Pages Migration (Defer to Phase 2)

*Admin pages can be migrated after staff pages are complete*

### Learner Pages Migration (Defer to Phase 3)

*Learner pages can be migrated after admin pages are complete*

---

## Implementation Guidelines

### File Structure

```
src/
├── widgets/
│   └── layout/
│       ├── AppLayout.tsx           (existing)
│       ├── PageTemplate.tsx        (NEW - main component)
│       ├── PageTemplate.test.tsx   (NEW - tests)
│       └── index.ts                (export PageTemplate)
```

### Component Props Interface

```tsx
interface PageTemplateProps {
  // TIER 1: Essential
  title: string;
  description?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  actions?: React.ReactNode;
  children: React.ReactNode;

  isLoading?: boolean;
  loadingMessage?: string;

  error?: Error | string | null;
  onRetry?: () => void;

  isEmpty?: boolean;
  emptyState?: {
    icon?: React.ReactNode;
    title: string;
    description: string;
    action?: {
      label: string;
      onClick: () => void;
    };
  };

  // TIER 2: Common
  breadcrumbs?: Array<{ label: string; href?: string }>;
  badge?: {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  tabs?: Array<{
    id: string;
    label: string;
    icon?: React.ReactNode;
  }>;
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  filters?: React.ReactNode;
  stats?: React.ReactNode;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    hasNext: boolean;
    hasPrev: boolean;
  };

  // TIER 3: Advanced
  stickyActions?: React.ReactNode;
  bulkActions?: {
    selectedCount: number;
    actions: React.ReactNode;
  };
  className?: string;
  fullWidth?: boolean;
  disablePadding?: boolean;
}
```

### Migration Template

**Before:**
```tsx
export const StudentProgressPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { data, isLoading, error } = useStudents();

  if (isLoading) return <Loader2 className="animate-spin" />;
  if (error) return <Alert variant="destructive">Error loading data</Alert>;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Student Progress</h1>
            <p className="text-muted-foreground">Monitor student progress</p>
          </div>
        </div>
        <Button onClick={handleExport}>Export Data</Button>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Total" value={100} />
      </div>

      {/* Filters */}
      <Card>
        <CardContent>
          <Input placeholder="Search..." />
        </CardContent>
      </Card>

      {/* Table */}
      <StudentTable data={data} />
    </div>
  );
};
```

**After:**
```tsx
export const StudentProgressPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { data, isLoading, error } = useStudents();

  return (
    <PageTemplate
      title="Student Progress"
      description="Monitor student progress"
      isLoading={isLoading}
      error={error}
      actions={<Button onClick={handleExport}>Export Data</Button>}
      stats={
        <>
          <StatCard title="Total" value={100} />
          <StatCard title="Active" value={50} />
        </>
      }
      filters={
        <Input
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      }
    >
      <StudentTable data={data} />
    </PageTemplate>
  );
};
```

### Testing Strategy

1. **Unit Tests** (PageTemplate.test.tsx)
   - Test each prop combination
   - Test loading/error/empty states
   - Test navigation behavior
   - Test conditional rendering

2. **Visual Regression Tests** (if using Storybook/Chromatic)
   - Create stories for all variants
   - Test responsive behavior
   - Test dark mode compatibility

3. **Integration Tests** (after migration)
   - Test migrated pages render correctly
   - Test back button navigation
   - Test error boundary behavior

---

## Success Metrics

### Code Quality Metrics

- [ ] **Reduced Code Duplication:** 30-40% reduction in repeated page setup code
- [ ] **Consistency Score:** 100% of pages use the same header structure
- [ ] **Lines of Code:** Average page size reduced by 20-30 lines

### User Experience Metrics

- [ ] **Visual Consistency:** All pages have identical header spacing, sizing, and styling
- [ ] **Accessibility:** All pages pass WCAG 2.1 AA standards
- [ ] **Navigation:** Back button works correctly on 100% of pages

### Developer Experience Metrics

- [ ] **Time to Create New Page:** Reduced from 15 minutes to 5 minutes
- [ ] **Documentation:** Complete usage guide and examples
- [ ] **Developer Satisfaction:** Positive feedback from team (if applicable)

---

## Risks & Mitigation

### Risk 1: Breaking Existing Pages During Migration
**Likelihood:** Medium
**Impact:** High
**Mitigation:**
- Migrate pages incrementally (pilot → staff → admin → learner)
- Test each migrated page thoroughly
- Keep git commits small and focused (one page per commit)
- Use feature flags if needed

### Risk 2: PageTemplate Becomes Too Complex
**Likelihood:** Medium
**Impact:** Medium
**Mitigation:**
- Follow "slots" pattern for custom content (filters, stats, etc.)
- Keep prop interface simple with sensible defaults
- Document advanced usage separately
- Review API design with team before implementing

### Risk 3: Performance Issues with Large Pages
**Likelihood:** Low
**Impact:** Low
**Mitigation:**
- Use React.memo for expensive components
- Lazy load non-critical features
- Profile performance during pilot phase

### Risk 4: Doesn't Cover All Use Cases
**Likelihood:** High
**Impact:** Low
**Mitigation:**
- Provide escape hatch: `disableWrapper={true}` to bypass PageTemplate
- Allow custom className for styling overrides
- Support children composition pattern

---

## Dependencies

### Required Before Starting
- ✅ React Router (already installed)
- ✅ shadcn/ui components (already installed)
- ✅ Tailwind CSS (already configured)

### Optional Enhancements
- [ ] Storybook (for component documentation)
- [ ] React Testing Library (for comprehensive tests)
- [ ] Playwright (for E2E tests of migrated pages)

---

## Timeline Summary

| Phase | Duration | Work | Status |
|-------|----------|------|--------|
| Phase 1: Core Implementation | Week 1 | Tier 1 features + tests | Not Started |
| Phase 2: Common Features | Week 2 | Tier 2 features | Not Started |
| Phase 3: Advanced Features | Week 3 | Tier 3 features | Not Started |
| Phase 4: Pilot Migration | Week 4 | 3 pilot pages | Not Started |
| Phase 5: Staff Pages | Week 5-6 | 22 staff pages | Not Started |
| Phase 6: Admin Pages | Week 7-8 | 30 admin pages | Not Started |
| Phase 7: Learner Pages | Week 9 | 20 learner pages | Not Started |

**Total Timeline:** 7-9 weeks (can be done incrementally alongside other work)

---

## Future Enhancements (Post-MVP)

### Phase 8: Advanced Features (Future)

1. **Keyboard Shortcuts**
   - Cmd+K for search
   - Escape to close modals
   - Arrow keys for navigation

2. **Print Layout**
   - Printer-friendly page variants
   - Export to PDF button

3. **Mobile Optimizations**
   - Collapsible header on scroll
   - Mobile-friendly navigation

4. **Internationalization (i18n)**
   - Support for multiple languages
   - RTL layout support

5. **Theme Customization**
   - Per-page theme overrides
   - Custom color schemes

---

## Appendix A: Current Page Inventory

### Staff Pages (22 total)
- Dashboard: 1
- Analytics: 2
- Students: 2
- Courses: 6
- Classes: 2
- Grading: 2
- Reports: 1

### Admin Pages (30 total)
- Dashboard: 1
- Users: 1
- Programs: 1
- Courses: 1
- Classes: 1
- Content: 1
- Templates: 1
- Exercises: 1
- Questions: 1
- Staff: 1
- Learners: 1
- Departments: 1
- Academic Years: 1
- Certificates: 1
- Reports: 3
- Settings: 6
- Audit Logs: 2

### Learner Pages (20 total)
- Dashboard: 1
- Catalog: 2
- My Courses: 1
- Course Player: 1
- Exercises: 2
- Progress: 2
- Certificates: 2
- Profile: 1

**Total Pages:** 72 pages

---

## Appendix B: Example Usage Patterns

### Pattern 1: Simple List Page
```tsx
<PageTemplate
  title="Classes"
  description="Manage your classes"
>
  <ClassList />
</PageTemplate>
```

### Pattern 2: List with Filters
```tsx
<PageTemplate
  title="Students"
  description="Monitor student progress"
  filters={<SearchAndFilters />}
  stats={<SummaryStats />}
>
  <StudentTable />
</PageTemplate>
```

### Pattern 3: Detail Page with Tabs
```tsx
<PageTemplate
  title="Course Analytics"
  description="Detailed insights"
  tabs={ANALYTICS_TABS}
  activeTab={activeTab}
  onTabChange={setActiveTab}
>
  <TabContent />
</PageTemplate>
```

### Pattern 4: Form Page
```tsx
<PageTemplate
  title="Edit Course"
  description="Modify course details"
  badge={{ label: "Draft", variant: "secondary" }}
  stickyActions={<FormActions />}
>
  <CourseForm />
</PageTemplate>
```

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-10 | Claude | Initial document creation |

---

## Notes

- This implementation is not blocking for other features
- Can be done incrementally (one page at a time)
- Will significantly improve codebase maintainability
- Should be prioritized after critical user-facing features are complete
