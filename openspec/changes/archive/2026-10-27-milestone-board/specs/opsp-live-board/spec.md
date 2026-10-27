## ADDED Requirements

### Requirement: A milestone's stage moves through a table
The system SHALL move a milestone's stage on the card only along declared moves — todo to specifying, specifying to building, building to review, review to done, and review back to specifying — and SHALL refuse any other.

#### Scenario: A legal move
- **WHEN** a stage move the table declares is requested
- **THEN** the card SHALL show the new stage
- **AND** its history SHALL gain one line naming the milestone and both stages

#### Scenario: An illegal move
- **WHEN** a stage move the table does not declare is requested
- **THEN** the system SHALL refuse it and name the moves allowed from the milestone's stage

#### Scenario: In order
- **WHEN** a milestone is moved out of `todo` while an earlier live milestone is not done
- **THEN** the system SHALL refuse, naming the milestone that comes first

#### Scenario: Done is the file's to say
- **WHEN** a milestone is moved to `done` and the initiative file does not check it
- **THEN** the system SHALL refuse, saying to check it off in the initiative first

#### Scenario: The list follows the file
- **WHEN** a stage is written
- **THEN** the card's milestones SHALL first be brought into line with the initiative file, keeping stages only the board knows

#### Scenario: No board
- **WHEN** a stage is written and `origin` has no board
- **THEN** the system SHALL say so and succeed

### Requirement: Apply moves its milestone on the board
Apply SHALL write the milestone's stage at each step of its opsx cycle: specifying when the change is created, building when its worktree is made, review when it is merged and waiting at the checkpoint, done when it is checked off, and specifying again on a change request.

#### Scenario: Every step names its stage
- **WHEN** apply's instructions are read
- **THEN** each of those steps SHALL run `opensprint kanban stage` with its stage
