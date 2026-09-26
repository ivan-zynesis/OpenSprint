## Context

`source-specs-normalization.test.ts` parses every spec in `openspec/specs/` with `MarkdownParser.parseSpec`, which requires `## Purpose` and `## Requirements`. Two specs lack the latter and the suite has been red since they merged.

The delta mechanism operates on `### Requirement:` blocks — it can add, modify, remove and rename them. It has no operation for removing non-requirement prose, because a well-formed spec has none.

## Goals / Non-Goals

**Goals:**
- Both specs conform, and the normalization test passes
- Every normative statement in the current prose survives, with the same force
- The diff is reviewable as a restructuring, not as a rewrite

**Non-Goals:**
- Changing what `/opsp:rebase` or `/opsp:abandon` do. This is a documentation-structure repair.
- Touching `reconciliation-migration-manifest`, which already conforms.
- Fixing the 18 environmental `zsh-installer` failures — those are a sandbox artefact, not a defect in this repository.

## Decisions

**The prose sections are removed during implementation; the requirements arrive via archive.** The delta mechanism cannot delete non-requirement sections, so the two steps are split: implementation strips the free-form normative sections, leaving `## Purpose`, and `openspec archive` then applies the `## ADDED Requirements` deltas. The end state is `## Purpose` followed by `## Requirements`.

A consequence worth naming: between implementation and archive the specs have a Purpose and no Requirements, so the normalization test still fails. The change is not done until it is archived, which is already true of every opsx change.

**ASCII formats live inside the requirement that mandates them.** The conflict manifest's value is its exact rendering — an operator confirming a high-impact operation reads that table. A requirement saying "SHALL display a summary table" without the table would lose the specification. The block is kept inside the requirement's scenario.

**Normative force is preserved exactly, not upgraded.** Where the prose says "MUST escalate", the requirement says SHALL. Where it says "may auto-accept", the requirement says MAY. Restructuring is not the moment to tighten a rule — that would be a behaviour change smuggled into a formatting fix.

## Risks / Trade-offs

**A restructure can quietly drop a rule.** Mitigated by working section by section and keeping the original text's clauses intact inside the new blocks; the review should read the diff as a mapping, not as new prose.

**The specs get longer.** Requirement/Scenario is more verbose than the prose it replaces. Accepted: the structure is what makes a spec machine-checkable, which is the whole reason the guard exists.
