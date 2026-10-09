---
id: lifecycle-beyond-build
status: active
state: building
created: 2026-10-01
---

## Description

The framework sets bars well and never comes back for them.

`/opsp:propose` produces a spec that is an acceptance criterion, handed to an engineer without other detail. That half works. What has never existed is the half that asks whether the bar was met, what asserts it, and what remains exposed if it was not — **the lifecycle outside of code implementation itself**.

This initiative builds that half, and two things it turns out to require.

The first is **shape**. The `maintainer` hat is the technical product manager — a branch of product running the same OGSM, with inherited rather than discovered objectives ([[DS-MAINTAINER-INHERITED]]). Seven of them. Beneath each sits a goal, a strategy held at senior-management altitude ([[DS-STRATEGY-ALTITUDE]]), and a measure — and a measure has four parts, the same four for every hat ([[DS-MEASURE-ANATOMY]]). `bar` is written ex ante at proposal; `posture`, `evidence` and `exposure` are written ex post, by nothing that currently exists.

The second is **state**. An exposure that points nowhere is a confession; an exposure pointing at planned work is a managed risk ([[DS-FORWARD-CLOSURE]]), which requires the thing it points at to have a state. So an initiative stops being a descriptor written at proposal time and becomes a container born at intake, filling as work crystallizes ([[DS-PROGRESSIVE-CRYSTALLIZATION]]). `/opsp:explore` persists it; nothing else about the explore guardrail changes.

With both in place, `/opsp:attest` has somewhere to write and something to point at. It records what is true with evidence, and never gates ([[DEC-023]]) — the boundary that keeps this inside [[DS-SURROGATE-SCOPE]] rather than sliding into certification.

The payoff is honesty in the compiled output. Today `architecture.md` states *"Operator-only reconciliation — absolute, not a preference"* under **Constraints & Non-Negotiables**, while `squad/maintainer.md`, compiled in the same pass from the same records, admits *"the guardrail is instruction text in a skill, which no rule reads."* Neither is wrong. The compiler has only two citation authorities and needs a third ([[DEC-021]]), because **nothing can be documented as true until it is attested** ([[DS-ATTESTED-TRUTH]]).

### Where the tool sits in the lifecycle

```
   REAL WORLD -- clients · regulators · incidents · cost · the market
        |
        |   /opsp:driver  (external truth)    /opsp:knockdown  (brownfield)
        v
  +------------------------------------------------------------------+
  | 1  TRIAGE                                        /opsp:explore    |
  +------------------------------------------------------------------+
  | a backlog, thought through at architect altitude                  |
  | ARTIFACTS  the initiative, at state: exploring     <-- NEW        |
  +------------------------------------------------------------------+
        |
        v
  +------------------------------------------------------------------+
  | 2  SET THE BAR                                   /opsp:propose    |
  +------------------------------------------------------------------+
  | classify -> driver-specs · ADRs · initiative + milestones         |
  | ARTIFACTS  opensprint/driver-specs/  ADRs/  initiatives/          |
  |                                                                   |
  | >> the BAR is written here. ex ante. <<                           |
  +------------------------------------------------------------------+
        |
        v
  +------------------------------------------------------------------+
  | 3  BUILD                                /opsp:apply -> opsx       |
  +------------------------------------------------------------------+
  | per milestone:                                                    |
  |   opsx:explore -> propose -> apply -> verify -> archive           |
  |                                                                   |
  | ARTIFACTS  openspec/changes/<name>/{proposal,design,tasks,specs}  |
  |            openspec/specs/     code · tests · rules               |
  |                                                                   |
  | ambiguity --> /opsp:decide   writes an ADR, loops back to (2)     |
  | /opsp:review  commit graph, branch-level review                   |
  +------------------------------------------------------------------+
        |
        v
  ####################################################################
  # 4  MEET THE BAR                        /opsp:attest   <-- NEW    #
  ####################################################################
  #   posture   was the bar met? if no bar -- the honest position    #
  #   evidence  what artifact asserts it                             #
  #   exposure  residual risk + what is planned to mitigate it       #
  #                                                                  #
  #   ex post · HITL · amends the record's ## Measures block         #
  #   writes a record. never gates.                                  #
  ####################################################################
        |
        v
  +------------------------------------------------------------------+
  | 5  COMPILE                      /opsp:archive  ·  /opsp:compact   |
  +------------------------------------------------------------------+
  | DERIVED -- never hand-edited (DEC-006). one hop (DEC-011).        |
  | ARTIFACTS  squad/{index,product,maintainer,dev,devops}.md         |
  |            architecture.md  DECISION-MAP.md                       |
  |            BOARD.md  <-- NEW: doing · next · roadmap              |
  +------------------------------------------------------------------+
        |
        v   compact check -- drift fails the build (DEC-010)
        |
        +---------------->  back to (1) as harvested open loops

  --------------------------------------------------------------------
  SIDE RAILS -- orthogonal to the spine, not stages of it
    /opsp:tree            visualize decisions + blast radius
    /opsp:rebuild-assess  a driver-spec changed -> cascade re-evaluation
    /opsp:rebase          converge two universes   | each universe runs
    /opsp:abandon         declare a winner         | the whole spine
```

Before this initiative the loop runs `1 -> 2 -> 3 -> 5 -> 1`. Stage 4 is skipped, so what returns to triage is only graph defects — `constraint-unmeasurable`, `decision-unguarded`, `record-unclassified` and the rest. Every open-loop kind the harvest can currently produce is a property of the **record graph**. Not one is a property of an **outcome**.

`opsx:verify` does not fill it: it verifies that implementation matches change artifacts — conformance to spec. "Did we build what we said" is a different question from "did what we built clear the bar."

### The initiative as a progressively-filled container

```
  INITIATIVE -- one record, born at intake, filled through the lifecycle

  /opsp:explore   /opsp:propose    /opsp:apply   /opsp:attest   /opsp:archive
       |               |                |             |              |
       v               v                v             v              v
  +----------+-----------------+------------+---------------+-----------+
  |OBJECTIVE | STRATEGY        | milestones | POSTURE       | compiled  |
  |GOAL      | MEASURE (bar)   | executing  | EVIDENCE      | into      |
  |          |                 |            | EXPOSURE --+  | views     |
  +----------+-----------------+------------+------------+--+-----------+
   state:     state:            state:       state:      |   state:
   exploring  proposed          building     attested    |   completed
                                                         |
                              +--------------------------+
                              v
                    mitigated-by: <initiative>  -->  back to intake
```

An initiative is an epic; a milestone is a group of tickets or a large ticket on its own; an openspec change is a ticket. Which cells are filled *is* the state — the same pattern as a half-written measure, one level up.

The assurance gradient this produces is the reason exposures are worth recording at all:

```
  exposure --> nothing                      a confession
  exposure --> initiative (exploring)       we know, we are thinking
  exposure --> initiative (proposed)        committed, with a bar
  exposure --> initiative (building)        in flight
```

## Driver Specs

- DS-MAINTAINER-INHERITED
- DS-MEASURE-ANATOMY
- DS-STRATEGY-ALTITUDE
- DS-ATTESTED-TRUTH
- DS-FORWARD-CLOSURE
- DS-PROGRESSIVE-CRYSTALLIZATION

## ADRs

- DEC-018 — the six are maintainer's shipped section list; `objective` selector; `role` as a list
- DEC-019 — measure anatomy as optional sub-blocks under `## Measures`
- DEC-020 — maintainer strategies cite their implementers; the citation rule enforces altitude
- DEC-021 — `attested` as a third citation authority
- DEC-022 — `/opsp:attest` is a separate tool, not a phase of compact
- DEC-023 — attest writes a record and never gates
- DEC-024 — initiative state is declared by the tool and checked by code
- DEC-025 — `/opsp:explore` persists the initiative and only the initiative
- DEC-026 — `BOARD.md` as a compiled sibling of `DECISION-MAP.md`
- DEC-027 — record amendment as a third write mode
- DEC-028 — a decision is owned by dev/devops, carries no role, and may cc other hats

## Milestones

- [x] maintainer-objectives: Ship the seven as the maintainer hat's default section list; add the `objective` selector; widen `role` to a list; exempt decisions from role classification per DEC-028
- [x] measure-anatomy: Optional `### Bar/Posture/Evidence/Exposure` sub-blocks under `## Measures`; migrate DS-HIGH-IMPACT-OPS and DS-BACKWARD-COMPAT; harvest `measure-unasserted`, `measure-unexposed`, `bar-without-neighbour`
- [x] strategy-altitude: Maintainer strategies render position plus citation; harvest `strategy-unimplemented`
- [x] initiative-parser: The first deterministic half for initiatives — frontmatter, milestones, membership
- [x] initiative-state: The OGSM state machine, plus the state-versus-content check
- [~] explore-persists: **superseded by [[DEC-034]]** — `/opsp:explore` reverts to writing nothing; `/opsp:backlog` persists instead. The work moved to `backlog-and-triage` in [[sdlc-operating-contract]]. No code in this initiative.
- [x] board-view: Compile `BOARD.md` — doing, next, roadmap — from record state
- [x] attested-authority: Third citation authority; compact visibly distinguishes decided, observed and attested
- [ ] attest-tool: The `/opsp:attest` skill, with bounded record amendment
- [ ] forward-closure: `mitigated-by` edges; harvest `exposure-unmitigated`; the board renders exposures beside their mitigation state

## Progress

**1/10 — `maintainer-objectives`** · opsx change `2026-10-09-maintainer-objectives` · continuous review mode

Shipped the seven objectives as maintainer's default sections, the `objective` selector, `role` as a list, `heading` on a section, and the `DEC-028` exemption. On this repository `record-unclassified` went 6 → 0, and citing `DEC-018`/`DEC-028` in the new tests closed their `decision-unguarded` loops — the loop closing on itself.

**Discovered:** the proposal claimed this repository's hand-authored maintainer shape would keep working. It would not have. `openspec/config.yaml` declared `maintainer.roles` but not `maintainer.sections`, so roles stayed `bar/posture/evidence/exposure` while sections fell through to the new seven, which select on `goal`/`strategy` — every maintainer section would have compiled empty. The four sections are now pinned explicitly, and `measure-anatomy` removes the pin when it migrates the records.

**2/10 — `measure-anatomy`** · opsx change `2026-10-09-measure-anatomy`

The measure gained its four parts as optional sub-blocks under `## Measures`, a new `measures.ts` owning that section, and three harvest rules. Both of this repository's bars migrated — `DS-HIGH-IMPACT-OPS` to `integrity-correctness`, `DS-BACKWARD-COMPAT` to `change-quality` — and milestone 1's config pin is gone. The grid now renders with two rows filled and five empty, which is `DS-FULL-COVERAGE` made positional exactly as intended.

`measure-unasserted` and `measure-unexposed` fire on 18 and 17 records respectively. That is not noise: nothing in the repository has been attested, because `/opsp:attest` does not exist until milestone 9. The ex-post half of every measure is genuinely unwritten, and the harvest is now able to say so — which it could not before.

**Discovered:** milestone 1 shipped no hat-level `posture` section, so `DS-SELF-USE-SCOPE` was selected by nothing; and five records written during planning carried no `objective`, so the maintainer view dropped them silently. Both fixed, plus a new `record-without-objective` loop so the second class cannot recur.

**3/10 — `strategy-altitude`** · opsx change `2026-10-09-strategy-altitude`

The smallest milestone, because `DEC-020` was right that the altitude needs no new guard: `DEC-009` already requires every claim to cite a record, and a mechanism detail belongs to a decision the maintainer hat does not own. What was missing was the inverse — `strategy-unimplemented`, transitive through `depends-on`, naming no hat.

Sixteen strategies on this repository, one gap: `DS-BIG-PICTURE`, which `squad/product.md` had already noticed by hand. The rule is not over-reporting.

**Discovered:** the skill template still documented `bars · posture · evidence · exposure` and a seven-kind loop table — milestones 1 and 2 changed the engine and left the rendering contract behind. Rewritten: the grid, the posture preamble, the strategy altitude, the measure anatomy, eleven loop kinds.

**4/10 — `initiative-parser`** · opsx change `2026-10-09-initiative-parser`

`src/core/initiatives.ts` gives initiatives a deterministic half for the first time: frontmatter, milestones, membership, and resolution by frontmatter `id` before filename — which is what lets `DEC-036` date-prefix these files without touching a single skill. All four initiatives here parse, including the two predating the `state` field.

**Discovered:** `/opsp:reexplore` appends milestones under a dated heading rather than into `## Milestones`. `compact-surrogate` keeps `documentation-rewrite` under `## Added at re-exploration, 2026-09-27`, so strict scoping would have dropped a real milestone silently. Added `orphanedMilestones` carrying the section each was found under; the real fix belongs in re-exploration's output format.

**5/10 — `initiative-state`** · opsx change `2026-10-09-initiative-state`

The OGSM state machine, with `declined` from `DEC-035`. The check reports **contradictions** rather than comparing against a derived state — an initiative legitimately sits between stages, and `DEC-024` rejected full derivation one layer up for the same reason. Four contradiction rules: exploring with work done, attested or completed with work outstanding, proposed with nothing proposed, building with nothing to build.

`attested` and `completed` are deliberately not distinguished from content, because nothing separates "every milestone done" from "every bar attested" until milestone 9. The check records the limitation rather than guessing.

No state problems on this repository — both older initiatives are `completed` and correctly silent. The check was confirmed to fire by test rather than inferred from the quiet result.

**6/10 — `explore-persists`** · **superseded, no work done**

[[DEC-025]] had `/opsp:explore` persist the initiative, a compromise reached because persistence had nowhere else to live. [[DEC-034]] gave it somewhere — `/opsp:backlog` — and reverted explore to its original guardrail: it writes nothing. Both decisions were made in the same planning session, and this milestone was written against the earlier one.

Implementing it as written would have built behaviour we deliberately replaced. The work lives in `backlog-and-triage`, milestone 1 of [[sdlc-operating-contract]].

**7/10 — `board-view`** · opsx change `2026-10-09-board-view`

`opensprint/BOARD.md` compiles from initiative state — Backlog, Next, Doing, Done, Declined, plus a Roadmap section that names what will land there once `mitigated-by` exists. Generated by code with no skill in the loop, so regenerated rather than staleness-gated: `compact check` catches a skill disagreeing with its sources, and there is none here to disagree. Byte-identical across runs.

The Problems section carries the state check and orphaned milestones, because both describe ways the board would otherwise look complete while being wrong.

**Discovered:** the `[~]` superseded marker — introduced earlier this session for milestone 6 — was not recognised by the parser, so that line vanished and the board under-reported. Now first-class: parsed, listed, excluded from progress rather than holding an initiative open.

**8/10 — `attested-authority`** · opsx change `2026-10-09-attested-authority`

The third authority. `### Posture` carries `verdict`, `attested-by` and `attested-on` as labelled lines; `attestationOf` computes the authority from content rather than from a frontmatter claim, so it cannot drift from the evidence. **Attested requires both a date and evidence** — a verdict nothing asserts is an opinion.

All 57 staged records report `decided`. That is not a gap in the implementation; it is the finding `DS-ATTESTED-TRUTH` was written to surface, and it stays true until milestone 9.

The rendering contract now carries the real failure as its worked example: `architecture.md` calling operator-only reconciliation "absolute, not a preference" while `squad/maintainer.md`, compiled in the same pass from the same records, admitted the guardrail was instruction text no rule read.

Dependency order is forced: attest has nothing to write into until `measure-anatomy` lands, and nothing to point `mitigated-by` at until `initiative-state` lands.

**Continues in [[sdlc-operating-contract]]**, which carries the process and git contract built on this shape. That initiative depends on this one — it cannot start until `measure-anatomy`, `initiative-state` and `attest-tool` exist.

## Open Questions

- **Is `risk` a fifth part of the measure anatomy?** The recorded four are bar / posture / evidence / exposure, with exposure holding residual risk and its mitigation. Raised once as a possible split — exposure as *what is exposed*, risk as *likelihood and impact* — and not settled. Nothing downstream depends on it.
