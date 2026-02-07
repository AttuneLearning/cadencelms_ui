# Archived Team Configs

Legacy team configuration files superseded by the `/develop` skill + agent team roles system.

These were manually-crafted team configs used before the structured `/develop` lifecycle
and agent teams integration were implemented.

## Current System

- **Active configs:** `.claude-workflow/team-configs/` (shared via submodule)
- **Learned configs:** `memory/team-configs/` (project-specific, built from Phase 4 reviews)
- **Agent team roles:** `.claude-workflow/team-configs/agent-team-roles.json`
- **Code review gate:** `.claude-workflow/team-configs/code-reviewer-config.json`

## Archived Files

| File | Original Purpose | Superseded By |
|------|-----------------|---------------|
| `team-config.json` | Main team config | agent-team-roles.json |
| `team-config.backup.json` | Backup of earlier config | agent-team-roles.json |
| `team-config.old.json` | Older archived config | agent-team-roles.json |
| `team-config-ui-auth.json` | Auth-specific config | agent-team-roles.json presets |
| `team-config-learning-unit-ui.json` | Learning unit config | agent-team-roles.json presets |
| `bug-fix-team-config.json` | Bug fix config | agent-team-roles.json bugFix pattern |

These files are preserved for reference only and are not used by any active workflow.
