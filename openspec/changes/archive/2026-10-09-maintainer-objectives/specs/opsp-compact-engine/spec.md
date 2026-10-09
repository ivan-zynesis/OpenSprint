## ADDED Requirements

### Requirement: A section may select on objective
The system SHALL allow a section to select records by `objective`, independently of `roles`, so that one hat's records can be partitioned along two axes at once.

#### Scenario: Selecting on objective alone
- **WHEN** a section declares `objective` and no `roles`
- **THEN** it SHALL take every record of its input kind declaring that objective

#### Scenario: Selecting on objective and roles together
- **WHEN** a section declares both `objective` and `roles`
- **THEN** a record SHALL be taken only if it declares that objective **and** at least one of those roles

#### Scenario: A section declaring no objective
- **WHEN** a section declares no `objective`
- **THEN** it SHALL NOT filter on objective
- **AND** its behaviour SHALL be unchanged from before objectives existed

#### Scenario: Objective participates in the section input hash
- **WHEN** a record's objective changes
- **THEN** the sections that selected it SHALL restage
- **AND** sections for other objectives SHALL remain fresh

### Requirement: A section may declare its own heading
The system SHALL allow a section to declare a `heading`, used in place of the one derived from its name.

#### Scenario: A declared heading
- **WHEN** a section declares `heading: "Privacy, Retention & Legal"`
- **THEN** that string SHALL be rendered as the section's heading
- **AND** the section's `name` SHALL remain the identifier used in configuration and provenance

#### Scenario: No declared heading
- **WHEN** a section declares no `heading`
- **THEN** the heading SHALL be derived from the name by title-casing its hyphen-separated words, as before
