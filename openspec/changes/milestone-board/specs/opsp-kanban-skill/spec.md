## ADDED Requirements

### Requirement: An initiative opens onto its milestones
The page SHALL open a card onto a board of its milestones as tickets, in five columns — To do, Specifying, Building, Review and Done — read from the card alone.

#### Scenario: Opening a card
- **WHEN** a person opens a card with milestones
- **THEN** the page SHALL show each milestone as a ticket in the column for its stage
- **AND** a superseded milestone SHALL appear under Done, struck through

#### Scenario: Continue on the next one only
- **WHEN** the milestone board is shown
- **THEN** only the next open milestone SHALL offer continue, which starts apply on the initiative

#### Scenario: A change request from Review
- **WHEN** a ticket is in Review
- **THEN** it SHALL offer a change request, which starts apply on the initiative naming that milestone

#### Scenario: No escalation on tickets
- **WHEN** the milestone board is shown
- **THEN** no ticket SHALL offer repropose or reexplore; those move the initiative, from its card
