---
id: DEC-REEXPLORE-NAME
type: adr
status: accepted
created: 2026-10-11
depth: 4
depends-on:
  - DEC-HAT-HANDOFFS
hats: [dev]
---

# DEC-REEXPLORE-NAME: The Tool Keeps Its Name; Only Its Definition Moved

## Question

[[DEC-HAT-HANDOFFS]] moved `/opsp:reexplore` to the goal rung and renamed it `/opsp:reideate` in the same breath, reasoning that a tool called *re*-explore which produced artifacts was misnamed.

The first half of that is right and stands. The second half assumed the name was the problem when the behaviour was.

## Decision

**The workflow is `/opsp:reexplore`.** Its definition is exactly what [[DEC-HAT-HANDOFFS]] made it — the goal rung, writing nothing, returning the initiative to `exploring` — and only the name reverts.

The capability `opsp-reexplore-workflow`, which already existed, keeps its name. `opsp-reideate-workflow` is folded into it.

## Consideration Factors

| | `/opsp:reexplore` | `/opsp:reideate` |
|---|---|---|
| Names what the tool does | ✓ — redo the explore process | ✗ — names the altitude |
| Continuous with what operators already know | ✓ | ✗ |
| Symmetric with the stage it rejoins | ✓ — `explore` → `reexplore` | ✓ — `ideate` → `reideate` |
| Avoids a duplicate capability | ✓ | ✗ — created one |
| Reads correctly against the old behaviour | ✗ — but the old behaviour is gone | ✓ |

## Rationale

**The behaviour names the tool, not the altitude.** An operator reaching for a fallback asks *what do I run*, not *which rung am I on*. `/opsp:explore` run later is what the tool is, and "reexplore" says that in one word.

**The original objection no longer applies.** "A tool called re-explore that produces artifacts is not re-exploring" was true of the old `/opsp:reexplore`, which revised plans. That half moved to [[DEC-ESCALATION-LADDER]]'s `/opsp:repropose` and the other half became a change request from `/opsp:attest`. What is left writes nothing, which is precisely what makes the name correct.

**Renaming a long-lived workflow has a cost the rename did not pay for.** The same reasoning the project already applied to `compact`: *"'condense' is actually more appropriate, but it is a named verb for the tool, not necessary to rename and break backward compatibility."* The name is an interface.

**The rename also cost something concrete.** It created `opsp-reideate-workflow` as a new capability while `opsp-reexplore-workflow` still held four requirements describing what is now `/opsp:repropose`'s job — two specs for one workflow, one of them wrong. Nothing would have caught it: specs are not compiled, so `compact check` cannot see a duplicated capability.

## Invalidation Trigger

If a future change splits `/opsp:reexplore` again such that the remaining tool no longer resembles `/opsp:explore`, the name stops describing the behaviour and should move with it — the test being whether the tool still writes nothing.
