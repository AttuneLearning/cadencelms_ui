# API Integration Guide - Person Data v2.0

**Version**: 2.0.0
**Date**: 2026-01-13

---

## Overview

This guide documents all Person Data v2.0 API endpoints including person data, demographics, and password management. All endpoints require authentication via JWT access token or admin token.

---

## Base URL

```
/api/v2
```

All endpoints are prefixed with `/api/v2` unless otherwise noted.

---

## Authentication

### Token Priority

The API client automatically handles token selection:

1. **Admin Token** (if active) - For elevated privileges
2. **Access Token** (fallback) - For normal user operations

### Headers

```http
Authorization: Bearer <token>
Content-Type: application/json
```

---

## Person API Endpoints

### Get Current User's Person Data

Retrieve basic person data for the authenticated user.

**Endpoint**: `GET /users/me/person`

**Response**:
```json
{
  "success": true,
  "data": {
    "firstName": "Jane",
    "middleName": null,
    "lastName": "Smith",
    "suffix": null,
    "preferredFirstName": "Janey",
    "preferredLastName": null,
    "pronouns": "she/her",
    "emails": [
      {
        "email": "jane@example.com",
        "type": "personal",
        "isPrimary": true
      }
    ],
    "phones": [
      {
        "number": "+1-555-123-4567",
        "type": "mobile",
        "isPrimary": true
      }
    ],
    "addresses": [
      {
        "street1": "123 Main St",
        "street2": "Apt 4B",
        "city": "Springfield",
        "state": "IL",
        "postalCode": "62701",
        "country": "USA",
        "type": "home",
        "isPrimary": true
      }
    ],
    "avatar": "https://example.com/avatars/jane.jpg",
    "bio": "Software engineer passionate about learning",
    "timezone": "America/Chicago",
    "languagePreference": "en-US",
    "locale": "en-US",
    "communicationPreferences": {
      "emailNotifications": true,
      "smsNotifications": false,
      "pushNotifications": true,
      "marketingEmails": false
    },
    "legalConsent": {
      "termsAccepted": true,
      "termsAcceptedAt": "2024-01-15T10:30:00Z",
      "privacyPolicyAccepted": true,
      "privacyPolicyAcceptedAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

**Example Usage**:
```typescript
import { personApi } from '@/shared/api/personApi';

const { data } = await personApi.getMyPerson();
console.log(data.firstName); // "Jane"
console.log(data.preferredFirstName); // "Janey"
```

---

### Update Current User's Person Data

Update basic person data for the authenticated user. Partial updates are supported.

**Endpoint**: `PUT /users/me/person`

**Request Body** (all fields optional):
```json
{
  "preferredFirstName": "Janey",
  "pronouns": "they/them",
  "phones": [
    {
      "number": "+1-555-987-6543",
      "type": "mobile",
      "isPrimary": true
    }
  ],
  "addresses": [
    {
      "street1": "456 Oak Ave",
      "city": "Chicago",
      "state": "IL",
      "postalCode": "60601",
      "country": "USA",
      "type": "home",
      "isPrimary": true
    }
  ],
  "bio": "Updated bio text",
  "timezone": "America/New_York",
  "communicationPreferences": {
    "emailNotifications": true,
    "smsNotifications": true
  }
}
```

**Response**:
```json
{
  "success": true,
  "message": "Person data updated successfully",
  "data": {
    // Updated person object
  }
}
```

**Example Usage**:
```typescript
import { personApi } from '@/shared/api/personApi';

await personApi.updateMyPerson({
  preferredFirstName: 'Janey',
  pronouns: 'they/them',
});
```

---

## Extended Person API Endpoints

Extended person data contains role-specific information (learner or staff).

### Get Extended Person Data

Retrieve role-specific extended person data.

**Endpoint**: `GET /users/me/person/extended`

**Response (Learner)**:
```json
{
  "success": true,
  "data": {
    "role": "learner",
    "learner": {
      "studentId": "STU-2024-001",
      "program": {
        "_id": "prog-123",
        "name": "Computer Science",
        "code": "CS"
      },
      "department": {
        "_id": "dept-456",
        "name": "Engineering",
        "code": "ENG"
      },
      "enrollmentDate": "2024-01-15T00:00:00Z",
      "expectedGraduationDate": "2028-05-15T00:00:00Z",
      "academicStatus": "active",
      "gpa": 3.75,
      "credits": {
        "earned": 45,
        "required": 120
      }
    }
  }
}
```

**Response (Staff)**:
```json
{
  "success": true,
  "data": {
    "role": "staff",
    "staff": {
      "employeeId": "EMP-2024-001",
      "title": "Associate Professor",
      "department": {
        "_id": "dept-456",
        "name": "Engineering",
        "code": "ENG"
      },
      "hireDate": "2020-08-15T00:00:00Z",
      "officeLocation": "Building A, Room 301",
      "officeHours": {
        "monday": "14:00-16:00",
        "wednesday": "14:00-16:00"
      },
      "phoneExtension": "x1234"
    }
  }
}
```

**Example Usage**:
```typescript
import { personApi } from '@/shared/api/personApi';

const { data } = await personApi.getMyPersonExtended();

if (data.role === 'learner') {
  console.log(data.learner.studentId); // "STU-2024-001"
  console.log(data.learner.gpa); // 3.75
} else if (data.role === 'staff') {
  console.log(data.staff.employeeId); // "EMP-2024-001"
  console.log(data.staff.title); // "Associate Professor"
}
```

---

### Update Extended Person Data

Update role-specific extended person data. Only fields relevant to the user's role can be updated.

**Endpoint**: `PUT /users/me/person/extended`

**Request Body (Learner)**:
```json
{
  "expectedGraduationDate": "2028-12-15T00:00:00Z"
}
```

**Request Body (Staff)**:
```json
{
  "officeLocation": "Building B, Room 405",
  "officeHours": {
    "tuesday": "10:00-12:00",
    "thursday": "10:00-12:00"
  }
}
```

**Response**:
```json
{
  "success": true,
  "message": "Extended person data updated successfully",
  "data": {
    // Updated extended person object
  }
}
```

**Example Usage**:
```typescript
import { personApi } from '@/shared/api/personApi';

await personApi.updateMyPersonExtended({
  officeLocation: 'Building B, Room 405',
});
```

---

## Demographics API Endpoints

Demographics endpoints handle compliance-related data (IPEDS, Title IX, ADA).

### Get Demographics Data

Retrieve demographics data for the authenticated user.

**Endpoint**: `GET /users/me/demographics`

**Response**:
```json
{
  "success": true,
  "data": {
    "dateOfBirth": "1995-03-15",
    "countryOfBirth": "USA",
    "citizenship": "US Citizen",
    "ethnicity": "Hispanic or Latino",
    "race": ["White", "Asian"],
    "gender": "Female",
    "veteranStatus": "Not a Veteran",
    "disability": {
      "hasDisability": false,
      "accommodationsNeeded": null
    },
    "firstGeneration": true,
    "socioeconomicStatus": "Pell Grant Eligible",
    "ipeds": {
      "reportingCategory": "Hispanic",
      "reportYear": 2024
    }
  }
}
```

**Example Usage**:
```typescript
import { demographicsApi } from '@/shared/api/demographicsApi';

const { data } = await demographicsApi.getMyDemographics();
console.log(data.ethnicity); // "Hispanic or Latino"
console.log(data.firstGeneration); // true
```

---

### Update Demographics Data

Update demographics data for the authenticated user. All fields are optional.

**Endpoint**: `PUT /users/me/demographics`

**Request Body**:
```json
{
  "ethnicity": "Hispanic or Latino",
  "race": ["White"],
  "gender": "Female",
  "veteranStatus": "Veteran",
  "disability": {
    "hasDisability": true,
    "accommodationsNeeded": "Extended test time, note-taking services"
  },
  "firstGeneration": true
}
```

**Response**:
```json
{
  "success": true,
  "message": "Demographics data updated successfully",
  "data": {
    // Updated demographics object
  }
}
```

**Example Usage**:
```typescript
import { demographicsApi } from '@/shared/api/demographicsApi';

await demographicsApi.updateMyDemographics({
  ethnicity: 'Hispanic or Latino',
  firstGeneration: true,
});
```

---

## Password Management API Endpoints

### Change User Password

Change password for the authenticated user. User session remains active after password change.

**Endpoint**: `POST /users/me/password`

**Request Body**:
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass456!@"
}
```

**Response (Success)**:
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Response (Error - 401)**:
```json
{
  "success": false,
  "message": "Current password is incorrect"
}
```

**Response (Error - 400)**:
```json
{
  "success": false,
  "message": "New password does not meet requirements"
}
```

**Example Usage**:
```typescript
import { changeUserPassword } from '@/features/auth/api/passwordApi';

try {
  const result = await changeUserPassword({
    currentPassword: 'OldPass123!',
    newPassword: 'NewPass456!@'
  });
  console.log(result.message); // "Password changed successfully"
} catch (error) {
  console.error(error.message); // "Current password is incorrect"
}
```

**Password Requirements**:
- At least 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (!@#$%^&*...)

**Validation**:
Use `validatePasswordStrength()` to check password requirements before submission:

```typescript
import { validatePasswordStrength } from '@/features/auth/api/passwordApi';

const validation = validatePasswordStrength('MyPass123!');
console.log(validation.strength); // "strong"
console.log(validation.isValid); // true
console.log(validation.requirements.minLength); // true
```

---

### Change Admin Password

Change password for the authenticated admin. Admin session remains active after password change.

**Endpoint**: `POST /admin/me/password`

**Request Body**:
```json
{
  "currentPassword": "OldAdminPass!",
  "newPassword": "NewAdminPass@123"
}
```

**Response**:
Same format as user password change endpoint.

**Example Usage**:
```typescript
import { changeAdminPassword } from '@/features/auth/api/passwordApi';

try {
  const result = await changeAdminPassword({
    currentPassword: 'OldAdminPass!',
    newPassword: 'NewAdminPass@123'
  });
  console.log(result.message); // "Admin password changed successfully"
} catch (error) {
  console.error(error.message); // "Current password is incorrect"
}
```

---

## Error Handling

All API endpoints use consistent error responses:

```typescript
interface ApiError {
  success: false;
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
}
```

**Common Error Codes**:

| Status | Code | Message | Description |
|--------|------|---------|-------------|
| 400 | `VALIDATION_ERROR` | Validation failed | Request body validation failed |
| 401 | `UNAUTHORIZED` | Unauthorized | Missing or invalid token |
| 401 | `INVALID_PASSWORD` | Current password is incorrect | Wrong current password provided |
| 403 | `FORBIDDEN` | Forbidden | Insufficient permissions |
| 404 | `NOT_FOUND` | Resource not found | Person/demographics data not found |
| 500 | `SERVER_ERROR` | Internal server error | Unexpected server error |

**Example Error Handling**:
```typescript
import { personApi } from '@/shared/api/personApi';
import { ApiClientError } from '@/shared/api/client';

try {
  await personApi.updateMyPerson({ preferredFirstName: 'Janey' });
} catch (error) {
  if (error instanceof ApiClientError) {
    console.error(`Error ${error.status}: ${error.message}`);
    if (error.errors) {
      console.error('Validation errors:', error.errors);
    }
  } else {
    console.error('Unexpected error:', error);
  }
}
```

---

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **Person/Demographics Updates**: 10 requests per minute
- **Password Changes**: 5 requests per hour
- **Read Operations**: 100 requests per minute

**Rate Limit Headers**:
```http
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1640000000
```

---

## Testing

### MSW Mock Handlers

All Person v2.0 endpoints are mocked in test environment via MSW (Mock Service Worker).

**Location**: `src/test/mocks/server.ts`

**Example Test**:
```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { server } from '@/test/mocks/server';
import { http, HttpResponse } from 'msw';
import { env } from '@/shared/config/env';

test('should handle API error', async () => {
  // Override mock for this test
  server.use(
    http.put(`${env.apiBaseUrl}/api/v2/users/me/person`, () => {
      return HttpResponse.json(
        { success: false, message: 'Validation failed' },
        { status: 400 }
      );
    })
  );

  // Test component that calls the API
  render(<MyComponent />);

  await waitFor(() => {
    expect(screen.getByText('Validation failed')).toBeInTheDocument();
  });
});
```

---

## API Client Configuration

The API client is configured in `src/shared/api/client.ts`:

**Features**:
- Automatic token attachment (admin token priority)
- Token refresh on 401 errors
- Request/response interceptors
- Consistent error handling
- TypeScript types for all responses

**Usage**:
```typescript
import { client } from '@/shared/api/client';

// GET request
const response = await client.get('/users/me/person');

// POST request
const response = await client.post('/users/me/password', {
  currentPassword: 'old',
  newPassword: 'new'
});

// PUT request
const response = await client.put('/users/me/person', {
  preferredFirstName: 'Janey'
});
```

---

## Frequently Asked Questions

### Q: How do I access person data in components?

Use the `useCurrentUser` hook which provides computed values:

```typescript
import { useCurrentUser } from '@/features/auth/hooks';

function MyComponent() {
  const { person, displayName, primaryEmail } = useCurrentUser();

  return (
    <div>
      <h1>{displayName}</h1>
      <p>{primaryEmail}</p>
    </div>
  );
}
```

### Q: How do I update person data with auto-save?

Use the `useAutoSave` hook with 2-minute debounce:

```typescript
import { useAutoSave } from '@/features/profile/hooks/useAutoSave';
import { personApi } from '@/shared/api/personApi';

function MyForm() {
  const [formData, setFormData] = useState({});

  useAutoSave({
    data: formData,
    save: async (data) => {
      await personApi.updateMyPerson(data);
    },
    debounceMs: 120000, // 2 minutes
  });

  // Form renders here
}
```

### Q: Should I use person or demographics API?

- **Person API**: For profile data (name, contact, preferences)
- **Demographics API**: For compliance data (ethnicity, race, disability)

See `docs/PERSON_DATA_USAGE.md` for detailed guidance.

### Q: How do I format phone numbers for display?

Use the `formatPhoneNumber` helper:

```typescript
import { getPrimaryPhone, formatPhoneNumber } from '@/shared/lib/person-helpers';

const phoneObj = getPrimaryPhone(person);
const formatted = phoneObj ? formatPhoneNumber(phoneObj) : null;
// "+1 (555) 123-4567"
```

---

## Resources

- **Type Definitions**: `src/shared/types/person.ts`
- **Helper Functions**: `src/shared/lib/person-helpers.ts`
- **API Services**:
  - `src/shared/api/personApi.ts`
  - `src/shared/api/demographicsApi.ts`
  - `src/features/auth/api/passwordApi.ts`
- **Test Mocks**: `src/test/mocks/server.ts`
- **Test Fixtures**: `src/test/fixtures/person.fixtures.ts`

---

**Last Updated**: 2026-01-13
**Version**: 2.0.0
