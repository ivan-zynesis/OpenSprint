---
name: "OPSP: Attest"
description: "Attest an initiative — posture, evidence and exposure against each bar"
category: Workflow
tags: [workflow, opsp, attest, initiative, evidence]
---

Review an initiative against the strategy it proposed, and record what you find.

**Input**: optionally an initiative name after `/opsp:attest`, to narrow the review to one. If
omitted, **the change frame decides the scope** — every initiative the branch touches is attested
together, which is what `DEC-030` means by one pull request.

This is the stage that asks whether the bar was met — and the handoff where a change leaves `dev` and becomes a security and operations concern.

---

## Before anything else: are you the author?

**Stop if this session wrote the implementation or its tests.**

Not "set it aside". Not "focus on the bar instead". Stop, say so, and ask for a fresh session. An
agent that wrote the tests cannot judge whether those tests assert the bar — it already believes
they do, which is why it wrote them that way (`DEC-043`).

Where a person is attesting by hand, the same holds: whoever wrote the tests should not be the one
grading them.

## What you load, and what you must not

```
LOAD                                 DO NOT LOAD
──────────────────────────────       ─────────────────────────────
the change frame                     the patch
the initiative's Objective + Goals   the implementation source
the bars (given / when / then)       commit message bodies
the TEST FILES                       the design discussion
the maintainer rows in scope         the ADR rationales
the CI evidence artifacts            the conversation that built it
```

**Why tests and not source.** A test is the implementation's own restatement of a bar — `DEC-038`
already writes bars as `given / when / then`, which is test syntax. Comparing a bar to its tests
compares two statements at the same altitude. Comparing a bar to source compares across altitudes,
and that asymmetry is how an attester talks themselves into a pass, because source always looks
reasonable to whoever is reading it.

**Why not the rationales.** An ADR argues *for the mechanism that was chosen*. Loading it shifts the
question from "was the bar met" to "was the mechanism reasonable" — a different question with a
different owner (`DEC-040`).

**Why the frame is not a widening.** Commit *subjects* and a file stat say what moved and how much.
They are not arguments that the change is right, so there is nothing in them to be talked into
(`DEC-ATTEST-CHANGE-FRAME`). A commit message *body* argues in paragraphs — that is the
conversation that built it, and it stays out. The line is drawn at the artifact: subjects yes,
bodies no; stat yes, patch no.

---

## Step 1: Establish what you are attesting, and have it confirmed

You are standing in a branch. **Do not ask the operator what the change is — git knows.**

```bash
opensprint frame
```

This resolves `source → base` and reports how the base was chosen: `--base` if given, otherwise the
remote's default branch, otherwise the first of `main`, `master`, `develop`, `trunk` that exists.
It prints the fork point, the commit subjects, a file-level stat, the initiative ids the range
touches and the changes it archived.

**Present it back, in your own words, and stop.** Two or three sentences: what branch against what,
how many commits, which initiatives are in scope, what the shape of the change is. Then ask:

> Is this the change you want attested, and is `<base>` the right base?

**Wait for an explicit answer.** Not an acknowledgement — a confirmation. The frame becomes the
premise of everything that follows, so it is the worst thing to get silently wrong. A guessed base
is usually right and is wrong exactly where it matters most: a fork, or a team that merges to
`develop`.

If the operator names a different base, re-run with `opensprint frame --base <ref>`.

If the range is empty, or git cannot answer, say so and stop. There is nothing to attest.

**The frame scopes the review.** Every initiative it names is in scope; an initiative the operator
expected and the frame does not show is a finding before you read a single bar.

## Step 2: Read the bars

```bash
openspec compact plan --json
```

For each driver-spec the initiative claims, read its `## Measures`. The **bar** states the
acceptance criterion. A record already showing `authority: attested` has been judged before —
re-attesting is legitimate, since attestations age, but say that is what you are doing.

## Step 3: Read the tests, then the evidence

Find the tests covering each bar. Ask one question of them:

> **Does this test actually assert the bar — or does it assert something adjacent that happens to pass?**

A green suite that never touches the bar satisfies a CI artifact completely and proves nothing. That
is the most common way a measure is met on paper and not in fact, and it is the specific thing you
are here to catch.

Then the CI artifacts. **Evidence is a CI artifact** (`DS-CI-ATTESTATION`): a coverage report, a
recorded end-to-end run, a `terraform plan`, a cost diff, a scan result. Something the pipeline
produced, addressable from the pull request. Prose describing a belief is not evidence.

**If the tests do not assert the bar, that is the finding.** Do not open the source to work out
whether the bar holds anyway — that is the move this tool exists to prevent.

## Step 4: Record the verdict, and what it requires

```markdown
### Posture

- **verdict**: met | partially met | not met | cannot assess
- **attested-by**: <who>
- **attested-on**: <YYYY-MM-DD>

<what the evidence showed>
```

**The verdict decides what else you owe** (`DEC-041`):

| Verdict | Write |
|---|---|
| `met` | `### Evidence` — the artifact, addressable |
| `partially met` · `not met` · `cannot assess` | `### Exposure` — what remains at risk, and `mitigated-by` |

A record counts as **attested** only when it carries both an attestation date and evidence — a
verdict with nothing asserting it is an opinion, and the harvest keeps reporting until both are
there.

**Write the reference in one of two forms**, because the harvest reads them and nothing else:

- a markdown link — `[coverage report](https://ci.example.com/runs/4821/coverage)`
- a backticked repository-relative path — `reports/2026-10-11-terraform-plan.txt`

A sentence saying the pipeline passed carries no reference, and `evidence-unresolvable` will say so
on every compile until one is written. A backticked path that is not in the tree is reported the
same way. A link with a scheme is taken on trust — the compiler does not go to the network, so a
remote artifact is only as good as the person who cited it.

`cannot assess` is a **complete attestation**, not a failure to finish. Name what the evidence could
not answer, record the exposure, and stop looking.

## Step 5: Answer the three review questions

These describe the **change**, not any one measure, so they go in an `## Attestation` section on the
initiative (`DEC-042`). Grill the operator until each is answered.

```markdown
## Attestation

- **door**: two-way — the feature flag reverts without data migration
- **blast-radius**: checkout path, payment reconciliation, the nightly settlement job

### RACI

| Concern | Handled by | R | A | C | I |
|---|---|---|---|---|---|
| settlement alerting | system — pagerduty svc-settle | — | — | — | — |
| manual reconciliation | **not automated** | ops-oncall | head-of-eng | finance | support |
```

**1 · One-way or two-way door.** Can this be rolled back without irreversible damage? A two-way door
says what makes the rollback safe. A one-way door is not a problem — it is a thing everyone should
know before merging.

**2 · Blast radius.** What does this affect? Ask hardest where an exposure is being accepted: an
unmitigated risk in something nothing else touches is a different proposition from one in the
payment path.

**3 · RACI, for whatever no system handles.** The pull request closing ends `dev`'s accountability.
Past that point the change lives in security and operations.

Go concern by concern. For each, ask first: **is this handled by a system?** If monitoring, alerting
or automation covers it, name the system and move on — no human names needed. **RACI is the residue
after automation**, and the table should shrink as a team automates more.

Where nothing handles it, a human is named: **R**esponsible does the work, **A**ccountable answers
for it. Consulted and Informed are optional.

Do not accept "the team" or "ops" as an answer. A concern owned by everyone is owned by nobody, and
the first incident is when that gets discovered.

## Step 6: Review the documentation

The surrogate under `opensprint/` is the **operating** record — detailed, cited, read by agents and
by whoever is doing the work. It is not what an external stakeholder needs, and compiling cannot
produce that: a shorter account, free of record ids, for a reader who will never follow a citation.

Attestation is where that account gets written, because the questions you have just answered *are*
the material it is made of (`DS-DOCUMENTATION-REVIEWED`).

**Ask what already exists, and judge it against what shipped.** Not who wrote it — documentation is
not owned by `product` or `maintainer` by virtue of being documentation. The question is whether it
is adequate and complete for the change now in front of you:

- does anything describe what this initiative actually changed, in terms an outsider would follow?
- is anything published now **wrong** because of it?
- does an accepted exposure need saying out loud to someone who does not read driver-specs?
- is there a runbook implication from the RACI table that nobody outside this repository knows?

**Then urge the operator to write it.** Produce the account in context, say where it belongs, and
write only on confirmation. The operator decides what an external reader should be told; you make
sure the question was asked and the answer landed somewhere durable rather than in a conversation
nobody reopens.

```bash
openspec config          # the configured documentation directory, docs/ by default
```

**Write there and nowhere else.** The documentation directory is attest's one free write target
(`DEC-044`) — prose for people, so it needs none of the protections a record does. If the operator
names a different directory serving the same purpose, use theirs.

Where the documentation is thin and the operator declines to improve it now, record that as a
finding rather than silently accepting it.

## Step 6b: Close the attestation

Every bar carries a posture, and the three change questions are answered:

```bash
opensprint advance <initiative-name> --to attested
```

The command refuses the move from anywhere but `ready-for-attestation`, which is the point — an
initiative still declaring `building` was never handed over, and attesting it means you attested
work nobody said was finished (`DEC-STATE-MACHINE`).

**`attested` does not mean every bar was met.** A bar recorded as `not met`, with an exposure and
a `mitigated-by`, is a complete attestation (`DEC-041`). The state records that judgement
*happened*, never that it was favourable — grading the answer is certification, and
`DS-SURROGATE-SCOPE` puts that out of scope.

### When you are not closing it

A verdict of `not met` does **not** by itself stop the close — a bar missed, with an exposure and
a `mitigated-by`, is a finished judgement. What stops the close is finding that the change should
not go forward as it is. Three exits, by what has to move (`DEC-ESCALATION-LADDER`):

| What you found | Exit | Lands at |
|---|---|---|
| The plan and the strategy hold; **the work does not** — something is missing or wrong, and building it is all that is needed | **request a change** | `building` |
| The goal holds; **what was decided about reaching it does not** — this is not what we meant | `/opsp:repropose` | `proposed` |
| The goal and the strategy hold; **the milestones do not** — a corrective task is needed | `/opsp:reexplore` | `building` |

**Request a change** when you can name the work:

```bash
opensprint advance <initiative-name> --to building
```

Say what is missing, in the initiative, so the next `/opsp:apply` reads it rather than asking you
again. A change request is **not** a repropose: nothing is superseded, no ADR moves, and the plan
is the plan. You are saying the plan was not finished.

**Repropose** when the thing in front of you serves the goal badly and the goal is still right.
That is the hardest one to say out loud, because the work is done and it is not what was wanted —
and it is also the one the whole lifecycle exists to catch, which is why attestation sits before
the merge rather than after it.

**Do not advance to `attested` and then reopen.** The command will refuse it, and the refusal is
the point: `attested` means judgement finished, and a judgement that immediately sends the work
back was not finished.

## Step 6c: Verify you stayed in bounds

```bash
git diff --unified=0 -- opensprint/driver-specs/ opensprint/initiatives/
```

Every hunk outside the documentation directory must fall inside a `## Measures` or
`## Attestation` section. If you changed a Statement,
a Decision, a Rationale or any frontmatter, **revert it**. Revising a claim is a new decision —
`/opsp:decide` — not an amendment. The bound (`DEC-027`) is what keeps `DEC-006`'s guarantee meaningful:
a record's claim never changes under a reader who cited it.

---

## What this tool must never do

**It never gates** (`DEC-023`). It always exits zero. It does not block `/opsp:archive`, a merge or
a release, and it does not mark anything approved. An unmet bar is an exposure with a forward
pointer; an unanswered question is an open loop.

Recording who holds a risk is change management's **recording** half, which `DS-SURROGATE-SCOPE`
admits deliberately. Deciding whether the risk is acceptable is its **governing** half, which stays
out — along with certification and release management. The moment this tool gains a pass/fail exit,
that boundary is gone.

**It never invents.** If a bar is not stated, say so rather than inferring one from the tests. If
nobody can be named as attester or as accountable, ask; an attestation with no attester is an
anonymous opinion, and a RACI row with no owner is a gap wearing a plan's clothes.

---

## When you are done

```bash
openspec compact plan --json   # records should now report authority: attested
openspec compact loops         # measure-unattested should have moved
```

Report how many bars were met, how many could not be assessed, every exposure with the work planned
against it, every concern that is **not** handled by a system, and what you changed or left wanting
in the documentation. Then hand to `/opsp:archive`,
which compiles the documentation and cannot honestly run before this does (`DS-ATTESTED-TRUTH`).

