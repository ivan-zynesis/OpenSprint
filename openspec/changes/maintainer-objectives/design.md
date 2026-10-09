## Context

`DS-MAINTAINER-INHERITED` establishes seven objectives for the `maintainer` hat. `DEC-018` decides they are the hat's **shipped section list** rather than records the operator writes, selected by a new `objective` field. `DEC-028` decides that decisions carry no role and are owned by `dev`/`devops`, with other hats as cc.

This change is the mechanical half of all three.

## Goals / Non-Goals

**Goals**
- Ship the seven as `maintainer`'s default sections, extensible per project
- Let a section select on `objective`, orthogonally to `roles`
- Widen `role` to a list without breaking records that declare a string
- Stop `record-unclassified` firing on decisions

**Non-Goals**
- Migrating this repository's `bar`/`posture` records — that is milestone 2 (`measure-anatomy`)
- The `### Bar/Posture/Evidence/Exposure` sub-blocks — also milestone 2
- Rendering SWOT or BDD — those are `sdlc-operating-contract`

## Decisions

### Objective is a second selector, not a replacement for roles

`resolveSectionInputs` filters on `roles` today. Adding `objective` as a second, independent filter keeps the two orthogonal: a maintainer section selects `objective: security-access` **and** `roles: [goal, strategy]`, so a goal and its strategy both land in the same objective's section while a record for another objective does not.

Rejected: making `objective` a role value. Roles and objectives are different axes — a record is a goal *about* security, and collapsing them would make `goal` and `security-access` mutually exclusive.

### Role normalises to a list, mirroring `normalizeHats`

`DEC-016` already set this precedent for `hats`, including the helper and the string-or-list acceptance. `normalizeRole` is the same function with a different field name, and `RecordRef.role` becomes `string[] | undefined`. Filtering becomes set intersection rather than membership.

Every call site that reads `record.role` as a string must change — `resolveSectionInputs`, `validateRoles`, `loops.ts`'s `record-unclassified` and `constraint-unmeasurable`.

### `heading` becomes an optional field

`headingFor('privacy-retention-legal')` yields "Privacy Retention Legal". The objectives carry commas and ampersands that no title-casing of a kebab-case name can produce. The existing comment in `sections.ts` anticipated exactly this: *"A name that cannot be title-cased into the wanted heading is a reason to add a field, not a reason to add one now."* Now is that time.

A section without `heading` derives one as before, so nothing existing changes.

### Decisions are exempt by record kind, not by configuration

`record-unclassified` currently iterates `[...driverSpecs, ...decisions]`. The fix is to iterate `driverSpecs` only. Doing it by kind rather than by a per-hat opt-out follows `DEC-028`: a decision has nothing to classify against because `dev` and `devops` do not run OGSM, and that is a property of the artifact class rather than of any project's configuration.

## Risks / Trade-offs

**A project with no declared maintainer shape gains seven sections where it had four**, and its maintainer view restages once. Accepted: that project had no maintainer shape at all — `DEFAULT_ROLES.maintainer` was `[]`, so its sections selected nothing.

**This repository keeps its hand-authored shape** because `openspec/config.yaml` declares it and declared config wins. That is correct for this change and is resolved in milestone 2, when the records migrate. Until then the new default is shipped but unused here, which is also the safest way to land it.

**`role` as a list invites records tagged with several roles to dodge classification** by claiming everything. No guard is added now; `validateRoles` already reports a role no hat accepts, and over-tagging would show up as a record appearing in sections it does not belong in.

## Migration Plan

No migration. Every change is additive:
- a record declaring `role: strategy` normalises to `['strategy']`
- a record declaring no `objective` is excluded from objective-filtered sections, exactly as a record with no role is excluded from role-filtered ones
- a project declaring its own maintainer sections keeps them

## Open Questions

None blocking. Whether `objective` should be validated against the hat's declared section names — rather than only against the shipped seven — is settled in this change: validation reads the hat's resolved sections, so a project that adds an eighth objective can use it immediately.
