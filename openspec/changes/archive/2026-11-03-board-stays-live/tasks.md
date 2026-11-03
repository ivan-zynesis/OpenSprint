## 1. Every workflow's own move reaches the card
- [x] 1.1 Archive: close with `--hat <product|maintainer|dev|devops>` from the initiative's worktree, commit, then clean up
- [x] 1.2 Repropose: `--hat <product|maintainer>`; supersede milestones as `- [~]`
- [x] 1.3 Reexplore: supersede milestones as `- [~]`, before it advances
- [x] 1.4 Propose: write the descriptor at `exploring`; the advance step sits after it, not in the guardrails
- [x] 1.5 `moveCard` mirrors the file's milestones onto the card
- [x] 1.6 Regenerate this repository's `.claude/` copies of the changed workflows

## 2. Tests
- [x] 2.1 Rule: for every `TRANSITIONS` row, the owning template holds the advance, with an accepted `--hat` on a handoff, and it moves an initiative at `from`
- [x] 2.2 Rule: no template writes a `state:` other than `exploring`
- [x] 2.3 Advance carries a repropose's milestones onto the card, and writes a mirror where only milestones differ
- [x] 2.4 `DS-LIVE-BOARD` primary: two single-branch clones on different branches render the same board; a move from either appears in the other's next render
- [x] 2.5 `DS-LIVE-BOARD` drill-down: clicking a card's title opens its milestones in the five columns, with continue on the next one
- [x] 2.6 `DS-RUNTIME-LESS-BOARD`: both playbooks run with only git and the shell's utilities on `PATH`

## 3. Documentation
- [x] 3.1 `docs/git-workflow.md`: the live board — what workflows run, what a person types
- [x] 3.2 `docs/known-limitations.md`: refresh by rendering, drift, no branch protection, removal leaves the branch
- [x] 3.3 `docs/workflows.md`: `kanban stage` in the reference; commands marked as what workflows run
