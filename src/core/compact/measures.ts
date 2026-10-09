/**
 * Compact — the measure and its anatomy
 *
 * A measure is not a single value. It has four parts, and they are the same
 * four for every hat (DS-MEASURE-ANATOMY): a **bar** written ex ante at
 * proposal, and a **posture**, **evidence** and **exposure** written ex post
 * at attestation.
 *
 * DEC-019 puts them inside the record's existing `## Measures` section as
 * optional sub-blocks rather than in separate records or in frontmatter:
 * they hold prose, YAML is hostile to paragraphs, and reusing the section
 * means a record written before any of this still parses.
 *
 * This module owns `## Measures` and everything beneath it, so there is one
 * parser for the section rather than two that can disagree.
 */

/**
 * The parts of a measure, as an explicit list.
 *
 * If we read them, we track them by name in a constant — the alternative is
 * discovering parts by pattern, which would silently accept a `### Barr`.
 */
export const MEASURE_PARTS = ['bar', 'posture', 'evidence', 'exposure'] as const;

export type MeasurePart = (typeof MEASURE_PARTS)[number];

/** Each part's body, absent where the sub-block is missing or empty. */
export type MeasureAnatomy = Partial<Record<MeasurePart, string>>;

/**
 * The labels a bar states, as an explicit list.
 *
 * A bar's parts are a closed vocabulary rather than free prose: where it
 * sits, on what axis, what that cost, and the position not taken. `neighbour`
 * is the one that makes a future trade arguable rather than re-litigated.
 */
export const BAR_LABELS = ['dimension', 'chosen', 'traded for', 'neighbour'] as const;

export type BarLabel = (typeof BAR_LABELS)[number];

export type Bar = Partial<Record<BarLabel, string>>;

/**
 * The labels a posture states, as an explicit list.
 *
 * Attestation needs the same three facts every time — what the verdict was,
 * who asserted it, and when — so they are a closed vocabulary read the same
 * way a bar's are, rather than a second convention.
 */
export const POSTURE_LABELS = ['verdict', 'attested-by', 'attested-on'] as const;

export type PostureLabel = (typeof POSTURE_LABELS)[number];

export type Posture = Partial<Record<PostureLabel, string>>;

/**
 * The authority a compiled claim about a record may carry (DEC-009, DEC-021).
 *
 * Only `attested` licenses an unqualified present-tense claim: a decision
 * binds but may not be true yet, and an observation is true but may be an
 * accident.
 */
export type CitationAuthority = 'decided' | 'attested';

export interface Attestation {
  attested: boolean;
  verdict?: string;
  by?: string;
  /** The date asserted. Attestation ages; nothing here expires it. */
  on?: string;
  authority: CitationAuthority;
}

/** Strips HTML comments and surrounding whitespace, the way the old parser did. */
function clean(body: string): string {
  return body.replace(/<!--[\s\S]*?-->/g, '').trim();
}

/**
 * The body of a record's `## Measures` section, or null when it has none.
 *
 * Ends at the next second-level heading, so third-level sub-blocks stay
 * inside it — which is what makes the anatomy addressable.
 */
export function measuresSection(content: string): string | null {
  const match = content.match(/^##\s+Measures\s*$/m);
  if (!match || match.index === undefined) return null;
  const after = content.slice(match.index + match[0].length);
  const next = after.search(/^##\s/m);
  return next === -1 ? after : after.slice(0, next);
}

/**
 * Whether a record's body carries a populated `## Measures` section.
 *
 * A heading with nothing beneath it does not count: an empty section is the
 * shape of an answer without the answer, and reporting it is the whole point.
 *
 * Unchanged in behaviour from the implementation this replaces, so
 * `constraint-unmeasurable` is untouched by the anatomy landing.
 */
export function hasMeasures(content: string): boolean {
  const section = measuresSection(content);
  return section !== null && clean(section).length > 0;
}

/**
 * Reads the four sub-blocks of a record's measure.
 *
 * Only headings *inside* `## Measures` count: a `### Bar` elsewhere in the
 * document is some other discussion, not this record's bar. A sub-block whose
 * body is empty is treated as absent, for the same reason an empty
 * `## Measures` is — a heading alone is not an answer.
 */
export function parseMeasureAnatomy(content: string): MeasureAnatomy {
  const section = measuresSection(content);
  if (section === null) return {};

  const anatomy: MeasureAnatomy = {};
  for (const part of MEASURE_PARTS) {
    // Anchored to the part name, case-insensitive: a record may write
    // `### Evidence` or `### evidence` and mean the same thing.
    const heading = new RegExp(`^###\\s+${part}\\s*$`, 'im');
    const match = section.match(heading);
    if (!match || match.index === undefined) continue;

    const after = section.slice(match.index + match[0].length);
    const next = after.search(/^###?\s/m);
    const body = clean(next === -1 ? after : after.slice(0, next));
    if (body.length > 0) anatomy[part] = body;
  }
  return anatomy;
}

/**
 * Reads a bar's labelled lines by explicit lookup.
 *
 * `- **neighbour**: unrecorded` and nothing else. Labels are looked up from
 * BAR_LABELS rather than harvested from the block, so an unrecognised label
 * is ignored instead of quietly becoming part of the bar.
 */
export function parseBar(block: string): Bar {
  return parseLabelled(block, BAR_LABELS) as Bar;
}

/**
 * Reads `- **label**: value` lines against a fixed vocabulary.
 *
 * Labels are looked up from the supplied list rather than harvested from the
 * block, so an unrecognised label is ignored instead of quietly becoming part
 * of the structure.
 */
function parseLabelled(
  block: string,
  labels: readonly string[]
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of block.split('\n')) {
    const match = line.match(/^\s*[-*]\s*\*\*\s*([^*]+?)\s*\*\*\s*:\s*(.+)$/);
    if (!match) continue;
    const label = match[1].trim().toLowerCase();
    if (!labels.includes(label)) continue;
    const value = match[2].trim();
    if (value.length > 0) out[label] = value;
  }
  return out;
}

/**
 * Reads a posture's labelled lines.
 *
 * Shares parseBar's mechanism rather than repeating it: both read
 * `- **label**: value` against a fixed vocabulary, and a second
 * implementation is how the two conventions start to differ.
 */
export function parsePosture(block: string): Posture {
  return parseLabelled(block, POSTURE_LABELS) as Posture;
}

/**
 * Whether a record's measure has been attested, and by whom.
 *
 * Requires **both** a date and evidence. A posture saying "met" with nothing
 * asserting it is an opinion, and DS-ATTESTED-TRUTH is precisely about that
 * difference — so a verdict alone reports `decided`, and the existing
 * measure-unasserted loop names the missing half.
 *
 * Computed from content rather than declared in frontmatter, so it cannot
 * drift from the evidence — the same reasoning that makes views compiled
 * rather than authored (DEC-006).
 */
export function attestationOf(content: string): Attestation {
  const anatomy = parseMeasureAnatomy(content);
  if (anatomy.posture === undefined) return { attested: false, authority: 'decided' };

  const posture = parsePosture(anatomy.posture);
  const hasEvidence = anatomy.evidence !== undefined;
  const attested = posture['attested-on'] !== undefined && hasEvidence;

  return {
    attested,
    ...(posture.verdict === undefined ? {} : { verdict: posture.verdict }),
    ...(posture['attested-by'] === undefined ? {} : { by: posture['attested-by'] }),
    ...(posture['attested-on'] === undefined ? {} : { on: posture['attested-on'] }),
    authority: attested ? 'attested' : 'decided',
  };
}

/**
 * Whether a bar states the position it did not take.
 *
 * Presence of the label is the test, not what it says. A bar declaring
 * `neighbour: unrecorded` has answered honestly — DS-MEASURE-ANATOMY reasons
 * the same way about posture, that the honest position beats silence — and a
 * rule punishing that answer would only train the line to be omitted.
 */
export function statesNeighbour(block: string): boolean {
  return parseBar(block).neighbour !== undefined;
}
