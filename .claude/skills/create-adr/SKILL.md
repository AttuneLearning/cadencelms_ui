---
name: create-adr
description: Create a new Architecture Decision Record (ADR) with proper template and update all indexes
argument-hint: "{DOMAIN}-{NUMBER} {Title}"
disable-model-invocation: true
---

# Create Architecture Decision Record

You are creating a new ADR for the CadenceLMS project.

## Arguments

The argument ($ARGUMENTS) should be in format: `{DOMAIN}-{NUMBER} {Title}`

Examples:
- `DATA-001 MongoDB Schema Design Patterns`
- `API-001 REST API Conventions`
- `SECURITY-001 Application Security Standards`
- `ADAPTIVE-001 Adaptive Learning System Architecture`

If no arguments provided, ask the user what ADR they want to create.

## Step 1: Read the Template

First, read the ADR template:
`/home/adam/github/cadencelms_api/agent_coms/docs/architecture/templates/adr-template.md`

## Step 2: Read Related ADRs

Check the decision log for related decisions:
`/home/adam/github/cadencelms_api/agent_coms/docs/architecture/decision-log.md`

Read any ADRs in the same domain to ensure consistency.

## Step 3: Research the Topic

Before writing the ADR, gather context:

1. **Search the codebase** for existing implementations related to the decision
2. **Check dev guidance** for any informal documentation
3. **Review specs and contracts** that relate to this decision
4. **Look at issue queues** for related discussions

## Step 4: Draft the ADR

Create the ADR file at:
`/home/adam/github/cadencelms_api/agent_coms/docs/architecture/decisions/ADR-{DOMAIN}-{NUMBER}-{KEBAB-TITLE}.md`

Use this structure:

```markdown
# ADR-{DOMAIN}-{NUMBER}: {Title}

**Status:** Proposed | Accepted | Deprecated | Superseded
**Date:** YYYY-MM-DD
**Domain:** {Domain Category}

## Context

[Describe the problem, forces at play, and why a decision is needed.
Include any constraints, requirements, or existing patterns that influence the decision.]

## Decision

[State the decision clearly and concisely.
Explain the chosen approach and key implementation details.]

## Alternatives Considered

[List other options that were evaluated and why they weren't chosen.]

### Alternative 1: {Name}
- Pros: ...
- Cons: ...
- Why rejected: ...

### Alternative 2: {Name}
- Pros: ...
- Cons: ...
- Why rejected: ...

## Consequences

### Positive
- [Benefit 1]
- [Benefit 2]

### Negative
- [Tradeoff 1]
- [Tradeoff 2]

### Neutral
- [Implication that's neither good nor bad]

## Implementation

[If applicable, describe how this decision should be implemented.]

### Phase 1: ...
### Phase 2: ...

## Compliance

[How to verify the decision is being followed.]

- [ ] Checklist item 1
- [ ] Checklist item 2

## Links

- Decision log: [[../decision-log]]
- Related ADRs: [[ADR-XXX-...]]
- Specs: [path to relevant specs]
- Contracts: [path to relevant contracts]
```

## Step 5: Update the Decision Log

Add entry to `/home/adam/github/cadencelms_api/agent_coms/docs/architecture/decision-log.md`:

```markdown
| ADR-{DOMAIN}-{NUMBER} | {Title} | Proposed | {DATE} | {Domain} | [[decisions/ADR-{DOMAIN}-{NUMBER}-{KEBAB-TITLE}]] |
```

## Step 6: Update the Index

Add the new ADR to the appropriate section in:
`/home/adam/github/cadencelms_api/agent_coms/docs/architecture/index.md`

If the domain section doesn't exist, create it.

## Step 7: Add to Feature Checklist (if applicable)

If the ADR establishes a new pattern that developers should follow, add it to:
`/home/adam/github/cadencelms_api/agent_coms/dev_guidance/FEATURE_DEVELOPMENT_CHECKLIST.md`

Under the "Architecture Decisions" section with a summary.

## Step 8: Report

After creating the ADR, output:
1. The file path of the new ADR
2. A summary of the decision
3. Any related documents that should be updated
4. Suggested next steps (related ADRs to create, implementation work)
