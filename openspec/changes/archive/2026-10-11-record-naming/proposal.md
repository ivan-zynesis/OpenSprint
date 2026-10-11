## Why

Milestone 5 of `sdlc-operating-contract`. `DEC-036` decided that decisions are named semantically and initiatives chronologically. Neither half was in the tooling: `/opsp:decide` still told an agent to read the directory and increment, and every workflow that read an initiative constructed `initiatives/<name>.md` directly.

The number is not a cosmetic problem. `DS-PARALLEL-EXEC` makes concurrent worktrees routine, and two of them allocating `DEC-045` independently is the normal case rather than the unlucky one — the collision surfaces at merge, after both records have been written and cited. A semantic id cannot collide by accident, because two authors deciding different things do not reach for the same phrase.

The other half had an ordering constraint that is now discharged: initiative filenames could not carry a date prefix while the readers resolved by filename. `initiative-parser` landed with `lifecycle-beyond-build` and resolves by frontmatter `id:` first, so the prefix is now safe.

## What Changes

- `/opsp:decide` coins a semantic id and is told, in those words, not to read the directory and increment
- `/opsp:propose` writes `DEC-SEMANTIC-NAME.md` and `initiatives/<YYYYMMDD>-<name>.md`
- `/opsp:backlog` states where the initiative file goes, which it previously left unsaid
- `/opsp:apply`, `/opsp:archive`, `/opsp:review` and `/opsp:reexplore` resolve an initiative by its frontmatter `id:` and are told the filename will not match
- `RoadmapRow` carries the mitigating initiative's filename stem, so the board's roadmap links survive the prefix
- All five existing initiative files are renamed to their `created:` date

## Capabilities

### Modified Capabilities
- `opsp-decision-records`: ids are coined, not allocated
- `opsp-initiative-artifact`: the filename carries the creation date and is not the identifier
- `opsp-board`: every initiative link is built from the filename stem

## Impact

- **`DEC-001`–`DEC-044` keep their numbers permanently.** Renaming them would break every citation in every record, view and test, to buy consistency in a namespace whose whole point is that it does not need to be consistent to be unique.
- **The prefix is presentation only.** Nothing resolves by it; a mistyped date is a cosmetic defect, not a broken reference. That is what makes renaming the five existing files a safe operation rather than a migration.
- **The board was the one place that still linked by id.** The initiatives table already used the stem; the roadmap's `mitigated-by` link did not, and would have 404'd on every dated file.
