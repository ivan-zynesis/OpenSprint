# Architecture

Compiled from `opensprint/driver-specs/` and `opensprint/ADRs/` by `/opsp:compact`.
**Derived — do not edit.** The records are the source of truth; `DECISION-MAP.md` holds the
dependency tree. The per-hat views in `opensprint/squad/` are peers of this document, compiled
from the same records in the same pass (`DEC-014`).

## System Overview

OpenSprint is an AI-native engineering harness for sprint and milestone orchestration. Its premise
is that agents can execute multi-milestone initiatives autonomously when guided by a persistent
**surrogate** — driver-specs, decision records and compiled architectural state that accumulate
knowledge and answer agent questions without an operator at every step.

It is a **self-use tool released as open source, deliberately not competing** with provider
tooling (`DS-SELF-USE-SCOPE`). It optimises for speed of evolution and clarity of record rather
than feature parity, which is why its surface is the CLI plus the agent skill and command files it
generates, with no GUI and no CI/CD product of its own (`DEC-017`).

Two capabilities define the current system. **Parallel universes** let initiatives run
concurrently in independent git worktrees, each carrying its own surrogate, reconciled by
`/opsp:rebase` or `/opsp:abandon` when they converge or one wins (`DS-PARALLEL-EXEC`). **Surrogate
compaction** condenses the record into per-hat views so that orientation costs a fraction of
loading the full record set (`DS-SURROGATE-BUDGET`).

## Driver Specs

### Functional — what it must do

**Engineering accountability partitions into four hats** — product, maintainer, dev, devops — and
the accountabilities do not move regardless of team size (`DS-SQUAD-HATS`). A hat is a context
boundary an agent must be told it is wearing. QA is redistributed rather than absent: engineers
write the tests, but *what* must be tested is answered upstream by the driver-specs, so that
bridging work lands on product and maintainer. Designer is product-dependent, so the hat set is a
per-project registry.

**Each hat needs one human owner** — reviewer, escalation target, triage owner (`DS-SME-OWNERSHIP`).
Ownership is of the system's behaviour in that domain, not of a document describing it.

**The loop must close mechanically**: driver-spec → ADR → implementation → rule, and back to the
constraint when a rule fails (`DS-LOOP-CLOSURE`). Facilitation is the part that can be encoded.
Without the last arrow a process produces documents; with it, drift becomes a build failure.

**Initiatives run concurrently across independent worktrees**, with no shared mutable state during
execution, diverging in their surrogates until reconciled (`DS-PARALLEL-EXEC`).

### Non-functional — what must be true of it

**Loading the surrogate must not consume the session budget** (`DS-SURROGATE-BUDGET`). Measured at
93–157K tokens across projects in production use, of which ADRs are 61–74%. Progressive discovery
must extend one layer further so an agent works from the compacted surrogate, while still reading
a decision's full record before acting on it.

**Reconciliation is operator-invocable only** (`DS-HIGH-IMPACT-OPS`). A corrupted surrogate
degrades every downstream agent operation; the blast radius is unbounded, so human confirmation at
each ambiguous step is non-negotiable and a planning phase must precede all execution.

**Backward compatibility is best-effort** (`DS-BACKWARD-COMPAT`). Semver is the practice, npm the
marketplace, and a published package is static — so the only breakable surface is a new release
meeting a project written by an older one. New record fields are therefore optional, and removing
or renaming one is a breaking change.

## Architectural Decisions

### Universes are worktrees

A universe **is** a git worktree; `opensprint/` lives in its branch and travels with the code, with
no registry or synchronisation daemon (`DEC-001`). Reconciliation traverses depth-first with the
initiative as the unit of commitment (`DEC-003`), behind a mandatory read-only planning phase that
produces a conflict manifest and waits for explicit confirmation (`DEC-004`). The agent reasons but
auto-accepts only purely additive or identical content; everything else escalates (`DEC-002`). An
abandoned universe is archived with a verbatim pre-migration snapshot and a full traversal manifest
before its worktree is removed (`DEC-005`).

### The compacted surrogate

Views are **compiled and never hand-edited** — if a view is wrong, the system is wrong, and the fix
path is `/opsp:explore` into `/opsp:propose` (`DEC-006`). Open loops detected during compaction are
the backlog that feeds that triage (`DEC-007`). The charter compiles too, from governance records,
so changing what a hat owns means recording a decision (`DEC-008`).

Every compiled claim carries its record ids inline, because a claim built from a record that a
later record partly superseded is otherwise silently wrong (`DEC-009`). A provenance manifest
records per-section input and output hashes, and `compact check` fails CI on anything stale or
tampered (`DEC-010`). Stale sections re-render from their full inputs, never from the previous
rendering (`DEC-011`).

Records declare one or more hats against a per-project registry (`DEC-016`, superseding `DEC-012`);
the rules that guard them are harvested from code rather than declared in the records
(`DEC-013`). compact is the single compile engine, with `architecture.md` as a sibling output
rather than an input (`DEC-014`). Switching what explore and apply load is deliberately deferred
until the views are proven (`DEC-015`).

## System Structure

```
opensprint/                      the record — source of truth
  driver-specs/*.md              constraints (product, maintainer)
  ADRs/DEC-*.md                  decisions (dev)
  DECISION-MAP.md                dependency tree + blast radius (generated)
  initiatives/*.md               initiative descriptors
        │
        │  /opsp:compact  ── one engine (DEC-014)
        ▼
  architecture.md                architectural state  ─┐
  squad/                                                │ peers, both one hop
    index.md                     router                 │ from the record
    product.md maintainer.md                            │
    dev.md     devops.md         per-hat views         ─┘
    .manifest.json               provenance (DEC-010)

src/core/
  compact/       sections · records · manifest · status
  hats.ts        registry, validation, inference
  decision-map.ts  tree, blast radius
  templates/workflows/   14 OPSP skill templates
src/commands/compact.ts  plan · seal · check
```

**Workflows.** Fourteen OPSP workflows generate per tool at `opensprint init`. The lifecycle is
explore → propose → apply → archive, with compact called by archive, knockdown, rebase and abandon
for their compile step (`DEC-014`).

**The CLI/skill split.** Deterministic work — grouping, hashing, staleness, gating — lives in code
so it can be verified without a model. Synthesis lives in skills. `compact plan` reports what is
stale, the skill renders, `compact seal` records, `compact check` gates.

## Constraints & Non-Negotiables

**Operator-only reconciliation** (`DS-HIGH-IMPACT-OPS`). `/opsp:rebase` and `/opsp:abandon` must
never be invoked by a sub-agent, pipeline or other skill. Absolute, not a preference.

**Planning before execution** (`DEC-004`). No reconciliation writes a file before a read-only pass
and explicit confirmation. No fast path.

**Bias toward escalation** (`DEC-002`). Only additive, high-confidence changes auto-accept.

**Snapshot before migration, manifest before removal** (`DEC-005`).

**The record is the source of truth** (`DEC-006`). Compact never writes a driver-spec, an ADR or
the decision map. A derived artifact that disagrees with the record is wrong by definition.

**Cited claims only** (`DEC-009`). A compiled claim without its record ids cannot be checked.

**One hop from the record** (`DEC-011`, `DEC-014`). No derived artifact is compiled from another
derived artifact.

**Optional new fields** (`DS-BACKWARD-COMPAT`). A record written by an older release must still
parse.

**Cross-platform paths.** Every path via `path.join`; hashes sorted and line-ending normalised so
they do not differ across macOS, Linux and Windows (`DEC-010`).
