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
 * The verdicts a posture may state, as an explicit list.
 *
 * The whole conditional rests on which branch a verdict takes (DEC-041), so a
 * value outside this list is reported rather than guessed at. `met` is the
 * only one claiming success, and therefore the only one owing evidence;
 * everything else owes an exposure — including `cannot assess`, which is a
 * complete attestation naming what the evidence could not answer.
 */
export const POSTURE_VERDICTS = ['met', 'partially met', 'not met', 'cannot assess'] as const;

export type PostureVerdict = (typeof POSTURE_VERDICTS)[number];

/**
 * Normalises a stated verdict, or null when it is outside the vocabulary.
 *
 * Case and surrounding whitespace are ignored; nothing else is interpreted.
 */
export function normalizeVerdict(value: string | undefined): PostureVerdict | null {
  if (value === undefined) return null;
  const v = value.trim().toLowerCase();
  return POSTURE_VERDICTS.find((candidate) => candidate === v) ?? null;
}

/** What a verdict obliges the measure to carry. */
export function verdictRequires(verdict: PostureVerdict): 'evidence' | 'exposure' {
  return verdict === 'met' ? 'evidence' : 'exposure';
}

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
 * The initiative an exposure points at, or null.
 *
 * DS-FORWARD-CLOSURE closes the loop forward: an exposure discovered at
 * attestation has no backward target, because nothing went wrong upstream —
 * the constraint was right, the decision was right, the bar simply was not
 * met. The only honest response points at work not yet done.
 *
 * Read as `mitigated-by: <initiative-id>` anywhere in the exposure block,
 * because the pointer belongs beside the prose explaining the risk rather
 * than in frontmatter away from it.
 */
export function mitigatedBy(exposureBlock: string): string | null {
  for (const line of exposureBlock.split('\n')) {
    const match = line.match(/^\s*(?:[-*]\s*)?(?:\*\*)?mitigated-by(?:\*\*)?\s*:\s*(\S+)/i);
    if (match) return match[1].replace(/[.,;]$/, '');
  }
  return null;
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

/**
 * The two forms an evidence reference may take.
 *
 * `remote` is anything carrying a scheme — a pipeline run, a published
 * coverage report, a scan result hosted by the forge. `local` is a path
 * inside the repository.
 *
 * The split exists because only one of them can be checked here. A compiler
 * that resolved a remote reference would have to go to the network, which
 * makes a compile non-deterministic, slow, and dependent on credentials the
 * reader may not hold. `DEC-007` forbids inventing a gap; a failed fetch is
 * exactly that — it reports the network, not the record.
 */
export const EVIDENCE_REFERENCE_FORMS = ['remote', 'local'] as const;

export type EvidenceReferenceForm = (typeof EVIDENCE_REFERENCE_FORMS)[number];

export interface EvidenceReference {
  form: EvidenceReferenceForm;
  /** The URL, or the repository-relative path. */
  target: string;
}

/**
 * Every addressable reference an evidence block carries.
 *
 * Two forms are recognised, both of them things an author writes
 * deliberately rather than shapes a parser guesses at: a markdown link, and
 * a backticked path. Prose is not scanned for things that look like
 * filenames — `DS-CI-ATTESTATION` requires an *addressable* artifact, and a
 * word with a dot in it is not an address.
 *
 * A link with a scheme is remote; one without is a path, and is reported the
 * same way a backticked path is.
 */
export function evidenceReferences(block: string): EvidenceReference[] {
  const refs: EvidenceReference[] = [];
  const seen = new Set<string>();

  const add = (target: string): void => {
    const cleaned = target.trim().replace(/[.,;)]+$/, '');
    if (cleaned.length === 0 || seen.has(cleaned)) return;
    seen.add(cleaned);
    refs.push({
      form: /^[a-z][a-z0-9+.-]*:/i.test(cleaned) ? 'remote' : 'local',
      target: cleaned,
    });
  };

  // Markdown links: the target, not the label.
  for (const match of block.matchAll(/\[[^\]]*\]\(([^)\s]+)\)/g)) add(match[1]);

  // Backticked paths. A backticked token without a separator is a symbol
  // name, not an address, so it does not count as a reference.
  for (const match of block.matchAll(/`([^`\n]+)`/g)) {
    const token = match[1].trim();
    if (!token.includes('/')) continue;
    if (/\s/.test(token)) continue;
    add(token);
  }

  return refs;
}

/**
 * The form a bar takes, by hat (`DEC-038`).
 *
 * BDD, in one of two shapes. A maintainer bar written as a user story
 * becomes an awkward fiction — "as a maintainer, I want credentials not to be
 * committed" says less than "given a credential is committed, when CI runs,
 * then the build fails", and only the second tells you what to point a
 * pipeline at. Product bars invert it: a user story carries the persona and
 * the reason, which given/when/then has nowhere to put.
 *
 * The labels are the whole vocabulary, by explicit list rather than pattern,
 * so the skill that writes a bar and the harvest that reads one cannot drift.
 * A hat absent from this map declares no form, and nothing is checked of it —
 * `dev` and `devops` describe a system rather than commit to a bar.
 */
export const BAR_FORMS: Readonly<Record<string, readonly string[]>> = {
  product: ['as a', 'I want', 'for'],
  maintainer: ['given', 'when', 'then'],
};

export interface BarForm {
  /** The hat whose form this is. */
  hat: string;
  /** The labels the block states, in the order the form declares them. */
  stated: string[];
  /** Every label the form declares. */
  expected: readonly string[];
}

/**
 * Whether a bar block states the form a given hat's bars take.
 *
 * Reports what is stated rather than returning a verdict, so the caller
 * decides what a partial form means. A bar carrying `given` and `then` but no
 * `when` has started the thought and not finished it, which is a different
 * finding from prose that never began.
 *
 * Labels are read the same way the rest of the anatomy reads them: at the
 * start of a line, optionally bulleted and optionally bold. That is what an
 * author types; it is not an attempt to find the words in a sentence.
 */
export function parseBarForm(block: string, hat: string): BarForm | null {
  const expected = BAR_FORMS[hat];
  if (expected === undefined) return null;

  const stated: string[] = [];
  for (const label of expected) {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`^\\s*(?:[-*]\\s*)?(?:\\*\\*)?${escaped}(?:\\*\\*)?[\\s:]`, 'im');
    if (pattern.test(block)) stated.push(label);
  }
  return { hat, stated, expected };
}

/**
 * The four parts of a strategy cell (`DEC-037`).
 *
 * SWOT-like and deliberately not SWOT. `opportunity` is a **redefinition**:
 * standard SWOT means external upside, and here it means the alternatives
 * weighed against the choice that was made. Recorded as a redefinition so it
 * does not read as a misunderstanding of the framework.
 */
export const SWOT_PARTS = ['strength', 'weakness', 'opportunity', 'threat'] as const;

export type SwotPart = (typeof SWOT_PARTS)[number];

/**
 * Where each part is compiled from, in the decision it cites.
 *
 * The cell is **compiled, not authored** (`DS-DOCUMENTATION-AS-OUTPUT`): each
 * part names a section of the ADR rather than a prompt for the renderer to
 * answer. A strategy cell nobody can trace to a decision is the gap
 * `strategy-unimplemented` already reports.
 */
export const SWOT_SOURCES: Readonly<Record<SwotPart, string>> = {
  strength: 'the ✓ cells of the chosen column in `## Consideration Factors`',
  weakness: 'the ✗ cells of the chosen column in `## Consideration Factors`',
  opportunity: 'the other columns of `## Consideration Factors` — the alternatives weighed',
  threat: '`## Invalidation Trigger`',
};
