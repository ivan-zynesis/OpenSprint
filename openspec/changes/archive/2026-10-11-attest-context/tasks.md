## 1. Reading an evidence reference
- [x] 1.1 `EVIDENCE_REFERENCE_FORMS` — `remote`, `local`, as an explicit list
- [x] 1.2 `evidenceReferences(block)` reads markdown links and backticked paths
- [x] 1.3 A link target with a scheme is remote; one without is local
- [x] 1.4 A backticked token with no separator, or containing whitespace, is not a reference
- [x] 1.5 Prose is not scanned for filename-shaped tokens
- [x] 1.6 Trailing sentence punctuation stripped; each reference reported once

## 2. The loop
- [x] 2.1 `evidence-unresolvable` registered — seventeen kinds
- [x] 2.2 Fires on an evidence block with no reference, naming both accepted forms
- [x] 2.3 Fires on a local path that does not resolve, naming the path
- [x] 2.4 Silent where there is no evidence block to read
- [x] 2.5 `deriveOpenLoops` takes an optional resolver, defaulting to "it resolves"

## 3. The real resolver
- [x] 3.1 `compact` supplies a filesystem check bounded to the project root
- [x] 3.2 An absolute path, or one escaping the root, is never reported

## 4. The skill
- [x] 4.1 `/opsp:attest` mandates the two forms
- [x] 4.2 Names `evidence-unresolvable` and says it repeats until closed
- [x] 4.3 States that the compiler does not go to the network

## 5. Documentation
- [x] 5.1 `docs/concepts.md` loop table completed — it was stale by four kinds
- [x] 5.2 The record / measure / change grouping stated

## 6. Verification
- [x] 6.1 Unit tests for every branch of `evidenceReferences`
- [x] 6.2 Loop tests, including the local-path and remote-reference branches
- [x] 6.3 End-to-end tests against the real filesystem resolver
- [x] 6.4 Skill tests for the mandated form
- [x] 6.5 tsc clean, lint clean, suite green apart from the pre-existing zsh-installer failures
