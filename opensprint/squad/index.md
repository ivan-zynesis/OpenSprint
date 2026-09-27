# Squad

Compiled from `opensprint/driver-specs/` and `opensprint/ADRs/`. **Derived — do not edit.**
If a view is wrong, the system is wrong: raise it with `/opsp:explore`, not with a text editor.

| Wearing | Owns the question | Start with | Records |
|---|---|---|---|
| **product** | what must it **do**? | [product.md](product.md) | 10 |
| **maintainer** | what must be **true of it** while it does that? | [maintainer.md](maintainer.md) | 3 |
| **dev** | how is it **built**? | [dev.md](dev.md) | 16 |
| **devops** | how is it **stood up and kept running**? | [devops.md](devops.md) | 0 |

The hats do not partition the work. Most initiatives touch every one of them — which is why one
person wears all four (`DS-SQUAD-HATS`). This table is here to tell you which hat *owns* a
question, not to let you skip the others.

Records carry a **role** within their hat. Product's are an OGSM chain — objective, then goals,
then strategies — and maintainer's are bars and posture. The roles a hat accepts are configuration
(`DEC-016`), so a project declares its own.

## Reading order

Every view condenses its records and cites them inline. Orient here, read the view, and open the
full record only for the decision you are about to act on.

The record is the source of truth. `DECISION-MAP.md` holds the dependency tree and blast radius;
`architecture.md` is a peer of these views, compiled from the same records in the same pass.

## What is not here

`devops` has no records. That is deliberate, not a gap in the compile — this tool ships no CI/CD
surface of its own (`DS-SELF-USE-SCOPE`, `DEC-017`).
