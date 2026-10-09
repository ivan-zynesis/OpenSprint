## Context

`DEC-024` chose declared-and-checked over fully derived, and over declaration alone. This change is that decision.

## Goals / Non-Goals

**Goals**
- An explicit, ordered state vocabulary including `declined`
- A check that reports disagreement between the declared state and the content

**Non-Goals**
- Git as a third input — that is `git-contract`, in `sdlc-operating-contract`
- Writing or advancing state — `/opsp:backlog` and `/opsp:triage`, also later
- Gating anything on state

## Decisions

### The check reports contradictions, not an exact match

Deriving one state and demanding equality would be the brittle option `DEC-024` rejected, one layer up. An initiative legitimately sits between states: milestones delivered out of order, a proposal with its driver-specs still forming.

So the check asks a narrower question — **is the declared state impossible given the content?** Declared `exploring` with milestones already done is impossible. Declared `completed` with milestones outstanding is impossible. Declared `proposed` with nothing proposed — no driver-specs, no decisions, no milestones — is impossible. Everything else is allowed.

That reports the drift worth reporting and stays quiet about the rest.

### `attested` and `completed` are indistinguishable from content, and the check says so

Nothing in an initiative's content yet separates "every milestone done" from "every bar attested", because attestation does not exist until milestone 9. Rather than guess, the check treats both as satisfied by complete milestones and records the limitation. Milestone 9 narrows it.

### An absent state is reported only for an active initiative

`DS-BACKWARD-COMPAT` requires an initiative written by an older release to keep parsing, and both pre-session initiatives carry no `state`. Reporting them forever would train the operator to ignore the check — the same failure `DEC-035` avoids for declined candidates.

So an initiative whose `status` is `completed` is resolved and silent. An **active** one with no state cannot be placed on a board, and is reported.

### `declined` is terminal and resolved

`DEC-035` makes it terminal but not permanent. For the check that means: never reported as stale, whatever its milestones say — a candidate dropped before any work is exactly the case where content and state look contradictory and are not.

## Risks / Trade-offs

**The vocabulary is fixed in code, not per-project.** Unlike hats and sections, states are not configurable. Accepted: a state machine whose vocabulary varies per project cannot be checked, and nothing has asked for one. `DS-SQUAD-HATS`'s reasoning about hats does not transfer — a hat is a property of the product, a lifecycle stage is a property of the method.

**Order is declared but barely used.** `INITIATIVE_STATES` is ordered so later work can ask "has it reached proposed?", and today only the contradiction rules use it. Left in rather than added later, because the order is the thing being asserted.

## Migration Plan

None. An initiative with no `state` parses and, if completed, is silent.

## Open Questions

None blocking.
