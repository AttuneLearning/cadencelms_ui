# Profile Page

## Overview

The Profile Page displays and allows editing of the current authenticated user's profile information. It provides a comprehensive view of user details, including role-specific information such as department assignments for staff members.

## Location

- **Path**: `/profile`
- **File**: `/home/adam/github/lms_ui/1_lms_ui_v2/src/pages/profile/ProfilePage.tsx`
- **Route**: Protected route accessible to all authenticated users

## Features

### Core Functionality

1. **View Profile**
   - Displays user's personal information (name, email, phone)
   - Shows profile image with avatar fallback
   - Displays role badges and status indicators
   - Shows account metadata (creation date, last login)

2. **Edit Profile**
   - Toggle between view and edit modes
   - Inline form for updating profile information
   - Real-time validation
   - Success toast notification on update
   - Cancel option to discard changes

3. **Role-Specific Sections**
   - **Learners**: Display student ID
   - **Staff**: Display assigned departments and roles
   - **All Users**: Display permissions and account status

4. **Department Management (Staff Only)**
   - Lists all assigned departments
   - Shows department codes and descriptions
   - Displays user's role within each department
   - Indicates active/inactive department status
   - Empty state when no departments assigned
   - Error handling for department fetch failures

5. **Account Information**
   - Account status (active, inactive, withdrawn)
   - User role with color-coded badges
   - Account creation date
   - Last login timestamp
   - Student ID (learners only)
   - System permissions

## Component Structure

```
ProfilePage
├── Header Section
│   ├── Page title and description
│   └── Edit Profile button
│
├── Profile Card/Form (toggleable)
│   ├── UserProfileCard (view mode)
│   └── UserProfileForm (edit mode)
│
├── My Departments (staff only)
│   ├── Department list
│   ├── Loading state
│   ├── Error state
│   └── Empty state
│
└── Account Information
    ├── Status and role badges
    ├── Timestamps
    ├── Student ID (learners)
    └── Permissions list
```

## Dependencies

### Entity Layer
- `@/entities/user-profile`
  - `useUserProfile()` - Fetches current user's profile
  - `useUserDepartments()` - Fetches staff member's departments
  - `UserProfileCard` - Displays profile in view mode
  - `UserProfileForm` - Profile edit form
  - Types: `UserProfile`, `UserDepartment`

### Shared Components
- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent` - Layout
- `Button` - Actions
- `Badge` - Status and role indicators
- `Skeleton` - Loading states
- `Alert`, `AlertDescription` - Error messages
- `useToast` - Success notifications
- `useNavigation` - Breadcrumb management

### Icons
- `Edit` - Edit button
- `X` - Cancel button
- `Building2` - Department section
- `Users` - Empty department state
- `AlertCircle` - Error indicators

## State Management

### Local State
- `isEditing: boolean` - Tracks edit mode toggle

### React Query
- Profile data automatically cached and revalidated
- Department data fetched conditionally for staff
- Optimistic updates on profile save
- Error and loading states managed by hooks

## User Experience

### View Mode
1. User views their profile with all information displayed in cards
2. Color-coded badges indicate status and role
3. Staff members see their department assignments
4. Click "Edit Profile" to enter edit mode

### Edit Mode
1. Form appears with current values pre-filled
2. User can modify firstName, lastName, phone, and profileImage
3. Email is read-only (must contact admin to change)
4. Click "Save Changes" to update (shows success toast)
5. Click "Cancel" to exit without saving

### Loading States
- Skeleton placeholders for profile data
- Skeleton placeholders for departments (staff)
- Smooth transitions between loading and loaded states

### Error Handling
- Profile fetch error shows alert message
- Department fetch error shows inline alert
- Form validation errors displayed inline
- Network errors handled gracefully

## Accessibility

- Semantic HTML structure
- Proper heading hierarchy (h1, h2, h3, h4)
- ARIA labels on buttons
- Keyboard navigation support
- Focus management in edit mode
- Color contrast meets WCAG standards

## Responsive Design

- Mobile-first approach
- Single column on mobile
- Two-column grid on tablet/desktop (Account Information section)
- Adaptive spacing and typography
- Touch-friendly button sizes

## Testing

Comprehensive test suite covering:

### Test Coverage
- ✅ Loading states (profile and departments)
- ✅ Error states (profile and departments)
- ✅ Learner profile display
- ✅ Staff profile with departments
- ✅ Edit mode toggle
- ✅ Cancel edit functionality
- ✅ Empty department state
- ✅ Account information display
- ✅ Role-specific content

### Running Tests
```bash
npm run test src/pages/profile/__tests__/ProfilePage.test.tsx
```

## API Integration

### Endpoints Used
- `GET /api/users/me` - Fetch current user profile
- `PUT /api/users/me` - Update profile
- `GET /api/users/me/departments` - Fetch staff departments

### Query Keys
- `['user-profile', 'profile']` - Profile data
- `['user-profile', 'departments']` - Department data

## Navigation

### Breadcrumbs
```
Home → Profile
```

### Access
- Available from user menu dropdown
- Direct link: `/profile`
- Protected route (requires authentication)

## Future Enhancements

Potential improvements:
1. Profile image upload functionality
2. Password change section
3. Two-factor authentication settings
4. Activity history/audit log
5. Connected accounts (social logins)
6. Notification preferences
7. Export profile data (GDPR compliance)
8. Profile completion indicator

## Related Pages

- `/dashboard` - User dashboard
- `/admin/users` - User management (admin only)
- `/staff/dashboard` - Staff dashboard

## Notes

- Email cannot be changed by users (admin-only operation)
- Profile updates are validated against API schema
- Department data only fetched for staff role
- Toast notifications use global toast system
- Breadcrumbs auto-update on page mount
