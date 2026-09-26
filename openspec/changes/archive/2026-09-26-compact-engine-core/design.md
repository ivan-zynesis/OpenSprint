## Context

Milestone 1 put a validated `hats` field on every record and left `readDriverSpecs` / `readDecisionRecords` in `src/core/decision-map.ts` carrying it. Nothing consumes it yet.

`DEC-010` requires a provenance manifest recording, per hat and per section, the record ids and content hashes a section was compiled from, plus a hash of the rendered output. `DEC-011` requires a stale section to be re-rendered from its full input set rather than from its previous rendering.

## Goals / Non-Goals

**Goals:**
- Deterministic, model-free staleness detection that can gate CI
- Section granularity fine enough that a new ADR does not restage a hat's constraints
- Output the renderer can consume directly

**Non-Goals:**
- Rendering any view. That is the next change.
- `architecture.md`. Also the next change, per `DEC-014`.
- Open-loop detection beyond unassigned records — rule harvesting is milestone 3 (`DEC-013`).
- Changing what any existing command loads (`DEC-015`).

## Decisions

**Views live in `opensprint/squad/`.** `index.md` plus one file per hat in the registry. This sits inside `opensprint/`, so views travel with their branch and diverge per universe exactly as the records do (`DEC-001`), and reconciliation regenerates rather than merges them.

**A section is a view heading with its own input set.** Four per hat:

| Section | Inputs | Restaged when |
|---|---|---|
| `charter` | every record the hat owns | any of them changes |
| `constraints` | the hat's driver-specs | a driver-spec changes |
| `decisions` | the hat's ADRs | an ADR changes |
| `open-loops` | computed, no record inputs | the record set changes |

This satisfies `DEC-010`'s per-section requirement with input sets that genuinely differ, so a new ADR restages `decisions` and leaves `constraints` fresh. `charter` deliberately depends on everything the hat owns: which records describe the operating model is a judgement the renderer makes (`DEC-008`), so the engine cannot narrow its inputs without guessing.

**Hashes cover content, not the file.** Each record contributes `sha256` of its bytes; a section's input hash is the sha256 of its record ids and content hashes in sorted order. Sorting makes the hash independent of directory iteration order, which differs across platforms.

**Three states, not two.** `DEC-010` names stale and tampered. The engine returns `fresh`, `stale`, `tampered` and `unsealed` — the last for a section with no manifest entry, which is what every project sees before its first `seal`. Folding `unsealed` into `stale` would make the first run report drift that never happened.

**`seal` writes; `plan` and `check` never do.** A CI gate that can repair the thing it checks is not a gate.

**Superseded records are excluded.** The engine reads only `active`/`accepted` records, matching `buildTree` in `decision-map.ts`. A superseded record changing must not restage a view that correctly ignores it.

## Risks / Trade-offs

**`charter` restages on any record change.** Accepted: it is one section of four, and the alternative is the engine guessing which records are governance, which `DEC-008` explicitly leaves to the renderer.

**The manifest is a new file in `opensprint/`.** It is machine-written and machine-read, so it is named `.manifest.json` to signal that no one should hand-edit it — the same stance `DEC-006` takes toward the views themselves.

**Cross-platform.** All paths via `path.join`. Hash inputs are sorted before hashing so that `readdir` order cannot change a hash between macOS, Linux and Windows. Record content is hashed as raw bytes; a checkout that rewrites line endings will produce different hashes on Windows, so the manifest is written with the same normalisation the reader applies — content is read as utf-8 and `\r\n` normalised to `\n` before hashing.
