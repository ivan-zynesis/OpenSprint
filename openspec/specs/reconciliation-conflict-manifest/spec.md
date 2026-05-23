# Reconciliation Conflict Manifest Specification

## Purpose

Define the format of the planning phase output produced by `/opsp:rebase` and `/opsp:abandon` before any files are written. The conflict manifest is displayed to the operator for confirmation; it is never persisted to disk.

## When It Is Produced

During the mandatory planning phase (per DEC-004). The agent performs a read-only scan of both universes, classifies all citizens, and displays this manifest. The operator must confirm before execution begins.

## Display Format

```
╔══════════════════════════════════════════════════════════╗
║           RECONCILIATION PLAN — <OPERATION>              ║
╚══════════════════════════════════════════════════════════╝

Source universe:  <worktree-path>
                  branch: <branch-name>
Target universe:  <worktree-path>
                  branch: <branch-name>
Scan date:        <YYYY-MM-DD>

┌─────────────────┬───────┬─────────┬──────────┬───────────┬────────────┐
│ Citizen Type    │ Total │ MIGRATE │ CONFLICT │ REDUNDANT │ SUPERSEDED │
├─────────────────┼───────┼─────────┼──────────┼───────────┼────────────┤
│ Driver Specs    │       │         │          │           │            │
│ ADRs            │       │         │          │           │            │
│ Initiatives     │       │         │          │           │            │
│ Active Changes  │       │         │          │           │            │
├─────────────────┼───────┼─────────┼──────────┼───────────┼────────────┤
│ TOTAL           │       │         │          │           │            │
└─────────────────┴───────┴─────────┴──────────┴───────────┴────────────┘

Auto-resolvable (HIGH confidence MIGRATE + REDUNDANT):  <N>
Requires operator input (CONFLICT + LOW confidence):    <K>

⚠  Model recommendation: Run with the most capable available model and
   extended thinking enabled. These operations modify the canonical surrogate.
```

## Detail Section (for CONFLICT and LOW-confidence MIGRATE citizens)

After the summary table, list each citizen requiring operator input:

```
── Citizens Requiring Operator Input ────────────────────────

[1] CONFLICT — <citizen-id> (<citizen-type>)
    Source: <one-line summary of source content>
    Target: <one-line summary of target content>
    Contradiction: <why these are incompatible>

[2] MIGRATE (LOW confidence) — <citizen-id> (<citizen-type>)
    Source: <one-line summary>
    Overlap: <what overlaps with existing target content>
    Risk: <what could go wrong if auto-accepted>

...
```

## Cross-Skill Warning

If the operation is `/opsp:rebase` but the manifest reveals a high proportion of CONFLICT ADRs (>50% of ADRs are CONFLICT), the agent appends:

```
⚠  High ADR conflict rate detected (<N>/<total> ADRs conflict).
   This may indicate a fundamental architecture split rather than
   a soft fork. Consider: is `/opsp:abandon` more appropriate?
```

## Operator Confirmation Prompt

After displaying the full manifest:

```
Proceed with <operation>? This will modify the target universe's surrogate.
[Y] Yes, proceed   [N] Cancel
```

Execution begins only after explicit confirmation.
