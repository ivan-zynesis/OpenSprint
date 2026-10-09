---
id: DS-HATS-AS-CONTEXT
type: architecture
status: active
created: 2026-10-09
hats: [product]
role: strategy
depends-on:
  - DS-SQUAD-HATS
  - DS-SME-OWNERSHIP
---

# DS-HATS-AS-CONTEXT: A Hat Is What You Load, Not Who You Are

## Statement

**In today's engineering, most of the hats are worn by the same engineer.**

[[DS-SQUAD-HATS]] calls a hat a context boundary, written as though the boundary ran between *people*. When one person wears all four, the boundary stops being organisational and becomes **what is loaded into the window**.

Wearing a different hat is therefore an operation, not a job title: the engineer equips different context and **deliberately clears what they were holding**, so that they focus on the objective and goals rather than on the work they just did.

The only thing a non-technical stakeholder actually does is ask their agent to read the compiled board and throw in an idea in a few sentences — which creates a backlog item. **Everything past that point is an engineer stepping up for accountability, connecting the SDLC to every other context.**

## Rationale

Attestation is where this stops being philosophy. An agent that just wrote the code, asked whether the code met the bar, will rationalise — every argument for why the implementation is correct is already in its context. Self-assessment at zero distance is not assessment.

So the hat switch has to be real and mechanical: a fresh, narrow context holding the objective, the goals, the bars and the evidence — and not the diff, the design discussion or the decision rationales ([[DEC-033]]). The same applies to a human. An engineer attesting their own work needs to arrive without the implementation in their head, which is exactly as hard as it sounds and exactly why it needs a tool rather than a resolution.

This also gives [[DS-SURROGATE-BUDGET]] a purpose nobody had stated. Progressive discovery was justified by session cost; its real value here is **cheap hat switching for one person**. An engineer dropping dev to pick up product needs that context in seconds, and the compiled hat views are what make the switch affordable enough to actually happen.

[[DS-SME-OWNERSHIP]] is unchanged by this. One accountable owner per hat was never a claim that the owners are different people — it was a claim that a view nobody owns drifts. One engineer owning four hats still satisfies it, and now knows what the ownership costs: four context loads, not one.

## Measures

- **Primary**: `/opsp:attest` runs on a context that provably excludes the implementation
- **Affordability**: switching hats costs a view load, not a re-read of the records
- **Entry point**: a stakeholder with no repository access can file a backlog item through an agent in a few sentences

## Implications

- Attest loads the bar and the evidence, never the diff, design or ADRs: [[DEC-033]]
- The backlog entry point must accept free text and draft OGSM on the stakeholder's behalf: [[DEC-034]]
- This is what makes a one-person squad produce real attestations rather than self-congratulation
