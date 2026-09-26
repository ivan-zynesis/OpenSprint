## 1. Rule discovery and citation extraction

- [x] 1.1 Create `src/core/compact/rules.ts` with `DEFAULT_RULE_GLOBS` as an explicit `as const` list covering `.test.`, `.spec.`, `.i9n.`, `.unit.`, `.e2e.` and `*_test.*`
- [x] 1.2 Add `resolveRuleGlobs(projectRoot)` — the project's `ruleGlobs` when valid, otherwise the default; malformed falls back and warns
- [x] 1.3 Add `EXCLUDED_DIRS` as an explicit list — `opensprint`, `openspec`, `node_modules`, `dist`, `build`, `.git` — and apply it to the scan
- [x] 1.4 Add `findRuleFiles(projectRoot, globs)` using `fast-glob`, returning project-relative paths
- [x] 1.5 Add `extractCitations(content, knownIds)` — any occurrence of a known record id counts; ids matching the shape but resolving to no record are returned separately as unresolved
- [x] 1.6 Add `buildRuleIndex(projectRoot, records)` — record id to the rule files citing it, empty list when none

## 2. Open loop derivation

- [x] 2.1 Create `src/core/compact/loops.ts` with `OPEN_LOOP_KINDS` as an explicit list of the five kinds
- [x] 2.2 `constraint-unanswered` — an active driver-spec no active decision depends on
- [x] 2.3 `constraint-unasserted` — answered, but none of its answering decisions is cited; coverage is transitive, so a directly-uncited driver-spec whose decision is cited is NOT a loop
- [x] 2.4 `decision-unguarded` — an active decision no rule cites
- [x] 2.5 `rule-guards-dead-record` — a rule citing a superseded or deprecated record, naming both
- [x] 2.6 `decision-on-superseded` — an active decision depending on a superseded record, directing the reader to `/opsp:rebuild-assess`
- [x] 2.7 Attribute every loop to each hat its subject record declares; a loop on an unassigned record is reported without a hat

## 3. Config

- [x] 3.1 Add optional `ruleGlobs: z.array(z.string())` to `ProjectConfigSchema`, parsed field-by-field in the existing resilient style
- [x] 3.2 A malformed `ruleGlobs` warns naming the key and degrades to the default

## 4. CLI

- [x] 4.1 Add `opensprint compact loops` with `--json`, grouped by hat, always exiting zero
- [x] 4.2 Include open loops in `compact plan` and in `plan --json`, so the renderer can fill the Open Loops section
- [x] 4.3 `check` does not scan for rules and does not gate on loops

## 5. Tests

- [x] 5.1 Glob resolution — default, custom, malformed-falls-back-and-warns; a project using only `.unit.ts` is matched by the default
- [x] 5.2 Exclusions — a citation inside `opensprint/` or `openspec/` is not counted; a record does not guard itself
- [x] 5.3 Citation extraction — ids in comments, test names and string literals; several ids in one file; unresolved ids reported separately
- [x] 5.4 Each of the five loop kinds, including the transitive-coverage case that must NOT be reported
- [x] 5.5 Hat attribution, including a multi-hat record and an unassigned one
- [x] 5.6 `check` exits zero with loops present and views fresh
- [x] 5.7 `loops --json` shape, and `loops` exiting zero when there are none
- [x] 5.8 Use `path.join()` for every expected path value

## 6. Verification

- [x] 6.1 `pnpm test` — no new failures beyond the known `zsh-installer` isolation defect
- [x] 6.2 `pnpm exec tsc --noEmit` clean
- [x] 6.3 `pnpm lint` clean
- [x] 6.4 `node bin/openspec.js validate rule-harvesting --strict` passes
- [x] 6.5 Run `compact loops` against this repository and against cashier's surrogate, and report what the loop counts actually are

## 7. Verification result

- `tsc`, `eslint` and `validate --strict` clean; 1588 tests pass, up 32
- The 18 remaining failures are the known `zsh-installer` isolation defect

### Measured, as task 6.5 required

**This repository** — 10 open loops: 2 `constraint-unasserted` (product), 1
`constraint-unanswered` (maintainer, `DS-BACKWARD-COMPAT`), 7 `decision-unguarded` (dev).

**cashier, 81 records** — 15 open loops: 14 `decision-unguarded` and 1 `constraint-unasserted`.
Fourteen unguarded of 64 decisions means **50 are cited**, reproducing exactly the manual grep
that `DEC-013` was decided on. No rule guards a dead record, and no constraint lacks a decision.

The transitive-coverage decision paid for itself there: 16 of 17 driver-specs come back asserted,
where requiring direct citation would have reported 13 gaps that are not gaps — only 4 cashier
driver-specs are named by a test directly.

### Known limitation, raised rather than papered over

The `open-loops` section has no record inputs by design, so its input hash is constant and it
never goes stale. A rule file being deleted therefore does not restage the section: the view
would keep reporting a decision as guarded after its only guard was removed.

Tracking it would mean hashing the rule index into that section, which `check` cannot do without
scanning the source tree — the cost `check` is deliberately kept clear of. This is a real gap in
loop closure inside the machinery built to close loops, and it needs an operator decision rather
than a quiet fix.
