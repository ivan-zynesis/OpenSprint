## Context

`DEC-SCOPED-SEAL` decides both halves. This change is that decision.

## Goals / Non-Goals

**Goals**
- Scope sealing to named hats
- Make sealing refuse to bless a section whose view was not re-rendered

**Non-Goals**
- Compiling anything — that is `render-on-milestone`
- Changing what `check` does

## Decisions

### Output comparison is per hat, because `outputHash` is per hat

A manifest entry carries the hash of **the hat's rendered view file**, so every section of a hat
shares one `outputHash`. That makes the comparison natural at hat granularity: if the view on disk
hashes to what the manifest already holds, nothing about that hat was re-rendered, so none of its
entries may be resealed.

It also aligns exactly with `--hat` scoping, which is a good sign the boundary is in the right place.

### Carry forward, do not drop

A hat that is skipped — out of scope, or unchanged — keeps its **existing entries verbatim**,
including their old `inputHash`. That is what preserves the staleness signal: `check` compares
current inputs against the recorded hash and still reports a difference.

Dropping the entries instead would report them as *unsealed*, which is a different and misleading
state.

### First seal is always allowed

A hat with no existing manifest entries has nothing to compare against, so it seals. Otherwise a
fresh project could never seal anything.

### An unknown hat warns rather than failing

Consistent with how `resolveHatSections` and `resolveHatRoles` treat a malformed registry: warn,
degrade, do not fail the command. A typo in `--hat` should not abort an archive.

## Risks / Trade-offs

**A hand-edited view would be treated as re-rendered.** Editing a view changes its hash, so sealing
would accept it. That is already true today and is covered by a different guard: `check` reports a
view whose output hash does not match the manifest as **tampered**, and `DEC-006` forbids hand
editing outright. This change does not weaken it.

**Sealing becomes order-dependent in one narrow sense**: render then seal. That is the intended
workflow and the only one that makes sense, but it is now load-bearing rather than incidental.

## Migration Plan

None. An existing manifest is read, and entries for hats that are skipped are carried forward
unchanged. A project that has never sealed is unaffected.

## Open Questions

None blocking.
