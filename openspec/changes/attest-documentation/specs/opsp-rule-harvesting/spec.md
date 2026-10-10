## ADDED Requirements

### Requirement: What an attestation left unanswered is reported
The system SHALL report an initiative that claims to have been attested without answering reversibility, blast radius or accountability.

#### Scenario: Scoped to attested initiatives
- **WHEN** an initiative's state is `attested` or `completed`
- **THEN** the system SHALL evaluate its attestation
- **AND** an initiative in any other state, or declaring none, SHALL NOT be evaluated
- **AND** the reason SHALL be that before attestation these questions have no answer yet

#### Scenario: A missing door
- **WHEN** an attested initiative records no `door`
- **THEN** the system SHALL report `reversibility-unstated`

#### Scenario: A missing blast radius
- **WHEN** an attested initiative records no blast radius
- **THEN** the system SHALL report `blast-radius-unstated`

#### Scenario: No RACI at all
- **WHEN** an attested initiative records no RACI rows
- **THEN** the system SHALL report `raci-unassigned`
- **AND** the report SHALL say that nothing records who holds the change after the pull request closes

#### Scenario: A row handled by a system
- **WHEN** a RACI row names a system under **Handled by**
- **THEN** no loop SHALL be reported for it, whatever its R, A, C and I cells say

#### Scenario: A manual row with no owner
- **WHEN** a RACI row is not handled by a system
- **AND** it names no Responsible, or no Accountable
- **THEN** the system SHALL report `raci-unassigned` for that row
- **AND** the report SHALL name the concern and which of the two is missing

#### Scenario: Consulted and Informed are optional
- **WHEN** a manual row names both Responsible and Accountable
- **THEN** no loop SHALL be reported, whether or not Consulted and Informed are present

#### Scenario: One loop per unowned row
- **WHEN** several rows are unowned
- **THEN** each SHALL be reported separately

#### Scenario: A caller supplying no initiatives
- **WHEN** no initiatives are supplied
- **THEN** no attestation loop SHALL be reported
