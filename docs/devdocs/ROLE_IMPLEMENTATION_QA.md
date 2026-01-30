# Role System Contract Alignment - Q&A Reference
**Date:** 2026-01-11
**Sprint:** Contract Alignment Implementation
**Status:** Active

---

## Implementation Questions & Answers

### 1. Parallel Execution Strategy
**Q:** Should agents for tracks A, B, E, F spawn all at once in a single message?

**A:** Yes, spawn all parallel agents at once where possible. Phase 1 (A, B) and Phase 3 (E, F) can run simultaneously on Days 1-2 since they're independent.

**Implementation:**
- Single message with 4 Task tool calls for A, B, E, F
- Agents start immediately without waiting
- Coordination via events/signals (see team_coordination.md)

---

### 2. Dependency Management
**Q:** How should Track B handle its dependency on Track A completing the API function?

**A:** Yes, create signals/events. When Track A completes the API function, it triggers an event. Track B waits for this event before proceeding with implementation that uses the API.

**Implementation:**
- Track A signals: `EVENT: dept-api-ready`
- Track B waits for signal, then proceeds
- All events documented in `devdocs/team_coordination.md`

---

### 3. Test Accounts
**Q:** Should agents test their changes with provided test accounts?

**A:** Manual testing is expected. Agents should focus on implementation and unit tests. Manual testing with provided accounts happens after phase completion.

**Test Accounts Available:**
- `staff@test.com` / `password123` (staff user)
- `admin@test.com` / `password123` / escalation: `Escalate123!` (global-admin)
- `learner@test.com` / `password123` (learner)
- `multi@test.com` / `password123` (learner + staff)

---

### 4. Contract Files Location
**Q:** Are contract files in `/home/adam/github/lms_ui/1_lms_ui_v2/api_contracts/`?

**A:** Yes, that is the location. Verify files exist before starting agent work.

**Required Contract Files:**
- `api_contracts/UI_ROLE_SYSTEM_CONTRACTS.md`
- `api_contracts/api/auth-v2.contract.ts`
- `api_contracts/api/lookup-values.contract.ts`

---

### 5. Current Status Verification
**Q:** Should we verify current implementation status before starting?

**A:** You can verify, but also trust the contract documents. If there's any doubt, build to the contracts. Contracts are the source of truth.

**Approach:**
1. Quick scan of current files to understand structure
2. Trust the implementation plan task list
3. When in conflict, **build to contracts** not current implementation

---

### 6. Backward Compatibility
**Q:** Do we need to maintain backward compatibility with string-based userTypes?

**A:** No. Do not maintain backward compatibility. Nothing is in production. Feel free to make breaking changes. Keep code only current with the most current contracts.

**Implementation:**
- Delete old string-based handling
- Only support `UserTypeObject[]` format
- Remove fallback logic for old formats
- Clean, contract-aligned code only

---

### 7. Admin Token Storage Verification
**Q:** Should we verify adminToken is stored in memory only?

**A:** Yes, verify. It was working before these changes. Ensure no regression.

**Expected State:**
- `adminToken` stored in Zustand state only (memory)
- NOT in localStorage
- NOT in sessionStorage
- Cleared on tab close
- Cleared on logout

---

### 8. Department Switching Response Caching
**Q:** Should department cache be cleared on logout?

**A:** Please verify. If it's handled, leave it. If not, please implement.

**Check:**
- Does `authStore.logout()` clear navigationStore department state?
- If yes: Leave as-is
- If no: Add cleanup to logout flow

---

### 9. Branch Strategy
**Q:** Should each agent create its own branch, or should phases share branches?

**A:** Each agent has its own branch. Then integrate to main on completion of the phase where possible.

**Branch Naming:**
- Track A: `feature/contract-align/track-a/dept-api`
- Track B: `feature/contract-align/track-b/nav-store`
- Track C: `feature/contract-align/track-c/dept-context`
- Track D: `feature/contract-align/track-d/ui-context`
- Track E: `feature/contract-align/track-e/displayas-types`
- Track F: `feature/contract-align/track-f/displayas-store`
- Track G: `feature/contract-align/track-g/scoped-perms`

**Integration:**
- Phase 1 complete → Integration agent merges A + B → main
- Phase 2 complete → Integration agent merges C + D → main
- Phase 3 complete → Integration agent merges E + F → main
- Phase 4 complete → Integration agent merges G → main

---

### 10. Commit Strategy
**Q:** Should agents commit after completing tasks, or wait for phase sync points?

**A:** Each agent should commit when complete. Integration agent brings into main after the phase is complete.

**Workflow:**
1. Agent completes work on feature branch
2. Agent commits: `git commit -m "feat(contract-align): <track> - <description>"`
3. Agent pushes branch: `git push origin feature/contract-align/<track>/<desc>`
4. Agent signals completion
5. When phase complete, integration agent:
   - Reviews all track branches in phase
   - Merges to main (or develop)
   - Resolves any conflicts
   - Verifies integration

---

### 11. Error Handling During Dependencies
**Q:** If Track A encounters an error, what should Track B do?

**A:** Signal the Track A team to fix the error, and then wait and retry.

**Error Protocol:**
1. Track B detects Track A error (missing event, invalid output)
2. Track B signals: `ERROR: track-a-api-incomplete`
3. Track A receives signal, investigates and fixes
4. Track A signals: `EVENT: dept-api-ready` (retry)
5. Track B retries implementation
6. Continue until success

**Document all errors in team_coordination.md**

---

### 12. Testing Approach
**Q:** Should each agent write unit tests, or is manual testing sufficient?

**A:** Each agent should write unit tests. Tests should be hybrid (written when encountering errors OR at end of development). Ensure at least **85% code coverage**.

**Testing Requirements:**
- Unit tests for all new functions
- Unit tests for modified functions
- Test files: `*.test.ts` or `*.test.tsx`
- Coverage target: **≥85%**
- Test framework: Vitest (or existing test setup)

**Hybrid Approach:**
- **During development:** Write tests when fixing bugs/errors (TDD-style)
- **After development:** Write remaining tests for coverage
- **Before completion:** Verify 85% coverage achieved

**Coverage Check:**
```bash
npm run test:coverage
# Or
npx vitest --coverage
```

---

## Decision Log

| Decision | Category | Rationale |
|----------|----------|-----------|
| Spawn A, B, E, F in parallel | Parallelization | Maximize efficiency, independent tracks |
| Use events/signals for coordination | Dependencies | Clear handoff points between tracks |
| Manual testing after phases | Testing | Agents focus on implementation, QA tests integration |
| Verify contract files first | Risk mitigation | Ensure agents have correct references |
| Trust contracts over current code | Alignment | Contracts are source of truth |
| No backward compatibility | Simplicity | No production users, clean implementation |
| Verify adminToken storage | Quality | Ensure no regression on working feature |
| Each agent gets own branch | Isolation | Parallel work without conflicts |
| Agent commits on completion | Velocity | Fast feedback, clear progress |
| Signal errors, wait, retry | Reliability | Graceful handling of dependencies |
| 85% test coverage required | Quality | High confidence in changes |

---

## Reference Links

- **Team Config:** `.claude/team-config.json`
- **Implementation Plan:** `devdocs/plans/ROLE_SYSTEM_CHANGE_IMPLEMENTATION.md`
- **Coordination Doc:** `devdocs/team_coordination.md`
- **Contracts:** `api_contracts/UI_ROLE_SYSTEM_CONTRACTS.md`

---

**Document Version:** 1.0
**Last Updated:** 2026-01-11
**Status:** Active Reference
