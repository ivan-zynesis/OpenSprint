## ADDED Requirements

### Requirement: Board links are built from the filename stem
The system SHALL build every link to an initiative from that initiative's filename stem rather than from its identifier, so that a link resolves whatever prefix the filename carries.

#### Scenario: Linking a mitigating initiative
- **WHEN** the roadmap resolves `mitigated-by` to an initiative
- **THEN** the link SHALL use that initiative's filename stem
- **AND** a dated filename SHALL produce a link that resolves

#### Scenario: The pointer resolves to nothing
- **WHEN** `mitigated-by` names an initiative that does not exist
- **THEN** no link SHALL be rendered
- **AND** the row SHALL say the pointer resolves to nothing
