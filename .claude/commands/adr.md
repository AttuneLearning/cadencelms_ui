---
name: adr
description: Manage architecture decisions, gaps, and suggestions
argument-hint: "[check|check security|check adaptive|gaps|suggest|poll|create|review]"
---

# Architecture Decision Management

Manage ADRs, track gaps, and process suggestions.

## Actions

Based on arguments ($ARGUMENTS), perform one of these actions:

### 1. STATUS (default - no arguments)

Show current architecture status.

**Trigger:** `/adr`, `/adr status`

**Steps:**
1. Read `dev_communication/architecture/index.md`
2. Count files in `dev_communication/architecture/suggestions/` (excluding index.md)
3. Read `dev_communication/architecture/gaps/index.md` for gap count
4. Count ADRs in architecture decisions directory

**Output:**
```
## Architecture Status

### ADRs: [count] documented
### Gaps: [count] known
### Suggestions: [count] pending review

Use `/adr check` for full analysis.
```

### 2. CHECK - Full Traversal & Analysis

**Trigger:** `/adr check`, `/adr check [domain]`

**Arguments:**
- `security` - Deep dive on security architecture
- `adaptive` - Focus on adaptive learning architecture
- `[domain]` - Focus on specific domain (auth, billing, content, ui, infra, etc.)

**Steps:**
1. Read architecture index
2. Read decision log
3. Scan all ADRs and extract: ID, Title, Status, Domain
4. Compare against expected architecture areas
5. Read gaps index
6. Generate comprehensive report

### 3. GAPS - Gap Analysis Only

**Trigger:** `/adr gaps`

**Steps:**
1. Read `dev_communication/architecture/gaps/index.md`
2. Summarize each gap: Domain, Priority, Suggested ADR
3. Recommend top 3 to address

### 4. SUGGEST - Create Architecture Suggestion

**Trigger:** `/adr suggest`, `/adr suggest [topic]`

**Steps:**
1. If no topic, ask for: Topic, Context, Teams affected, Priority
2. Generate filename: `YYYY-MM-DD_{team}_{topic_slug}.md`
3. Create in `dev_communication/architecture/suggestions/`
4. Confirm created

### 5. POLL - Scan Messages/Issues for Architecture Decisions

**Trigger:** `/adr poll`

**Steps:**
1. Scan messaging directories for unprocessed messages
2. Scan active issues
3. Look for keywords: "architecture", "pattern", "design decision", "convention"
4. Report findings and recommendations

### 6. CREATE - Create ADR from Suggestion or New

**Trigger:** `/adr create`, `/adr create [suggestion-file]`

**Steps:**
1. If suggestion provided, read it
2. Otherwise ask for: Domain, Title, Context, Decision, Consequences
3. Generate ADR content using template
4. Save to architecture decisions directory
5. Update decision log
6. If from suggestion, archive it

**ADR Skeleton Template:**

```markdown
# ADR-{DOMAIN}-{NUMBER}: {Title}

**Status:** Proposed
**Date:** {YYYY-MM-DD}
**Domain:** {domain}

## Context
[What problem or decision needs to be addressed?]

## Decision
[What is the proposed solution?]

## Consequences
### Positive
- [Benefit 1]

### Negative
- [Tradeoff 1]

## Links
- Related ADRs: [[ADR-XXX-NNN]]
```

### 7. REVIEW - Review/Update Existing ADR

**Trigger:** `/adr review [ADR-ID]`

**Steps:**
1. Read the ADR
2. Check for staleness, missing links, implementation drift
3. Suggest updates if needed
4. If approved, update the ADR

## File Locations

```
dev_communication/architecture/
├── index.md              # Hub dashboard
├── suggestions/          # Ingestion directory
└── gaps/                 # Gap tracker
```
