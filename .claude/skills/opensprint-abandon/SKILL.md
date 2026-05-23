---
name: opensprint-abandon
description: Declare the current universe the winner, migrate compatible citizens from the loser universe, archive the loser, and remove its worktree — hard fork resolution.
license: MIT
compatibility: Requires openspec CLI and git worktree support.
metadata:
  author: opensprint
  version: "1.0"
---

Declare the current (winner) universe victorious in a hard fork. Migrate compatible citizens from the loser universe into the winner, write a permanent abandoned archive, and remove the loser worktree.

**Analogy**: a blockchain hard fork where one chain wins. The loser chain stops producing blocks, but its full history is preserved in `opensprint/abandoned/`.

**Input**: Specify the loser worktree path or branch name after `/opsp:abandon` (e.g., `/opsp:abandon ../MyRepo-opsp-v1-arch` or `/opsp:abandon opsp/v1-arch`). If omitted, list all `opsp/*` branches and let the operator choose.

---

## ⚠ OPERATOR-ONLY SKILL

**This skill MUST NOT be invoked by another agent, sub-task, automated pipeline, or other skill.**
It is exclusively operator-invocable via the `/opsp:abandon` command.
This operation permanently removes the loser worktree and modifies the canonical surrogate.

---

## Phase 1: Identify Universes

1. Determine the **winner universe** — the current worktree. Run `pwd` and `git branch --show-current` to confirm.
2. Determine the **loser universe** from the operator argument:
   - If a worktree path: verify it exists (`git worktree list`)
   - If a branch name: resolve to its worktree path, or temporarily attach a worktree to inspect it
3. Confirm both:
   ```
   Winner (current): <path> (branch: <name>)
   Loser (to abandon): <path> (branch: <name>)
   ```

---

## Phase 2: Planning (Read-Only)

**No files are written during this phase.**

1. Load winner surrogate (`<winner>/opensprint/`)
2. Load loser surrogate (`<loser>/opensprint/`)
3. **Snapshot the loser's opensprint/ path** — record it for later verbatim copy. Do NOT copy yet.

4. **DFS classify all loser citizens** per the reconciliation-citizen-taxonomy spec:

   ```
   for each initiative in loser:
     for each ADR referenced by or created during this initiative:
       classify: MIGRATE | CONFLICT | REDUNDANT | SUPERSEDED
     for each active opsx change belonging to this initiative:
       classify: MIGRATE | CONFLICT | REDUNDANT | SUPERSEDED
   ```

   Classification rules:
   - **MIGRATE HIGH**: present in loser only, no semantic overlap with any winner citizen → eligible for auto-migration
   - **MIGRATE LOW**: present in loser only, content overlaps with winner content → escalate
   - **CONFLICT**: present in both, semantically incompatible → always escalate
   - **REDUNDANT**: present in both, semantically equivalent → skip
   - **SUPERSEDED**: loser citizen already resolved differently by winner → drop

   **Default to LOW confidence when uncertain. Bias toward escalation.**

5. Display the **conflict manifest** per reconciliation-conflict-manifest spec with `ABANDON` as the operation label.

6. **Await operator confirmation**:
   ```
   Proceed with abandon? This will:
   - Migrate <N> citizens into the winner
   - Archive the loser at opensprint/abandoned/<name>/
   - Remove the loser worktree and branch

   [Y] Yes, proceed   [N] Cancel
   ```

---

## Phase 3: Write Snapshot (Before Any Migration)

**Immediately after operator confirmation, before migrating anything:**

Copy the loser's full `opensprint/` directory verbatim into the winner:
```
opensprint/abandoned/<loser-branch-slug>/snapshot/
```

Where `<loser-branch-slug>` is the loser branch name with `/` replaced by `-` (e.g., `opsp/v1-arch` → `opsp-v1-arch`).

This snapshot captures the loser at the moment of abandonment, before any migrations alter the record.

---

## Phase 4: Execution (DFS)

Work through the classified loser citizens depth-first, one initiative at a time.

```
for each initiative in loser (DFS order):

  ANNOUNCE: "Processing loser initiative: <id>"

  for each ADR in this initiative:
    if MIGRATE HIGH:
      → copy ADR file to winner's opensprint/ADRs/
      → log in manifest: "Migrated <id> (HIGH confidence, additive)"
    if MIGRATE LOW or CONFLICT:
      → PAUSE
      → present: loser content vs winner content, overlap/conflict explanation
      → ask operator: "Migrate as-is / Provide merged version / Drop"
      → record operator decision in manifest log
    if REDUNDANT:
      → log in manifest: "Skipped <id> (redundant with <winner-id>)"
    if SUPERSEDED:
      → log in manifest: "Dropped <id> (superseded by <winner-id>)"

  for each active opsx change in this initiative:
    (same dispatch as ADRs above)

  → record initiative outcome in manifest
  → proceed to next initiative
```

**Pause semantics**: Stop the DFS at any LOW/CONFLICT citizen until operator responds. Never advance or auto-resolve.

---

## Phase 5: Write Migration Manifest

After DFS completes, write `opensprint/abandoned/<loser-branch-slug>/migration-manifest.md` in the winner worktree per the reconciliation-migration-manifest spec:

```yaml
---
abandoned: <loser-branch-name>
winner: <winner-branch-name>
date: <YYYY-MM-DD>
operator: <git config user.name>
citizens-evaluated: <total>
citizens-migrated: <count>
citizens-dropped: <count>
---
```

Include:
- Context paragraph (why this universe was abandoned)
- Summary table
- Per-citizen records: migrated, dropped (CONFLICT), dropped (SUPERSEDED), skipped (REDUNDANT)
- Operator decision log (chronological record of every escalation and its resolution)
- Recovery notes

---

## Phase 6: Regenerate Surrogate Summary

1. Regenerate `opensprint/DECISION-MAP.md` in the winner to reflect any migrated ADRs.
2. Display migration summary:
   ```
   Abandon complete.
   Migrated:          <N> citizens
   Skipped:           <N> (redundant/superseded)
   Dropped:           <N> (operator chose not to migrate)
   Conflicts resolved: <N>
   Archive:           opensprint/abandoned/<name>/
   ```

---

## Phase 7: Operator Confirms Manifest

Display the written manifest and ask:
```
Migration manifest written. Does this look correct?
[Y] Yes, proceed to remove loser worktree   [N] I need to revise something
```

If operator says N: open a discussion to clarify what needs adjustment, edit the manifest, then re-confirm.

---

## Phase 8: Remove Loser Worktree

Only after manifest is confirmed:

1. `git worktree remove <loser-path>`
2. Optionally delete the loser branch (ask operator):
   ```
   Delete loser branch <name>? The archive preserves its snapshot.
   [Y] Yes, delete branch   [N] Keep branch ref
   ```

If the loser worktree has uncommitted code changes beyond the surrogate: warn and do NOT remove automatically. Operator must handle those first.

---

## Guardrails

- **Snapshot before migration** — write the verbatim snapshot BEFORE migrating any citizens
- **Manifest confirmed before worktree removal** — operator reviews and confirms manifest first
- **Read-only planning phase** — no writes until operator confirms plan
- **Bias toward escalation** — LOW confidence always escalates
- **Initiative as unit of commitment** — pause at initiative boundary on any unresolved conflict
- **Never modify the loser universe** — all writes (migration, archive, manifest) go to the winner
- **No automated invocation** — operator-only, no sub-agent calls
- **Recovery notes in manifest** — always include how to reverse if needed
