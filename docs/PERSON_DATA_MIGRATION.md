# Person Data v2.0 Migration Guide

**Version**: 2.0.0
**Date**: 2026-01-13
**Status**: COMPLETE

---

## Overview

This guide documents the migration from Person Data v1.0 (flat structure) to v2.0 (three-layer architecture). The Person Data v2.0 introduces a comprehensive, extensible person management system with:

1. **IPerson (Basic)** - Core contact & identity
2. **IPersonExtended** - Role-specific data (learner/staff)
3. **IDemographics** - Compliance data (IPEDS, Title IX, ADA)

---

## What Changed

### Data Structure Migration

**Before (v1.0):**
```typescript
interface User {
  id: string;
  email: string;
  firstName: string;        // ❌ REMOVED (moved to person)
  lastName: string;          // ❌ REMOVED (moved to person)
  phone: string;             // ❌ REMOVED (moved to person.phones[])
  profileImage: string;      // ❌ REMOVED (renamed to person.avatar)
}
```

**After (v2.0):**
```typescript
interface User {
  _id: string;
  email: string;
  person: IPerson;           // ✅ NEW: Nested person object
  userTypes: UserType[];
  defaultDashboard: DashboardType;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface IPerson {
  // Core Identity
  firstName: string;
  middleName: string | null;
  lastName: string;
  suffix: string | null;
  preferredFirstName: string | null;  // ✅ NEW
  preferredLastName: string | null;   // ✅ NEW
  pronouns: string | null;             // ✅ NEW

  // Contact Information
  emails: IEmail[];          // ✅ NEW: Array of emails
  phones: IPhone[];          // ✅ NEW: Array of phones
  addresses: IAddress[];     // ✅ NEW: Array of addresses

  // Profile
  avatar: string | null;     // ✅ Renamed from profileImage
  bio: string | null;

  // Preferences
  timezone: string;
  languagePreference: string;
  locale: string | null;

  // Communication & Legal
  communicationPreferences: ICommunicationPreferences;
  legalConsent: ILegalConsent;
}
```

---

## Field Mapping Table

| Old Field (v1.0) | New Field (v2.0) | Migration Action |
|------------------|------------------|------------------|
| `user.firstName` | `user.person.firstName` | Update path |
| `user.lastName` | `user.person.lastName` | Update path |
| `user.phone` | `user.person.phones[0].number` | Update path + array access |
| `user.profileImage` | `user.person.avatar` | Update path + rename |
| N/A | `user.person.preferredFirstName` | Add support (optional) |
| N/A | `user.person.preferredLastName` | Add support (optional) |
| N/A | `user.person.pronouns` | Add support (optional) |
| N/A | `user.person.emails[]` | Add support (array) |
| N/A | `user.person.addresses[]` | Add support (array) |

---

## Code Migration Examples

### Example 1: Display User Name

**Before (v1.0):**
```typescript
function UserGreeting({ user }) {
  const name = `${user.firstName} ${user.lastName}`;
  return <h1>Welcome, {name}!</h1>;
}
```

**After (v2.0):**
```typescript
import { getDisplayName } from '@/shared/lib/person-helpers';

function UserGreeting({ user }) {
  const name = getDisplayName(user.person);
  return <h1>Welcome, {name}!</h1>;
}
```

**Why?** The helper function handles preferred names, null checks, and proper formatting automatically.

---

### Example 2: Display User Avatar

**Before (v1.0):**
```typescript
function UserAvatar({ user }) {
  return (
    <img
      src={user.profileImage || '/default-avatar.png'}
      alt={`${user.firstName} ${user.lastName}`}
    />
  );
}
```

**After (v2.0):**
```typescript
import { UserAvatar } from '@/entities/user/ui/UserAvatar';

function MyComponent({ user }) {
  return (
    <UserAvatar
      person={user.person}
      displayName={getDisplayName(user.person)}
      size="md"
    />
  );
}
```

**Why?** The UserAvatar component handles avatar fallbacks, initials generation, and sizing automatically.

---

### Example 3: Display User Contact Info

**Before (v1.0):**
```typescript
function ContactCard({ user }) {
  return (
    <div>
      <p>Email: {user.email}</p>
      <p>Phone: {user.phone || 'Not provided'}</p>
    </div>
  );
}
```

**After (v2.0):**
```typescript
import { getPrimaryEmail, getPrimaryPhone } from '@/shared/lib/person-helpers';

function ContactCard({ user }) {
  const primaryEmail = getPrimaryEmail(user.person);
  const primaryPhone = getPrimaryPhone(user.person);

  return (
    <div>
      <p>Email: {primaryEmail?.email || user.email}</p>
      <p>Phone: {primaryPhone?.number || 'Not provided'}</p>
    </div>
  );
}
```

**Why?** The helper functions find the primary contact from arrays and handle null cases.

---

### Example 4: Using Auth Hooks

**Before (v1.0):**
```typescript
function Profile() {
  const { user } = useAuthStore();

  return (
    <div>
      <h1>{user?.firstName} {user?.lastName}</h1>
      <p>{user?.email}</p>
    </div>
  );
}
```

**After (v2.0):**
```typescript
import { useCurrentUser } from '@/features/auth/hooks';

function Profile() {
  const { displayName, primaryEmail, person } = useCurrentUser();

  return (
    <div>
      <h1>{displayName}</h1>
      {person?.pronouns && <span className="italic">({person.pronouns})</span>}
      <p>{primaryEmail}</p>
    </div>
  );
}
```

**Why?** The useCurrentUser hook provides computed values (displayName, primaryEmail) and person data in one place.

---

## Common Migration Patterns

### Pattern 1: Null-Safe Name Access

```typescript
// ❌ DON'T: Direct access without null checks
const name = `${user.person.firstName} ${user.person.lastName}`;

// ✅ DO: Use helper function
import { getDisplayName } from '@/shared/lib/person-helpers';
const name = getDisplayName(user.person);
```

### Pattern 2: Primary Contact Resolution

```typescript
// ❌ DON'T: Assume first item is primary
const email = user.person.emails[0]?.email;

// ✅ DO: Use helper function
import { getPrimaryEmail } from '@/shared/lib/person-helpers';
const email = getPrimaryEmail(user.person)?.email;
```

### Pattern 3: Phone Number Formatting

```typescript
// ❌ DON'T: Display raw phone number
const phone = user.person.phones[0]?.number;

// ✅ DO: Format phone number
import { getPrimaryPhone, formatPhoneNumber } from '@/shared/lib/person-helpers';
const phoneObj = getPrimaryPhone(user.person);
const formattedPhone = phoneObj ? formatPhoneNumber(phoneObj) : null;
```

### Pattern 4: Backward Compatibility

```typescript
// ✅ Support both v1.0 and v2.0 data structures
function getUserName(user: User): string {
  if (user.person) {
    // v2.0 path
    return getDisplayName(user.person);
  } else if (user.firstName || user.lastName) {
    // v1.0 fallback
    return `${user.firstName || ''} ${user.lastName || ''}`.trim();
  }
  return 'Unknown User';
}
```

---

## Helper Functions Reference

### Core Helpers (in `@/shared/lib/person-helpers`)

| Function | Purpose | Return Type |
|----------|---------|-------------|
| `getDisplayName(person)` | Get formatted name (preferred or legal) | `string` |
| `getFullLegalName(person)` | Get full legal name (all parts) | `string` |
| `getPrimaryEmail(person)` | Find primary email object | `IEmail \| undefined` |
| `getPrimaryPhone(person)` | Find primary phone object | `IPhone \| undefined` |
| `getPrimaryAddress(person)` | Find primary address object | `IAddress \| undefined` |
| `formatPhoneNumber(phone)` | Format phone number (US/intl) | `string` |

### Example Usage

```typescript
import {
  getDisplayName,
  getPrimaryEmail,
  getPrimaryPhone,
  formatPhoneNumber,
} from '@/shared/lib/person-helpers';

// Get display name (handles preferred names)
const name = getDisplayName(person); // "Janey Smith" (preferred) or "Jane Smith" (legal)

// Get primary contacts
const emailObj = getPrimaryEmail(person);
const phoneObj = getPrimaryPhone(person);

// Access contact values
const email = emailObj?.email; // "jane@example.com"
const phone = phoneObj?.number; // "+1-555-123-4567"

// Format phone for display
const formatted = phone ? formatPhoneNumber(phoneObj!) : null; // "(555) 123-4567"
```

---

## API Endpoints

### Person Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v2/users/me/person` | GET | Get basic person data |
| `/api/v2/users/me/person` | PUT | Update basic person data |
| `/api/v2/users/me/person/extended` | GET | Get role-specific data |
| `/api/v2/users/me/person/extended` | PUT | Update role-specific data |
| `/api/v2/users/me/demographics` | GET | Get demographics data |
| `/api/v2/users/me/demographics` | PUT | Update demographics data |
| `/api/v2/users/me/password` | POST | Change user password |
| `/api/v2/admin/me/password` | POST | Change admin password |

### Example API Usage

```typescript
import { personApi } from '@/shared/api/personApi';

// Fetch person data
const { data } = await personApi.getMyPerson();

// Update person data (partial update supported)
await personApi.updateMyPerson({
  preferredFirstName: 'Janey',
  pronouns: 'they/them',
});
```

---

## Troubleshooting

### Issue: TypeError - Cannot read property 'firstName' of undefined

**Cause**: Trying to access person data before checking if it exists.

**Solution**:
```typescript
// ❌ BAD
const name = user.person.firstName;

// ✅ GOOD
const name = user.person?.firstName || '';

// ✅ BETTER
import { getDisplayName } from '@/shared/lib/person-helpers';
const name = user.person ? getDisplayName(user.person) : '';
```

### Issue: Cannot read property 'number' of undefined

**Cause**: Trying to access phones[0] when array is empty.

**Solution**:
```typescript
// ❌ BAD
const phone = user.person.phones[0].number;

// ✅ GOOD
import { getPrimaryPhone } from '@/shared/lib/person-helpers';
const phoneObj = getPrimaryPhone(user.person);
const phone = phoneObj?.number;
```

### Issue: Name displays as "null null"

**Cause**: Concatenating null values without checking.

**Solution**:
```typescript
// ❌ BAD
const name = `${user.person.firstName} ${user.person.lastName}`;

// ✅ GOOD
import { getDisplayName } from '@/shared/lib/person-helpers';
const name = getDisplayName(user.person);
```

---

## Testing Migration

### Unit Test Example

```typescript
import { describe, it, expect } from 'vitest';
import { getDisplayName } from '@/shared/lib/person-helpers';
import { mockPersonWithAllFields } from '@/test/fixtures/person.fixtures';

describe('Display Name Migration', () => {
  it('should use preferred name when available', () => {
    const name = getDisplayName(mockPersonWithAllFields);
    expect(name).toBe('Janey Smith'); // preferred, not "Jane Smith"
  });

  it('should fall back to legal name', () => {
    const person = { ...mockPersonWithAllFields, preferredFirstName: null };
    const name = getDisplayName(person);
    expect(name).toBe('Jane Smith'); // legal name
  });
});
```

---

## Checklist for Migration

- [ ] Replace direct `user.firstName` access with `user.person.firstName`
- [ ] Replace `user.phone` with `getPrimaryPhone(user.person)`
- [ ] Replace `user.profileImage` with `user.person.avatar`
- [ ] Use `getDisplayName()` for all name displays
- [ ] Use `getPrimaryEmail()` for email access
- [ ] Use `UserAvatar` component instead of direct `<img>`
- [ ] Add null checks for `user.person`
- [ ] Support preferred names in displays
- [ ] Add pronouns display (optional)
- [ ] Update tests to use new structure
- [ ] Update API calls to use personApi
- [ ] Add backward compatibility if needed

---

## Resources

- **Type Definitions**: `src/shared/types/person.ts`
- **Helper Functions**: `src/shared/lib/person-helpers.ts`
- **API Client**: `src/shared/api/personApi.ts`
- **Test Fixtures**: `src/test/fixtures/person.fixtures.ts`
- **Auth Hooks**: `src/features/auth/hooks/`
- **UI Components**: `src/entities/user/ui/UserAvatar.tsx`, `src/shared/ui/UserCard.tsx`

---

## Support

For questions or issues with migration:
1. Check this guide first
2. Review helper function documentation
3. Check test fixtures for examples
4. Contact the development team

---

**Migration Status**: ✅ COMPLETE
**Last Updated**: 2026-01-13
**Version**: 2.0.0
