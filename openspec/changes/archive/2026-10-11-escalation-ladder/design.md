## Context

Escalation existed at one altitude. Everything that was not "a missing fact" had to be forced into that shape or handled off-process.

## Goals / Non-Goals

**Goals**
- Every size of escalation has an exit, chosen mechanically
- The decision trail survives a strategy revision
- Attestation has teeth — it can send work back, not only describe it

**Non-Goals**
- A tool for the goal rung. `/opsp:triage` and `/opsp:driver` already serve it, and a goal that moved is not a revision of this initiative — it may not be this initiative at all.
- Automating the choice of rung. The test is mechanical; the answer is the operator's.
- Letting `/opsp:repropose` touch a driver-spec. That is the line that makes the rungs mean anything.

## Decisions

**The rungs are the OGSM altitudes, so the test is "what has to move".**

Driver-specs hold the objective and goal; ADRs hold the strategy; milestones hold the plan. Nobody has to judge whether something is "a big change" — they have to say which of three files changes. That is checkable, and it is the same hierarchy `DS-PROGRESSIVE-CRYSTALLIZATION` already uses to define an initiative's state going *forward*. Falling back is the same ladder read downwards.

**Repropose re-enters at `proposed`; reexplore stays at `building`. This is why they are two tools.**

A restated strategy has a bar nothing has been built against yet, so `/opsp:apply` must open the work again. Re-entering at `building` would let revised milestones ride on a state claiming work was already underway against them — the exact bookkeeping `DEC-STATE-MACHINE` exists to prevent. A plan revision needs no reset, because the strategy it implements has not moved.

Folding them into one tool with a flag would make the state move a parameter of a prompt, which is where the distinction would quietly get lost.

**Supersede, never rewrite.** The old ADR keeps its Question, Decision, Consideration Factors and Rationale exactly. `status` and `superseded-by` are the only fields that change. This is `DS-PARALLEL-EXEC`'s multiverse reasoning applied backwards in time: a superseded ADR is how someone later reads why the first answer looked right, and deleting it leaves only the current answer, which always looks obvious. The cascade then surfaces as `decision-on-superseded` rather than being tracked by hand.

**Two transitions may share `from` and `to` and differ in `by`.** `ready-for-attestation → building` means something different as a change request than as a re-plan. The table carries both, and a refusal message naming both is more use than one naming neither.

**A change request supersedes nothing.** This is the distinction most likely to be got wrong: "the work is missing" is the plan not having been *finished*, not the plan being *wrong*. Nothing is superseded, no ADR moves, and the state goes back to `building` where `/opsp:apply` picks it up.

**Attestation needed an exit because it is the last gate before merge.** `DEC-030` makes attest-then-archive-then-merge one pull request. An attester who can only record a verdict is a reviewer who can only comment.

## Risks / Trade-offs

**Operators may reach for repropose where reexplore would do**, because returning to `proposed` feels more thorough. That is in the invalidation trigger: if it happens, the question in the escalation prompt needs to be mechanical rather than offered.

**`/opsp:repropose` could be used to edit a driver-spec despite the guardrail.** Nothing enforces it — the guardrail is prose, and the workflow is prose. Making it mechanical would mean a check on what a session touched, which `checkAmendment` does for attest and nothing does for propose. Recorded rather than solved.

**Nineteen workflows.** The surface grows. The defence is that this one was not invented to fill a gap in a diagram — it was reached for during a real attestation and found missing.
