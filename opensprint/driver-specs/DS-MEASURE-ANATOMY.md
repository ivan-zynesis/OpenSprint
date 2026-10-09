---
id: DS-MEASURE-ANATOMY
type: product
status: active
created: 2026-10-01
hats: [product, maintainer]
role: strategy
objective: change-quality
depends-on:
  - DS-FULL-COVERAGE
---

# DS-MEASURE-ANATOMY: Bar, Posture, Evidence, Exposure Is the Anatomy of Every Measure

## Statement

A measure is not a single value. It has four parts, and they are the same four for every hat:

| Part | Asks | Written |
|---|---|---|
| **bar** | what is the acceptance criterion | **ex ante** |
| **posture** | was it met — or, where no bar is set, what is the honest position | ex post |
| **evidence** | what artifact asserts it | ex post |
| **exposure** | what residual risk remains, and what mitigates it | ex post |

Like the maintainer hat's objectives ([[DS-MAINTAINER-INHERITED]]), this anatomy is **inherited, not discovered**. A project does not invent what a measure is made of.

**Posture is not a weaker bar.** It is the honest statement occupying a cell where no bar exists — because none was set, and no model answers where or how to set one. [[DS-SELF-USE-SCOPE]] is exactly this, at hat scope.

The four split across the lifecycle, and nothing in the tool writes the second half:

```
            ex ante  (/opsp:propose)          ex post  (/opsp:attest)
   +----------------------------+   +--------------------------------+
   |  BAR                       |   |  POSTURE    met? or the honest |
   |                            |   |             position where no  |
   |  the acceptance criterion  |   |             bar is set         |
   |  handed to the engineer    |   |                                |
   |  without other detail      |   |  EVIDENCE   what asserts it    |
   |                            |   |                                |
   |  written by /opsp:propose  |   |  EXPOSURE   residual risk and  |
   |                            |   |             its mitigation     |
   +-------------+--------------+   +---------------+----------------+
                 |                                  |
                 |     ####  nothing writes this ####
                 +----------------------------------+
```

## Rationale

The framework already sets bars well. `/opsp:propose` produces the spec, and the engineer follows with opsx — acceptance criteria handed over without other detail, which is progressive discovery working as intended.

What it has never done is come back. Every open-loop kind the harvest can produce is a property of the **record graph** — `constraint-unmeasurable`, `decision-unguarded`, `record-unclassified` and the rest. Not one is a property of an **outcome**. The system can report that a constraint has no measure; nothing can report that a measure was not met.

Naming the four parts is what makes the second half writable. A measure with no evidence is an aspiration. A bar with no exposure has no stated justification for sitting where it sits. A posture without a bar above it is honest; a posture pretending to be a bar is not.

A half-written measure also tells you **where in the lifecycle something is**: bar only means proposed, all four means closed. The hat view stops being a coverage report and becomes a progress report, at no extra cost.

## Measures

- **Primary**: no compiled measure cell states a bar without stating whether it was met
- **Guardrail**: `measure-unasserted` and `measure-unexposed` are harvested, not noticed by a reader

## Implications

- Rendered as optional sub-blocks under the existing `## Measures`, additive under [[DS-BACKWARD-COMPAT]]: [[DEC-019]]
- The ex-post half needs a tool that does not yet exist: [[DEC-022]]
- An exposure must point forward at what mitigates it: [[DS-FORWARD-CLOSURE]]
- `bars · posture · evidence · exposure` ceases to be a maintainer-only shape
