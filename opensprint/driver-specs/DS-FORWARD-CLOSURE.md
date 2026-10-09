---
id: DS-FORWARD-CLOSURE
type: product
status: active
created: 2026-10-01
hats: [product]
role: strategy
depends-on:
  - DS-LOOP-CLOSURE
---

# DS-FORWARD-CLOSURE: Every Exposure Carries Its Mitigation Plan

## Statement

The loop closes **forward** as well as backward. Every limitation, exposure and risk recorded against a measure names the planned work that will mitigate it.

An exposure pointing at nothing is a confession. An exposure pointing at planned work is a managed risk. The **state** of what it points at is the assurance level:

```
  exposure --> nothing                      a confession
  exposure --> initiative (exploring)       we know, we are thinking
  exposure --> initiative (proposed)        committed, with a bar
  exposure --> initiative (building)        in flight
```

The roadmap is therefore not a separate document. It is the forward half of the compiled board, and it is where exposures land.

## Rationale

[[DS-LOOP-CLOSURE]] closes the loop backward: a rule fails, and you revisit the decision behind it. That arrow is correct and stays.

It has no answer for the exposure discovered at attestation, because nothing went wrong upstream. The constraint was right, the decision was right, the implementation matched the spec — the bar simply was not met, or was met only in part. There is no backward target. The only honest response points **forward**, at work not yet done.

Without that edge, a surrogate accumulates known gaps with no stated plan, which is precisely the failure mode of every risk register ever maintained. Stating the gap is easy and nearly worthless on its own; stating what will close it, and how far along that work is, is what a reader can act on.

This also gives the board something to render that no other artifact can: not what is being worked on, but **what is not yet safe and who is going to fix it**.

## Measures

- **Primary**: no recorded exposure lacks a `mitigated-by` pointer, or is reported as `exposure-unmitigated`
- **Legibility**: the compiled roadmap shows every open exposure beside the state of its mitigation

## Implications

- An exposure's forward pointer targets an initiative, which must therefore have a state: [[DS-PROGRESSIVE-CRYSTALLIZATION]]
- The board renders doing, next and roadmap from record state alone: [[DEC-026]]
- This extends [[DS-LOOP-CLOSURE]] rather than replacing it; the backward arrow is unchanged
