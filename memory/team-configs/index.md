---
title: Team Configurations
description: Learned team compositions from past development sessions
updated: 2026-02-07
---

# Team Configurations

Structured records of team compositions that worked well (or didn't) for specific issue types. Used by Phase 1.5 (Team Selection) to inform preset choices.

## How This Works

1. **Phase 4** writes a `## Team Review` in the session file AND promotes successful configs here
2. **Phase 1.5** reads this directory to find past configs matching the current issue type
3. Over time, this builds a lookup table of "issue type → best team config"

## Files

| File | Description |
|------|-------------|
| `_template.json` | Template for new team config entries |
| `*.json` | Learned team configs (one per significant review) |

## Naming Convention

```
{issue-type}--{qualifier}.json
```

Examples:
- `new-feature--single-layer.json`
- `new-feature--cross-layer.json`
- `bug-fix--regression.json`
- `refactor--entity-migration.json`

## Lookup Strategy (Phase 1.5)

1. Classify current issue by type (new-feature, bug-fix, refactor, etc.)
2. Search this directory for matching `issueType` entries
3. Check `effectiveness` rating (prefer "excellent" > "good" > "adequate")
4. Fall back to preset defaults if no match found
