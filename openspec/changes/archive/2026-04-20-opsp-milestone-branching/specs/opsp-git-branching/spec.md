## ADDED Requirements

### Requirement: Initiative branch creation
The `/opsp:apply` skill SHALL create a dedicated git branch for the initiative before processing any milestones.

#### Scenario: Creating initiative branch from current branch
- **WHEN** the agent begins executing an initiative via `/opsp:apply <initiative-name>`
- **THEN** the agent SHALL run `git checkout -b opsp/<initiative-name>` from the current branch
- **AND** verify the branch was created successfully by running `git branch --show-current`
- **AND** if branch creation fails (e.g., branch already exists), the agent SHALL ask the operator whether to reuse the existing branch or abort

#### Scenario: Initiative branch already exists from prior run
- **WHEN** the agent begins `/opsp:apply <initiative-name>` and branch `opsp/<initiative-name>` already exists
- **THEN** the agent SHALL ask the operator: "Initiative branch opsp/<initiative-name> already exists. Resume from this branch or create a new one?"
- **AND** if resuming, the agent SHALL `git checkout opsp/<initiative-name>`

### Requirement: Change branch creation
The `/opsp:apply` skill SHALL create a per-change branch before implementing each opsx change within a milestone.

#### Scenario: Creating change branch from initiative branch
- **WHEN** the agent is about to implement an opsx change named `<change-name>` for initiative `<initiative-name>`
- **THEN** the agent SHALL ensure it is on the initiative branch `opsp/<initiative-name>`
- **AND** run `git checkout -b opsx/<initiative-name>/<change-name>`
- **AND** verify the branch was created successfully

#### Scenario: Change branch on Windows
- **WHEN** creating a change branch on a Windows system
- **THEN** the agent SHALL use the same forward-slash branch naming (`opsx/<initiative-name>/<change-name>`) as git uses forward slashes for branch names regardless of OS

### Requirement: Change branch merge on archive
The `/opsp:apply` skill SHALL merge the change branch back into the initiative branch when an opsx change is archived.

#### Scenario: Successful merge after opsx archive
- **WHEN** an opsx change `<change-name>` has been archived for initiative `<initiative-name>`
- **THEN** the agent SHALL run `git checkout opsp/<initiative-name>`
- **AND** run `git merge opsx/<initiative-name>/<change-name>`
- **AND** verify the merge succeeded (exit code 0)

#### Scenario: Merge conflict during change branch merge
- **WHEN** merging `opsx/<initiative-name>/<change-name>` into `opsp/<initiative-name>` results in a merge conflict
- **THEN** the agent SHALL pause and present the conflict files to the operator
- **AND** ask the operator to resolve the conflicts
- **AND** NOT auto-resolve merge conflicts

### Requirement: Branch naming convention
All branches created by opsp/opsx workflows SHALL follow a namespaced convention for discoverability.

#### Scenario: Branch name format
- **WHEN** creating any branch for an initiative or change
- **THEN** initiative branches SHALL use the format `opsp/<initiative-name>`
- **AND** change branches SHALL use the format `opsx/<initiative-name>/<change-name>`
- **AND** both `<initiative-name>` and `<change-name>` SHALL be kebab-case
