---
name: opensprint-rebase
description: Bring a source universe's surrogate work into the current target universe — soft fork consensus resolution via DFS citizen reconciliation.
license: MIT
compatibility: Requires openspec CLI and git worktree support.
metadata:
  author: opensprint
  version: "1.0"
---

Reconcile two parallel initiative universes by bringing the source universe's work into the current (target) universe. Analogous to a git rebase: both bodies of work survive in a single unified timeline. The source branch becomes stale after completion.

**Input**: Specify the source worktree path or branch name after `/opsp:rebase` (e.g., `/opsp:rebase ../MyRepo-opsp-feature-x` or `/opsp:rebase opsp/feature-x`). If omitted, list all `opsp/*` branches and let the operator choose.

---

## ⚠ OPERATOR-ONLY SKILL

**This skill MUST NOT be invoked by another agent, sub-task, automated pipeline, or other skill.**
It is exclusively operator-invocable via the `/opsp:rebase` command.
Violation of this guardrail risks corrupting the canonical surrogate with unbounded downstream blast radius.

---

## Phase 1: Identify Universes

1. Determine the **target universe** — this is the current worktree (run `pwd` and `git branch --show-current` to confirm).
2. Determine the **source universe** from the operator argument:
   - If a worktree path: verify it exists and is a git worktree (`git worktree list`)
   - If a branch name: resolve to its worktree path, or check it out to a temp worktree if no worktree exists
3. Confirm both universe paths before proceeding.

```
Target universe: <path> (branch: <name>)
Source universe: <path> (branch: <name>)
```

---

## Phase 2: Planning (Read-Only)

**No files are written during this phase.**

1. Load target surrogate:
   - `<target>/opensprint/driver-specs/*.md`
   - `<target>/opensprint/ADRs/*.md`
   - `<target>/opensprint/initiatives/*.md`
   - Active opsx changes: `<target>/openspec/changes/*/` (excluding `archive/`)

2. Load source surrogate (same paths under source root).

3. **DFS classify all citizens** per the reconciliation-citizen-taxonomy spec:

   ```
   for each initiative in source:
     for each ADR referenced by or created during this initiative:
       classify: MIGRATE | CONFLICT | REDUNDANT | SUPERSEDED
     for each active opsx change belonging to this initiative:
       classify: MIGRATE | CONFLICT | REDUNDANT | SUPERSEDED
   ```

   Classification rules:
   - **MIGRATE HIGH**: present in source only, no semantic overlap with any target citizen → eligible for auto-accept
   - **MIGRATE LOW**: present in source only, but content overlaps with existing target content → escalate
   - **CONFLICT**: present in both, semantically incompatible → always escalate
   - **REDUNDANT**: present in both, semantically equivalent → skip
   - **SUPERSEDED**: source citizen resolved by a different target citizen → drop

   **Default to LOW confidence when uncertain. Express uncertainty liberally.**

4. Display the **conflict manifest** per reconciliation-conflict-manifest spec:

   ```
   ╔══════════════════════════════════════════════════════════╗
   ║              RECONCILIATION PLAN — REBASE                ║
   ╚══════════════════════════════════════════════════════════╝

   Source universe: <path> (branch: <name>)
   Target universe: <path> (branch: <name>)
   Scan date:       <YYYY-MM-DD>

   ┌─────────────────┬───────┬─────────┬──────────┬───────────┬────────────┐
   │ Citizen Type    │ Total │ MIGRATE │ CONFLICT │ REDUNDANT │ SUPERSEDED │
   ...
   └─────────────────┴───────┴─────────┴──────────┴───────────┴────────────┘

   Auto-resolvable:          <N>
   Requires operator input:  <K>

   ⚠  Model recommendation: Run with the most capable available model and
      extended thinking enabled.
   ```

   List each CONFLICT and LOW-confidence MIGRATE citizen with detail.

5. **Wrong-command guard**: if >50% of ADRs are CONFLICT, warn:
   ```
   ⚠  High ADR conflict rate (<N>/<total>). This may be a fundamental
      architecture split. Consider `/opsp:abandon` instead of `/opsp:rebase`.
   ```

6. **Await operator confirmation** before proceeding:
   ```
   Proceed with rebase? [Y] Yes   [N] Cancel
   ```

---

## Phase 3: Execution (DFS)

Work through the classified citizens depth-first, one initiative at a time.

```
for each initiative in source (DFS order):

  ANNOUNCE: "Processing initiative: <id>"

  for each ADR in this initiative:
    if MIGRATE HIGH:
      → copy ADR file to target opensprint/ADRs/
      → log: "Auto-migrated <id> (additive, HIGH confidence)"
    if MIGRATE LOW or CONFLICT:
      → PAUSE
      → present: source content vs target content, explanation of overlap/conflict
      → ask operator: "Migrate as-is / Merge manually / Drop / Skip initiative"
      → apply operator decision
    if REDUNDANT:
      → log: "Skipped <id> (redundant with <target-id>)"
    if SUPERSEDED:
      → log: "Dropped <id> (superseded by <target-id>)"

  for each active opsx change in this initiative:
    (same classification dispatch as ADRs above)

  → COMMIT initiative decision: migrated / skipped / partial (operator chose per-citizen)
  → proceed to next initiative
```

**Pause semantics**: If an operator decision is needed, stop the DFS at that citizen. Do not advance until the operator responds. Do not auto-resolve anything marked LOW or CONFLICT.

---

## Phase 4: Surrogate Finalization

After DFS completes:

1. Regenerate `opensprint/DECISION-MAP.md` in the target worktree to reflect any new ADRs.
2. Display migration summary:
   ```
   Rebase complete.
   Migrated:  <N> citizens
   Skipped:   <N> (redundant/superseded)
   Dropped:   <N> (operator chose not to migrate)
   Conflicts resolved: <N>
   ```

---

## Phase 5: Cleanup

1. Notify operator:
   ```
   Source branch opsp/<name> is now stale — its surrogate work has been
   absorbed into the target universe.

   Remove source worktree? [Y] Yes   [N] Leave it
   ```
2. If operator confirms: `git worktree remove <source-path>`
   - If source branch has uncommitted code changes (not just surrogate): warn and do NOT remove automatically. Operator must merge or discard the code changes manually.

---

## Guardrails

- **Read-only planning phase** — no writes until operator confirms
- **Bias toward escalation** — LOW confidence always escalates; do not auto-accept anything ambiguous
- **One initiative at a time** — complete (or skip) each initiative before advancing the DFS
- **Never modify the source universe** — all writes go to the target
- **Wrong-command warning** — surface `/opsp:abandon` recommendation if ADR conflict rate is high
- **No automated invocation** — operator-only, no sub-agent calls
