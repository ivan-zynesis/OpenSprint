## 1. Parsing the anatomy

- [x] 1.1 New `src/core/compact/measures.ts` — owns the `## Measures` section and everything under it
- [x] 1.2 `MEASURE_PARTS` constant: `bar`, `posture`, `evidence`, `exposure` — explicit list, tracked by name
- [x] 1.3 `measuresSection(content)` returns the body of `## Measures`, or null; move `hasMeasures` onto it so one parser owns the section
- [x] 1.4 `parseMeasureAnatomy(content)` returns each part's body, absent when the heading is missing or its body empty
- [x] 1.5 A sub-block outside `## Measures` is not read as part of the anatomy
- [x] 1.6 Part headings match case-insensitively

## 2. The bar vocabulary

- [x] 2.1 `BAR_LABELS` constant: `dimension`, `chosen`, `traded for`, `neighbour`
- [x] 2.2 `parseBar(block)` reads `- **<label>**: <value>` lines by explicit lookup, case-insensitive on the label
- [x] 2.3 A partial bar parses; no label is required

## 3. Harvest rules

- [x] 3.1 `measure-unasserted` — populated measures, no evidence
- [x] 3.2 `measure-unexposed` — populated measures, no exposure
- [x] 3.3 `bar-without-neighbour` — a bar with no `neighbour` label; a value saying "unrecorded" satisfies it
- [x] 3.4 Add all three to `OPEN_LOOP_KINDS`
- [x] 3.5 `hasMeasures` keeps its current behaviour, re-exported from `measures.ts` so `constraint-unmeasurable` is untouched

## 4. Migrating this repository's bars

- [x] 4.1 `DS-HIGH-IMPACT-OPS` → `role: strategy`, `objective: integrity-correctness`, bar as a sub-block
- [x] 4.2 `DS-BACKWARD-COMPAT` → `role: strategy`, `objective: change-quality`, bar as a sub-block
- [x] 4.3 Both bars taken verbatim from what `squad/maintainer.md` already compiled, including their unrecorded neighbours
- [x] 4.4 Remove the `maintainer.sections` and `maintainer.roles` pin from `openspec/config.yaml`
- [x] 4.5 Confirm the shipped seven objectives now select these records

## 5. Verification

- [x] 5.1 Unit tests for `parseMeasureAnatomy`: all four, none, partial, empty block, heading outside Measures, case-insensitivity
- [x] 5.2 Unit tests for `parseBar`: full, partial, unknown label ignored, case-insensitive label
- [x] 5.3 Unit tests for each of the three new loops, including the "unrecorded neighbour satisfies" case
- [x] 5.4 Test that a record with measures and no sub-blocks behaves as before
- [x] 5.5 `pnpm test` green apart from the known zsh-installer failures
- [x] 5.6 `pnpm exec tsc --noEmit` clean, `pnpm lint` clean
- [x] 5.7 `compact loops` on this repository shows the two migrated records under their objectives

## 6. Discovered during implementation

- [x] 6.1 **Milestone 1 shipped no hat-level `posture` section.** The seven objectives all filter on `objective`, so `DS-SELF-USE-SCOPE` (`role: posture`) was selected by nothing and silently dropped from the maintainer view. Added `posture` as an unfiltered section above the grid — which is where the design always had it — and restored `posture` to `DEFAULT_ROLES.maintainer`.
- [x] 6.2 **Five records written during planning were orphaned.** `DS-ATTESTED-TRUTH`, `DS-CI-ATTESTATION`, `DS-MEASURE-ANATOMY`, `DS-STRATEGY-ALTITUDE` and `DS-SURROGATE-GIT-CONTRACT` are cc'd to `maintainer` with valid roles but carried no `objective`, so no section selected them. Assigned: the first to `integrity-correctness`, the rest to `change-quality`.
- [x] 6.3 **Added `record-without-objective` so that class of silent drop cannot recur.** Fires where every section of a hat that could take a record filters on `objective` and the record declares none. `deriveOpenLoops` gains a `sectionsFor` parameter, defaulting to none so existing callers see no new loops.
- [x] 6.4 Updated four tests that asserted superseded behaviour: the loop-kind list (seven → ten), the manifest entry count (17 → 21, maintainer going 5 → 9 sections), and the two e2e "no loops" fixtures, whose measure was completed with evidence and exposure rather than weakening the assertion.
