# OPSP Apply Workflow Specification

## Purpose

Orchestrate multiple opsx lifecycle cycles for each milestone in an initiative, using the operator surrogate to resolve questions autonomously.
## Requirements
### Requirement: Orchestrate multiple opsx cycles
The `/opsp:apply` skill SHALL read an initiative's milestone plan and execute a full opsx lifecycle (explore → propose → apply → archive) for each milestone sequentially, with git branch management, milestone pause checkpoints, and support for corrective opsx changes when the operator raises a change request.

#### Scenario: Loading initiative and surrogate
- **WHEN** the operator invokes `/opsp:apply <initiative-name>`
- **THEN** the agent SHALL read the initiative descriptor from `opensprint/initiatives/<name>.md`
- **AND** load the surrogate context: `squad/index.md`, the `dev` and `devops` views, and the driver-specs and ADRs the initiative lists, in full
- **AND** display the milestone plan and current progress
- **AND** create the initiative branch `opsp/<initiative-name>` (or resume existing one)
- **AND** ask the operator to select a review mode (per-milestone, per-change, or continuous)

#### Scenario: Executing an opsx cycle for a milestone
- **WHEN** processing a milestone from the initiative plan
- **THEN** the agent SHALL execute the opsx workflow inline:
  1. Think through the milestone (opsx explore level)
  2. Create an opsx change with proposal, specs, design, tasks (opsx propose level)
  3. Create a change branch `opsx/<initiative-name>/<change-name>` from the initiative branch
  4. Implement the tasks on the change branch (opsx apply level)
  5. Archive the completed change (opsx archive level)
  6. Merge the change branch into the initiative branch
- **AND** carry surrogate context into each opsx step

#### Scenario: Milestone completion with pause
- **WHEN** a milestone's opsx cycle completes and the review mode is per-milestone or per-change
- **THEN** the agent SHALL present a review checkpoint with milestone summary, branch info, and operator options including "Approve and continue" and "Raise change request"
- **AND** wait for operator input before proceeding to the next milestone

#### Scenario: Operator raises change request during apply
- **WHEN** the operator selects "Raise change request" at any checkpoint
- **THEN** the agent SHALL present sub-path options: "I know what needs to change" or "I need to explore this first"
- **AND** delegate to `/opsx:propose` (direct path) or `/opsx:explore` then optionally `/opsx:propose` (explore path)
- **AND** after any corrective opsx change is archived, reload the `dev` and `devops` views and read the records the correction touched
- **AND** return to the same checkpoint so the operator can approve, raise another change request, or take other actions

#### Scenario: Milestone completion in continuous mode
- **WHEN** a milestone's opsx cycle completes and the review mode is continuous
- **THEN** the agent SHALL log a brief milestone summary and proceed to the next milestone without pausing

### Requirement: Surrogate-based question resolution
The `/opsp:apply` skill SHALL attempt to resolve questions arising during opsx execution by consulting the operator surrogate (the per-hat views, then the records they cite) before escalating to the operator. What it cannot answer SHALL be treated as a **hat handoff** rather than as an interruption.

#### Scenario: Question auto-resolved by surrogate
- **WHEN** a question arises during opsx execution that can be answered by a view, or by a driver-spec or ADR a view cites
- **THEN** the agent SHALL resolve it without interrupting the operator
- **AND** SHALL note the resolution in the opsx change context

#### Scenario: Question escalated to operator
- **WHEN** a question arises that the surrogate cannot answer
- **THEN** the agent SHALL pause the opsx cycle
- **AND** SHALL treat the gap as the specification being incomplete, which is normal rather than a defect
- **AND** SHALL present the question at a higher level than the raw opsx question, carrying its own classification
- **AND** SHALL write the artifact only on explicit approval
- **AND** SHALL resume the opsx cycle as a distinct step

### Requirement: Sequential execution with context carry-forward
The `/opsp:apply` skill SHALL execute milestones sequentially, carrying lessons from completed cycles into subsequent ones.

#### Scenario: Context carry-forward between milestones
- **WHEN** one milestone's opsx cycle completes
- **THEN** the agent SHALL summarize what was learned and built
- **AND** update the initiative descriptor with the completed opsx change reference
- **AND** carry updated surrogate context (including any new ADRs or driver-specs) into the next milestone

#### Scenario: Context management for long initiatives
- **WHEN** processing milestones in a multi-milestone initiative
- **THEN** the agent SHALL summarize completed milestones to conserve context window
- **AND** retain the loaded views and the initiative's own driver-specs and ADRs across all milestones

### Requirement: Apply loads the views, then the records it acts on
The `/opsp:apply` skill SHALL orient on the compiled `dev` and `devops` views rather than loading every record, and SHALL open a full record only for the decision it is about to act on (`DS-SURROGATE-BUDGET`).

#### Scenario: Loading at the start of an initiative
- **WHEN** `/opsp:apply` loads the surrogate
- **THEN** it SHALL run `opensprint compact plan --hat dev --hat devops --json` from the initiative's worktree, whose branch holds records the trunk does not have yet
- **AND** read `opensprint/squad/index.md`, `opensprint/squad/dev.md` and `opensprint/squad/devops.md`
- **AND** read in full the driver-specs and ADRs the initiative lists
- **AND** SHALL NOT load every driver-spec and ADR, `architecture.md` or `DECISION-MAP.md`

#### Scenario: A question belonging to another hat
- **WHEN** a question belongs to `product` or `maintainer`
- **THEN** the agent SHALL check that hat's view before escalating
- **AND** SHALL ask `opensprint compact plan --hat <hat> --json` whether that view can be trusted, as for its own hats

#### Scenario: A view section is not fresh
- **WHEN** the plan reports an `open-loops` section, in any state
- **THEN** the agent SHALL answer it from the plan's own `openLoops`
- **WHEN** the plan reports any other section `stale`
- **THEN** the agent SHALL read the view and, in full, the records listed as added or modified and the observed files listed as added or modified
- **AND** in a `measures` section, whose observed files are tests, only those a measure cites as its evidence
- **WHEN** the plan reports a section `unsealed` or `tampered`
- **THEN** the agent SHALL read that section's inputs instead of the view
- **AND** a `tampered` section SHALL be reported to the operator

#### Scenario: Records with no hat
- **WHEN** the plan lists records as `unassigned`
- **AND** it lists at least one section other than `open-loops`, and every such section is `unsealed` with no inputs
- **THEN** the records predate hats, and the agent SHALL read every record, as before views existed
- **AND** SHALL NOT offer to compile, since compiling cannot place a record that declares no hat
- **WHEN** the plan lists records as `unassigned` and some sections have inputs
- **THEN** the agent SHALL read the unassigned records that bear on the initiative, since no view covers them

#### Scenario: No compact engine
- **WHEN** `opensprint compact` cannot run
- **THEN** the agent SHALL fall back to reading every driver-spec and ADR

#### Scenario: Re-reading after a boundary compile
- **WHEN** the `dev` and `devops` sections are recompiled at a milestone boundary
- **THEN** the agent SHALL re-read the sections it rendered before the next milestone

### Requirement: A milestone boundary compiles what the hat in the room owns
The workflow SHALL compile stale `dev` and `devops` view sections at each milestone boundary, after the change branch merges into the initiative branch.

#### Scenario: Compiling at the boundary
- **WHEN** a milestone's opsx cycle completes and its change branch has merged
- **THEN** the workflow SHALL run the plan, render the stale `dev` and `devops` sections, and seal those hats
- **AND** sealing SHALL be scoped to the hats rendered

#### Scenario: Nothing stale
- **WHEN** no `dev` or `devops` section is stale
- **THEN** nothing SHALL be rendered
- **AND** the workflow SHALL continue without comment

#### Scenario: Product and maintainer are never compiled silently
- **WHEN** `product` or `maintainer` sections are stale at a milestone boundary
- **THEN** the workflow SHALL NOT compile them as part of the boundary step

### Requirement: Stale product and maintainer views are offered
The workflow SHALL offer to compile stale `product` and `maintainer` views, naming the hat that compiling them requires.

#### Scenario: The offer
- **WHEN** a `product` or `maintainer` section is stale
- **THEN** the workflow SHALL report it and offer to compile it
- **AND** the offer SHALL state that compiling means putting on that hat

#### Scenario: Accepting is a context switch
- **WHEN** the offer is accepted
- **THEN** the agent SHALL set down the implementation context it is holding
- **AND** load the records for that hat
- **AND** compile, seal scoped to that hat, and return to the dev hat

#### Scenario: Declining
- **WHEN** the offer is declined
- **THEN** the view SHALL be left stale
- **AND** it SHALL remain reported by the plan and be compiled at archive

#### Scenario: The offer never gates
- **WHEN** the offer is declined or unanswered
- **THEN** the milestone SHALL still complete

### Requirement: An escalation renders as a stage boundary
The workflow SHALL present an escalation as a boundary between accountabilities, not as a prompt.

#### Scenario: The pause is announced
- **WHEN** the workflow escalates
- **THEN** it SHALL state that apply is paused, and at which milestone
- **AND** it SHALL state which hat the answer requires

#### Scenario: The hat is set down and picked back up
- **WHEN** an escalation begins
- **THEN** the workflow SHALL state that the dev hat is being set down
- **AND** on resuming it SHALL state that the dev hat is being picked back up
- **AND** resuming SHALL be a distinct step rather than the side effect of receiving a reply

### Requirement: The escalation carries its own classification
The workflow SHALL infer which hat a question belongs to and present that inference inside the question, rather than asking the operator to classify.

#### Scenario: The hat is inferred
- **WHEN** the workflow escalates
- **THEN** it SHALL state which hat it believes the question falls under, and why
- **AND** it SHALL NOT ask a separate question about classification

#### Scenario: A draft record is presented
- **WHEN** the workflow escalates
- **THEN** it SHALL present the record as it would be written, including its type, role and statement
- **AND** a bar SHALL be drafted in BDD form where the record is one that carries a measure

#### Scenario: The blast radius is stated before approval
- **WHEN** the workflow seeks approval
- **THEN** it SHALL state which existing decisions depend on what is being changed
- **AND** which milestones are scoped against it

#### Scenario: Correcting the inference
- **WHEN** the operator believes the classification is wrong
- **THEN** correcting it SHALL be an offered action
- **AND** confirmation of the classification SHALL otherwise happen by approving the record

### Requirement: Approval is explicit, and permits compiling that hat
The workflow SHALL change no product or maintainer record without explicit approval, and MAY compile that hat's view once approval is given.

#### Scenario: Approval before writing
- **WHEN** an escalation produces a record in product or maintainer scope
- **THEN** it SHALL NOT be written until the operator approves it

#### Scenario: Compiling after approval
- **WHEN** the operator has approved a record in a hat's scope
- **THEN** the workflow MAY compile that hat's view
- **AND** sealing SHALL be scoped to that hat
- **AND** no other hat SHALL be compiled on that approval

#### Scenario: Declining
- **WHEN** the operator declines or answers differently
- **THEN** nothing SHALL be written and nothing SHALL be compiled

### Requirement: An escalation bigger than one record routes to a rung
The system SHALL instruct an implementing agent that an escalation whose answer revises a decision or invalidates milestones is not resolved by writing a record, and SHALL have it route by which artifact must change.

#### Scenario: The option is offered
- **WHEN** an escalation is presented to the operator
- **THEN** an option SHALL exist for an answer that does not fit in one record

#### Scenario: Routing by what must move
- **WHEN** that option is taken
- **THEN** the instruction SHALL ask whether a driver-spec, a decision, or a milestone must change
- **AND** each answer SHALL name the workflow that handles it

#### Scenario: The agent does not choose the rung
- **WHEN** the three routes are presented
- **THEN** the instruction SHALL forbid guessing which one applies
- **AND** the reason SHALL be that the agent knows what blocked it and not whether the goal still holds

#### Scenario: Implementation stops either way
- **WHEN** any rung is taken
- **THEN** the instruction SHALL state that the current run does not simply continue
- **AND** it SHALL state which routes require the initiative to be opened again

