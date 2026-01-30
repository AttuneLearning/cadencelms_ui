# Person Change Implementation Plan - UI Team

**Date:** 2026-01-12
**Priority:** HIGH
**Type:** Breaking Changes - Migration Required
**Scope:** All UI components using person data
**Timeline:** Start immediately, complete before API v2.0 deployment

---

## Executive Summary

The API team has implemented **BREAKING CHANGES** to the person data architecture. The flat structure (`firstName`, `lastName`, `phone`, `profileImage`) has been replaced with a **three-layer person architecture**:

1. **IPerson (Basic)** - Core contact & identity - `GET /users/me/person`
2. **IPersonExtended** - Role-specific data - `GET /users/me/person/extended`
3. **IDemographics** - Compliance data - `GET /users/me/demographics`

**Action Required:** Update all UI components and API calls that reference person data.

---

## Changed API Contracts

### Contract Files Modified

| File | Status | Last Modified |
|------|--------|---------------|
| `contracts/api/users.contract.ts` | ✅ Updated (v2.0.0) | 2026-01-12 17:41 |
| `contracts/api/person.contract.ts` | ✅ NEW | 2026-01-12 17:38 |
| `contracts/api/demographics.contract.ts` | ✅ NEW | 2026-01-12 17:40 |

### New API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v2/users/me/person` | GET | Get basic person data (IPerson) |
| `/api/v2/users/me/person` | PUT | Update basic person data |
| `/api/v2/users/me/person/extended` | GET | Get extended person data (role-specific) |
| `/api/v2/users/me/person/extended` | PUT | Update extended person data |
| `/api/v2/users/me/demographics` | GET | Get demographics data (compliance) |
| `/api/v2/users/me/demographics` | PUT | Update demographics data |

---

## Breaking Changes Summary

### Data Structure Migration

**Before (v1.0.0):**
```typescript
GET /api/v2/users/me
{
  "data": {
    "id": "...",
    "email": "...",
    "firstName": "John",           // ❌ REMOVED
    "lastName": "Doe",              // ❌ REMOVED
    "phone": "+1-555-0123",         // ❌ REMOVED
    "profileImage": "https://...",  // ❌ REMOVED
    "role": "staff"
  }
}
```

**After (v2.0.0):**
```typescript
GET /api/v2/users/me
{
  "data": {
    "id": "...",
    "email": "...",
    "role": "staff",
    "person": {                     // ✅ NEW: Nested object
      "firstName": "John",
      "lastName": "Doe",
      "middleName": null,
      "preferredFirstName": null,   // ✅ NEW
      "preferredLastName": null,    // ✅ NEW
      "pronouns": "he/him",          // ✅ NEW
      "emails": [{                   // ✅ NEW: Array
        "email": "...",
        "type": "institutional",
        "isPrimary": true,
        "verified": true
      }],
      "phones": [{                   // ✅ NEW: Array
        "number": "+1-555-0123",
        "type": "mobile",
        "isPrimary": true
      }],
      "addresses": [],               // ✅ NEW: Array
      "avatar": "https://...",       // ✅ Renamed
      "bio": "...",
      "timezone": "America/New_York",
      "languagePreference": "en"
    }
  }
}
```

### Field Migration Table

| Old Field (v1.0) | New Field (v2.0) | Type Change | Migration Action |
|------------------|------------------|-------------|------------------|
| `data.firstName` | `data.person.firstName` | No | Update path |
| `data.lastName` | `data.person.lastName` | No | Update path |
| `data.phone` | `data.person.phones[0].number` | **String → Array** | Update path + array access |
| `data.profileImage` | `data.person.avatar` | No | Update path + rename |
| N/A | `data.person.preferredFirstName` | NEW | Add support |
| N/A | `data.person.preferredLastName` | NEW | Add support |
| N/A | `data.person.pronouns` | NEW | Add support |
| N/A | `data.person.emails[]` | NEW | Add support |
| N/A | `data.person.addresses[]` | NEW | Add support |
| N/A | `data.person.timezone` | NEW | Add support |
| N/A | `data.person.languagePreference` | NEW | Add support |

---

## Implementation Phases

### Phase 1: Foundation & Setup ⏳ PRIORITY 1

**Goal:** Create TypeScript types, helper functions, and API service layer

#### Tasks

1. **Create Type Definitions**
   - [ ] Create `src/shared/types/person.ts` with IPerson, IPersonExtended, IDemographics interfaces
   - [ ] Update `src/shared/types/user.ts` to include `person: IPerson` field
   - [ ] Add enum types (RaceCategory, CitizenshipStatus, VeteranStatus, etc.)

2. **Create Helper Functions**
   - [ ] Create `src/shared/lib/person-helpers.ts` with utility functions:
     - `getPrimaryEmail(person: IPerson): IEmail | undefined`
     - `getPrimaryPhone(person: IPerson): IPhone | undefined`
     - `getPrimaryAddress(person: IPerson): IAddress | undefined`
     - `getDisplayName(person: IPerson): string` (handles preferred names)
     - `getFullLegalName(person: IPerson): string`
     - `formatPhoneNumber(phone: IPhone): string`

3. **Create API Service Layer**
   - [ ] Update `src/shared/api/userApi.ts` to handle new `/users/me` structure
   - [ ] Create `src/shared/api/personApi.ts` with:
     - `getMyPerson()` - GET /users/me/person
     - `updateMyPerson(data)` - PUT /users/me/person
     - `getMyPersonExtended()` - GET /users/me/person/extended
     - `updateMyPersonExtended(data)` - PUT /users/me/person/extended
   - [ ] Create `src/shared/api/demographicsApi.ts` with:
     - `getMyDemographics()` - GET /users/me/demographics
     - `updateMyDemographics(data)` - PUT /users/me/demographics

4. **Create Test Fixtures**
   - [ ] Update `src/test/mocks/server.ts` to include new person endpoints
   - [ ] Create `src/test/fixtures/person.fixtures.ts` with mock data
   - [ ] Update `src/test/fixtures/user.fixtures.ts` to include person object

**Files to Create:**
- `src/shared/types/person.ts`
- `src/shared/lib/person-helpers.ts`
- `src/shared/api/personApi.ts`
- `src/shared/api/demographicsApi.ts`
- `src/test/fixtures/person.fixtures.ts`

**Files to Update:**
- `src/shared/types/user.ts`
- `src/shared/api/userApi.ts`
- `src/test/mocks/server.ts`
- `src/test/fixtures/user.fixtures.ts`

**Acceptance Criteria:**
- [ ] All TypeScript types match API contracts exactly
- [ ] Helper functions handle null/undefined cases gracefully
- [ ] API service layer returns properly typed responses
- [ ] Test mocks return data matching new structure
- [ ] No TypeScript compilation errors

---

### Phase 2: Auth Store & Context Updates ⏳ PRIORITY 1

**Goal:** Update authentication state management to use new person structure

#### Tasks

1. **Update Auth Store**
   - [ ] Update `src/features/auth/model/authStore.ts`:
     - Change `user.firstName` to `user.person.firstName` throughout
     - Change `user.lastName` to `user.person.lastName` throughout
     - Change `user.phone` to `user.person.phones[]` array
     - Change `user.profileImage` to `user.person.avatar`
   - [ ] Update store selectors to use helper functions:
     - `getDisplayName(user.person)` for name display
     - `getPrimaryEmail(user.person)` for email access
     - `getPrimaryPhone(user.person)` for phone access

2. **Update Auth API Integration**
   - [ ] Update `src/features/auth/api/authApi.ts`:
     - Login response now includes `person` object
     - Token refresh response includes updated `person` data
   - [ ] Update response transformers to map legacy fields if API supports backward compat

3. **Update Auth Hooks**
   - [ ] Update `src/features/auth/hooks/useCurrentUser.ts`:
     - Return `person` object instead of flat fields
     - Add computed fields: `displayName`, `primaryEmail`, `primaryPhone`
   - [ ] Create new hooks:
     - `usePersonData()` - Hook to access person data from auth store
     - `useDisplayName()` - Hook to get formatted display name

**Files to Update:**
- `src/features/auth/model/authStore.ts`
- `src/features/auth/api/authApi.ts`
- `src/features/auth/hooks/useCurrentUser.ts`

**Files to Create:**
- `src/features/auth/hooks/usePersonData.ts`
- `src/features/auth/hooks/useDisplayName.ts`

**Acceptance Criteria:**
- [ ] Auth store correctly stores person object
- [ ] Login flow successfully maps new person structure
- [ ] All auth hooks return correct data
- [ ] No TypeScript errors in auth module
- [ ] Existing tests updated and passing

---

### Phase 3: Core UI Components ⏳ PRIORITY 1

**Goal:** Update foundational UI components that display user information

#### Tasks

1. **Update Header Component**
   - [ ] Update `src/widgets/header/Header.tsx`:
     - Change user name display to use `getDisplayName(user.person)`
     - Change avatar source to use `user.person.avatar`
     - Add pronouns display (optional)

2. **Update Sidebar Component**
   - [ ] Update `src/widgets/sidebar/Sidebar.tsx`:
     - Change user info display to use person object
     - Update any user name references

3. **Update User Menu**
   - [ ] Update `src/widgets/header/UserMenu.tsx`:
     - Change name display to use `getDisplayName()`
     - Change email display to use `getPrimaryEmail()`
     - Update avatar source

4. **Create/Update User Display Components**
   - [ ] Create `src/shared/ui/UserAvatar.tsx`:
     - Accepts `person.avatar` URL
     - Fallback to initials from name
   - [ ] Create `src/shared/ui/UserCard.tsx`:
     - Displays name (with preferred name support)
     - Displays pronouns if set
     - Displays primary contact info
     - Shows avatar

**Files to Update:**
- `src/widgets/header/Header.tsx`
- `src/widgets/sidebar/Sidebar.tsx`
- `src/widgets/header/UserMenu.tsx`

**Files to Create:**
- `src/shared/ui/UserAvatar.tsx`
- `src/shared/ui/UserCard.tsx`

**Acceptance Criteria:**
- [ ] Header displays user name correctly
- [ ] Sidebar shows correct user information
- [ ] User menu shows correct contact info
- [ ] Avatar displays from correct path
- [ ] Preferred names display when set
- [ ] No console errors
- [ ] All component tests passing

---

### Phase 4: Profile Pages (ISS-001 Unblocked!) 🎯 PRIORITY 2

**Goal:** Implement profile management pages using new person endpoints

#### Tasks

1. **Create Basic Profile Page**
   - [ ] Create `src/pages/profile/ProfilePage.tsx`:
     - Route: `/profile` (dashboard-agnostic)
     - Fetches `GET /users/me/person`
     - Displays all IPerson fields
     - Edit button for each section
   - [ ] Create tabs/sections:
     - **Basic Info:** Name, pronouns, avatar, bio
     - **Contact:** Emails, phones, addresses
     - **Preferences:** Timezone, language, notifications
     - **Consent:** Legal consent tracking

2. **Create Profile Edit Components**
   - [ ] Create `src/features/profile/ui/BasicInfoForm.tsx`:
     - Edit firstName, lastName, middleName, suffix
     - Edit preferredFirstName, preferredLastName
     - Edit pronouns
     - Edit avatar URL (or upload)
     - Edit bio
   - [ ] Create `src/features/profile/ui/ContactInfoForm.tsx`:
     - Manage emails array (add/edit/remove)
     - Manage phones array (add/edit/remove)
     - Manage addresses array (add/edit/remove)
     - Mark primary contact for each type
   - [ ] Create `src/features/profile/ui/PreferencesForm.tsx`:
     - Set timezone (dropdown)
     - Set language preference (dropdown)
     - Set communication preferences
     - Set notification frequency
     - Set quiet hours
   - [ ] Create `src/features/profile/ui/ConsentForm.tsx`:
     - Display current consent status with dates
     - Toggle consent options
     - Show consent history

3. **Create Extended Profile Pages**
   - [ ] Create `src/pages/profile/ExtendedProfilePage.tsx`:
     - Route: `/profile/extended`
     - Fetches `GET /users/me/person/extended`
     - Conditional rendering based on role (staff vs learner)
   - [ ] For Learners:
     - [ ] Create `src/features/profile/ui/EmergencyContactsForm.tsx`
     - [ ] Create `src/features/profile/ui/HousingInfoForm.tsx`
     - [ ] Create `src/features/profile/ui/AccommodationsForm.tsx`
   - [ ] For Staff:
     - [ ] Create `src/features/profile/ui/ProfessionalInfoForm.tsx`
     - [ ] Create `src/features/profile/ui/CredentialsForm.tsx`
     - [ ] Create `src/features/profile/ui/OfficeHoursForm.tsx`

4. **Create Demographics Page**
   - [ ] Create `src/pages/profile/DemographicsPage.tsx`:
     - Route: `/profile/demographics`
     - Fetches `GET /users/me/demographics`
     - **CRITICAL:** Clear consent explanations
     - **CRITICAL:** Explicit consent checkboxes
     - **CRITICAL:** All fields optional
     - "Prefer not to say" options
   - [ ] Create `src/features/profile/ui/DemographicsForm.tsx`:
     - Gender & identity section
     - Race & ethnicity section (IPEDS-compliant)
     - Citizenship & immigration section
     - Veteran & military section
     - First-generation section
     - Disability & accommodations section
     - Language section
     - Socioeconomic section
     - Consent section (required, prominent)

**Files to Create:**
- `src/pages/profile/ProfilePage.tsx`
- `src/pages/profile/ExtendedProfilePage.tsx`
- `src/pages/profile/DemographicsPage.tsx`
- `src/features/profile/ui/BasicInfoForm.tsx`
- `src/features/profile/ui/ContactInfoForm.tsx`
- `src/features/profile/ui/PreferencesForm.tsx`
- `src/features/profile/ui/ConsentForm.tsx`
- `src/features/profile/ui/EmergencyContactsForm.tsx`
- `src/features/profile/ui/HousingInfoForm.tsx`
- `src/features/profile/ui/AccommodationsForm.tsx`
- `src/features/profile/ui/ProfessionalInfoForm.tsx`
- `src/features/profile/ui/CredentialsForm.tsx`
- `src/features/profile/ui/OfficeHoursForm.tsx`
- `src/features/profile/ui/DemographicsForm.tsx`

**Routing Updates:**
- Add `/profile` route to app router
- Add `/profile/extended` route
- Add `/profile/demographics` route

**Acceptance Criteria:**
- [ ] Profile page displays all person data correctly
- [ ] Can edit basic info and save successfully
- [ ] Can manage multiple emails/phones/addresses
- [ ] Can set communication preferences
- [ ] Extended profile shows role-specific fields
- [ ] Demographics form has clear consent UI
- [ ] All fields validate correctly
- [ ] Auto-save works (2-minute debounce per ISS-001)
- [ ] Success/error messages display appropriately

---

### Phase 5: Profile-Related Features 🎯 PRIORITY 2

**Goal:** Update features that display or use profile data

#### Tasks

1. **Staff Directory**
   - [ ] Update `src/pages/staff/directory/StaffDirectoryPage.tsx`:
     - Display names using `getDisplayName()`
     - Display pronouns next to name
     - Display primary email/phone
     - Display professional title from extended profile
     - Display office location from extended profile
   - [ ] Update staff card component:
     - Show avatar from `person.avatar`
     - Show preferred name if set

2. **Student Records (Staff View)**
   - [ ] Update student list views to use `person` object
   - [ ] Display preferred names in student lists
   - [ ] Show emergency contact count indicator

3. **User Search & Filters**
   - [ ] Update search components to search both legal and preferred names
   - [ ] Update filters to handle new data structure

4. **Settings Pages**
   - [ ] Create `src/pages/settings/NotificationSettingsPage.tsx`:
     - Communication preferences from person data
     - Quiet hours settings
     - Notification frequency
   - [ ] Update existing settings to use person data

**Files to Update:**
- `src/pages/staff/directory/StaffDirectoryPage.tsx`
- `src/features/staff/ui/StaffCard.tsx` (if exists)
- `src/pages/staff/students/StudentListPage.tsx` (if exists)
- Search and filter components

**Files to Create:**
- `src/pages/settings/NotificationSettingsPage.tsx`

**Acceptance Criteria:**
- [ ] Staff directory shows correct information
- [ ] Student records display properly
- [ ] Search works with preferred names
- [ ] Settings pages functional
- [ ] No data inconsistencies

---

### Phase 6: Password Change Page (ISS-002) 🎯 PRIORITY 2

**Goal:** Implement password change functionality

#### Tasks

1. **Create Password Change Page**
   - [ ] Create `src/pages/settings/ChangePasswordPage.tsx`:
     - Route: `/settings/change-password`
     - Fields: Current password, new password, confirm password
     - Password strength indicator
     - Password requirements display
     - Context detection (user vs admin session)
   - [ ] Create `src/features/auth/ui/PasswordField.tsx`:
     - Password input with show/hide toggle
     - Strength indicator
     - Requirements checklist
   - [ ] Create API endpoint wrapper:
     - `POST /api/v2/users/me/password` for user password
     - `POST /api/v2/admin/me/password` for admin password

**Files to Create:**
- `src/pages/settings/ChangePasswordPage.tsx`
- `src/features/auth/ui/PasswordField.tsx`
- `src/features/auth/api/passwordApi.ts`

**Routing Updates:**
- Add `/settings/change-password` route

**Acceptance Criteria:**
- [ ] Password change form works
- [ ] Validates current password
- [ ] Validates new password strength
- [ ] Confirms password match
- [ ] Shows success/error messages
- [ ] Works for both user and admin sessions
- [ ] Session remains active after change

---

### Phase 7: Testing & Validation 🧪 PRIORITY 3

**Goal:** Ensure all changes work correctly

#### Tasks

1. **Unit Tests**
   - [ ] Test helper functions in `person-helpers.ts`
   - [ ] Test API service layer
   - [ ] Test auth store updates
   - [ ] Test form validation logic

2. **Component Tests**
   - [ ] Test updated Header component
   - [ ] Test updated Sidebar component
   - [ ] Test User Menu component
   - [ ] Test UserAvatar component
   - [ ] Test UserCard component
   - [ ] Test all profile forms

3. **Integration Tests**
   - [ ] Test profile page data flow (GET → display → PUT → update)
   - [ ] Test extended profile (role-specific rendering)
   - [ ] Test demographics form (consent flow)
   - [ ] Test password change flow

4. **E2E Tests**
   - [ ] Test complete profile edit workflow
   - [ ] Test emergency contact management (learners)
   - [ ] Test professional info management (staff)
   - [ ] Test demographics collection

5. **Migration Testing**
   - [ ] Test with mock v1.0 API responses (backward compat)
   - [ ] Test with v2.0 API responses
   - [ ] Test graceful degradation if person data missing

**Acceptance Criteria:**
- [ ] All unit tests passing
- [ ] All component tests passing
- [ ] All integration tests passing
- [ ] E2E tests covering critical paths
- [ ] No console errors/warnings
- [ ] TypeScript compilation clean

---

### Phase 8: Documentation & Training 📚 PRIORITY 3

**Goal:** Document changes and train team

#### Tasks

1. **Code Documentation**
   - [ ] Add JSDoc comments to all new helper functions
   - [ ] Document API service layer
   - [ ] Add inline comments for complex logic

2. **Migration Guide**
   - [ ] Create `docs/PERSON_DATA_MIGRATION.md`:
     - Field mapping table
     - Code examples (before/after)
     - Common migration patterns
     - Troubleshooting guide

3. **Developer Guide**
   - [ ] Update `docs/API_INTEGRATION.md` with new endpoints
   - [ ] Create `docs/PERSON_DATA_USAGE.md`:
     - When to use IPerson vs IPersonExtended vs IDemographics
     - Helper function reference
     - Best practices

4. **User Guide**
   - [ ] Create help text for profile pages
   - [ ] Create tooltips for new fields (pronouns, preferred name, etc.)
   - [ ] Create FAQ for demographics collection

**Files to Create:**
- `docs/PERSON_DATA_MIGRATION.md`
- `docs/PERSON_DATA_USAGE.md`

**Files to Update:**
- `docs/API_INTEGRATION.md`

**Acceptance Criteria:**
- [ ] Migration guide is clear and complete
- [ ] Developer guide covers all use cases
- [ ] Help text is user-friendly
- [ ] Team trained on new structure

---

## Rollout Strategy

### Development Phase
1. Create feature branch: `feat/person-data-v2`
2. Implement Phases 1-3 (foundation)
3. Test thoroughly
4. Merge to development branch

### Staging Phase
1. Deploy to staging environment
2. Run full test suite
3. Manual testing of all profile flows
4. Performance testing
5. Accessibility audit

### Production Phase
1. Coordinate with API team for deployment timing
2. Deploy UI changes
3. Monitor error logs
4. Monitor user feedback
5. Hot-fix any critical issues

---

## Risk Assessment

### High Risk Areas

1. **Auth Store Migration**
   - **Risk:** Breaking existing authentication flow
   - **Mitigation:** Comprehensive testing, backward compatibility layer

2. **Data Structure Mismatch**
   - **Risk:** Type errors if API response doesn't match contracts
   - **Mitigation:** Runtime validation, graceful error handling

3. **Array Access Errors**
   - **Risk:** Accessing phones[0] when array is empty
   - **Mitigation:** Use helper functions with null checks

### Medium Risk Areas

1. **Performance Impact**
   - **Risk:** Larger payload sizes with nested objects
   - **Mitigation:** Monitor bundle size, consider lazy loading

2. **User Experience**
   - **Risk:** Confusion with new profile structure
   - **Mitigation:** Clear UI, help text, tooltips

### Low Risk Areas

1. **Styling Changes**
   - **Risk:** Layout breaks with new components
   - **Mitigation:** Visual regression testing

---

## Success Criteria

### Technical Success
- [ ] All TypeScript compilation errors resolved
- [ ] All unit tests passing (target: 100% coverage for new code)
- [ ] All integration tests passing
- [ ] No console errors in development or production
- [ ] No runtime errors in error monitoring
- [ ] Performance metrics maintained or improved

### User Success
- [ ] Users can view their profile successfully
- [ ] Users can edit their profile successfully
- [ ] Preferred names display correctly throughout app
- [ ] Emergency contacts (learners) can be managed
- [ ] Professional info (staff) can be managed
- [ ] Demographics can be submitted with clear consent
- [ ] No user complaints about broken functionality

### Business Success
- [ ] IPEDS compliance data collection enabled
- [ ] Title IX compliance supported
- [ ] ADA compliance supported (accommodations tracking)
- [ ] FERPA compliance (consent tracking)
- [ ] Enhanced user personalization (preferred names, pronouns)

---

## Dependencies & Blockers

### External Dependencies
- ✅ API contracts complete (person.contract.ts, demographics.contract.ts, users.contract.ts)
- ⏳ API implementation in progress (Phase 2)
- ⏳ API testing & validation (Phase 3)
- ⏳ API deployment (Phase 4)

### Internal Blockers
- ISS-006 complete ✅ (test infrastructure)
- ISS-001 NOW UNBLOCKED ✅ (API contracts ready)
- ISS-002 dependent on ISS-001 (password change uses person data)
- ISS-004 (sidebar highlighting) independent - can proceed in parallel

### Coordination Requirements
- Weekly sync with API team on implementation progress
- Coordinate deployment timing
- Align on testing strategy
- Share test results and edge cases

---

## Team Assignments

### Phase 1 (Foundation)
**Assigned:** UI Agent
**Estimated Effort:** 2-3 days
**Key Deliverables:** Types, helpers, API layer, test mocks

### Phase 2 (Auth Store)
**Assigned:** UI Agent
**Estimated Effort:** 1-2 days
**Key Deliverables:** Updated auth store, hooks, tests

### Phase 3 (Core UI)
**Assigned:** UI Agent
**Estimated Effort:** 2-3 days
**Key Deliverables:** Header, sidebar, user menu, user avatar/card

### Phase 4 (Profile Pages)
**Assigned:** UI Agent
**Estimated Effort:** 5-7 days
**Key Deliverables:** Profile pages, forms, extended profiles, demographics

### Phase 5 (Related Features)
**Assigned:** UI Agent
**Estimated Effort:** 2-3 days
**Key Deliverables:** Staff directory, student records, settings

### Phase 6 (Password Change)
**Assigned:** UI Agent
**Estimated Effort:** 1-2 days
**Key Deliverables:** Password change page, API integration

### Phase 7 (Testing)
**Assigned:** UI Agent + QA
**Estimated Effort:** 3-4 days
**Key Deliverables:** Test suite, validation, bug fixes

### Phase 8 (Documentation)
**Assigned:** UI Agent
**Estimated Effort:** 1-2 days
**Key Deliverables:** Migration guide, developer docs, user help

---

## Questions for API Team

1. **Backward Compatibility:** Will the API support both v1.0 (flat) and v2.0 (nested) responses during transition period?
2. **Migration Timeline:** What is the exact deployment date for API v2.0?
3. **Avatar Upload:** Is the avatar upload endpoint (`POST /users/me/person/avatar`) implemented?
4. **Error Handling:** What error codes should we expect for validation failures?
5. **Rate Limiting:** Any rate limits on person data PUT requests?
6. **Partial Updates:** Confirm that partial updates work (only send changed fields)?
7. **Array Validation:** What happens if we send an empty emails/phones array?

---

## Next Steps

1. **Immediate:** Start Phase 1 (Foundation) - create types and helpers
2. **Week 1:** Complete Phases 1-2 (Foundation + Auth Store)
3. **Week 2:** Complete Phase 3 (Core UI Components)
4. **Week 3:** Start Phase 4 (Profile Pages - ISS-001)
5. **Week 4:** Complete Phases 4-6 (Profile + Features + Password Change)
6. **Week 5:** Phase 7 (Testing & Validation)
7. **Week 6:** Phase 8 (Documentation) + Final polish
8. **Week 7:** Staging deployment + testing
9. **Week 8:** Production deployment

---

## Resources

### API Contract References
- `contracts/api/users.contract.ts` (v2.0.0)
- `contracts/api/person.contract.ts` (NEW)
- `contracts/api/demographics.contract.ts` (NEW)

### API Team Messages
- `agent_coms/messages/2026-01-12_BREAKING_CHANGES_IPerson_v2.md` - Complete breaking changes guide
- `agent_coms/api/IPERSON_ARCHITECTURE_BASIC_EXTENDED_DEMOGRAPHICS.md` - Architecture documentation
- `agent_coms/api/IMPLEMENTATION_PLAN_IPERSON_REFACTOR.md` - API implementation plan

### Related Issues
- ISS-001: Profile Page Implementation (NOW UNBLOCKED!)
- ISS-002: Password Change Page (dependent on ISS-001)
- ISS-003: Cross-userType Links (COMPLETED)
- ISS-004: Sidebar Highlighting (independent, can proceed)
- ISS-005: Department Dropdown (COMPLETED)
- ISS-006: Test Infrastructure (COMPLETED)

---

## Conclusion

This is a **critical breaking change** that affects the entire application. The three-layer person architecture provides better data organization, compliance support, and extensibility, but requires careful migration work.

**Priority:** Start Phase 1 immediately. The API team has completed contracts and is implementing endpoints. UI team should begin foundation work now to be ready when API deployment occurs.

**Communication:** Maintain close coordination with API team throughout implementation. Weekly syncs recommended.

**Success depends on:** Thorough testing, clear documentation, and systematic migration of all person data references.

---

**Document Status:** ✅ Complete
**Next Review:** After Phase 1 completion
**Owner:** UI Agent
**Last Updated:** 2026-01-12
