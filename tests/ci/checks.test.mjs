import { describe, expect, it } from 'vitest';
import { ownerOnlyViolations } from '../../scripts/ci/check-scope.mjs';
import { unapprovedNewDeps } from '../../scripts/ci/check-deps.mjs';
import { scanFiles, scanText } from '../../scripts/ci/check-pii.mjs';

describe('smoke', () => {
  it('runs', () => expect(1 + 1).toBe(2));
});

describe('check-scope (fixtures)', () => {
  it('fails owner-only paths', () => {
    const bad = ownerOnlyViolations([
      'CLAUDE.md',
      '.claude/hooks/policy.mjs',
      '.github/workflows/ci.yml',
      'wrangler.jsonc',
      '.env.production',
      'docs/v2/process/GIT-STRATEGY.md',
    ]);
    expect(bad).toHaveLength(6);
  });
  it('passes a docs-only diff', () => {
    expect(ownerOnlyViolations(['docs/v2/product/BACKLOG.md', 'tests/ci/checks.test.mjs', '.env.example'])).toEqual([]);
  });
});

describe('check-deps (fixtures)', () => {
  const base = { dependencies: { astro: '^4' }, devDependencies: { sharp: '^0.33' } };
  it('fails an unapproved new dependency, including Prettier until IN-15', () => {
    expect(unapprovedNewDeps(base, { ...base, devDependencies: { sharp: '^0.33', lodash: '1', prettier: '3' } })).toEqual([
      'lodash',
      'prettier',
    ]);
  });
  it('passes approved and unchanged dependencies', () => {
    expect(unapprovedNewDeps(base, { ...base, devDependencies: { sharp: '^0.33', vitest: '2', preact: '10' } })).toEqual([]);
  });
});

describe('check-pii (fixtures)', () => {
  // Values are synthetic and built at runtime so this file itself stays clean.
  const digits = '9' + '876543210';
  const cases = {
    phone: `call ${digits} now`,
    email: `mail ${'jane.doe'}@${'mailbox'}.com`,
    'upi-id': `pay ${'jane'}@${'okaxis'}`,
    'hex-token': `key=${'a1b2c3d4'.repeat(5)}`,
    'base64-token': `tok=${'Ab3dE5gH7jK9mN1pQ3sT5vW7yZ9bC1eF3hJ5kL7n'}`,
  };
  for (const [rule, line] of Object.entries(cases)) {
    it(`detects ${rule}`, () => expect(scanText(line).map((h) => h.rule)).toContain(rule));
  }
  it('passes clean text and path-like strings', () => {
    expect(scanText('Add a product = one JSON entry. src/lib/pricing.ts and a/very/long/path/segments/with/Mixed1Case/names')).toEqual([]);
  });
  it('fails files with hits but only reports known files', () => {
    const files = { 'a.md': cases.phone, '.env.production': 'U=https://script.google.com/macros/s/' + 'A'.repeat(30) + '/exec' };
    const r = scanFiles(Object.keys(files), (f) => files[f]);
    expect(r.failing.map((h) => h.file)).toEqual(['a.md']);
    expect(r.reportOnly.map((h) => h.file)).toEqual(['.env.production']);
  });
});
