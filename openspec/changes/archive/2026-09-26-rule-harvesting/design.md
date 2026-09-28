## Context

The engine groups records by hat and reports staleness. It knows nothing about the code those records describe.

`DEC-013` requires the record→rule link to be discovered from the codebase: a rule cites the record it guards, and the record says nothing about its rules.

## Goals / Non-Goals

**Goals:**
- Find the citations that already exist, without asking anyone to author anything
- Derive the loop's missing arrows mechanically
- Produce a backlog per hat, so each gap reaches the person accountable for it

**Non-Goals:**
- Writing tests, or judging whether a cited test actually asserts the thing. A citation is a claim of intent; whether the assertion is honest is a human judgement, and `invariant-coverage.md` in the field marks such rows as gaps by hand for exactly that reason.
- Gating the build on a gap.
- Changing what explore or apply load (`DEC-015`).

## Decisions

**Rule globs are configured as `ruleGlobs`, with an explicit default list.** Surveying four projects in production use gives five distinct suffixes — `.test.`, `.i9n.`, `.unit.`, `.e2e.`, `.spec.` — and one of them, ai-gateway, uses *only* `.unit.ts`. A default of `*.test.*` would silently find nothing there and report every decision unguarded. The default therefore covers all five, and `openspec/config.yaml` can override via `ruleGlobs`. The key is not called `rules`: that name is already taken by per-artifact authoring guidance, which is a different thing keyed by artifact id.

**The surrogate is excluded from the scan.** `opensprint/` and `openspec/` are skipped. Without that, every ADR cites its own id and its `depends-on` ancestors, and every record would appear fully guarded by itself.

**A citation is a record id appearing anywhere in a rule file.** Not a structured annotation. The point of `DEC-013` is to read links that already exist, and in the field they exist as ids in comments, describe blocks and test names. Requiring a specific syntax would mean asking every project to re-author what it already has.

**Five open-loop kinds, each derived rather than inferred:**

| Kind | Derivation | Surfaces in |
|---|---|---|
| `constraint-unanswered` | an active driver-spec no active decision depends on | the driver-spec's hats |
| `constraint-unasserted` | a driver-spec whose answering decisions have no citing rule | the driver-spec's hats |
| `decision-unguarded` | an active decision no rule cites | the decision's hats |
| `rule-guards-dead-record` | a rule citing a superseded or deprecated record | the record's hats |
| `decision-on-superseded` | an active decision whose `depends-on` includes a superseded record | the decision's hats |

Nothing here reads content or guesses. Each is a graph or index query, which is what keeps `DEC-007`'s "do not invent a gap" enforceable rather than aspirational.

**Constraint coverage is transitive, not direct.** A driver-spec is asserted when the decisions answering it are guarded, not when a rule names the driver-spec itself. Measured on cashier: only 4 of 17 driver-specs are cited by a test directly, yet `DS-MULTI-TENANT-ISOLATION` is fully guarded — its tests cite `DEC-005`, `DEC-014` and `DEC-033`, the decisions that answer it. Requiring direct citation would report 13 false gaps.

**Reported, never gated.** `check` fails on drift between a view and its records, because that is a document contradicting its source. An open loop is not a contradiction — it is work nobody has done yet. Failing the build on one would make the gate unusable on the day it was introduced, and would push people to stop recording constraints rather than to close gaps.

## Risks / Trade-offs

**A citation does not prove an assertion.** A test can name `DEC-042` and assert nothing about it. The index reports intent, not coverage, and the specs say so rather than implying more. This is the same limit cashier's own coverage map acknowledges when it marks honest gaps.

**Scanning cost grows with the repository.** The scan is bounded by the configured globs, skips the usual build output, and reads each matching file once. On a large repository this is the most expensive thing compact does, which is why it runs in `plan` and `loops` but not in `check`.

**Cross-platform.** Globs are matched with `fast-glob`, already a dependency, which normalises separators. Every constructed path uses `path.join`, and comparisons that must be stable across platforms are made on record ids rather than on paths.
