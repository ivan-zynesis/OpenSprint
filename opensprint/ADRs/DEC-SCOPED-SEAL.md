---
id: DEC-SCOPED-SEAL
type: adr
status: active
created: 2026-10-10
depth: 2
depends-on:
  - DS-VIEW-AUTHORSHIP
  - DEC-010
hats: [dev]
---

# DEC-SCOPED-SEAL: Seal Is Scopeable, and Never Blesses a Section It Did Not Render

## Question

[[DS-VIEW-AUTHORSHIP]] has `/opsp:apply` compile `dev` and `devops` and nothing else.
`compactSealCommand()` takes no arguments and rebuilds the manifest for every section of every hat.
Rendering two hats and then sealing would mark the other two fresh while they are stale.

## Decision

**`compact seal` becomes scopeable**: `compact seal --hat dev --hat devops` seals only those hats'
sections and leaves every other manifest entry untouched.

**And sealing never blesses a section it did not just render.** Where a section's rendered output is
unchanged from what the manifest already records, it is left alone rather than re-sealed against
current inputs.

Unscoped `compact seal` keeps its meaning — seal everything — because `/opsp:archive` legitimately
closes an initiative with every hat in scope.

## Consideration Factors

| Factor | Weight | Scopeable seal | Seal everything, always | Never seal mid-initiative |
|---|---|---|---|---|
| Cannot bless stale content | HIGH | Only what was rendered ✓ | **Marks stale views fresh** ✗ | ✓ |
| Enables compiling during apply | HIGH | Yes ✓ | Only by lying ✗ | No — the point is lost ✗ |
| `check` stays trustworthy | HIGH | ✓ | A passing gate means nothing ✗ | ✓ |
| Archive is unaffected | MED | Unscoped keeps its meaning ✓ | ✓ | ✓ |
| Command surface | LOW | One flag ✗ | None ✓ | None ✓ |

## Rationale

This is not a hypothetical. During `lifecycle-beyond-build` the maintainer view was re-rendered and
`compact seal` was run; it sealed all twenty-one sections across four hats, marking `product`, `dev`
and `devops` fresh while their content still described a world three milestones out of date.
`compact check` then passed over stale views. The error was caught by reading the output rather than
by any guard.

So the failure mode is proven, and it is the worst kind: **a gate that passes when it should
fail.** [[DEC-010]] exists to make a compiled artifact unable to drift silently, and an unscoped
seal is the one operation that can defeat it.

The second rule — never seal what was not rendered — matters more than the flag. A caller could
scope correctly and still bless a section whose inputs moved but whose prose was never regenerated.
Comparing the rendered output against what the manifest holds closes that.

## Invalidation Trigger

If operators routinely run unscoped `seal` mid-initiative to silence `check`, the flag has become a
formality and the second rule is doing all the work — which would argue for dropping the flag and
making every seal output-compared. If sealing becomes slow enough that scoping is used for
performance rather than correctness, the manifest is too coarse.
