## MODIFIED Requirements

### Requirement: Directory Creation

The command SHALL create both the OpenSpec and OpenSprint directory structures unconditionally.

#### Scenario: Creating both directory structures
- **WHEN** `opensprint init` is executed
- **THEN** create both directory structures:
```
openspec/
├── config.yaml
├── specs/
└── changes/
    └── archive/

opensprint/
├── architecture.md
├── DECISION-MAP.md
├── driver-specs/
├── ADRs/
└── initiatives/
```
- **AND** `architecture.md` SHALL be initialized with section header placeholders
- **AND** `DECISION-MAP.md` SHALL be initialized with an empty tree template
- **AND** both directories SHALL be at the project root level

### Requirement: Skill Generation

The command SHALL generate both OPSX and OPSP Agent Skills for selected AI tools unconditionally.

#### Scenario: Generating all skills for a tool
- **WHEN** a tool is selected during initialization
- **THEN** create OPSX skill directories under `.<tool>/skills/` (4 core workflows)
- **AND** create OPSP skill directories under `.<tool>/skills/` (8 OPSP workflows: driver, decide, tree, rebuild-assess, explore, propose, apply, archive)
- **AND** generation SHALL NOT be gated on any schema flag or config value

### Requirement: Slash Command Generation

The command SHALL generate both OPSX and OPSP slash commands for selected AI tools unconditionally.

#### Scenario: Generating all commands for a tool
- **WHEN** a tool is selected during initialization
- **THEN** create OPSX slash command files under `.<tool>/commands/opsx/`
- **AND** create OPSP slash command files under `.<tool>/commands/opsp/`
- **AND** generation SHALL NOT be gated on any schema flag or config value
