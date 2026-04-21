## MODIFIED Requirements

### Requirement: Orchestrate multiple opsx cycles
The `/opsp:apply` skill SHALL read an initiative's milestone plan and execute a full opsx lifecycle (explore → propose → apply → archive) for each milestone sequentially, with git branch management and milestone pause checkpoints.

#### Scenario: Loading initiative and surrogate
- **WHEN** the operator invokes `/opsp:apply <initiative-name>`
- **THEN** the agent SHALL read the initiative descriptor from `opensprint/initiatives/<name>.md`
- **AND** load the surrogate context: all active driver-specs, ADRs, and architecture.md
- **AND** display the milestone plan and current progress
- **AND** create the initiative branch `opsp/<initiative-name>` (or resume existing one)
- **AND** ask the operator to select a review mode (per-milestone, per-change, or continuous)

#### Scenario: Executing an opsx cycle for a milestone
- **WHEN** processing a milestone from the initiative plan
- **THEN** the agent SHALL execute the opsx workflow inline:
  1. Think through the milestone (opsx explore level)
  2. Create an opsx change with proposal, specs, design, tasks (opsx propose level)
  3. Create a change branch `opsx/<initiative-name>/<change-name>` from the initiative branch
  4. Implement the tasks on the change branch (opsx apply level)
  5. Archive the completed change (opsx archive level)
  6. Merge the change branch into the initiative branch
- **AND** carry surrogate context into each opsx step

#### Scenario: Milestone completion with pause
- **WHEN** a milestone's opsx cycle completes and the review mode is per-milestone or per-change
- **THEN** the agent SHALL present a review checkpoint with milestone summary, branch info, and operator options
- **AND** wait for operator input before proceeding to the next milestone

#### Scenario: Milestone completion in continuous mode
- **WHEN** a milestone's opsx cycle completes and the review mode is continuous
- **THEN** the agent SHALL log a brief milestone summary and proceed to the next milestone without pausing
