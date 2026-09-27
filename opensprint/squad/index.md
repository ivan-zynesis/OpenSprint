# Squad

Compiled from `opensprint/driver-specs/` and `opensprint/ADRs/`, and from the system itself.
**Derived — do not edit.** If a view is wrong, the system is wrong: raise it with `/opsp:explore`,
not with a text editor.

| Wearing | Owns the question | Start with | Shape |
|---|---|---|---|
| **product** | what must it **do**? | [product.md](product.md) | objective · goals · strategies · measures |
| **maintainer** | what must be **true of it** while it does that? | [maintainer.md](maintainer.md) | bars · posture · evidence · exposure |
| **dev** | how is it **built**? | [dev.md](dev.md) | tech-stack · runtime-topology · entity-schema |
| **devops** | how is it **stood up and kept running**? | [devops.md](devops.md) | infra-architecture · gitops |

Each hat has its own shape, because the four accountabilities produce different *kinds* of
knowledge rather than the same kind about different subjects. Product states a chain of intent;
maintainer states positions on spectrums and what they cost; dev and devops describe a system.

**None of them enumerate records** (`DS-BIG-PICTURE`). A record that does not shape the picture
does not appear, and the records remain the source of truth.

The hats do not partition the work — most initiatives touch every one of them, which is why one
person wears all four (`DS-SQUAD-HATS`). This table says which hat *owns* a question, not which
views you may skip.

## Reading order

Orient here, read the view, and open the full record only for the decision you are about to act
on. Every claim cites what it came from: **a record id where a decision established it, a path
where it was observed from the system.** Those carry different authority — a decision binds, an
observation may be an accident.

`DECISION-MAP.md` holds the decision tree and blast radius. `architecture.md` is a peer of these
views, compiled from the same records in the same pass.

## What is not here

`devops` has no records. That is deliberate — this tool ships no infrastructure of its own
(`DS-SELF-USE-SCOPE`, `DEC-017`) — but both its sections are observation with nothing decided
behind them.
