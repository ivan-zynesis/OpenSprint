import { describe, it, expect } from 'vitest';
import {
  MEASURE_PARTS,
  BAR_LABELS,
  POSTURE_LABELS,
  parsePosture,
  attestationOf,
  measuresSection,
  hasMeasures,
  parseMeasureAnatomy,
  parseBar,
  statesNeighbour,
} from '../../src/core/compact/measures.js';

/**
 * DS-MEASURE-ANATOMY — a measure has four parts, the same four for every hat.
 * DEC-019 puts them under the existing `## Measures` section as optional
 * sub-blocks, so a record written before any of this still parses.
 */
describe('measure anatomy', () => {
  const doc = (body: string) => `---\nid: DS-X\n---\n\n# DS-X\n\n${body}\n`;

  describe('the vocabularies are explicit lists', () => {
    it('names the four parts', () => {
      expect([...MEASURE_PARTS]).toEqual(['bar', 'posture', 'evidence', 'exposure']);
    });

    it('names the four bar labels', () => {
      expect([...BAR_LABELS]).toEqual(['dimension', 'chosen', 'traded for', 'neighbour']);
    });
  });

  describe('measuresSection', () => {
    it('returns the body, ending at the next second-level heading', () => {
      const s = measuresSection(doc('## Measures\n\nthe measure\n\n## Implications\n\nelsewhere'));
      expect(s).toContain('the measure');
      expect(s).not.toContain('elsewhere');
    });

    it('returns null when there is no Measures section', () => {
      expect(measuresSection(doc('## Rationale\n\nwhy'))).toBeNull();
    });

    it('keeps third-level sub-blocks inside the section', () => {
      const s = measuresSection(doc('## Measures\n\n### Evidence\n\nthe artifact\n\n## Next'));
      expect(s).toContain('### Evidence');
      expect(s).toContain('the artifact');
    });
  });

  describe('hasMeasures is unchanged by the anatomy landing', () => {
    it('is true for a populated section', () => {
      expect(hasMeasures(doc('## Measures\n\n- **Primary**: a thing'))).toBe(true);
    });

    it('is false for a heading with nothing beneath it', () => {
      expect(hasMeasures(doc('## Measures\n\n## Implications\n\nx'))).toBe(false);
    });

    it('is false for a comment-only section', () => {
      expect(hasMeasures(doc('## Measures\n\n<!-- todo -->'))).toBe(false);
    });

    it('is false when there is no section at all', () => {
      expect(hasMeasures(doc('## Rationale\n\nwhy'))).toBe(false);
    });
  });

  describe('parseMeasureAnatomy', () => {
    const full = doc(`## Measures

- **Primary**: the target

### Bar

- **dimension**: speed ←→ safety
- **neighbour**: unrecorded

### Posture

below bar, accepted

### Evidence

coverage report

### Exposure

unbounded blast radius
`);

    it('reads all four parts', () => {
      const a = parseMeasureAnatomy(full);
      expect(a.bar).toContain('dimension');
      expect(a.posture).toBe('below bar, accepted');
      expect(a.evidence).toBe('coverage report');
      expect(a.exposure).toBe('unbounded blast radius');
    });

    it('returns every part absent for a record with no sub-blocks', () => {
      expect(parseMeasureAnatomy(doc('## Measures\n\n- **Primary**: a thing'))).toEqual({});
    });

    it('returns nothing when there is no Measures section', () => {
      expect(parseMeasureAnatomy(doc('### Evidence\n\nstray'))).toEqual({});
    });

    it('reads a partial anatomy', () => {
      const a = parseMeasureAnatomy(doc('## Measures\n\n### Evidence\n\nonly this'));
      expect(a.evidence).toBe('only this');
      expect(a.bar).toBeUndefined();
      expect(a.exposure).toBeUndefined();
    });

    it('treats an empty sub-block as absent', () => {
      const a = parseMeasureAnatomy(doc('## Measures\n\nx\n\n### Evidence\n\n### Exposure\n\nreal'));
      expect(a.evidence).toBeUndefined();
      expect(a.exposure).toBe('real');
    });

    it('matches part headings case-insensitively', () => {
      const a = parseMeasureAnatomy(doc('## Measures\n\n### evidence\n\nlower'));
      expect(a.evidence).toBe('lower');
    });

    it('does not read a sub-block outside the Measures section', () => {
      const a = parseMeasureAnatomy(doc('## Measures\n\nx\n\n## Rationale\n\n### Evidence\n\nnot mine'));
      expect(a.evidence).toBeUndefined();
    });
  });

  describe('parseBar', () => {
    it('reads the labelled lines', () => {
      const bar = parseBar('- **dimension**: a ←→ b\n- **chosen**: a\n- **traded for**: b\n- **neighbour**: unrecorded');
      expect(bar.dimension).toBe('a ←→ b');
      expect(bar.chosen).toBe('a');
      expect(bar['traded for']).toBe('b');
      expect(bar.neighbour).toBe('unrecorded');
    });

    it('reads a partial bar', () => {
      const bar = parseBar('- **chosen**: a');
      expect(bar.chosen).toBe('a');
      expect(bar.neighbour).toBeUndefined();
    });

    it('ignores a label outside the vocabulary', () => {
      const bar = parseBar('- **vibes**: good\n- **chosen**: a');
      expect(Object.keys(bar)).toEqual(['chosen']);
    });

    it('matches labels case-insensitively', () => {
      expect(parseBar('- **Neighbour**: x').neighbour).toBe('x');
    });

    it('accepts an asterisk bullet', () => {
      expect(parseBar('* **chosen**: a').chosen).toBe('a');
    });

    it('ignores a label with an empty value', () => {
      expect(parseBar('- **neighbour**:   ').neighbour).toBeUndefined();
    });
  });

  describe('statesNeighbour', () => {
    it('is satisfied by a value saying the neighbour is unrecorded', () => {
      expect(statesNeighbour('- **neighbour**: unrecorded — nothing says what it would cost')).toBe(true);
    });

    it('is false when the label is absent', () => {
      expect(statesNeighbour('- **chosen**: fully manual')).toBe(false);
    });
  });

  // ═══════════════════════════════════════════════════════════
  // The third citation authority (DS-ATTESTED-TRUTH, DEC-021)
  // ═══════════════════════════════════════════════════════════

  describe('posture and attestation', () => {
    const attested = doc(`## Measures

- **Primary**: no credential reaches a log

### Posture

- **verdict**: met
- **attested-by**: ivan
- **attested-on**: 2026-10-09

The scan has failed the build on every attempt since.

### Evidence

ci/secret-scan run 4821
`);

    it('names the posture labels explicitly', () => {
      expect([...POSTURE_LABELS]).toEqual(['verdict', 'attested-by', 'attested-on']);
    });

    it('reads the labelled lines, keeping the prose beneath them', () => {
      const p = parsePosture('- **verdict**: met\n- **attested-by**: ivan\n\nsome prose');
      expect(p.verdict).toBe('met');
      expect(p['attested-by']).toBe('ivan');
    });

    it('ignores a label outside the vocabulary', () => {
      expect(Object.keys(parsePosture('- **mood**: good\n- **verdict**: met'))).toEqual(['verdict']);
    });

    it('reports attested when a date and evidence are both present', () => {
      const a = attestationOf(attested);
      expect(a.attested).toBe(true);
      expect(a.authority).toBe('attested');
      expect(a.verdict).toBe('met');
      expect(a.by).toBe('ivan');
      expect(a.on).toBe('2026-10-09');
    });

    it('is decided when a verdict has no evidence behind it', () => {
      const a = attestationOf(doc('## Measures\n\n- x\n\n### Posture\n\n- **verdict**: met\n- **attested-on**: 2026-10-09'));
      expect(a.attested).toBe(false);
      expect(a.authority).toBe('decided');
      expect(a.verdict).toBe('met');
    });

    it('is decided when evidence exists but nothing was attested', () => {
      const a = attestationOf(doc('## Measures\n\n- x\n\n### Evidence\n\na report'));
      expect(a.attested).toBe(false);
      expect(a.authority).toBe('decided');
    });

    it('is decided for a record with no posture at all', () => {
      expect(attestationOf(doc('## Measures\n\n- x')).authority).toBe('decided');
    });

    it('is decided for a record with no measures at all', () => {
      expect(attestationOf(doc('## Rationale\n\nwhy')).authority).toBe('decided');
    });

    it('carries the date without expiring it — attestation ages, nothing judges when', () => {
      const old = attested.replace('2026-10-09', '1999-01-01');
      const a = attestationOf(old);
      expect(a.attested).toBe(true);
      expect(a.on).toBe('1999-01-01');
    });
  });
});