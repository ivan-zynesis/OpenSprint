---
id: DEC-ATTEST-CHANGE-FRAME
type: adr
status: accepted
created: 2026-10-11
depth: 1
depends-on:
  - DEC-040
  - DEC-030
  - DS-ATTEST-AS-REVIEW
hats: [dev]
---

# DEC-ATTEST-CHANGE-FRAME: Attest Establishes the Range Before It Reads a Bar

## Question

`/opsp:attest` reviews an initiative. It never established *what change* it was reviewing — no source branch, no base, no commit range. The operator had to say, in prose, which initiatives were in the pull request and what the branch contained.

That is the wrong way round. The attester is standing in a worktree; git already knows the branch, the base it merges into, and everything between. An operator spelling out what the tool can read is how a review starts from the wrong premise — and the operator cannot tell whether the attester understood the scope, because nothing was ever shown back to them.

But [[DEC-040]] exists precisely to keep the implementation out of the attester's context. Asking attest to look at the branch looks like reopening that door.

## Decision

**Attest resolves the change frame first, presents it, and waits for the operator to confirm it.**

The frame is `source → base`, where base is resolved in this order:

| Order | Source | Why |
|---|---|---|
| 1 | `--base`, if given | the operator knows |
| 2 | `refs/remotes/origin/HEAD` | what a pull request would actually target |
| 3 | `main`, `master`, `develop`, `trunk` | an explicit candidate list, in that order |

**How the base was chosen is reported with it.** [[DEC-024]]'s trunk resolution deliberately avoided `origin/HEAD` because it is absent in a fresh clone and misleading in a fork. Both objections are answered by showing the operator which rule fired, so a fork's wrong answer is visible and correctable rather than silent.

**What the frame carries is scope, never rationale:**

```
  CARRIES                             DOES NOT CARRY
  ------------------------------      -----------------------------
  source branch and base              the patch
  the fork point                      commit message bodies
  commit SUBJECT lines                the design discussion
  a file-level stat                   the ADR rationales
  initiative ids touched
  change names archived
```

**The operator confirms the frame before any bar is read.** Not acknowledged — confirmed. An inferred base that nobody agreed to is an inference the review then rests on silently.

## Consideration Factors

| | Frame first, confirmed | No frame (status quo) | Frame inferred, not confirmed |
|---|---|---|---|
| Attester knows the scope | ✓ | ✗ — operator must narrate it | ✓ |
| Operator knows what is under review | ✓ — it is shown back | ✗ | ✗ — inferred silently |
| A wrong base is caught | ✓ — shown with its reason | n/a | ✗ |
| Keeps [[DEC-040]]'s context narrow | ✓ — subjects and stat only | ✓ | ✓ |
| Costs a round trip | ✗ | ✓ | ✓ |

## Rationale

**Scope and rationale are different artifacts, and only one of them rationalises.**

[[DEC-040]] keeps the implementation source, the design discussion, the ADR rationales and the conversation out of the attester's context. Every one of those is an *argument that the change is right*. An attester holding an argument adopts it; that is the whole finding behind [[DEC-033]] and its successor.

A commit subject and a diffstat are not arguments. `feat(compact): maintainer gains seven inherited objectives` and `14 files, +612 -88` tell you what moved and how much. They do not tell you why it is correct, and they cannot be used to talk yourself into a pass — which is the test `DEC-040` actually applies, rather than "anything from git is forbidden".

The line is drawn at the artifact, not the tool: **subjects yes, bodies no; stat yes, patch no.** A commit message body in this project argues for its change in paragraphs, so it is the conversation that built it, and it stays out.

**Without the frame, the narrow context is narrower than intended.** [[DEC-040]] names what the attester must not read. It never said the attester should be ignorant of *which change it is attesting*, and reading it that way produced a tool that could only work when the operator did the orientation by hand. [[DEC-030]] already makes the pull request the unit — rebase, attest, archive, merge, as one PR. A reviewer of a pull request who does not know its range is not reviewing a pull request.

**Confirmation is what makes the inference safe.** The same reasoning as [[DS-ESCALATION-HANDOFF]]: inference is the right default and approval must still be explicit, because an inference nobody agreed to becomes a premise nobody checked. Here the premise is the entire scope of the review, so it is the worst one to get silently wrong.

## Invalidation Trigger

If attesters begin reasoning from commit subjects about whether a bar was met — "the subject says it adds validation, so it is validated" — then subjects are functioning as rationale and the line is in the wrong place; drop to the stat alone.

If operators routinely correct the guessed base, the resolution order is wrong for how teams actually branch, and the candidate list or its ordering should change rather than the confirmation step.
