---
id: DS-STRATEGY-ALTITUDE
type: product
status: active
created: 2026-10-01
hats: [product, maintainer]
role: strategy
objective: change-quality
depends-on:
  - DS-BIG-PICTURE
  - DS-SURROGATE-BUDGET
---

# DS-STRATEGY-ALTITUDE: A Maintainer Strategy Stays Above Domain Know-How

## Statement

A strategy recorded under the `maintainer` hat states a **position**, never a **mechanism**. Domain know-how belongs to `dev` and `devops`.

The audience for this hat's compiled view is **senior management**. A strategy cell they cannot read is a strategy in the wrong place.

A maintainer strategy therefore **cites** the decisions that implement it rather than describing them:

```
  maintainer Strategy   "credentials never live in the repository"
        |
        |  depends-on edge
        v
  dev / devops  DEC-0xx   the actual mechanism   <-- know-how lives HERE
```

## Rationale

This is [[DS-BIG-PICTURE]] applied *across* hats rather than within one. A view selects; it does not enumerate. A maintainer view that describes mechanisms becomes a second, competing description of the system that `dev` already owns — and it will drift from the real one.

It is also [[DS-SURROGATE-BUDGET]]'s progressive discovery extended by one layer. A reader orients on the maintainer grid, follows a citation into `dev` only for the bar they are acting on, and opens the full record only then. Three layers, each cheap.

The altitude needs no new enforcement mechanism. [[DEC-009]] already requires every compiled claim to cite a record id or a path. Know-how written into a maintainer strategy cell has no maintainer record behind it to cite, so it cannot be written without breaking a rule that already exists.

`squad/product.md` currently files "this hat states intent and another hat answers it; every ADR routes to `dev`" as a structural finding, with a faint apology. It is not a finding. It is the intended topology, and it holds for maintainer identically.

## Measures

- **Primary**: every maintainer strategy cell either cites a dev/devops decision or is reported as `strategy-unimplemented`
- **Readability**: a strategy cell is intelligible to a reader who has opened no record

## Implications

- Strategies cite rather than describe, enforced by the existing citation rule: [[DEC-020]]
- A stated strategy nobody built becomes a harvested loop, not a silent gap
- The maintainer view becomes a senior-management index into `dev` and `devops`
