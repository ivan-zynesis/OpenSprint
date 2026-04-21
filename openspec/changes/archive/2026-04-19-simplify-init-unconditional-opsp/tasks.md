## 1. Remove schema gating from init

- [x] 1.1 Remove `--schema` option from init command in `src/cli/index.ts`
- [x] 1.2 Remove `schemaOverride` field and constructor assignment from `InitCommand` in `src/core/init.ts`
- [x] 1.3 Remove `readConfiguredSchema()` method from `src/core/init.ts`
- [x] 1.4 Remove conditional OPSP skill/command generation — always include `getOpspSkillTemplates()` and `getOpspCommandContents()` without schema check
- [x] 1.5 Remove the schema-override logic in `createConfig` that updates existing config files

## 2. Unconditional directory creation

- [x] 2.1 Merge `createOpenSprintStructure` into `createDirectoryStructure` — always create both `openspec/` and `opensprint/` directories
- [x] 2.2 Remove the separate `createOpenSprintStructure` method entirely
- [x] 2.3 Ensure `architecture.md` and `DECISION-MAP.md` initialization happens in the merged method

## 3. Update tests

- [x] 3.1 Update `test/core/init-opensprint.test.ts` — remove the "should NOT create opensprint/ for spec-driven" test, update remaining tests to expect unconditional creation
- [x] 3.2 Update `test/core/opsp-skill-generation.test.ts` — remove sprint-driven config setup from init tests, all tests should expect OPSP skills without schema config
- [x] 3.3 Run full test suite to verify no regressions
