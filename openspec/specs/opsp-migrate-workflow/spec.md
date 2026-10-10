# opsp-migrate-workflow Specification

## Purpose

Define `/opsp:migrate`: assisted backfill for records that the project's current hat shapes can no longer select.

A project's records are written against the shapes of the day. When those move — a hat gains objectives, a role vocabulary changes — **the records do not become wrong.** They become misfiled, and that is the harder failure: `DS-BACKWARD-COMPAT` keeps them parsing, so nothing errors, and nothing makes them appear in a view either. A hat can hold eight records and render nothing.

This is deliberately not `/opsp:rebuild-assess`. That asks whether a decision still holds now the **world** moved. This asks where a record belongs now the **schema** moved, and never re-decides anything.

Detection is data, so it can be checked without a model. The judgement — which of seven objectives a bar belongs to — is the operator's, taken one record at a time.

## Requirements
### Requirement: Migration detects what the current shapes cannot select
The system SHALL report records that the project's current hat shapes can no longer select, as data, so that detection is checkable without a model.

#### Scenario: The finding kinds
- **WHEN** the system enumerates what it detects
- **THEN** the kinds SHALL be exactly: `role-not-accepted`, `objective-missing`, `bar-not-in-anatomy`, `hat-entirely-empty`

#### Scenario: A role no hat accepts
- **WHEN** an active driver-spec carries a role none of its hats accepts
- **THEN** `role-not-accepted` SHALL be reported, naming the role
- **AND** the roles those hats do accept SHALL be offered as candidates

#### Scenario: A record no section can select
- **WHEN** a record declares no objective and every section of one of its hats that could take it filters on one
- **THEN** `objective-missing` SHALL be reported for that hat
- **AND** that hat's objectives SHALL be offered as candidates

#### Scenario: A section that takes no records cannot make a record reachable
- **WHEN** a hat has a section declaring `inputs: none`
- **THEN** that section SHALL NOT count toward reachability
- **AND** the reason SHALL be that it can never select a record, whatever roles it declares

#### Scenario: A bar predating the measure anatomy
- **WHEN** a record carries the `bar` role and no `### Bar` sub-block
- **THEN** `bar-not-in-anatomy` SHALL be reported

#### Scenario: A hat that selects nothing
- **WHEN** a hat holds records and every section of it selects none of them
- **THEN** `hat-entirely-empty` SHALL be reported against the hat rather than a record
- **AND** this SHALL be the finding that surfaces a shape change nobody noticed

#### Scenario: A hat holding no records
- **WHEN** a hat holds no records at all
- **THEN** `hat-entirely-empty` SHALL NOT be reported for it

#### Scenario: Superseded records
- **WHEN** a record is superseded
- **THEN** it SHALL NOT be reported

### Requirement: Migration backfills one record at a time, on approval
The workflow SHALL ask about each record separately and write only what the operator approves.

#### Scenario: Not a re-decision
- **WHEN** the workflow describes its purpose
- **THEN** it SHALL state that a record needing migration was correct when written
- **AND** it SHALL distinguish itself from `/opsp:rebuild-assess`, which covers a driver-spec changing

#### Scenario: The question form is reused
- **WHEN** the workflow asks about a record
- **THEN** it SHALL present the inferred classification, a draft of the change, and confirmation by approving it
- **AND** it SHALL NOT invent a second convention for structured questions

#### Scenario: No batching
- **WHEN** several records need migration
- **THEN** they SHALL be approved one at a time

#### Scenario: What may be written
- **WHEN** a migration is approved
- **THEN** only frontmatter fields and the measure anatomy SHALL be written
- **AND** a Statement, Rationale or Decision SHALL NOT be revised
- **AND** a record whose content is now wrong SHALL be directed to `/opsp:decide`

#### Scenario: A false positive
- **WHEN** a hat genuinely records nothing
- **THEN** the workflow SHALL say so rather than migrating anything

