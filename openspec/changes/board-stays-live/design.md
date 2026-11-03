## Context

Attestation requested a change (`opensprint/initiatives/20261018-kanban.md`, `## Attestation`).
Everything it names is either a workflow template that drives the CLI wrongly, a card write that
drops what the file holds, or a bar no test asserts. Nothing in the surrogate has to move:
`DEC-CARD-WRITES-THROUGH-CLI` already says every move goes through a validating command,
`DEC-HAT-HANDOFFS` already says a handoff names its hat, and `DEC-MILESTONE-BOARD` already says the
card mirrors the file.

## Decisions

**The archive hat is named by whoever archives.** `attested → completed` accepts all four hats, and
no record says which one archive wears. The template names the choice,
`--hat <product|maintainer|dev|devops>`, the same form the CLI's refusal uses, and asks the agent to
state the accountability it is closing under. Repropose does the same with `<product|maintainer>`.
Reexplore keeps its literal `--hat product`.

**Archive advances from the initiative's worktree, before cleanup.** `advance` resolves the
initiative from the current directory. The descriptor lives on `opsp/<initiative>`, so once that
worktree is gone there is nothing to resolve. Close, commit, then clean up.

**Propose creates at `exploring` and advances.** `checkTransition` treats a missing state as a
repair and would accept a descriptor with no `state:`, but a file created at `exploring` gives the
card a truthful history: imported at `exploring`, then `exploring → proposed` by `/opsp:propose`.

**`moveCard` mirrors milestones with `mirrorMilestones`**, the function `stageCard` already uses,
from the entry `advance` read. `advance` writes only `state:`, so the entry's milestones are the
file's. A move whose state is already on the card, but whose milestones differ, writes the mirror
with the history line `milestones follow the initiative`, the line `stageCard` writes for the same
case.

**The rule reads the table, not a list of workflows.** For each `TRANSITIONS` row, the template of
the workflow in `by` must hold `opensprint advance <initiative-name> --to <to>`; where the row is a
handoff it must pass `--hat`, and every hat it offers must be one the row accepts. Then the command
runs against a scratch initiative at `from`. A new row with no command in its workflow fails the
rule, which is the point: the existing rule only forbade the wrong thing.

**The page runs under a DOM stand-in, not a DOM library.** The page uses a small, fixed part of the
DOM (`getElementById`, `querySelectorAll('script.card')`, `createElement`, `append`,
`replaceChildren`, `addEventListener`, `classList`, `style.setProperty`). A stand-in of that surface
in `test/helpers/board-dom.ts` runs the page's own script with `node:vm`. Adding jsdom or happy-dom
would mean a new dev dependency, and installing with pnpm 9 rewrites the `6.0` lockfile. The
stand-in fails loudly on any DOM call it does not implement, so a page that grows past it fails the
test instead of passing it silently.

**"Only git and the shell" is a `PATH` with nothing else on it.** The test links `git`, `sh` and
the utilities the playbooks name (`awk`, `sed`, `base64`, `tr`, `date`, `dirname`, `basename`) into
one directory, runs each playbook with that directory as the whole `PATH`, and checks that `node`
does not resolve there.

## Risks / Trade-offs

- **The stand-in is not a browser.** It proves the script opens the overlay and places each ticket;
  it does not prove the CSS lays it out. That is the same altitude as the bar.
- **The two-checkout test fakes "different machines" with two clones.** Each is cloned with
  `--single-branch` on a different branch, so neither has the other's ref, which is what the bar
  says.
- **This repository's `.claude/` copies** of the changed workflows are regenerated here. Its other
  generated files stay as they are.
