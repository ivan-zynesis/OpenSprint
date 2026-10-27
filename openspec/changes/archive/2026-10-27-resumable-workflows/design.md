## Context

A board button starts a new session in the card's worktree. Whatever a workflow knew only in its
conversation is gone by then, so resuming is possible only from what is on disk: the initiative, the
records it lists, and git. This change makes triage, propose and attest read that before they do
anything, and makes triage write down the one thing it used to keep in its head.

## Decisions

**"Already done" is read from the state, and each workflow stops there.**

A button can be pressed twice, and a card can be continued from a stale render. Each workflow
therefore checks the initiative's state before anything else:

- **triage**: past `exploring`, propose has already run;
- **propose**: at `proposed` or later, the plan exists;
- **attest**: at `attested`, the judgement is recorded.

Each names the next workflow and stops. Doing the work again would duplicate records or override a
judgement.

**Triage writes notes, and propose turns them into records.**

`DEC-039` and `DEC-034` split each stage into a thinking half and a persisting half. Triage is
thinking, and its guardrail is "never formalize". Notes are not formalization. A `## Triage` section
in the initiative carries no id and claims nothing, and no tool parses it. It is what the next
session reads instead of a conversation that no longer exists. The initiative is a container, and
filling progressively is what it is for (`DS-PROGRESSIVE-CRYSTALLIZATION`).

The shape is three short lists: the approaches weighed with what each costs, the leaning, and the
open questions. It is written before triage hands over or pauses, and revised on every resume.

**Propose trusts the records on disk.**

Propose writes a driver-spec or ADR only after the operator confirms the classification. So a
record that the initiative lists, and that exists, was confirmed. On resume, propose shows the
records already written as done, classifies only what remains, and asks for confirmation of that
alone. It never rewrites a record a previous pass wrote: the Objective and Goal rule, extended to the
whole surrogate.

**Attest finds "this pass" with git, not with a new field.**

A posture already carries `attested-on`. The handoff to `ready-for-attestation` is a commit that
introduced the line `state: ready-for-attestation`, which `git log -S` finds. A posture dated on or
after the handoff was judged in this pass, unless the change has commits since that posture, in
which case it is judged again: the code under it moved.

A change request followed by a new handoff makes the newest handoff the boundary, which is right
because the work was rebuilt. The frame is confirmed again in every session, because `DEC-043` and
the frame step make it the premise. Resuming skips bars, never the frame.

## Risks / Trade-offs

- **Date granularity.** Two attestation passes on the same day, either side of a change request,
  cannot be told apart by `attested-on`. The rule judges a bar again when the change has commits
  after its posture, which covers the case that matters: a change request means new commits.
- **Notes can go stale.** `## Triage` describes the thinking at the time. Triage revises it on
  resume, and propose replaces it with `## Strategy`. It is never a source of truth about the
  system, and nothing compiles it.
