## 1. Per-hat default sections

- [x] 1.1 Replace `DEFAULT_SECTIONS` with `DEFAULT_SECTIONS_BY_HAT`, an explicit map, keeping the current four as `GENERIC_SECTIONS` for hats with no defined shape
- [x] 1.2 Define the product shape — objective · goals · strategies · measures · open-loops, the first three role-filtered
- [x] 1.3 Define the maintainer shape — bars · posture · evidence · exposure · open-loops
- [x] 1.4 Define the dev shape — tech-stack · runtime-topology · entity-schema · open-loops
- [x] 1.5 Define the devops shape — infra-architecture · gitops · open-loops
- [x] 1.6 `resolveHatSections` falls back per hat, then to `GENERIC_SECTIONS`

## 2. Role-filtered inputs

- [x] 2.1 Add `roles?: string[]` to `SectionDef`
- [x] 2.2 `resolveSectionInputs` filters by role when declared; a record with no role is excluded from a role-filtered section
- [x] 2.3 Accept `roles` in the config schema and validate it in `resolveHatSections`

## 3. Default observations

- [x] 3.1 `TECH_STACK_GLOBS` — package manifests and lockfiles across ecosystems, by explicit list
- [x] 3.2 `ENTITY_SCHEMA_GLOBS` — migrations, schema definitions, ORM models
- [x] 3.3 `INFRA_GLOBS` — terraform, terragrunt, compose, Dockerfiles
- [x] 3.4 `GITOPS_GLOBS` — CI definitions across the common hosts

## 4. Measures and the loop

- [x] 4.1 Add `## Measures` to the driver-spec template, with a primary and a guardrail placeholder
- [x] 4.2 Document it in the schema's driver-spec instruction
- [x] 4.3 Add `MEASURABLE_ROLES` as an explicit list — `goal`, `bar`
- [x] 4.4 Add `constraint-unmeasurable`, firing only for measurable roles with no populated `## Measures`
- [x] 4.5 A heading with no content beneath it does not satisfy the requirement

## 5. Diagram convention

- [x] 5.1 Add `detectDiagramConvention(projectRoot)` returning the convention and the files it was found in
- [x] 5.2 Thresholds as an explicit constant: 0 files is `ascii`, 1–2 is `mixed`, 3 or more is `mermaid`
- [x] 5.3 Apply the standard exclusions
- [x] 5.4 Report it in `compact plan` and `plan --json`

## 6. The rendering contract

- [x] 6.1 Product — the OGSM chain, its causality, and no charter or constraints section
- [x] 6.2 Maintainer — a bar is dimension, point, trade, neighbour; posture is where we actually sit; cost is an axis
- [x] 6.3 Dev and devops — describe the system, cite decisions where they explain a choice, never enumerate
- [x] 6.4 Diagrams follow the repository's habit, ASCII by default, ask when `mixed`, judge per diagram

## 7. Tests

- [x] 7.1 Each hat's default shape resolves as specified; an unknown hat gets the generic four
- [x] 7.2 Declared sections still win over any default
- [x] 7.3 Role filtering — a role-filtered section takes only matching records; a roleless record is excluded
- [x] 7.4 Granularity — adding a strategy restages `strategies` and leaves `objective` fresh
- [x] 7.5 Default observation globs match a representative file for each ecosystem
- [x] 7.6 `constraint-unmeasurable` — fires for a goal with no measures, for an empty heading, and not for objective, strategy or an unclassified record
- [x] 7.7 Diagram detection — each of the three outcomes, and exclusions applied
- [x] 7.8 Skill instructions carry the shape contracts and the diagram rule
- [x] 7.9 Use `path.join()` for every expected path value

## 8. Re-render this repository

- [x] 8.1 Render all four views in their new shapes
- [x] 8.2 Render `architecture.md` in the same pass
- [x] 8.3 Seal, and confirm `compact check` is green
- [x] 8.4 Measure the compaction ratio again and compare against the 2.9x that selection was meant to improve

## 9. Verification

- [x] 9.1 `pnpm test` — no new failures beyond the known `zsh-installer` isolation defect
- [x] 9.2 `pnpm exec tsc --noEmit` clean
- [x] 9.3 `pnpm lint` clean
- [x] 9.4 `node bin/openspec.js validate hat-templates --strict` passes, exit code unpiped
- [x] 9.5 Run `compact plan` against cashier and report what the dev and devops shapes would observe there

## 10. Verification result

- `tsc`, `eslint` and `validate --strict` clean; 1719 tests pass; `compact check` green
- The 18 remaining failures are the known `zsh-installer` isolation defect

### Compaction, re-measured

| | record | views | ratio |
|---|---|---|---|
| before selection | 15,347 tok | 5,328 tok | 2.9x |
| after | 17,945 tok | 5,179 tok | **3.5x** |

The ratio is the less interesting number. **The record grew 17% — three new driver-specs — and the
views shrank 3%.** That is what selection buys: the big picture does not scale with the record.
`dev.md` alone went from 9,401 bytes to 4,284 by describing the system instead of listing sixteen
ADRs.

### What the shapes found

Rendering into the real shapes surfaced things the generic four never would have:

- **`DS-SURROGATE-BUDGET` has no `## Measures`.** The most quantified record in the project —
  93–157K measured across four codebases — states no measure at all. Numbers in a rationale are
  not a stated measure, and `constraint-unmeasurable` caught it.
- **Neither maintainer bar states its neighbour.** Both say where we sit and roughly what it
  bought; neither says what the next position along would cost.
- **The dev tech stack is almost entirely observation.** TypeScript, Node, ESM, pnpm and nine
  dependencies, and not one ADR explaining any of them. Honest — they predate the surrogate — but
  visible now in a way a list of ADRs never made it.
- **Two lockfiles.** `pnpm-lock.yaml` and `package-lock.json` both present.

### A real bug, found by running on cashier

The directory exclusions were applied as `<dir>/**`, which matches only a *top-level* directory. A
monorepo has a `node_modules` and a `dist` under every package, so
`packages/db/dist/migrations/*.sql` was being observed as though it were source — cashier's
entity-schema section reported 42 files where 21 are real.

Fixed to `**/<dir>/**` at both call sites, with a regression test. Rule discovery was unaffected
at 103 files, because rule-file patterns do not appear in build output — which is why the bug
survived two milestones of rule harvesting unnoticed.

### Shapes against cashier

| | observes |
|---|---|
| `dev/tech-stack` | 13 package manifests (monorepo) |
| `dev/entity-schema` | 21 migrations |
| `devops/infra-architecture` | 80 files — terraform modules, Dockerfile, compose |
| `devops/gitops` | 1 — `bitbucket-pipelines.yml` |

`dev/runtime-topology` observes nothing by design: topology is described from decisions, not
scraped from files.
