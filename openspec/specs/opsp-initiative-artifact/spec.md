# OPSP Initiative Artifact Specification

## Purpose

Define the initiative descriptor artifact structure that stores initiative metadata, driver spec references, ADR references, and milestone plans.
## Requirements
### Requirement: Initiative descriptor artifact
The system SHALL store initiative descriptors as individual markdown files in `opensprint/initiatives/` with YAML frontmatter containing `id`, `status`, `created`, and optional `completed` fields.

#### Scenario: Creating an initiative descriptor
- **WHEN** `/opsp:propose` creates a new initiative
- **THEN** it SHALL create `opensprint/initiatives/<name>.md` with YAML frontmatter:
  - `id`: kebab-case initiative name
  - `status`: one of `active`, `completed`
  - `created`: ISO 8601 date (YYYY-MM-DD)
- **AND** the body SHALL contain:
  - Description section
  - Driver Specs section (list of DS-* IDs)
  - ADRs section (list of DEC-* IDs)
  - Milestones section (list of planned opsx changes with brief descriptions)

#### Scenario: Updating initiative during apply
- **WHEN** an opsx cycle completes as part of `/opsp:apply`
- **THEN** the initiative descriptor SHALL be updated to reference the completed opsx change name
- **AND** mark the corresponding milestone as done

#### Scenario: Initiative file on Windows
- **WHEN** creating an initiative descriptor on Windows
- **THEN** the system SHALL use `path.join('opensprint', 'initiatives', filename)` to construct the file path

### Requirement: An initiative is readable by code
The system SHALL read every initiative in `opensprint/initiatives/` into a structured entry carrying its identity, its state, its milestones and its membership, so that state can be checked and a board can be compiled from it.

#### Scenario: Reading an initiative
- **WHEN** the system reads `opensprint/initiatives/`
- **THEN** it SHALL return one entry per `.md` file carrying frontmatter with an `id`
- **AND** a file with no `id` SHALL be skipped rather than failing the read
- **AND** entries SHALL be returned in a stable order

#### Scenario: Frontmatter fields
- **WHEN** an initiative declares `id`, `status`, `state`, `created`, `completed` or `depends-on`
- **THEN** each SHALL be carried on the entry
- **AND** an absent field SHALL be undefined rather than defaulted to a guess
- **AND** `status` SHALL default to `active` when absent, matching how driver-specs default

#### Scenario: An initiative written by an older release
- **WHEN** an initiative declares no `state` and no `depends-on`
- **THEN** it SHALL still parse
- **AND** the absent fields SHALL be undefined

#### Scenario: No initiatives directory
- **WHEN** `opensprint/initiatives/` does not exist
- **THEN** the system SHALL return an empty list rather than failing

### Requirement: Milestones are read with their completion
The system SHALL read an initiative's `## Milestones` section as an ordered list of milestones, each carrying a name, a description and whether it is done.

#### Scenario: A milestone line
- **WHEN** a line in `## Milestones` has the form `- [ ] <name>: <description>`
- **THEN** the milestone's name SHALL be `<name>`, its description `<description>`, and `done` SHALL be false
- **AND** `- [x]` SHALL mean `done` is true

#### Scenario: Case of the completion marker
- **WHEN** a milestone is marked `- [X]`
- **THEN** it SHALL be read as done

#### Scenario: A milestone with no colon
- **WHEN** a milestone line carries no colon
- **THEN** the whole text SHALL become its description and its name SHALL be empty
- **AND** it SHALL still be returned, because reporting a malformed milestone beats dropping it

#### Scenario: Milestones are scoped to their section
- **WHEN** a checkbox line appears outside the `## Milestones` section
- **THEN** it SHALL NOT be read as a milestone

#### Scenario: No milestones section
- **WHEN** an initiative carries no `## Milestones` section
- **THEN** its milestone list SHALL be empty rather than an error

### Requirement: Membership is read from the list sections
The system SHALL read the driver-specs and decisions an initiative claims from its `## Driver Specs` and `## ADRs` sections.

#### Scenario: A bare id
- **WHEN** a line in `## Driver Specs` is `- DS-EXAMPLE`
- **THEN** `DS-EXAMPLE` SHALL be read as a member

#### Scenario: An id with a summary suffix
- **WHEN** a line in `## ADRs` is `- DEC-018 — the six are the shipped section list`
- **THEN** `DEC-018` SHALL be read as the member
- **AND** the summary SHALL be discarded
- **AND** both spellings SHALL be read by the same parser, so they cannot diverge

#### Scenario: Membership is scoped to its section
- **WHEN** a list item appears outside those two sections
- **THEN** it SHALL NOT be read as membership

### Requirement: An initiative resolves by id before filename
The system SHALL resolve an initiative from a name by matching its frontmatter `id` first, and only then its filename stem, so that a filename may carry a date prefix without breaking any caller that names an initiative.

#### Scenario: Resolving by id
- **WHEN** an initiative declares `id: lifecycle-beyond-build`
- **AND** its file is named `20261009-lifecycle-beyond-build.md`
- **THEN** resolving `lifecycle-beyond-build` SHALL return it

#### Scenario: Resolving by filename stem
- **WHEN** no initiative declares a matching `id`
- **AND** a file's stem matches the requested name
- **THEN** that initiative SHALL be returned

#### Scenario: No match
- **WHEN** neither an id nor a filename stem matches
- **THEN** the system SHALL return null rather than guessing

#### Scenario: Two initiatives declaring the same id
- **WHEN** more than one initiative declares the same `id`
- **THEN** the first in directory order SHALL be returned
- **AND** the duplicate SHALL be reported rather than silently shadowed

### Requirement: A milestone outside its section is reported, not dropped
The system SHALL report checkbox lines found outside `## Milestones`, naming the section holding them, because a re-explored initiative keeps real milestones under a dated heading and dropping them silently would make an initiative look complete when it is not.

#### Scenario: A checkbox under another heading
- **WHEN** a checkbox line appears under a heading other than `## Milestones`
- **THEN** it SHALL NOT be counted among the initiative's milestones
- **AND** it SHALL be reported separately, carrying the heading it was found under

#### Scenario: Scoping stays strict
- **WHEN** a checkbox appears in `## Description`
- **THEN** it SHALL NOT be counted as a milestone
- **AND** reporting it SHALL NOT change that

#### Scenario: Nothing orphaned
- **WHEN** every checkbox lives under `## Milestones`
- **THEN** the orphaned list SHALL be empty

