---
id: sdlc-operating-contract
status: active
state: proposed
created: 2026-10-09
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

## Milestones

- [ ] backlog-and-triage: `/opsp:backlog` and `/opsp:triage`; each creates or switches to the initiative's worktree if not already in one ([[DEC-029]]); explore reverts to writing nothing; propose becomes purely the formalizer; the `declined` state
- [ ] git-contract: worktree at apply; rebase → attest → archive → merge; the PR-time state gate; git as a third input to the state check
- [ ] compact-in-archive: archive consumes compact
- [ ] attest-context: the narrow-context attest skill; evidence as a CI artifact reference, with a harvest rule for references that do not resolve
- [ ] record-naming: widen `RECORD_ID_PATTERN`, then stop allocating decision numbers; date-prefix initiative filenames once `initiative-parser` resolves by frontmatter `id:`
- [ ] sub-frameworks: SWOT-like strategy rendering compiled from cited ADRs; BDD bar forms split by hat

**This initiative depends on [[lifecycle-beyond-build]]** and cannot start until `measure-anatomy`, `initiative-state` and `attest-tool` exist — attest has nothing to write into, and `declined` has no state machine to join, until they do.

`record-naming` carries two ordering constraints that cannot be taken on trust. `RECORD_ID_PATTERN` must widen **before** the first semantic decision id is written, or the rule harvest goes silently blind to every new decision. Initiative filenames must stay unprefixed until `initiative-parser` resolves by frontmatter `id:`, because skills construct `initiatives/<name>.md` directly today.

This initiative's own file is unprefixed for that reason — the convention it establishes cannot apply to it until it ships.

## Open Questions

- **Cross-branch listing of initiatives — now blocking, not deferred.** [[DEC-029]] was reversed on contact with practice: planning lives in the initiative's worktree, so **every** initiative is on its own branch from birth, backlog items included. No branch can see them all. That breaks the one interaction [[DS-HATS-AS-CONTEXT]] grants a non-technical stakeholder — an agent reading the compiled board on their behalf — because the board now shows only the current branch. The forge's branch view is a stopgap, not an answer. If this proves unsolvable at acceptable cost, the fallback is splitting [[DEC-029]]: the backlog on `main`, proposals on branches.

- **Published documentation surface** (`docs/internal/<hat>`) remains out of scope, following the [[DEC-015]] precedent. The two surfaces differ by audience and density: `opensprint/` is the **operating** surrogate, detailed, the full brain an agent reads to do the work; `docs/internal/<hat>` is a **far more condensed** account for internal stakeholders and senior management of what has been done. Publishing was the original motivation for this whole line of thinking and then proved not to be the dependency — the surrogate needs condensation regardless. Format (HTML for wiki-readiness) is a sub-question of that one.

- **A retro section on every change and initiative.** Reached for repeatedly and not yet modelled. It overlaps `/opsp:attest` without being the same thing — attest asks whether the bar was met and with what evidence, which is a retro's spine but not its whole body. Worth exploring once attest exists, so the retro can be defined against something concrete rather than invented alongside it.
