## Context

`DS-ATTESTED-TRUTH` makes `attested` the authority that lets a reader stop looking. `DS-CI-ATTESTATION` says what earns it: an artifact the pipeline produced, addressable from the pull request. Between the two sat nothing — the skill asked for an artifact and the harvest never looked at what arrived.

## Goals / Non-Goals

**Goals**
- An attestation naming no artifact is reported, every compile, until one is named
- A cited repository path that is not there is reported, naming it
- The author decides what is an address; the parser does not guess

**Non-Goals**
- Fetching a remote reference. See below.
- Judging whether the artifact is the *right* one. That is the review question the skill already asks of the tests, and it is a judgement, not a check.
- Checking the artifact's content. A coverage report proving nothing is a reading problem, and `/opsp:attest` is where it is caught.

## Decisions

**Two forms, both deliberate.** A markdown link and a backticked path containing a separator. Both are things an author types on purpose. The rejected alternative was scanning prose for filename-shaped tokens, which would accept "see coverage/index.html for details" as an address and, worse, would accept a sentence that merely mentions a file. `DS-CI-ATTESTATION` asks for something addressable; a word with a slash in it is not an address.

A backticked token with no separator is a symbol name — `deriveOpenLoops`, not a path — and does not count. A backticked token containing whitespace is a phrase, not a path.

**Remote references are taken on trust, and this is a real limit.** A compile that resolved them would be non-deterministic, would need network access and often credentials, and would report the network's state as the record's. `DEC-007` forbids inventing a gap, and a failed fetch is the purest form of one. The consequence is stated rather than hidden: a remote artifact is only as good as the person who cited it, and `/opsp:attest` says so to the operator's face.

**The resolver is a parameter, defaulting to "it resolves."** `deriveOpenLoops` stays pure; `compact` supplies a filesystem check. A caller that cannot answer sees no loop rather than a false one — the same shape `readInitiativeGitState` uses for `undefined`, and for the same reason.

**A path escaping the project root resolves.** The check is bounded to the tree it can see. A reference to `../shared/report.txt` may be perfectly valid in a monorepo checkout the compiler is not looking at, and reporting it as missing would be a gap invented out of the check's own narrowness.

## Risks / Trade-offs

**A dead link reads as evidence.** The most likely real failure — a CI run expired, a report URL rotted — is exactly the one this cannot catch. What it catches is the more common and more deliberate failure: prose where an artifact should be. That is a smaller claim than "evidence is verified", and the skill states it rather than letting the loop's silence imply more.

**Existing records with prose evidence will light up.** That is the rule working. Nothing is rewritten for them; `evidence-unresolvable` names each one and the next attestation closes it.
