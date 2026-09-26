# devops — how is it stood up and kept running?

## Charter

Not established. No record assigns an accountability to this hat.

## Constraints

None.

## Decisions

None.

## Open Loops

**This hat has no records, and that is a decision rather than an omission.**

OpenSprint orchestrates work inside other people's repositories; those repositories already have
pipelines. Shipping one would mean owning a deployment story for projects we do not control
(`DEC-017`). The absence follows from not competing with provider tooling and optimising instead
for speed of evolution (`DS-SELF-USE-SCOPE`).

The hat stays in the registry because the registry is the default for any project, and a project
adopting OpenSprint that *does* run infrastructure will need it.

**If this repository ever acquires deployment of its own**, this emptiness stops being correct
and becomes a real gap.
