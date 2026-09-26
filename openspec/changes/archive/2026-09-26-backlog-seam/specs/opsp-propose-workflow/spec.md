## ADDED Requirements

### Requirement: Initiative descriptors record addressed open loops
The `/opsp:propose` skill SHALL record which open loops an initiative addresses, when it arose from triaging them.

#### Scenario: Descriptor structure with addressed loops
- **WHEN** an initiative is created from one or more open loops
- **THEN** the descriptor SHALL contain an `## Addresses` section listing each loop's kind and record
- **AND** the section SHALL appear in the body alongside Driver Specs, ADRs and Milestones
