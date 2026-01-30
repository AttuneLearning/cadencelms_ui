# Person Data v2.0 Developer Guide

**Version**: 2.0.0
**Date**: 2026-01-13
**Audience**: Frontend Developers

---

## Table of Contents

1. [Overview](#overview)
2. [When to Use What](#when-to-use-what)
3. [Helper Functions](#helper-functions)
4. [Components](#components)
5. [Hooks](#hooks)
6. [API Integration](#api-integration)
7. [Best Practices](#best-practices)
8. [Common Patterns](#common-patterns)

---

## Overview

Person Data v2.0 provides a three-layer architecture for person information:

### Layer 1: IPerson (Basic)
Core contact information and identity shared across all user types.

**Use for**: Names, contact info, avatar, preferences, communication settings

**Endpoint**: `GET /api/v2/users/me/person`

### Layer 2: IPersonExtended (Role-Specific)
Extended information that varies by role (learner vs staff).

**Use for**: Emergency contacts (learners), credentials (staff), office hours (staff)

**Endpoint**: `GET /api/v2/users/me/person/extended`

### Layer 3: IDemographics (Compliance)
Demographics information for IPEDS, Title IX, ADA compliance.

**Use for**: Race/ethnicity, citizenship, veteran status, disability, socioeconomic data

**Endpoint**: `GET /api/v2/users/me/demographics`

---

## When to Use What

### When to Use IPerson

Use `IPerson` for:
- ✅ Displaying user names (legal or preferred)
- ✅ Showing avatars
- ✅ Displaying contact information (email, phone, address)
- ✅ User profile displays
- ✅ Name/avatar in headers, sidebars, cards
- ✅ Communication preferences
- ✅ Legal consent tracking

**Example**:
```typescript
import { useCurrentUser } from '@/features/auth/hooks';

function Header() {
  const { displayName, person, primaryEmail } = useCurrentUser();

  return (
    <div>
      <UserAvatar person={person} displayName={displayName} />
      <span>{displayName}</span>
      <span>{primaryEmail}</span>
    </div>
  );
}
```

---

### When to Use IPersonExtended

Use `IPersonExtended` for:
- ✅ Emergency contact management (learners)
- ✅ Parent/guardian information (learners)
- ✅ Housing and vehicle information (learners)
- ✅ Accommodation tracking (learners)
- ✅ Professional credentials (staff)
- ✅ Publications and research (staff)
- ✅ Office hours (staff)

**Example**:
```typescript
import { useQuery } from '@tanstack/react-query';
import { getMyPersonExtended } from '@/shared/api/personApi';

function EmergencyContactsPage() {
  const { data } = useQuery({
    queryKey: ['person-extended'],
    queryFn: getMyPersonExtended,
  });

  if (data?.role === 'learner') {
    return <EmergencyContactList contacts={data.learner.emergencyContacts} />;
  }

  return null;
}
```

---

### When to Use IDemographics

Use `IDemographics` for:
- ✅ Demographics collection forms
- ✅ IPEDS reporting
- ✅ Title IX compliance
- ✅ ADA accommodation requests
- ✅ Diversity reporting
- ✅ First-generation student identification

**IMPORTANT**: Always respect consent and make fields optional!

**Example**:
```typescript
import { useQuery } from '@tanstack/react-query';
import { getMyDemographics } from '@/shared/api/demographicsApi';

function DemographicsForm() {
  const { data } = useQuery({
    queryKey: ['demographics'],
    queryFn: getMyDemographics,
  });

  return (
    <form>
      <Alert>
        <Info />
        <AlertDescription>
          This information is optional and will only be used for compliance reporting.
          Your responses are confidential.
        </AlertDescription>
      </Alert>
      {/* Demographics fields */}
    </form>
  );
}
```

---

## Helper Functions

### Core Functions

Located in: `@/shared/lib/person-helpers`

#### `getDisplayName(person: IPerson): string`

Returns formatted display name, prioritizing preferred names.

```typescript
import { getDisplayName } from '@/shared/lib/person-helpers';

const name = getDisplayName(person);
// "Janey Smith" (if preferredFirstName is "Janey")
// "Jane Smith" (if no preferred name set)
```

**When to use**: Anywhere you display a user's name.

---

#### `getFullLegalName(person: IPerson): string`

Returns complete legal name with all parts (including middle name, suffix).

```typescript
import { getFullLegalName } from '@/shared/lib/person-helpers';

const legalName = getFullLegalName(person);
// "Jane Marie Smith Jr."
```

**When to use**: Official documents, transcripts, certificates.

---

#### `getPrimaryEmail(person: IPerson): IEmail | undefined`

Finds the primary email or returns first email if no primary is marked.

```typescript
import { getPrimaryEmail } from '@/shared/lib/person-helpers';

const emailObj = getPrimaryEmail(person);
const email = emailObj?.email; // "jane@example.com"
const isVerified = emailObj?.verified;
```

**When to use**: Displaying or using the primary email address.

---

#### `getPrimaryPhone(person: IPerson): IPhone | undefined`

Finds the primary phone or returns first phone if no primary is marked.

```typescript
import { getPrimaryPhone } from '@/shared/lib/person-helpers';

const phoneObj = getPrimaryPhone(person);
const phone = phoneObj?.number; // "+1-555-123-4567"
const canSMS = phoneObj?.allowSMS;
```

**When to use**: Displaying or using the primary phone number.

---

#### `getPrimaryAddress(person: IPerson): IAddress | undefined`

Finds the primary address or returns first address if no primary is marked.

```typescript
import { getPrimaryAddress } from '@/shared/lib/person-helpers';

const addressObj = getPrimaryAddress(person);
const street = addressObj?.street1;
const city = addressObj?.city;
```

**When to use**: Displaying or using the primary address.

---

#### `formatPhoneNumber(phone: IPhone): string`

Formats phone numbers (US and international).

```typescript
import { formatPhoneNumber } from '@/shared/lib/person-helpers';

// US numbers
const formatted = formatPhoneNumber({ number: '+1-555-123-4567', ... });
// "(555) 123-4567"

// International numbers
const formatted = formatPhoneNumber({ number: '+44-20-1234-5678', ... });
// "+44 20 1234 5678"
```

**When to use**: Displaying phone numbers to users.

---

## Components

### UserAvatar

Displays user avatar with fallback to initials.

**Location**: `@/entities/user/ui/UserAvatar`

**Props**:
```typescript
interface UserAvatarProps {
  // V2.0: Person data (preferred)
  person?: IPerson;
  displayName?: string;

  // V1.0: Deprecated but still supported
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;

  size?: 'sm' | 'md' | 'lg' | 'xl';
}
```

**Example**:
```typescript
import { UserAvatar } from '@/entities/user/ui/UserAvatar';
import { getDisplayName } from '@/shared/lib/person-helpers';

function UserProfile({ person }) {
  return (
    <UserAvatar
      person={person}
      displayName={getDisplayName(person)}
      size="lg"
    />
  );
}
```

---

### UserCard

Displays user information card.

**Location**: `@/shared/ui/UserCard`

**Props**:
```typescript
interface UserCardProps {
  person?: IPerson;
  displayName?: string;
  email?: string;
  phone?: string;
  pronouns?: string;
  bio?: string;
  avatarSize?: 'sm' | 'md' | 'lg' | 'xl';
  layout?: 'vertical' | 'horizontal';
  onClick?: () => void;
}
```

**Example**:
```typescript
import { UserCard } from '@/shared/ui/UserCard';

function StaffDirectory({ staffMembers }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {staffMembers.map(staff => (
        <UserCard
          key={staff.id}
          person={staff.person}
          layout="vertical"
          onClick={() => navigate(`/staff/${staff.id}`)}
        />
      ))}
    </div>
  );
}
```

---

### PasswordField

Password input with strength indicator.

**Location**: `@/features/auth/ui/PasswordField`

**Props**:
```typescript
interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  showStrength?: boolean;
  showRequirements?: boolean;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
}
```

**Example**:
```typescript
import { PasswordField } from '@/features/auth/ui/PasswordField';

function ChangePasswordForm() {
  const [password, setPassword] = useState('');

  return (
    <PasswordField
      id="newPassword"
      label="New Password"
      value={password}
      onChange={setPassword}
      showStrength={true}
      showRequirements={true}
    />
  );
}
```

---

## Hooks

### useCurrentUser

Get current user with computed values.

**Location**: `@/features/auth/hooks`

**Returns**:
```typescript
interface CurrentUserData {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  person: IPerson | null;
  displayName: string;
  primaryEmail: string | null;
  primaryPhone: string | null;
}
```

**Example**:
```typescript
import { useCurrentUser } from '@/features/auth/hooks';

function UserProfile() {
  const {
    displayName,
    primaryEmail,
    primaryPhone,
    person,
    isAuthenticated
  } = useCurrentUser();

  if (!isAuthenticated) {
    return <LoginPrompt />;
  }

  return (
    <div>
      <h1>{displayName}</h1>
      {person?.pronouns && <span>({person.pronouns})</span>}
      <p>{primaryEmail}</p>
      <p>{primaryPhone}</p>
    </div>
  );
}
```

---

### useDisplayName

Get formatted display name only.

**Location**: `@/features/auth/hooks`

**Returns**: `string`

**Example**:
```typescript
import { useDisplayName } from '@/features/auth/hooks';

function Header() {
  const displayName = useDisplayName();

  return <h1>Welcome, {displayName}!</h1>;
}
```

---

### usePersonData

Get person data from auth store.

**Location**: `@/features/auth/hooks`

**Returns**: `IPerson | null`

**Example**:
```typescript
import { usePersonData } from '@/features/auth/hooks';

function ProfileSettings() {
  const person = usePersonData();

  if (!person) {
    return <LoadingSpinner />;
  }

  return <ProfileForm initialData={person} />;
}
```

---

### useAutoSave

Auto-save hook with debounce.

**Location**: `@/features/profile/hooks`

**Props**:
```typescript
interface UseAutoSaveOptions<T> {
  data: T;
  onSave: (data: T) => Promise<void>;
  debounceMs?: number; // Default: 120000 (2 minutes)
  enabled?: boolean;
}

interface UseAutoSaveReturn {
  status: 'idle' | 'saving' | 'saved' | 'error';
  error: Error | null;
  save: () => Promise<void>;
  reset: () => void;
}
```

**Example**:
```typescript
import { useAutoSave } from '@/features/profile/hooks';
import { updateMyPerson } from '@/shared/api/personApi';

function ProfileForm() {
  const [data, setData] = useState(initialData);

  const { status, error, save } = useAutoSave({
    data,
    onSave: updateMyPerson,
    debounceMs: 120000, // 2 minutes
  });

  return (
    <form>
      <Input value={data.firstName} onChange={...} />
      {status === 'saving' && <Badge>Saving...</Badge>}
      {status === 'saved' && <Badge>Saved</Badge>}
      {error && <Alert>{error.message}</Alert>}
    </form>
  );
}
```

---

## API Integration

### personApi

**Location**: `@/shared/api/personApi`

**Functions**:
```typescript
// Get basic person data
await personApi.getMyPerson();

// Update basic person data (partial)
await personApi.updateMyPerson({
  preferredFirstName: 'Janey',
  pronouns: 'they/them',
});

// Get extended person data
await personApi.getMyPersonExtended();

// Update extended person data
await personApi.updateMyPersonExtended({
  // learner or staff specific fields
});
```

---

### demographicsApi

**Location**: `@/shared/api/demographicsApi`

**Functions**:
```typescript
// Get demographics data
await demographicsApi.getMyDemographics();

// Update demographics data
await demographicsApi.updateMyDemographics({
  allowReporting: true,
  isHispanicLatino: false,
  race: ['asian'],
});
```

---

### passwordApi

**Location**: `@/features/auth/api/passwordApi`

**Functions**:
```typescript
// Change user password
await passwordApi.changeUserPassword({
  currentPassword: 'old123',
  newPassword: 'New123!@#',
});

// Change admin password
await passwordApi.changeAdminPassword({
  currentPassword: 'old123',
  newPassword: 'New123!@#',
});

// Validate password strength
const validation = passwordApi.validatePasswordStrength('MyPass123!');
console.log(validation.isValid); // true/false
console.log(validation.strength); // 'weak' | 'fair' | 'good' | 'strong'
console.log(validation.requirements); // { minLength: true, hasUppercase: true, ... }
```

---

## Best Practices

### 1. Always Use Helper Functions

❌ **DON'T**:
```typescript
const name = `${person.firstName} ${person.lastName}`;
const email = person.emails[0]?.email;
```

✅ **DO**:
```typescript
import { getDisplayName, getPrimaryEmail } from '@/shared/lib/person-helpers';

const name = getDisplayName(person);
const email = getPrimaryEmail(person)?.email;
```

---

### 2. Always Check for Null

❌ **DON'T**:
```typescript
const phone = person.phones[0].number;
```

✅ **DO**:
```typescript
import { getPrimaryPhone } from '@/shared/lib/person-helpers';

const phoneObj = getPrimaryPhone(person);
const phone = phoneObj?.number;
```

---

### 3. Support Preferred Names

❌ **DON'T**:
```typescript
<h1>{person.firstName} {person.lastName}</h1>
```

✅ **DO**:
```typescript
import { getDisplayName } from '@/shared/lib/person-helpers';

<h1>{getDisplayName(person)}</h1>
```

---

### 4. Display Pronouns (Optional)

✅ **DO**:
```typescript
<div>
  <span>{displayName}</span>
  {person?.pronouns && (
    <span className="text-sm italic text-gray-600">
      ({person.pronouns})
    </span>
  )}
</div>
```

---

### 5. Use Components, Not Raw HTML

❌ **DON'T**:
```typescript
<img src={person.avatar} alt={getDisplayName(person)} />
```

✅ **DO**:
```typescript
import { UserAvatar } from '@/entities/user/ui/UserAvatar';

<UserAvatar person={person} displayName={getDisplayName(person)} size="md" />
```

---

### 6. Respect Consent for Demographics

✅ **DO**:
```typescript
<form>
  <Alert>
    <AlertDescription>
      This information is optional and will only be used for compliance reporting.
      Your privacy is protected.
    </AlertDescription>
  </Alert>

  <Switch
    checked={allowReporting}
    onCheckedChange={setAllowReporting}
    label="I consent to my data being used for reporting"
  />

  {allowReporting && (
    <div>
      {/* Demographics fields */}
    </div>
  )}
</form>
```

---

## Common Patterns

### Pattern: User Profile Display

```typescript
import { useCurrentUser } from '@/features/auth/hooks';
import { UserAvatar } from '@/entities/user/ui/UserAvatar';

function UserProfileHeader() {
  const { displayName, primaryEmail, primaryPhone, person } = useCurrentUser();

  return (
    <div className="flex items-center gap-4">
      <UserAvatar person={person} displayName={displayName} size="lg" />
      <div>
        <h2 className="text-xl font-bold">{displayName}</h2>
        {person?.pronouns && (
          <span className="text-sm italic text-gray-600">
            ({person.pronouns})
          </span>
        )}
        <p className="text-sm text-gray-600">{primaryEmail}</p>
        <p className="text-sm text-gray-600">{primaryPhone}</p>
      </div>
    </div>
  );
}
```

---

### Pattern: Staff Directory

```typescript
import { UserCard } from '@/shared/ui/UserCard';
import { getDisplayName, getPrimaryEmail, getPrimaryPhone } from '@/shared/lib/person-helpers';

function StaffDirectory({ staffList }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {staffList.map(staff => (
        <UserCard
          key={staff._id}
          person={staff.person}
          displayName={getDisplayName(staff.person)}
          email={getPrimaryEmail(staff.person)?.email}
          phone={getPrimaryPhone(staff.person)?.number}
          layout="vertical"
          onClick={() => navigate(`/staff/${staff._id}`)}
        />
      ))}
    </div>
  );
}
```

---

### Pattern: Profile Edit Form with Auto-Save

```typescript
import { useState } from 'react';
import { useAutoSave } from '@/features/profile/hooks';
import { updateMyPerson } from '@/shared/api/personApi';
import { PasswordField } from '@/features/auth/ui/PasswordField';

function BasicInfoForm({ initialData }) {
  const [data, setData] = useState(initialData);

  const { status } = useAutoSave({
    data,
    onSave: updateMyPerson,
  });

  return (
    <form className="space-y-4">
      <div className="flex justify-end">
        {status === 'saving' && <Badge variant="secondary">Saving...</Badge>}
        {status === 'saved' && <Badge variant="success">Saved</Badge>}
      </div>

      <Input
        label="First Name"
        value={data.firstName}
        onChange={(e) => setData({ ...data, firstName: e.target.value })}
      />

      <Input
        label="Preferred First Name (optional)"
        value={data.preferredFirstName || ''}
        onChange={(e) => setData({ ...data, preferredFirstName: e.target.value })}
      />

      {/* More fields */}
    </form>
  );
}
```

---

## Resources

- **Migration Guide**: `docs/PERSON_DATA_MIGRATION.md`
- **Type Definitions**: `src/shared/types/person.ts`
- **Helper Functions**: `src/shared/lib/person-helpers.ts`
- **API Documentation**: `src/shared/api/personApi.ts`
- **Test Fixtures**: `src/test/fixtures/person.fixtures.ts`
- **Phase Reports**: `PHASE4_COMPLETION_REPORT.md`, `PHASE_5_COMPLETION_REPORT.md`

---

**Version**: 2.0.0
**Last Updated**: 2026-01-13
**Maintainer**: UI Development Team
