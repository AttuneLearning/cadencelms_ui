# Pattern: Frontend Issue Routing

**Category:** Workflow | Architecture
**Created:** 2026-02-13
**Tags:** #pattern #workflow #issue-triage #dev-communication #frontend

## Problem

New UI issues can be created in legacy paths (for example `api/agent_coms/ui/issue_queue/`) instead of the active frontend issue system, causing duplicate or missed triage.

## Solution

Treat `dev_communication/frontend/definition.yaml` as the source of truth before creating any issue.

For frontend-owned issues:
- Create only in `dev_communication/frontend/issues/queue/`.
- Use current queue naming conventions and numbering from that directory.
- If an issue was created in a legacy path, migrate it to the frontend queue and remove the misplaced copy.

## Quick Checklist

1. Confirm active team definition at `dev_communication/frontend/definition.yaml`.
2. Read current files in `dev_communication/frontend/issues/queue/` to get next ID + slug format.
3. Create issue in frontend queue only.
4. If needed, clean up duplicates from `api/agent_coms/ui/issue_queue/`.

## When to Use

- Any time creating or moving frontend/UI issues.
- Any time multiple issue directories exist in the workspace.

## When NOT to Use

- Creating non-frontend issues owned by another team definition.

## Related Patterns

- [[permission-string-debugging]]

## Links

- Source of truth: `dev_communication/frontend/definition.yaml`
- Queue path: `dev_communication/frontend/issues/queue/`
- Memory log: [[../memory-log]]
