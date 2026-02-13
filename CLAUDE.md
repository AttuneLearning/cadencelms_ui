# Project Instructions

## Git Policy

**Only push `cadencelms_ui`.** Do NOT push `cadencelms_api` from this repo's Claude session. The API repo is an additional working directory for reading `dev_communication/` (symlinked) — commits there are fine, but pushes must be done from the API repo's own session.

---

## Development Environment

| Service | URL |
|---------|-----|
| UI (Vite dev server) | `http://localhost:5173` |
| Backend API | `http://localhost:5150` |

---

## Development Principles

**Read:** `dev_communication/shared/guidance/DEVELOPMENT_PRINCIPLES.md`

**Key Rule:** Unless otherwise specified, always design for the ideal API/route structure. No backward compatibility layers, deprecated fields, or legacy fallbacks unless explicitly requested.

---

## Dev Communication

**Location:** `./dev_communication/`

| Action | Command |
|--------|---------|
| Check inbox/issues | `/comms` |
| Send message | `/comms send` |
| Create issue | `/comms issue` |
| Update status | `/comms status` |

---

## Architecture Decisions

**Location:** `dev_communication/shared/architecture/`

| Action | Command |
|--------|---------|
| Show status | `/adr` |
| Full analysis | `/adr check` |
| View gaps | `/adr gaps` |
| Create suggestion | `/adr suggest` |

### After Significant Work

1. New pattern established? `/adr suggest`
2. Affects other team? `/comms send`

---

## Development Workflow (MANDATORY)

**ADR:** `dev_communication/shared/architecture/decisions/ADR-DEV-002-DEVELOPMENT-LIFECYCLE.md`

### Before Any Implementation

1. **Check comms:** `/comms` for inbox messages and blockers
2. **Define endpoint contracts:** If the work involves new or changed API endpoints, define the contracts first and send to the API team (`/comms send`). Getting cross-team agreement on contracts early prevents rework and is second in priority only to team configuration.
3. **Load context:** `/context` for relevant ADRs, patterns, memory
4. **Implement** following patterns and ADRs
5. **Verify** — ALL must pass before completing:
   ```bash
   npx tsc --noEmit                                        # Type check
   npx vitest run                                          # Unit tests
   npx vitest run --config vitest.integration.config.ts    # Integration tests
   ```
6. **Document:** `/memory` if new pattern, `/adr suggest` if architectural, `/comms send` if cross-team
7. **Complete:** Verify acceptance criteria, `/comms move` to completed

### Skills Reference

| Skill | Purpose |
|-------|---------|
| `/comms` | Inter-team communication (inbox, issues, messages) |
| `/adr` | Architecture decisions, gaps, suggestions |
| `/context` | Load relevant ADRs, patterns, and memory before work |
| `/memory` | Manage the extended memory vault |
| `/refine` | Review patterns, promote to ADRs |
| `/reflect` | Capture learnings after implementation |

### Agent Team Configuration

When spawning agent teams, read role definitions and review criteria from:
- `.claude-workflow/team-configs/agent-team-roles.json` — team role definitions, spawn prompts, presets
- `.claude-workflow/team-configs/code-reviewer-config.json` — code review gate criteria

### Completion Gate (Blocking)

No issue can be marked complete until ALL pass:
- [ ] `npx tsc --noEmit` — 0 errors
- [ ] `npx vitest run` — all tests pass
- [ ] New functionality has corresponding tests
- [ ] Session file created: `memory/sessions/{date}-{issue-slug}.md`
- [ ] Issue file updated with commit hash and status COMPLETE
