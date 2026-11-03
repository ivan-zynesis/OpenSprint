# Known limitations

What the current release does not do yet, stated plainly so that nobody discovers it in an
incident. Each item was found while reviewing the work that shipped it, and each is open.

## Nothing stops an unattested merge

OpenSprint records whether a bar was met; it never blocks. `opensprint compact check` fails when
the compiled views drift from their records, but it does not check that an initiative was attested,
and the state check only notices a contradiction *after* a branch has merged.

Until a check exists, keeping an unattested branch out of `main` is the reviewer's job. The
[Git workflow](git-workflow.md) page describes the pipeline we recommend.

## Reaching `attested` does not require an attestation

`opensprint advance --to attested` checks only the state an initiative is moving from. It does not
look for a recorded judgement on each bar, or for the answers to the review questions. If you gate a
merge on that state, as the [Git workflow](git-workflow.md) page suggests, check the initiative's
Attestation section by hand.

## Evidence is checked for existence, not provenance

An attestation cites its evidence as a link or as a path in the repository. A local path that does
not exist is reported. Three cases are not:

- a link with a scheme (`https://…`) is taken on trust — the compiler never goes to the network;
- a path that leaves the repository (`../…`) is skipped silently rather than reported;
- any file that exists counts, whether or not a pipeline produced it.

Evidence is only as good as whoever cited it.

## Attestation scope depends on the agent following instructions

`/opsp:attest` is told to read the bars, the tests and the CI output, and never the implementation.
`opensprint frame` honours that — it prints commit subjects and a file stat, never a patch or a
commit message body. Nothing detects an attester that opens the source anyway.

Attest from a fresh session, or have a different person do it, from whoever wrote the tests.

## Workflow behaviour is verified as instructions, not as behaviour

The agent workflows — escalation during `/opsp:apply`, attestation, triage — are tested by checking
that their instructions say the right thing. Whether an agent follows them is observed in use, not
asserted by the test suite.

## The live board

The [live board](git-workflow.md#the-live-board) on `origin/kanban` has four limits worth knowing:

- **It is as current as your last render.** Rendering fetches the board, so it needs your remote
  to be reachable, and the page never refreshes itself.
- **A card can drift from its initiative.** Editing an initiative's state by hand, or a move made
  while the remote was unreachable, leaves the card behind. Every move reports a drifted card;
  nothing corrects it automatically. `opensprint kanban seed` lists the drift, and
  `opensprint kanban seed --resync` rewrites the cards from their initiatives.
- **Anyone who can push to your remote can rewrite `origin/kanban`.** OpenSprint does not protect
  the branch. If that matters to you, protect it on your Git host — and keep pushes allowed for the
  people who run the workflows, since every move is a push.
- **Removing OpenSprint leaves the branch behind.** Delete `origin/kanban` by hand, along with the
  generated `opensprint-kanban` skill in each tool's directory.

## Upgrading

Merging does not publish; releases are cut by hand. After a release, run `opensprint update` in
each project to regenerate its skills and commands.

A project that records decisions with descriptive ids (`DEC-SOMETHING-NAMED`) under this release
may not read them back after downgrading to 0.0.9 or earlier.
