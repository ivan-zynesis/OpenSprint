## ADDED Requirements

### Requirement: Orchestrate multiple opsx cycles
The `/opsp:apply` skill SHALL read an initiative's milestone plan and execute a full opsx lifecycle (explore → propose → apply → archive) for each milestone sequentially.

#### Scenario: Loading initiative and surrogate
- **WHEN** the operator invokes `/opsp:apply <initiative-name>`
- **THEN** the agent SHALL read the initiative descriptor from `opensprint/initiatives/<name>.md`
- **AND** load the surrogate context: all active driver-specs, ADRs, and architecture.md
- **AND** display the milestone plan and current progress

#### Scenario: Executing an opsx cycle for a milestone
- **WHEN** processing a milestone from the initiative plan
- **THEN** the agent SHALL execute the opsx workflow inline:
  1. Think through the milestone (opsx explore level)
  2. Create an opsx change with proposal, specs, design, tasks (opsx propose level)
  3. Implement the tasks (opsx apply level)
  4. Archive the completed change (opsx archive level)
- **AND** carry surrogate context into each opsx step

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
