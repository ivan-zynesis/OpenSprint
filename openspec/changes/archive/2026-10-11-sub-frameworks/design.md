## Context

Two decisions, one milestone, because both answer "what shape does this cell take" and both are read by the same renderer.

`DEC-037` was motivated by the strategy altitude rule: a strategy states a position and cites the decisions implementing it, and never describes the mechanism. That rule is right and it leaves a reader knowing *what* was chosen and nothing about *what it cost* — which is the question a maintainer picking up the hat actually has.

`DEC-038` was motivated by `DS-CI-ATTESTATION`: evidence is pipeline output, and pipeline output can only answer a bar that was written answerably.

## Goals / Non-Goals

**Goals**
- One vocabulary, in code, that the skill and the harvest both read
- A bar in prose is reported, per hat, naming the form it owes
- A strategy cell's four parts each name a section of the ADR they come from

**Non-Goals**
- Compiling the SWOT cell in code. It is a condensation of an ADR's prose — the synthetic half of `DEC-014`, and the skill's job.
- Checking that a SWOT part is *correct*. `SWOT_SOURCES` says where to read it; whether the renderer read it faithfully is what `compact check` and a human reviewer are for.
- A form for `dev` or `devops`.

## Decisions

**The BDD form is additional to the spectrum, not a replacement.** This is the one reading that had to be settled. `DEC-019` and `DS-MEASURE-ANATOMY` give a bar `dimension / chosen / traded for / neighbour`; `DEC-038` says a bar takes a BDD form. Read as alternatives, implementing one would delete the other.

They are not alternatives. `DEC-038`'s question names the problem as **free prose** — "free prose satisfies neither" — and a spectrum is not free prose. The two answer different questions: the spectrum says *where on the axis this project sits and what that cost*, which is what makes a future trade arguable; the BDD says *what a pipeline can run to tell you it still sits there*. A bar with only the spectrum is unassessable. A bar with only the BDD is a test with no stated price.

So `bar-without-form` and `bar-without-neighbour` both fire on a bar that has one half and not the other, and a complete bar carries both.

**`parseBarForm` reports, it does not judge.** It returns which labels are stated. A bar carrying `given` and `then` but no `when` has started the thought and not finished it, which deserves a different sentence from prose that never began — and the caller, not the parser, decides that.

**Labels are matched at the start of a line.** Not found in a sentence. "the build fails when a credential is given to the repository" contains both words and states no form; matching inside prose would accept it and train people to write exactly that.

**`bar-without-form` is reported against one hat.** A record declaring `[maintainer, dev]` owes the maintainer form and owes `dev` nothing, so the loop carries only the hat whose form it is. Attributing it to both would put a finding in a view that cannot act on it.

## Risks / Trade-offs

**Rewriting four bars is real work and this change does not do it.** The loop names them; closing them is attestation's job, not a migration's. Rewriting them here would mean this session authoring maintainer bars it would then be the one to attest, which is the independence `DEC-043` exists to protect.

**`as a` is a short, common phrase.** Line-start matching makes a false positive need a line *beginning* "as a", which in a bar block is the form. The narrower alternative — requiring the label be bolded — would reject the plain form the skill's own example uses.
