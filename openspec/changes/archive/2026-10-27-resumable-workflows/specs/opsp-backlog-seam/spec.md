## ADDED Requirements

### Requirement: Triage resumes from what the initiative holds
Triage SHALL record its strategy thinking in the initiative before it pauses or hands over, and SHALL resume from that record rather than from nothing.

#### Scenario: Recording the thinking
- **WHEN** triage brainstorms an item's strategy
- **THEN** it SHALL write a `## Triage` section in the initiative with the approaches weighed, the one it leans toward and the open questions
- **AND** it SHALL write no driver-spec, ADR or milestone

#### Scenario: Resuming
- **WHEN** triage starts on an item whose initiative already has a `## Triage` section
- **THEN** it SHALL read that section first and continue from its open questions, without weighing again the approaches it already weighed

#### Scenario: Already past triage
- **WHEN** triage starts on an item that is no longer `exploring`, or that is `exploring` and held by someone with a strategy already chosen
- **THEN** it SHALL say which workflow comes next and stop
