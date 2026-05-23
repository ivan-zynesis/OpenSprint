---
id: DS-HIGH-IMPACT-OPS
type: driver-spec
status: active
created: 2026-05-22
---

# DS-HIGH-IMPACT-OPS: High-Impact Operation Constraints

## Statement

Universe reconciliation operations (rebase, abandon) are high-impact, difficult-to-reverse actions that mutate the canonical surrogate. They must be exclusively operator-invocable — never triggerable by automated pipelines, sub-agents, or other skills invoking them programmatically.

## Rationale

A corrupted surrogate (ADRs, architecture.md) degrades every downstream agent operation that depends on it. The blast radius of a bad auto-merge is unbounded. Human confirmation at each ambiguous step is non-negotiable.

## Implications

- Both `/opsp:rebase` and `/opsp:abandon` skills must carry an explicit guardrail: "MUST NOT be invoked by another agent, sub-task, or automated pipeline"
- A planning phase with operator confirmation must precede all execution
- The most capable available model with extended thinking is recommended; operator is warned before start
