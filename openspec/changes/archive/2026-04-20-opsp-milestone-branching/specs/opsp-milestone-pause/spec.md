## ADDED Requirements

### Requirement: Review mode selection
The `/opsp:apply` skill SHALL ask the operator to select a review mode before processing the first milestone.

#### Scenario: Presenting review mode options
- **WHEN** the agent has loaded the initiative and surrogate context, before processing the first milestone
- **THEN** the agent SHALL present the operator with three review mode options:
  1. **Per-milestone** (default) — pause after each milestone completes
  2. **Per-change** — pause after each opsx change is archived
  3. **Continuous** — run all milestones without pause
- **AND** proceed with the selected mode

#### Scenario: Operator selects per-milestone mode
- **WHEN** the operator selects "Per-milestone" review mode
- **THEN** the agent SHALL pause after each milestone's full opsx cycle (explore → propose → apply → archive) completes
- **AND** NOT pause between individual opsx changes within a milestone

#### Scenario: Operator selects per-change mode
- **WHEN** the operator selects "Per-change" review mode
- **THEN** the agent SHALL pause after each individual opsx change is archived
- **AND** present a checkpoint before starting the next opsx change or milestone

#### Scenario: Operator selects continuous mode
- **WHEN** the operator selects "Continuous" review mode
- **THEN** the agent SHALL execute all milestones without pausing for review
- **AND** only pause for surrogate escalations (questions the surrogate cannot answer)

### Requirement: Milestone pause checkpoint
The `/opsp:apply` skill SHALL present a structured checkpoint when pausing at a milestone or change boundary.

#### Scenario: Checkpoint presentation after milestone
- **WHEN** a milestone's opsx cycle completes and the review mode requires a pause
- **THEN** the agent SHALL display:
  - Milestone name and summary of what was built
  - Opsx changes completed in this milestone
  - Branch name for review: `opsp/<initiative-name>`
  - Count of new commits since last pause
  - Remaining milestones count
- **AND** present options: "Continue to next milestone", "Switch review mode", "Stop here (resume later)"

#### Scenario: Checkpoint presentation after change (per-change mode)
- **WHEN** an opsx change is archived and the review mode is per-change
- **THEN** the agent SHALL display:
  - Change name and summary
  - Branch name for review: `opsx/<initiative-name>/<change-name>`
  - Remaining changes in current milestone
  - Remaining milestones count
- **AND** present options: "Continue", "Switch review mode", "Stop here (resume later)"

### Requirement: Review mode switching at checkpoints
The operator SHALL be able to change the review mode at any pause checkpoint.

#### Scenario: Switching from per-milestone to continuous
- **WHEN** the operator selects "Switch review mode" at a checkpoint and chooses "Continuous"
- **THEN** the agent SHALL proceed without further pauses (except surrogate escalations)

#### Scenario: Switching from continuous is not possible mid-run
- **WHEN** the operator selected continuous mode
- **THEN** the agent SHALL NOT offer mode switching until the initiative completes or a surrogate escalation occurs
