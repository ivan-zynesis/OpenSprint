## Context

Three decisions land here: `DEC-ESCALATION-IS-A-STAGE`, `DEC-CLASSIFY-IN-QUESTION` and the apply half of `DEC-COMPILE-ON-APPROVAL`.

## Goals / Non-Goals

**Goals**
- The pause reads as a stage boundary
- The question carries its classification and a draft record
- Approval is explicit and shows blast radius
- The approved hat's view may be compiled

**Non-Goals**
- Code support for inference — the mapping already exists and the judgement is the agent's
- Gating anything. A declined escalation stops the milestone, not the tool.

## Decisions

### Naming the hat is the intervention

`DS-HATS-AS-CONTEXT` makes a hat something you load, and the hardest case is one person wearing
several. An operator answering mid-implementation will answer as a developer unless something tells
them not to — they have the diff in their head too.

One line of output changes the answer. It is the difference between *"what should the timeout be?"*
answered by someone thinking about retries, and the same question answered by someone thinking about
what the business promised.

### The draft record is the structure

"Structured" does not mean a form to fill in. It means the agent presents **the record as it would
be written** — id, type, role, objective, statement, and a bar in BDD form — so the operator reads
something they can correct rather than composing against a schema they do not have in front of them.

Correcting the classification is one of the offered actions, which is how inference stays
falsifiable without a separate prompt.

### Blast radius belongs in the question, not after it

`DEC-COMPILE-ON-APPROVAL` makes approval meaningful only if the cost is visible. A driver-spec can
invalidate decisions already made — the whole premise of `/opsp:rebuild-assess` — so the question
states which decisions depend on what is being changed, and which milestones are scoped against it.

### Resume is a distinct step

Picking the dev hat back up is stated rather than implied, for the same reason setting it down is.
An escalation that resumes automatically on receiving a reply reads as a prompt, which is what this
is moving away from.

## Risks / Trade-offs

**Inference can be wrong**, and an operator approving quickly may accept a misclassified record. The
record is correctable afterwards, but a wrong hat routes a constraint to the wrong view and the
wrong reviewer. `DS-ESCALATION-HANDOFF` records this as an exposure, mitigated by this initiative.

**Ceremony on a frequent event.** Accepted; see the decision's invalidation trigger.

## Migration Plan

None. The workflow is prose; an initiative mid-flight picks up the new instructions on the next
escalation.

## Open Questions

None blocking.
