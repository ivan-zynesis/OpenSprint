## Context

`DEC-007` divides facilitation in two: noticing, which is encoded, and deciding what to do about it, which is judgement. The engine now does the noticing. This change connects it to the judgement without building a third thing in between.

## Goals / Non-Goals

**Goals:**
- An operator entering explore sees the backlog without having to ask for it
- An initiative records which gaps it closed, so the next harvest can be read against intent
- No new workflow, per `DEC-007`

**Non-Goals:**
- Auto-filing an initiative from a loop. The gap between "this is a gap" and "this gap is worth work now" is exactly the judgement `DEC-007` reserves for a human.
- Ranking or scoring loops. With 10 here and 15 on cashier, a ranked list would be machinery serving a problem nobody has.
- Closing the loop automatically when a rule appears. The next harvest reports it; nothing needs to mark it done.

## Decisions

**Explore loads loops as part of the surrogate, not on request.** The operator entering explore is deciding what to work on, and the backlog is the single most relevant input to that. Requiring them to ask means the loops are read by whoever already knew to look, which is the opposite of the problem `DS-LOOP-CLOSURE` describes.

The cost is one CLI call and a short list — 10 loops here, 15 on cashier — against the 93–157K the surrogate already costs (`DS-SURROGATE-BUDGET`). It does not move the number.

**Loops are presented, never prioritised.** Explore shows them grouped by hat, because a hat is who answers for it (`DS-SME-OWNERSHIP`). Which one matters is the operator's call, and the skill is instructed not to recommend one over another — an agent nudging the backlog is an agent setting the roadmap.

**`Addresses` is prose in the descriptor, not frontmatter.** A loop is identified by a record id and a kind, both of which already appear in the harvest. Putting them in frontmatter would invite something to parse them and mark loops closed, which is the auto-filing `DEC-007` rules out. The next harvest is the source of truth for whether a gap still exists; the descriptor records only what the initiative set out to close.

**Nothing marks a loop resolved.** There is no state to keep. A gap exists when the harvest says so and stops existing when it stops saying so, which means the backlog cannot drift from reality — the same property `DEC-010` gives the views.

## Risks / Trade-offs

**Explore gets longer on entry.** Accepted, and bounded: the harvest is a list of records and kinds, not content.

**An operator may treat the backlog as a worklist.** The loops are gaps in a record, not a plan; some are deliberate. `DEC-017` makes `devops` legitimately empty, and a naive reading of an empty hat as a gap would generate work to close something that was decided. The explore instructions say so directly, and the compact output already reports the `devops` emptiness with its citation.

**Cross-platform.** No new paths are constructed. The loops come from the CLI as JSON.
