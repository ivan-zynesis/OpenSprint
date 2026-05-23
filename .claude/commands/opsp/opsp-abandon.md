---
name: "OPSP: Abandon"
description: Declare the current universe the winner — migrate compatible citizens from the loser, archive it, remove its worktree
category: Workflow
tags: [workflow, opsp, abandon, universe, hard-fork, reconciliation, surrogate]
---

Declare the current (winner) universe victorious in a hard fork. The loser universe's compatible citizens are migrated in, the loser's full `opensprint/` is archived as a permanent record, and its worktree is removed.

**Analogy**: a blockchain hard fork where one chain wins. The loser chain stops producing blocks, but its history is preserved in `opensprint/abandoned/`.

**This is a one-way operation.** The loser worktree is removed after the migration manifest is confirmed. Recovery is possible via the snapshot in `opensprint/abandoned/<name>/snapshot/`, but requires manual effort.

**Input**: Specify the loser worktree path or branch after `/opsp:abandon`.
Examples:
- `/opsp:abandon ../MyRepo-opsp-v1-architecture`
- `/opsp:abandon opsp/v1-architecture`

If omitted, available `opsp/*` branches are listed for selection.

---

Use the `opensprint-abandon` skill to execute this command.

ARGUMENTS: $ARGUMENTS
