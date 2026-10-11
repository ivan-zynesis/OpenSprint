## Context

The ladder was built one iteration ago and tested against real use within the day. Two rungs were wrong and the hat question had not been asked at all.

## Goals / Non-Goals

**Goals**
- Each rung has exactly one tool, and the tool's name describes what it does
- The goal rung reuses the forward path rather than inventing a parallel one
- A change of accountability is something you state, not something you are assumed to have done

**Non-Goals**
- Verifying a context was actually cleared. No command can.
- A handoff flag on every transition. That would make it noise.
- Keeping `/opsp:reexplore` as an alias.

## Decisions

**Reideate is explore, later, and writes nothing.**

The symmetry is the argument. `explore → backlog → triage → propose` is the road in; reideate rejoins it at the top. The goal rung then needs no new vocabulary, no new artifacts and no new stage — a fallback path that reuses the forward path is one fewer thing to learn and one fewer thing to drift.

The objection to a tool that produces no artifact is that the thinking evaporates. It does not: `/opsp:backlog` is the deliberate flush and already exists, so a re-ideated goal is persisted by the same tool, in the same shape, as an original one.

Milestones that served the old goal are marked superseded rather than deleted. They did serve it; that is what happened.

**Repropose may amend `## Measures`, bounded exactly as attest is (`DEC-027`).**

A new strategy frequently makes a genuinely different thing observable, and a bar still describing the old mechanism is worse than no bar — it reads as a target when it is an artefact. Meanwhile the Statement, which is what everything downstream cited, does not move. That is the same guarantee `DEC-006` gives every reader.

**The bar-lowering guard is the load-bearing part of that.** Without it, repropose becomes the quiet path to "we did not hit it, so change what we were aiming at". Naming that case and routing it to `/opsp:reideate` makes lowering a target a decision taken at the goal altitude rather than an edit nobody notices.

**`--hat` is the cheapest enforceable version of "change context".**

No command can verify a context window was cleared or that a human re-read the records. What it can do is refuse to move until somebody states which accountability they are exercising. The moment of stating it is the moment the switch becomes deliberate — the same reasoning as the escalation prompt carrying its classification. The question is not whether it can be bypassed, but whether bypassing it is something you did on purpose.

**The hat is declared per transition, not per state.** A state does not have one owner: `ready-for-attestation` is dev's to leave and product's to pick up, so which hat you need depends on which way you are going.

**Only five transitions are handoffs.** All three of attestation's exits are product and maintainer work, and so is attestation — the hat change already happened, at the handoff into `ready-for-attestation`. That is what the handoff was for.

## Risks / Trade-offs

**`--hat` can become a password.** An agent that always passes `--hat dev` has turned a step into a ritual. That is in the invalidation trigger; the stronger version would be a separate session or a check on what the context loaded, neither of which is cheap.

**Repropose touching `## Measures` is a widening**, and widenings are how guarantees erode. The bound is checkable — `checkAmendment` already exists for exactly this shape — but nothing currently runs it against repropose. Recorded rather than solved.

**A reader who learned `/opsp:reexplore` will not find it.** Both rungs state which one they are and hand over when it is the other, so the right tool is discoverable from the wrong one.
