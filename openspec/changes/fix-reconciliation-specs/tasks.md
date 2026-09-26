## 1. Formalize reconciliation-citizen-taxonomy

- [ ] 1.1 Write the delta spec: citizen definition, one-classification-per-run, the four classifications with their criteria and rules, DFS traversal order, and the confidence guardrail
- [ ] 1.2 Strip the superseded free-form sections (`## Definitions`, `## DFS Traversal Order`, `## Agent Confidence Guardrail`) from the source spec, preserving `## Purpose` verbatim

## 2. Formalize reconciliation-conflict-manifest

- [ ] 2.1 Write the delta spec: when the manifest is produced, the summary table, the detail section, the cross-skill warning, and the confirmation prompt
- [ ] 2.2 Strip the superseded free-form sections (`## When It Is Produced`, `## Display Format`, `## Detail Section`, `## Cross-Skill Warning`, `## Operator Confirmation Prompt`), preserving `## Purpose` verbatim

## 3. Verification

- [ ] 3.1 `node bin/openspec.js validate fix-reconciliation-specs --strict` passes
- [ ] 3.2 Archive the change so the requirements land in the source specs
- [ ] 3.3 `source-specs-normalization` passes — the suite's only non-environmental failure is gone
- [ ] 3.4 Confirm every normative statement from the original prose appears in the restructured spec, by reading the diff clause by clause
- [ ] 3.5 `pnpm exec tsc --noEmit` and `pnpm lint` still clean (no `src/` changes expected)
