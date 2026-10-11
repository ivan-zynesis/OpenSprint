---
name: "OPSP: Archive"
description: Archive an initiative — compile architecture.md from current architectural state
category: Workflow
tags: [workflow, opsp, archive, initiative, architecture]
---

Archive a completed initiative by compiling the current architectural state into `opensprint/architecture.md`.

**Input**: Specify the initiative name after `/opsp:archive` (e.g., `/opsp:archive migrate-to-serverless`). If omitted, list active initiatives.

---

## Steps

### 1. Verify Initiative Completion

Read the initiative — resolve it by the `id:` in frontmatter, since filenames carry a
creation-date prefix (`20261011-<name>.md`) — and check:
- Are all milestones marked as done?
- If not, warn the operator and ask for confirmation to proceed

### 2. Compile the Surrogate

Do not synthesise `architecture.md` here. Invoke the compact workflow (`/opsp:compact`) and let it compile.

One engine compiles every derived artifact (DEC-014). Archive writing its own version of architecture.md, with its own section list and its own synthesis rules, is how two documents that claim to describe the same system come to disagree.

Compact produces:
- `opensprint/architecture.md` — the architectural state
- `opensprint/squad/*.md` — the per-hat views
- `opensprint/squad/.manifest.json` — the provenance record

Then confirm the compile is sound:

```bash
opensprint compact check
```

## The merge sequence

Archiving is not the last step — it is the third of four, and the order is forced
(`DEC-030`):

```
  opsp/<initiative>  ──rebase──●──attest──●──archive──●──▶ main
```

**Rebase onto the trunk first.** Archive compiles from whatever records it can see. Compile before
rebasing and you compile against a record set that excludes whatever else landed meanwhile — the
artifact is wrong the instant it merges, and `compact check` would be right to fail it.

**Attest before archiving.** Nothing can be documented that has not been attested
(`DS-ATTESTED-TRUTH`), and archive is what compiles the documentation. If `/opsp:attest` has not
run, stop and say so rather than compiling claims nobody has checked.

**Then archive, then merge** — as one pull request. A second pull request carrying only attestation
adds history noise and is, in practice, the one that never happens.

### The PR gate

A pull request merging `opsp/*` into the trunk should be gated on **state consistency**:

```bash
opensprint compact check      # views agree with their records
opensprint compact board      # the Problems section must be empty
```

The initiative's state must be `attested`, and its `## Attestation` section must answer
reversibility, blast radius and RACI.

**This gates on whether you answered, never on what you answered.** A bar recorded as *not met*,
with an exposure and a plan, passes. Insisting a question be answered is a consistency check;
grading the answer is certification, which `DS-SURROGATE-SCOPE` places out of scope.

If `check` reports anything not fresh, resolve it before continuing — an archive that ships a stale view records an architectural state that was never true.

### 3. Clean Up Worktrees

Remove any remaining worktrees created during the initiative. Change worktrees are normally pruned at merge, but any still present (e.g., from an interrupted run) should be cleaned up now.

```bash
git worktree list
```

For each opsp or opsx worktree listed that belongs to this initiative:
```bash
git worktree remove <path>
```

Then prune stale references:
```bash
git worktree prune
```

If any worktree contains uncommitted changes, pause and present them to the operator before removing. Do NOT silently discard uncommitted work.

After cleanup, remove the initiative worktree itself (it is no longer needed once the initiative branch is merged to main or otherwise resolved):
```bash
git worktree remove ../<repo>-opsp-<initiative-name>
```

### 4. Close the Initiative

```bash
opensprint advance <initiative-name> --to completed
```

This refuses anything but `attested` → `completed` (`DEC-STATE-MACHINE`), which is what makes
the compile above load-bearing rather than advisory: an initiative cannot reach `completed`
without having passed through attestation, and attestation cannot be reached without the handoff.
**Every squad hat is therefore guaranteed compiled and sealed at exactly one point in the
lifecycle — here.** That is the only place in the process where that is true.

Then finish the descriptor by hand:
- Set `status: completed`
- Add `completed: <YYYY-MM-DD>` to frontmatter
- Ensure all opsx change references are listed

`status` and `state` are different fields and both are kept: `status` is whether the record is
live, which every record type has; `state` is where it sits in the lifecycle, which only an
initiative has.

### 5. Display Summary

```
## Archive Complete

**Initiative:** migrate-to-serverless
**Status:** Completed
**Driver Specs:** 3 active
**ADRs:** 5 active
**OPSX Changes:** 3 completed
**architecture.md:** Updated ✓

The architectural state of the solution has been compiled.
Review opensprint/architecture.md for the complete picture.
```

---

## Key Principles

- **Delegate the compile** — architecture.md and the hat views are produced by `/opsp:compact`, never synthesised here (DEC-014)
- **Rewrite completely** — compact rewrites with current state rather than appending. The decision records are the version history.
- **Link to sources** — Reference driver-spec and ADR IDs so readers can drill into details
- **Readable by humans** — This is the document you'd hand to a new team member to understand the system
- **Readable by agents** — This is also what the surrogate reads to answer future questions

---

## Guardrails

- **Verify milestones** — Warn if initiative has incomplete milestones
- **Don't compile by hand** — if architecture.md needs regenerating, run compact; never edit it directly
- **Use path.join()** — Construct all file paths cross-platform
- **Preserve ADRs** — Never modify or delete ADRs during archive. They are the permanent trail.
- **Check for uncommitted work** — Before removing any worktree, verify it has no uncommitted changes. Pause if it does.
- **Prune after remove** — Run `git worktree prune` after removing worktrees to clean any stale git references.

