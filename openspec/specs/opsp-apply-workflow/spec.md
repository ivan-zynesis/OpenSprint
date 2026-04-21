# OPSP Apply Workflow Specification

## Purpose

Orchestrate multiple opsx lifecycle cycles for each milestone in an initiative, using the operator surrogate to resolve questions autonomously.

## Requirements

### Requirement: Orchestrate multiple opsx cycles
The `/opsp:apply` skill SHALL read an initiative's milestone plan and execute a full opsx lifecycle (explore → propose → apply → archive) for each milestone sequentially, with git branch management, milestone pause checkpoints, and support for corrective opsx changes when the operator raises a change request.

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
- **THEN** the agent SHALL present a review checkpoint with milestone summary, branch info, and operator options including "Approve and continue" and "Raise change request"
- **AND** wait for operator input before proceeding to the next milestone

#### Scenario: Operator raises change request during apply
- **WHEN** the operator selects "Raise change request" at any checkpoint
- **THEN** the agent SHALL present sub-path options: "I know what needs to change" or "I need to explore this first"
- **AND** delegate to `/opsx:propose` (direct path) or `/opsx:explore` then optionally `/opsx:propose` (explore path)
- **AND** after any corrective opsx change is archived, reload the full surrogate context
- **AND** return to the same checkpoint so the operator can approve, raise another change request, or take other actions

#### Scenario: Milestone completion in continuous mode
- **WHEN** a milestone's opsx cycle completes and the review mode is continuous
- **THEN** the agent SHALL log a brief milestone summary and proceed to the next milestone without pausing

### Requirement: Surrogate-based question resolution
The `/opsp:apply` skill SHALL attempt to resolve questions arising during opsx execution by consulting the operator surrogate (driver-specs + ADRs + architecture.md) before escalating to the operator.

#### Scenario: Question auto-resolved by surrogate
- **WHEN** a question arises during opsx execution that can be answered by existing driver-specs, ADRs, or architecture.md
- **THEN** the agent SHALL resolve it without interrupting the operator
- **AND** SHALL note the resolution in the opsx change context

#### Scenario: Question escalated to operator
- **WHEN** a question arises that the surrogate cannot answer (architecture-critical ambiguity)
- **THEN** the agent SHALL pause the opsx cycle
- **AND** present a summarized question to the operator — not the raw opsx question, but a higher-level formulation whose answer enriches the surrogate
- **AND** upon receiving the operator's answer, classify it as a new driver-spec, new ADR, or update to existing artifact
- **AND** write the appropriate opensprint artifact
- **AND** resume the opsx cycle with the new knowledge

### Requirement: Sequential execution with context carry-forward
The `/opsp:apply` skill SHALL execute milestones sequentially, carrying lessons from completed cycles into subsequent ones.

#### Scenario: Context carry-forward between milestones
- **WHEN** one milestone's opsx cycle completes
- **THEN** the agent SHALL summarize what was learned and built
- **AND** update the initiative descriptor with the completed opsx change reference
- **AND** carry updated surrogate context (including any new ADRs or driver-specs) into the next milestone

#### Scenario: Context management for long initiatives
- **WHEN** processing milestones in a multi-milestone initiative
- **THEN** the agent SHALL summarize completed milestones to conserve context window
- **AND** retain full surrogate context (driver-specs, ADRs, architecture.md) across all milestones
