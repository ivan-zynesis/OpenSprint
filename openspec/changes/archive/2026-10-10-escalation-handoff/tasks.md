## 1. The stage boundary

- [x] 1.1 The pause is announced, naming the milestone and the hat the answer requires
- [x] 1.2 The dev hat is explicitly set down
- [x] 1.3 Resuming is a distinct step that explicitly picks it back up

## 2. Classification in the question

- [x] 2.1 State the inferred hat and the reasoning behind the inference
- [x] 2.2 Present a draft record — id, type, role, objective, statement
- [x] 2.3 Draft a bar in BDD form where the record carries a measure
- [x] 2.4 State the blast radius: dependent decisions, scoped milestones
- [x] 2.5 Offer approve / correct the classification / answer differently
- [x] 2.6 Never ask a separate "which hat?" question

## 3. Approval and compilation

- [x] 3.1 Nothing in product or maintainer scope is written before approval
- [x] 3.2 On approval, that hat's view may be compiled and sealed scoped
- [x] 3.3 No other hat is compiled on that approval
- [x] 3.4 Declining writes nothing and compiles nothing

## 4. Verification

- [x] 4.1 Tests that the instructions carry the stage boundary, both directions
- [x] 4.2 Tests that classification is inferred and carried in the question
- [x] 4.3 Test that a draft record and blast radius are required
- [x] 4.4 Test that no separate classification prompt is instructed
- [x] 4.5 Test that approval precedes writing, and permits compiling only that hat
- [x] 4.6 `pnpm test` green apart from the known flaky zsh-installer file
- [x] 4.7 `pnpm exec tsc --noEmit` clean, `pnpm lint` clean

## 5. Notes

- [x] 5.1 Entirely a workflow change — no code. Inference reuses what exists (`DRIVER_SPEC_TYPE_TO_HAT`, `DEC-028`) and the judgement is the agent's, so enforcement is by instruction, as `DEC-043` already accepts for attestation.
- [x] 5.2 The old text's advice to reformulate at architect altitude is kept. What changed is that the reformulated question now carries its classification, a draft record and the blast radius, instead of being classified after the answer comes back.
