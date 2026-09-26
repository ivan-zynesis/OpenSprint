## ADDED Requirements

### Requirement: Conflict manifest is produced during the mandatory planning phase
The system SHALL produce a conflict manifest during the read-only planning phase of `/opsp:rebase` and `/opsp:abandon`, before any file is written, and SHALL NOT persist it to disk.

#### Scenario: Producing the manifest
- **WHEN** a reconciliation operation begins
- **THEN** the agent SHALL perform a read-only scan of both universes
- **AND** SHALL classify all citizens
- **AND** SHALL display the manifest to the operator
- **AND** SHALL NOT write the manifest to a file

#### Scenario: No writes before confirmation
- **WHEN** the manifest has been displayed
- **THEN** execution SHALL NOT begin until the operator explicitly confirms

### Requirement: Manifest summary table
The system SHALL display a summary of the scan identifying both universes and counting citizens by type and classification.

#### Scenario: Summary table contents
- **WHEN** the manifest is displayed
- **THEN** it SHALL identify the source and target universes by worktree path and branch name
- **AND** SHALL state the scan date
- **AND** SHALL present counts per citizen type — Driver Specs, ADRs, Initiatives, Active Changes — across the columns Total, MIGRATE, CONFLICT, REDUNDANT, SUPERSEDED, with a TOTAL row
- **AND** SHALL state the auto-resolvable count, being HIGH-confidence MIGRATE plus REDUNDANT
- **AND** SHALL state the count requiring operator input, being CONFLICT plus LOW-confidence MIGRATE
- **AND** SHALL display the rendering below

```
╔══════════════════════════════════════════════════════════╗
║           RECONCILIATION PLAN — <OPERATION>              ║
╚══════════════════════════════════════════════════════════╝

Source universe:  <worktree-path>
                  branch: <branch-name>
Target universe:  <worktree-path>
                  branch: <branch-name>
Scan date:        <YYYY-MM-DD>

┌─────────────────┬───────┬─────────┬──────────┬───────────┬────────────┐
│ Citizen Type    │ Total │ MIGRATE │ CONFLICT │ REDUNDANT │ SUPERSEDED │
├─────────────────┼───────┼─────────┼──────────┼───────────┼────────────┤
│ Driver Specs    │       │         │          │           │            │
│ ADRs            │       │         │          │           │            │
│ Initiatives     │       │         │          │           │            │
│ Active Changes  │       │         │          │           │            │
├─────────────────┼───────┼─────────┼──────────┼───────────┼────────────┤
│ TOTAL           │       │         │          │           │            │
└─────────────────┴───────┴─────────┴──────────┴───────────┴────────────┘

Auto-resolvable (HIGH confidence MIGRATE + REDUNDANT):  <N>
Requires operator input (CONFLICT + LOW confidence):    <K>
```

#### Scenario: Model recommendation
- **WHEN** the manifest is displayed
- **THEN** it SHALL warn that the operation is recommended to run with the most capable available model and extended thinking enabled
- **AND** SHALL state that these operations modify the canonical surrogate

### Requirement: Detail section for citizens requiring operator input
The system SHALL list, after the summary table, every citizen classified CONFLICT or LOW-confidence MIGRATE.

#### Scenario: Listing a CONFLICT citizen
- **WHEN** a CONFLICT citizen is listed
- **THEN** the entry SHALL state the citizen id and type
- **AND** SHALL summarise the source content in one line
- **AND** SHALL summarise the target content in one line
- **AND** SHALL state why the two are incompatible

#### Scenario: Listing a LOW-confidence MIGRATE citizen
- **WHEN** a LOW-confidence MIGRATE citizen is listed
- **THEN** the entry SHALL state the citizen id and type
- **AND** SHALL summarise the source content in one line
- **AND** SHALL state what overlaps with existing target content
- **AND** SHALL state what could go wrong if it were auto-accepted

#### Scenario: Detail section rendering
- **WHEN** the detail section is displayed
- **THEN** it SHALL follow this shape

```
── Citizens Requiring Operator Input ────────────────────────

[1] CONFLICT — <citizen-id> (<citizen-type>)
    Source: <one-line summary of source content>
    Target: <one-line summary of target content>
    Contradiction: <why these are incompatible>

[2] MIGRATE (LOW confidence) — <citizen-id> (<citizen-type>)
    Source: <one-line summary>
    Overlap: <what overlaps with existing target content>
    Risk: <what could go wrong if auto-accepted>
```

### Requirement: Cross-skill warning on high ADR conflict rate
The system SHALL warn the operator when a `/opsp:rebase` manifest suggests the universes have split architecturally rather than diverged softly.

#### Scenario: High ADR conflict rate during rebase
- **WHEN** the operation is `/opsp:rebase`
- **AND** more than 50% of evaluated ADRs are classified CONFLICT
- **THEN** the agent SHALL append a warning stating the conflict count and total
- **AND** SHALL state that this may indicate a fundamental architecture split rather than a soft fork
- **AND** SHALL ask whether `/opsp:abandon` is more appropriate

#### Scenario: Conflict rate at or below the threshold
- **WHEN** 50% or fewer of evaluated ADRs are classified CONFLICT
- **THEN** the agent SHALL NOT append the cross-skill warning

### Requirement: Operator confirmation prompt
The system SHALL prompt for explicit confirmation after displaying the full manifest, and SHALL begin execution only on an affirmative answer.

#### Scenario: Prompting for confirmation
- **WHEN** the full manifest has been displayed
- **THEN** the agent SHALL prompt with the operation name and a statement that the target universe's surrogate will be modified
- **AND** SHALL offer an explicit yes and cancel choice
- **AND** SHALL begin execution only after an affirmative answer
