## 1. Role as a list

- [x] 1.1 Add `normalizeRole(value)` to `src/core/hats.ts`, mirroring `normalizeHats` — accepts a string or a list, returns a deduplicated list preserving order, or null for malformed including empty
- [x] 1.2 `RecordRef.role` becomes `string[] | undefined` in `sections.ts`
- [x] 1.3 `groupRecordsByHat` normalises each record's role when building `RecordRef`
- [x] 1.4 `validateRoles` checks every role of a record against the union of its hats' accepted roles; reports the first offending role
- [x] 1.5 `constraint-unmeasurable` in `loops.ts` fires when **any** of a record's roles is measurable, once per record

## 2. Objective as a second selector

- [x] 2.1 Add `objective?: string` to `SectionDef`
- [x] 2.2 Add `objective?: string` to `RecordRef`, read from frontmatter in `groupRecordsByHat`
- [x] 2.3 `resolveSectionInputs` filters on `objective` when the section declares one, independently of `roles`
- [x] 2.4 A record with no objective is excluded from an objective-filtered section
- [x] 2.5 `resolveHatSections` accepts and validates `objective` in declared sections

## 3. Section headings

- [x] 3.1 Add `heading?: string` to `SectionDef`
- [x] 3.2 Section rendering uses `heading` when declared, else `headingFor(name)`
- [x] 3.3 `resolveHatSections` carries `heading` through from declared config

## 4. The seven objectives

- [x] 4.1 Add `MAINTAINER_OBJECTIVES` to `sections.ts` as an explicit ordered list of `{ name, heading }` — no pattern matching, tracked by name in a constant
- [x] 4.2 `DEFAULT_SECTIONS_BY_HAT.maintainer` becomes the seven objective sections plus `open-loops`, each with `inputs: 'driver-specs'`, `roles: ['goal','strategy']` and its own `objective`
- [x] 4.3 `DEFAULT_ROLES.maintainer` becomes `['goal', 'strategy']`
- [x] 4.4 Validate a record's `objective` against the objectives of its hats' resolved sections

## 5. Decisions exempt from role classification

- [x] 5.1 `record-unclassified` in `loops.ts` iterates driver-specs only
- [x] 5.2 Confirm `DEC-020`, `DEC-021` and `DEC-023` no longer harvest as unclassified

## 6. Provenance

- [x] 6.1 Objective participates in the section input hash, so a record changing objective restages only the sections that selected it
  - Satisfied by construction: `inputMap` hashes whole file content, and `objective` lives in frontmatter. Verified by test rather than assumed.

## 7. Verification

- [x] 7.1 Unit tests for `normalizeRole`, including both spellings and malformed values
- [x] 7.2 Unit tests for objective filtering: alone, with roles, and a record with no objective
- [x] 7.3 Unit tests for the shipped seven, including an objective with no records resolving to an empty section
- [x] 7.4 Unit test that a decision with no role never harvests `record-unclassified`
- [x] 7.5 Unit test that `heading` overrides and absence derives
- [x] 7.6 `pnpm test` green
- [x] 7.7 `pnpm exec tsc --noEmit` clean
- [x] 7.8 `pnpm lint` clean
- [x] 7.9 `compact loops` on this repository shows no `record-unclassified` for DEC-020, DEC-021, DEC-023

## 8. Discovered during implementation

- [x] 8.1 **This repository's maintainer shape was only half-pinned.** `openspec/config.yaml` declared `maintainer.roles` but not `maintainer.sections`, so roles stayed `bar/posture/evidence/exposure` while sections fell through to the new seven — which filter on `goal`/`strategy` and would have selected nothing. The proposal's claim that the hand-authored shape "keeps working" was wrong. Pinned the four sections explicitly, with a comment naming `measure-anatomy` as the milestone that removes the pin.
- [x] 8.2 Confirmed the loop closes on itself: citing `DEC-018` and `DEC-028` in the new tests cleared their `decision-unguarded` loops and two `constraint-unasserted` loops, with no change to rule harvesting.
