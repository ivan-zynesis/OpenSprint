## MODIFIED Requirements

### Requirement: Directory Creation

The command SHALL create the OpenSpec directory structure with config file, and when sprint-driven schema is active, also create the OpenSprint directory structure.

#### Scenario: Creating OpenSpec structure
- **WHEN** `openspec init` is executed
- **THEN** create the following directory structure:
```
openspec/
├── config.yaml
├── specs/
└── changes/
    └── archive/
```

#### Scenario: Creating OpenSprint structure with sprint-driven schema
- **WHEN** `openspec init` is executed
- **AND** the selected or configured schema is `sprint-driven`
- **THEN** also create the following directory structure alongside `openspec/`:
```
opensprint/
├── DECISION-MAP.md
├── driver-specs/
└── decisions/
```
- **AND** `DECISION-MAP.md` SHALL be initialized with an empty tree template
- **AND** the `opensprint/` directory SHALL be at the same level as `openspec/` (project root)

### Requirement: Skill Generation

The command SHALL generate Agent Skills for selected AI tools, including OPSP skills when sprint-driven schema is active.

#### Scenario: Generating skills for a tool
- **WHEN** a tool is selected during initialization
- **THEN** create 9 OPSX skill directories under `.<tool>/skills/` (existing behavior unchanged)

#### Scenario: Generating OPSP skills for a tool with sprint-driven schema
- **WHEN** a tool is selected during initialization
- **AND** the schema is `sprint-driven`
- **THEN** also create OPSP skill directories under `.<tool>/skills/`:
  - `opensprint-driver/SKILL.md`
  - `opensprint-decide/SKILL.md`
  - `opensprint-tree/SKILL.md`
  - `opensprint-rebuild-assess/SKILL.md`
- **AND** each SKILL.md SHALL contain YAML frontmatter with name and description
- **AND** each SKILL.md SHALL contain the skill instructions for the OPSP workflow

### Requirement: Slash Command Generation

The command SHALL generate opsx slash commands for selected AI tools, and opsp slash commands when sprint-driven schema is active.

#### Scenario: Generating slash commands for a tool
- **WHEN** a tool is selected during initialization
- **THEN** create 9 OPSX slash command files (existing behavior unchanged)

#### Scenario: Generating OPSP slash commands with sprint-driven schema
- **WHEN** a tool is selected during initialization
- **AND** the schema is `sprint-driven`
- **THEN** also create OPSP slash command files using the tool's command adapter:
  - `/opsp:driver`
  - `/opsp:decide`
  - `/opsp:tree`
  - `/opsp:rebuild-assess`
- **AND** use tool-specific path conventions (e.g., `.claude/commands/opsp/` for Claude)
