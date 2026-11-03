---
id: sdlc-operating-contract
title: sdlc-operating-contract
state: completed
created: 2026-10-09
updated: 2026-11-03T15:30:12Z
branch: opsp/sdlc-operating-contract
---

[[lifecycle-beyond-build]] gives the surrogate its **shape** — inherited maintainer objectives, the measure anatomy, attestation, stateful initiatives. This initiative gives it an **operating contract**: which tool owns which phase, which hat wears which context, and how the whole thing binds to git.

## Milestones

- [done] backlog-and-triage: `/opsp:backlog` and `/opsp:triage`; each creates or switches to the initiative's worktree if not already in one ([[DEC-029]]); explore reverts to writing nothing; propose becomes purely the formalizer; the `declined` state
- [done] git-contract: worktree at apply; rebase → attest → archive → merge; the PR-time state gate; git as a third input to the state check
- [done] compact-in-archive: archive consumes compact — **already satisfied when the milestone was reached.** `/opsp:archive` delegates the compile to `/opsp:compact` rather than synthesising `architecture.md` ([[DEC-014]]), and gates the merge on `compact check` and an empty Problems section in `compact board`. Nothing was left to build; verified rather than implemented.
- [done] attest-context: the narrow-context attest skill and evidence-as-CI-artifact shipped with [[lifecycle-beyond-build]]; this milestone added the half that was missing — `evidence-unresolvable`, which reports an attestation citing nothing addressable or a path not in the tree. Remote references are taken on trust: resolving them would put the network inside a compile.
- [done] record-naming: decisions are coined semantically and initiative filenames carry a creation-date prefix ([[DEC-036]]). `RECORD_ID_PATTERN` was widened ahead of the milestone, as a prerequisite to naming [[surrogate-currency]]'s decisions semantically — the numbered era stopped at `DEC-044`. This milestone removed the remaining number allocation from `/opsp:decide` and `/opsp:propose`, moved every reader to resolution by frontmatter `id:`, and renamed all five existing initiative files.
- [done] sub-frameworks: SWOT-like strategy rendering compiled from cited ADRs ([[DEC-037]]) and BDD bar forms split by hat ([[DEC-038]]). `BAR_FORMS` and `SWOT_SOURCES` hold the vocabulary in code so the skill and the harvest cannot drift; `bar-without-form` makes the form mechanical. The BDD form is **additional to** the spectrum, not a replacement — the spectrum says where the bar sits and what that cost, the BDD says what a pipeline runs to tell you it still sits there.
- [done] attest-frame: `/opsp:attest` resolves `source → base` and has the operator confirm it before reading a bar ([[DEC-ATTEST-CHANGE-FRAME]]). Found by using the tool: the attester could not know what change it was reviewing, so the operator had to narrate it. Added after the other six closed — attestation is change management, and this is the orientation step it was missing.
- [done] state-machine: the initiative state machine, which `DEC-035` named and nothing implemented ([[DEC-STATE-MACHINE]]). Six states now, with `ready-for-attestation` for the handoff; eight transitions performed by `opensprint advance` rather than described in prose. Found by asking where states get written and discovering that `/opsp:propose`'s template had no `state:` field at all, so `proposed` was never written by anything and `/opsp:archive`'s gate on `attested` could never pass.
- [done] escalation-ladder: escalation splits into three rungs, which are the OGSM altitudes ([[DEC-ESCALATION-LADDER]]). `/opsp:repropose` is new — the strategy rung, superseding ADRs and returning the initiative to `proposed`; `/opsp:reexplore` is declared the plan rung; `/opsp:attest` gains a change request and a repropose exit. Found during this initiative's own attestation, which is where it would be found: an operator saying 'we decided that wrongly' had nowhere to go.
- [done] hat-handoffs: the ladder corrected on contact ([[DEC-HAT-HANDOFFS]]). `/opsp:reexplore` became `/opsp:reideate` and moved to the goal rung — `/opsp:explore` with the work in hand, writing nothing, rejoining `backlog → triage → propose`; the old definition was `/opsp:repropose`'s all along. Repropose absorbed the plan rung and may now amend `## Measures`, guarded by: a bar that got easier is a goal that moved. Every transition declares its hat, and `opensprint advance` refuses a handoff until `--hat` names one.
- [done] bar-at-propose: the bar is written where the goal is ([[DEC-BAR-AT-PROPOSE]]). Three documents said `/opsp:propose` writes the bar and no instruction did — propose and `/opsp:driver` never mentioned `## Measures`, so the primary path created driver-specs with no hat, no role and no measures. Also reclassifies `/opsp:repropose` as `create` mode: the distinction is whose record it is, and repropose wears the hat that wrote the bar. Found by the operator questioning a risk I had recorded wrongly.
- [done] reexplore-name: the rename reverted ([[DEC-REEXPLORE-NAME]]). The tool keeps the name it has had since the beginning; only its definition moved. "Reexplore" names what it does — redo the explore process — where "reideate" named the altitude, and an operator reaching for a fallback asks what to run. The rename had also created a duplicate capability, `opsp-reideate-workflow`, while `opsp-reexplore-workflow` still held four requirements describing `/opsp:repropose`'s job; those are removed with migrations and the two are merged.

## History

- 2026-10-18T06:38:46Z  imported at completed from opensprint/initiatives/20261009-sdlc-operating-contract.md  by Ivan Lee
- 2026-11-03T15:30:12Z  resynced milestones from opensprint/initiatives/20261009-sdlc-operating-contract.md  by Ivan Lee
