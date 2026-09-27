# Architecture

Compiled by `/opsp:compact` from `opensprint/driver-specs/`, `opensprint/ADRs/` and the system
itself. **Derived — do not edit.** A peer of the per-hat views in `opensprint/squad/`, compiled
from the same sources in the same pass (`DEC-014`).

Claims cite a **record id** where a decision established them, and a **path** where they were
observed from the system.

## System Overview

OpenSprint is an AI-native engineering harness. Its premise is that agents can execute
multi-milestone initiatives when guided by a persistent **surrogate** — driver-specs, decision
records and compiled state that accumulate knowledge and answer agent questions without an
operator at every step.

The objective is to power an entire engineering team at a standard where the detail across dev,
sec and ops is all taken care of, regardless of whether the participants are human or agent
(`DS-AGENTIC-SDLC`). The premise underneath: **code became cheap**, so connecting context and
building the knowledge base are the load-bearing activities.

It is a self-use tool released as open source, deliberately not competing with provider tooling
(`DS-SELF-USE-SCOPE`), which is why its surface is a CLI plus generated agent files with no GUI
and no infrastructure of its own (`DEC-017`).

## Driver Specs

**Functional intent** — a chain: the objective above, reached through goals that cover all four
accountabilities (`DS-FULL-COVERAGE`), make documentation a compiled output rather than a second
effort (`DS-DOCUMENTATION-AS-OUTPUT`), and keep surrogate loading within the session budget
(`DS-SURROGATE-BUDGET`, measured at 93–157K across four projects). Those are pursued through six
strategies: four hats (`DS-SQUAD-HATS`), a mechanically closing loop (`DS-LOOP-CLOSURE`), one
owner per hat (`DS-SME-OWNERSHIP`), views that select rather than enumerate (`DS-BIG-PICTURE`),
concurrent universes (`DS-PARALLEL-EXEC`), and a scope that stops at the surrogate
(`DS-SURROGATE-SCOPE`).

**Non-functional intent** — two bars and a posture. Reconciliation is operator-invocable only,
because a corrupted surrogate has unbounded blast radius (`DS-HIGH-IMPACT-OPS`). Compatibility is
best-effort and means one thing: a new release meeting a project written by an older one
(`DS-BACKWARD-COMPAT`). The posture is self-use, which is what makes an empty `devops` hat and a
missing GUI acceptable rather than defects (`DS-SELF-USE-SCOPE`).

## Architectural Decisions

**Universes are worktrees.** `opensprint/` lives in its branch and travels with the code
(`DEC-001`). Reconciliation traverses depth-first with the initiative as the unit of commitment
(`DEC-003`), behind a mandatory read-only planning phase (`DEC-004`); the agent auto-accepts only
purely additive or identical content (`DEC-002`), and an abandoned universe is archived with a
pre-migration snapshot (`DEC-005`).

**The compacted surrogate.** Views are compiled and never hand-edited — if a view is wrong, the
system is wrong (`DEC-006`) — and open loops are the backlog that `/opsp:explore` triages
(`DEC-007`). Every compiled claim cites its records inline (`DEC-009`), a provenance manifest
gates drift (`DEC-010`), and stale sections rebuild from full inputs rather than from the previous
rendering (`DEC-011`). Records declare one or more hats against a per-project registry (`DEC-016`,
superseding `DEC-012`); the rules that guard them are harvested from code (`DEC-013`). compact is
the single compile engine (`DEC-014`), and switching what explore and apply load is deferred until
the views are proven (`DEC-015`).

## System Structure

```
opensprint/                    the record — source of truth
  driver-specs/  ADRs/         constraints and decisions
  DECISION-MAP.md              decision tree + blast radius (generated)
        │
        │  /opsp:compact — one engine (DEC-014)
        ▼
  architecture.md              this document  ─┐ peers, both one hop
  squad/  index · product · maintainer · dev · devops   ─┘ from the record
          .manifest.json       provenance (DEC-010)

src/core/compact/   sections · records · manifest · status · rules · loops · edges
src/core/hats.ts    registry, roles, validation
src/commands/       compact: plan · seal · check · loops
```

**TypeScript on Node ≥20.19.0, ESM, distributed via npm** (`package.json`, `tsconfig.json`). No
server, no persistent store: the CLI runs once per invocation and the durable state is markdown
with YAML frontmatter. Two GitHub Actions workflows — a full gate on pull request and push, and a
changesets release preparation (`.github/workflows/`).

**The deterministic/synthetic split** is the load-bearing structure. Grouping, hashing, staleness
and gating live in code so they can be verified without a model; condensing prose lives in a
skill. Neither half computes the other's answer (`DEC-010`, `DEC-014`).

## Constraints & Non-Negotiables

**Operator-only reconciliation** (`DS-HIGH-IMPACT-OPS`) — absolute, not a preference.
**Planning before execution** (`DEC-004`) — no fast path.
**Bias toward escalation** (`DEC-002`) — only additive, high-confidence changes auto-accept.
**The record is the source of truth** (`DEC-006`) — compact never writes a record.
**Cited claims only** (`DEC-009`) — a record id for a decision, a path for an observation.
**One hop from the record** (`DEC-011`, `DEC-014`) — no derived artifact compiles from another.
**Optional new fields** (`DS-BACKWARD-COMPAT`) — older records must still parse.
**Cross-platform** — every path via `path.join`; hashes sorted and line-ending normalised
(`DEC-010`), verified on ubuntu, macOS and Windows in CI.
