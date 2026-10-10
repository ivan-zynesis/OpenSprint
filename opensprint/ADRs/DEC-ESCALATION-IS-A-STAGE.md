---
id: DEC-ESCALATION-IS-A-STAGE
type: adr
status: active
created: 2026-10-10
depth: 0
depends-on:
  - DS-ESCALATION-HANDOFF
hats: [dev]
---

# DEC-ESCALATION-IS-A-STAGE: An Escalation Renders as a Stage Boundary

## Question

`/opsp:apply` treats an escalation as a question to ask and move past. [[DS-ESCALATION-HANDOFF]]
says it is a hat handoff — the dev hat set down, another picked up. How should that read?

## Decision

The escalation is **rendered as a stage boundary**, not as a prompt:

- the pause is announced, and apply's state says *paused at milestone N, awaiting product*
- the dev hat is explicitly **set down**, and explicitly **picked back up** on resume
- the hat being worn for the answer is named in the output
- resuming is a distinct step, not the side effect of receiving a reply

## Consideration Factors

| Factor | Weight | A stage boundary | A prompt mid-flow |
|---|---|---|---|
| The operator knows which hat they wear | HIGH | Named explicitly ✓ | Implicit — they answer as themselves ✗ |
| Matches what is happening | HIGH | A handoff between accountabilities ✓ | Treats a gap in the spec as an interruption ✗ |
| Makes the spec gap visible | HIGH | A recorded pause ✓ | Disappears into the transcript ✗ |
| Resumption is deliberate | MED | A distinct step ✓ | Automatic ✗ |
| Flow | LOW | More ceremony ✗ | Faster ✓ |

## Rationale

[[DS-HATS-AS-CONTEXT]] makes a hat something you *load*, and the hardest case is the one where the
same person wears several. An operator answering an escalation mid-implementation will answer as a
developer unless something tells them not to — they have the diff in their head too.

Naming the hat is the cheapest intervention that changes the answer. It costs one line of output and
it is the difference between *"what should the timeout be?"* answered by someone thinking about
retries, and the same question answered by someone thinking about what the business promised.

Making the pause visible also makes the **spec gap** visible. A question answered inline disappears
into a transcript; a recorded pause says product or maintainer left something unsaid at this point in
this milestone — which is information worth having even after the answer is given.

The accepted cost is ceremony on something that happens often. That is the right trade while most
hats are worn by one person: ceremony is what makes the switch real.

## Invalidation Trigger

If escalations become frequent enough that the ceremony is skipped or automated away, the problem is
upstream — proposals are shipping with bars too thin to build against — and the fix belongs at
propose rather than here.
