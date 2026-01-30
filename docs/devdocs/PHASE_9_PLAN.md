# Phase 9: Advanced Features & Missing Functionality

**Date:** 2026-01-09
**Status:** 📋 PLANNING
**Priority:** 🔴 High (Completing remaining 13%)

---

## Executive Summary

This plan completes the remaining **13% of the LMS UI V2 project**, focusing on Phase 8 advanced features and TODO items identified in existing pages.

### Current State
- ✅ All admin pages complete (13/13)
- ✅ All staff pages complete (14/14)
- ✅ All learner pages complete (11/11)
- ❌ Phase 8 advanced features (0%)
- ⚠️ Several TODO features in existing pages

### Target State
- ✅ Complete Reporting System
- ✅ Complete System Settings
- ✅ Complete Audit Logs
- ✅ Complete Certificate System
- ✅ Implement all TODO features
- ✅ 100% project completion

---

## Phase 9 Tracks

### Track A: Reporting System (HIGH PRIORITY)

**Goal:** Build comprehensive reporting interface for admins and staff

**Features:**
1. **Report Builder Interface**
   - Report type selection (enrollment, completion, performance, attendance)
   - Filter configuration (date range, programs, courses, departments)
   - Column selection
   - Sort/group options
   - Preview before generation

2. **Report Templates**
   - Pre-built report templates
   - Custom report saving
   - Template sharing
   - Scheduled reports

3. **Report Viewing & Export**
   - View generated reports in-app
   - Export to PDF
   - Export to Excel
   - Export to CSV
   - Email reports

**Routes:**
```
/admin/reports              - Report builder
/admin/reports/templates    - Report templates
/admin/reports/:reportId    - View report
/staff/reports              - Staff reporting interface
```

**Entities Needed:**
```typescript
// src/entities/report/
- model/types.ts            - Report, ReportTemplate, ReportFilter types
- api/reportApi.ts          - Report CRUD operations
- hooks/useReports.ts       - React Query hooks
```

**Pages:**
```typescript
// src/pages/admin/reports/
- ReportBuilderPage.tsx     - Report creation interface
- ReportTemplatesPage.tsx   - Template management
- ReportViewerPage.tsx      - View generated report

// src/pages/staff/reports/
- StaffReportsPage.tsx      - Staff reporting interface
```

**Test Coverage:** Minimum 20 tests per page

---

### Track B: System Settings (HIGH PRIORITY)

**Goal:** Admin configuration interface for system-wide settings

**Features:**
1. **General Settings**
   - System name/branding
   - Default language
   - Timezone
   - Date/time formats
   - File upload limits

2. **Email Configuration**
   - SMTP server settings
   - Email templates
   - Sender information
   - Test email functionality

3. **Notification Settings**
   - Global notification preferences
   - Email notifications
   - In-app notifications
   - Notification templates

4. **Security Settings**
   - Password policies
   - Session timeout
   - IP whitelisting
   - Two-factor authentication settings

5. **Appearance Settings**
   - Logo upload
   - Color scheme
   - Custom CSS
   - Favicon

**Routes:**
```
/admin/settings             - Settings dashboard
/admin/settings/general     - General settings
/admin/settings/email       - Email configuration
/admin/settings/notifications - Notification settings
/admin/settings/security    - Security settings
/admin/settings/appearance  - Appearance customization
```

**Entities Needed:**
```typescript
// src/entities/settings/
- model/types.ts            - Settings types
- api/settingsApi.ts        - Settings CRUD
- hooks/useSettings.ts      - React Query hooks
```

**Pages:**
```typescript
// src/pages/admin/settings/
- SettingsDashboardPage.tsx - Settings overview
- GeneralSettingsPage.tsx   - General settings
- EmailSettingsPage.tsx     - Email configuration
- NotificationSettingsPage.tsx - Notification settings
- SecuritySettingsPage.tsx  - Security settings
- AppearanceSettingsPage.tsx - Appearance customization
```

**Test Coverage:** Minimum 15 tests per page

---

### Track C: Audit Logs (MEDIUM PRIORITY)

**Goal:** System monitoring and compliance tracking

**Features:**
1. **Audit Log Viewer**
   - Filterable log list
   - Search by user, action, entity
   - Date range filtering
   - Severity filtering

2. **Log Details**
   - Full event details
   - User information
   - Before/after values
   - IP address, user agent

3. **Export Logs**
   - Export to CSV
   - Export date ranges
   - Compliance reporting

**Routes:**
```
/admin/audit-logs           - Audit log viewer
/admin/audit-logs/:logId    - Log entry details
```

**Entities Needed:**
```typescript
// src/entities/audit-log/
- model/types.ts            - AuditLog, AuditLogEntry types
- api/auditLogApi.ts        - Audit log API
- hooks/useAuditLogs.ts     - React Query hooks
```

**Pages:**
```typescript
// src/pages/admin/audit-logs/
- AuditLogPage.tsx          - Log viewer
- AuditLogDetailPage.tsx    - Log entry detail
```

**Test Coverage:** Minimum 15 tests per page

---

### Track D: Certificate System (HIGH PRIORITY)

**Goal:** Complete certificate generation and management

**Features:**
1. **Certificate Templates (Admin)**
   - Template WYSIWYG editor
   - Variable placeholders (name, course, date, grade, etc.)
   - Template preview
   - Multiple template support

2. **Certificate Generation**
   - Auto-generate on course completion
   - Manual certificate generation
   - Certificate validation/verification

3. **Certificate Viewing (Learner)**
   - View earned certificates
   - Download as PDF
   - Share certificate (link)
   - Print certificate
   - Certificate verification

**Routes:**
```
/admin/certificates         - Certificate template management
/admin/certificates/new     - Create template
/admin/certificates/:id     - Edit template
/learner/certificates       - View certificates (ENHANCE EXISTING)
/learner/certificates/:id   - View single certificate
/verify/:certificateId      - Public certificate verification
```

**Entities Needed:**
```typescript
// src/entities/certificate/
- model/types.ts            - Certificate, CertificateTemplate types
- api/certificateApi.ts     - Certificate CRUD
- hooks/useCertificates.ts  - React Query hooks
```

**Pages:**
```typescript
// src/pages/admin/certificates/
- CertificateTemplateManagementPage.tsx
- CertificateTemplateEditorPage.tsx

// src/pages/learner/certificates/
- CertificatesPage.tsx      - ENHANCE EXISTING
- CertificateViewPage.tsx   - NEW

// src/pages/public/
- CertificateVerificationPage.tsx - NEW
```

**Test Coverage:** Minimum 20 tests per page

---

### Track E: TODO Features (MEDIUM PRIORITY)

**Goal:** Complete unfinished features in existing pages

#### 1. Content-to-Module Linking
**File:** `/src/pages/staff/courses/ContentUploaderPage.tsx:378`

**Implementation:**
```typescript
// After successful upload, link content to module
const linkContentToModule = async (contentId: string, moduleId: string) => {
  await client.post(`/course-segments/${moduleId}/content`, {
    contentId,
    order: nextOrder,
  });
};
```

**Test Coverage:** 5 new tests

#### 2. Analytics Export
**File:** `/src/pages/staff/analytics/CourseAnalyticsPage.tsx:67`

**Implementation:**
```typescript
const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
  const blob = await exportAnalytics(courseId, format);
  downloadFile(blob, `course-analytics-${courseId}.${format}`);
};
```

**Test Coverage:** 5 new tests

#### 3. Student Management Actions
**File:** `/src/pages/staff/students/StudentDetailPage.tsx`

**Implementations:**
- Send message to student (Line 79)
- Reset quiz attempt (Line 84)
- Extend deadline (Line 89)
- Manual completion override (Line 94)

**Test Coverage:** 4 tests per action (16 total)

#### 4. Student Progress Export
**File:** `/src/pages/staff/students/StudentProgressPage.tsx:186`

**Implementation:**
```typescript
const handleExport = async (format: 'excel' | 'csv') => {
  const blob = await exportStudentProgress(filters, format);
  downloadFile(blob, `student-progress.${format}`);
};
```

**Test Coverage:** 5 new tests

#### 5. Class Learner Enrollment
**File:** `/src/pages/admin/classes/ClassManagementPage.tsx:619`

**Implementation:**
```typescript
const handleAddLearners = async (classId: string, learnerIds: string[]) => {
  await bulkEnrollInClass(classId, learnerIds);
  refetchClassEnrollments();
};
```

**Test Coverage:** 8 new tests

---

## Implementation Strategy

### Phase 9A: Core Advanced Features (Week 1-2)
**Priority Order:**
1. Certificate System (Track D) - 3 days
2. Reporting System (Track A) - 4 days
3. System Settings (Track B) - 4 days

### Phase 9B: Monitoring & Completion (Week 3)
**Priority Order:**
4. Audit Logs (Track C) - 2 days
5. TODO Features (Track E) - 2 days
6. Final testing & bug fixes - 2 days

### Development Approach
**TDD for All Features:**
1. Write tests first
2. Implement minimal code to pass
3. Refactor for quality
4. Document thoroughly

**Quality Standards:**
- Minimum 70% test coverage per component
- All tests must pass
- TypeScript strict mode compliance
- Accessibility (a11y) compliance
- Responsive design (mobile-first)

---

## Entities Required

### New Entities

#### 1. Report Entity
```typescript
// src/entities/report/model/types.ts
interface Report {
  id: string;
  name: string;
  type: ReportType;
  filters: ReportFilter;
  createdBy: string;
  createdAt: string;
  status: 'generating' | 'ready' | 'failed';
  fileUrl?: string;
}

type ReportType =
  | 'enrollment'
  | 'completion'
  | 'performance'
  | 'attendance'
  | 'custom';

interface ReportFilter {
  dateRange: { start: string; end: string };
  programs?: string[];
  courses?: string[];
  departments?: string[];
  learners?: string[];
}
```

#### 2. Settings Entity
```typescript
// src/entities/settings/model/types.ts
interface SystemSettings {
  id: string;
  general: GeneralSettings;
  email: EmailSettings;
  notifications: NotificationSettings;
  security: SecuritySettings;
  appearance: AppearanceSettings;
}

interface GeneralSettings {
  systemName: string;
  defaultLanguage: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  maxFileSize: number;
}

interface EmailSettings {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  senderName: string;
  senderEmail: string;
}
```

#### 3. AuditLog Entity
```typescript
// src/entities/audit-log/model/types.ts
interface AuditLog {
  id: string;
  userId: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  changes: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
}

type AuditAction =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'login'
  | 'logout'
  | 'export'
  | 'import';
```

#### 4. Certificate Entity (Enhancement)
```typescript
// src/entities/certificate/model/types.ts
interface Certificate {
  id: string;
  learnerId: string;
  courseId: string;
  templateId: string;
  issueDate: string;
  expiryDate?: string;
  grade?: number;
  verificationCode: string;
  pdfUrl?: string;
}

interface CertificateTemplate {
  id: string;
  name: string;
  description: string;
  html: string;
  variables: string[];
  isDefault: boolean;
  createdBy: string;
  createdAt: string;
}
```

---

## API Endpoints Required

### Reporting Endpoints
```
GET    /reports                  - List reports
POST   /reports                  - Generate report
GET    /reports/:id              - Get report
DELETE /reports/:id              - Delete report
GET    /reports/:id/download     - Download report file
GET    /report-templates         - List templates
POST   /report-templates         - Create template
```

### Settings Endpoints
```
GET    /settings                 - Get all settings
PUT    /settings/general         - Update general settings
PUT    /settings/email           - Update email settings
PUT    /settings/notifications   - Update notification settings
PUT    /settings/security        - Update security settings
PUT    /settings/appearance      - Update appearance settings
POST   /settings/email/test      - Send test email
```

### Audit Log Endpoints
```
GET    /audit-logs               - List audit logs
GET    /audit-logs/:id           - Get log entry
GET    /audit-logs/export        - Export logs
```

### Certificate Endpoints
```
GET    /certificates             - List certificates
GET    /certificates/:id         - Get certificate
POST   /certificates/generate    - Generate certificate
GET    /certificates/:id/pdf     - Download certificate PDF
GET    /certificates/verify/:code - Verify certificate

GET    /certificate-templates    - List templates
POST   /certificate-templates    - Create template
GET    /certificate-templates/:id - Get template
PUT    /certificate-templates/:id - Update template
DELETE /certificate-templates/:id - Delete template
```

---

## Test Coverage Goals

| Track | Component | Min Tests | Target Coverage |
|-------|-----------|-----------|-----------------|
| A | Report Builder | 20 | 75% |
| A | Report Viewer | 15 | 75% |
| A | Report Templates | 15 | 75% |
| B | Settings Pages | 15 each | 75% |
| C | Audit Logs | 15 | 75% |
| D | Certificate Template Editor | 25 | 80% |
| D | Certificate Viewer | 20 | 80% |
| E | TODO Features | 5-16 each | 80% |

**Total New Tests:** ~250 tests

---

## File Structure

```
src/
├── entities/
│   ├── report/
│   │   ├── model/types.ts
│   │   ├── api/reportApi.ts
│   │   ├── hooks/useReports.ts
│   │   └── index.ts
│   ├── settings/
│   │   ├── model/types.ts
│   │   ├── api/settingsApi.ts
│   │   ├── hooks/useSettings.ts
│   │   └── index.ts
│   ├── audit-log/
│   │   ├── model/types.ts
│   │   ├── api/auditLogApi.ts
│   │   ├── hooks/useAuditLogs.ts
│   │   └── index.ts
│   └── certificate/
│       ├── model/types.ts
│       ├── api/certificateApi.ts
│       ├── hooks/useCertificates.ts
│       └── index.ts
│
├── pages/
│   ├── admin/
│   │   ├── reports/
│   │   │   ├── ReportBuilderPage.tsx
│   │   │   ├── ReportTemplatesPage.tsx
│   │   │   ├── ReportViewerPage.tsx
│   │   │   └── __tests__/
│   │   ├── settings/
│   │   │   ├── SettingsDashboardPage.tsx
│   │   │   ├── GeneralSettingsPage.tsx
│   │   │   ├── EmailSettingsPage.tsx
│   │   │   ├── NotificationSettingsPage.tsx
│   │   │   ├── SecuritySettingsPage.tsx
│   │   │   ├── AppearanceSettingsPage.tsx
│   │   │   └── __tests__/
│   │   ├── audit-logs/
│   │   │   ├── AuditLogPage.tsx
│   │   │   ├── AuditLogDetailPage.tsx
│   │   │   └── __tests__/
│   │   └── certificates/
│   │       ├── CertificateTemplateManagementPage.tsx
│   │       ├── CertificateTemplateEditorPage.tsx
│   │       └── __tests__/
│   ├── staff/
│   │   └── reports/
│   │       ├── StaffReportsPage.tsx
│   │       └── __tests__/
│   └── learner/
│       └── certificates/
│           ├── CertificatesPage.tsx (ENHANCE)
│           ├── CertificateViewPage.tsx (NEW)
│           └── __tests__/
│
└── shared/
    └── api/
        └── endpoints.ts (ADD NEW ENDPOINTS)
```

---

## Success Metrics

### Completion Criteria
- ✅ All 4 tracks (A, B, C, D) fully implemented
- ✅ All 5 TODO features completed
- ✅ Minimum 250 new tests written
- ✅ All tests passing (100%)
- ✅ Zero TypeScript errors
- ✅ All pages responsive and accessible
- ✅ Documentation complete

### After Phase 9
- 🎯 100% project completion
- 🎯 Production-ready LMS UI V2
- 🎯 Full feature parity with requirements
- 🎯 Comprehensive test coverage (>75%)
- 🎯 Zero known bugs or TODOs

---

## Timeline

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| Phase 9A.1: Certificate System | 3 days | Certificate templates, generation, viewing |
| Phase 9A.2: Reporting System | 4 days | Report builder, templates, export |
| Phase 9A.3: System Settings | 4 days | All settings pages |
| Phase 9B.1: Audit Logs | 2 days | Log viewer, details, export |
| Phase 9B.2: TODO Features | 2 days | All 5 TODO features complete |
| Phase 9B.3: Testing & Polish | 2 days | Bug fixes, optimization |
| **Total** | **17 days** | **100% completion** |

---

## Risk Assessment

### Low Risk ⚠️
- All core infrastructure exists
- Following established patterns
- TDD approach reduces bugs
- Incremental implementation

### Potential Issues
1. **Certificate PDF generation** - May need server-side rendering
   - **Solution:** Use headless Chrome or PDF library
2. **SMTP testing** - Email configuration may be tricky
   - **Solution:** Mock email in development, test in staging
3. **Report generation performance** - Large datasets may be slow
   - **Solution:** Implement background jobs, pagination

---

## Next Steps

**Immediate Actions:**
1. ✅ Create Phase 9 plan (this document)
2. Begin Track D: Certificate System (highest priority)
3. Create entity models for all new entities
4. Add API endpoints to `endpoints.ts`
5. Implement features with TDD approach

**Development Order:**
1. Certificate System (3 days)
2. Reporting System (4 days)
3. System Settings (4 days)
4. Audit Logs (2 days)
5. TODO Features (2 days)
6. Final polish (2 days)

---

**Status:** Ready for implementation
**Next Action:** Begin Track D (Certificate System) with TDD approach
