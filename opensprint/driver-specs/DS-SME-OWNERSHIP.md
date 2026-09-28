---
id: DS-SME-OWNERSHIP
type: business
status: active
created: 2026-09-26
hats: [product]
role: strategy
depends-on:
  - DS-SQUAD-HATS
---

# DS-SME-OWNERSHIP: Every Hat Needs One Human Owner

## Statement

Each hat must be owned by a single human with the subject-matter expertise for it. Laying the hats out as distinct artifacts is what makes that ownership assignable.

## Rationale

The condensed surrogate for a hat is, in effect, a surrogate of the person who holds that expertise. A surrogate that nobody is accountable for drifts without anyone noticing. Naming an owner per hat is what converts a set of documents into a squad.

In a one-person team all four owners are the same engineer on different days. The accountabilities still do not move — see [[DS-SQUAD-HATS]].

## Implications

Ownership of a hat means three things, and authorship is not one of them:

- **Reviewer** — every change to that hat's compiled view crosses the owner's desk
- **Escalation target** — questions in that hat's domain route to that owner
- **Triage owner** — that hat's open loops are that owner's backlog

The owner owns the system's behaviour in their domain, not a document describing it. See [[DEC-006]].
