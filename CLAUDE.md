# Project Instructions

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
