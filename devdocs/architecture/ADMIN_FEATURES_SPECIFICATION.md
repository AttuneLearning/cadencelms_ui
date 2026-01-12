# Admin Features Specification
**Version:** 2.0.0
**Date:** 2026-01-11
**Status:** Planning Document

---

## Purpose

This document defines all admin features for the LMS V2 system, including role-based visibility and implementation priority.

---

## Role-Based Access Control

### User Types
- **global-admin** - Full system access across all departments
- **staff** (with admin permissions) - Department-scoped access
- **department-admin** - Department-level administrative access

### Permission Format
Permissions follow the pattern: `domain:resource:action`
- Example: `admin:users:create`, `admin:settings:read`

---

## Feature Categories

## 1. User Management

### 1.1 User Administration
**Route:** `/admin/users`
**Description:** Create, edit, and manage all user accounts

**UI Components:**
- User list table with search/filter
- Create new user form
- Edit user details
- Activate/deactivate users
- Password reset functionality
- Role assignment interface
- Department assignment
- Bulk user import/export

**Role Visibility:**
| Feature | global-admin | department-admin | staff |
|---------|--------------|------------------|-------|
| View all users | ✅ | ❌ (dept only) | ❌ |
| Create users | ✅ | ✅ (dept only) | ❌ |
| Edit users | ✅ | ✅ (dept only) | ❌ |
| Delete users | ✅ | ❌ | ❌ |
| Assign roles | ✅ | ✅ (limited) | ❌ |
| View audit log | ✅ | ✅ (dept only) | ❌ |

**Required Permissions:**
- `admin:users:read` - View users
- `admin:users:create` - Create users
- `admin:users:update` - Edit users
- `admin:users:delete` - Delete users
- `admin:users:assign-roles` - Assign roles

**API Endpoints:**
- `GET /api/admin/users`
- `POST /api/admin/users`
- `PUT /api/admin/users/:id`
- `DELETE /api/admin/users/:id`
- `POST /api/admin/users/:id/reset-password`

---

### 1.2 Learner Management
**Route:** `/admin/learners`
**Description:** Manage learner accounts and progress

**UI Components:**
- Learner list with filters (status, department, progress)
- Learner profile view
- Progress overview
- Enrollment history
- Reset learner progress
- Export learner data

**Role Visibility:**
| Feature | global-admin | department-admin | staff |
|---------|--------------|------------------|-------|
| View learners | ✅ | ✅ (dept only) | ✅ (assigned) |
| Edit learners | ✅ | ✅ (dept only) | ❌ |
| Reset progress | ✅ | ✅ (dept only) | ❌ |
| Export data | ✅ | ✅ (dept only) | ✅ |

**Required Permissions:**
- `admin:learners:read`
- `admin:learners:update`
- `admin:learners:reset-progress`
- `admin:learners:export`

---

### 1.3 Staff Management
**Route:** `/admin/staff`
**Description:** Manage staff assignments and departments

**UI Components:**
- Staff list table
- Department assignments with badges
- Role assignments
- Permission overrides
- Staff activity log

**Role Visibility:**
| Feature | global-admin | department-admin | staff |
|---------|--------------|------------------|-------|
| View all staff | ✅ | ❌ (dept only) | ❌ |
| Assign departments | ✅ | ❌ | ❌ |
| Assign roles | ✅ | ✅ (limited) | ❌ |

**Required Permissions:**
- `admin:staff:read`
- `admin:staff:assign`
- `admin:staff:update`

---

## 2. Academic Structure

### 2.1 Academic Structure Management
**Route:** `/admin/academic-structure`
**Description:** Manage academic calendar, programs, levels, courses

**UI Components:**
- Academic year management
- Program creation and editing
- Level/grade management
- Course catalog
- Academic calendar
- Term/semester configuration

**Role Visibility:**
| Feature | global-admin | department-admin | staff |
|---------|--------------|------------------|-------|
| View structure | ✅ | ✅ (dept only) | ✅ (read-only) |
| Create programs | ✅ | ✅ (dept only) | ❌ |
| Edit programs | ✅ | ✅ (dept only) | ❌ |
| Create courses | ✅ | ✅ (dept only) | ✅ (with permission) |
| Edit academic year | ✅ | ❌ | ❌ |

**Required Permissions:**
- `admin:academic:read`
- `admin:academic:create`
- `admin:academic:update`
- `admin:academic:delete`
- `admin:academic:calendar`

**API Endpoints:**
- `GET /api/admin/academic-years`
- `POST /api/admin/programs`
- `GET /api/admin/programs`
- `PUT /api/admin/programs/:id`

---

### 2.2 Department Hierarchy
**Route:** `/admin/departments`
**Description:** Structure departments and manage hierarchy

**UI Components:**
- Tree view of department hierarchy
- Create/edit departments
- Move departments (drag-drop)
- Delete with usage count warnings
- Department resource allocation

**Role Visibility:**
| Feature | global-admin | department-admin | staff |
|---------|--------------|------------------|-------|
| View all departments | ✅ | ✅ (dept only) | ✅ (assigned) |
| Create departments | ✅ | ❌ | ❌ |
| Edit departments | ✅ | ✅ (own dept) | ❌ |
| Delete departments | ✅ | ❌ | ❌ |
| Restructure hierarchy | ✅ | ❌ | ❌ |

**Required Permissions:**
- `admin:departments:read`
- `admin:departments:create`
- `admin:departments:update`
- `admin:departments:delete`
- `admin:departments:restructure`

---

## 3. Enrollment Management

### 3.1 Class Enrollment Admin
**Route:** `/admin/enrollments`
**Description:** Manage program, class, and course enrollments

**UI Components:**
- Enrollment list with filters
- Bulk enrollment tool
- Individual enrollment form
- Enrollment status management (active, completed, withdrawn)
- Transfer students between classes
- Enrollment reports
- Waitlist management

**Role Visibility:**
| Feature | global-admin | department-admin | staff |
|---------|--------------|------------------|-------|
| View enrollments | ✅ | ✅ (dept only) | ✅ (assigned courses) |
| Create enrollments | ✅ | ✅ (dept only) | ✅ (assigned courses) |
| Bulk enroll | ✅ | ✅ (dept only) | ❌ |
| Transfer students | ✅ | ✅ (dept only) | ❌ |
| Unenroll students | ✅ | ✅ (dept only) | ❌ |

**Required Permissions:**
- `admin:enrollments:read`
- `admin:enrollments:create`
- `admin:enrollments:update`
- `admin:enrollments:delete`
- `admin:enrollments:bulk`
- `admin:enrollments:transfer`

**API Endpoints:**
- `GET /api/admin/enrollments`
- `POST /api/admin/enrollments`
- `POST /api/admin/enrollments/bulk`
- `PUT /api/admin/enrollments/:id`
- `DELETE /api/admin/enrollments/:id`

---

## 4. Content & Course Management

### 4.1 Course Templates
**Route:** `/admin/course-templates`
**Description:** Manage reusable course templates

**UI Components:**
- Template library grid/list
- Create new template wizard
- Edit template content
- Clone template to department
- Template preview
- Template versioning
- Template categories/tags

**Role Visibility:**
| Feature | global-admin | department-admin | staff |
|---------|--------------|------------------|-------|
| View all templates | ✅ | ✅ (dept + global) | ✅ (dept + global) |
| Create global templates | ✅ | ❌ | ❌ |
| Create dept templates | ✅ | ✅ | ✅ (with permission) |
| Clone templates | ✅ | ✅ | ✅ (with permission) |
| Edit global templates | ✅ | ❌ | ❌ |
| Edit dept templates | ✅ | ✅ | ✅ (creator) |

**Required Permissions:**
- `admin:templates:read`
- `admin:templates:create`
- `admin:templates:update`
- `admin:templates:delete`
- `admin:templates:clone`
- `admin:templates:publish`

**API Endpoints:**
- `GET /api/admin/course-templates`
- `POST /api/admin/course-templates`
- `PUT /api/admin/course-templates/:id`
- `POST /api/admin/course-templates/:id/clone`

---

### 4.2 Content Library
**Route:** `/admin/content`
**Description:** Unified catalog for SCORM and custom content

**UI Components:**
- Content list with filters (type, status, department)
- Upload SCORM packages
- Create custom content
- Content metadata editor
- Content preview
- Content versioning
- Usage statistics

**Role Visibility:**
| Feature | global-admin | department-admin | staff |
|---------|--------------|------------------|-------|
| View all content | ✅ | ✅ (dept only) | ✅ (dept only) |
| Upload content | ✅ | ✅ (dept only) | ✅ (with permission) |
| Edit content | ✅ | ✅ (dept only) | ✅ (creator) |
| Delete content | ✅ | ✅ (dept only) | ❌ |
| View usage stats | ✅ | ✅ (dept only) | ✅ |

**Required Permissions:**
- `admin:content:read`
- `admin:content:create`
- `admin:content:update`
- `admin:content:delete`

---

### 4.3 Course Editor
**Route:** `/admin/courses/:id/edit`
**Description:** Edit course structure, segments, and content

**UI Components:**
- Course title and description editor
- Segment/module management
- Drag-drop segment reordering
- Add content to segments
- Course settings (prerequisites, duration)
- Publish/unpublish course

**Role Visibility:**
| Feature | global-admin | department-admin | staff |
|---------|--------------|------------------|-------|
| Edit any course | ✅ | ❌ (dept only) | ❌ |
| Edit assigned courses | ✅ | ✅ | ✅ (with permission) |
| Publish courses | ✅ | ✅ (dept only) | ❌ |

**Required Permissions:**
- `content:courses:read`
- `content:courses:update`
- `content:courses:publish`

---

## 5. Reports & Analytics

### 5.1 Content Reports
**Route:** `/admin/reports/content`
**Description:** Unified progress and score reporting

**UI Components:**
- Report builder with filters
- Progress charts and graphs
- Score distribution
- Completion rates
- Time spent analytics
- Export to CSV/PDF

**Role Visibility:**
| Feature | global-admin | department-admin | staff |
|---------|--------------|------------------|-------|
| View all reports | ✅ | ❌ (dept only) | ❌ (assigned courses) |
| Generate reports | ✅ | ✅ | ✅ |
| Export reports | ✅ | ✅ | ✅ |

**Required Permissions:**
- `admin:reports:read`
- `admin:reports:generate`
- `admin:reports:export`

---

### 5.2 Content Attempts
**Route:** `/admin/reports/attempts`
**Description:** Review normalized attempts by content ID

**UI Components:**
- Attempt list with filters
- Individual attempt detail view
- SCORM data viewer
- Retry/reset attempts
- Attempt timeline

**Role Visibility:**
| Feature | global-admin | department-admin | staff |
|---------|--------------|------------------|-------|
| View attempts | ✅ | ✅ (dept only) | ✅ (assigned courses) |
| View SCORM data | ✅ | ✅ | ✅ |
| Reset attempts | ✅ | ✅ (dept only) | ❌ |

**Required Permissions:**
- `admin:attempts:read`
- `admin:attempts:reset`

---

### 5.3 Analytics Dashboard
**Route:** `/admin/analytics`
**Description:** System-wide analytics and insights

**UI Components:**
- KPI cards (users, courses, enrollments, completion)
- Trend charts
- Department comparison
- User engagement metrics
- Course popularity
- Time-based filters

**Role Visibility:**
| Feature | global-admin | department-admin | staff |
|---------|--------------|------------------|-------|
| View system analytics | ✅ | ❌ | ❌ |
| View dept analytics | ✅ | ✅ | ✅ (read-only) |

**Required Permissions:**
- `admin:analytics:read`

---

## 6. System Configuration

### 6.1 Settings
**Route:** `/admin/settings`
**Description:** Configure global system settings

**UI Components:**
- General settings (site name, logo, timezone)
- Pagination defaults
- Email configuration
- Session timeout settings
- File upload limits
- Feature flags
- Localization settings

**Role Visibility:**
| Feature | global-admin | department-admin | staff |
|---------|--------------|------------------|-------|
| View settings | ✅ | ❌ | ❌ |
| Edit settings | ✅ | ❌ | ❌ |
| View dept settings | ✅ | ✅ | ❌ |
| Edit dept settings | ✅ | ✅ | ❌ |

**Required Permissions:**
- `admin:settings:read`
- `admin:settings:update`

**API Endpoints:**
- `GET /api/admin/settings`
- `PUT /api/admin/settings`

---

### 6.2 Permissions Matrix
**Route:** `/admin/permissions`
**Description:** Read-only view of role permissions

**UI Components:**
- Role-permission matrix table
- Permission search/filter
- Permission documentation
- Role comparison tool

**Role Visibility:**
| Feature | global-admin | department-admin | staff |
|---------|--------------|------------------|-------|
| View permissions | ✅ | ✅ (read-only) | ❌ |

**Required Permissions:**
- `admin:permissions:read`

---

## 7. Platform Health & Monitoring

### 7.1 Platform Health
**Route:** `/admin/health`
**Description:** Operational metrics and system health snapshot

**UI Components:**
- System status indicators (green/yellow/red)
- Service health checks
- Resource usage (CPU, memory, disk)
- Active users count
- Error rate monitoring
- Uptime statistics
- Quick diagnostics

**Role Visibility:**
| Feature | global-admin | department-admin | staff |
|---------|--------------|------------------|-------|
| View health | ✅ | ❌ | ❌ |
| Run diagnostics | ✅ | ❌ | ❌ |

**Required Permissions:**
- `admin:health:read`
- `admin:health:diagnostics`

**API Endpoints:**
- `GET /api/admin/health`
- `GET /api/admin/health/services`

---

### 7.2 Database Health
**Route:** `/admin/health/database`
**Description:** Database performance and health monitoring

**UI Components:**
- Database connection status
- Query performance metrics
- Slow query log
- Database size and growth
- Connection pool status
- Index health
- Backup status

**Role Visibility:**
| Feature | global-admin | department-admin | staff |
|---------|--------------|------------------|-------|
| View DB health | ✅ | ❌ | ❌ |
| Run DB diagnostics | ✅ | ❌ | ❌ |

**Required Permissions:**
- `admin:database:read`
- `admin:database:diagnostics`

---

### 7.3 Server Heartbeats & Latency
**Route:** `/admin/health/servers`
**Description:** Real-time server monitoring and latency checks

**UI Components:**
- Server list with status
- Latency measurements (ping times)
- Request/response times
- Server load indicators
- Geographic distribution map
- Alert configuration
- Historical latency charts

**Role Visibility:**
| Feature | global-admin | department-admin | staff |
|---------|--------------|------------------|-------|
| View server status | ✅ | ❌ | ❌ |
| Configure alerts | ✅ | ❌ | ❌ |

**Required Permissions:**
- `admin:servers:read`
- `admin:servers:configure`

---

### 7.4 Audit Logs
**Route:** `/admin/audit-logs`
**Description:** System-wide audit trail

**UI Components:**
- Audit log table with filters
- User action history
- Date range picker
- Log export
- Search by user/action/resource
- Log retention settings

**Role Visibility:**
| Feature | global-admin | department-admin | staff |
|---------|--------------|------------------|-------|
| View all logs | ✅ | ❌ | ❌ |
| View dept logs | ✅ | ✅ | ❌ |
| Export logs | ✅ | ✅ (dept only) | ❌ |

**Required Permissions:**
- `admin:audit:read`
- `admin:audit:export`

---

## 8. Additional Suggested Features

### 8.1 Backup & Restore
**Route:** `/admin/backup`
**Description:** System backup and restore management

**UI Components:**
- Backup schedule configuration
- Manual backup trigger
- Backup list with download
- Restore interface with warnings
- Backup verification
- Storage location config

**Role Visibility:**
| Feature | global-admin | department-admin | staff |
|---------|--------------|------------------|-------|
| View backups | ✅ | ❌ | ❌ |
| Create backup | ✅ | ❌ | ❌ |
| Restore backup | ✅ | ❌ | ❌ |

**Required Permissions:**
- `admin:backup:read`
- `admin:backup:create`
- `admin:backup:restore`

---

### 8.2 Email Templates
**Route:** `/admin/email-templates`
**Description:** Manage system email templates

**UI Components:**
- Template list
- Email template editor
- Variable/placeholder documentation
- Preview functionality
- Test email sender
- Template versioning

**Role Visibility:**
| Feature | global-admin | department-admin | staff |
|---------|--------------|------------------|-------|
| View templates | ✅ | ✅ (dept only) | ❌ |
| Edit templates | ✅ | ✅ (dept only) | ❌ |
| Send test emails | ✅ | ✅ | ❌ |

**Required Permissions:**
- `admin:email-templates:read`
- `admin:email-templates:update`
- `admin:email-templates:test`

---

### 8.3 Notifications
**Route:** `/admin/notifications`
**Description:** System notification management

**UI Components:**
- Notification rules builder
- User notification preferences
- Push notification config
- Email notification config
- In-app notification settings
- Notification history

**Role Visibility:**
| Feature | global-admin | department-admin | staff |
|---------|--------------|------------------|-------|
| Configure system notifications | ✅ | ❌ | ❌ |
| Configure dept notifications | ✅ | ✅ | ❌ |
| View notification history | ✅ | ✅ (dept only) | ❌ |

**Required Permissions:**
- `admin:notifications:read`
- `admin:notifications:configure`

---

### 8.4 Calendar Management
**Route:** `/admin/calendar`
**Description:** System-wide calendar and events

**UI Components:**
- Calendar view (month/week/day)
- Create events
- Holiday management
- Academic calendar sync
- Event categories
- Event notifications

**Role Visibility:**
| Feature | global-admin | department-admin | staff |
|---------|--------------|------------------|-------|
| View calendar | ✅ | ✅ | ✅ |
| Create events | ✅ | ✅ (dept only) | ✅ (with permission) |
| Edit events | ✅ | ✅ (dept events) | ✅ (created events) |

**Required Permissions:**
- `admin:calendar:read`
- `admin:calendar:create`
- `admin:calendar:update`

---

### 8.5 Assessment Management
**Route:** `/admin/assessments`
**Description:** Manage exams, quizzes, and assessments

**UI Components:**
- Assessment list
- Question bank
- Assessment builder
- Question types (MCQ, essay, etc.)
- Grading rubrics
- Assessment analytics

**Role Visibility:**
| Feature | global-admin | department-admin | staff |
|---------|--------------|------------------|-------|
| View assessments | ✅ | ✅ (dept only) | ✅ (assigned) |
| Create assessments | ✅ | ✅ (dept only) | ✅ (with permission) |
| Grade assessments | ✅ | ✅ (dept only) | ✅ (assigned) |

**Required Permissions:**
- `admin:assessments:read`
- `admin:assessments:create`
- `admin:assessments:update`
- `admin:assessments:grade`

---

### 8.6 Certificate Management
**Route:** `/admin/certificates`
**Description:** Digital certificate generation and management

**UI Components:**
- Certificate template designer
- Certificate issuance
- Certificate verification
- Certificate revocation
- Bulk certificate generation
- Certificate branding

**Role Visibility:**
| Feature | global-admin | department-admin | staff |
|---------|--------------|------------------|-------|
| View certificates | ✅ | ✅ (dept only) | ✅ (assigned courses) |
| Create templates | ✅ | ✅ (dept only) | ❌ |
| Issue certificates | ✅ | ✅ (dept only) | ✅ (with permission) |
| Revoke certificates | ✅ | ✅ (dept only) | ❌ |

**Required Permissions:**
- `admin:certificates:read`
- `admin:certificates:create`
- `admin:certificates:issue`
- `admin:certificates:revoke`

---

### 8.7 Integration Management
**Route:** `/admin/integrations`
**Description:** Third-party integrations and webhooks

**UI Components:**
- Integration list (LTI, SSO, etc.)
- API key management
- Webhook configuration
- OAuth app management
- Integration logs
- Test integration tool

**Role Visibility:**
| Feature | global-admin | department-admin | staff |
|---------|--------------|------------------|-------|
| View integrations | ✅ | ❌ | ❌ |
| Configure integrations | ✅ | ❌ | ❌ |
| View integration logs | ✅ | ❌ | ❌ |

**Required Permissions:**
- `admin:integrations:read`
- `admin:integrations:configure`

---

### 8.8 Department Resources
**Route:** `/admin/resources`
**Description:** Review staff, content, and departments within scope

**UI Components:**
- Resource allocation view
- Staff distribution by department
- Content distribution by department
- Resource usage statistics
- Resource allocation tool

**Role Visibility:**
| Feature | global-admin | department-admin | staff |
|---------|--------------|------------------|-------|
| View all resources | ✅ | ❌ | ❌ |
| View dept resources | ✅ | ✅ | ✅ (read-only) |
| Allocate resources | ✅ | ✅ (dept only) | ❌ |

**Required Permissions:**
- `admin:resources:read`
- `admin:resources:allocate`

---

## Implementation Priority

### Phase 1: Core Admin (High Priority)
1. ✅ Admin Dashboard (basic stats)
2. 🔲 User Management
3. 🔲 Department Hierarchy
4. 🔲 Settings

### Phase 2: Academic Management (High Priority)
5. 🔲 Academic Structure
6. 🔲 Class Enrollment Admin
7. 🔲 Course Templates
8. 🔲 Content Library

### Phase 3: Monitoring & Health (Medium Priority)
9. 🔲 Platform Health
10. 🔲 Database Health
11. 🔲 Server Heartbeats & Latency
12. 🔲 Audit Logs

### Phase 4: Reporting (Medium Priority)
13. 🔲 Content Reports
14. 🔲 Content Attempts
15. 🔲 Analytics Dashboard
16. 🔲 Permissions Matrix

### Phase 5: Advanced Features (Low Priority)
17. 🔲 Backup & Restore
18. 🔲 Email Templates
19. 🔲 Notifications
20. 🔲 Calendar Management
21. 🔲 Assessment Management
22. 🔲 Certificate Management
23. 🔲 Integration Management

---

## Missing from V1 (Newly Suggested)

✨ **New Features Not in V1:**
1. **Database Health** - Dedicated DB monitoring
2. **Server Heartbeats & Latency** - Real-time server monitoring
3. **Backup & Restore** - System backup management
4. **Email Templates** - Email template editor
5. **Notifications** - Centralized notification management
6. **Certificate Management** - Digital certificates
7. **Integration Management** - API/webhook management
8. **Analytics Dashboard** - Enhanced analytics beyond basic reports

---

## Summary

**Total Admin Features:** 23
- **From V1:** 15 features
- **User Requested:** 8 features
- **Newly Suggested:** 8 features

**Breakdown by Priority:**
- High Priority: 8 features
- Medium Priority: 8 features
- Low Priority: 7 features

---

## Next Steps

1. Review and approve feature list
2. Prioritize implementation order
3. Design UI mockups for high-priority features
4. Implement V2 Role System integration for each feature
5. Create API endpoint specifications
6. Begin Phase 1 implementation

---

**Document Version:** 1.0
**Last Updated:** 2026-01-11
**Status:** Awaiting Review
