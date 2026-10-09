/**
 * Amendment — the third write mode
 *
 * DEC-027 names three ways a tool may touch the surrogate:
 *
 *   create   /opsp:decide, /opsp:driver, /opsp:propose   a new record
 *   derive   /opsp:compact, /opsp:archive                compiled artifacts only
 *   amend    /opsp:attest                                one named section
 *
 * Amendment is the one that needed bounding. `/opsp:attest` writes posture,
 * evidence and exposure into an existing record's `## Measures` section, and
 * nothing else — never a Statement, a Decision or a Rationale. That bound is
 * what keeps DEC-006's guarantee meaningful: a record's claim never changes
 * under a reader who cited it, and what is added is a different kind of
 * content in a section reserved for it.
 *
 * This module makes the bound checkable rather than aspirational. The skill
 * does the judging; code can still verify that it stayed where it was told.
 */

import { measuresSection } from './measures.js';

export interface AmendmentCheck {
  bounded: boolean;
  /** Why it was not, when it was not. */
  reason?: string;
}

/**
 * Everything outside `## Measures`, which an amendment must leave untouched.
 *
 * The heading is removed along with its body. A record attested for the first
 * time gains both at once, and that is the amendment working — bounding it to
 * records that already had a `## Measures` section would mean nothing could
 * ever be attested twice over.
 */
function outsideMeasures(content: string): string {
  const section = measuresSection(content);
  if (section === null) return content;
  const heading = content.match(/^##\s+Measures\s*$/m);
  if (!heading || heading.index === undefined) return content;
  const start = heading.index;
  const end = content.indexOf(section) + section.length;
  return content.slice(0, start) + content.slice(end);
}

/**
 * Whether an edit touched only the record's `## Measures` section.
 *
 * Compares everything outside that section byte for byte. Frontmatter,
 * headings, the Statement, the Rationale and the Implications must all be
 * identical — an amendment adds what turned out to be true about a claim, it
 * does not revise the claim.
 *
 * A record gaining its first `## Measures` section is bounded: the text
 * before and after it is unchanged, and the section itself is the addition.
 */
export function checkAmendment(before: string, after: string): AmendmentCheck {
  if (before === after) return { bounded: true };

  // Trailing whitespace only: appending a `## Measures` section introduces a
  // separating blank line outside it, which is formatting rather than a
  // content change. Internal edits still differ and are still caught.
  const beforeOutside = outsideMeasures(before).trimEnd();
  const afterOutside = outsideMeasures(after).trimEnd();

  if (beforeOutside === afterOutside) return { bounded: true };

  // Naming which part moved is what makes the failure actionable; a bare
  // "unbounded" sends someone diffing by hand.
  const beforeFm = before.split('---')[1] ?? '';
  const afterFm = after.split('---')[1] ?? '';
  if (beforeFm !== afterFm) {
    return {
      bounded: false,
      reason: 'Frontmatter changed. An amendment may add attestation metadata inside `## Measures` only.',
    };
  }
  return {
    bounded: false,
    reason:
      'Content outside `## Measures` changed. Revising a Statement, Decision or Rationale is a new decision — /opsp:decide — not an amendment.',
  };
}
