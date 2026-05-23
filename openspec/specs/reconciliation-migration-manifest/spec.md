# Reconciliation Migration Manifest Specification

## Purpose

Define the schema for `migration-manifest.md`, the audit record written to `opensprint/abandoned/{name}/` by `/opsp:abandon` after execution completes. This file is the permanent record of what happened during a hard-fork abandonment.

## File Location

```
opensprint/abandoned/<abandoned-universe-name>/migration-manifest.md
```

Written alongside:
```
opensprint/abandoned/<abandoned-universe-name>/snapshot/
  ADRs/
  driver-specs/
  initiatives/
  architecture.md
  DECISION-MAP.md
```

## Frontmatter

```yaml
---
abandoned: <abandoned-universe-name>
winner: <target-universe-branch-name>
date: <YYYY-MM-DD>
operator: <git config user.name>
citizens-evaluated: <total count>
citizens-migrated: <count>
citizens-dropped: <count>
---
```

## Document Structure

```markdown
# Migration Manifest: <abandoned-universe-name>

## Context

Brief description of why this universe was abandoned and what the winner universe
represents. Written by the agent based on the initiative descriptors of both universes.

## Summary Table

| Category       | Total | MIGRATE | CONFLICT | REDUNDANT | SUPERSEDED |
|----------------|-------|---------|----------|-----------|------------|
| Driver Specs   |       |         |          |           |            |
| ADRs           |       |         |          |           |            |
| Initiatives    |       |         |          |           |            |
| Active Changes |       |         |          |           |            |
| **TOTAL**      |       |         |          |           |            |

## Migrated Citizens

Citizens from the abandoned universe that were brought into the winner.

### Driver Specs
- **<id>**: <rationale for migration>

### ADRs
- **<id>**: <rationale for migration>

### Initiatives
- **<id>**: <rationale — typically "planned work remains relevant to winner architecture">

### Active Changes
- **<id>**: <rationale>

## Dropped Citizens

### Conflicts (operator resolved)
- **<id>**: <what conflicted> → operator chose: <decision> ("<operator note if provided>")

### Superseded
- **<id>**: superseded by `<target-citizen-id>` — <one-line explanation>

### Redundant (skipped)
- **<id>**: equivalent to `<target-citizen-id>`

## Operator Decision Log

Chronological record of every escalation during this abandonment run:

| # | Citizen | Classification | Operator Decision | Note |
|---|---------|----------------|-------------------|------|
| 1 | <id>    | CONFLICT       | <action taken>    | <operator note> |
| 2 | <id>    | MIGRATE LOW    | <action taken>    |      |

## Recovery Notes

If this abandonment needs to be reversed:
- The full snapshot is at `opensprint/abandoned/<name>/snapshot/`
- Migrated citizens are already in the winner — manual deduplication required if reverting
- Dropped CONFLICT citizens will need manual re-evaluation against the winner surrogate
```

## Requirements

### Requirement: Manifest completeness
- **WHEN** `/opsp:abandon` completes execution
- **THEN** the manifest SHALL record every citizen evaluated (none omitted)
- **AND** every operator decision SHALL be logged in the Operator Decision Log

### Requirement: Snapshot integrity
- **WHEN** writing the abandoned archive
- **THEN** the snapshot SHALL be a verbatim copy of the abandoned universe's `opensprint/` directory at the moment of abandonment (before any migrations occurred)
- **AND** the snapshot SHALL NOT be modified after writing

### Requirement: Manifest written before worktree removal
- **WHEN** the abandonment execution completes
- **THEN** the manifest SHALL be written and committed to the winner branch
- **AND** the operator SHALL confirm the manifest looks correct
- **BEFORE** the abandoned worktree and branch are removed
