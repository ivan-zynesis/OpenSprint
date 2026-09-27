## 1. Per-hat default sections

- [ ] 1.1 Replace `DEFAULT_SECTIONS` with `DEFAULT_SECTIONS_BY_HAT`, an explicit map, keeping the current four as `GENERIC_SECTIONS` for hats with no defined shape
- [ ] 1.2 Define the product shape — objective · goals · strategies · measures · open-loops, the first three role-filtered
- [ ] 1.3 Define the maintainer shape — bars · posture · evidence · exposure · open-loops
- [ ] 1.4 Define the dev shape — tech-stack · runtime-topology · entity-schema · open-loops
- [ ] 1.5 Define the devops shape — infra-architecture · gitops · open-loops
- [ ] 1.6 `resolveHatSections` falls back per hat, then to `GENERIC_SECTIONS`

## 2. Role-filtered inputs

- [ ] 2.1 Add `roles?: string[]` to `SectionDef`
- [ ] 2.2 `resolveSectionInputs` filters by role when declared; a record with no role is excluded from a role-filtered section
- [ ] 2.3 Accept `roles` in the config schema and validate it in `resolveHatSections`

## 3. Default observations

- [ ] 3.1 `TECH_STACK_GLOBS` — package manifests and lockfiles across ecosystems, by explicit list
- [ ] 3.2 `ENTITY_SCHEMA_GLOBS` — migrations, schema definitions, ORM models
- [ ] 3.3 `INFRA_GLOBS` — terraform, terragrunt, compose, Dockerfiles
- [ ] 3.4 `GITOPS_GLOBS` — CI definitions across the common hosts

## 4. Measures and the loop

- [ ] 4.1 Add `## Measures` to the driver-spec template, with a primary and a guardrail placeholder
- [ ] 4.2 Document it in the schema's driver-spec instruction
- [ ] 4.3 Add `MEASURABLE_ROLES` as an explicit list — `goal`, `bar`
- [ ] 4.4 Add `constraint-unmeasurable`, firing only for measurable roles with no populated `## Measures`
- [ ] 4.5 A heading with no content beneath it does not satisfy the requirement

## 5. Diagram convention

- [ ] 5.1 Add `detectDiagramConvention(projectRoot)` returning the convention and the files it was found in
- [ ] 5.2 Thresholds as an explicit constant: 0 files is `ascii`, 1–2 is `mixed`, 3 or more is `mermaid`
- [ ] 5.3 Apply the standard exclusions
- [ ] 5.4 Report it in `compact plan` and `plan --json`

## 6. The rendering contract

- [ ] 6.1 Product — the OGSM chain, its causality, and no charter or constraints section
- [ ] 6.2 Maintainer — a bar is dimension, point, trade, neighbour; posture is where we actually sit; cost is an axis
- [ ] 6.3 Dev and devops — describe the system, cite decisions where they explain a choice, never enumerate
- [ ] 6.4 Diagrams follow the repository's habit, ASCII by default, ask when `mixed`, judge per diagram

## 7. Tests

- [ ] 7.1 Each hat's default shape resolves as specified; an unknown hat gets the generic four
- [ ] 7.2 Declared sections still win over any default
- [ ] 7.3 Role filtering — a role-filtered section takes only matching records; a roleless record is excluded
- [ ] 7.4 Granularity — adding a strategy restages `strategies` and leaves `objective` fresh
- [ ] 7.5 Default observation globs match a representative file for each ecosystem
- [ ] 7.6 `constraint-unmeasurable` — fires for a goal with no measures, for an empty heading, and not for objective, strategy or an unclassified record
- [ ] 7.7 Diagram detection — each of the three outcomes, and exclusions applied
- [ ] 7.8 Skill instructions carry the shape contracts and the diagram rule
- [ ] 7.9 Use `path.join()` for every expected path value

## 8. Re-render this repository

- [ ] 8.1 Render all four views in their new shapes
- [ ] 8.2 Render `architecture.md` in the same pass
- [ ] 8.3 Seal, and confirm `compact check` is green
- [ ] 8.4 Measure the compaction ratio again and compare against the 2.9x that selection was meant to improve

## 9. Verification

- [ ] 9.1 `pnpm test` — no new failures beyond the known `zsh-installer` isolation defect
- [ ] 9.2 `pnpm exec tsc --noEmit` clean
- [ ] 9.3 `pnpm lint` clean
- [ ] 9.4 `node bin/openspec.js validate hat-templates --strict` passes, exit code unpiped
- [ ] 9.5 Run `compact plan` against cashier and report what the dev and devops shapes would observe there
