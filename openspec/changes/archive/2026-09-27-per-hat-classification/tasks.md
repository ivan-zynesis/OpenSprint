## 1. Roles

- [x] 1.1 Add `DEFAULT_ROLES` to `src/core/hats.ts` — an explicit map with `product` to `objective`, `goal`, `strategy`, and every other default hat to an empty list
- [x] 1.2 Add `resolveHatRoles(projectRoot, hat)` mirroring `resolveHatSections`; malformed `roles` degrades to the default and warns, naming hat and key
- [x] 1.3 Widen the `hats` map entry in `ProjectConfigSchema` to accept `roles`
- [x] 1.4 Add `role?: string` to the sourced record types, populated from frontmatter
- [x] 1.5 Add `validateRoles(records, rolesFor)` — reports a role no hat of the record accepts, and a role on a record whose hats declare none

## 2. Driver-spec edges

- [x] 2.1 Populate `dependsOn` on sourced driver-specs from frontmatter, defaulting to an empty array
- [x] 2.2 Add `validateDriverSpecEdges(driverSpecs, decisions)` — reports dangling ids, edges pointing at decision records, and cycles
- [x] 2.3 A record in a cycle is treated as having no edges; everything else still compiles
- [x] 2.4 Confirm `buildTree` in `decision-map.ts` is untouched and driver-spec edges do not reach `DECISION-MAP.md`

## 3. Open loops

- [x] 3.1 Add `record-unclassified` to `OPEN_LOOP_KINDS`
- [x] 3.2 Fire it only for records whose hats declare roles
- [x] 3.3 Attribute it to every hat the record declares, as other loops are

## 4. Schema and templates

- [x] 4.1 Document `role` and `depends-on` in the `driver-spec` artifact instruction
- [x] 4.2 Document `role` in the `decision-record` artifact instruction
- [x] 4.3 Add commented placeholders to both templates

## 5. Tests

- [x] 5.1 Default roles — product has the three OGSM node kinds and not `measure`; other hats have none
- [x] 5.2 Declared roles override; malformed degrades and warns
- [x] 5.3 Role validation — valid, unaccepted, wrong case, and a role on a hat declaring none
- [x] 5.4 Driver-spec edges parse, and are absent by default
- [x] 5.5 Dangling reference reported, naming both records
- [x] 5.6 An edge pointing at a decision record is reported as invalid
- [x] 5.7 A cycle is reported, its records lose their edges, and other records still resolve
- [x] 5.8 Causal ordering is NOT enforced — a strategy depending on an objective is accepted
- [x] 5.9 `DECISION-MAP.md` is byte-identical after driver-specs gain edges
- [x] 5.10 `record-unclassified` fires for a roleless record in a role-declaring hat, and not otherwise
- [x] 5.11 Use `path.join()` for every expected path value

## 6. Backfill this repository

- [x] 6.1 Classify the product-hat driver-specs into `objective | goal | strategy` and present for confirmation, batched by role
- [x] 6.2 Propose the `depends-on` edges among them and present for confirmation
- [x] 6.3 Write only what the operator confirms; leave the rest unclassified and report it

## 7. Verification

- [x] 7.1 `pnpm test` — no new failures beyond the known `zsh-installer` isolation defect
- [x] 7.2 `pnpm exec tsc --noEmit` clean
- [x] 7.3 `pnpm lint` clean
- [x] 7.4 `node bin/openspec.js validate per-hat-classification --strict` passes, exit code unpiped
- [x] 7.5 `compact check` green after the backfill, and `DECISION-MAP.md` unchanged

## 8. Verification result

- `tsc`, `eslint` and `validate --strict` clean; 1676 tests pass
- `compact check` green, `DECISION-MAP.md` byte-identical before and after regeneration
- Zero edge problems and zero role problems across all 13 driver-specs

### What the backfill exposed

Classifying our own records did what the exercise is for: it found that **OpenSprint's surrogate
was missing its own objective.**

The session's first attempt read the records as descriptions of *us*. The operator's correction was
that they mostly describe what is being built **for downstream teams** — so the hat model and loop
closure are strategies, not goals, and the objective and goals were not recorded anywhere. They
lived in `PHILOSOPHY.md` and `architecture.md` as prose.

`DS-SELF-USE-SCOPE` was also misfiled. "We do not compete, we build for ourselves" is not a
direction — it is a position on a spectrum and what we accept for it, which is a maintainer
posture. It moved hats, not just roles, and takes `DS-HIGH-IMPACT-OPS` with it.

### The resulting chain

```
DS-AGENTIC-SDLC (objective)
├── DS-FULL-COVERAGE (goal) ─── DS-SQUAD-HATS (strategy) ─── DS-SME-OWNERSHIP (strategy)
│                           └── DS-LOOP-CLOSURE (strategy)
├── DS-DOCUMENTATION-AS-OUTPUT (goal) ┐
├── DS-SURROGATE-BUDGET (goal) ───────┴── DS-BIG-PICTURE (strategy)
├── DS-PARALLEL-EXEC (strategy)
└── DS-SURROGATE-SCOPE (strategy)

maintainer: DS-HIGH-IMPACT-OPS (bar) · DS-BACKWARD-COMPAT (bar) · DS-SELF-USE-SCOPE (posture)
```

Maintainer goes from one record to three, which makes its shape testable in `hat-templates` for
the first time. `record-unclassified` went from 9 to 0; `constraint-unanswered` from 3 to 6,
because the three new records have no decisions behind them yet.
