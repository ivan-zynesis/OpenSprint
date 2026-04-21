## MODIFIED Requirements

### Requirement: Decision map auto-maintenance
The system SHALL automatically regenerate `DECISION-MAP.md` whenever a decision record or driver spec is created, modified, or superseded.

#### Scenario: Reading decision records for map generation
- **WHEN** the decision map is regenerated
- **THEN** the system SHALL read all files in `opensprint/ADRs/` (not `opensprint/decisions/`)
- **AND** parse YAML frontmatter to extract id, status, depends-on, and depth
