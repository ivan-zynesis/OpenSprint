---
name: "OPSP: Rebase"
description: Bring a source universe's work into the current universe — soft fork consensus resolution via DFS citizen reconciliation
category: Workflow
tags: [workflow, opsp, rebase, universe, reconciliation, surrogate]
---

Reconcile two parallel initiative universes by bringing the source universe's surrogate work into the current (target) universe. The source and target have diverged in their `opensprint/` surrogates (ADRs, driver-specs, initiatives). This skill merges them on a unified timeline — both bodies of work survive. The source branch becomes stale after completion.

**Analogy**: like a git soft fork resolving into a consensus chain. Not a hard fork — both histories merge into one.

**Input**: Specify the source worktree path or branch after `/opsp:rebase`.
Examples:
- `/opsp:rebase ../MyRepo-opsp-feature-x`
- `/opsp:rebase opsp/feature-x`

If omitted, available `opsp/*` branches are listed for selection.

---

Use the `opensprint-rebase` skill to execute this command.

ARGUMENTS: $ARGUMENTS
