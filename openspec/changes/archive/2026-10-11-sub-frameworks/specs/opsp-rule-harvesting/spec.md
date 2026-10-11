## MODIFIED Requirements

### Requirement: Open loop derivation
The system SHALL derive open loops from the index and the decision graph, and SHALL NOT infer them from record content — **except for the measure anatomy, which is content by definition** and is read from the record's `## Measures` section.

#### Scenario: The loop kinds
- **WHEN** the system enumerates the kinds of open loop it can report
- **THEN** the list SHALL be exactly: `constraint-unanswered`, `constraint-unasserted`, `decision-unguarded`, `rule-guards-dead-record`, `decision-on-superseded`, `record-unclassified`, `constraint-unmeasurable`, `measure-unasserted`, `measure-unexposed`, `bar-without-neighbour`, `record-without-objective`, `strategy-unimplemented`, `exposure-unmitigated`, `measure-unattested`, `evidence-unresolvable`, `bar-without-form`, `reversibility-unstated`, `blast-radius-unstated`, `raci-unassigned`

#### Scenario: A constraint no decision answers
- **WHEN** an active driver-spec has no active decision whose `depends-on` includes it
- **THEN** the system SHALL report a `constraint-unanswered` loop against that driver-spec's hats

#### Scenario: A constraint whose decisions are unguarded
- **WHEN** an active driver-spec is answered by at least one active decision
- **AND** no rule cites any of those decisions
- **THEN** the system SHALL report a `constraint-unasserted` loop against that driver-spec's hats

#### Scenario: Constraint coverage is transitive
- **WHEN** a driver-spec is not cited by any rule directly
- **AND** a decision depending on it is cited by a rule
- **THEN** the driver-spec SHALL NOT be reported as unasserted

#### Scenario: A decision no rule cites
- **WHEN** an active decision is cited by no rule file
- **THEN** the system SHALL report a `decision-unguarded` loop against that decision's hats

#### Scenario: A rule guarding a dead record
- **WHEN** a rule file cites a record whose status is `superseded` or `deprecated`
- **THEN** the system SHALL report a `rule-guards-dead-record` loop naming both the rule file and the record

#### Scenario: A decision resting on a superseded ancestor
- **WHEN** an active decision's `depends-on` includes a record whose status is `superseded` or `deprecated`
- **THEN** the system SHALL report a `decision-on-superseded` loop
- **AND** the report SHALL direct the reader to `/opsp:rebuild-assess`

#### Scenario: Loops are routed to the accountable hat
- **WHEN** any open loop is reported
- **THEN** it SHALL be attributed to every hat the subject record declares
- **AND** a loop against an unassigned record SHALL be reported without a hat

#### Scenario: Evidence that cites nothing addressable
- **WHEN** a record carries an `### Evidence` block
- **AND** that block contains neither a markdown link nor a backticked path
- **THEN** the system SHALL report an `evidence-unresolvable` loop against that record's hats
- **AND** the detail SHALL name both accepted forms

#### Scenario: Evidence citing a repository path that does not exist
- **WHEN** an evidence block cites a repository-relative path
- **AND** that path is not in the tree
- **THEN** the system SHALL report `evidence-unresolvable` naming the path

#### Scenario: A remote reference is never fetched
- **WHEN** an evidence reference carries a URL scheme
- **THEN** the system SHALL accept it without resolving it
- **AND** no network request SHALL be made during a compile

#### Scenario: A path the check will not look at
- **WHEN** an evidence reference is absolute, or resolves outside the project root
- **THEN** the system SHALL NOT report it as unresolvable
- **AND** the reason SHALL be that a check with nothing to say must not invent a gap

#### Scenario: A bar written in prose
- **WHEN** a record carries a populated `### Bar` block
- **AND** the record declares a hat whose bars take a form
- **AND** the block states none of that form's labels
- **THEN** the system SHALL report a `bar-without-form` loop naming the form the hat owes

#### Scenario: A form started and not finished
- **WHEN** a bar block states some but not all of its hat's labels
- **THEN** the system SHALL report `bar-without-form` naming the labels that are missing

#### Scenario: A hat that commits to no bar
- **WHEN** a record's hat declares no bar form
- **THEN** `bar-without-form` SHALL NOT be reported for that hat

#### Scenario: The loop is routed to the hat whose form it is
- **WHEN** a record declares several hats and only one of them declares a form
- **THEN** the loop SHALL carry only that hat
- **AND** the reason SHALL be that a finding must land in a view that can act on it

#### Scenario: No bar was written at all
- **WHEN** a record states measures with no `### Bar` block
- **THEN** `bar-without-form` SHALL NOT be reported
- **AND** the absent bar SHALL be left to the loops that already report it
