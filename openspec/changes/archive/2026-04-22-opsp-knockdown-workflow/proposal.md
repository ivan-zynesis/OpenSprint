## Why

Adopting OpenSprint on a brownfield project requires a populated surrogate (architecture.md, ADRs, driver-specs) — but no structured process exists to bootstrap one from an existing codebase. Operators currently either start with an empty surrogate (the agent has no "brain" for the project) or manually write architecture docs. Both are error-prone and time-consuming. We need a systematic, deterministic process to reverse-engineer the surrogate from code — "knocking down" the concrete implementation to expose the architectural skeleton underneath.

## What Changes

- **New `/opsp:knockdown` skill**: A progressive compaction pipeline that reverse-engineers surrogate artifacts from an existing codebase. Language, framework, and platform agnostic.
- **Phase 1 — TOC Build**: Walk the file system using directory and file names only (no content read). Build a table of contents with status tracking. Agent makes structural observations.
- **Phase 2 — File Scan**: For each file, infer summary from filename first; read content only if ambiguous. Classify each summary: driver-spec / ADR / affects-ADR / drop. Extracted items go directly to findings.
- **Phase 3 — Bottom-Up Compaction**: Merge related sibling summaries at each directory level. Classify compacted results. Extract ADRs and driver-specs as they emerge. Don't force unrelated merges — orphans float up unchanged. Drop pure implementation details.
- **Phase 4 — Architecture Extraction**: Read all findings + surviving summaries. Fill architecture.md template using reverse system design (tech stack → architecture → requirements). Interactive operator confirmation of ADRs and driver-specs. Generate DECISION-MAP.md.
- **Working data artifacts**: `opensprint/knockdown/` directory with `toc.yaml` (per-file status tracking), `summaries/` (compacted metadata), `findings.md` (accumulated extractions). Enables pause/resume between any phases.
- **Small codebase escape hatch**: If the codebase fits in context, skip compaction and feed directly to architecture extraction.
- **Operator warning**: At start, warn operator to use an advanced model with extended thinking enabled and the largest available context window.

## Capabilities

### New Capabilities
- `opsp-knockdown-workflow`: The `/opsp:knockdown` skill — progressive compaction pipeline with four phases (TOC build, file scan, bottom-up compaction, architecture extraction), working data in `opensprint/knockdown/`, pause/resume via status tracking, three-question classifier (driver-spec? / ADR? / affects-ADR?), reverse system design for final extraction.

### Modified Capabilities
(none — this is a new standalone skill)

## Impact

- `src/core/templates/workflows/` — New `opsp-knockdown.ts` template file
- `src/core/templates/skill-templates.ts` — Export new skill template
- `src/core/shared/skill-generation.ts` — Register new workflow in generation pipeline, update `OPSP_WORKFLOW_IDS`
- `src/core/init.ts` — Add new skill directory mapping to `OPSP_WORKFLOW_TO_SKILL_DIR`
- `opensprint/knockdown/` — New working data directory (created by the skill at runtime, not by init)
