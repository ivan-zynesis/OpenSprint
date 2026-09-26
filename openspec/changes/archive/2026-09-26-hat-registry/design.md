## Context

`src/core/decision-map.ts` is the only code that reads opensprint records. It parses YAML frontmatter into `DriverSpecEntry` and `DecisionEntry`, and is currently exercised only by its own tests — no CLI command calls it. The six driver-spec types live in schema prose and the template, with no validation anywhere in `src/`.

Per-project configuration already exists: `openspec/config.yaml`, parsed by `ProjectConfigSchema` in `src/core/project-config.ts` using resilient field-by-field `safeParse`.

## Goals / Non-Goals

**Goals:**
- Explicit, validated `hats` on each record — one or more (`DEC-016`)
- A per-project hat registry, because the hat set is a property of the product (`DS-SQUAD-HATS`)
- Mechanical validation of both `hats` and driver-spec `type`
- Backfill inference good enough that owner confirmation is a review, not data entry

**Non-Goals:**
- Rendering anything. No view, no manifest, no `--check` — that is milestone 2.
- Reading `hats` at runtime in any existing command.
- A `compact` CLI command or skill.
- Inferring more than one hat. Inference proposes at most one; a record that genuinely crosses hats is assigned by its owner.

## Decisions

**The registry lives in `openspec/config.yaml`, not a new file.** `ProjectConfigSchema` gains an optional `hats: string[]`. It is already the per-project config, already Zod-validated, already read once per command. A second config file would be a second thing to find, and `DEC-012` asks only that the set be per-project.

**The default hat set is a constant, not a literal.** `DEFAULT_HATS` in `src/core/hats.ts`, following the project convention that generated or tracked artifacts are named in a constant. Default: `product`, `maintainer`, `dev`, `devops`, `agreements`.

**Validation is `Set.has` against the resolved registry.** Explicit list lookup, per the project rule preferring lookups over pattern matching. The same module validates driver-spec `type` against `DRIVER_SPEC_TYPES`, closing the gap that let `type: driver-spec` through.

**`hats` is optional; absent means unassigned.** Required would break every existing project on upgrade, which `DS-BACKWARD-COMPAT` forbids. Unassigned is a state `/opsp:compact` reports as an open loop (`DEC-007`), which is the honest behaviour `DEC-006` asks for: the view shows the current state, and an unrouted record *is* the current state.

**`hats` accepts a string or a list, normalised to a list.** One field name rather than a singular and a plural spelling, and a forgiving input shape: `hats: product` and `hats: [product, maintainer]` both parse. Duplicates are removed, order preserved. An empty list is malformed rather than empty-but-valid — declaring the key must say something.

**The default set has four hats, not five.** `DEC-016` superseded `DEC-012` while this change was being implemented. The single-hat rule had required an `agreements` hat for cross-cutting constraints; six of this repository's twenty-one records routed there, none of which had an owner, which is what `DS-SME-OWNERSHIP` requires a hat to have. Multi-hat expresses the same thing without inventing a fifth accountability that maps to nobody.

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

**Inference will be wrong for devops records.** Accepted, and visible. For this repository it costs nothing, because `DS-SELF-USE-SCOPE` and `DEC-017` establish that there is no CI/CD surface and the `devops` hat is legitimately empty. On a project that has one, the records will need assigning by hand. The alternative — keyword heuristics — is worse and harder to unpick later.

**Adding `hats` to `ProjectConfigSchema` touches a file every command reads.** Mitigated by the field being optional with a constant default, and by `readProjectConfig` already parsing field-by-field, so a malformed `hats` degrades to the default rather than failing the command.

**Cross-platform.** All paths through `path.join`. The registry is read from the already-resolved `openspec/config.yaml` path, so no new path construction is introduced beyond what `readProjectConfig` does. Hat names are compared case-sensitively against the registry, which avoids the case-folding differences between macOS and Linux filesystems — hat names are config values, not filenames.
