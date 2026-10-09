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
- [ ] measure-anatomy: Optional `### Bar/Posture/Evidence/Exposure` sub-blocks under `## Measures`; migrate DS-HIGH-IMPACT-OPS and DS-BACKWARD-COMPAT; harvest `measure-unasserted`, `measure-unexposed`, `bar-without-neighbour`
- [ ] strategy-altitude: Maintainer strategies render position plus citation; harvest `strategy-unimplemented`
- [ ] initiative-parser: The first deterministic half for initiatives — frontmatter, milestones, membership
- [ ] initiative-state: The OGSM state machine, plus the state-versus-content check
- [ ] explore-persists: `/opsp:explore` creates and updates the initiative at `state: exploring`
- [ ] board-view: Compile `BOARD.md` — doing, next, roadmap — from record state
- [ ] attested-authority: Third citation authority; compact visibly distinguishes decided, observed and attested
- [ ] attest-tool: The `/opsp:attest` skill, with bounded record amendment
- [ ] forward-closure: `mitigated-by` edges; harvest `exposure-unmitigated`; the board renders exposures beside their mitigation state

## Progress

**1/10 — `maintainer-objectives`** · opsx change `2026-10-09-maintainer-objectives` · continuous review mode

Shipped the seven objectives as maintainer's default sections, the `objective` selector, `role` as a list, `heading` on a section, and the `DEC-028` exemption. On this repository `record-unclassified` went 6 → 0, and citing `DEC-018`/`DEC-028` in the new tests closed their `decision-unguarded` loops — the loop closing on itself.

**Discovered:** the proposal claimed this repository's hand-authored maintainer shape would keep working. It would not have. `openspec/config.yaml` declared `maintainer.roles` but not `maintainer.sections`, so roles stayed `bar/posture/evidence/exposure` while sections fell through to the new seven, which select on `goal`/`strategy` — every maintainer section would have compiled empty. The four sections are now pinned explicitly, and `measure-anatomy` removes the pin when it migrates the records.

Dependency order is forced: attest has nothing to write into until `measure-anatomy` lands, and nothing to point `mitigated-by` at until `initiative-state` lands.

**Continues in [[sdlc-operating-contract]]**, which carries the process and git contract built on this shape. That initiative depends on this one — it cannot start until `measure-anatomy`, `initiative-state` and `attest-tool` exist.

## Open Questions

- **Is `risk` a fifth part of the measure anatomy?** The recorded four are bar / posture / evidence / exposure, with exposure holding residual risk and its mitigation. Raised once as a possible split — exposure as *what is exposed*, risk as *likelihood and impact* — and not settled. Nothing downstream depends on it.
