## ADDED Requirements

### Requirement: A measure carries its anatomy as sub-blocks
The system SHALL allow a record's `## Measures` section to carry four optional sub-blocks — `### Bar`, `### Posture`, `### Evidence` and `### Exposure` — so that a measure states not only its target but whether it was met, what asserts it, and what remains exposed.

#### Scenario: Parsing the sub-blocks
- **WHEN** a record's `## Measures` section contains a third-level heading named `Bar`, `Posture`, `Evidence` or `Exposure`
- **THEN** the body beneath that heading SHALL be available as that part of the measure
- **AND** the heading match SHALL be case-insensitive on the part name

#### Scenario: All four are optional
- **WHEN** a record carries a `## Measures` section with none of the sub-blocks
- **THEN** it SHALL parse successfully with every part absent
- **AND** its behaviour SHALL be unchanged from before the anatomy existed

#### Scenario: A sub-block outside Measures
- **WHEN** a third-level heading named `Bar` appears outside the `## Measures` section
- **THEN** it SHALL NOT be read as part of the measure anatomy

#### Scenario: An empty sub-block
- **WHEN** a sub-block heading is present with no content beneath it
- **THEN** that part SHALL be treated as absent
- **AND** a heading alone SHALL NOT satisfy it

### Requirement: A bar states its parts by labelled line
The system SHALL read a `### Bar` sub-block as labelled lines, by explicit lookup against a fixed vocabulary, because a bar's parts are a closed set rather than free prose.

#### Scenario: The bar vocabulary
- **WHEN** the system reads a bar
- **THEN** it SHALL look up exactly these labels: `dimension`, `chosen`, `traded for`, `neighbour`
- **AND** SHALL NOT infer parts by pattern matching across the block

#### Scenario: A labelled line
- **WHEN** a line in a `### Bar` block has the form `- **<label>**: <value>`
- **AND** `<label>` is one of the four, compared case-insensitively
- **THEN** `<value>` SHALL be read as that part of the bar

#### Scenario: A partial bar
- **WHEN** a bar declares some labels and not others
- **THEN** the declared parts SHALL be read and the rest SHALL be absent
- **AND** no part SHALL be required for the block to parse
