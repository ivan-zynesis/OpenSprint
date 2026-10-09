## ADDED Requirements

### Requirement: Only an attested claim may be stated as present-tense fact
The rendering contract SHALL distinguish three authorities and SHALL permit an unqualified present-tense claim about a property of the system only where the record is attested.

#### Scenario: The three authorities
- **WHEN** the renderer compiles a claim
- **THEN** it SHALL rest on one of: a **decided** record, an **observed** path, or an **attested** record
- **AND** the contract SHALL state that a decision binds but may not be true yet, that an observation is true but may be an accident, and that an attestation ages

#### Scenario: Rendering a decided but unattested claim
- **WHEN** a record is decided and not attested
- **THEN** the claim SHALL be written as a decision, citing the record
- **AND** SHALL NOT be written as a statement about the running system

#### Scenario: Rendering an attested claim
- **WHEN** a record is attested
- **THEN** the claim MAY be stated in the present tense
- **AND** SHALL carry the attestation date

#### Scenario: The renderer is told which
- **WHEN** the renderer compiles a section
- **THEN** the plan SHALL have supplied each record's authority
- **AND** the renderer SHALL NOT infer it from the record's content
