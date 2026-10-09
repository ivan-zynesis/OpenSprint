## Why

Milestone 3 of `lifecycle-beyond-build`, and the smallest of the three shape milestones — because `DEC-020` found that the altitude rule needs no new enforcement.

`DS-STRATEGY-ALTITUDE` requires a maintainer strategy to state a **position**, never a **mechanism**: domain know-how belongs to `dev` and `devops`, and the audience for the compiled view is senior management. The obvious implementation is a guard on prose, which would be a heuristic on length or vocabulary — exactly the pattern matching this codebase avoids.

It is unnecessary. `DEC-009` already requires every compiled claim to cite a record id or a path, and know-how written into a maintainer strategy cell has no maintainer record behind it to cite. **The altitude enforces itself through a rule that already exists.**

What is genuinely missing is the inverse. A stated strategy with nothing descending from it is intent nobody built, and today it is invisible: `constraint-unanswered` is satisfied by any child decision, even one implementing something else, and `constraint-unasserted` only asks whether a rule cites that child.

## What Changes

- New harvest rule `strategy-unimplemented` — a driver-spec whose roles include `strategy` with no active decision descending from it
- Descent is **transitive**, matching how `constraint-unasserted` already reasons about coverage
- The `/opsp:compact` rendering contract gains the altitude rule: a strategy cell renders the position plus a citation, never the mechanism

## Capabilities

### Modified Capabilities
- `opsp-rule-harvesting`: a strategy nobody implemented is reported
- `opsp-compact-skill`: the rendering contract states the strategy altitude and the hand-off

## Impact

- **No new enforcement mechanism.** The altitude is a consequence of `DEC-009`, which is unchanged.
- **Hat-agnostic.** The rule says "a strategy with no decision descending from it", not "a maintainer strategy". `DEC-028` makes every decision owned by `dev` or `devops`, so any descending decision is an implementing one — and `DS-SQUAD-HATS` makes hat names a project's own, so hardcoding `maintainer` would be wrong.
- **Existing projects see new loops.** Every strategy with no implementing decision reports. On this repository that is most of them, which is accurate.
- **Modified**: `src/core/compact/loops.ts`, `src/core/templates/workflows/opsp-compact.ts`
