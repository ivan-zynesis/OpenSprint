# Architecture

Compiled by `/opsp:compact` from `opensprint/driver-specs/`, `opensprint/ADRs/` and the system
itself. **Derived — do not edit.** A peer of the per-hat views in `opensprint/squad/`, compiled from
the same sources in the same pass (`DEC-014`).

Claims cite a **record id** where a decision established them, and a **path** where they were
observed from the system. **No claim here is attested** — nothing in this surrogate has been
assessed against evidence, so what follows describes what was decided and what can be observed, not
what is known to be true (`DS-ATTESTED-TRUTH`).

## System Overview

OpenSprint is an AI-native engineering harness. Its premise is that agents can execute
multi-milestone initiatives when guided by a persistent **surrogate** — driver-specs, decision
records and compiled state that accumulate knowledge and answer agent questions without an operator
at every step.

The objective is to power an entire engineering team at a standard where the detail across dev, sec
and ops is all taken care of, regardless of whether the participants are human or agent
(`DS-AGENTIC-SDLC`). The premise underneath: **code became cheap**, so connecting context and
building the knowledge base are the load-bearing activities.

It is a self-use tool released as open source, deliberately not competing with provider tooling
(`DS-SELF-USE-SCOPE`), which is why its surface is a CLI plus generated agent files with no GUI and
no infrastructure of its own (`DEC-017`).

## Driver Specs

**Functional intent** — a chain: the objective above, reached through four goals. Cover all four
accountabilities (`DS-FULL-COVERAGE`); make documentation a compiled output rather than a second
effort (`DS-DOCUMENTATION-AS-OUTPUT`); **document nothing as true until it is attested**
(`DS-ATTESTED-TRUTH`); and keep surrogate loading within the session budget
(`DS-SURROGATE-BUDGET`, measured at 93–157K across four projects).

Fourteen strategies pursue them, in four groups. **Shaping knowledge**: four hats
(`DS-SQUAD-HATS`), a hat as a loaded context rather than a person (`DS-HATS-AS-CONTEXT`), one owner
per hat (`DS-SME-OWNERSHIP`), views that select rather than enumerate (`DS-BIG-PICTURE`), maintainer
as the technical product manager with inherited objectives (`DS-MAINTAINER-INHERITED`) stating
positions and never mechanisms (`DS-STRATEGY-ALTITUDE`). **Committing and checking**: the four-part
measure (`DS-MEASURE-ANATOMY`), and evidence as a CI artifact (`DS-CI-ATTESTATION`). **Closing the
loop**: mechanically backward (`DS-LOOP-CLOSURE`) and forward through mitigation pointers
(`DS-FORWARD-CLOSURE`). **Moving work**: initiatives as containers that fill
(`DS-PROGRESSIVE-CRYSTALLIZATION`), one PR attested before merge (`DS-SURROGATE-GIT-CONTRACT`),
concurrent universes (`DS-PARALLEL-EXEC`), and a scope that stops at the surrogate
(`DS-SURROGATE-SCOPE`).

**Non-functional intent** — two bars and a posture, held by `maintainer`. Reconciliation is
operator-invocable only, because a corrupted surrogate has unbounded blast radius
(`DS-HIGH-IMPACT-OPS`). Compatibility is best-effort and means one thing: a new release meeting a
project written by an older one (`DS-BACKWARD-COMPAT`). The posture is self-use, which is what makes
an empty infrastructure story and a missing GUI acceptable rather than defects
(`DS-SELF-USE-SCOPE`).

## Architectural Decisions

**Universes are worktrees.** `opensprint/` lives in its branch and travels with the code
(`DEC-001`). Reconciliation traverses depth-first with the initiative as the unit of commitment
(`DEC-003`), behind a mandatory read-only planning phase (`DEC-004`); the agent auto-accepts only
purely additive or identical content (`DEC-002`), and an abandoned universe is archived with a
pre-migration snapshot (`DEC-005`).

**The compacted surrogate.** Views are compiled and never hand-edited — if a view is wrong, the
system is wrong (`DEC-006`) — and open loops are the backlog that `/opsp:explore` triages
(`DEC-007`). Every compiled claim cites its records inline (`DEC-009`), a provenance manifest gates
drift (`DEC-010`), and stale sections rebuild from full inputs rather than from the previous
rendering (`DEC-011`). Records declare one or more hats against a per-project registry (`DEC-016`),
while decisions are owned by `dev` or `devops`, carry no role, and may cc other hats (`DEC-028`).
compact is the single compile engine (`DEC-014`), consumed by archive (`DEC-031`).

**The hat shapes.** Maintainer ships seven inherited objectives as its section list, selected by an
`objective` field, with `role` widened to a list (`DEC-018`). A measure carries its anatomy as
optional sub-blocks under `## Measures` (`DEC-019`), its bar written in BDD form chosen by hat
(`DEC-038`), and its strategy rendered SWOT-like from the decisions it cites (`DEC-020`, `DEC-037`).

**Attestation.** `attested` is a third citation authority beside decided and observed (`DEC-021`).
`/opsp:attest` is a separate tool rather than a phase of compact, because compact compiles what is
known while attestation discovers what is true (`DEC-022`); it writes a record and never gates, the
line that keeps this inside `DS-SURROGATE-SCOPE` (`DEC-023`); it reads narrowly, excluding the diff,
the design and the ADR rationales (`DEC-033`); and it amends one bounded section, a third write mode
beside create and derive (`DEC-027`). Evidence is a CI artifact, with pipeline changes the named
post-merge exemption (`DEC-032`).

**Work as a tracked container.** Initiative state is declared by the tool and checked by code
(`DEC-024`), gaining `declined` as a terminal state (`DEC-035`). `/opsp:backlog` persists what
`/opsp:explore` deliberately does not (`DEC-034`), and `/opsp:triage` exists for lifecycle
explicitness rather than capability (`DEC-039`). `BOARD.md` compiles from that state (`DEC-026`).

**Git.** Planning happens in the initiative's worktree, created by the planning workflows
(`DEC-029`); closing runs rebase, attest, archive, merge as one pull request gated on state
consistency (`DEC-030`). Decisions are named semantically and initiatives chronologically
(`DEC-036`).

## System Structure

```
opensprint/                    the record — source of truth
  driver-specs/  ADRs/         constraints and decisions
  initiatives/                 work, as containers that fill
  DECISION-MAP.md  BOARD.md    generated, no skill in the loop
        │
        │  /opsp:compact — one engine (DEC-014)
        ▼
  architecture.md              this document  ─┐ peers, both one hop
  squad/  index · product · maintainer · dev · devops   ─┘ from the record
          .manifest.json       provenance (DEC-010)

src/core/           initiatives · hats · decision-map · board
src/core/compact/   sections · records · measures · manifest · status
                    rules · loops · edges · amend
src/commands/       compact: plan · seal · board · check · loops
src/core/templates/workflows/   15 OPSP workflows
```

**TypeScript on Node ≥20.19.0, ESM, distributed via npm as `@ivan-lee/opensprint`**
(`package.json`, `tsconfig.json`). No server, no persistent store: the CLI runs once per invocation
and the durable state is markdown with YAML frontmatter. Two GitHub Actions workflows — a full gate
on pull request and push, and changesets release preparation (`.github/workflows/`).

**The deterministic/synthetic split** is the load-bearing structure. Grouping, hashing, staleness,
gating and harvesting live in code so they can be verified without a model; condensing prose lives in
a skill. Neither half computes the other's answer (`DEC-010`, `DEC-014`). `DECISION-MAP.md` and
`BOARD.md` sit wholly on the deterministic side and are therefore regenerated rather than
staleness-gated (`DEC-026`).

## Constraints & Non-Negotiables

**Operator-only reconciliation** (`DS-HIGH-IMPACT-OPS`) — stated as absolute. *Decided, not
attested: the guardrail is instruction text in a skill, which no rule reads.*
**Planning before execution** (`DEC-004`) — no fast path.
**Bias toward escalation** (`DEC-002`) — only additive, high-confidence changes auto-accept.
**The record is the source of truth** (`DEC-006`) — compact never writes a record.
**Cited claims only** (`DEC-009`, `DEC-021`) — a record id, a path, or an attestation; and only the
last permits the present tense.
**Attest writes, never gates** (`DEC-023`) — a pass/fail exit would make this certification, which
`DS-SURROGATE-SCOPE` excludes.
**Amendment is bounded** (`DEC-027`) — `## Measures` only; revising a claim is a new decision.
**One hop from the record** (`DEC-011`, `DEC-014`) — no derived artifact compiles from another.
**Optional new fields** (`DS-BACKWARD-COMPAT`) — older records must still parse.
**Cross-platform** — every path via `path.join`; hashes sorted and line-ending normalised
(`DEC-010`), verified on ubuntu, macOS and Windows in CI.
