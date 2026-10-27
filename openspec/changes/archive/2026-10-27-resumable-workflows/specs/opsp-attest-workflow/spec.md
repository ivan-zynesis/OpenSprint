## ADDED Requirements

### Requirement: Attest resumes after the bars it already judged
Attest SHALL distinguish the bars judged in the current pass from the bars not yet judged, using only what the records and git already hold, and SHALL continue with the latter.

#### Scenario: Finding this pass
- **WHEN** attest starts on an initiative at `ready-for-attestation`
- **THEN** it SHALL find the commit that handed the initiative over, and treat a posture dated on or after it, and with no commits to the change since, as judged in this pass

#### Scenario: Resuming
- **WHEN** some bars already carry a posture from this pass
- **THEN** attest SHALL present them as done and judge only the rest
- **AND** it SHALL still confirm the change frame with the operator before reading any bar

#### Scenario: Already attested
- **WHEN** attest starts on an initiative at `attested`
- **THEN** it SHALL say that attestation is done, name `/opsp:archive`, and stop
