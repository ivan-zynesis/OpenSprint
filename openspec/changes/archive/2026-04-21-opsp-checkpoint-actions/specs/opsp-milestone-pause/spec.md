## MODIFIED Requirements

### Requirement: Milestone pause checkpoint
The `/opsp:apply` skill SHALL present a structured checkpoint when pausing at a milestone or change boundary, including approve and change request actions.

#### Scenario: Checkpoint presentation after milestone
- **WHEN** a milestone's opsx cycle completes and the review mode requires a pause
- **THEN** the agent SHALL display:
  - Milestone name and summary of what was built
  - Opsx changes completed in this milestone
  - Branch name for review: `opsp/<initiative-name>`
  - Count of new commits since last pause
  - Remaining milestones count
- **AND** present options:
  1. "Approve and continue" (default) — confirm changes are good, log approval, proceed
  2. "Raise change request" — fork into direct-propose or explore-first sub-paths
  3. "Switch review mode" — change pause granularity
  4. "Stop here (resume later)" — pause the initiative

#### Scenario: Checkpoint presentation after change (per-change mode)
- **WHEN** an opsx change is archived and the review mode is per-change
- **THEN** the agent SHALL display:
  - Change name and summary
  - Branch name for review: `opsx/<initiative-name>/<change-name>`
  - Remaining changes in current milestone
  - Remaining milestones count
- **AND** present options:
  1. "Approve and continue" (default)
  2. "Raise change request"
  3. "Switch review mode"
  4. "Stop here (resume later)"
