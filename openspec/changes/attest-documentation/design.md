## Context

`DEC-044` adds the second write target. `DS-DOCUMENTATION-REVIEWED` makes documentation adequacy a review question. `DEC-042` defined the three questions; this harvests them.

## Goals / Non-Goals

**Goals**
- A configurable documentation directory
- Documentation reviewed at attestation
- The three questions harvested

**Non-Goals**
- Checking anything inside the documentation directory — it is prose
- Gating. `DEC-023` holds.

## Decisions

### The attestation loops fire only once an initiative claims to be attested

Before that point these questions have no answer yet, and asking who holds a risk nobody has judged
would train the operator to ignore the loop that matters once they have. So the rules key on
`state` being `attested` or `completed`.

An initiative written by an older release carries no `state`, so it is silent — the same reasoning
`DEC-024` uses for not nagging a resolved initiative forever.

### A RACI row naming a system is a complete answer

`DEC-042`'s residue-after-automation rule, harvested: only non-automated rows owe names, and they
owe **Responsible and Accountable**. Consulted and Informed are optional, because they are useful
and rarely the reason an incident goes unhandled.

An attested initiative with **no** RACI at all reports once, saying so — that is a different finding
from a row with a missing owner, and the more serious one.

### `docsDir` is parsed twice, like every other config field

The Zod schema declares it and the runtime reader parses it explicitly, which is how `hats` and
`ruleGlobs` already work: a malformed value warns and degrades to the default rather than failing
the command. Adding it to the schema alone was not enough and the tests caught that.

### Attest urges; it does not write silently

The operator decides what an external reader should be told. The tool produces the account in
context, says where it belongs, and writes only on confirmation — so the question is guaranteed to
be asked without the answer being invented.

## Risks / Trade-offs

**Nothing checks the documentation directory.** An account that drifts from what shipped will not
fail a build the way a compiled view does; only the next attestation notices. Accepted and recorded
in `DS-DOCUMENTATION-REVIEWED`'s exposure — the alternative is imposing structure on prose, which
would make it a record in everything but name.

**The three loops are silent on this repository.** Nothing has been attested, so they report
nothing. Verified by test instead.

## Migration Plan

None. `docsDir` is optional; the loops fire only on initiatives that claim attestation, and none do.

## Open Questions

None blocking.
