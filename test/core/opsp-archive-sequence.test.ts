import { describe, it, expect } from 'vitest';
import { getOpspArchiveSkillTemplate } from '../../src/core/templates/skill-templates.js';

/** DEC-030 — rebase, attest, archive, merge, as one PR gated on state consistency. */
describe('/opsp:archive carries the merge sequence', () => {
  const text = getOpspArchiveSkillTemplate().instructions;

  it('shows the forced order', () => {
    expect(text).toMatch(/The\s+merge\s+sequence/i);
    expect(text).toMatch(/rebase.*attest.*archive.*main/is);
    expect(text).toMatch(/DEC-030/);
  });

  it('says why rebase comes first', () => {
    expect(text).toMatch(/Rebase\s+onto\s+the\s+trunk\s+first/i);
    expect(text).toMatch(/wrong\s+the\s+instant\s+it\s+merges/i);
  });

  it('refuses to compile claims nobody has checked', () => {
    expect(text).toMatch(/Attest\s+before\s+archiving/i);
    expect(text).toMatch(/DS-ATTESTED-TRUTH/);
    expect(text).toMatch(/stop\s+and\s+say\s+so/i);
  });

  it('says why attestation does not get its own PR', () => {
    expect(text).toMatch(/as\s+one\s+pull\s+request/i);
    expect(text).toMatch(/never\s+happens/i);
  });

  it('describes the PR gate', () => {
    expect(text).toMatch(/The\s+PR\s+gate/i);
    expect(text).toContain('opensprint compact check');
    expect(text).toMatch(/Problems\s+section\s+must\s+be\s+empty/i);
    expect(text).toMatch(/reversibility,\s+blast\s+radius\s+and\s+RACI/i);
  });

  it('gates on whether you answered, never on what', () => {
    expect(text).toMatch(/whether\s+you\s+answered,\s+never\s+on\s+what/i);
    expect(text).toMatch(/not\s+met.*passes/is);
    expect(text).toMatch(/DS-SURROGATE-SCOPE/);
  });
});
