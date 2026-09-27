# OpenSprint

**An engineering harness for teams whose participants are human, agent, or both.**

Software development becomes real engineering when the detail across **dev, sec and ops** is all
taken care of. OpenSprint exists to hold a team to that standard at a scale beyond a single change
workflow — and to do it in a way an agent can participate in without the reasoning being lost.

Recorded as [`DS-AGENTIC-SDLC`](opensprint/driver-specs/DS-AGENTIC-SDLC.md). This README points at
what is true; it does not restate it.

---

## What it is, in one diagram

```
   THE RECORD                    what a team decided, and why
   ──────────
   driver-specs/     constraints: functional and non-functional
   ADRs/             decisions, each tracing to the constraint it answers
   DECISION-MAP.md   the decision tree, with blast radius
        │
        │  /opsp:compact  — one engine
        ▼
   THE VIEWS                     what a team needs to read
   ─────────
   squad/product.md        objective · goals · strategies · measures
   squad/maintainer.md     bars · posture · evidence · exposure
   squad/dev.md            tech-stack · runtime-topology · entity-schema
   squad/devops.md         infra-architecture · gitops
   architecture.md         the whole system, one hop from the record
```

**The record is the source of truth. The views are compiled and cannot drift from it** —
`opensprint compact check` fails the build when they do.

## Four hats

Accountability splits four ways. One person may wear several; an agent has to be told which it is
wearing.

| Hat | Owns the question | Produces |
|---|---|---|
| **product** | what must it **do**? | functional constraints |
| **maintainer** | what must be **true of it** while it does that? | non-functional constraints |
| **dev** | how is it **built**? | application code and its decisions |
| **devops** | how is it **stood up and kept running**? | infrastructure and its decisions |

The accountabilities do not move with team size. See
[`DS-SQUAD-HATS`](opensprint/driver-specs/DS-SQUAD-HATS.md).

## The loop

```
   driver-spec ──► ADR ──► implementation ──► rule
   a constraint    a       code or IaC        a check
   about the       decision                   that it holds
   world           answering it                   │
        ▲                                         │
        └───────── the rule fails ◄───────────────┘
                   an implementation and a decision disagree,
                   and somebody re-argues the constraint
```

Each arrow is a skill or a check rather than a meeting. **The last arrow is the one that matters**
— without it a process produces documents; with it, drift becomes a build failure. See
[`DS-LOOP-CLOSURE`](opensprint/driver-specs/DS-LOOP-CLOSURE.md).

`opensprint compact loops` reports where the loop is open: a constraint nobody decided, a decision
nothing guards, a rule still guarding something superseded.

---

## Getting started

```bash
# in your project
npx @ivan-zynesis/opensprint init

# existing codebase? reverse-engineer a surrogate from it first
/opsp:knockdown
```

A first cycle:

```bash
/opsp:explore          # think at initiative level, with the full surrogate loaded
/opsp:propose          # classify the conversation into driver-specs, ADRs, milestones
/opsp:apply <name>     # execute, escalating only what the surrogate cannot answer
/opsp:archive <name>   # compile the architectural state
```

## Workflows

**Lifecycle** — `/opsp:explore` · `/opsp:propose` · `/opsp:apply` · `/opsp:archive` ·
`/opsp:review` · `/opsp:reexplore`

**Records** — `/opsp:driver` (manage constraints) · `/opsp:decide` (record a decision) ·
`/opsp:tree` (decision tree and blast radius) · `/opsp:rebuild-assess` (what a changed constraint
invalidates)

**Compaction** — `/opsp:compact` (compile the views)

**Brownfield** — `/opsp:knockdown` (reverse-engineer a surrogate from existing code)

**Parallel universes** — `/opsp:rebase` (converge two initiatives) · `/opsp:abandon` (declare a
winner). Both are operator-only: a corrupted surrogate degrades every downstream agent operation
([`DS-HIGH-IMPACT-OPS`](opensprint/driver-specs/DS-HIGH-IMPACT-OPS.md)).

## CLI

```bash
opensprint compact plan     # what needs recompiling, and which records feed it
opensprint compact seal     # record the current views in the provenance manifest
opensprint compact check    # fail when a view is stale, tampered or unsealed
opensprint compact loops    # report where the loop is open
```

`check` is the gate. It never writes — a gate that can repair what it checks is not a gate.

---

## Which documents can be trusted, and why

| | Claims | Can it drift? |
|---|---|---|
| `opensprint/squad/*`, `architecture.md` | what is true **now** | No — compiled, and `compact check` fails on drift |
| [`PHILOSOPHY.md`](PHILOSOPHY.md) | what was thought **then** | No — it is dated history |
| this README | where to **find** what is true | Only if a link rots |
| [`docs/`](docs/) | how to use the CLI | Authored |

## Relationship to OpenSpec

OpenSprint is a layer above [OpenSpec](https://github.com/Fission-AI/OpenSpec), from which it was
forked. OPSX handles one change: explore, propose, apply, archive. OpenSprint handles the level
above — initiatives spanning many changes, and the accountabilities a team carries across all of
them.

Running a quick change against a brownfield project is still OPSX's job, and it does it well.
Different ambition, same premise.

## Documentation

- [`opensprint/squad/index.md`](opensprint/squad/index.md) — what this project is, by hat
- [`PHILOSOPHY.md`](PHILOSOPHY.md) — where it came from
- [`docs/`](docs/) — CLI reference, configuration, supported tools

## License

MIT
