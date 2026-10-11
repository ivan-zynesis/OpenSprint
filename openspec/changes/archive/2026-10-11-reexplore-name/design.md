## Context

A rename inside a change that was otherwise about behaviour. The behaviour was right; the rename was a reflex.

## Decisions

**The behaviour names the tool, not the altitude.** "Reideate" is accurate about *where* the tool sits — the goal rung, the ideation altitude. "Reexplore" is accurate about *what it does* — `/opsp:explore`, again. An operator reaching for a fallback is asking "what do I run", not "which rung am I on", so the behaviour is the better referent.

**`DEC-HAT-HANDOFFS` is not edited.** It decided the rename explicitly, and that decision changed. The rule the project applies to itself — supersede, never rewrite — means a new record carries the revert and the old one keeps every word. A reader who finds `DEC-HAT-HANDOFFS` saying "becomes `/opsp:reideate`" follows `superseded-by`-style reasoning through the decision map rather than finding a page that was quietly corrected.

**The capability is merged rather than left duplicated.** `hat-handoffs` added a requirement under a new capability name while the old capability still held four requirements describing what is now `/opsp:repropose`'s job. Nothing would have caught that: specs are not compiled, so `compact check` cannot see a capability that duplicates another. Removing them with reasons and migrations is the only record that the behaviour moved rather than vanished.

## Risks / Trade-offs

**Two renames in a day is churn**, and churn in a workflow name is worse than in an internal symbol because operators memorise it. The defence is that the second rename restores the long-standing name rather than introducing a third, so anyone who never saw `reideate` sees no change at all.
