# Department & Program Management Specification

## Version: 1.0.0
## Date: 2026-01-20
## Status: DRAFT

---

## 1. Overview

This specification defines the Department Management feature, allowing department-admins and system-admins to manage subdepartments, programs, and certificates within their organizational hierarchy.

### 1.1 Key Concepts

| Term | Definition |
|------|------------|
| **Department** | An organizational unit that contains courses, staff, and learners |
| **Subdepartment** | A child department under a parent department |
| **Program** | A structured collection of courses that leads to a certificate or credential |
| **Certificate** | A credential awarded upon completion of a program |

### 1.2 User Roles

| Role | Permissions |
|------|-------------|
| **system-admin** | Full access to all departments and programs |
| **department-admin** | Manage subdepartments and programs within their department |
| **staff** | View-only access to programs (no management) |

---

## 2. Feature Requirements

### 2.1 Sidebar Navigation

**New Navigation Item:** "Department Management"

- **Location:** Staff Context Navigation section (below existing items)
- **Visibility:** Only visible to users with `department-admin` or `system-admin` role
- **Icon:** `Building2` or `Settings2` from lucide-react
- **Route:** `/staff/departments/:deptId/manage`

### 2.2 Department Management Page

#### 2.2.1 Page Layout

```
+------------------------------------------------------------------+
| Department Management                                    [+ Add]  |
+------------------------------------------------------------------+
| Subdepartments (3)                              [+ New Subdept]   |
+------------------------------------------------------------------+
| > Cognitive Therapy                                               |
|   Programs: CBT Fundamentals, Advanced CBT                        |
|   [Edit] [View Programs]                                          |
+------------------------------------------------------------------+
| > Behavioral Analysis                                             |
|   Programs: ABA Basics                                            |
|   [Edit] [View Programs]                                          |
+------------------------------------------------------------------+
| > Research Division                                               |
|   Programs: None                                                  |
|   [Edit] [View Programs]                                          |
+------------------------------------------------------------------+
|                                                                   |
| Programs in [Current Department] (5)            [+ New Program]   |
+------------------------------------------------------------------+
| Program Name          | Courses | Certificate | Status | Actions |
+------------------------------------------------------------------+
| CBT Fundamentals      | 4       | Yes         | Active | [....]  |
| Advanced CBT          | 6       | Yes         | Active | [....]  |
| Intro to Psychology   | 3       | No          | Draft  | [....]  |
+------------------------------------------------------------------+
```

#### 2.2.2 Subdepartment Management

**List View:**
- Display all direct child departments
- Show program count per subdepartment
- Expandable to show program names

**Create Subdepartment:**
- Name (required)
- Code (required, alphanumeric)
- Description (optional)
- Parent department (pre-filled, read-only)

**Edit Subdepartment:**
- Update name, code, description
- Cannot change parent department

#### 2.2.3 Program Management

**List View:**
- Program name
- Course count
- Certificate status (Yes/No)
- Status (Draft/Active/Archived)
- Actions (Edit, View, Archive)

**Create Program:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Program display name |
| code | string | Yes | Unique identifier (alphanumeric, max 35 chars) |
| description | text | No | Program description |
| department | select | Yes | Pre-filled from context |
| courses | multi-select | No | Courses included in program |
| requiredCredits | number | No | Minimum credits for completion |
| certificateEnabled | boolean | No | Enable certificate generation |
| status | select | Yes | Draft, Active, Archived |

**Edit Program:**
- All fields editable except department
- Reorder courses within program
- Add/remove courses

#### 2.2.4 Certificate Management

**Certificate Settings (per Program):**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| enabled | boolean | Yes | Enable/disable certificate |
| templateId | select | No | Certificate template to use |
| title | string | No | Certificate title override |
| signatoryName | string | No | Name on certificate |
| signatoryTitle | string | No | Title of signatory |
| validityPeriod | number | No | Months until expiry (null = never) |
| autoIssue | boolean | No | Auto-issue on completion |

---

## 3. Data Models

### 3.1 Program Entity

```typescript
interface Program {
  id: string;
  name: string;
  code: string;
  description?: string;
  departmentId: string;
  courses: string[]; // Course IDs in order
  requiredCredits?: number;
  status: 'draft' | 'active' | 'archived';
  certificate?: CertificateConfig;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

interface CertificateConfig {
  enabled: boolean;
  templateId?: string;
  title?: string;
  signatoryName?: string;
  signatoryTitle?: string;
  validityPeriod?: number; // months
  autoIssue: boolean;
}
```

### 3.2 Department Hierarchy

```typescript
interface DepartmentHierarchy {
  id: string;
  name: string;
  code: string;
  parentId?: string;
  children: DepartmentHierarchy[];
  programs: ProgramSummary[];
  stats: {
    subdepartmentCount: number;
    programCount: number;
    courseCount: number;
    staffCount: number;
    learnerCount: number;
  };
}
```

---

## 4. API Requirements

### 4.1 Existing Endpoints (verify availability)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v2/departments/:id/hierarchy` | GET | Get department tree |
| `/api/v2/departments/:id/programs` | GET | List programs in department |
| `/api/v2/departments` | POST | Create subdepartment |
| `/api/v2/departments/:id` | PUT | Update department |

### 4.2 Required New/Updated Endpoints

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/api/v2/programs` | POST | Create program | Verify |
| `/api/v2/programs/:id` | PUT | Update program | Verify |
| `/api/v2/programs/:id` | DELETE | Archive program | Verify |
| `/api/v2/programs/:id/courses` | PUT | Update program courses | Verify |
| `/api/v2/programs/:id/certificate` | PUT | Update certificate config | Verify |

---

## 5. UI Components

### 5.1 New Components Required

| Component | Location | Purpose |
|-----------|----------|---------|
| `DepartmentManagementPage` | `src/pages/staff/departments/` | Main management page |
| `SubdepartmentList` | `src/features/departments/ui/` | List subdepartments |
| `SubdepartmentForm` | `src/features/departments/ui/` | Create/edit subdepartment |
| `ProgramList` | `src/features/programs/ui/` | List programs |
| `ProgramForm` | `src/features/programs/ui/` | Create/edit program |
| `CertificateConfigForm` | `src/features/programs/ui/` | Configure certificate |

### 5.2 Existing Components to Reuse

| Component | Purpose |
|-----------|---------|
| `Card`, `CardHeader`, `CardContent` | Section containers |
| `Table`, `TableRow`, etc. | Program list |
| `Dialog` | Create/edit modals |
| `Select`, `Input`, `Textarea` | Form fields |
| `Badge` | Status indicators |

---

## 6. Permissions & Access Control

### 6.1 Route Protection

```typescript
// Router configuration
<Route
  path="/staff/departments/:deptId/manage"
  element={
    <RoleProtectedRoute allowedRoles={['department-admin', 'system-admin']}>
      <DepartmentManagementPage />
    </RoleProtectedRoute>
  }
/>
```

### 6.2 Permission Checks

| Action | Required Permission |
|--------|---------------------|
| View department management | `department:manage` or role `department-admin` |
| Create subdepartment | `department:create` |
| Edit subdepartment | `department:update` |
| Create program | `program:create` |
| Edit program | `program:update` |
| Configure certificate | `certificate:manage` |

---

## 7. Implementation Phases

### Phase 1: Foundation
- [ ] Add sidebar navigation item
- [ ] Create DepartmentManagementPage shell
- [ ] Implement subdepartment list view
- [ ] Implement program list view

### Phase 2: Subdepartment CRUD
- [ ] Create subdepartment form
- [ ] Edit subdepartment functionality
- [ ] Delete/archive subdepartment

### Phase 3: Program CRUD
- [ ] Create program form with course selection
- [ ] Edit program functionality
- [ ] Program status management (draft/active/archived)

### Phase 4: Certificate Configuration
- [ ] Certificate settings form
- [ ] Template selection
- [ ] Auto-issue configuration

### Phase 5: Polish
- [ ] Loading states
- [ ] Error handling
- [ ] Empty states
- [ ] Responsive design

---

## 8. Related Issues

| Issue | Title | Priority |
|-------|-------|----------|
| UI-ISS-048 | Add Department Management sidebar link | High |
| UI-ISS-049 | Create Department Management page | High |
| UI-ISS-050 | Implement subdepartment CRUD | Medium |
| UI-ISS-051 | Implement program CRUD | Medium |
| UI-ISS-052 | Implement certificate configuration | Medium |

---

## 9. Open Questions

1. **Certificate Templates:** Are certificate templates managed at system level or department level?
2. **Program Completion Rules:** Beyond credits, are there other completion requirements (e.g., specific courses required)?
3. **Cross-Department Programs:** Can a program include courses from multiple departments?
4. **Program Versioning:** Should programs support versioning for curriculum changes?

---

## 10. Appendix

### A. Mockup References

*To be added: Figma/design mockups*

### B. Related Documentation

- [API Contracts](../api/agent_coms/contracts/)
- [Department Entity](../src/entities/department/)
- [Program Entity](../src/entities/program/) *(to be created)*

---

*Document maintained by: UI Development Team*
*Last updated: 2026-01-20*
