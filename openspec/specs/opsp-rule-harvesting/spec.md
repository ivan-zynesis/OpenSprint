# opsp-rule-harvesting Specification

## Purpose

Define how the link between a decision and the rule guarding it is discovered, and how the gaps in that chain are derived.

The link is harvested from code rather than declared in records, because that is where it already exists: rules name the records they guard far more often than records name their rules. Reading what is there costs nothing to author.

Every gap reported here is a graph or index query. Nothing reads a record's prose and nothing guesses, which is what keeps an invented gap out of a backlog someone has to triage.

A citation is evidence of intent, not proof of coverage. That a rule names a decision does not establish that it asserts the decision's substance.
## Requirements
### Requirement: Rule files are located by configured globs
The system SHALL locate rule files using a configurable glob list, with an explicit default covering the naming conventions projects actually use.

#### Scenario: Default rule globs
- **WHEN** no project configuration declares rule globs
- **THEN** the system SHALL match files whose names contain, by explicit list: `.test.`, `.spec.`, `.i9n.`, `.unit.`, `.e2e.`
- **AND** SHALL also match files named `*_test.*`

#### Scenario: Project declares its own rule globs
- **WHEN** `openspec/config.yaml` contains a non-empty `ruleGlobs` array of strings
- **THEN** the system SHALL use exactly those globs
- **AND** SHALL NOT merge them with the default list

#### Scenario: Malformed rule globs
- **WHEN** the `ruleGlobs` key is present but is not a non-empty array of non-empty strings
- **THEN** the system SHALL fall back to the default list
- **AND** SHALL surface a warning naming the `ruleGlobs` key
- **AND** SHALL NOT fail the command

#### Scenario: A project whose only suffix is uncommon
- **WHEN** a project's rule files all use a single suffix such as `.unit.ts`
- **THEN** the default globs SHALL still match them
- **AND** the system SHALL NOT report every decision as unguarded merely because one common suffix is absent

### Requirement: The surrogate is excluded from the scan
The system SHALL NOT treat the surrogate or its change artifacts as rule files.

#### Scenario: Excluded directories
- **WHEN** the system scans for rule files
- **THEN** it SHALL exclude `opensprint/` and `openspec/`
- **AND** SHALL exclude `node_modules/`, `dist/`, `build/` and `.git/`

#### Scenario: A record does not guard itself
- **WHEN** a decision record names its own id and its `depends-on` ancestors
- **THEN** none of those occurrences SHALL be counted as a citation
- **AND** the decision SHALL NOT be reported as guarded on that basis

### Requirement: Citation extraction
The system SHALL treat any occurrence of a record id within a rule file as a citation of that record, without requiring a structured annotation.

#### Scenario: Extracting citations
- **WHEN** a rule file contains a record id
- **THEN** the system SHALL record a link from that record to that file
- **AND** SHALL match ids in comments, test names and string literals alike

#### Scenario: Ids that resolve to no record
- **WHEN** a rule file cites an identifier matching the record id shape but no such record exists
- **THEN** the system SHALL NOT create a link
- **AND** SHALL report the unresolved citation separately

#### Scenario: A rule citing several records
- **WHEN** a rule file cites more than one record
- **THEN** the system SHALL record a link for each

### Requirement: Record to rule index
The system SHALL build an index from each record to the rule files citing it.

#### Scenario: Index contents
- **WHEN** the index is built
- **THEN** each active record SHALL map to the list of rule files citing it, which MAY be empty
- **AND** rule file paths SHALL be recorded relative to the project root

### Requirement: Open loop derivation
The system SHALL derive open loops from the index and the decision graph, and SHALL NOT infer them from record content — **except for the measure anatomy, which is content by definition** and is read from the record's `## Measures` section.

#### Scenario: The loop kinds
- **WHEN** the system enumerates the kinds of open loop it can report
- **THEN** the list SHALL be exactly: `constraint-unanswered`, `constraint-unasserted`, `decision-unguarded`, `rule-guards-dead-record`, `decision-on-superseded`, `record-unclassified`, `constraint-unmeasurable`, `measure-unasserted`, `measure-unexposed`, `bar-without-neighbour`, `record-without-objective`, `strategy-unimplemented`, `exposure-unmitigated`, `measure-unattested`

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

### Requirement: Open loops are reported, never gated
The system SHALL report open loops without failing any verification command on their account.

#### Scenario: Check ignores open loops
- **WHEN** `opensprint compact check` runs and open loops exist
- **AND** every view section is fresh
- **THEN** `check` SHALL exit zero

#### Scenario: Plan reports open loops
- **WHEN** `opensprint compact plan` runs
- **THEN** it SHALL report the open loops per hat
- **AND** `--json` SHALL carry them for the renderer

#### Scenario: A dedicated reading surface
- **WHEN** `opensprint compact loops` runs
- **THEN** it SHALL report the open loops grouped by hat
- **AND** SHALL support `--json`
- **AND** SHALL exit zero whether or not loops exist

### Requirement: A citation is evidence of intent, not proof of coverage
The system SHALL NOT claim that a cited record is correctly asserted.

#### Scenario: Reporting a guarded decision
- **WHEN** a decision is cited by at least one rule
- **THEN** the system SHALL report it as cited rather than as verified
- **AND** SHALL NOT assert that the citing rule tests the decision's substance

### Requirement: Unclassified records are reported as an open loop
The system SHALL report a **driver-spec** that carries no role, where the record belongs to a hat that declares roles. Decisions SHALL be exempt from role classification.

#### Scenario: A driver-spec with no role in a hat that declares roles
- **WHEN** an active driver-spec belongs to a hat declaring roles
- **AND** the driver-spec declares no role
- **THEN** the system SHALL report a `record-unclassified` loop against that record's hats

#### Scenario: A decision is never unclassified
- **WHEN** an active decision declares no role
- **THEN** the system SHALL NOT report `record-unclassified` for it
- **AND** this SHALL hold whichever hats it declares, including a hat that declares roles
- **AND** the reason SHALL be that role classification is a driver-spec concept: `dev` and `devops` run no framework to classify against

#### Scenario: A hat that declares no roles
- **WHEN** a record belongs only to hats declaring no roles
- **THEN** the system SHALL NOT report `record-unclassified` for it
- **AND** a project not using roles SHALL NOT see its whole surrogate reported as a backlog

#### Scenario: A classified record
- **WHEN** a driver-spec declares at least one role its hat accepts
- **THEN** no `record-unclassified` loop SHALL be reported for it

### Requirement: A target with no measure is reported
The system SHALL report a record that states a target without a way to tell whether it is met, because a constraint nothing can check is a constraint written badly.

#### Scenario: A goal with no measures
- **WHEN** any of an active record's roles is among the measurable roles
- **AND** its body contains no `## Measures` section
- **THEN** the system SHALL report a `constraint-unmeasurable` loop against that record's hats
- **AND** SHALL report it once for that record, not once per measurable role

#### Scenario: Measurable roles
- **WHEN** the system decides whether a record should carry measures
- **THEN** it SHALL use an explicit list: `goal` and `bar`
- **AND** SHALL NOT demand measures of an `objective`, which is qualitative by definition
- **AND** SHALL NOT demand measures of a `strategy`, which is an approach rather than a target

#### Scenario: A goal with measures
- **WHEN** a record with a measurable role contains a `## Measures` section with content
- **THEN** no `constraint-unmeasurable` loop SHALL be reported for it

#### Scenario: An empty measures section
- **WHEN** a record contains a `## Measures` heading with no content beneath it
- **THEN** the record SHALL still be reported as unmeasurable
- **AND** a heading alone SHALL NOT satisfy the requirement

### Requirement: A record its hat cannot select is reported
The system SHALL report a record that declares no `objective` where every section of one of its hats that could otherwise take it filters on one, because such a record is invisible in that view rather than merely unclassified.

#### Scenario: Every section filters on objective
- **WHEN** an active record declares no `objective`
- **AND** every section of one of its hats either filters on `objective` or accepts none of the record's roles
- **THEN** the system SHALL report a `record-without-objective` loop naming that hat

#### Scenario: An unfiltered section can take it
- **WHEN** a hat has a section that filters on no objective
- **AND** that section's roles accept the record
- **THEN** `record-without-objective` SHALL NOT be reported for that hat

#### Scenario: The record declares an objective
- **WHEN** a record declares an `objective`
- **THEN** `record-without-objective` SHALL NOT be reported for it

#### Scenario: No sections supplied
- **WHEN** the caller supplies no sections for a hat
- **THEN** `record-without-objective` SHALL NOT be reported for that hat
- **AND** a caller unaware of sections SHALL see no new loops

### Requirement: A strategy nobody implemented is reported
The system SHALL report an active driver-spec whose roles include `strategy` when no active decision descends from it, because a stated approach with nothing building it is intent rather than work.

#### Scenario: A strategy with no descending decision
- **WHEN** an active driver-spec declares `strategy` among its roles
- **AND** no active decision has that driver-spec among its transitive `depends-on` ancestors
- **THEN** the system SHALL report a `strategy-unimplemented` loop against that driver-spec's hats

#### Scenario: A strategy implemented directly
- **WHEN** an active decision names the strategy in its `depends-on`
- **THEN** `strategy-unimplemented` SHALL NOT be reported for it

#### Scenario: A strategy implemented transitively
- **WHEN** an active decision reaches the strategy through another decision's `depends-on`
- **THEN** `strategy-unimplemented` SHALL NOT be reported for it
- **AND** the reasoning SHALL match `constraint-unasserted`, which is transitive for the same reason

#### Scenario: A record that is not a strategy
- **WHEN** an active driver-spec declares no `strategy` role
- **THEN** `strategy-unimplemented` SHALL NOT be reported for it

#### Scenario: A record declaring several roles
- **WHEN** a driver-spec declares `strategy` among several roles
- **THEN** it SHALL be evaluated for `strategy-unimplemented`
- **AND** SHALL be reported at most once

#### Scenario: The rule names no hat
- **WHEN** the system decides whether a strategy is implemented
- **THEN** it SHALL NOT restrict the check to any named hat
- **AND** the reason SHALL be that every decision is owned by `dev` or `devops`, so any descending decision is an implementing one
- **AND** `DS-SQUAD-HATS` makes the hat set a property of the project rather than of the tool

#### Scenario: A cycle in depends-on
- **WHEN** the ancestry walk encounters a record it has already visited
- **THEN** it SHALL terminate rather than looping

### Requirement: An exposure with no planned work is reported
The system SHALL report an exposure that names no mitigating work, because an exposure pointing at nothing is a confession rather than a managed risk.

#### Scenario: An exposure with no pointer
- **WHEN** an active record carries a populated `### Exposure`
- **AND** that block names no `mitigated-by`
- **THEN** the system SHALL report an `exposure-unmitigated` loop against that record's hats

#### Scenario: An exposure naming an initiative
- **WHEN** an exposure names `mitigated-by`
- **THEN** `exposure-unmitigated` SHALL NOT be reported
- **AND** this SHALL hold even where the named initiative does not exist, because a broken reference is a different finding from an absent plan

#### Scenario: A record with no exposure
- **WHEN** a record carries no `### Exposure`
- **THEN** `exposure-unmitigated` SHALL NOT be reported for it
- **AND** `measure-unexposed` SHALL remain the loop that covers it

#### Scenario: Reading the pointer
- **WHEN** the system reads `mitigated-by` from an exposure block
- **THEN** it SHALL accept a bare, bulleted or bolded line
- **AND** the label SHALL match case-insensitively
- **AND** trailing punctuation SHALL be stripped from the value

### Requirement: The posture verdict vocabulary is explicit
The system SHALL accept exactly four verdicts, looked up by name, because which branch a verdict takes decides what else the measure owes.

#### Scenario: The vocabulary
- **WHEN** the system reads a posture verdict
- **THEN** the accepted values SHALL be `met`, `partially met`, `not met` and `cannot assess`
- **AND** comparison SHALL ignore case and surrounding whitespace
- **AND** no other value SHALL be interpreted

#### Scenario: Only a claim of success owes evidence
- **WHEN** the verdict is `met`
- **THEN** the measure SHALL owe evidence
- **AND** every other verdict SHALL owe an exposure instead

### Requirement: A measure nobody has judged is reported
The system SHALL report a measure that states something to attest but carries no posture, because "this has never been judged" is a different and more urgent finding than "this lacks evidence".

#### Scenario: Measures with no posture
- **WHEN** an active record carries a populated `## Measures` section
- **AND** that section carries no populated `### Posture`
- **THEN** the system SHALL report a `measure-unattested` loop against that record's hats
- **AND** it SHALL be reported once, not alongside `measure-unasserted` or `measure-unexposed`

#### Scenario: An unrecognised verdict
- **WHEN** a posture states a verdict outside the accepted vocabulary
- **THEN** the system SHALL report `measure-unattested` rather than guessing which branch applies
- **AND** the accepted values SHALL be named in the report

#### Scenario: No measures at all
- **WHEN** a record carries no populated `## Measures`
- **THEN** `measure-unattested` SHALL NOT be reported
- **AND** `constraint-unmeasurable` SHALL remain the loop that covers it

### Requirement: A measure claiming success with no evidence is reported
The system SHALL report a measure whose posture claims the bar was met but which carries no `### Evidence`, because a claim of success with nothing asserting it is an opinion.

#### Scenario: Met with no evidence
- **WHEN** an active record's posture states a verdict of `met`
- **AND** the measure carries no populated `### Evidence`
- **THEN** the system SHALL report a `measure-unasserted` loop against that record's hats

#### Scenario: Met with evidence
- **WHEN** the verdict is `met` and evidence is present
- **THEN** no `measure-unasserted` loop SHALL be reported
- **AND** the system SHALL NOT inspect whether the evidence is adequate, which is a judgement rather than a check

#### Scenario: A verdict other than met
- **WHEN** the verdict is `partially met`, `not met` or `cannot assess`
- **THEN** `measure-unasserted` SHALL NOT be reported
- **AND** the reason SHALL be that evidence supports a claim of success, which is not being made

### Requirement: A measure that fell short with no exposure is reported
The system SHALL report a measure whose posture is anything other than met but which carries no `### Exposure`, because a bar that was not met with nothing recorded about what remains at risk is an unanswered question.

#### Scenario: Not met, with nothing exposed
- **WHEN** the verdict is `partially met`, `not met` or `cannot assess`
- **AND** the measure carries no populated `### Exposure`
- **THEN** the system SHALL report a `measure-unexposed` loop against that record's hats

#### Scenario: Met
- **WHEN** the verdict is `met`
- **THEN** `measure-unexposed` SHALL NOT be reported
- **AND** an exposure MAY still be recorded alongside a passing verdict

#### Scenario: Cannot assess is a complete attestation
- **WHEN** the verdict is `cannot assess` and an exposure names what the evidence could not answer
- **THEN** no loop SHALL be reported for that measure

### Requirement: A bar that does not state its neighbour is reported
The system SHALL report a `### Bar` that declares no `neighbour`, because the position not taken is what makes a future trade arguable rather than re-litigated from scratch.

#### Scenario: A bar with no neighbour label
- **WHEN** an active record carries a `### Bar` sub-block
- **AND** that block declares no `neighbour` label
- **THEN** the system SHALL report a `bar-without-neighbour` loop against that record's hats

#### Scenario: A neighbour stated as unrecorded
- **WHEN** a bar declares `neighbour` with a value saying it is unrecorded
- **THEN** no `bar-without-neighbour` loop SHALL be reported
- **AND** the reason SHALL be that stating the gap is an honest answer, and a rule punishing it would train the line to be omitted

#### Scenario: A record with no bar
- **WHEN** a record carries no `### Bar` sub-block
- **THEN** `bar-without-neighbour` SHALL NOT be reported

### Requirement: What an attestation left unanswered is reported
The system SHALL report an initiative that claims to have been attested without answering reversibility, blast radius or accountability.

#### Scenario: Scoped to attested initiatives
- **WHEN** an initiative's state is `attested` or `completed`
- **THEN** the system SHALL evaluate its attestation
- **AND** an initiative in any other state, or declaring none, SHALL NOT be evaluated
- **AND** the reason SHALL be that before attestation these questions have no answer yet

#### Scenario: A missing door
- **WHEN** an attested initiative records no `door`
- **THEN** the system SHALL report `reversibility-unstated`

#### Scenario: A missing blast radius
- **WHEN** an attested initiative records no blast radius
- **THEN** the system SHALL report `blast-radius-unstated`

#### Scenario: No RACI at all
- **WHEN** an attested initiative records no RACI rows
- **THEN** the system SHALL report `raci-unassigned`
- **AND** the report SHALL say that nothing records who holds the change after the pull request closes

#### Scenario: A row handled by a system
- **WHEN** a RACI row names a system under **Handled by**
- **THEN** no loop SHALL be reported for it, whatever its R, A, C and I cells say

#### Scenario: A manual row with no owner
- **WHEN** a RACI row is not handled by a system
- **AND** it names no Responsible, or no Accountable
- **THEN** the system SHALL report `raci-unassigned` for that row
- **AND** the report SHALL name the concern and which of the two is missing

#### Scenario: Consulted and Informed are optional
- **WHEN** a manual row names both Responsible and Accountable
- **THEN** no loop SHALL be reported, whether or not Consulted and Informed are present

#### Scenario: One loop per unowned row
- **WHEN** several rows are unowned
- **THEN** each SHALL be reported separately

#### Scenario: A caller supplying no initiatives
- **WHEN** no initiatives are supplied
- **THEN** no attestation loop SHALL be reported

