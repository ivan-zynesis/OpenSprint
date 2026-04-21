## ADDED Requirements

### Requirement: Decision map artifact
The system SHALL maintain an auto-generated `DECISION-MAP.md` file at `opensprint/DECISION-MAP.md` that visualizes the full decision tree with dependency relationships and blast radius metrics.

#### Scenario: Decision map location
- **WHEN** the decision map is generated or updated
- **THEN** it SHALL be written to `opensprint/DECISION-MAP.md`
- **AND** it SHALL be the entry point for understanding the project's decision structure

### Requirement: Decision map auto-maintenance
The system SHALL automatically regenerate `DECISION-MAP.md` whenever a decision record or driver spec is created, modified, or superseded.

#### Scenario: Creating a new decision triggers map update
- **WHEN** a new decision record is created in `opensprint/decisions/`
- **THEN** the system SHALL regenerate `DECISION-MAP.md` to include the new decision at its correct position in the tree

#### Scenario: Superseding a decision triggers map update
- **WHEN** a decision record's status changes to `superseded`
- **THEN** the system SHALL regenerate `DECISION-MAP.md` reflecting the new active decision and updated tree structure

### Requirement: Decision tree visualization
The `DECISION-MAP.md` SHALL contain an ASCII tree diagram showing driver specs as roots and decisions as nodes with their dependency edges.

#### Scenario: Rendering the decision tree
- **WHEN** the decision map is generated
- **THEN** it SHALL render driver specs as root nodes
- **AND** render each active decision as a child of its `depends-on` entries
- **AND** use indentation and ASCII connectors (`├──`, `└──`, `│`) to show tree structure
- **AND** annotate each node with its depth and blast radius

### Requirement: Blast radius calculation
The system SHALL calculate the blast radius for each decision — the count of downstream decisions that would be invalidated if this decision changed.

#### Scenario: Leaf decision blast radius
- **WHEN** a decision has no other decisions depending on it
- **THEN** its blast radius SHALL be 0

#### Scenario: Root decision blast radius
- **WHEN** a decision has N decisions depending on it (directly and transitively)
- **THEN** its blast radius SHALL be N

#### Scenario: Blast radius after supersession
- **WHEN** a decision is superseded
- **THEN** the blast radius calculation SHALL use only `active` and `accepted` decisions
- **AND** SHALL exclude `superseded` and `deprecated` decisions from the count

### Requirement: Impact summary table
The `DECISION-MAP.md` SHALL contain a table summarizing all active decisions with their metadata for quick scanning.

#### Scenario: Rendering the impact summary
- **WHEN** the decision map is generated
- **THEN** it SHALL include a markdown table with columns: Decision ID, Depth, Depends On, Downstream (list of dependent decision IDs), Blast Radius
- **AND** rows SHALL be sorted by depth ascending, then by ID ascending
- **AND** only `active` and `accepted` decisions SHALL appear in the table
