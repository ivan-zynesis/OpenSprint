## ADDED Requirements

### Requirement: Initiative descriptor artifact
The system SHALL store initiative descriptors as individual markdown files in `opensprint/initiatives/` with YAML frontmatter containing `id`, `status`, `created`, and optional `completed` fields.

#### Scenario: Creating an initiative descriptor
- **WHEN** `/opsp:propose` creates a new initiative
- **THEN** it SHALL create `opensprint/initiatives/<name>.md` with YAML frontmatter:
  - `id`: kebab-case initiative name
  - `status`: one of `active`, `completed`
  - `created`: ISO 8601 date (YYYY-MM-DD)
- **AND** the body SHALL contain:
  - Description section
  - Driver Specs section (list of DS-* IDs)
  - ADRs section (list of DEC-* IDs)
  - Milestones section (list of planned opsx changes with brief descriptions)

#### Scenario: Updating initiative during apply
- **WHEN** an opsx cycle completes as part of `/opsp:apply`
- **THEN** the initiative descriptor SHALL be updated to reference the completed opsx change name
- **AND** mark the corresponding milestone as done

#### Scenario: Initiative file on Windows
- **WHEN** creating an initiative descriptor on Windows
- **THEN** the system SHALL use `path.join('opensprint', 'initiatives', filename)` to construct the file path
