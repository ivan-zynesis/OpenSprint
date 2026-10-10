---
id: surrogate-currency
status: active
state: proposed
created: 2026-10-10
depends-on:
  - lifecycle-beyond-build
---

## Description

Compiled views are produced once, at archive, by whoever happens to be there. That is correct for
half of them and wrong for the other half, and nothing says which.

**Views run on two clocks.** `product` and `maintainer` move on the **record clock** — their inputs
change at propose and at attest, both bracketed by archive. `dev` and `devops` move on the **code
clock** — four of their five sections observe the filesystem, and every escalation during apply
produces another ADR that feeds them. Compiling everything at archive leaves those two stale for
the entire duration of an initiative, which is precisely the window in which agents read them to
decide how to build.

The fix is not "recompile whatever is stale". That would let an agent deep in implementation author
the product view, rendering intent through an implementation lens — **invisible drift**, where
staleness is at least reported. So the rule is about authorship:

> **A hat's view is compiled only while someone accountable for that hat is present and approving**
> ([[DS-VIEW-AUTHORSHIP]]).

During normal apply the only hat in the room is dev's, and [[DEC-028]] makes that an identity rather
than a restriction: every decision written during apply is owned by `dev` or `devops`.

The exception proves the rule. A specification that does not cover everything a developer needs is
the **normal case**; when the surrogate cannot answer a driver-spec question, apply has correctly
discovered that product or maintainer left something unsaid. So it pauses visibly, the dev hat is
set down, the question's hat is **inferred rather than asked**, and the operator answers wearing it
([[DS-ESCALATION-HANDOFF]]). At that moment the accountable author genuinely is present — so
compiling that hat's view is legitimate, on explicit approval against a stated blast radius.

Two more things follow from the same rule. `/opsp:knockdown` should produce **all five** views, with
`product` and `maintainer` empty — and seven empty maintainer objectives on day one is the most
useful thing a reverse-engineered surrogate can say. And a project whose records predate a shape
change needs **assisted backfill**, which this repository proved by hand-migrating its own records
across two milestones of `lifecycle-beyond-build`.

### The two clocks

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
   compiled at archive                   produces (DEC-028)
                                       compiled at each milestone
```

### Who may compile what

| Moment | Who is present | May compile |
|---|---|---|
| `/opsp:apply`, normal work | the dev/devops agent | `dev` · `devops` |
| `/opsp:apply`, approved escalation | the operator, wearing product or maintainer | that hat only |
| `/opsp:attest` | product/maintainer, narrow context | measures — never `dev`/`devops` |
| `/opsp:archive` | the initiative is closing | everything |
| `/opsp:knockdown` | the operator, throughout | all five |

## Driver Specs

- DS-VIEW-AUTHORSHIP
- DS-ESCALATION-HANDOFF

## ADRs

- DEC-SCOPED-SEAL — seal is scopeable, and never blesses a section it did not render
- DEC-COMPILE-ON-MILESTONE — apply compiles at each milestone boundary, bounded to the hat present
- DEC-ESCALATION-IS-A-STAGE — an escalation renders as a stage boundary, not a prompt
- DEC-CLASSIFY-IN-QUESTION — the escalation carries its own classification; the hat is inferred
- DEC-COMPILE-ON-APPROVAL — an approved escalation permits compiling the affected hat's view
- DEC-KNOCKDOWN-ALL-VIEWS — knockdown produces all five; the empty ones are the finding
- DEC-MIGRATE-SEPARATE-TOOL — schema migration is its own tool, distinct from rebuild-assess

## Milestones

- [ ] scoped-seal: `compact seal --hat <name>…`; sealing never blesses a section it did not just render. **Blocks everything else** — without it, compiling two hats marks four fresh, which this project already did once by accident
- [ ] render-on-milestone: `/opsp:apply` compiles stale `dev` and `devops` sections at each milestone boundary, after the change branch merges
- [ ] escalation-handoff: the visible pause; inferred classification carried in the question with a draft record and blast radius; explicit approval; the affected hat's view compiled on approval
- [ ] knockdown-views: `/opsp:knockdown` produces all five views, empty `product` and `maintainer` rendered as a first-class finding
- [ ] migrate-tool: `/opsp:migrate` — detect records the current shapes cannot select, grill the operator one record at a time, backfill on confirmation. **Validated against this repository's own stale state** (see below)

`scoped-seal` genuinely blocks the two after it. `knockdown-views` and `migrate-tool` are
independent of the rest and of each other.

## Notes

**This repository's views are deliberately left stale — do not recompile them.**

Twelve sections are stale and `compact check` fails. That is not an oversight waiting to be tidied: it
is a **live migration fixture**, and the only real one anybody has. It was produced honestly, by
three milestones of shape changes landing on records written against the old shapes, which is
exactly the situation `/opsp:migrate` exists for.

Recompiling to make the gate green destroys the test case and leaves the tool validated against
synthetic fixtures only. The views are compiled at the **end** of this initiative, as the final
check on whether migrate actually works — not before.

**Decision ids are semantic from here.** [[DEC-036]] decided this and recorded a prerequisite — the
rule harvest matched `DEC-\d{3}` only, so a semantic id written before widening it would have been
invisible, reported `decision-unguarded` forever. That widening was pulled forward from
`sdlc-operating-contract`'s `record-naming` milestone and landed before these records were written,
stopping the numbered era at `DEC-044`. Both forms match permanently; this is not a migration
window.

## Open Questions

None blocking. Where product/maintainer staleness is surfaced between archives was open at proposal
and is now settled in [[DEC-COMPILE-ON-MILESTONE]]: apply **offers** to compile them, because the
point of the surrogate is to carry context and a stale view actively misleads whoever loads it next.
Accepting is a context switch, not a render.
