# OPSP Explore Workflow Specification

## Purpose

Provide an initiative-level brainstorming mode for architect-level thinking about system-wide concerns without creating artifacts.

## Requirements

### Requirement: Initiative-level thinking partner
The `/opsp:explore` skill SHALL provide an initiative-level brainstorming mode where the operator and agent think at architect level about system-wide concerns, without creating any artifacts.

#### Scenario: Entering explore mode
- **WHEN** the operator invokes `/opsp:explore`
- **THEN** the agent SHALL read all existing opensprint artifacts (driver-specs, ADRs, architecture.md) for context
- **AND** engage in open-ended conversation about the initiative idea
- **AND** SHALL NOT create any files or artifacts during exploration

#### Scenario: Thinking at architect level
- **WHEN** exploring an initiative idea
- **THEN** the agent SHALL reason about system-wide implications, cross-domain trade-offs, and architectural boundaries
- **AND** SHALL NOT dive into implementation details, code-level decisions, or squad-level work
- **AND** SHALL use ASCII diagrams to visualize system structures and decision trees

#### Scenario: Transitioning to propose
- **WHEN** the exploration reaches clarity
- **THEN** the agent SHALL offer to create an initiative via `/opsp:propose`
- **AND** carry the conversation context forward into the proposal
