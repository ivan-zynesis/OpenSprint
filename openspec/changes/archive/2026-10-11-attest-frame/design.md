## Context

Two recorded decisions point in opposite directions here, and the change lives in the gap between them.

`DEC-030` makes the pull request the unit: rebase → attest → archive → merge, as one PR. A reviewer of a pull request who does not know its range is not reviewing a pull request.

`DEC-040` keeps the implementation source, the design discussion, the ADR rationales and the conversation out of the attester's context, because an agent holding the argument for a change adopts it.

Read carelessly, the second forbids the first.

## Goals / Non-Goals

**Goals**
- The attester knows its range without being told
- The operator sees the range and agrees to it before anything is judged
- A wrong base guess is visible, with the reason it was made

**Non-Goals**
- Reading the patch. Ever.
- Deciding anything from the frame. It scopes the review; it does not contribute to a verdict.
- Replacing the initiative argument. `/opsp:attest <name>` still narrows to one.

## Decisions

**The line is at the artifact, not the tool.** Subjects yes, bodies no. Stat yes, patch no.

`DEC-040`'s four exclusions are all *arguments that the change is right*. The test it actually applies is "can an attester talk themselves into a pass with this?" — not "did this come from git?". A commit subject (`feat(compact): maintainer gains seven inherited objectives`) and a stat (`14 files, +612 -88`) say what moved and how much. There is no argument in them to adopt.

A commit message *body* is different, and in this project emphatically so: the bodies above argue for their changes in paragraphs, naming alternatives and reasons. That is the conversation that built it. It stays out, and `--format=%h %s` is what enforces it — the body is never fetched, so it cannot leak.

**The base is resolved in three tiers and the tier is reported.** `--base`, then `refs/remotes/origin/HEAD`, then the explicit candidates `main`, `master`, `develop`, `trunk`.

`initiative-git.ts` already resolves a trunk and deliberately avoids `origin/HEAD`, on the grounds that it is absent in a fresh clone and misleading in a fork. Both objections are real and neither survives contact with *reporting the choice*. A fork whose `origin/HEAD` points at the upstream default produces a visibly wrong base, the operator says so, and `--base` fixes it. The alternative — never reading the one ref that says what a PR would target — gets the common case wrong silently to avoid getting the rare case wrong visibly.

`develop` and `trunk` join the candidate list because a team that uses one uses it for everything, and guessing `main` at such a team frames every review against a branch nobody merges to.

**The frame is confirmed, not announced.** The same shape as `DS-ESCALATION-HANDOFF`: infer, present, require an explicit answer. Here the inference is the entire scope of the review, which makes it the worst one to get silently wrong.

**`undefined` where git cannot answer.** No repository, no base, no common ancestor — the command says so and exits non-zero rather than presenting a frame it invented. The same convention as `readInitiativeGitState`.

**Initiative ids are read from frontmatter, not filenames.** `DEC-036` prefixes initiative filenames with a date, so the stem is not the id. A file deleted in the range is skipped: it cannot be read, and an initiative that no longer exists is not one being attested.

## Risks / Trade-offs

**A subject line can mislead.** `feat(auth): validate tokens` tells an attester that validation was intended, not that it works. If attesters start reasoning *from subjects* about whether a bar was met, the line is in the wrong place — that is written into the decision's invalidation trigger, and the fix is to drop to the stat alone.

**The guess will sometimes be wrong.** That is why it is shown and confirmed rather than used. The cost is one round trip per attestation.

**`origin/HEAD` is stale if the default branch was renamed and nobody ran `git remote set-head`.** It resolves to a ref that still exists, so nothing errors; the operator sees the wrong base named and corrects it. This is the failure the confirmation step exists for.
