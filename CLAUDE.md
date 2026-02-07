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

**Read:** `dev_communication/guidance/DEVELOPMENT_PRINCIPLES.md`

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

**Location:** `dev_communication/architecture/`

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

**ADR:** `dev_communication/architecture/decisions/ADR-DEV-002-DEVELOPMENT-LIFECYCLE.md`
**Config:** `memory/prompts/team-configs/development-lifecycle.md`

| Action | Command |
|--------|---------|
| Process next issue | `/develop` |
| Process specific issue | `/develop UI-ISS-082` |
| Process all issues | `/develop all` |
| Quick mode (trivial) | `/develop quick <file>` |

### Lifecycle Phases (ALL MANDATORY)

0. **Poll & Unblock** - Check `*-to-{team}/` inbox, unblock issues with responses
1. **Context** - Check /comms, load /memory patterns, identify ADRs
2. **Implementation** - Follow patterns, follow ADRs, update types
3. **Verification** - `tsc --noEmit` (0 errors), unit tests, integration tests
4. **Documentation** - Update /memory, /adr suggest if needed, /comms if cross-team
5. **Completion** - Verify acceptance criteria, move issue, store session

### Message Polling (Automatic)

- **UI team** polls: `dev_communication/messaging/api-to-ui/`
- **API team** polls: `dev_communication/messaging/ui-to-api/`
- Responses automatically unblock matching BLOCKED issues
- **Stops after:** 20 min inactivity OR issue completion

### Verification Commands

```bash
# Type check (MUST pass before completing)
npx tsc --noEmit

# Unit tests
npx vitest run

# Integration tests
npx vitest run --config vitest.integration.config.ts
```

**CRITICAL:** No issue can be marked complete until ALL verification steps pass.
