---
id: DS-VIEW-AUTHORSHIP
type: architecture
status: active
created: 2026-10-10
hats: [product, maintainer]
role: strategy
objective: change-quality
depends-on:
  - DS-HATS-AS-CONTEXT
  - DS-BIG-PICTURE
---

# DS-VIEW-AUTHORSHIP: A Hat's View Is Compiled Only by an Accountable Author Who Is Present

## Statement

**A hat's view is compiled only while someone accountable for that hat is present and approving.**

| Moment | Who is present | May compile |
|---|---|---|
| `/opsp:apply`, normal work | the dev/devops agent | `dev` · `devops` |
| `/opsp:apply`, an approved escalation | the operator, wearing product or maintainer | `product` · `maintainer` |
| `/opsp:attest` | product/maintainer, on a narrow context | measures only — never `dev`/`devops` |
| `/opsp:archive` | the initiative is closing, every hat in scope | everything |

The reason compilation cannot simply happen whenever something is stale: **views run on two
different clocks.**

```
   RECORD CLOCK                        CODE CLOCK
   product · maintainer                dev · devops
   ────────────────                    ────────────
   O, G      ← backlog                 package.json, lockfiles
   S, M-bar  ← propose                 migrations, schemas       change
   posture   ← attest                  Dockerfiles, IaC          continuously
   evidence  ← attest                  CI configs                through apply
   exposure  ← attest
                                       + every ADR an escalation
   two moments, both bracketed           produces (DEC-028)
   by archive
```

Compiling everything at archive is correct for the record clock and wrong for the code clock:
`dev` and `devops` then sit stale for **the entire duration of an initiative** — precisely the
window in which agents read them to decide how to build.

## Rationale

The obvious fix is to recompile whatever is stale, whenever it is stale. That is wrong, and the
reason is [[DS-HATS-AS-CONTEXT]]: a hat is *what you load*.

An agent mid-implementation — holding the diff, the test output, the escalation it just resolved —
is the worst possible author of the `product` view. It would render product intent through an
implementation lens, and that is **invisible drift**. A stale view is visible: `compact plan`
reports it and `compact check` fails on it.

> Stale is a reported state. Dev-flavoured product prose is a silent one.

So the constraint is not "apply may only compile dev and devops". It is that **a view needs an
author who holds that hat**, and during normal apply the only hat in the room is dev's. [[DEC-028]]
makes this an identity rather than a restriction: every decision written during apply is owned by
`dev` or `devops`, so the records changing during apply are exactly the ones feeding those views.

The same rule explains why attestation can never own `dev`/`devops` — not merely inappropriate, but
**incompatible by construction**, since [[DEC-040]] forbids the attester from loading implementation
source and a dev view is entirely implementation detail.

And it explains why an escalation is the one case where apply legitimately touches `product`: the
accountable author genuinely is there, answering, and approving ([[DS-ESCALATION-HANDOFF]]).

## Measures

- **Primary**: no view is compiled by an agent wearing a different hat than the one it describes
- **Currency**: `dev` and `devops` are no more than one milestone behind the code they describe
- **Guardrail**: a section is sealed only when it has just been rendered

### Bar

- **dimension**: view currency ←→ authorship discipline
- **chosen**: compile continuously, but only what the hat in the room owns
- **traded for**: product and maintainer lag by up to one initiative, visibly
- **neighbour**: unrecorded — nothing says what recompiling everything on every change would cost in render time or in drift

## Implications

- `compact seal` must become scopeable, or compiling two hats blesses four: [[DEC-SCOPED-SEAL]]
- Apply compiles at milestone boundaries, bounded to the hat present: [[DEC-COMPILE-ON-MILESTONE]]
- An approved escalation permits compiling product/maintainer: [[DEC-COMPILE-ON-APPROVAL]]
- Knockdown produces all five, because it is a full compile with every hat in scope: [[DEC-KNOCKDOWN-ALL-VIEWS]]
