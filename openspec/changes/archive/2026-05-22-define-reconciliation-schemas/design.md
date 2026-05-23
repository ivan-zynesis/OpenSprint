# Design: Reconciliation Schemas

## Citizen Taxonomy

A **citizen** is any surrogate artifact that can be evaluated for migration during reconciliation:
- Driver-specs (`opensprint/driver-specs/*.md`)
- ADRs (`opensprint/ADRs/*.md`)
- Initiative descriptors (`opensprint/initiatives/*.md`)
- Active opsx changes (`openspec/changes/*/` — excluding archive)

Each citizen receives exactly one classification per reconciliation run:

| Class | Criteria | Default Action |
|---|---|---|
| MIGRATE | Present in source, absent in target, no semantic conflict detectable | Auto-migrate if confidence HIGH, else operator confirm |
| CONFLICT | Present in both, content contradicts or is incompatible | Always escalate to operator |
| REDUNDANT | Present in both, semantically equivalent | Skip (no write) |
| SUPERSEDED | Present in source, but target has resolved this differently | Drop from migration, record in manifest |

**Confidence levels for MIGRATE:**
- HIGH: purely additive (new file, no overlap with any existing target citizen)
- LOW: content overlaps with existing target content but no direct contradiction detected

Only HIGH confidence MIGRATE citizens are auto-accepted. LOW confidence always escalates.

## Conflict Manifest Schema

Produced during the planning phase (read-only). Never written to disk — displayed to operator for confirmation.

```
Conflict Manifest
─────────────────
Source universe:  <worktree-path> (branch: <branch-name>)
Target universe:  <worktree-path> (branch: <branch-name>)
Scan date:        <YYYY-MM-DD>

Driver Specs:     <N> total  →  <n> MIGRATE  <n> CONFLICT  <n> REDUNDANT  <n> SUPERSEDED
ADRs:             <N> total  →  ...
Initiatives:      <N> total  →  ...
Active Changes:   <N> total  →  ...

Conflicts requiring operator input: <K>
Estimated auto-resolvable:          <M>

Model recommendation: Use the most capable available model with extended thinking enabled.
```

Followed by a per-citizen detail table for any CONFLICT or LOW-confidence MIGRATE citizens.

## Migration Manifest Schema

Written to `opensprint/abandoned/{name}/migration-manifest.md` by `/opsp:abandon` after execution.

```markdown
---
abandoned: <universe-name>
winner: <target-universe-name>
date: <YYYY-MM-DD>
operator: <git user>
---

# Migration Manifest: <abandoned-universe-name>

## Summary

| Category       | MIGRATE | CONFLICT (dropped) | REDUNDANT | SUPERSEDED |
|----------------|---------|--------------------|-----------|------------|
| Driver Specs   | N       | N                  | N         | N          |
| ADRs           | N       | N                  | N         | N          |
| Initiatives    | N       | N                  | N         | N          |
| Active Changes | N       | N                  | N         | N          |

## Citizen Records

### Migrated
- **<citizen-id>**: <one-line rationale>

### Dropped (CONFLICT)
- **<citizen-id>**: <why it conflicted with target>

### Dropped (SUPERSEDED)
- **<citizen-id>**: superseded by <target-citizen-id>

### Skipped (REDUNDANT)
- **<citizen-id>**: equivalent to <target-citizen-id>

## Operator Decisions

Record of each escalation and what the operator chose:
- <citizen-id>: operator chose <action> — "<operator note if any>"
```
