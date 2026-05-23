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
└── DEC-004: Mandatory planning phase before execution
```

## Impact Summary

| Decision | Depth | Depends On | Downstream | Blast |
|----------|-------|------------|------------|-------|
| DEC-001 | 1 | DS-PARALLEL-EXEC | DEC-003 | Medium |
| DEC-002 | 1 | DS-HIGH-IMPACT-OPS | DEC-004 | High |
| DEC-003 | 2 | DEC-001 | DEC-005 | High |
| DEC-004 | 2 | DS-HIGH-IMPACT-OPS, DEC-002 | — | High |
| DEC-005 | 3 | DEC-003 | — | Medium |
