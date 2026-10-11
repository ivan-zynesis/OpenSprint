## Context

`DEC-024` and `DEC-030`, the halves that were specified and not built.

## Goals / Non-Goals

**Goals** — git as an optional third input; the archive sequence and gate stated.

**Non-Goals** — enforcing the gate in code. It is a recommendation for the adopter's CI, and `DEC-023` keeps attestation ungated.

## Decisions

### Git lives in its own module, and is optional

Parsing a record must never shell out. A surrogate is read in tests, in fixtures, in a tarball and
in CI containers that may not have git. So `initiative-git.ts` is separate, and
`checkInitiativeState` takes the state as an optional parameter: supply nothing, and the check
behaves exactly as before.

### `undefined` means unknowable

No repository, no trunk, no binary — the reader returns `undefined` rather than
`{ merged: false }`. Conflating "git cannot say" with "not merged" would report a dangling
initiative in every environment without git.

Once a branch is known to exist, a failing `merge-base --is-ancestor` *does* mean not merged, and is
reported as such.

### Only one contradiction is reported

A merged branch while the state is `exploring`, `proposed` or `building`. That is unambiguous: the
work landed and nothing closed the initiative.

The inverse — `attested` with an unmerged branch — is **not** reported, because that is the normal
state of an initiative waiting for its pull request to be approved. Reporting it would fire on every
correctly-run initiative.

### The trunk is found by explicit candidates

`main`, then `master`. Not by parsing `origin/HEAD`, which is absent in a fresh clone and misleading
in a fork.

## Risks / Trade-offs

**Shelling out costs a few milliseconds per initiative** on board regeneration. Acceptable: the
board is not a gate, and `compact check` — which is — does not call this.

**A squash or rebase merge may not register as an ancestor.** `--is-ancestor` is true for merge
commits and fast-forwards; a squashed branch will read as unmerged. That under-reports rather than
over-reports, which is the right direction for a check whose false positives would train people to
ignore it.

## Migration Plan

None. Every existing caller of `checkInitiativeState` passes one argument and is unaffected.

## Open Questions

Detecting a squash-merged branch is unsolved and recorded above.
