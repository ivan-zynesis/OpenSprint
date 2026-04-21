## Why

OpenSprint (OPSP) is designed around a core thesis: every engineering decision is a durable, replayable event, and when reasoning is preserved, entire solutions can be rebuilt from intent alone. Today, the codebase only has the OPSX layer — change-level workflows (propose, apply, archive). There is no infrastructure for the higher-order artifacts that make OPSP's vision possible: driver specs (the immutable WHY from external sources) and decision records (operator judgment when agents hit ambiguity). Without these, the "scrap and rebuild" capability described in the README is aspirational only.

This change introduces the OPSP artifact layer — a new `opensprint/` directory structure that sits alongside `openspec/`, containing the durable artifacts that survive any rebuild. It also introduces the layered schema (`sprint-driven` extending `spec-driven`) and the foundational OPSP skills for managing driver specs and decision records.

## What Changes

- Introduce `opensprint/` as a new top-level project directory for durable OPSP artifacts, separate from `openspec/` (which is regenerable)
- Define the `driver-spec` artifact format — operator-authored external truth (product requirements, legal, compliance)
- Define the `decision-record` (ADR) artifact format — agent-facilitated, operator-decided records of ambiguous tradeoffs
- Introduce `DECISION-MAP.md` — an agent-maintained decision tree visualization with dependency tracking and blast radius
- Create a new `sprint-driven` schema that extends the existing `spec-driven` schema
- Implement OPSP skills for artifact management:
  - `/opsp:driver` — create/edit/list driver specs
  - `/opsp:decide` — record a decision when agent hits ambiguity
  - `/opsp:tree` — visualize and navigate the decision tree
  - `/opsp:rebuild:assess` — given changed driver specs, flag invalidated ADRs and cascade re-evaluation

## Capabilities

### New Capabilities
- `opsp-driver-specs`: Driver spec artifact management — creation, editing, listing of external truth documents that operators dictate. Agent writes only when operator instructs.
- `opsp-decision-records`: Decision record (ADR) artifact management — creation when agents hit ambiguity, operator answers recorded with consideration factors, dependency links to driver specs, and invalidation triggers.
- `opsp-decision-map`: Agent-maintained decision tree visualization — auto-generated `DECISION-MAP.md` tracking decision positions, dependencies, depth, and blast radius in the multiverse tree.
- `opsp-sprint-schema`: Layered `sprint-driven` schema definition that extends `spec-driven`, defining the OPSP artifact types and their relationships.
- `opsp-rebuild-assessment`: Rebuild assessment skill — diffs changed driver specs against existing ADRs, traces dependency chains, identifies invalidated decisions, and produces minimal operator re-evaluation prompts.

### Modified Capabilities
- `cli-init`: Init command must support creating `opensprint/` directory structure alongside `openspec/` when sprint-driven schema is selected.

## Impact

- New directory structure: `opensprint/` at project root with `driver-specs/`, `decisions/`, and `DECISION-MAP.md`
- New schema: `schemas/sprint-driven/schema.yaml` extending `spec-driven`
- New templates: `driver-spec.md`, `decision-record.md`, `decision-map.md`
- New skill templates in `src/core/templates/workflows/` for OPSP commands
- New command adapters or skill registrations for `/opsp:*` commands
- The `openspec/` directory semantics shift from "primary artifact store" to "regenerable byproduct" when sprint-driven schema is active
