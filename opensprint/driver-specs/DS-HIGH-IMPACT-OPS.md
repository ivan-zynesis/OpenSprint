---
id: DS-HIGH-IMPACT-OPS
type: reliability
status: active
created: 2026-05-22
hats: [maintainer]
role: strategy
objective: integrity-correctness
---

# DS-HIGH-IMPACT-OPS: High-Impact Operation Constraints

## Statement

Universe reconciliation operations (rebase, abandon) are high-impact, difficult-to-reverse actions that mutate the canonical surrogate. They must be exclusively operator-invocable — never triggerable by automated pipelines, sub-agents, or other skills invoking them programmatically.

## Rationale

A corrupted surrogate (ADRs, architecture.md) degrades every downstream agent operation that depends on it. The blast radius of a bad auto-merge is unbounded. Human confirmation at each ambiguous step is non-negotiable.

## Measures

- **Primary**: no operation that mutates the canonical surrogate is reachable from a pipeline, a sub-agent or another skill

### Bar

- **dimension**: automation ←→ human confirmation, on operations that mutate the canonical surrogate
- **chosen**: fully manual — `/opsp:rebase` and `/opsp:abandon` are operator-invocable only
- **traded for**: every scrap of automation on these two operations, permanently
- **neighbour**: unrecorded — nothing says what a partially-automated reconciliation would look like or cost

### Posture

Stated as absolute rather than as a preference. [[DEC-006]] releases compaction from this bar: compact never writes a record and every view regenerates, so it cannot corrupt the surrogate and carries no operator-only guardrail.

### Exposure

A corrupted surrogate degrades every downstream agent operation, and the damage is unbounded. A false escalation costs one prompt; a false auto-accept costs the surrogate ([[DEC-002]]).

## Implications

- Both `/opsp:rebase` and `/opsp:abandon` skills must carry an explicit guardrail: "MUST NOT be invoked by another agent, sub-task, or automated pipeline"
- A planning phase with operator confirmation must precede all execution
- The most capable available model with extended thinking is recommended; operator is warned before start
