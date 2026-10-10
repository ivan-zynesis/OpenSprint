## MODIFIED Requirements

### Requirement: Surrogate resolution escalates what it cannot answer
The workflow SHALL consult the surrogate before the operator, and SHALL treat what it cannot answer as a **hat handoff** rather than as an interruption.

#### Scenario: The surrogate can answer
- **WHEN** a driver-spec, an existing decision or the compiled architecture answers the ambiguity
- **THEN** it SHALL be resolved without involving the operator
- **AND** the resolution SHALL name the record it came from

#### Scenario: The surrogate cannot answer
- **WHEN** nothing in the surrogate answers a question in driver-spec scope
- **THEN** the workflow SHALL pause and escalate
- **AND** this SHALL be treated as the specification being incomplete, which is normal rather than a defect

## ADDED Requirements

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
