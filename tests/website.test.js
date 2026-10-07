import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeWebsite } from '../src/features/editor/model.js';
import { renderWebsite } from '../src/features/editor/render.js';
import { createProjectStore } from '../src/features/projects/store.js';
test('website export escapes content and rejects unsafe styles and contact URLs', () => {
  const output = renderWebsite('<script>alert(1)</script>', { headline: '<img onerror="bad">', accent: 'red; background:url(evil)', email: 'javascript:alert(1)' });
  assert.ok(!output.includes('<script>'));
  assert.ok(!output.includes('<img'));
  assert.ok(!output.includes('background:url'));
  assert.ok(!output.includes('javascript:'));
  assert.match(output, /&lt;img/);
});
test('template defaults and input limits are deterministic', () => {
  assert.equal(normalizeWebsite({ template: 'portfolio' }).accent, '#cfc0f0');
  assert.equal(normalizeWebsite({ headline: 'x'.repeat(500) }).headline.length, 120);
  assert.equal(normalizeWebsite({ template: 'unknown' }).template, 'studio');
});
test('website content survives a backup and storage reload', () => {
  let saved = '[]';
  const storage = { getItem: () => saved, setItem: (_, value) => { saved = value; } };
  const store = createProjectStore(storage, { id: () => 'site' });
  store.create({ name: 'Website', description: 'My website', type: 'Website' });
  store.saveWebsite('site', { headline: 'My business' });
  assert.equal(createProjectStore(storage).getProjects()[0].website.headline, 'My business');
  store.restore(store.export());
  assert.equal(store.getProjects()[0].website.headline, 'My business');
});

test('inherited object keys cannot select a website template', () => {
  for (const template of ['constructor', '__proto__', 'toString']) {
    const value = normalizeWebsite({ template });
    assert.equal(value.template, 'studio');
    assert.equal(typeof value.headline, 'string');
  }
});
