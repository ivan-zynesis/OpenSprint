---
id: sdlc-operating-contract
status: completed
state: completed
created: 2026-10-09
completed: 2026-10-11
depends-on:
  - lifecycle-beyond-build
---

## Description

[[lifecycle-beyond-build]] gives the surrogate its **shape** — inherited maintainer objectives, the measure anatomy, attestation, stateful initiatives. This initiative gives it an **operating contract**: which tool owns which phase, which hat wears which context, and how the whole thing binds to git.

Three claims drive it.

**The branch topology already encoded the ownership boundary and nobody had said it out loud.** The initiative branch is the product/maintainer boundary; the change branches are dev/devops. Sub-PRs merging `opsx/*` into `opsp/*` are engineering-internal. The single `opsp/* → main` pull request is where every other hat arrives, and `main` is production grade by definition ([[DS-SURROGATE-GIT-CONTRACT]]).

**Evidence is a CI artifact, and that is a bet.** The accommodating alternative — attest after merge, against a staging environment — is how most teams do acceptance and why most acceptance is theatre. Refusing it forces the investment: if a bar can only be attested from pipeline output, the pipeline must produce output worth attesting ([[DS-CI-ATTESTATION]]).

**Most hats are worn by the same engineer, so a hat is what you load.** Attestation is usually self-assessment, and an agent that just wrote the code has every argument for why it works already in context. The hat switch has to be mechanical: a narrow context holding the objective, the goals, the bars and the evidence — and not the diff, the design or the decision rationales ([[DS-HATS-AS-CONTEXT]]).

## Lifecycle, End to End

```
 STAGE     OWNS IT                      GIT                     PRODUCES
 ---------------------------------------------------------------------------
 explore   product / maintainer         none                    nothing
 backlog   product / maintainer         WORKTREE CREATED        initiative, O + G
                                        opsp/<initiative>
 triage    lead · architect ·           same worktree           advance / decline
           scrum master
 propose   same                         same worktree           + DS · ADRs · S + M
 apply     dev / devops                 opsx/* -> opsp/*        code · ADRs
                                        sub-PRs, no product
 attest    product / maintainer         opsp/* PR OPEN          posture · evidence
                                        not merged              · exposure
 archive   all                          opsp/* --> main         compiled views
 ---------------------------------------------------------------------------
                                   main = production grade, by definition
```

Two think/persist pairs, which was not designed and is the best evidence the split is real:

```
   explore  --think-->  backlog  --persist-->  initiative (O + G)
   triage   --think-->  propose  --persist-->  + DS · ADRs · milestones (S + M)
```

The step function from idea to proposal splits, and both paths stay open:

```
  1.   explore -------------------------------> propose
                   (straight through, as today)

  2.   explore --> backlog ..... time ..... triage --> propose
                   persisted                 picked up
```

`/opsp:triage` exists for explicitness rather than capability — `/opsp:propose` could absorb it, and a phase that exists in practice but has no name is a phase nobody reasons about ([[DEC-039]]).

## Driver Specs

- DS-SURROGATE-GIT-CONTRACT
- DS-CI-ATTESTATION
- DS-HATS-AS-CONTEXT

## ADRs

- DEC-029 — planning happens in the initiative's worktree; the planning tools create it
- DEC-030 — rebase → attest → archive → merge, as one PR, gated on state consistency
- DEC-031 — archive consumes compact; compact stays safe to run early
- DEC-032 — evidence is a CI artifact; the pipeline exemption rides the next initiative
- DEC-033 — attest loads the bar and the evidence, never the diff, design or ADRs
- DEC-034 — `/opsp:backlog` persists; explore writes nothing (supersedes DEC-025)
- DEC-035 — initiative states gain `declined`
- DEC-036 — decisions named semantically, initiatives named chronologically
- DEC-037 — a strategy cell renders SWOT-like, compiled from the decisions it cites
- DEC-038 — a bar is written in BDD form, split by hat
- DEC-039 — `/opsp:triage` is its own tool, for explicitness rather than necessity
- DEC-ATTEST-CHANGE-FRAME — attest frames the change before it reads a bar
- DEC-STATE-MACHINE — transitions are side effects of tools, and the handoff is a state
- DEC-ESCALATION-LADDER — escalation has three rungs, and they are the OGSM altitudes
- DEC-HAT-HANDOFFS — reideate is explore, later; every transition names its hat
- DEC-BAR-AT-PROPOSE — the bar is written where the goal is, by the hat that owns it
- DEC-REEXPLORE-NAME — the tool keeps its name; only its definition moved

## Milestones

- [x] backlog-and-triage: `/opsp:backlog` and `/opsp:triage`; each creates or switches to the initiative's worktree if not already in one ([[DEC-029]]); explore reverts to writing nothing; propose becomes purely the formalizer; the `declined` state
- [x] git-contract: worktree at apply; rebase → attest → archive → merge; the PR-time state gate; git as a third input to the state check
- [x] compact-in-archive: archive consumes compact — **already satisfied when the milestone was reached.** `/opsp:archive` delegates the compile to `/opsp:compact` rather than synthesising `architecture.md` ([[DEC-014]]), and gates the merge on `compact check` and an empty Problems section in `compact board`. Nothing was left to build; verified rather than implemented.
- [x] attest-context: the narrow-context attest skill and evidence-as-CI-artifact shipped with [[lifecycle-beyond-build]]; this milestone added the half that was missing — `evidence-unresolvable`, which reports an attestation citing nothing addressable or a path not in the tree. Remote references are taken on trust: resolving them would put the network inside a compile.
- [x] record-naming: decisions are coined semantically and initiative filenames carry a creation-date prefix ([[DEC-036]]). `RECORD_ID_PATTERN` was widened ahead of the milestone, as a prerequisite to naming [[surrogate-currency]]'s decisions semantically — the numbered era stopped at `DEC-044`. This milestone removed the remaining number allocation from `/opsp:decide` and `/opsp:propose`, moved every reader to resolution by frontmatter `id:`, and renamed all five existing initiative files.
- [x] sub-frameworks: SWOT-like strategy rendering compiled from cited ADRs ([[DEC-037]]) and BDD bar forms split by hat ([[DEC-038]]). `BAR_FORMS` and `SWOT_SOURCES` hold the vocabulary in code so the skill and the harvest cannot drift; `bar-without-form` makes the form mechanical. The BDD form is **additional to** the spectrum, not a replacement — the spectrum says where the bar sits and what that cost, the BDD says what a pipeline runs to tell you it still sits there.
- [x] attest-frame: `/opsp:attest` resolves `source → base` and has the operator confirm it before reading a bar ([[DEC-ATTEST-CHANGE-FRAME]]). Found by using the tool: the attester could not know what change it was reviewing, so the operator had to narrate it. Added after the other six closed — attestation is change management, and this is the orientation step it was missing.
- [x] state-machine: the initiative state machine, which `DEC-035` named and nothing implemented ([[DEC-STATE-MACHINE]]). Six states now, with `ready-for-attestation` for the handoff; eight transitions performed by `opensprint advance` rather than described in prose. Found by asking where states get written and discovering that `/opsp:propose`'s template had no `state:` field at all, so `proposed` was never written by anything and `/opsp:archive`'s gate on `attested` could never pass.
- [x] escalation-ladder: escalation splits into three rungs, which are the OGSM altitudes ([[DEC-ESCALATION-LADDER]]). `/opsp:repropose` is new — the strategy rung, superseding ADRs and returning the initiative to `proposed`; `/opsp:reexplore` is declared the plan rung; `/opsp:attest` gains a change request and a repropose exit. Found during this initiative's own attestation, which is where it would be found: an operator saying 'we decided that wrongly' had nowhere to go.
- [x] hat-handoffs: the ladder corrected on contact ([[DEC-HAT-HANDOFFS]]). `/opsp:reexplore` became `/opsp:reideate` and moved to the goal rung — `/opsp:explore` with the work in hand, writing nothing, rejoining `backlog → triage → propose`; the old definition was `/opsp:repropose`'s all along. Repropose absorbed the plan rung and may now amend `## Measures`, guarded by: a bar that got easier is a goal that moved. Every transition declares its hat, and `opensprint advance` refuses a handoff until `--hat` names one.
- [x] bar-at-propose: the bar is written where the goal is ([[DEC-BAR-AT-PROPOSE]]). Three documents said `/opsp:propose` writes the bar and no instruction did — propose and `/opsp:driver` never mentioned `## Measures`, so the primary path created driver-specs with no hat, no role and no measures. Also reclassifies `/opsp:repropose` as `create` mode: the distinction is whose record it is, and repropose wears the hat that wrote the bar. Found by the operator questioning a risk I had recorded wrongly.
- [x] reexplore-name: the rename reverted ([[DEC-REEXPLORE-NAME]]). The tool keeps the name it has had since the beginning; only its definition moved. "Reexplore" names what it does — redo the explore process — where "reideate" named the altitude, and an operator reaching for a fallback asks what to run. The rename had also created a duplicate capability, `opsp-reideate-workflow`, while `opsp-reexplore-workflow` still held four requirements describing `/opsp:repropose`'s job; those are removed with migrations and the two are merged.

**This initiative depends on [[lifecycle-beyond-build]]** and cannot start until `measure-anatomy`, `initiative-state` and `attest-tool` exist — attest has nothing to write into, and `declined` has no state machine to join, until they do.

`record-naming` carried two ordering constraints, both now discharged. `RECORD_ID_PATTERN` had to widen **before** the first semantic decision id was written, or the rule harvest would have gone silently blind to every new decision — so that half was pulled forward and landed with [[surrogate-currency]]. Initiative filenames had to stay unprefixed until `initiative-parser` resolved by frontmatter `id:`, because the skills constructed `initiatives/<name>.md` directly; that landed with [[lifecycle-beyond-build]], and the prefix followed here.

This initiative's own file was unprefixed for that reason. It is `20261009-sdlc-operating-contract.md` now — the convention applied to itself the moment it shipped.

## OPSX Changes

- `openspec/changes/archive/2026-10-11-backlog-and-triage/`
- `openspec/changes/archive/2026-10-11-git-contract/`
- `openspec/changes/archive/2026-10-11-attest-context/`
- `openspec/changes/archive/2026-10-11-record-naming/`
- `openspec/changes/archive/2026-10-11-sub-frameworks/`
- `openspec/changes/archive/2026-10-11-attest-frame/`
- `openspec/changes/archive/2026-10-11-state-machine/`
- `openspec/changes/archive/2026-10-11-escalation-ladder/`
- `openspec/changes/archive/2026-10-11-hat-handoffs/`
- `openspec/changes/archive/2026-10-11-bar-at-propose/`
- `openspec/changes/archive/2026-10-11-reexplore-name/`

## Attestation

- **frame**: `opsp/sdlc-operating-contract` against `origin/main`, `2c24097..a018238`, 90 commits — confirmed by the operator; anything committed after `a018238` is outside this attestation
- **door**: two-way — the merge reverts with `git revert` and no data migration; nothing publishes on merge, because the release workflow runs only on the upstream repository. Two parts are one-way: an npm publish (a version number cannot be reused), and a downstream project that writes semantic decision ids under the new version may not read them back after a downgrade to 0.0.9
- **blast-radius**: the `/opsp:backlog`, `/opsp:triage`, `/opsp:explore`, `/opsp:propose` and `/opsp:archive` skills (explore now writes nothing; backlog and triage create worktrees), the new `frame` command, `evidence-unresolvable` and `bar-without-form`, semantic decision ids and date-prefixed initiative filenames, the initiative state machine and `opensprint advance` (six states, `ready-for-attestation` as the handoff), the escalation ladder with `/opsp:repropose` and `/opsp:reexplore`, named hats on every transition, the bar written at `/opsp:propose` and `/opsp:driver`, and the published documentation — about 3,700 lines of upstream OpenSpec docs removed. Adopter projects are the operator's own; the merge-gate exposure on `DS-SURROGATE-GIT-CONTRACT` applies to every one of them

### RACI

| Concern | Handled by | R | A | C | I |
|---|---|---|---|---|---|
| build, test, typecheck and lint regressions | system — GitHub Actions `ci.yml` on pull requests to `main` | — | — | — | — |
| an `opsp/*` branch merging unattested, or with stale views | **not automated** — no surrogate job runs `compact check` or a state check in this repository | Ivan Lee | Ivan Lee | — | — |
| npm release, and telling adopter projects to run `opensprint update` | **not automated** — the release workflow is gated to the upstream repository | Ivan Lee | Ivan Lee | — | — |
| agent behaviour in adopter projects — escalation, attest scope and triage are tested as instruction text only | **not automated** | Ivan Lee | Ivan Lee | — | — |

## Open Questions

- **Cross-branch listing of initiatives — now blocking, not deferred.** [[DEC-029]] was reversed on contact with practice: planning lives in the initiative's worktree, so **every** initiative is on its own branch from birth, backlog items included. No branch can see them all. That breaks the one interaction [[DS-HATS-AS-CONTEXT]] grants a non-technical stakeholder — an agent reading the compiled board on their behalf — because the board now shows only the current branch. The forge's branch view is a stopgap, not an answer. If this proves unsolvable at acceptable cost, the fallback is splitting [[DEC-029]]: the backlog on `main`, proposals on branches.

- **Published documentation surface** (`docs/internal/<hat>`) remains out of scope, following the [[DEC-015]] precedent. The two surfaces differ by audience and density: `opensprint/` is the **operating** surrogate, detailed, the full brain an agent reads to do the work; `docs/internal/<hat>` is a **far more condensed** account for internal stakeholders and senior management of what has been done. Publishing was the original motivation for this whole line of thinking and then proved not to be the dependency — the surrogate needs condensation regardless. Format (HTML for wiki-readiness) is a sub-question of that one.

- **A retro section on every change and initiative.** Reached for repeatedly and not yet modelled. It overlaps `/opsp:attest` without being the same thing — attest asks whether the bar was met and with what evidence, which is a retro's spine but not its whole body. Worth exploring once attest exists, so the retro can be defined against something concrete rather than invented alongside it.
