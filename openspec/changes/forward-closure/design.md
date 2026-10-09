## Context

`DS-FORWARD-CLOSURE` closes the loop forward. `DEC-026` makes the roadmap the board's forward half.

## Goals / Non-Goals

**Goals**
- A forward pointer on an exposure, and a rule reporting its absence
- A roadmap that resolves assurance from live initiative state

**Non-Goals**
- Enforcing that an exposure is ever closed — `DEC-023` keeps this reported, not gated
- Dates or owners on a pending exposure — `DEC-032` leaves that open

## Decisions

### The pointer lives beside the prose, not in frontmatter

`mitigated-by` belongs in the `### Exposure` block, next to the sentence explaining the risk. Frontmatter would separate the plan from what it is a plan for, and a reader checking one would not see the other. It is read leniently — bare, bulleted or bolded — because the surrounding block is prose and a reader writing it should not have to remember a format.

### Assurance is resolved live, never stored

The roadmap reads the mitigating initiative's **current** state each time it compiles. Storing an assurance level on the record would be a second copy that drifts the moment the initiative moves, which is the same reasoning that makes the whole board derived (`DEC-006`).

### A dangling pointer is worse than no pointer

An exposure naming an initiative that does not exist renders as "points nowhere real" rather than as mitigated. A plan that cannot be followed gives false assurance, and false assurance about a known risk is the worst cell in the table.

`exposure-unmitigated` deliberately does **not** fire on it: the pointer exists, so the gap is a broken reference rather than an absent plan, and conflating the two would make the loop's meaning unclear.

### `declined` says the exposure stands

An exposure mitigated by an initiative that was later declined has quietly become a confession again. The board says so in words, because this is exactly the drift a static risk register never catches.

## Risks / Trade-offs

**Nothing forces an exposure to ever be closed.** `DEC-023` holds: a pending exposure nags by visibility — a harvested loop and a board row — and that is the most this system is willing to do. `DEC-032` records the same trade for pipeline attestations.

**One exposure exists on this repository and points nowhere.** That is accurate and is left as it is, rather than inventing a mitigation to make the table look better.

## Migration Plan

None. An exposure with no pointer reports the new loop, which is the finding.

## Open Questions

Whether a pending exposure needs an owner and a date is open on `DEC-032` and does not block.
