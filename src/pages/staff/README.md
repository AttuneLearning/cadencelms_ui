# Staff Features - Phase 2

This directory contains all staff-specific features for the LMS application.

## Structure

```
staff/
├── dashboard/          # Staff Dashboard with overview statistics
├── analytics/          # Course Analytics with detailed metrics
└── students/          # Student Progress management
```

## Features

### 1. Staff Dashboard (`/staff/dashboard`)
- **Overview Statistics**: Total students, courses, average completion, certificates issued
- **Recent Enrollments**: Quick view of latest student enrollments
- **Enrollment Trends**: Weekly chart showing enrollments and completions
- **Quick Actions**: Shortcuts to common staff tasks
- **Top Performing Courses**: List of courses with highest completion rates

**Access**: Staff and Global Admin roles only

### 2. Course Analytics (`/staff/analytics`)
- **Enrollment Trends**: Monthly enrollment, completion, and active student statistics
- **Completion Rates**: Visual breakdown of student completion status
- **Score Distribution**: Bar chart showing score ranges across students
- **Time Spent Analytics**: Average time per lesson and overall engagement metrics
- **Export Reports**: Download analytics data in PDF, CSV, or Excel format

**Features by Tab**:
- **Enrollments Tab**: Enrollment summary and peak enrollment times
- **Completion Tab**: Pie chart and detailed completion insights
- **Scores Tab**: Score distribution and pass rates
- **Time Tab**: Time spent per lesson and engagement patterns

**Access**: Staff and Global Admin roles only

### 3. Student Progress (`/staff/students`)
- **Student List**: All students with progress across courses
- **Search & Filter**: Search by name/email, filter by course and status
- **Progress Details**: Click any student to view detailed progress modal
- **Summary Statistics**: Total students, active students, completed courses, average progress
- **Export Data**: Export student progress data

**Student Detail Modal Shows**:
- Overall progress percentage
- Total time spent learning
- Certificates earned
- Per-course breakdown with:
  - Progress percentage
  - Lessons completed
  - Time spent
  - Average score
  - Status badge

**Access**: Staff and Global Admin roles only

## Analytics Widgets

All pages utilize reusable analytics widgets located in `/src/widgets/analytics/`:

- **StatCard**: Display key metrics with icons and trends
- **LineChart**: Multi-line charts for time-series data
- **BarChart**: Bar charts for categorical comparisons
- **PieChart**: Pie charts for distribution visualization
- **ProgressTable**: Sortable table with progress bars and status badges

## Usage

### Accessing Staff Features

Staff features are protected by role-based access control:

```typescript
// In router configuration
<ProtectedRoute roles={['staff', 'global-admin']}>
  <StaffDashboardPage />
</ProtectedRoute>
```

### Integrating with API

All pages currently use mock data. To integrate with real API:

1. Create API hooks in `/src/entities/` layers
2. Replace mock data constants with React Query hooks
3. Update import statements to use actual data fetchers

Example:
```typescript
// Replace
const mockStats = { totalStudents: 1247, ... };

// With
const { data: stats } = useStaffStats();
```

## Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/staff/dashboard` | StaffDashboardPage | Main staff overview |
| `/staff/analytics` | CourseAnalyticsPage | Detailed course analytics |
| `/staff/students` | StudentProgressPage | Student progress management |

## Dependencies

- **recharts**: ^2.x - Charting library for analytics visualizations
- **@radix-ui/react-progress**: ^1.x - Progress bar component
- All other dependencies inherited from main package.json

## Future Enhancements

- Real-time data updates with websockets
- Advanced filtering and sorting options
- Bulk actions for student management
- Customizable dashboard widgets
- Scheduled report generation
- Email notifications for key metrics
- CSV/Excel import for bulk operations
- Advanced analytics with predictive insights
