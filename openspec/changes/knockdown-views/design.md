## Context

`DEC-KNOCKDOWN-ALL-VIEWS` decides that knockdown produces all five views and that the empty ones are the finding.

## Goals / Non-Goals

**Goals**
- Say that all five views are produced, and what each will contain
- Frame empty product/maintainer as a finding rather than an omission
- Keep knockdown from inventing intent

**Non-Goals**
- Changing compaction — Step 5 already delegates correctly
- Having knockdown assign roles or objectives

## Decisions

### Knockdown does not assign `role` or `objective`

A driver-spec inferred from code describes what the code does. A `role` — objective, goal, strategy
— and an `objective` are statements about *intent*, which no amount of reading source reveals. An
agent guessing them would produce a product view that looks populated and is fiction, which is worse
than an empty one: it would read as `decided` when nothing was decided.

So knockdown leaves both unset, the role-filtered sections select nothing, and the views render
empty. That is not a limitation worked around — it is the correct output.

### The empty views are reported as questions, not as gaps

The completion summary names the seven maintainer objectives that have nothing recorded. Framed as
*"nobody has stated what this system does about these"*, that is an onboarding document. Framed as
*"four of five views are incomplete"*, it reads as a tool that half-worked.

The difference is entirely in the wording, which is why the wording is specified.

### Everything stays `observed`

Knockdown's output carries no attestation and no decision authority. `DEC-021`'s three authorities
make this expressible: a knocked-down surrogate is **entirely observed**, and the summary says so,
so nobody mistakes an inference for a choice somebody made.

## Risks / Trade-offs

**An empty view could be read as "this project has no security requirements"** rather than "nobody
wrote them down". The rendering has to carry that distinction, and `DEC-KNOCKDOWN-ALL-VIEWS`'
invalidation trigger names exactly this as the signal that the rendering, not the decision, is at
fault.

## Migration Plan

None. Prose.

## Open Questions

None blocking.
