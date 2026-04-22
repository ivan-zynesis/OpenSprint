## ADDED Requirements

### Requirement: Operator readiness warning
The `/opsp:knockdown` skill SHALL warn the operator about model requirements before beginning the process.

#### Scenario: Displaying model warning at start
- **WHEN** the operator invokes `/opsp:knockdown`
- **THEN** the agent SHALL display a warning that knockdown requires an advanced model with extended thinking enabled and the largest available context window
- **AND** ask the operator to confirm they are ready to proceed before starting

### Requirement: TOC build from file system structure
The `/opsp:knockdown` skill SHALL build a table of contents from directory and file names without reading file content.

#### Scenario: Walking the file system
- **WHEN** the knockdown process begins (Phase 1)
- **THEN** the agent SHALL walk the project file system and record all directories and files in `opensprint/knockdown/toc.yaml`
- **AND** categorize each entry as: `architectural` (always scan), `scan-structure` (scan directory shape, sample files), or `skip` (node_modules, dist, .git, assets, lock files, generated files)
- **AND** mark all entries with status `pending`
- **AND** record initial structural observations (monorepo vs single-app, service boundaries, presence of IaC, migration directories, etc.)

#### Scenario: Small codebase escape hatch
- **WHEN** the TOC build completes and the total architectural file count is small enough to fit in context
- **THEN** the agent SHALL offer to skip the compaction phases and proceed directly to architecture extraction with all files loaded
- **AND** the operator SHALL confirm which approach to use

### Requirement: File scan with filename-first inference
The `/opsp:knockdown` skill SHALL scan files by inferring from filename first, reading content only when ambiguous.

#### Scenario: Scanning a file with a descriptive name
- **WHEN** processing a file whose name clearly indicates its purpose (e.g., `jwt-strategy.ts`, `docker-compose.yml`, `prisma.schema`)
- **THEN** the agent SHALL write a one-line summary inferred from the filename and path
- **AND** classify the summary using the three-question classifier: driver-spec? / ADR? / affects-ADR? / drop
- **AND** mark the file as `interpreted` in toc.yaml

#### Scenario: Scanning a file with an ambiguous name
- **WHEN** processing a file whose name does not clearly indicate its purpose (e.g., `utils.ts`, `index.ts`, `main.py`, `app.ts`)
- **THEN** the agent SHALL read the file content
- **AND** write a one-line summary based on the content
- **AND** classify and mark as `interpreted`

#### Scenario: Classifying a file summary
- **WHEN** a file summary has been written
- **THEN** the agent SHALL classify it by asking in order:
  1. "Is this a driver-spec?" (external constraint, compliance requirement, SLA, vendor lock-in) → Extract to `findings.md` as candidate driver-spec
  2. "Is this an ADR?" (significant architectural decision with clear rationale) → Extract to `findings.md` as candidate ADR
  3. "Will this affect an ADR?" (implementation detail that traces to a higher-level decision) → Keep for compaction
  4. None of the above → Mark as `dropped` (no architectural signal)

### Requirement: Bottom-up compaction
The `/opsp:knockdown` skill SHALL compact file summaries bottom-up through the directory tree, merging related siblings and extracting architectural artifacts as they emerge.

#### Scenario: Compacting a directory where all children are interpreted
- **WHEN** all files in a directory have been interpreted or dropped
- **THEN** the agent SHALL collect all surviving child summaries (not dropped)
- **AND** group them by architectural relatedness
- **AND** compact each group into a single summary, written to `opensprint/knockdown/summaries/<dir-path>.md`
- **AND** classify the compacted summary using the three-question classifier
- **AND** mark the directory as `compacted` in toc.yaml

#### Scenario: Compacting unrelated siblings
- **WHEN** child summaries in a directory are not architecturally related
- **THEN** the agent SHALL NOT force them into a single compacted summary
- **AND** unrelated summaries SHALL float up to the next directory level unchanged
- **AND** each unrelated summary SHALL be independently classified

#### Scenario: Compaction terminates
- **WHEN** all directories have been compacted up to the project root or no further compaction is possible
- **THEN** the agent SHALL proceed to architecture extraction with all findings and surviving summaries

### Requirement: Architecture extraction via reverse system design
The `/opsp:knockdown` skill SHALL extract the final surrogate artifacts by applying the reverse system design process to all compacted findings.

#### Scenario: Filling architecture.md template
- **WHEN** the extraction phase begins
- **THEN** the agent SHALL read all extracted findings from `opensprint/knockdown/findings.md` and all surviving compacted summaries
- **AND** fill the architecture.md template sections in reverse system design order:
  1. Infrastructure Topology (from tech stack findings)
  2. Component Map and System Boundary (from architecture findings)
  3. Cross-Cutting Concerns (from cross-cutting patterns found during compaction)
  4. Constraints & Non-Negotiables (from extracted driver-specs)
- **AND** present the draft architecture.md to the operator for review

#### Scenario: Interactive ADR confirmation
- **WHEN** candidate ADRs have been extracted during compaction
- **THEN** the agent SHALL present them to the operator batched by area (e.g., auth, data, infra, communication)
- **AND** for each candidate, ask the operator to confirm, modify, or reject
- **AND** for confirmed ADRs, ask whether they trace to an external constraint (if yes, extract a driver-spec)
- **AND** write confirmed ADRs to `opensprint/ADRs/`

#### Scenario: Interactive driver-spec confirmation
- **WHEN** candidate driver-specs have been extracted
- **THEN** the agent SHALL present all candidates to the operator for final review
- **AND** write confirmed driver-specs to `opensprint/driver-specs/`

#### Scenario: Generating DECISION-MAP.md
- **WHEN** all ADRs have been confirmed and written
- **THEN** the agent SHALL generate `opensprint/DECISION-MAP.md` from the confirmed ADRs

### Requirement: Pause and resume via working data
The `/opsp:knockdown` skill SHALL support pausing and resuming at any point using persistent working data.

#### Scenario: Pausing knockdown
- **WHEN** the operator requests to pause or the session ends
- **THEN** all progress SHALL be persisted in `opensprint/knockdown/toc.yaml` (file statuses), `opensprint/knockdown/summaries/` (compacted metadata), and `opensprint/knockdown/findings.md` (extracted items)
- **AND** the current phase and position SHALL be recorded in toc.yaml

#### Scenario: Resuming knockdown
- **WHEN** the operator invokes `/opsp:knockdown` and `opensprint/knockdown/toc.yaml` already exists
- **THEN** the agent SHALL read the existing working data
- **AND** resume from the last recorded position (next `pending` file or directory)
- **AND** NOT re-process files or directories already marked as `interpreted`, `compacted`, or `dropped`
