# Decision Map

## Decision Tree

```
DS-HIGH-IMPACT-OPS (reliability)
├── DEC-002: When two universes diverge in their surrogates, how should conflicts be resolved
│   [root] [blast: 1]
│   └── DEC-004: How should high-impact reconciliation operations gate themselves before making c
│       [leaf] [blast: 0]
└── DEC-004: How should high-impact reconciliation operations gate themselves before making c
    [leaf] [blast: 0]

DS-LOOP-CLOSURE (architecture)
├── DEC-007: `compact` can detect open loops — a constraint with no decision, a decision with
│   [leaf] [blast: 0]
├── DEC-010: How does the system know a compiled view is current, and how is a stale view pre
│   [branch] [blast: 1]
│   └── DEC-011: When records change, should `compact` update the affected view sections incremen
│       [leaf] [blast: 0]
└── DEC-013: [[DS-LOOP-CLOSURE]] requires knowing whether a decision is guarded by a rule. Sh
    [root] [blast: 0]

DS-PARALLEL-EXEC (architecture)
└── DEC-001: How do parallel initiatives maintain independent surrogates without custom stora
    [root] [blast: 2]
    └── DEC-003: In what order should citizens be evaluated during universe reconciliation?
        [branch] [blast: 1]
        └── DEC-005: How should the loser universe be preserved after `/opsp:abandon` completes?
            [leaf] [blast: 0]

DS-SELF-USE-SCOPE (product)
└── DEC-017: OpenSprint has no graphical interface and ships no pipeline of its own. Is that 
    [root] [blast: 0]

DS-SME-OWNERSHIP (business)
├── DEC-006: The compacted per-hat surrogate is meant to be managed by the human with the sub
│   [root] [blast: 7]
│   ├── DEC-007: `compact` can detect open loops — a constraint with no decision, a decision with
│   │   [leaf] [blast: 0]
│   ├── DEC-008: A hat's charter states what it owns, what it may not trade away, and when it esc
│   │   [leaf] [blast: 0]
│   ├── DEC-009: A compiled view is a synthesis. How does a reader — human or agent — get from a 
│   │   [leaf] [blast: 0]
│   ├── DEC-010: How does the system know a compiled view is current, and how is a stale view pre
│   │   [branch] [blast: 1]
│   │   └── DEC-011: When records change, should `compact` update the affected view sections incremen
│   │       [leaf] [blast: 0]
│   ├── DEC-014: `architecture.md` is already a compiled view of the driver-specs and ADRs. Is it
│   │   [leaf] [blast: 0]
│   └── DEC-015: The point of compaction is that agents load the compacted surrogate instead of t
│       [leaf] [blast: 0]
└── DEC-008: A hat's charter states what it owns, what it may not trade away, and when it esc
    [leaf] [blast: 0]

DS-SQUAD-HATS (architecture)
├── DEC-006: The compacted per-hat surrogate is meant to be managed by the human with the sub
│   [root] [blast: 7]
│   ├── DEC-007: `compact` can detect open loops — a constraint with no decision, a decision with
│   │   [leaf] [blast: 0]
│   ├── DEC-008: A hat's charter states what it owns, what it may not trade away, and when it esc
│   │   [leaf] [blast: 0]
│   ├── DEC-009: A compiled view is a synthesis. How does a reader — human or agent — get from a 
│   │   [leaf] [blast: 0]
│   ├── DEC-010: How does the system know a compiled view is current, and how is a stale view pre
│   │   [branch] [blast: 1]
│   │   └── DEC-011: When records change, should `compact` update the affected view sections incremen
│   │       [leaf] [blast: 0]
│   ├── DEC-014: `architecture.md` is already a compiled view of the driver-specs and ADRs. Is it
│   │   [leaf] [blast: 0]
│   └── DEC-015: The point of compaction is that agents load the compacted surrogate instead of t
│       [leaf] [blast: 0]
└── DEC-016: [[DEC-012]] fixed exactly one hat per record and added a fifth `agreements` hat 
    [root] [blast: 0]

DS-SURROGATE-BUDGET (reliability)
├── DEC-009: A compiled view is a synthesis. How does a reader — human or agent — get from a 
│   [leaf] [blast: 0]
└── DEC-015: The point of compaction is that agents load the compacted surrogate instead of t
    [leaf] [blast: 0]
```

## Impact Summary

| Decision | Depth | Depends On | Downstream | Blast |
|----------|-------|------------|------------|-------|
| DEC-001 | 0 | DS-PARALLEL-EXEC | DEC-003 | 2 |
| DEC-002 | 0 | DS-HIGH-IMPACT-OPS | DEC-004 | 1 |
| DEC-006 | 0 | DS-SQUAD-HATS, DS-SME-OWNERSHIP | DEC-007, DEC-008, DEC-009, DEC-010, DEC-014, DEC-015 | 7 |
| DEC-013 | 0 | DS-LOOP-CLOSURE | — | 0 |
| DEC-016 | 0 | DS-SQUAD-HATS | — | 0 |
| DEC-017 | 0 | DS-SELF-USE-SCOPE | — | 0 |
| DEC-003 | 1 | DEC-001 | DEC-005 | 1 |
| DEC-004 | 1 | DS-HIGH-IMPACT-OPS, DEC-002 | — | 0 |
| DEC-007 | 1 | DS-LOOP-CLOSURE, DEC-006 | — | 0 |
| DEC-008 | 1 | DEC-006, DS-SME-OWNERSHIP | — | 0 |
| DEC-009 | 1 | DEC-006, DS-SURROGATE-BUDGET | — | 0 |
| DEC-010 | 1 | DEC-006, DS-LOOP-CLOSURE | DEC-011 | 1 |
| DEC-014 | 1 | DEC-006 | — | 0 |
| DEC-015 | 1 | DS-SURROGATE-BUDGET, DEC-006 | — | 0 |
| DEC-005 | 2 | DEC-003 | — | 0 |
| DEC-011 | 2 | DEC-010 | — | 0 |
