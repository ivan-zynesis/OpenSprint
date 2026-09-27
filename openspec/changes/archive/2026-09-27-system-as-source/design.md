## Context

A section declares `inputs` — which records feed it. Everything the engine hashes is a record. `DEC-011` requires a stale section to rebuild from its full input set; `DEC-010` requires the manifest to record what a section was compiled from.

At milestone 3 the `open-loops` staleness gap was raised and accepted as a known limitation, on the reasoning that closing it would mean `check` scanning the source tree and losing its cheapness.

## Goals / Non-Goals

**Goals:**
- A section can describe the system, not only the record
- Observations carry provenance on the same terms as records
- The boundary between decided and observed is visible to a reader
- Close the `open-loops` gap

**Non-Goals:**
- Detecting contradiction between record and system. That is what a failing rule is for (`DS-LOOP-CLOSURE`), and compaction reports absence rather than adjudicating disagreement.
- Interpreting observed files. The engine hashes them and hands their paths to the renderer; understanding what a lockfile means is synthesis.
- Defining which paths each hat shape observes. That is `hat-templates`.

## Decisions

**`observes` is separate from `inputs`, not another input kind.** Code is orthogonal to record kind: a `tech-stack` section may want dev's decisions *and* `package.json`. Folding code into the `inputs` enum would force a section to choose one or the other.

```ts
interface SectionDef {
  name: string;
  inputs: SectionInputKind;       // all | driver-specs | decisions | none
  observes?: 'rules' | string[];  // the project's rule files, or explicit globs
}
```

**`observes: 'rules'` is a named set, not a glob list.** `open-loops` derives from the rule index, and the rule globs are already project configuration (`ruleGlobs`). Requiring the default section to repeat them would let the two drift, and a project changing `ruleGlobs` would silently stop restaging its open loops.

**The cost objection was wrong, and the gap closes.** Milestone 3 recorded a trade-off between a cheap gate and a complete one. Measured on cashier: 103 rule files, **31ms to glob and 3ms to hash**. The earlier reasoning assumed a source-tree walk; `fast-glob` prunes ignored directories during traversal rather than filtering afterwards. There is no trade to make, so `open-loops` observes `rules` by default.

**Observations join the same input hash.** Not a second hash. A section is stale when *what it was compiled from* has moved, and whether that was a record or a file is the renderer's concern, not the gate's. The manifest records them separately — `inputs` keyed by record id, `observed` keyed by path — so a stale report can name which.

**The renderer must mark the boundary.** A claim compiled from a record cites the record id, as `DEC-009` already requires. A claim compiled from an observation cites the **path** it was seen at. Without this a reader cannot tell "we decided this" from "this is what the code currently does" — and those carry very different authority. A decision is binding; an observation is a fact that may be an accident.

**Observed paths are recorded project-relative and sorted**, for the same reason record ids are: a hash that depends on absolute paths or on directory iteration order differs across machines and platforms.

## Risks / Trade-offs

**`check` now touches the filesystem beyond the surrogate.** Bounded by the configured globs and the existing exclusions, and measured at 34ms on the largest surrogate available. A project with pathological globs could make it slow; that is a configuration problem with a visible cause.

**A section observing nothing still carries an empty `observed` map.** Slight manifest noise, in exchange for one shape rather than two.

**An observation can be a lie by omission.** Rendering "the stack is TypeScript and Node" from `package.json` says nothing about whether anyone decided that. This is precisely the case `DS-BIG-PICTURE` and the boundary rule exist for: the observation cites the file, and a reader can see no decision is cited beside it.

**Cross-platform.** Globs go through `fast-glob`, which normalises separators; paths are stored project-relative with `path.sep` normalised to `/` before hashing so a manifest written on Windows matches one written on macOS.
