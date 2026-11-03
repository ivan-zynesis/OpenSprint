---
id: parallel-universe-reconciliation
title: parallel-universe-reconciliation
state: completed
created: 2026-05-22
updated: 2026-11-03T15:30:12Z
branch: opsp/parallel-universe-reconciliation
---

Implement two new opsp-level skills that allow parallel initiative universes (git worktrees with independent surrogates) to be reconciled. `/opsp:rebase` brings one universe's work into another on a unified timeline (soft fork → consensus chain). `/opsp:abandon` declares a winner, migrates compatible citizens, and archives the loser (hard fork → one chain survives).

## Milestones

- [done] define-reconciliation-schemas: Define conflict manifest schema, citizen taxonomy, and migration-manifest.md format as OpenSpec specs
- [done] opsp-rebase-skill: Implement `/opsp:rebase` skill and command — planning phase, DFS traversal, conflict resolution loop, surrogate merge
- [done] opsp-abandon-skill: Implement `/opsp:abandon` skill and command — planning phase, DFS traversal, migration manifest, abandoned archive, worktree removal
- [done] opsp-rebase-abandon-tests: Integration tests covering clean merge, conflict escalation, and abandoned archive output

## History

- 2026-10-18T06:38:46Z  imported at completed from opensprint/initiatives/20260522-parallel-universe-reconciliation.md  by Ivan Lee
- 2026-11-03T15:30:12Z  resynced milestones from opensprint/initiatives/20260522-parallel-universe-reconciliation.md  by Ivan Lee
