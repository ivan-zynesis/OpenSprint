---
id: DS-FULL-COVERAGE
type: product
status: active
created: 2026-09-27
hats: [product]
role: goal
depends-on:
  - DS-AGENTIC-SDLC
---

# DS-FULL-COVERAGE: Specification and Result Must Cover All Four Accountabilities

## Statement

Spec-driven development must cover **functional** intent (product) and **non-functional** intent (maintainer). Delivered results must cover **application** (dev) and **infrastructure** (devops).

A practice covering only some of those is not engineering. This is the goal the four hats exist to serve.

## Rationale

Spec-driven development as commonly practised covers functional requirements and application code — the product hat and the dev hat. That is half a system. What must remain true while it runs, and how it is stood up and kept running, are left to convention, tribal knowledge, or a runbook nobody reads.

The gap is not a documentation problem. It is the reason an implementation can satisfy every stated requirement and still be unfit: nothing stated the availability bar it had to hold, or the compliance obligation it had to prove, or the topology that follows from either.

Covering all four is what makes [[DS-AGENTIC-SDLC]]'s claim real — a team's whole output, not the half of it that is easiest to specify.

## Measures

- **Primary**: every hat in a project's registry has records, or a recorded decision explaining why it does not
- **Guardrail**: no hat accumulates records that no rule asserts — see [[DS-LOOP-CLOSURE]]

## Implications

- Four hats, not two: [[DS-SQUAD-HATS]]
- A hat with no records is a reportable state, not an oversight to hide
- Coverage is claimed only where something checks it
