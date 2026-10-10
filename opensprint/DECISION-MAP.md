# Decision Map

## Decision Tree

```
DS-ATTEST-AS-REVIEW (product)
├── DEC-040: [[DEC-033]] excluded the entire implementation from the attester's context, on t
│   [branch] [blast: 1]
│   └── DEC-043: [[DEC-040]] puts test files in the attester's context. The agent that wrote thos
│       [leaf] [blast: 0]
├── DEC-041: [[DEC-019]] gives a measure four parts, and the harvest reports `measure-unasser
│   [leaf] [blast: 0]
└── DEC-042: [[DS-ATTEST-AS-REVIEW]] makes every attestation answer reversibility, blast radi
    [leaf] [blast: 0]

DS-ATTESTED-TRUTH (compliance)
├── DEC-021: [[DEC-009]] gives a compiled claim two possible citations: a record id where a d
│   [branch] [blast: 1]
│   └── DEC-031: `/opsp:compact` and `/opsp:archive` are separate operator-invoked tools that bot
│       [leaf] [blast: 0]
├── DEC-022: Attestation produces posture, evidence and exposure against a bar ([[DS-MEASURE-
│   [branch] [blast: 4]
│   ├── DEC-023: [[DS-SURROGATE-SCOPE]] places certification, change management and release manag
│   │   [branch] [blast: 1]
│   │   └── DEC-030: `/opsp:apply` currently ends by telling the operator to "merge the initiative br
│   │       [leaf] [blast: 0]
│   └── DEC-027: `/opsp:attest` writes posture, evidence and exposure into the `## Measures` sect
│       [branch] [blast: 1]
│       └── DEC-044: [[DEC-027]] bounds `/opsp:attest` to a record's `## Measures` and nothing else, 
│           [leaf] [blast: 0]
└── DEC-031: `/opsp:compact` and `/opsp:archive` are separate operator-invoked tools that bot
    [leaf] [blast: 0]

DS-BACKWARD-COMPAT (reliability)
├── DEC-018: [[DS-MAINTAINER-INHERITED]] establishes seven objectives for the `maintainer` ha
│   [root] [blast: 0]
└── DEC-019: [[DS-MEASURE-ANATOMY]] gives every measure four parts. Where do bar, posture, ev
    [root] [blast: 3]
    ├── DEC-032: [[DEC-019]] gives a measure an `### Evidence` block. What may go in it, and how 
    │   [leaf] [blast: 0]
    ├── DEC-038: [[DEC-019]] gives a measure a `### Bar` block, and [[DS-CI-ATTESTATION]] require
    │   [leaf] [blast: 0]
    └── DEC-041: [[DEC-019]] gives a measure four parts, and the harvest reports `measure-unasser
        [leaf] [blast: 0]

DS-CI-ATTESTATION (reliability)
├── DEC-032: [[DEC-019]] gives a measure an `### Evidence` block. What may go in it, and how 
│   [leaf] [blast: 0]
├── DEC-033: [[DS-HATS-AS-CONTEXT]] says most hats are worn by the same engineer, so attestat
│   [root] [blast: 2]
│   └── DEC-040: [[DEC-033]] excluded the entire implementation from the attester's context, on t
│       [branch] [blast: 1]
│       └── DEC-043: [[DEC-040]] puts test files in the attester's context. The agent that wrote thos
│           [leaf] [blast: 0]
└── DEC-038: [[DEC-019]] gives a measure a `### Bar` block, and [[DS-CI-ATTESTATION]] require
    [leaf] [blast: 0]

DS-DOCUMENTATION-REVIEWED (product)
└── DEC-044: [[DEC-027]] bounds `/opsp:attest` to a record's `## Measures` and nothing else, 
    [leaf] [blast: 0]

DS-FORWARD-CLOSURE (product)
└── DEC-026: Tracking initiative and milestone state in practice required an in-repo board. [
    [leaf] [blast: 0]

DS-HATS-AS-CONTEXT (architecture)
├── DEC-033: [[DS-HATS-AS-CONTEXT]] says most hats are worn by the same engineer, so attestat
│   [root] [blast: 2]
│   └── DEC-040: [[DEC-033]] excluded the entire implementation from the attester's context, on t
│       [branch] [blast: 1]
│       └── DEC-043: [[DEC-040]] puts test files in the attester's context. The agent that wrote thos
│           [leaf] [blast: 0]
├── DEC-034: [[DEC-025]] narrowed explore's guardrail from "no artifacts" to "the initiative 
│   [root] [blast: 1]
│   └── DEC-039: [[DEC-034]] adds `/opsp:backlog`, so a backlog item exists holding an Objective 
│       [leaf] [blast: 0]
└── DEC-043: [[DEC-040]] puts test files in the attester's context. The agent that wrote thos
    [leaf] [blast: 0]

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
│   [branch] [blast: 6]
│   ├── DEC-011: When records change, should `compact` update the affected view sections incremen
│   │   [leaf] [blast: 0]
│   ├── DEC-024: [[DS-PROGRESSIVE-CRYSTALLIZATION]] gives an initiative a state that tracks how f
│   │   [branch] [blast: 3]
│   │   ├── DEC-035: [[DEC-024]] runs an initiative `exploring -> proposed -> building -> attested ->
│   │   │   [leaf] [blast: 0]
│   │   ├── DEC-036: Driver-specs use semantic ids (`DS-BACKWARD-COMPAT`); changes use semantic direc
│   │   │   [leaf] [blast: 0]
│   │   └── DEC-042: [[DS-ATTEST-AS-REVIEW]] makes every attestation answer reversibility, blast radi
│   │       [leaf] [blast: 0]
│   └── DEC-030: `/opsp:apply` currently ends by telling the operator to "merge the initiative br
│       [leaf] [blast: 0]
└── DEC-013: [[DS-LOOP-CLOSURE]] requires knowing whether a decision is guarded by a rule. Sh
    [root] [blast: 0]

DS-MAINTAINER-INHERITED (architecture)
├── DEC-018: [[DS-MAINTAINER-INHERITED]] establishes seven objectives for the `maintainer` ha
│   [root] [blast: 0]
└── DEC-037: [[DS-MAINTAINER-INHERITED]] gives each objective a Strategy cell, and [[DEC-020]
    [leaf] [blast: 0]

DS-MEASURE-ANATOMY (product)
├── DEC-019: [[DS-MEASURE-ANATOMY]] gives every measure four parts. Where do bar, posture, ev
│   [root] [blast: 3]
│   ├── DEC-032: [[DEC-019]] gives a measure an `### Evidence` block. What may go in it, and how 
│   │   [leaf] [blast: 0]
│   ├── DEC-038: [[DEC-019]] gives a measure a `### Bar` block, and [[DS-CI-ATTESTATION]] require
│   │   [leaf] [blast: 0]
│   └── DEC-041: [[DEC-019]] gives a measure four parts, and the harvest reports `measure-unasser
│       [leaf] [blast: 0]
└── DEC-038: [[DEC-019]] gives a measure a `### Bar` block, and [[DS-CI-ATTESTATION]] require
    [leaf] [blast: 0]

DS-PARALLEL-EXEC (architecture)
├── DEC-001: How do parallel initiatives maintain independent surrogates without custom stora
│   [root] [blast: 4]
│   ├── DEC-003: In what order should citizens be evaluated during universe reconciliation?
│   │   [branch] [blast: 1]
│   │   └── DEC-005: How should the loser universe be preserved after `/opsp:abandon` completes?
│   │       [leaf] [blast: 0]
│   ├── DEC-029: [[DEC-001]] puts `opensprint/` in the branch, so it travels with the code. Backl
│   │   [leaf] [blast: 0]
│   └── DEC-036: Driver-specs use semantic ids (`DS-BACKWARD-COMPAT`); changes use semantic direc
│       [leaf] [blast: 0]
└── DEC-036: Driver-specs use semantic ids (`DS-BACKWARD-COMPAT`); changes use semantic direc
    [leaf] [blast: 0]

DS-PROGRESSIVE-CRYSTALLIZATION (product)
├── DEC-024: [[DS-PROGRESSIVE-CRYSTALLIZATION]] gives an initiative a state that tracks how f
│   [branch] [blast: 3]
│   ├── DEC-035: [[DEC-024]] runs an initiative `exploring -> proposed -> building -> attested ->
│   │   [leaf] [blast: 0]
│   ├── DEC-036: Driver-specs use semantic ids (`DS-BACKWARD-COMPAT`); changes use semantic direc
│   │   [leaf] [blast: 0]
│   └── DEC-042: [[DS-ATTEST-AS-REVIEW]] makes every attestation answer reversibility, blast radi
│       [leaf] [blast: 0]
├── DEC-034: [[DEC-025]] narrowed explore's guardrail from "no artifacts" to "the initiative 
│   [root] [blast: 1]
│   └── DEC-039: [[DEC-034]] adds `/opsp:backlog`, so a backlog item exists holding an Objective 
│       [leaf] [blast: 0]
├── DEC-035: [[DEC-024]] runs an initiative `exploring -> proposed -> building -> attested ->
│   [leaf] [blast: 0]
├── DEC-036: Driver-specs use semantic ids (`DS-BACKWARD-COMPAT`); changes use semantic direc
│   [leaf] [blast: 0]
└── DEC-039: [[DEC-034]] adds `/opsp:backlog`, so a backlog item exists holding an Objective 
    [leaf] [blast: 0]

DS-SELF-USE-SCOPE (product)
└── DEC-017: OpenSprint has no graphical interface and ships no pipeline of its own. Is that 
    [root] [blast: 0]

DS-SME-OWNERSHIP (business)
├── DEC-006: The compacted per-hat surrogate is meant to be managed by the human with the sub
│   [root] [blast: 21]
│   ├── DEC-007: `compact` can detect open loops — a constraint with no decision, a decision with
│   │   [leaf] [blast: 0]
│   ├── DEC-008: A hat's charter states what it owns, what it may not trade away, and when it esc
│   │   [leaf] [blast: 0]
│   ├── DEC-009: A compiled view is a synthesis. How does a reader — human or agent — get from a 
│   │   [branch] [blast: 4]
│   │   ├── DEC-020: [[DS-STRATEGY-ALTITUDE]] requires maintainer strategies to stay above domain kno
│   │   │   [branch] [blast: 1]
│   │   │   └── DEC-037: [[DS-MAINTAINER-INHERITED]] gives each objective a Strategy cell, and [[DEC-020]
│   │   │       [leaf] [blast: 0]
│   │   └── DEC-021: [[DEC-009]] gives a compiled claim two possible citations: a record id where a d
│   │       [branch] [blast: 1]
│   │       └── DEC-031: `/opsp:compact` and `/opsp:archive` are separate operator-invoked tools that bot
│   │           [leaf] [blast: 0]
│   ├── DEC-010: How does the system know a compiled view is current, and how is a stale view pre
│   │   [branch] [blast: 6]
│   │   ├── DEC-011: When records change, should `compact` update the affected view sections incremen
│   │   │   [leaf] [blast: 0]
│   │   ├── DEC-024: [[DS-PROGRESSIVE-CRYSTALLIZATION]] gives an initiative a state that tracks how f
│   │   │   [branch] [blast: 3]
│   │   │   ├── DEC-035: [[DEC-024]] runs an initiative `exploring -> proposed -> building -> attested ->
│   │   │   │   [leaf] [blast: 0]
│   │   │   ├── DEC-036: Driver-specs use semantic ids (`DS-BACKWARD-COMPAT`); changes use semantic direc
│   │   │   │   [leaf] [blast: 0]
│   │   │   └── DEC-042: [[DS-ATTEST-AS-REVIEW]] makes every attestation answer reversibility, blast radi
│   │   │       [leaf] [blast: 0]
│   │   └── DEC-030: `/opsp:apply` currently ends by telling the operator to "merge the initiative br
│   │       [leaf] [blast: 0]
│   ├── DEC-014: `architecture.md` is already a compiled view of the driver-specs and ADRs. Is it
│   │   [branch] [blast: 7]
│   │   ├── DEC-022: Attestation produces posture, evidence and exposure against a bar ([[DS-MEASURE-
│   │   │   [branch] [blast: 4]
│   │   │   ├── DEC-023: [[DS-SURROGATE-SCOPE]] places certification, change management and release manag
│   │   │   │   [branch] [blast: 1]
│   │   │   │   └── DEC-030: `/opsp:apply` currently ends by telling the operator to "merge the initiative br
│   │   │   │       [leaf] [blast: 0]
│   │   │   └── DEC-027: `/opsp:attest` writes posture, evidence and exposure into the `## Measures` sect
│   │   │       [branch] [blast: 1]
│   │   │       └── DEC-044: [[DEC-027]] bounds `/opsp:attest` to a record's `## Measures` and nothing else, 
│   │   │           [leaf] [blast: 0]
│   │   ├── DEC-026: Tracking initiative and milestone state in practice required an in-repo board. [
│   │   │   [leaf] [blast: 0]
│   │   └── DEC-031: `/opsp:compact` and `/opsp:archive` are separate operator-invoked tools that bot
│   │       [leaf] [blast: 0]
│   ├── DEC-015: The point of compaction is that agents load the compacted surrogate instead of t
│   │   [leaf] [blast: 0]
│   ├── DEC-022: Attestation produces posture, evidence and exposure against a bar ([[DS-MEASURE-
│   │   [branch] [blast: 4]
│   │   ├── DEC-023: [[DS-SURROGATE-SCOPE]] places certification, change management and release manag
│   │   │   [branch] [blast: 1]
│   │   │   └── DEC-030: `/opsp:apply` currently ends by telling the operator to "merge the initiative br
│   │   │       [leaf] [blast: 0]
│   │   └── DEC-027: `/opsp:attest` writes posture, evidence and exposure into the `## Measures` sect
│   │       [branch] [blast: 1]
│   │       └── DEC-044: [[DEC-027]] bounds `/opsp:attest` to a record's `## Measures` and nothing else, 
│   │           [leaf] [blast: 0]
│   └── DEC-027: `/opsp:attest` writes posture, evidence and exposure into the `## Measures` sect
│       [branch] [blast: 1]
│       └── DEC-044: [[DEC-027]] bounds `/opsp:attest` to a record's `## Measures` and nothing else, 
│           [leaf] [blast: 0]
└── DEC-008: A hat's charter states what it owns, what it may not trade away, and when it esc
    [leaf] [blast: 0]

DS-SQUAD-HATS (architecture)
├── DEC-006: The compacted per-hat surrogate is meant to be managed by the human with the sub
│   [root] [blast: 21]
│   ├── DEC-007: `compact` can detect open loops — a constraint with no decision, a decision with
│   │   [leaf] [blast: 0]
│   ├── DEC-008: A hat's charter states what it owns, what it may not trade away, and when it esc
│   │   [leaf] [blast: 0]
│   ├── DEC-009: A compiled view is a synthesis. How does a reader — human or agent — get from a 
│   │   [branch] [blast: 4]
│   │   ├── DEC-020: [[DS-STRATEGY-ALTITUDE]] requires maintainer strategies to stay above domain kno
│   │   │   [branch] [blast: 1]
│   │   │   └── DEC-037: [[DS-MAINTAINER-INHERITED]] gives each objective a Strategy cell, and [[DEC-020]
│   │   │       [leaf] [blast: 0]
│   │   └── DEC-021: [[DEC-009]] gives a compiled claim two possible citations: a record id where a d
│   │       [branch] [blast: 1]
│   │       └── DEC-031: `/opsp:compact` and `/opsp:archive` are separate operator-invoked tools that bot
│   │           [leaf] [blast: 0]
│   ├── DEC-010: How does the system know a compiled view is current, and how is a stale view pre
│   │   [branch] [blast: 6]
│   │   ├── DEC-011: When records change, should `compact` update the affected view sections incremen
│   │   │   [leaf] [blast: 0]
│   │   ├── DEC-024: [[DS-PROGRESSIVE-CRYSTALLIZATION]] gives an initiative a state that tracks how f
│   │   │   [branch] [blast: 3]
│   │   │   ├── DEC-035: [[DEC-024]] runs an initiative `exploring -> proposed -> building -> attested ->
│   │   │   │   [leaf] [blast: 0]
│   │   │   ├── DEC-036: Driver-specs use semantic ids (`DS-BACKWARD-COMPAT`); changes use semantic direc
│   │   │   │   [leaf] [blast: 0]
│   │   │   └── DEC-042: [[DS-ATTEST-AS-REVIEW]] makes every attestation answer reversibility, blast radi
│   │   │       [leaf] [blast: 0]
│   │   └── DEC-030: `/opsp:apply` currently ends by telling the operator to "merge the initiative br
│   │       [leaf] [blast: 0]
│   ├── DEC-014: `architecture.md` is already a compiled view of the driver-specs and ADRs. Is it
│   │   [branch] [blast: 7]
│   │   ├── DEC-022: Attestation produces posture, evidence and exposure against a bar ([[DS-MEASURE-
│   │   │   [branch] [blast: 4]
│   │   │   ├── DEC-023: [[DS-SURROGATE-SCOPE]] places certification, change management and release manag
│   │   │   │   [branch] [blast: 1]
│   │   │   │   └── DEC-030: `/opsp:apply` currently ends by telling the operator to "merge the initiative br
│   │   │   │       [leaf] [blast: 0]
│   │   │   └── DEC-027: `/opsp:attest` writes posture, evidence and exposure into the `## Measures` sect
│   │   │       [branch] [blast: 1]
│   │   │       └── DEC-044: [[DEC-027]] bounds `/opsp:attest` to a record's `## Measures` and nothing else, 
│   │   │           [leaf] [blast: 0]
│   │   ├── DEC-026: Tracking initiative and milestone state in practice required an in-repo board. [
│   │   │   [leaf] [blast: 0]
│   │   └── DEC-031: `/opsp:compact` and `/opsp:archive` are separate operator-invoked tools that bot
│   │       [leaf] [blast: 0]
│   ├── DEC-015: The point of compaction is that agents load the compacted surrogate instead of t
│   │   [leaf] [blast: 0]
│   ├── DEC-022: Attestation produces posture, evidence and exposure against a bar ([[DS-MEASURE-
│   │   [branch] [blast: 4]
│   │   ├── DEC-023: [[DS-SURROGATE-SCOPE]] places certification, change management and release manag
│   │   │   [branch] [blast: 1]
│   │   │   └── DEC-030: `/opsp:apply` currently ends by telling the operator to "merge the initiative br
│   │   │       [leaf] [blast: 0]
│   │   └── DEC-027: `/opsp:attest` writes posture, evidence and exposure into the `## Measures` sect
│   │       [branch] [blast: 1]
│   │       └── DEC-044: [[DEC-027]] bounds `/opsp:attest` to a record's `## Measures` and nothing else, 
│   │           [leaf] [blast: 0]
│   └── DEC-027: `/opsp:attest` writes posture, evidence and exposure into the `## Measures` sect
│       [branch] [blast: 1]
│       └── DEC-044: [[DEC-027]] bounds `/opsp:attest` to a record's `## Measures` and nothing else, 
│           [leaf] [blast: 0]
├── DEC-016: [[DEC-012]] fixed exactly one hat per record and added a fifth `agreements` hat 
│   [root] [blast: 1]
│   └── DEC-028: [[DEC-016]] lets a record declare several hats. Applied to decisions, that lets 
│       [leaf] [blast: 0]
└── DEC-028: [[DEC-016]] lets a record declare several hats. Applied to decisions, that lets 
    [leaf] [blast: 0]

DS-STRATEGY-ALTITUDE (product)
└── DEC-020: [[DS-STRATEGY-ALTITUDE]] requires maintainer strategies to stay above domain kno
    [branch] [blast: 1]
    └── DEC-037: [[DS-MAINTAINER-INHERITED]] gives each objective a Strategy cell, and [[DEC-020]
        [leaf] [blast: 0]

DS-SURROGATE-BUDGET (reliability)
├── DEC-009: A compiled view is a synthesis. How does a reader — human or agent — get from a 
│   [branch] [blast: 4]
│   ├── DEC-020: [[DS-STRATEGY-ALTITUDE]] requires maintainer strategies to stay above domain kno
│   │   [branch] [blast: 1]
│   │   └── DEC-037: [[DS-MAINTAINER-INHERITED]] gives each objective a Strategy cell, and [[DEC-020]
│   │       [leaf] [blast: 0]
│   └── DEC-021: [[DEC-009]] gives a compiled claim two possible citations: a record id where a d
│       [branch] [blast: 1]
│       └── DEC-031: `/opsp:compact` and `/opsp:archive` are separate operator-invoked tools that bot
│           [leaf] [blast: 0]
└── DEC-015: The point of compaction is that agents load the compacted surrogate instead of t
    [leaf] [blast: 0]

DS-SURROGATE-GIT-CONTRACT (architecture)
├── DEC-029: [[DEC-001]] puts `opensprint/` in the branch, so it travels with the code. Backl
│   [leaf] [blast: 0]
└── DEC-030: `/opsp:apply` currently ends by telling the operator to "merge the initiative br
    [leaf] [blast: 0]

DS-SURROGATE-SCOPE (product)
└── DEC-023: [[DS-SURROGATE-SCOPE]] places certification, change management and release manag
    [branch] [blast: 1]
    └── DEC-030: `/opsp:apply` currently ends by telling the operator to "merge the initiative br
        [leaf] [blast: 0]
```

## Impact Summary

| Decision | Depth | Depends On | Downstream | Blast |
|----------|-------|------------|------------|-------|
| DEC-001 | 0 | DS-PARALLEL-EXEC | DEC-003, DEC-029, DEC-036 | 4 |
| DEC-002 | 0 | DS-HIGH-IMPACT-OPS | DEC-004 | 1 |
| DEC-006 | 0 | DS-SQUAD-HATS, DS-SME-OWNERSHIP | DEC-007, DEC-008, DEC-009, DEC-010, DEC-014, DEC-015, DEC-022, DEC-027 | 21 |
| DEC-013 | 0 | DS-LOOP-CLOSURE | — | 0 |
| DEC-016 | 0 | DS-SQUAD-HATS | DEC-028 | 1 |
| DEC-017 | 0 | DS-SELF-USE-SCOPE | — | 0 |
| DEC-018 | 0 | DS-MAINTAINER-INHERITED, DS-BACKWARD-COMPAT | — | 0 |
| DEC-019 | 0 | DS-MEASURE-ANATOMY, DS-BACKWARD-COMPAT | DEC-032, DEC-038, DEC-041 | 3 |
| DEC-033 | 0 | DS-HATS-AS-CONTEXT, DS-CI-ATTESTATION | DEC-040 | 2 |
| DEC-034 | 0 | DS-PROGRESSIVE-CRYSTALLIZATION, DS-HATS-AS-CONTEXT | DEC-039 | 1 |
| DEC-003 | 1 | DEC-001 | DEC-005 | 1 |
| DEC-004 | 1 | DS-HIGH-IMPACT-OPS, DEC-002 | — | 0 |
| DEC-007 | 1 | DS-LOOP-CLOSURE, DEC-006 | — | 0 |
| DEC-008 | 1 | DEC-006, DS-SME-OWNERSHIP | — | 0 |
| DEC-009 | 1 | DEC-006, DS-SURROGATE-BUDGET | DEC-020, DEC-021 | 4 |
| DEC-010 | 1 | DEC-006, DS-LOOP-CLOSURE | DEC-011, DEC-024, DEC-030 | 6 |
| DEC-014 | 1 | DEC-006 | DEC-022, DEC-026, DEC-031 | 7 |
| DEC-015 | 1 | DS-SURROGATE-BUDGET, DEC-006 | — | 0 |
| DEC-028 | 1 | DS-SQUAD-HATS, DEC-016 | — | 0 |
| DEC-029 | 1 | DS-SURROGATE-GIT-CONTRACT, DEC-001 | — | 0 |
| DEC-032 | 1 | DS-CI-ATTESTATION, DEC-019 | — | 0 |
| DEC-038 | 1 | DS-MEASURE-ANATOMY, DS-CI-ATTESTATION, DEC-019 | — | 0 |
| DEC-039 | 1 | DS-PROGRESSIVE-CRYSTALLIZATION, DEC-034 | — | 0 |
| DEC-040 | 1 | DS-ATTEST-AS-REVIEW, DEC-033 | DEC-043 | 1 |
| DEC-041 | 1 | DS-ATTEST-AS-REVIEW, DEC-019 | — | 0 |
| DEC-005 | 2 | DEC-003 | — | 0 |
| DEC-011 | 2 | DEC-010 | — | 0 |
| DEC-020 | 2 | DS-STRATEGY-ALTITUDE, DEC-009 | DEC-037 | 1 |
| DEC-021 | 2 | DS-ATTESTED-TRUTH, DEC-009 | DEC-031 | 1 |
| DEC-022 | 2 | DS-ATTESTED-TRUTH, DEC-014, DEC-006 | DEC-023, DEC-027 | 4 |
| DEC-024 | 2 | DS-PROGRESSIVE-CRYSTALLIZATION, DEC-010 | DEC-035, DEC-036, DEC-042 | 3 |
| DEC-026 | 2 | DS-FORWARD-CLOSURE, DEC-014 | — | 0 |
| DEC-036 | 2 | DS-PARALLEL-EXEC, DS-PROGRESSIVE-CRYSTALLIZATION, DEC-001, DEC-024 | — | 0 |
| DEC-042 | 2 | DS-ATTEST-AS-REVIEW, DEC-024 | — | 0 |
| DEC-043 | 2 | DS-HATS-AS-CONTEXT, DEC-040 | — | 0 |
| DEC-044 | 2 | DS-DOCUMENTATION-REVIEWED, DEC-027 | — | 0 |
| DEC-023 | 3 | DS-SURROGATE-SCOPE, DEC-022 | DEC-030 | 1 |
| DEC-027 | 3 | DEC-022, DEC-006 | DEC-044 | 1 |
| DEC-031 | 3 | DS-ATTESTED-TRUTH, DEC-014, DEC-021 | — | 0 |
| DEC-035 | 3 | DS-PROGRESSIVE-CRYSTALLIZATION, DEC-024 | — | 0 |
| DEC-037 | 3 | DS-MAINTAINER-INHERITED, DEC-020 | — | 0 |
| DEC-030 | 4 | DS-SURROGATE-GIT-CONTRACT, DEC-023, DEC-010 | — | 0 |
