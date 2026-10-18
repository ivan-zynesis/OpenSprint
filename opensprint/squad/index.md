# Squad

Compiled from `opensprint/driver-specs/` and `opensprint/ADRs/`, and from the system itself.
**Derived — do not edit.** If a view is wrong, the system is wrong: raise it with `/opsp:explore`,
not with a text editor.

| Wearing | Owns the question | Start with | Shape | Records |
|---|---|---|---|---|
| **product** | what must it **do**? | [product.md](product.md) | objective · goals · strategies · measures | 24 |
| **maintainer** | what must be **true of it** while it does that? | [maintainer.md](maintainer.md) | posture · seven inherited objectives | 15 |
| **dev** | how is it **built**? | [dev.md](dev.md) | tech-stack · runtime-topology · entity-schema | 58 |
| **devops** | how is it **stood up and kept running**? | [devops.md](devops.md) | infra-architecture · gitops | 4 |

Each hat has its own shape, because the four accountabilities produce different *kinds* of knowledge
rather than the same kind about different subjects. Product states a chain of intent; maintainer
runs the same chain against seven objectives it inherited rather than discovered; dev and devops
describe a system.

**None of them enumerate records** (`DS-BIG-PICTURE`). A record that does not shape the picture does
not appear, and the records remain the source of truth.

The hats do not partition the work — most initiatives touch every one of them, which is why one
person wears all four (`DS-SQUAD-HATS`). In practice a hat is **what you load**, not who you are
(`DS-HATS-AS-CONTEXT`): switching hats means equipping different context and deliberately clearing
what you were holding. This table says which hat *owns* a question, not which views you may skip.

## Reading order

Orient here, read the view, and open the full record only for the decision you are about to act on.

**Every claim cites what it came from, and the citation says which of three authorities it carries:**

| Authority | Cited by | Says | Weakness |
|---|---|---|---|
| **decided** | a record id | it binds | may not be true yet |
| **observed** | a path | it is true today | may be an accident |
| **attested** | evidence · date · attester | asserted true, with an artifact | ages |

Only **attested** licenses an unqualified present-tense claim about the system
(`DS-ATTESTED-TRUTH`).

`DECISION-MAP.md` holds the decision tree and blast radius. `BOARD.md` holds every initiative by
state, with the roadmap. `architecture.md` is a peer of these views, compiled from the same records
in the same pass.

## What is not here

**Nothing in this surrogate is attested.** `/opsp:attest` shipped with `lifecycle-beyond-build` and
has not been run against any bar. Every claim across all four views is therefore *decided* or
*observed* — never a statement that something is true of the running system. That is the single most
important thing to know before reading further.

**`devops` holds three decisions and no infrastructure.** It was empty until `DEC-029`, `DEC-030`
and `DEC-032` gave it the git contract to own. It still describes no runtime, because this tool
ships none (`DS-SELF-USE-SCOPE`, `DEC-017`).

**Five of maintainer's seven objectives are empty.** That is the shape working as intended — an
empty row says nobody has stated what this system does about that concern — and it is the loudest
finding in the surrogate.
