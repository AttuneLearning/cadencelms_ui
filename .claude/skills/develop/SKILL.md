---
name: develop
description: Mandatory development lifecycle - processes issues with full verification
argument-hint: "[issue-id|all|quick <file>|team <issue-id>|team all]"
---

# Development Lifecycle Skill

Enforces the mandatory development lifecycle for all code changes per ADR-DEV-002.

**Code Review Gate:** Integrated with `.claude-workflow/team-configs/code-reviewer-config.json` for quality enforcement.

## Usage

```
/develop                    # Process next issue in queue
/develop UI-ISS-082         # Process specific issue
/develop all                # Process all issues in queue
/develop quick <file>       # Quick mode for trivial changes
/develop team UI-ISS-082    # Process issue with agent team (parallel)
/develop team all           # Process all issues with agent teams
```

## Team Detection (Portable)

Determine team from working directory path:
- Path contains `/cadencelms_ui/` → `team=ui`
- Path contains `/cadencelms_api/` → `team=api`

**Inbox pattern:** `dev_communication/messaging/*-to-{team}/`
- UI team reads: `*-to-ui/` (e.g., `api-to-ui/`)
- API team reads: `*-to-api/` (e.g., `ui-to-api/`)

---

## Lifecycle Overview

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        DEVELOPMENT LIFECYCLE                             │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Phase 0        Phase 1        Phase 1.5       Phase 2/2T                │
│  Poll &    ──►  Context   ──►  Team       ──►  Implement                 │
│  Unblock        Loading        Selection       (or Team Impl)            │
│                                (team mode)          │                    │
│                                                     │ ◄─ 2T Review       │
│                                                     ▼    (mid-dev)       │
│  Phase 5        Phase 4        Phase 3                                   │
│  Complete  ◄──  Document  ◄──  Verify                                    │
│       │              │              │                                    │
│       ▼              ▼              ▼                                    │
│  ┌─────────┐   ┌──────────┐   ┌─────────┐                               │
│  │  GATE   │   │   GATE   │   │  GATE   │                               │
│  │ Session │   │  Memory  │   │  Tests  │                               │
│  │  File   │   │  + Team  │   │  Pass   │                               │
│  └─────────┘   │  Review  │   └─────────┘                               │
│                └──────────┘                                              │
│  ════════════════════════════════════════════════════════════════════   │
│                       CODE REVIEWER GATES (BLOCKING)                     │
│  ════════════════════════════════════════════════════════════════════   │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Agent Team Mode (Optional)

When invoked with `team` keyword, `/develop` orchestrates parallel teammates for complex issues.
Requires `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` (configured in `.claude/settings.json`).

### Team Presets

Reference: `.claude-workflow/team-configs/agent-team-roles.json`

| Preset | Teammates | Best For |
|--------|-----------|----------|
| `solo` | None (single agent) | Simple bug fixes, typos, 1-2 file changes |
| `paired` | Implementer | Focused implementation, 2-4 files same layer |
| `standard` | Implementer + Tester | New code + new tests, 3+ files (default) |
| `research` | Researcher + Implementer + Tester | Unfamiliar codebase areas, architecture decisions |
| `parallel-impl` | Implementer x2 + Tester | Multi-component features, parallel-safe |

User can override: `/develop team:research UI-ISS-082`

### Team Structure

```
┌──────────────────────────────────────────────────────────────┐
│                    AGENT TEAM WORKFLOW                        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────┐                     │
│  │ LEAD (Opus 4.6 - Delegate Mode)    │                     │
│  │ Role: Coordinator + Code Reviewer   │                     │
│  │ Does: Phase 0, 1, 1.5, 3-gate, 4, 5│                     │
│  │ Does NOT: Write code or tests       │                     │
│  └────────────┬──────────┬─────────────┘                     │
│               │          │                                   │
│        spawn  │          │  spawn                            │
│               ▼          ▼                                   │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐ │
│  │ IMPLEMENTER    │  │ TESTER         │  │ RESEARCHER     │ │
│  │ (Sonnet 4.5)   │  │ (Sonnet 4.5)  │  │ (Sonnet 4.5)  │ │
│  │ Phase 2T: Code │  │ Phase 2T: Test │  │ Phase 1: Deep  │ │
│  │                │  │                │  │ investigation  │ │
│  └────────────────┘  └────────────────┘  └────────────────┘ │
│               │          │                                   │
│          ┌────┴──────────┴────┐                              │
│          │ 2T Review Checkpoint│ ◄─ Mid-dev team review      │
│          └────────────────────┘                              │
│               │          │                                   │
│               ▼          ▼                                   │
│  ┌─────────────────────────────────────┐                     │
│  │ HOOKS (Shell Scripts)               │                     │
│  │ TaskCompleted → gate checks         │                     │
│  │ TeammateIdle → verify clean state   │                     │
│  └─────────────────────────────────────┘                     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Phase 1.5: Team Selection (Team Mode Only)

Runs after Phase 1 (Context Loading), before Phase 2T. Determines which team preset to use.

**Steps:**

1. **Analyze issue scope**
   - Count files likely to be created/modified
   - Identify FSD layers involved (entity, feature, widget, page)
   - Check for cross-team dependencies in issue

2. **Check existing context**
   - Search `memory/patterns/` for matching patterns
   - Search `memory/sessions/` for similar past issues
   - Read past session `## Team Review` sections for lessons learned

3. **Select team preset**
   - Match issue characteristics against `teamPresets.selectWhen` criteria
   - Check past team reviews: did similar issues recommend a different preset?
   - Default to `standard` if no strong signal

4. **Log selection**
   ```
   ## Team Selection: {preset_name}
   - Issue: {issue-id}
   - Files estimated: {count}
   - Layers: {entity, feature, widget, page}
   - Similar past issue: {session-ref or "none"}
   - Past recommendation: {preset or "N/A"}
   - Rationale: {why this preset}
   ```

5. **User override check**
   - If user specified `/develop team:{preset}`, use that preset
   - Otherwise use the selected preset

### Phase 2T: Team Implementation

When agent teams are active, Phase 2 is replaced with parallel execution:

**Step 1: Lead creates task plan**
- Read role definitions from `.claude-workflow/team-configs/agent-team-roles.json`
- Select task dependency pattern (`newFeature`, `bugFix`, `complexFeature`)
- Create tasks with proper dependencies using the shared task list
- Assign file ownership per teammate (no overlapping files)

**Step 2: Lead spawns teammates per selected preset**
- Spawn only the teammates defined in the preset
- Use Sonnet 4.5 for all teammates
- Provide spawn prompts from role definitions (teammates don't inherit lead context)
- Enable delegate mode (`Shift+Tab`) to prevent lead from implementing

**Step 3: Teammates execute in parallel**
- Implementer works on source code (FSD patterns, types, hooks)
- Tester writes tests (may depend on implementer tasks completing)
- Researcher investigates codebase (if spawned, runs first with plan approval)
- `TaskCompleted` hook enforces gate on each task completion
- `TeammateIdle` hook prevents premature stopping

**Step 4: Mid-Development Review Checkpoint**

Triggers when ANY of these occur:
- 50% of team tasks are marked complete
- Any teammate blocked by hooks 2+ times consecutively
- Teammate sends message indicating scope change
- 30 minutes elapsed since team spawn

**Review actions:**
1. Assess progress - are tasks completing on track?
2. Check scope - has the issue grown beyond original plan?
3. Evaluate team - any teammate idle too long or repeatedly failing?
4. **Decide and act:**

| Situation | Action |
|-----------|--------|
| On track, no issues | Continue as-is |
| Need more implementation capacity | Spawn additional implementer (if < max) |
| Tester not needed yet, implementer struggling | Shut down tester, reassign tasks |
| Scope expanded, needs research | Spawn researcher teammate |
| Teammate failing repeatedly | Shut down, lead takes over their tasks |
| Scope shrank significantly | Shut down extra teammates |

5. Log review decision: `"Mid-dev review: {action taken} because {rationale}"`

**Step 5: Lead reviews and proceeds**
- Wait for all remaining teammates to complete
- Shut down all teammates
- Review implemented code against code-reviewer-config.json
- Resolve any file conflicts
- Proceed to Phase 3 (Verification) for full integration checks

### Task Dependency Patterns

Reference: `.claude-workflow/team-configs/agent-team-roles.json`

**New Feature:**
```
researcher (optional) → implementer → tester
```

**Bug Fix (TDD):**
```
tester (failing test) → implementer (fix) → tester (verify)
```

**Complex Feature:**
```
researcher → implementer-A (component A) ─┐
           → implementer-B (component B) ─┤→ tester (all tests)
```

### Fallback to Single-Agent

If agent team encounters issues:
- Teammate repeatedly blocked by hooks → Lead takes over that task directly
- File conflicts between teammates → Lead resolves and assigns to one teammate
- After 3 failed task completion attempts → Disable delegate mode, lead finishes

---

## Phase 0: Message Polling & Unblocking (AUTOMATIC)

**Run BEFORE processing any issue and BETWEEN issues when processing multiple.**

### Polling Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│                    POLLING LIFECYCLE                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  START: /develop invoked                                    │
│    │                                                        │
│    ▼                                                        │
│  ┌─────────────┐                                            │
│  │ Poll Inbox  │◄────────────────────────┐                  │
│  └──────┬──────┘                         │                  │
│         │                                │                  │
│         ▼                                │                  │
│  ┌─────────────┐    new message?    ┌────┴────┐            │
│  │Check Blocked│───────yes─────────►│ Process │            │
│  └──────┬──────┘                    │  Issue  │            │
│         │                           └────┬────┘            │
│         │ no new messages                │                  │
│         ▼                                │                  │
│  ┌─────────────┐                         │                  │
│  │  Timeout?   │                         │                  │
│  │ (20 min)    │                         │                  │
│  └──────┬──────┘                         │                  │
│         │                                │                  │
│    yes  │  no                            │                  │
│         │   └────────────────────────────┘                  │
│         ▼                                                   │
│  ┌─────────────┐                                            │
│  │    END      │◄─── Issue completed                        │
│  └─────────────┘                                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Termination Conditions

| Condition | Action |
|-----------|--------|
| Issue development completed | Stop polling, move to Phase 5 |
| 20 minutes no new messages | Stop polling, report timeout |
| All issues in batch completed | Stop polling, final summary |
| User interrupt | Stop polling, store session state |

### Step 0.1: Poll Inbox for New Messages

```
inbox_path = dev_communication/messaging/*-to-{team}/
timeout = 20 minutes of inactivity
```

**Steps:**
1. Record last activity timestamp
2. List all files in inbox directory
3. For each message file:
   - Read the message
   - Check if it's a RESPONSE type (has `In-Response-To:` field)
   - Check if it answers a pending question
   - If new message found: reset inactivity timer
4. Check inactivity timeout (20 minutes since last new message)

### Step 0.2: Check for Blocked Issues

```
blocked_issues = dev_communication/issues/{team}/active/
```

**Steps:**
1. List all files in active issues
2. For each issue, check for `Blocked-By:` or `Status: BLOCKED` fields
3. Build list of blocked issues and their blocking reasons

### Step 0.3: Match Responses to Blocked Issues

**For each new response message:**
1. Extract the `In-Response-To:` reference
2. Find matching blocked issue by:
   - Message thread reference
   - Issue ID mentioned in response
   - Subject/topic match
3. If match found:
   - Update issue status from BLOCKED to IN PROGRESS
   - Add response content to issue notes
   - Log: "Unblocked {issue_id} - received response: {subject}"
   - Reset inactivity timer

### Step 0.4: Report Polling Results

**Output format:**
```
## Message Poll Results

### Polling Status
- Last activity: {timestamp}
- Inactivity: {minutes} min (timeout at 20 min)

### New Messages ({count})
- [filename] - [subject] - [type: Request/Response]

### Unblocked Issues ({count})
- {issue_id} - unblocked by: {message_filename}

### Still Blocked ({count})
- {issue_id} - waiting for: {blocking_reason}
```

### Step 0.5: Check Termination

**Continue polling if:**
- Active issue still in progress AND
- Inactivity < 20 minutes AND
- Blocked issues exist waiting for responses

**Stop polling if:**
- Current issue completed → proceed to next issue or finish
- Inactivity >= 20 minutes → report timeout, proceed with available work
- No blocked issues remain → proceed with development

---

## Lifecycle Phases

**ALL PHASES ARE MANDATORY** (except where noted for quick mode)

---

### Phase 1: Context Loading

**Steps:**
1. Check `/comms` for relevant messages (already done in Phase 0)
   - Review any new messages from `*-to-{team}/` inbox
   - Note messages that affect current work

2. Load relevant context from `/memory`
   - Search `memory/patterns/` for related patterns
   - Search `memory/entities/` for related entities
   - Search `memory/context/` for domain knowledge

3. Identify applicable ADRs based on change type:
   | Change Type | Required ADRs |
   |-------------|---------------|
   | New API endpoint | ADR-API-001, ADR-DEV-001 |
   | New UI component | ADR-UI-001, ADR-DEV-001 |
   | New feature | ADR-DEV-001, domain-specific |
   | Bug fix | ADR-DEV-001 (regression test) |
   | Auth changes | ADR-AUTH-001, ADR-SEC-001 |

4. Read and understand issue requirements
   - Extract acceptance criteria
   - Identify test requirements per ADR-DEV-001

---

### Phase 2: Implementation

**Steps:**
1. Create implementation plan (if complex)
   - Break into subtasks
   - Identify files to modify

2. Write code following patterns and ADRs
   - Follow patterns from `/memory`
   - Follow conventions from applicable ADRs
   - Use existing abstractions

3. Update TypeScript types as needed

---

### Phase 3: Verification (MANDATORY - BLOCKING)

**CANNOT proceed to next phase without ALL checks passing**

#### Code Review Gate: Automated Checks

| Check | Command | Requirement | Blocking |
|-------|---------|-------------|----------|
| TypeScript | `npx tsc --noEmit` | 0 errors in new/modified files | **YES** |
| Unit Tests | `npx vitest run {test_files}` | All tests pass | **YES** |
| Tests Exist | Manual review | New functionality has tests | **YES** |
| Coverage | `npx vitest run --coverage` | 70% overall, 80% critical | No |
| Lint | `npx eslint {changed_files}` | 0 errors | No |

#### UI Team Commands
```bash
# 1. Type check (MUST be 0 errors)
npx tsc --noEmit

# 2. Unit tests for changed code
npx vitest run {changed_test_files}

# 3. Integration tests (if applicable)
npx vitest run --config vitest.integration.config.ts

# 4. Coverage check (recommended)
npx vitest run --coverage
```

#### API Team Commands
```bash
# 1. Type check (MUST be 0 errors)
npx tsc --noEmit

# 2. Unit tests
npm run test:unit -- {changed_test_files}

# 3. Integration tests
npm run test:integration
```

#### Code Review Checklist

**Code Quality:**
- [ ] TypeScript compiles without errors
- [ ] FSD layer boundaries respected (entities → features → widgets → pages)
- [ ] Imports follow conventions (@/ aliases, no upward layer imports)
- [ ] Components use shadcn/ui primitives where applicable
- [ ] Error handling is consistent
- [ ] No console.log statements in production code

**Test Quality:**
- [ ] Unit tests exist for new functions/hooks
- [ ] Tests have meaningful assertions (not just 'renders')
- [ ] Edge cases covered (empty states, errors, loading)
- [ ] Mocks are minimal and focused

**On Failure:**
- Type errors: Fix ALL errors before proceeding
- Test failures: Fix failing tests or write missing tests
- Regressions: Investigate, fix root cause, add regression test

---

### Phase 4: Documentation (MANDATORY - BLOCKING)

**CANNOT proceed to Phase 5 without memory files created**

#### Code Review Gate: Memory Protocol

| File Type | Path | Required | Trigger |
|-----------|------|----------|---------|
| Session | `memory/sessions/{date}-{issue-slug}.md` | **YES** | Every issue |
| Pattern | `memory/patterns/{pattern-name}.md` | If applicable | New reusable pattern |
| ADR | Via `/adr suggest` | If applicable | Architectural decision |
| Entity | `memory/entities/{entity-name}.md` | If applicable | New entity created |

#### Session File Template (REQUIRED)

```markdown
# Session: {issue-id} {issue-title}

**Date:** {YYYY-MM-DD}
**Issue:** {issue-id} - {issue-title}
**Status:** COMPLETE

## Summary
{1-2 sentence summary of what was implemented}

## Files Created
| File | Description |
|------|-------------|
| `path/to/file.tsx` | Description |

## Files Modified
| File | Change |
|------|--------|
| `path/to/file.tsx` | What changed |

## Route (if applicable)
`/path/to/route` - Access requirements

## Features
- Feature 1
- Feature 2

## Tests
- X unit tests passing
- Integration tests (if any)

## Patterns Used
- Pattern 1 (link to memory/patterns/ if exists)
- Pattern 2

## Verification
- TypeScript: No errors
- Tests: X passing

## Related
- Related issue IDs
- Related files/features

## Team Review (if agent team used)
- **Preset selected:** {preset_name}
- **Preset ideal:** {same or different preset}
- **Teammates spawned:** {list with roles}
- **Mid-dev adjustments:** {none | added X | removed X | reassigned Y}
- **Bottlenecks:** {description or none}
- **Task timing:** {role: duration}
- **Recommendation:** {preset recommendation for similar issues}
```

#### Steps

1. **Create session file** (REQUIRED)
   - Path: `memory/sessions/{date}-{issue-slug}.md`
   - Use template above
   - Include all files created/modified

2. **Document new patterns** (if discovered)
   - Path: `memory/patterns/{pattern-name}.md`
   - Triggers:
     - New component pattern used 2+ times
     - New hook pattern that could be reused
     - New API integration pattern
     - New testing pattern

3. **Create ADR suggestion** (if architectural decision made)
   - Use `/adr suggest`
   - Triggers:
     - Significant architectural decision
     - New technology or library introduced
     - Breaking change to existing patterns
     - Cross-team impact identified

4. **Send `/comms`** (if cross-team impact)
   - Use `/comms send`

5. **Update issue** with implementation notes (REQUIRED)

6. **Team config review** (REQUIRED when agent team was used)
   - Compare selected preset to what would have been ideal
   - Record teammate effectiveness and bottlenecks
   - Note any mid-dev review adjustments made
   - Write `## Team Review` section in session file:

   ```markdown
   ## Team Review
   - **Preset selected:** {preset_name}
   - **Preset ideal:** {same or different preset}
   - **Teammates spawned:** {list with roles}
   - **Mid-dev adjustments:** {none | added X | removed X | reassigned Y}
   - **Bottlenecks:** {description or none}
   - **Task timing:** {role: duration for each teammate}
   - **Recommendation:** {use same preset | try X preset} for similar issues
   ```

   This feeds back into Phase 1.5 (Team Selection) for future issues - the lead
   searches past session files for `## Team Review` sections when selecting presets.

---

### Phase 5: Completion (MANDATORY - BLOCKING)

**CANNOT mark complete without all gate criteria met**

#### Code Review Gate: Final Approval Checklist

**Mandatory Criteria (ALL must pass):**

| Criterion | Check | Status |
|-----------|-------|--------|
| TypeScript | `npx tsc --noEmit` = 0 errors | [ ] |
| Tests Pass | All unit/integration tests pass | [ ] |
| Tests Exist | New functionality has tests | [ ] |
| Session File | `memory/sessions/{date}-{issue-slug}.md` exists | [ ] |
| Issue Updated | Commit hash added, status = COMPLETE | [ ] |

**Recommended Criteria:**

| Criterion | Check | Status |
|-----------|-------|--------|
| Coverage | 70% overall, 80% critical paths | [ ] |
| FSD Compliance | No upward imports in layers | [ ] |
| Patterns Documented | New patterns in `memory/patterns/` | [ ] |

#### Steps

1. **Verify ALL acceptance criteria are met**
   - Cross-reference issue requirements
   - Confirm all features implemented

2. **Run final gate checklist**
   - All mandatory criteria must pass
   - Document any recommended criteria not met (with reason)

3. **Move issue to completed**
   - Update issue status to COMPLETE
   - Add commit hash to issue file
   - Move file: `queue/` → `active/` → `completed/`

4. **Verify session file exists**
   - Path: `memory/sessions/{date}-{issue-slug}.md`
   - Must contain all required sections

#### Completion Output

```markdown
## Issue Completed: {issue-id}

### Gate Checklist
- [x] TypeScript: 0 errors
- [x] Tests: {X} passing
- [x] Session file: memory/sessions/{date}-{issue-slug}.md
- [x] Issue updated with commit hash

### Commit
`{hash}` - {commit message}

### Files
- Created: {count}
- Modified: {count}
- Tests: {count}

### Memory
- Session: memory/sessions/{date}-{issue-slug}.md
- Patterns: {list or "None"}
- ADR: {suggested or "None"}
```

---

## Quick Mode

For trivial changes only (typos, comments, single-line fixes):

```
/develop quick src/shared/ui/button.tsx
```

**Enabled for:**
- Documentation updates
- Comment changes
- Single-line bug fixes
- Typo corrections

**Skips:**
- Integration tests
- Memory pattern update
- ADR suggestion

**Still requires:**
- Type check (must pass)
- Unit tests (if test file exists)
- Session file (abbreviated)

---

## Code Reviewer Configuration

Full configuration in `.claude-workflow/team-configs/code-reviewer-config.json`.

### Model Recommendation

| Phase | Model | Thinking | Rationale |
|-------|-------|----------|-----------|
| Implementation | sonnet-4.5 | Standard | Fast iteration |
| Verification | opus-4.6 | Extended | Judgment on test quality |
| Documentation | opus-4.6 | Extended | Pattern recognition |
| Completion | opus-4.6 | Extended | Final quality assessment |

### Agent Team Model Allocation

| Agent | Model | Role |
|-------|-------|------|
| Lead (coordinator + reviewer) | opus-4.6 | Phases 0, 1, 3-gate, 4, 5 |
| Implementer teammate | sonnet-4.5 | Phase 2T code |
| Tester teammate | sonnet-4.5 | Phase 2T tests |
| Researcher teammate | sonnet-4.5 | Phase 1 deep investigation |

### When to Use Extended Thinking

- Reviewing architectural decisions
- Validating FSD layer boundaries
- Identifying patterns worth documenting
- Deciding what belongs in memory files
- Complex refactoring recommendations

---

## Error Handling

| Error Type | Action |
|------------|--------|
| Type error | Fix immediately, do not proceed |
| Test failure | Analyze failure, fix code or test, re-run |
| Regression | Investigate, fix root cause, add regression test |
| Missing session file | Create before marking complete |
| Context compaction | Store session state before compaction |

---

## Test Requirements by Change Type (from ADR-DEV-001)

| Change Type | Required Tests |
|-------------|----------------|
| Bug fix | Regression test proving fix |
| New endpoint | Integration test |
| New UI component | Unit test for rendering |
| New feature | Integration + happy path |
| Refactor | Existing tests must pass |

---

## File Locations

```
dev_communication/
├── issues/{team}/{queue,active,completed}/  # Team issues
├── messaging/
│   ├── api-to-ui/    # API → UI messages (UI inbox)
│   ├── ui-to-api/    # UI → API messages (API inbox)
│   └── archive/      # Completed threads
└── coordination/
    └── dependencies.md  # Cross-team blockers

memory/
├── patterns/   # Development patterns (document new patterns here)
├── entities/   # Component/entity docs
├── context/    # Domain knowledge
└── sessions/   # Session summaries (REQUIRED per issue)

dev_communication/architecture/
├── decisions/  # ADRs
└── gaps/       # Known gaps

.claude/
├── hooks/task-completed.sh    # TaskCompleted quality gate hook
├── hooks/teammate-idle.sh     # TeammateIdle quality gate hook
├── settings.json              # Agent teams enabled + hook config
└── skills/develop/SKILL.md    # This file

.claude-workflow/team-configs/
├── code-reviewer-config.json      # Code review gate configuration
├── agent-team-roles.json          # Agent team role definitions
└── agent-team-hooks-guide.md      # Hook setup documentation
```

## Portable Team Detection

**Auto-detect from working directory:**
```
if (cwd contains "cadencelms_ui")  → team = "ui"
if (cwd contains "cadencelms_api") → team = "api"
```

**Derived paths:**
```
inbox      = dev_communication/messaging/*-to-{team}/
outbox     = dev_communication/messaging/{team}-to-*/
issues     = dev_communication/issues/{team}/
```

**Examples:**
| Team | Inbox | Outbox | Issues |
|------|-------|--------|--------|
| ui | `api-to-ui/` | `ui-to-api/` | `issues/ui/` |
| api | `ui-to-api/` | `api-to-ui/` | `issues/api/` |

## References

- **ADR:** `dev_communication/architecture/decisions/ADR-DEV-002-DEVELOPMENT-LIFECYCLE.md`
- **Config:** `memory/prompts/team-configs/development-lifecycle.md`
- **Testing:** `dev_communication/architecture/decisions/ADR-DEV-001-TESTING-STRATEGY.md`
- **Code Reviewer:** `.claude-workflow/team-configs/code-reviewer-config.json`
- **Agent Team Roles:** `.claude-workflow/team-configs/agent-team-roles.json`
- **Agent Team Hooks:** `.claude/hooks/task-completed.sh`, `.claude/hooks/teammate-idle.sh`
- **Hooks Guide:** `.claude-workflow/team-configs/agent-team-hooks-guide.md`
