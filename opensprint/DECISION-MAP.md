# Decision Map

## Decision Tree

```
DS-PARALLEL-EXEC
└── DEC-001: Universes are git worktrees, surrogate stays in place
    └── DEC-003: DFS traversal order (initiative → ADRs → changes)
        └── DEC-005: Abandoned universe archive structure

DS-HIGH-IMPACT-OPS
├── DEC-002: Conflict resolution policy (agent reasons, operator confirms)
│   └── DEC-004: Mandatory planning phase before execution
└── DEC-004: Mandatory planning phase before execution ↑

DS-SQUAD-HATS
├── DEC-006: Hat views are compiled artifacts, never hand-edited
│   ├── DEC-007: Open loops are the backlog; explore → propose is the triage
│   ├── DEC-008: The charter compiles from governance records too
│   ├── DEC-009: Every compiled claim carries its record ids inline
│   ├── DEC-010: Two-state provenance manifest, enforced by --check
│   │   └── DEC-011: Recompile stale sections from full inputs
│   ├── DEC-014: compact is the single compile engine
│   └── DEC-015: v1 does not change what explore and apply load
└── DEC-012: Explicit primary-hat field; per-project hat registry

DS-SME-OWNERSHIP
├── DEC-006: Hat views are compiled artifacts, never hand-edited ↑
└── DEC-008: The charter compiles from governance records too ↑

DS-SURROGATE-BUDGET
├── DEC-009: Every compiled claim carries its record ids inline ↑
└── DEC-015: v1 does not change what explore and apply load ↑

DS-LOOP-CLOSURE
├── DEC-007: Open loops are the backlog; explore → propose is the triage ↑
├── DEC-010: Two-state provenance manifest, enforced by --check ↑
└── DEC-013: Rule links are harvested from code, not declared in records
```

`↑` marks a node shown in full under an earlier parent. A decision with several parents
appears under each of them.

## Impact Summary

| Decision | Depth | Depends On | Downstream | Blast |
|----------|-------|------------|------------|-------|
| DEC-001 | 0 | DS-PARALLEL-EXEC | 003, 005 | 2 |
| DEC-002 | 0 | DS-HIGH-IMPACT-OPS | 004 | 1 |
| DEC-006 | 0 | DS-SQUAD-HATS, DS-SME-OWNERSHIP | 007, 008, 009, 010, 011, 014, 015 | 7 |
| DEC-012 | 0 | DS-SQUAD-HATS | — | 0 |
| DEC-013 | 0 | DS-LOOP-CLOSURE | — | 0 |
| DEC-003 | 1 | DEC-001 | 005 | 1 |
| DEC-004 | 1 | DS-HIGH-IMPACT-OPS, DEC-002 | — | 0 |
| DEC-007 | 1 | DS-LOOP-CLOSURE, DEC-006 | — | 0 |
| DEC-008 | 1 | DEC-006, DS-SME-OWNERSHIP | — | 0 |
| DEC-009 | 1 | DEC-006, DS-SURROGATE-BUDGET | — | 0 |
| DEC-010 | 1 | DEC-006, DS-LOOP-CLOSURE | 011 | 1 |
| DEC-014 | 1 | DEC-006 | — | 0 |
| DEC-015 | 1 | DS-SURROGATE-BUDGET, DEC-006 | — | 0 |
| DEC-005 | 2 | DEC-003 | — | 0 |
| DEC-011 | 2 | DEC-010 | — | 0 |
