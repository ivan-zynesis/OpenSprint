## 1. The module

- [x] 1.1 New `src/core/initiatives.ts`, importing `parseFrontmatter` from `decision-map.ts` rather than adding a second parser
- [x] 1.2 `InitiativeEntry`: `id`, `status`, `state?`, `created?`, `completed?`, `dependsOn`, `milestones`, `driverSpecs`, `decisions`, `path`
- [x] 1.3 `Milestone`: `name`, `description`, `done`
- [x] 1.4 `readInitiatives(opensprintDir)` — sorted by filename, skipping files with no `id`, returning empty when the directory is absent

## 2. Milestones

- [x] 2.1 `sectionBody(content, heading)` helper — the body of a `##` section, ending at the next `##`
- [x] 2.2 Parse `- [ ] name: description` and `- [x] ...`, case-insensitive on the marker
- [x] 2.3 A line with no colon keeps its whole text as the description, with an empty name
- [x] 2.4 Checkbox lines outside `## Milestones` are not milestones

## 3. Membership

- [x] 3.1 Read `## Driver Specs` and `## ADRs` list items, taking the leading token
- [x] 3.2 Tolerate the ` — summary` suffix the newer initiatives carry
- [x] 3.3 One parser for both spellings

## 4. Resolution

- [x] 4.1 `resolveInitiative(opensprintDir, nameOrId)` — frontmatter `id` first, filename stem second, null otherwise
- [x] 4.2 A duplicate `id` returns the first in directory order and warns

## 5. Verification

- [x] 5.1 Unit tests for each requirement above
- [x] 5.2 Test that all four initiatives in this repository parse, including the oldest
- [x] 5.3 Test resolution against a date-prefixed filename, which is what `DEC-036` needs
- [x] 5.4 `pnpm test` green apart from the known zsh-installer failures
- [x] 5.5 `pnpm exec tsc --noEmit` clean, `pnpm lint` clean

## 6. Discovered during implementation

- [x] 6.1 **`/opsp:reexplore` appends milestones under a dated heading, not into `## Milestones`.** `compact-surrogate` carries `documentation-rewrite` under `## Added at re-exploration, 2026-09-27`, so strict scoping — which is correct, since a checkbox in `## Description` is prose — would have dropped a real milestone without a word. Added `orphanedMilestones`, carrying the section each was found under, so the board can surface them. The real fix belongs in re-exploration's output format and is not this milestone's.
