## 1. Rule discovery and citation extraction

- [ ] 1.1 Create `src/core/compact/rules.ts` with `DEFAULT_RULE_GLOBS` as an explicit `as const` list covering `.test.`, `.spec.`, `.i9n.`, `.unit.`, `.e2e.` and `*_test.*`
- [ ] 1.2 Add `resolveRuleGlobs(projectRoot)` — the project's `rules` when valid, otherwise the default; malformed falls back and warns
- [ ] 1.3 Add `EXCLUDED_DIRS` as an explicit list — `opensprint`, `openspec`, `node_modules`, `dist`, `build`, `.git` — and apply it to the scan
- [ ] 1.4 Add `findRuleFiles(projectRoot, globs)` using `fast-glob`, returning project-relative paths
- [ ] 1.5 Add `extractCitations(content, knownIds)` — any occurrence of a known record id counts; ids matching the shape but resolving to no record are returned separately as unresolved
- [ ] 1.6 Add `buildRuleIndex(projectRoot, records)` — record id to the rule files citing it, empty list when none

## 2. Open loop derivation

- [ ] 2.1 Create `src/core/compact/loops.ts` with `OPEN_LOOP_KINDS` as an explicit list of the five kinds
- [ ] 2.2 `constraint-unanswered` — an active driver-spec no active decision depends on
- [ ] 2.3 `constraint-unasserted` — answered, but none of its answering decisions is cited; coverage is transitive, so a directly-uncited driver-spec whose decision is cited is NOT a loop
- [ ] 2.4 `decision-unguarded` — an active decision no rule cites
- [ ] 2.5 `rule-guards-dead-record` — a rule citing a superseded or deprecated record, naming both
- [ ] 2.6 `decision-on-superseded` — an active decision depending on a superseded record, directing the reader to `/opsp:rebuild-assess`
- [ ] 2.7 Attribute every loop to each hat its subject record declares; a loop on an unassigned record is reported without a hat

## 3. Config

- [ ] 3.1 Add optional `rules: z.array(z.string())` to `ProjectConfigSchema`, parsed field-by-field in the existing resilient style
- [ ] 3.2 A malformed `rules` warns naming the key and degrades to the default

## 4. CLI

- [ ] 4.1 Add `opensprint compact loops` with `--json`, grouped by hat, always exiting zero
- [ ] 4.2 Include open loops in `compact plan` and in `plan --json`, so the renderer can fill the Open Loops section
- [ ] 4.3 `check` does not scan for rules and does not gate on loops

## 5. Tests

- [ ] 5.1 Glob resolution — default, custom, malformed-falls-back-and-warns; a project using only `.unit.ts` is matched by the default
- [ ] 5.2 Exclusions — a citation inside `opensprint/` or `openspec/` is not counted; a record does not guard itself
- [ ] 5.3 Citation extraction — ids in comments, test names and string literals; several ids in one file; unresolved ids reported separately
- [ ] 5.4 Each of the five loop kinds, including the transitive-coverage case that must NOT be reported
- [ ] 5.5 Hat attribution, including a multi-hat record and an unassigned one
- [ ] 5.6 `check` exits zero with loops present and views fresh
- [ ] 5.7 `loops --json` shape, and `loops` exiting zero when there are none
- [ ] 5.8 Use `path.join()` for every expected path value

## 6. Verification

- [ ] 6.1 `pnpm test` — no new failures beyond the known `zsh-installer` isolation defect
- [ ] 6.2 `pnpm exec tsc --noEmit` clean
- [ ] 6.3 `pnpm lint` clean
- [ ] 6.4 `node bin/openspec.js validate rule-harvesting --strict` passes
- [ ] 6.5 Run `compact loops` against this repository and against cashier's surrogate, and report what the loop counts actually are
