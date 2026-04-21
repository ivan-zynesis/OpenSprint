## 1. Schema Foundation

- [x] 1.1 Create `schemas/sprint-driven/schema.yaml` with `extends: spec-driven` and artifact definitions for `driver-spec`, `decision-record`, and `decision-map`
- [x] 1.2 Create `schemas/sprint-driven/templates/driver-spec.md` template with YAML frontmatter placeholders and body sections
- [x] 1.3 Create `schemas/sprint-driven/templates/decision-record.md` template with frontmatter and sections: Question, Operator Decision, Consideration Factors, Rationale, Invalidation Trigger
- [x] 1.4 Create `schemas/sprint-driven/templates/decision-map.md` template with empty tree and table structure

## 2. Schema Extends Resolution

- [x] 2.1 Modify `src/core/artifact-graph/resolver.ts` to support the `extends` field — when present, load parent schema first, then merge child artifacts
- [x] 2.2 Ensure child artifacts can declare `requires` on parent artifact IDs
- [x] 2.3 Add schema extends resolution to `src/core/schema-resolution.ts` (or equivalent) for template path fallback to parent schema
- [x] 2.4 Write tests for schema extends: loading, artifact merging, dependency resolution, template fallback

## 3. OpenSprint Directory Support

- [x] 3.1 Modify `src/core/init.ts` to create `opensprint/` directory structure (`driver-specs/`, `decisions/`, `DECISION-MAP.md`) when sprint-driven schema is detected
- [x] 3.2 Ensure the `opensprint/` directory is created at project root alongside `openspec/`
- [x] 3.3 Initialize `DECISION-MAP.md` with empty tree template on first creation
- [x] 3.4 Write tests for init with sprint-driven schema: directory creation on all platforms (path.join usage)

## 4. OPSP Skill Templates

- [x] 4.1 Create `src/core/templates/workflows/driver.ts` — skill template for `/opsp:driver` (create/edit/list driver specs, operator-only write enforcement)
- [x] 4.2 Create `src/core/templates/workflows/decide.ts` — skill template for `/opsp:decide` (agent presents ambiguity, records operator decision, creates ADR, updates decision map)
- [x] 4.3 Create `src/core/templates/workflows/tree.ts` — skill template for `/opsp:tree` (read decisions, compute tree, display with blast radius)
- [x] 4.4 Create `src/core/templates/workflows/rebuild-assess.ts` — skill template for `/opsp:rebuild:assess` (diff driver specs, trace invalidated ADRs, cascade re-evaluation)
- [x] 4.5 Export new templates from `src/core/templates/skill-templates.ts`

## 5. Command Generation Integration

- [x] 5.1 Register OPSP workflows in the command-generation pipeline, gated on sprint-driven schema
- [x] 5.2 Add OPSP workflow IDs to the explicit workflow list constant (driver, decide, tree, rebuild-assess)
- [x] 5.3 Ensure `init` generates OPSP skills under `.<tool>/skills/opensprint-*/SKILL.md` for selected tools when sprint-driven
- [x] 5.4 Ensure `init` generates OPSP slash commands under `.<tool>/commands/opsp/` for selected tools when sprint-driven
- [x] 5.5 Write tests for OPSP skill and command generation: file creation, content correctness, gating on schema

## 6. Decision Map Generation

- [x] 6.1 Create `src/core/decision-map.ts` — programmatic generation of DECISION-MAP.md by reading all decision records from `opensprint/decisions/`
- [x] 6.2 Implement dependency tree construction from `depends-on` frontmatter fields
- [x] 6.3 Implement blast radius calculation (transitive downstream count, excluding superseded/deprecated)
- [x] 6.4 Implement ASCII tree rendering with depth and blast radius annotations
- [x] 6.5 Implement impact summary table generation (sorted by depth, then ID)
- [x] 6.6 Write tests for decision map generation: tree building, blast radius, rendering, edge cases with superseded decisions
