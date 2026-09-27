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

### Requirement: The record and the system are distinguishable in a view
The skill SHALL make visible which claims come from a decision and which come from observing the system, because the two carry different authority: a decision is binding, an observation is a fact that may be an accident.

#### Scenario: Citing a claim from a record
- **WHEN** a claim is compiled from a driver-spec or decision record
- **THEN** it SHALL cite the record ids inline, as already required

#### Scenario: Citing a claim from an observation
- **WHEN** a claim is compiled from an observed file
- **THEN** it SHALL cite the project-relative path it was observed at
- **AND** SHALL NOT present it as though a record established it

#### Scenario: An observation no record explains
- **WHEN** a section observes something that no record accounts for
- **THEN** the claim SHALL stand, citing its path
- **AND** the absence of a record SHALL NOT be treated as an error
- **AND** the view SHALL NOT invent a rationale for it

#### Scenario: A record and the system disagree
- **WHEN** an observation appears to contradict a record
- **THEN** the skill SHALL surface the disagreement rather than choosing between them
- **AND** SHALL NOT silently prefer either
- **AND** resolving it is a rule's job, not compaction's

### Requirement: The product view is an OGSM chain
The skill SHALL render the product view as a causal chain rather than a list of constraints, because the value of the framework is separating four things that otherwise sit mixed in prose.

#### Scenario: Rendering the chain
- **WHEN** the product view is rendered
- **THEN** `objective` SHALL state the long-term direction
- **AND** `goals` SHALL state what must be true to reach it, each with how it is known to be met
- **AND** `strategies` SHALL state how the goals are pursued
- **AND** the causal relation SHALL be visible: a goal serves an objective, a strategy serves a goal

#### Scenario: Measures aggregate the bridge
- **WHEN** the `measures` section is rendered
- **THEN** it SHALL state, for each goal, what measures it and what asserts that measure
- **AND** a goal with no measure SHALL be named rather than omitted

#### Scenario: No charter, no constraints
- **WHEN** the product view is rendered
- **THEN** it SHALL NOT carry a `Charter` or `Constraints` section
- **AND** what a charter would have said SHALL be carried by the objective, or by a strategy describing how a constraint is worked around

### Requirement: The maintainer view states positions and their trades
The skill SHALL render a bar as a point chosen on a spectrum, not as a number, because what this hat controls is always a trade along a continuum.

#### Scenario: Rendering a bar
- **WHEN** a bar is rendered
- **THEN** it SHALL name the dimension it sits on
- **AND** the chosen point, with the scope that point applies to
- **AND** what was traded to sit there
- **AND** what the neighbouring point would cost

#### Scenario: A bar stated without its trade
- **WHEN** the records do not say what a bar cost
- **THEN** the view SHALL say the trade is unrecorded rather than omitting the question
- **AND** SHALL NOT invent the trade

#### Scenario: Posture is where we actually sit
- **WHEN** the `posture` section is rendered
- **THEN** it SHALL state where the project actually stands against its bars, including deliberate gaps
- **AND** a deliberate gap SHALL cite the record that makes it deliberate and, where recorded, its expiry

#### Scenario: Cost is an axis, not a section
- **WHEN** the maintainer view is rendered
- **THEN** cost SHALL appear as a dimension of the bars it buys
- **AND** SHALL NOT be rendered as a section of its own

### Requirement: The dev and devops views describe the system
The skill SHALL render these views as descriptions of the system, citing decisions where they explain a choice, and SHALL NOT enumerate records.

#### Scenario: Tech stack
- **WHEN** `tech-stack` is rendered
- **THEN** it SHALL state what the system is built with, observed from the project's manifests
- **AND** SHALL cite the decision behind a choice where one exists, and the path where it does not

#### Scenario: Runtime topology
- **WHEN** `runtime-topology` is rendered
- **THEN** it SHALL describe how the parts run and communicate
- **AND** SHALL use a diagram where the shape is clearer drawn than described

#### Scenario: Entity schema
- **WHEN** `entity-schema` is rendered
- **THEN** it SHALL describe the durable data model and the relationships within it
- **AND** SHALL be omitted with a note where the project has no persistent data

#### Scenario: Infrastructure and gitops
- **WHEN** the devops view is rendered
- **THEN** `infra-architecture` SHALL describe what is provisioned and how it fits together
- **AND** `gitops` SHALL describe the pipelines, what triggers each, and which environments they reach

#### Scenario: Not an index
- **WHEN** any of these sections is rendered
- **THEN** it SHALL NOT list the hat's records
- **AND** a record that does not shape the picture SHALL simply not appear

### Requirement: Diagrams follow the repository's habit
The skill SHALL choose a diagram format from what the project already does, and SHALL ask when that is unclear.

#### Scenario: A settled habit
- **WHEN** the detected convention is `ascii` or `mermaid`
- **THEN** the skill SHALL use that format

#### Scenario: An unclear habit
- **WHEN** the detected convention is `mixed`
- **THEN** the skill SHALL ask the operator which to use
- **AND** SHALL NOT pick one silently

#### Scenario: Judged per diagram
- **WHEN** a diagram would be unreadable in the repository's usual format
- **THEN** the skill MAY use the other format for that diagram
- **AND** SHALL say why

#### Scenario: ASCII is the default
- **WHEN** no habit can be detected at all
- **THEN** the skill SHALL use ASCII
- **AND** the reason SHALL be that ASCII survives a terminal, a diff, and an agent's context with no renderer

