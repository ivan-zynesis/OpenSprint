## 1. Roles

- [ ] 1.1 Add `DEFAULT_ROLES` to `src/core/hats.ts` — an explicit map with `product` to `objective`, `goal`, `strategy`, and every other default hat to an empty list
- [ ] 1.2 Add `resolveHatRoles(projectRoot, hat)` mirroring `resolveHatSections`; malformed `roles` degrades to the default and warns, naming hat and key
- [ ] 1.3 Widen the `hats` map entry in `ProjectConfigSchema` to accept `roles`
- [ ] 1.4 Add `role?: string` to the sourced record types, populated from frontmatter
- [ ] 1.5 Add `validateRoles(records, rolesFor)` — reports a role no hat of the record accepts, and a role on a record whose hats declare none

## 2. Driver-spec edges

- [ ] 2.1 Populate `dependsOn` on sourced driver-specs from frontmatter, defaulting to an empty array
- [ ] 2.2 Add `validateDriverSpecEdges(driverSpecs, decisions)` — reports dangling ids, edges pointing at decision records, and cycles
- [ ] 2.3 A record in a cycle is treated as having no edges; everything else still compiles
- [ ] 2.4 Confirm `buildTree` in `decision-map.ts` is untouched and driver-spec edges do not reach `DECISION-MAP.md`

## 3. Open loops

- [ ] 3.1 Add `record-unclassified` to `OPEN_LOOP_KINDS`
- [ ] 3.2 Fire it only for records whose hats declare roles
- [ ] 3.3 Attribute it to every hat the record declares, as other loops are

## 4. Schema and templates

- [ ] 4.1 Document `role` and `depends-on` in the `driver-spec` artifact instruction
- [ ] 4.2 Document `role` in the `decision-record` artifact instruction
- [ ] 4.3 Add commented placeholders to both templates

## 5. Tests

- [ ] 5.1 Default roles — product has the three OGSM node kinds and not `measure`; other hats have none
- [ ] 5.2 Declared roles override; malformed degrades and warns
- [ ] 5.3 Role validation — valid, unaccepted, wrong case, and a role on a hat declaring none
- [ ] 5.4 Driver-spec edges parse, and are absent by default
- [ ] 5.5 Dangling reference reported, naming both records
- [ ] 5.6 An edge pointing at a decision record is reported as invalid
- [ ] 5.7 A cycle is reported, its records lose their edges, and other records still resolve
- [ ] 5.8 Causal ordering is NOT enforced — a strategy depending on an objective is accepted
- [ ] 5.9 `DECISION-MAP.md` is byte-identical after driver-specs gain edges
- [ ] 5.10 `record-unclassified` fires for a roleless record in a role-declaring hat, and not otherwise
- [ ] 5.11 Use `path.join()` for every expected path value

## 6. Backfill this repository

- [ ] 6.1 Classify the product-hat driver-specs into `objective | goal | strategy` and present for confirmation, batched by role
- [ ] 6.2 Propose the `depends-on` edges among them and present for confirmation
- [ ] 6.3 Write only what the operator confirms; leave the rest unclassified and report it

## 7. Verification

- [ ] 7.1 `pnpm test` — no new failures beyond the known `zsh-installer` isolation defect
- [ ] 7.2 `pnpm exec tsc --noEmit` clean
- [ ] 7.3 `pnpm lint` clean
- [ ] 7.4 `node bin/openspec.js validate per-hat-classification --strict` passes, exit code unpiped
- [ ] 7.5 `compact check` green after the backfill, and `DECISION-MAP.md` unchanged
