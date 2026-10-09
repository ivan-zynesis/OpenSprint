---
id: DS-PROGRESSIVE-CRYSTALLIZATION
type: product
status: active
created: 2026-10-01
hats: [product]
role: strategy
depends-on:
  - DS-AGENTIC-SDLC
---

# DS-PROGRESSIVE-CRYSTALLIZATION: An Initiative Is a Container, Born at Intake and Filled Through the Lifecycle

## Statement

An initiative is a **container, not a record**. It neither constrains nor decides, which is what every driver-spec and ADR does. It tracks work.

Because it is not a record, it may exist before it is complete. **It is born at intake and fills as the work crystallizes**, and its state is simply how far down OGSM it has got:

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

The hierarchy it sits in: an **initiative** is an epic; a **milestone** is a group of tickets or a large ticket on its own; an **openspec change** is a ticket.

## Rationale

`/opsp:explore` deliberately writes nothing, on the reasoning that premature artifacts crystallize thinking too early. The reasoning is sound and the consequence is not: thinking that survives only in a conversation is lost when the conversation ends, and work that is real but not yet proposal-ready has nowhere to live.

The resolution is not "explore writes artifacts". It is that **the initiative is not an artifact of the kind the guardrail was protecting**. Records claim truth, and a premature record is a false claim. A container claims nothing — an initiative in `exploring` state asserts only that someone is thinking about something, which is both true and useful.

So the guardrail narrows rather than lifts: explore persists the initiative and *only* the initiative. Driver-specs and ADRs stay propose-only, and [[DEC-006]] and [[DEC-009]] are untouched.

The state model then costs nothing to invent, because OGSM already supplies it. Objective and Goal are worked out during exploration. Strategy and Measure — the bar — are settled at proposal. Posture, Evidence and Exposure arrive at attestation. Which cells are filled *is* the state, exactly as a half-written measure cell reports lifecycle position in [[DS-MEASURE-ANATOMY]]. The same pattern, one level up.

Documentation also needs this in practice. An in-repo board tracking initiative and milestone state turned out to be a prerequisite for documenting at all — partly because nothing can be documented before it is attested ([[DS-ATTESTED-TRUTH]]), and partly because a reader needs to see what is planned before a stated limitation means anything.

## Measures

- **Primary**: a session of `/opsp:explore` that reaches no proposal still leaves a readable initiative behind
- **Consistency**: an initiative's declared state never disagrees with which of its cells are filled
- **Coverage**: every milestone and change traces to an initiative with a state

## Implications

- Initiatives need a deterministic half; they are currently parsed by no code at all: [[DEC-024]]
- State is declared by the tool and checked by code, not derived: [[DEC-024]]
- Explore persists the initiative and nothing else: [[DEC-025]]
- The board compiles from state: [[DEC-026]]
- Exposures point at initiatives, so initiative state is what makes an exposure legible: [[DS-FORWARD-CLOSURE]]
