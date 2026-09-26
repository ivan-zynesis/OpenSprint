## Context

`src/core/decision-map.ts` is the only code that reads opensprint records. It parses YAML frontmatter into `DriverSpecEntry` and `DecisionEntry`, and is currently exercised only by its own tests — no CLI command calls it. The six driver-spec types live in schema prose and the template, with no validation anywhere in `src/`.

Per-project configuration already exists: `openspec/config.yaml`, parsed by `ProjectConfigSchema` in `src/core/project-config.ts` using resilient field-by-field `safeParse`.

## Goals / Non-Goals

**Goals:**
- One explicit, validated `hat` per record (`DEC-012`)
- A per-project hat registry, because the hat set is a property of the product (`DS-SQUAD-HATS`)
- Mechanical validation of both `hat` and driver-spec `type`
- Backfill inference good enough that owner confirmation is a review, not data entry

**Non-Goals:**
- Rendering anything. No view, no manifest, no `--check` — that is milestone 2.
- Reading `hat` at runtime in any existing command.
- A `compact` CLI command or skill.
- Multi-hat records. `DEC-012` settles this: one hat per record, because a record with two owners has none.

## Decisions

**The registry lives in `openspec/config.yaml`, not a new file.** `ProjectConfigSchema` gains an optional `hats: string[]`. It is already the per-project config, already Zod-validated, already read once per command. A second config file would be a second thing to find, and `DEC-012` asks only that the set be per-project.

**The default hat set is a constant, not a literal.** `DEFAULT_HATS` in `src/core/hats.ts`, following the project convention that generated or tracked artifacts are named in a constant. Default: `product`, `maintainer`, `dev`, `devops`, `agreements`.

**Validation is `Set.has` against the resolved registry.** Explicit list lookup, per the project rule preferring lookups over pattern matching. The same module validates driver-spec `type` against `DRIVER_SPEC_TYPES`, closing the gap that let `type: driver-spec` through.

**`hat` is optional; absent means unassigned.** Required would break every existing project on upgrade. Unassigned is a state `/opsp:compact` reports as an open loop (`DEC-007`), which is the honest behaviour `DEC-006` asks for: the view shows the current state, and an unrouted record *is* the current state.

**Default-hat inference has two rules and one honest gap.**

| Driver-spec `type` | Default hat | Because |
|---|---|---|
| `product` | product | what it must do |
| `business` | product | commercial constraints on what it must do |
| `legal` | maintainer | what must be true of it while it does that |
| `compliance` | maintainer | same |
| `reliability` | maintainer | same |
| `architecture` | dev | how it is built |

An ADR defaults to the hat of its nearest driver-spec ancestor, walked through `depends-on`. If ancestors disagree, or there are none, the ADR is left unassigned for confirmation.

The gap: **nothing infers `devops`**. No driver-spec type maps to it, and an infrastructure ADR usually descends from a reliability driver-spec, so it would infer `maintainer`. This is left as confirmation work rather than papered over with keyword matching — guessing "devops" from the word "deploy" is exactly the pattern matching the project rules reject. Batched confirmation is what `DEC-012` specifies anyway.

**Inference is a pure function, applied once.** `defaultHatFor()` returns a suggestion; nothing writes it automatically. Milestone 2's compact calls it on first run and presents the batch; this change calls it once to backfill this repository.

## Risks / Trade-offs

**Inference will be wrong for devops records.** Accepted, and visible: of this repo's own 15 ADRs, the ones about worktrees and reconciliation will infer `dev` and need correcting to `agreements` or `devops` by hand. The alternative — keyword heuristics — is worse and harder to unpick later.

**Adding `hats` to `ProjectConfigSchema` touches a file every command reads.** Mitigated by the field being optional with a constant default, and by `readProjectConfig` already parsing field-by-field, so a malformed `hats` degrades to the default rather than failing the command.

**Cross-platform.** All paths through `path.join`. The registry is read from the already-resolved `openspec/config.yaml` path, so no new path construction is introduced beyond what `readProjectConfig` does. Hat names are compared case-sensitively against the registry, which avoids the case-folding differences between macOS and Linux filesystems — hat names are config values, not filenames.
