---
name: comms
description: Manage inter-team communication and issue tracking
argument-hint: "[check|send|issue|status|move|archive]"
---

# Inter-Team Communication

Manage messages and issues between API and UI teams.

## Actions

Based on arguments ($ARGUMENTS), perform one of these actions:

### 1. CHECK (default - no arguments)

Check inbox for new messages and pending issues.

**Trigger:** `/comms`, `/comms check`

**Steps:**
1. Scan `dev_communication/messaging/{inbox}/` for unread messages
2. Scan `dev_communication/issues/{team}/queue/` for pending issues
3. Scan `dev_communication/issues/{team}/active/` for in-progress issues
4. Report findings with counts and summaries

### 2. SEND

Send a message to the other team.

**Trigger:** `/comms send`

**Steps:**
1. Ask for: Subject, Priority (Critical/High/Medium/Low), Type (Request/Response/Info), Content
2. Generate filename: `YYYY-MM-DD_{subject_slug}.md`
3. Create in `dev_communication/messaging/{outbox}/`
4. Use template from `dev_communication/messaging/templates/`

### 3. ISSUE

Create a new issue.

**Trigger:** `/comms issue`

**Steps:**
1. Ask for: Title, Priority, Description, Acceptance Criteria
2. Find next issue number by scanning existing issues
3. Generate ID: `{TEAM}-ISS-{NNN}`
4. Create in `dev_communication/issues/{team}/queue/`

### 4. STATUS

Update team status file.

**Trigger:** `/comms status`

**Steps:**
1. Read current status from `dev_communication/coordination/{team}-team-status.md`
2. Ask what to update: Current Focus, Blockers, Recent Completions
3. Write updated status with timestamp

### 5. MOVE

Move issue to different stage.

**Trigger:** `/comms move {ISS-ID} {active|completed}`

**Steps:**
1. Parse issue ID and target stage from arguments
2. Find issue file in current location
3. Move file to target directory (`active/` or `completed/`)
4. Add status update with timestamp to the issue file

### 6. ARCHIVE

Archive a processed message.

**Trigger:** `/comms archive {filename}`

**Steps:**
1. Find message in inbox
2. Move to `dev_communication/messaging/archive/`
3. Add archived date to file

## File Locations

```
dev_communication/
├── issues/
│   ├── api/{queue,active,completed}/
│   └── ui/{queue,active,completed}/
├── messaging/
│   ├── api-to-ui/     # API outbox / UI inbox
│   ├── ui-to-api/     # UI outbox / API inbox
│   └── archive/
└── coordination/
    ├── api-team-status.md
    └── ui-team-status.md
```

## Templates

Use templates from `dev_communication/messaging/templates/` and `dev_communication/issues/templates/`.
