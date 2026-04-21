# OpenSprint Harness Design

## Status

Exploration capture from an `opsx:explore` session.

This document records the current design direction for a higher-order engineering harness called `open-sprint`.

It is intentionally product-facing:

- the product being designed is the harness itself
- this repository is the authoring home for that product
- the harness is not being designed primarily for developing this repository
- the desired end state is an installable, publishable engineering harness, similar to how OpenSpec/OPSX can be installed into downstream projects

## Product Framing

OpenSprint is a higher-order harness layered above OPSX.

```text
open-sprint   = tech lead + architect orchestration layer
opsx          = squad lead workflow layer
repo changes  = implementation execution layer
```

The purpose of OpenSprint is to automate more of the software and product engineering process above code generation:

- milestone decomposition
- cross-domain reasoning
- conscious decision-making
- escalation routing
- documentation of why decisions were made
- translation from business/product intent into executable squad-level work

The product ambition is not just "multi-agent coding".

The ambition is a durable engineering process harness where:

- decisions are documented, not just outcomes
- future work can reuse prior judgment
- human intervention is reserved for unresolved or high-authority decisions
- squad execution can be automated without losing architectural discipline

## Core Intent

OpenSprint should help a strong senior engineer or architect operate like a fast, disciplined one-person engineering organization.

That means the harness must preserve three things at once:

1. **Intent**
   Why a sprint or milestone exists at all.

2. **Judgment**
   What trade-offs were consciously considered, accepted, or rejected.

3. **Execution**
   How work is delegated into bounded squad-level responsibilities.

## Design Principles

### 1. The harness is the product

The harness itself is the software product under design.

This repo is the build and authoring environment for the harness, but the harness must ultimately be installable into other projects just like OpenSpec.

### 2. Specs over vague memory

Higher-level knowledge should not be treated as generic "RAG".

It should be structured exactly like OpenSpec's spec model:

- durable source-of-truth specs
- change/initiative-local deltas
- explicit review and archive flows

### 3. Decisions are first-class

Software engineering is trade-off management.

OpenSprint should preserve:

- what decision was made
- why it was made
- what alternatives were rejected
- what trade-offs were accepted
- when that decision should or should not be reused later

### 4. One escalation ladder

Execution should feel continuous until a real authority boundary is reached.

```text
opsx:apply worker
    -> squad lead
    -> solution architect
    -> tech lead
    -> human operator
```

### 5. Single-worker early-stage execution

To avoid early cross-squad dependency complexity, OpenSprint should support multiple squad personas while still executing them serially in a single-worker pattern.

This preserves:

- bounded squad reasoning
- explicit ownership
- charter-driven execution

Without requiring:

- intent-driven conflict resolution
- concurrent cross-squad merge management
- sophisticated multi-agent arbitration in v1

### 6. Progressive disclosure

The operator should not be forced to think in terms of initiatives, coordination layers, manifests, or advanced abstractions until the harness truly needs them.

## Mental Model

```text
┌──────────────────────────────────────────────────────────┐
│                     Human Operator                       │
│      sets intent, answers unresolved high-authority     │
│                     questions only                       │
└──────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────┐
│                      open-sprint                         │
│                                                          │
│  Tech Lead Persona          Solution Architect Persona   │
│  - milestone framing        - system decisions           │
│  - squad coordination       - boundary validation        │
│  - sequence and risk        - cross-domain trade-offs    │
└──────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────┐
│                    Squad Lead Personas                   │
│        each bound by a squad charter and authority       │
└──────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────┐
│                         OPSX                             │
│              explore -> apply -> archive                │
└──────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────┐
│                    Repo-Local Changes                    │
│          code, tests, specs, review, archive            │
└──────────────────────────────────────────────────────────┘
```

## Persona Model

### Human Operator

The human operator is not expected to supervise every step.

The human should mainly provide:

- initial framing
- approval on unresolved high-authority decisions
- final review where necessary

### Tech Lead Persona

The tech lead persona owns milestone-level orchestration.

Responsibilities:

- translate higher-level goals into initiatives
- decompose work into squad-level charters
- sequence work and manage dependencies
- decide when work is blocked by scope, risk, or coordination issues
- aggregate initiative review and closeout

### Solution Architect Persona

The solution architect persona owns system-level judgment.

Responsibilities:

- challenge assumptions
- adjudicate cross-squad and cross-domain design decisions
- align technical choices with business, product, compliance, and reliability constraints
- turn escalated questions into explicit decision records
- maintain architectural coherence

This persona is critical because many squad escalations are not "project management" questions.

They are questions of:

- system boundaries
- ownership
- integration contracts
- non-functional trade-offs
- architecture principles

### Squad Lead Persona

The squad lead persona is the local execution authority.

Responsibilities:

- translate milestone and architectural intent into squad-local judgment
- coordinate a repo-local OPSX workflow
- know what it can decide locally
- know what must be escalated

### OPSX Worker

`opsx:apply` should be treated as the junior implementer or ground-execution layer.

It executes within the context given by:

- repo-local change artifacts
- squad charter
- governing decision records

## Escalation Ladder

OpenSprint should formalize escalation as a behavioral contract.

```text
Implementation ambiguity
  -> decide locally if repo-scoped and within charter

Cross-module or contract ambiguity
  -> escalate to solution architect

Milestone, sequencing, or ownership ambiguity
  -> escalate to tech lead

Business, legal, pricing, or policy ambiguity
  -> escalate to human operator
```

Typical trigger examples:

- unclear API contract ownership
- unresolved non-functional trade-off
- pricing logic change
- compliance interpretation uncertainty
- milestone scope conflict

Every meaningful escalation should result in a conscious decision record when it changes how future work should proceed.

## Artifact Model

OpenSprint needs a distinct artifact system above code/system specs.

The current model has five major artifact classes:

1. **Driver specs**
   Higher-order truth for business, product, compliance, reliability, and architecture principles.

2. **Initiative artifacts**
   The planning bundle for one sprint, milestone, or coordinated effort.

3. **Decision records**
   Durable records of trade-offs, alternatives, rationale, and reuse conditions.

4. **Squad charters**
   Persona-binding contracts for squad lead execution.

5. **Review artifacts**
   Initiative closeout, learning capture, and persona calibration candidates.

## Artifact Graph

```text
driver specs
    ↓
initiative.yaml
    ↓
proposal.md + design.md
    ↓
decision records (DEC-*.md)
    ↓
squad charters
    ↓
links.yaml -> repo-local opsx changes
    ↓
review.md
```

Decision records are not only a downstream artifact.

They can be raised at:

- kickoff
- initiative exploration
- squad escalation
- initiative review

## Directory Shape

Proposed top-level durable structure:

```text
.open-sprint/
  specs/
    business/
      <name>/spec.md
    product/
      <name>/spec.md
    compliance/
      <name>/spec.md
    reliability/
      <name>/spec.md
    architecture/
      <name>/spec.md

  initiatives/
    <initiative-id>/
      initiative.yaml
      proposal.md
      design.md
      milestones.md
      links.yaml
      review.md
      specs/
        business/
          <name>/spec.md
        product/
          <name>/spec.md
        compliance/
          <name>/spec.md
        reliability/
          <name>/spec.md
        architecture/
          <name>/spec.md
      decisions/
        DEC-001.md
      squads/
        <squad-id>.charter.md

  personas/
    tech-lead/
      default.md
    solution-architect/
      default.md
    squad-lead/
      default.md
```

Key rule:

- `.open-sprint/specs/...` contains current higher-level truth
- `.open-sprint/initiatives/<id>/specs/...` contains initiative-local deltas to that truth

This mirrors the core OpenSpec pattern instead of inventing a looser memory store.

## Driver Specs

Driver specs are the higher-order equivalent of OpenSpec capability specs.

They define durable truth in areas such as:

- business
- product
- compliance
- reliability
- architecture principles

### Generalized Driver Spec Template

```md
---
schema_version: 0.1
kind: driver-spec

type: <product|business|compliance|reliability|architecture-principle>
id: <driver-spec-id>
title: <human-readable title>
status: draft # draft | active | retired | superseded

owners:
  - <owner role>
  - <owner role>

decision_authority: <product-owner|business-owner|compliance-owner|architect>
review_cycle: <per-initiative|monthly|quarterly|annual>

related:
  - <type>/<spec-name>
  - <type>/<spec-name>

linked_decisions:
  - DEC-001

measures:
  primary:
    - <metric>
  guardrails:
    - <metric>

source_of_truth: true
---

# <Type> Specification: <Title>

## Purpose

## Rationale

## Requirements

### Requirement: <requirement name>
The <type> SHALL <normative statement>.

#### Scenario: <scenario name>
- **GIVEN** <starting context>
- **WHEN** <trigger>
- **THEN** <required outcome>
- **AND** <additional condition>

## Measures

## Constraints

## Non-Goals
```

### Type-Specific Interpretation

#### Product

- rationale = user or operator value
- requirements = expected product behavior and workflow

#### Business

- rationale = commercial or strategic reason
- requirements = pricing, entitlement, approval, packaging, or policy logic

#### Compliance

- rationale = legal, policy, audit, or governance necessity
- requirements = obligations, retention, access, consent, evidence handling

#### Reliability

- rationale = service trust and operational expectations
- requirements = SLI/SLO/SLA, recovery, observability, resilience requirements

#### Architecture Principle

- rationale = system-wide engineering stance
- requirements = ownership, boundaries, interoperability, scaling constraints

## Initiative Artifacts

Initiatives are the durable planning object for coordinated work.

They sit above repo-local changes and below durable driver specs.

### `initiative.yaml`

This is the machine-readable control plane for one initiative.

```yaml
schema_version: 0.1
kind: initiative

id: <initiative-id>
title: <human-readable initiative title>
status: draft

personas:
  tech_lead: tech-lead/default@v1
  architect: solution-architect/default@v1
  default_squad_lead: squad-lead/default@v1

operator:
  role: <human operator role>
  hitl_policy: unresolved-decisions-only

drivers:
  - type: business
    spec: business/<spec-name>
    why: <why this driver matters>
  - type: product
    spec: product/<spec-name>
    why: <why this driver matters>

north_star:
  objective: <business outcome>
  success_metrics:
    - <metric>
  guardrails:
    - <constraint>

scope:
  in:
    - <area>
  out:
    - <area>

execution:
  mode: single-worker
  sequencing: serial
  escalation_order:
    - squad-lead
    - solution-architect
    - tech-lead
    - human-operator

decision_policy:
  decision_record_required_for:
    - cross-squad or cross-domain changes
    - pricing or business rule changes
    - compliance or legal interpretation
    - non-functional trade-offs
    - changes to canonical contracts

artifacts:
  proposal: proposal.md
  design: design.md
  milestones: milestones.md
  links: links.yaml
  review: review.md
```

### `proposal.md`

This is the tech lead artifact.

It should capture:

- why the initiative exists
- what it aims to change
- which driver specs are impacted
- what is in scope and out of scope
- what success looks like

### `design.md`

This is the solution architect artifact.

It should capture:

- system context
- key boundaries
- target-state architecture
- major design decisions
- non-functional constraints
- risk hotspots
- open architectural questions

### `milestones.md`

This is the delivery slicing artifact.

It should remain execution-oriented, not normative.

```md
# Milestones: <Initiative Title>

## Planning Basis

- Initiative: `<initiative-id>`
- Execution mode: `single-worker`

## Milestone 1: <Name>

### Objective

### Why This Milestone Exists

### Depends On

- <dependency>

### Driver Specs Covered

- <type>/<spec-name>

### Governing Decisions

- DEC-001

### Squads Involved

- <squad-id>

### Exit Criteria

- [ ] <observable outcome>
- [ ] <observable outcome>

### Risks

- <risk> -> <mitigation>
```

## Decision Records

Decision records are first-class artifacts, not side notes.

They document the conscious trade-off process whenever a question requires more authority than local execution should have.

### Why Decision Records Matter

Decision records support:

- better human review
- better future reuse
- safer escalation
- future persona calibration

They also support the "multi-verse" idea:

- if a different decision had been made, a different implementation path would emerge
- preserving those decisions and rejected alternatives creates reusable event-sourced engineering judgment
- future agents can reuse old decisions when a similar question appears, instead of escalating the same category of question repeatedly

### Decision Record Template

```md
---
schema_version: 0.1
kind: decision-record

id: DEC-001
initiative: <initiative-id>
title: <short decision title>
status: proposed # proposed | accepted | rejected | deferred | superseded
type: architecture # architecture | product | business | compliance | process

source: <kickoff|squad-escalation|review|retro>
raised_by: <persona or squad id>
decision_maker: solution-architect/default@v1
impact_scope: <squad|cross-squad|initiative|org>

linked_drivers:
  - <type>/<spec-name>
linked_charters:
  - <squad-id>
linked_changes:
  - github.com/<org>/<repo>:<change-name>

reusable: true
revisit_when:
  - <condition>
---

# DEC-001: <Decision Title>

## Question

## Why This Needed A Decision

## Context

## Options Considered

## Decision

## Rationale

## Trade-Offs

## Consequences

## Reuse Rule

## Do Not Reuse When

## Follow-Up
```

Important modeling choice:

- use one generic decision-record shape
- do not force every decision into "architecture" only
- allow business, product, compliance, and process decisions as peers

## Squad Charters

Squad charters are the most important new execution artifact.

They bind a squad lead persona to:

- a mission
- owned scope
- consumed interfaces
- governing driver specs
- governing decisions
- explicit escalation boundaries

### Purpose

The squad charter is not just a task list.

It is an authority contract.

It defines:

- what the squad may decide
- what the squad may not decide
- when the squad must escalate

### Squad Charter Template

```md
---
schema_version: 0.1
kind: squad-charter

id: <squad-id>
initiative: <initiative-id>
title: <human-readable squad name>
status: active

persona: squad-lead/default@v1
architect: solution-architect/default@v1
tech_lead: tech-lead/default@v1

execution:
  mode: single-worker
  sequence: 20
  workflow: opsx

linked_project: github.com/<org>/<repo>
linked_change: <change-name>

owned_areas:
  - <area>
consumed_areas:
  - <area>
depends_on:
  - <squad-id>

drivers:
  - <type>/<spec-name>
governing_decisions:
  - DEC-001

decision_rights:
  may_decide:
    - local component structure
    - repo-local task breakdown
  may_not_decide:
    - pricing semantics
    - compliance interpretation
    - cross-squad API ownership

escalation:
  to_architect_when:
    - contract ambiguity appears
    - data ownership changes
    - performance or security trade-off appears
  to_tech_lead_when:
    - milestone scope is threatened
    - sequencing dependency blocks progress
  to_human_when:
    - business rationale changes
    - legal or compliance meaning is unclear

quality_gates:
  - linked change validates
  - governing decisions are reflected
  - no unresolved escalations remain
---

# Squad Charter: <Title>

## Mission

## Decision Baseline

## Scope In

## Scope Out

## Deliverables

## Interfaces Owned

## Interfaces Consumed

## Working Mode

## Escalation Matrix

## Definition of Done
```

## `links.yaml`

This artifact binds initiative-level planning to repo-local OPSX execution.

Example:

```yaml
links:
  - squad: billing-api
    project: github.com/acme/billing-service
    change: add-upgrade-eligibility-api
    status: active

  - squad: web-checkout
    project: github.com/acme/web-client
    change: add-self-serve-upgrade
    status: pending
```

This is the seam between:

- OpenSprint planning
- OPSX execution

## Review Artifact

The initiative review is where tacit judgment becomes durable training material.

It should capture:

- what was planned
- what was delivered
- what assumptions changed
- which decisions held up
- which decisions should be superseded
- what persona heuristics should be retained or refined

### Review Template

```md
---
schema_version: 0.1
kind: initiative-review

initiative: <initiative-id>
title: <initiative title>
status: draft

linked_driver_specs:
  - product/<spec-name>
  - business/<spec-name>

linked_decisions:
  - DEC-001

linked_changes:
  - github.com/<org>/<repo>:<change-name>
---

# Initiative Review: <Title>

## Objective Recap

## Delivery Summary

## Driver Spec Impact

## Decision Record Summary

## Squad Execution Summary

## Metrics Review

## What Worked

## What Changed Our Mind

## Hidden Judgments To Preserve

## Reusable Learnings

## Persona Calibration Candidates

## Follow-Up Work

## Archive Recommendation
```

This artifact should be treated as the main input for future persona refinement, but persona changes should still be promoted intentionally.

Do not auto-mutate default personas from every review in v1.

## Execution Model v0

### Single-Worker Pattern

Even if multiple squads are defined, execution in v0 should default to a single-worker pattern.

This means:

- one worker runs one squad at a time
- squads still exist as planning and reasoning boundaries
- sequencing is explicit
- conflict resolution remains simple in early versions

Benefits:

- avoids cross-squad dependency hell
- avoids early need for conflict arbitration skills
- keeps the model legible
- preserves the ability to add real parallelism later

### Why This Matters

OpenSprint should introduce bounded orchestration first.

It should not introduce distributed chaos before the artifact system and escalation semantics are trustworthy.

## Installability and Distribution

OpenSprint is intended to become an installable harness similar in spirit to OpenSpec.

That implies eventual support for:

- packaging and publishing
- installer and update flow
- generated agent instructions or skills
- registry distribution
- reproducible harness setup in downstream repositories

The harness should eventually be installable as a product such that a downstream user can:

1. install OpenSprint
2. initialize a coordination workspace or harness context
3. receive generated personas, templates, and workflow instructions
4. run milestone-level orchestration on their own projects

This repo should therefore be understood as:

- the authoring and implementation home of the harness
- not merely a place where the harness is used for local feature development

## Preliminary Command Surface

This remains exploratory, but the likely product shape is:

```text
open-sprint/explore
open-sprint/kickoff
open-sprint/dispatch
open-sprint/sync
open-sprint/review
open-sprint/close
```

Interpretation:

- `explore` = think through initiative-level work
- `kickoff` = create or refine an initiative
- `dispatch` = produce or refresh squad charters and linked execution
- `sync` = track progress, blockers, decisions, and sequencing
- `review` = aggregate decisions, outcomes, and quality signals
- `close` = finalize learning and archive or transition work

## Open Questions

Several questions remain intentionally open:

1. Should OpenSprint live in its own package or inside an extended OpenSpec distribution model?
2. Should initiative artifacts mirror OpenSpec change semantics exactly, or keep a lighter variant initially?
3. How should persona definitions be versioned and promoted?
4. When should reusable decision records graduate from initiative-local scope to a shared decision library?
5. What is the minimal publishing and registry model for installable distribution?
6. Which command surface should be productized first vs kept implicit in skills?

## Current Recommendation

For the first serious implementation phase, the minimum viable OpenSprint model should include:

- generalized driver specs
- initiative metadata
- initiative proposal and design
- decision records
- squad charters
- links to repo-local OPSX changes
- review artifact
- single-worker execution mode

Everything else should remain secondary until this core loop works:

```text
driver truth
    -> initiative framing
    -> conscious decisions
    -> squad chartering
    -> opsx execution
    -> initiative review
    -> reusable judgment
```

## Summary

OpenSprint is a proposal for a full software and product engineering process harness above code generation.

The main insight is that the next level above OPSX is not just "more workflow steps".

It is a new layer of:

- durable higher-order specs
- explicit decision records
- bounded squad authority
- architect-guided escalation
- installable orchestration behavior

If implemented well, it becomes a disciplined harness for turning high-level intent into automated, well-documented engineering execution while preserving the reasoning that made that execution trustworthy.
