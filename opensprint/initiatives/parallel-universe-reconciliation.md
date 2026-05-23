---
id: parallel-universe-reconciliation
status: active
created: 2026-05-22
---

## Description

Implement two new opsp-level skills that allow parallel initiative universes (git worktrees with independent surrogates) to be reconciled. `/opsp:rebase` brings one universe's work into another on a unified timeline (soft fork → consensus chain). `/opsp:abandon` declares a winner, migrates compatible citizens, and archives the loser (hard fork → one chain survives).

## Driver Specs

- DS-PARALLEL-EXEC
- DS-HIGH-IMPACT-OPS

## ADRs

- DEC-001
- DEC-002
- DEC-003
- DEC-004
- DEC-005

## Milestones

- [x] define-reconciliation-schemas: Define conflict manifest schema, citizen taxonomy, and migration-manifest.md format as OpenSpec specs
- [x] opsp-rebase-skill: Implement `/opsp:rebase` skill and command — planning phase, DFS traversal, conflict resolution loop, surrogate merge
- [x] opsp-abandon-skill: Implement `/opsp:abandon` skill and command — planning phase, DFS traversal, migration manifest, abandoned archive, worktree removal
- [x] opsp-rebase-abandon-tests: Integration tests covering clean merge, conflict escalation, and abandoned archive output
