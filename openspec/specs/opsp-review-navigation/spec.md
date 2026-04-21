# Review Navigation Specification

## Purpose

Enable operators to review initiative progress by displaying git commit graphs, branch status, and change diffs organized by milestone.

## Requirements

### Requirement: Initiative commit graph display
The `/opsp:review` skill SHALL display the git commit graph for an initiative's branches.

#### Scenario: Showing commit graph for an initiative
- **WHEN** the operator invokes `/opsp:review <initiative-name>`
- **THEN** the agent SHALL run `git log --graph --oneline --all opsp/<initiative-name> opsx/<initiative-name>/*` to show the commit structure
- **AND** display the output with annotations mapping branches to milestones and changes

#### Scenario: Initiative has no branches yet
- **WHEN** the operator invokes `/opsp:review <initiative-name>` and no `opsp/<initiative-name>` branch exists
- **THEN** the agent SHALL inform the operator that no branches exist for this initiative
- **AND** suggest running `/opsp:apply <initiative-name>` first

### Requirement: Branch listing with status
The `/opsp:review` skill SHALL list all branches for an initiative with their merge status.

#### Scenario: Listing initiative branches
- **WHEN** the operator invokes `/opsp:review <initiative-name>`
- **THEN** the agent SHALL list:
  - The initiative branch `opsp/<initiative-name>` and its status relative to main/base branch
  - All change branches matching `opsx/<initiative-name>/*`
  - For each change branch: whether it has been merged into the initiative branch or is still open
- **AND** read the initiative descriptor to map branches to milestones

#### Scenario: Showing milestone-to-change mapping
- **WHEN** displaying branch listing
- **THEN** the agent SHALL read `opensprint/initiatives/<initiative-name>.md`
- **AND** group change branches by their parent milestone
- **AND** show completion status per milestone

### Requirement: Branch-level review assistance
The `/opsp:review` skill SHALL help operators navigate to specific branches for review.

#### Scenario: Operator wants to review a specific change
- **WHEN** the operator asks to review a specific change branch
- **THEN** the agent SHALL run `git diff opsp/<initiative-name>...opsx/<initiative-name>/<change-name>` to show what that change introduced
- **AND** summarize the files changed and the nature of the changes

#### Scenario: Operator wants to review a full milestone
- **WHEN** the operator asks to review all changes in a milestone
- **THEN** the agent SHALL identify all change branches for that milestone from the initiative descriptor
- **AND** show a combined diff of all changes in that milestone relative to the previous milestone's merge point
