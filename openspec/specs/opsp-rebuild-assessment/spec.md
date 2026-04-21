# Rebuild Assessment Specification

## Purpose

Define the rebuild assessment capability that identifies invalidated decision records when driver specs change and minimizes operator interaction during reassessment.

## Requirements

### Requirement: Rebuild assessment from changed driver specs
The system SHALL provide a rebuild assessment capability that, given changed driver specs, identifies which decision records are invalidated and produces a minimal set of questions for the operator.

#### Scenario: Single driver spec changed
- **WHEN** a driver spec's content has been updated (status remains `active`)
- **THEN** the system SHALL read `DECISION-MAP.md` to find all decisions with that driver spec in their `depends-on` chain
- **AND** SHALL present each affected decision to the operator with:
  - The original question and decision
  - What changed in the driver spec
  - Whether the operator wants to reaffirm or change the decision
- **AND** SHALL process decisions in depth-first order (root decisions first) so that downstream decisions can incorporate upstream changes

#### Scenario: Cascading invalidation
- **WHEN** an operator changes a root-level decision during rebuild assessment
- **THEN** the system SHALL cascade to all downstream decisions of the changed decision
- **AND** for each downstream decision, re-present the question with the updated upstream context
- **AND** if the operator reaffirms a root decision, skip downstream decisions that have no other changed dependencies

#### Scenario: Operator reaffirms a decision
- **WHEN** the operator indicates an existing decision still holds despite the driver spec change
- **THEN** the system SHALL update the decision record with a `reaffirmed` annotation and date
- **AND** SHALL NOT create a new decision record
- **AND** SHALL skip cascading to downstream decisions of this node

### Requirement: Rebuild assessment output
The system SHALL produce a summary of the rebuild assessment showing what changed, what was reaffirmed, and what new decisions were made.

#### Scenario: Assessment summary
- **WHEN** rebuild assessment completes
- **THEN** the system SHALL output:
  - Count of driver specs that changed
  - Count of decisions evaluated
  - Count of decisions reaffirmed (unchanged)
  - Count of decisions superseded (new decision made)
  - Count of decisions newly created (for new ambiguity)
- **AND** SHALL regenerate `DECISION-MAP.md` with the updated tree

### Requirement: Minimal operator interaction
The system SHALL minimize the number of questions asked during rebuild assessment by reusing existing decisions where the underlying driver specs have not changed.

#### Scenario: Unaffected decisions are preserved
- **WHEN** a rebuild assessment runs
- **THEN** decisions whose entire `depends-on` chain contains no changed driver specs SHALL be preserved without asking the operator
- **AND** SHALL remain in the decision map with their original content
