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
├── architecture.md
├── DECISION-MAP.md
├── driver-specs/
├── ADRs/
└── initiatives/
```
- **AND** `architecture.md` SHALL be initialized with section header placeholders
- **AND** `DECISION-MAP.md` SHALL be initialized with an empty tree template
- **AND** the `opensprint/` directory SHALL be at the same level as `openspec/` (project root)
