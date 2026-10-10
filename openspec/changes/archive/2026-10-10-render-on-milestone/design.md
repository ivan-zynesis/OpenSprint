## Context

`DEC-COMPILE-ON-MILESTONE` decides both the compile and the offer. `DEC-SCOPED-SEAL` made scoped sealing possible, which this depends on.

## Goals / Non-Goals

**Goals**
- A plan filterable by hat
- A compile step at each milestone boundary, bounded to dev and devops
- An offer for product and maintainer that is a context switch

**Non-Goals**
- Compiling product or maintainer silently
- Changing archive
- Gating anything on view freshness

## Decisions

### `plan --hat` mirrors `seal --hat`

The apply skill needs one question answered — *which dev and devops sections are stale* — and
filtering in the tool is clearer than filtering in prose. Symmetry with `seal --hat` also means the
two commands that bracket a compile take the same argument, which is one fewer thing to remember.

An unknown hat warns and is ignored, as in `seal`.

### The offer names the hat, and accepting switches context

The prompt is not *"recompile product/goals?"* but *"compiling it means putting on the product
hat"*. That phrasing is load-bearing: it is the moment the operator decides which accountability
they are exercising, and `DS-HATS-AS-CONTEXT` makes that a real act rather than a formality.

Accepting means the agent **drops what it is holding** — the diff, the test output, the escalation
it just resolved — loads the product records, compiles, and returns. An offer accepted while still
holding the implementation produces exactly the dev-flavoured product prose the rule exists to
prevent, and would be worse than leaving the view stale, because staleness is at least reported.

### Declining is a complete answer

A declined offer leaves the view stale, which `compact plan` continues to report and archive will
compile. Nothing is lost and nothing is hidden.

## Risks / Trade-offs

**The offer may be accepted reflexively.** The instructions make the context switch explicit and the
decision records the fallback, but code cannot verify that an agent cleared its context. This is
enforcement by instruction, acknowledged, and the same limitation `DEC-043` accepts for attestation.

**Compiling at every milestone costs render time.** Bounded by per-section staleness, so the cost is
proportional to what actually changed rather than to the number of milestones.

## Migration Plan

None. A project that never reaches a milestone boundary is unaffected; archive still compiles
everything.

## Open Questions

None blocking.
