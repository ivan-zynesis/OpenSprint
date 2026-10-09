## Why

Milestone 1 of `lifecycle-beyond-build`, and the one that gives the `maintainer` hat a shape the tool ships.

Today the tool ships a default shape for `product`, `dev` and `devops` and **nothing for `maintainer`** — `DEFAULT_ROLES.maintainer` is `[]`, and the `bars · posture · evidence · exposure` shape this repository uses was authored by hand into its own `openspec/config.yaml`. Practice across projects concluded what the shipped default should be: the maintainer hat is the technical product manager, running the same OGSM as product with one difference — **its objectives are inherited, not discovered** (`DS-MAINTAINER-INHERITED`). There are seven, present in substantially every software project.

Three mechanisms are missing before that shape can exist. A section cannot select on anything but `roles`, so seven objective sections cannot each take their own records. A record carries exactly one `role`, so a record stating both a goal and its strategy has nowhere to put the second. And `record-unclassified` fires on any record in a role-declaring hat that has no role — which means every ADR routed to `maintainer` is reported as unclassified the moment it is written, because decisions carry no role at all (`DEC-028`).

That last one is not hypothetical: `DEC-020`, `DEC-021` and `DEC-023` harvest as `record-unclassified` today.

## What Changes

- `DEFAULT_SECTIONS_BY_HAT.maintainer` becomes the **seven inherited objectives**, replacing `bars · posture · evidence · exposure`
- A section may select on `objective` as well as `roles`; records declare `objective` in frontmatter
- `role` accepts a string or a list, normalised to a list — the treatment `DEC-016` gave `hats`
- `DEFAULT_ROLES.maintainer` becomes `['goal', 'strategy']`
- **Decisions are exempt from role classification** — `record-unclassified` fires on driver-specs only
- `SectionDef` gains an optional `heading`, because `privacy-retention-legal` cannot be title-cased into "Privacy, Retention & Legal"

## Capabilities

### Modified Capabilities
- `opsp-hat-registry`: maintainer gains shipped sections and roles; `role` normalises to a list; `objective` is validated against the hat's sections
- `opsp-compact-engine`: a section may select on `objective`; a section may declare its own heading
- `opsp-rule-harvesting`: `record-unclassified` no longer fires on decisions

## Impact

- **Behaviour for this repository**: `openspec/config.yaml` declares `maintainer: roles: [bar, posture, evidence, exposure]`, which continues to win over the new default. The hand-authored shape keeps working until milestone 2 migrates the records.
- **Behaviour for other projects**: a project that declared no maintainer shape gains seven sections where it had four. Its maintainer view restages once.
- **Backward compatibility**: `role: strategy` still parses; `objective` is optional; a section without `heading` derives one as before. `DS-BACKWARD-COMPAT` holds.
- **Modified**: `src/core/compact/sections.ts`, `src/core/compact/loops.ts`, `src/core/hats.ts`, `src/core/project-config.ts`
- **The list is extensible.** A project adds an eighth objective in config. `availability & continuity` was itself declined twice during exploration and added on review, which is the evidence that extensibility is load-bearing rather than decorative.
