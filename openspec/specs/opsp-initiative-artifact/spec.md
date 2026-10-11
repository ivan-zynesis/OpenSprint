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

### Requirement: An initiative's state is an explicit vocabulary
The system SHALL define the states an initiative may declare as an explicit, ordered list, because a lifecycle stage is a property of the method rather than of the project and a vocabulary that varied per project could not be checked.

#### Scenario: The vocabulary
- **WHEN** the system enumerates the states an initiative may declare
- **THEN** the list SHALL be exactly: `exploring`, `proposed`, `building`, `attested`, `completed`, `declined`
- **AND** the first five SHALL be in lifecycle order
- **AND** `declined` SHALL be terminal rather than a stage

#### Scenario: A state outside the vocabulary
- **WHEN** an initiative declares a state not in the list
- **THEN** the system SHALL report it, naming the state and the accepted values

### Requirement: A declared state is checked against the content
The system SHALL report an initiative whose declared state is impossible given its content, rather than deriving a state and demanding equality, because an initiative legitimately sits between states.

#### Scenario: Exploring with work already done
- **WHEN** an initiative declares `exploring`
- **AND** any of its milestones is marked done
- **THEN** the system SHALL report the contradiction

#### Scenario: Completed with work outstanding
- **WHEN** an initiative declares `completed` or `attested`
- **AND** it has milestones and any of them is not done
- **THEN** the system SHALL report the contradiction

#### Scenario: Proposed with nothing proposed
- **WHEN** an initiative declares `proposed` or later
- **AND** it claims no driver-specs, no decisions and no milestones
- **THEN** the system SHALL report the contradiction

#### Scenario: Building with nothing to build
- **WHEN** an initiative declares `building`
- **AND** it has no milestones
- **THEN** the system SHALL report the contradiction

#### Scenario: A state between stages is allowed
- **WHEN** an initiative declares `building` with some milestones done and some not
- **THEN** no contradiction SHALL be reported

#### Scenario: Attested and completed are not distinguished from content
- **WHEN** an initiative declares `attested` or `completed` with every milestone done
- **THEN** no contradiction SHALL be reported for either
- **AND** the reason SHALL be that attestation does not yet exist to distinguish them

### Requirement: An active initiative declares a state
The system SHALL report an active initiative that declares no state, because it cannot be placed on a board — while staying silent about a resolved one, so that an initiative written by an older release is not reported forever.

#### Scenario: An active initiative with no state
- **WHEN** an initiative's status is active and it declares no state
- **THEN** the system SHALL report it

#### Scenario: A completed initiative with no state
- **WHEN** an initiative's status is `completed` and it declares no state
- **THEN** the system SHALL NOT report it
- **AND** the reason SHALL be that reporting a resolved initiative forever trains the check to be ignored

#### Scenario: A declined initiative is resolved
- **WHEN** an initiative declares `declined`
- **THEN** no contradiction SHALL be reported for it, whatever its milestones say
- **AND** the reason SHALL be that a candidate dropped before any work is exactly the case where content and state look contradictory and are not

### Requirement: An initiative carries its attestation
The system SHALL read an `## Attestation` section from an initiative, carrying the reversibility of the change, its blast radius, and who holds what after the merge.

#### Scenario: Reading the section
- **WHEN** an initiative carries an `## Attestation` section
- **THEN** the system SHALL read `door`, `blast-radius` and a RACI table from it
- **AND** an initiative without the section SHALL parse with the attestation absent

#### Scenario: The door vocabulary
- **WHEN** an initiative states `door`
- **THEN** the accepted values SHALL be `one-way` and `two-way`, by explicit lookup
- **AND** any other value SHALL be read as absent rather than interpreted

#### Scenario: A RACI row handled by a system
- **WHEN** a RACI row names a system under **Handled by**
- **THEN** the row SHALL be read as automated
- **AND** empty R, A, C and I cells SHALL NOT be treated as missing

#### Scenario: A RACI row not handled by a system
- **WHEN** a RACI row is not handled by a system
- **THEN** its R, A, C and I values SHALL be read
- **AND** a dash, an em-dash or an empty cell SHALL all be read as absent

#### Scenario: A malformed table
- **WHEN** a RACI table has fewer columns than expected, or none
- **THEN** the rows it does carry SHALL be read
- **AND** parsing SHALL NOT fail

### Requirement: Git is the third input to the state check
The system SHALL accept what git says about an initiative's branch as an optional input to the state check, so that a declared state which agrees with the content can still be caught disagreeing with reality.

#### Scenario: Reading git state
- **WHEN** the system is asked what git says about an initiative
- **THEN** it SHALL report whether `opsp/<id>` exists and whether it has merged into the trunk
- **AND** the trunk SHALL be resolved from explicit candidates rather than inferred

#### Scenario: Git cannot answer
- **WHEN** there is no repository, no trunk, or no git binary
- **THEN** the reader SHALL return undefined
- **AND** undefined SHALL mean unknowable rather than not-merged

#### Scenario: Reading a record never requires git
- **WHEN** an initiative is parsed
- **THEN** no git process SHALL be invoked
- **AND** a caller supplying no git state SHALL see exactly the checks it saw before

#### Scenario: Work landed and the initiative was never closed
- **WHEN** an initiative declares `exploring`, `proposed` or `building`
- **AND** its branch has merged
- **THEN** the system SHALL report a contradiction naming the branch

#### Scenario: Awaiting a pull request is normal
- **WHEN** an initiative declares `attested` or `completed` and its branch has not merged
- **THEN** no contradiction SHALL be reported
- **AND** the reason SHALL be that this is the normal state of an initiative awaiting approval

#### Scenario: A declined initiative
- **WHEN** an initiative declares `declined`
- **THEN** no contradiction SHALL be reported, whatever git says

### Requirement: An initiative filename carries its creation date
The system SHALL instruct an authoring agent to write an initiative to a path prefixed with its creation date, so that a directory listing reads in the order the thinking happened.

#### Scenario: Writing a new initiative
- **WHEN** an agent creates an initiative
- **THEN** the path SHALL be `opensprint/initiatives/<YYYYMMDD>-<name>.md`
- **AND** the date SHALL carry no separators

#### Scenario: The prefix is not the identifier
- **WHEN** an agent is instructed to write or read an initiative
- **THEN** the instruction SHALL state that the identifier is the frontmatter `id:`
- **AND** a reader SHALL resolve by that identifier rather than by the filename

#### Scenario: Reading an initiative by name
- **WHEN** a workflow is given an initiative name
- **THEN** the instruction SHALL state that `<name>.md` will not exist
- **AND** it SHALL name a way to list every initiative with its path

### Requirement: The handoff from building to judgement is a state
The system SHALL provide a state meaning every milestone is done and nothing has been judged, so that the moment accountability moves from the building hats to the judging hats is recorded rather than assumed.

#### Scenario: The state exists between building and attested
- **WHEN** the state vocabulary is enumerated
- **THEN** it SHALL contain a handoff state between `building` and `attested`

#### Scenario: Work finished but never handed over
- **WHEN** an initiative declares `building`
- **AND** every live milestone is done
- **THEN** the system SHALL report a contradiction naming the handoff state

#### Scenario: Handed over with work outstanding
- **WHEN** an initiative declares the handoff state and milestones remain
- **THEN** the system SHALL report how many are outstanding

#### Scenario: Handed over having built nothing
- **WHEN** an initiative declares the handoff state and has no milestones
- **THEN** the system SHALL report that nothing was built

### Requirement: State transitions are performed by a command
The system SHALL move an initiative between states through a command that validates the move, writes the record and regenerates the board — and workflows SHALL use it rather than editing the field.

#### Scenario: Every legal move is declared
- **WHEN** the transitions are enumerated
- **THEN** each SHALL name the state it comes from, the state it goes to, the workflow that performs it, and when it fires

#### Scenario: An illegal move is refused
- **WHEN** a move is requested that the table does not declare
- **THEN** the system SHALL refuse it
- **AND** it SHALL name the moves that are legal from the current state

#### Scenario: Skipping the handoff
- **WHEN** a move is requested from `building` directly to `attested`
- **THEN** the system SHALL refuse it

#### Scenario: A state outside the vocabulary
- **WHEN** a move is requested to a name that is not a state
- **THEN** the system SHALL refuse it and list the accepted states

#### Scenario: An initiative with no state
- **WHEN** an initiative declares no state
- **THEN** any state SHALL be reachable
- **AND** the reason SHALL be that setting one is a repair rather than a move

#### Scenario: A legal move into a contradicted state
- **WHEN** a legal move is made and the content contradicts the new state
- **THEN** the move SHALL be written
- **AND** the contradiction SHALL be reported beside it rather than blocking it

#### Scenario: Re-planning reopens a handed-over initiative
- **WHEN** re-planning adds work to an initiative in the handoff state
- **THEN** a move back to `building` SHALL be legal

#### Scenario: Closing requires having been judged
- **WHEN** an initiative is moved to `completed`
- **THEN** the only legal origin SHALL be `attested`

#### Scenario: Writing the state leaves the rest of the record alone
- **WHEN** a transition is written to an initiative
- **THEN** only the frontmatter state field SHALL change
- **AND** a record whose prose contains the same text SHALL be unaffected

### Requirement: Work falls back to the rung that moved
The system SHALL allow an initiative to return to an earlier state when an artifact above the current work turns out to be wrong, and the state it returns to SHALL be determined by which artifact moved.

#### Scenario: The strategy moved
- **WHEN** a decision the initiative rests on must be superseded
- **THEN** the initiative SHALL return to `proposed`
- **AND** the reason SHALL be that a restated strategy has a bar nothing has been built against

#### Scenario: The plan moved
- **WHEN** only the milestones must change
- **THEN** the initiative SHALL remain at `building`
- **AND** the decision trail SHALL be left alone

#### Scenario: Falling back from the handoff
- **WHEN** an initiative in the handoff state must reopen
- **THEN** moves to both `building` and `proposed` SHALL be legal
- **AND** a refusal from the handoff state SHALL name every legal destination

#### Scenario: Two routes to the same state mean different things
- **WHEN** the transitions from the handoff state to `building` are enumerated
- **THEN** there SHALL be one for a requested change and one for re-planning
- **AND** each SHALL name the workflow that performs it

### Requirement: A transition declares the hat it must be made wearing
The system SHALL record, for each transition, the accountability required to perform it and whether performing it means setting down a different hat — and SHALL refuse a handoff until that accountability is stated.

#### Scenario: Every transition names a hat
- **WHEN** the transitions are enumerated
- **THEN** each SHALL name at least one hat from the registry

#### Scenario: A handoff is refused without the hat
- **WHEN** a transition marked as a handoff is requested
- **AND** no accountability is named
- **THEN** the system SHALL refuse the move
- **AND** it SHALL name the accountabilities that would be accepted

#### Scenario: A handoff is refused in the wrong hat
- **WHEN** a transition marked as a handoff is requested with an accountability it does not accept
- **THEN** the system SHALL refuse the move and say which was offered

#### Scenario: A move that is not a handoff
- **WHEN** a transition not marked as a handoff is requested
- **THEN** no accountability need be named
- **AND** the hat SHALL still be reported with the move

#### Scenario: The hat depends on direction, not on state
- **WHEN** two transitions leave and enter the same state in opposite directions
- **THEN** each SHALL declare its own hat
- **AND** they MAY differ

#### Scenario: Leaving the handoff state
- **WHEN** any transition out of the handoff state is performed
- **THEN** it SHALL NOT be marked as a handoff
- **AND** the reason SHALL be that the accountability already changed on the way in

