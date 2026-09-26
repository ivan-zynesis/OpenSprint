## MODIFIED Requirements

### Requirement: Compile initiative into architecture.md
The `/opsp:archive` skill SHALL delegate its compile step to `/opsp:compact`, so that every compiled artifact is produced by one engine under one set of rules.

#### Scenario: Generating architecture.md
- **WHEN** the operator invokes `/opsp:archive <initiative-name>`
- **THEN** the agent SHALL invoke the compact workflow to compile the surrogate
- **AND** SHALL NOT synthesise `architecture.md` with its own section list
- **AND** the compiled output SHALL include `opensprint/architecture.md` and the per-hat views

#### Scenario: Rewriting architecture.md
- **WHEN** `opensprint/architecture.md` already exists
- **THEN** it SHALL be rewritten completely from the current records
- **AND** SHALL NOT be appended to or versioned — the decision records are the version history
