# opsp-compact-skill Specification

## Purpose

Define the rendering contract for `/opsp:compact`: how the skill drives the deterministic engine, what a compiled view contains, how its claims are cited, and what the skill may not do.

The division is deliberate. Deciding which sections are stale is mechanical and lives in code, where it can gate a build without a model in the loop. Writing the condensed prose is synthesis and lives here. Neither half computes the other's answer, so the gate and the renderer cannot disagree about what is fresh.

Everything the skill produces is derived from the records. It never writes one.

## Requirements
### Requirement: The compact skill is registered as an OPSP workflow
The system SHALL provide `/opsp:compact` as a skill and command alongside the other OPSP workflows.

#### Scenario: Registration
- **WHEN** OPSP workflows are enumerated
- **THEN** `opsp-compact` SHALL be present in `OPSP_WORKFLOW_IDS`
- **AND** a skill template SHALL be registered with the name and directory `opensprint-compact`
- **AND** a command template SHALL be registered for the same workflow id

### Requirement: The skill drives the engine rather than reimplementing it
The skill SHALL obtain staleness from the CLI and SHALL NOT compute it itself, so that the gate and the renderer cannot disagree about what is fresh.

#### Scenario: The compile loop
- **WHEN** `/opsp:compact` runs
- **THEN** it SHALL first run `opensprint compact plan --json`
- **AND** SHALL render only the sections the plan reports as not fresh
- **AND** SHALL finish by running `opensprint compact seal`
- **AND** SHALL NOT write the provenance manifest directly

#### Scenario: Nothing to do
- **WHEN** the plan reports every section fresh
- **THEN** the skill SHALL report that and make no changes

### Requirement: A stale section is rebuilt from its full inputs
The skill SHALL re-render a stale section from the records the plan names, and SHALL NOT use the section's previous rendering as an input.

#### Scenario: Rebuilding a section
- **WHEN** a section is reported stale
- **THEN** the skill SHALL read every input record named by the plan, in full
- **AND** SHALL treat the existing view text as output only
- **AND** SHALL NOT produce the new text by editing the old text in place

### Requirement: Every compiled claim carries its record ids
The skill SHALL cite, inline in the body text, the record ids each claim derives from.

#### Scenario: Citing a claim
- **WHEN** a claim is written into a view
- **THEN** the ids of the records it derives from SHALL appear inline in the same sentence or its immediate neighbour
- **AND** SHALL NOT be relegated to a trailer, footnote or separate index

#### Scenario: A decision amended by a later one
- **WHEN** a record has been partly superseded or amended by another record
- **THEN** a claim drawing on it SHALL cite both records
- **AND** a claim citing only the superseded record SHALL be treated as incomplete

### Requirement: View structure
The skill SHALL render each hat's view with the sections the engine defines, and an index that routes between them.

#### Scenario: A hat view
- **WHEN** a hat view is rendered
- **THEN** it SHALL contain the sections `Charter`, `Constraints`, `Decisions` and `Open Loops`
- **AND** `Charter` SHALL state what the hat owns, what it may not trade away, and when it escalates
- **AND** `Constraints` SHALL condense the hat's driver-specs
- **AND** `Decisions` SHALL condense the hat's decision records

#### Scenario: The charter is derived, not authored
- **WHEN** the `Charter` section is rendered
- **THEN** its content SHALL be drawn from the hat's own records that describe the operating model
- **AND** SHALL NOT be invented where no such record exists
- **AND** a hat with no such record SHALL have its charter reported as an open loop

#### Scenario: The index routes
- **WHEN** `index.md` is rendered
- **THEN** it SHALL list each hat, the question that hat owns, and the path to its view
- **AND** SHALL state the number of records behind each hat

### Requirement: Open loops report only what is mechanically known
The skill SHALL populate `Open Loops` from facts the engine supplies, and SHALL NOT invent gaps.

#### Scenario: Reportable open loops
- **WHEN** the `Open Loops` section is rendered
- **THEN** it SHALL report records assigned to no hat
- **AND** SHALL report records declaring a hat outside the registry
- **AND** SHALL report a hat in the registry that has no records at all

#### Scenario: Not inventing gaps
- **WHEN** the skill considers listing an open loop
- **THEN** it SHALL NOT list a gap that the engine did not report
- **AND** SHALL NOT infer a missing decision or missing rule from the content of a record

### Requirement: A tampered view stops the run
The skill SHALL NOT overwrite a view that was edited by hand.

#### Scenario: Tampered section reported
- **WHEN** the plan reports any section as `tampered`
- **THEN** the skill SHALL present the affected views to the operator
- **AND** SHALL stop without rendering
- **AND** SHALL state that a hand edit means someone believed the view was wrong
- **AND** SHALL direct the operator to `/opsp:explore`, because a wrong view means a wrong system

### Requirement: The skill never writes records
The skill SHALL treat the surrogate as read-only input.

#### Scenario: Compact and the record
- **WHEN** `/opsp:compact` runs for any reason
- **THEN** it SHALL NOT create, modify or delete any file under `opensprint/driver-specs/` or `opensprint/ADRs/`
- **AND** SHALL NOT modify `opensprint/DECISION-MAP.md`
- **AND** changes to the record SHALL be made through `/opsp:driver`, `/opsp:decide` or an initiative

### Requirement: architecture.md is a sibling output of the same pass
The skill SHALL render `architecture.md` from the records, alongside the hat views.

#### Scenario: Rendering architecture.md
- **WHEN** `/opsp:compact` renders
- **THEN** it SHALL produce `opensprint/architecture.md` from the driver-specs and decision records
- **AND** SHALL NOT produce it from the hat views, which are peers rather than inputs

