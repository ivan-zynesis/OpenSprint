## Context

`DEC-020` decides that a maintainer strategy cites its implementers rather than describing them, and that `DEC-009`'s citation requirement is what enforces the altitude. It also calls for `strategy-unimplemented`.

## Goals / Non-Goals

**Goals**
- Report a strategy with nothing descending from it
- State the altitude rule in the rendering contract

**Non-Goals**
- Any guard on prose content — explicitly rejected in `DEC-020`
- SWOT rendering of the strategy cell — that is `DEC-037`, in `sdlc-operating-contract`
- Changing `DEC-009` — it already does the work

## Decisions

### The rule is hat-agnostic

`DEC-020`'s text says "a maintainer strategy". Implementing it that way would hardcode a hat name, and `DS-SQUAD-HATS` makes the hat set a property of the project rather than of the tool — a project with a `platform` hat holding strategies would be silently exempt.

So the rule reads: **a driver-spec whose roles include `strategy`, with no active decision descending from it.** `DEC-028` makes every decision owned by `dev` or `devops`, so any descending decision is by definition an implementing one. No hat name appears in the code.

### Descent is transitive

`constraint-unanswered` asks whether a decision names the driver-spec in `depends-on` directly. That is too strict here: a strategy is frequently answered by a decision that is itself the parent of the one doing the work, and the existing `constraint-unasserted` already reasons transitively for exactly this reason — *"Measured on cashier, only 4 of 17 driver-specs are cited by a test directly, yet DS-MULTI-TENANT-ISOLATION is fully guarded."*

The walk goes from each decision up through `depends-on` to its driver-spec roots, guarding against cycles the way `defaultHatsForDecision` already does.

### Why `constraint-unanswered` does not already cover this

It does not distinguish *what* a child decision answers. A strategy with one child decision satisfies `constraint-unanswered` even when that decision implements a different strategy that happens to share an ancestor. More importantly it fires on **every** driver-spec, so a strategy is lost among goals and objectives — and only a strategy promises an approach that something should implement.

## Risks / Trade-offs

**Loop counts rise again.** Most strategies on this repository have no descending decision, because they were recorded during planning and the work has not been done. That is accurate rather than noisy, and `DEC-023` keeps it reported rather than gated.

**Transitive descent can over-credit.** A strategy with a distant descendant counts as implemented even if that descendant addresses a sibling concern. Accepted for consistency: `constraint-unasserted` makes exactly this trade, and the alternative — requiring direct descent — would report gaps that are not gaps.

## Migration Plan

None. The rule is additive and reports against existing records.

## Open Questions

None. Whether the strategy cell renders SWOT is settled in `DEC-037` and belongs to a later initiative.
