## Context

The states existed and the moves did not. That is a specific failure mode worth naming, because the fix is not "write the missing instructions" — the instructions were there.

`/opsp:propose` carried a guardrail saying to advance an initiative to `proposed`, and a frontmatter template without a `state:` field. Agents follow the template.

## Goals / Non-Goals

**Goals**
- Every transition is performed by something that leaves a trace
- The handoff from dev to product/maintainer is a state, not a convention
- An illegal move is impossible; a contradicted state is visible

**Non-Goals**
- Deriving state from content. An initiative legitimately sits between states, and `declined` has no content signature at all.
- Gating on a contradicted state. See below.
- Collapsing `status` and `state`.

## Decisions

**Transitions are a command, because prose cannot be absent.**

An instruction saying "now set `state: building`" produces nothing when skipped, and nothing looks exactly like nothing-to-do. `opensprint advance` produces a transcript line, a changed file and a regenerated board. Its absence is visible in a way a skipped paragraph is not. This is the same reasoning `DEC-014` applies to compiled artifacts: the difference between a step done and a step claimed is whether it left a trace.

**`ready-for-attestation` exists because the hats are the same person.**

`DS-HATS-AS-CONTEXT` says most hats are worn by one engineer. `building` says work is happening; `attested` says judgement happened. Between them is the moment the work stops being `dev`'s and becomes `product` and `maintainer`'s — and with no state for it, that moment is invisible, which in practice means it does not occur.

`DEC-043` already refuses the authoring session, but a refusal needs a fact to fire on. "The initiative was handed over" is that fact.

It is also the only honest thing to put on a board: work in progress and work waiting on somebody to put a different hat on need different responses, so they are different columns.

**The backwards edge is the lifecycle, not an exception.**

`ready-for-attestation → building` is how `/opsp:reexplore` reopens work. That loop is the same conversation `/opsp:triage` has before the work starts — an engineer and a product owner iterating on the plan — held again with the work in hand. Making it legal is what keeps the handoff a door rather than a cliff.

**An illegal move is refused; a contradicted state is recorded.**

`building → completed` is refused, because a state machine with no illegal moves is a text field. But advancing to `ready-for-attestation` with milestones outstanding is *written*, with the contradiction printed beside it. Refusing there would turn a tool that records what happened into one that decides what may happen, which is the line `DS-SURROGATE-SCOPE` draws.

**No state is a repair, not a move.** `checkTransition(undefined, anything)` passes. An initiative written before states existed — or by `/opsp:propose` while its template omitted the field — must be able to reach a correct state, and refusing would leave it stuck forever.

**`writeState` rewrites one line.** It replaces the `state:` line, or inserts after `status:` where absent, and touches nothing else. An initiative carries prose that a transition has no business rewriting — including, as the tests check, prose that happens to contain the string `state:`.

## Risks / Trade-offs

**Six states is one more to learn.** The alternative was inferring the handoff from "all milestones done", which is derivable — and derivable is exactly what makes it useless as a handoff, because nobody is *told*. A state somebody must set is a state somebody noticed.

**`advance` can be skipped too.** A command is not a hook. What it buys is that the skip is visible in the transcript and the board, and that `checkInitiativeState` now reports the resulting contradiction by name. The next step, if skipping proves common, is `compact check` failing on it — deliberately not done here, because gating on a state is a bigger change than recording one.
