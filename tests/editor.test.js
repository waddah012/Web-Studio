import test from 'node:test';
import assert from 'node:assert/strict';
import { createHistory } from '../src/features/editor/history.js';
import { createSection, normalizeSections, moveSection, safeImageUrl } from '../src/features/editor/sections.js';
import { normalizeWebsite } from '../src/features/editor/model.js';
import { renderWebsite } from '../src/features/editor/render.js';
import { createDraftStorage } from '../src/infrastructure/draft-storage.js';

test('sections can be added, moved, removed and migrated from legacy pages', () => {
  const sections = [createSection('text', 'a'), createSection('contact', 'b')];
  assert.deepEqual(moveSection(sections, 'b', -1).map(section => section.id), ['b', 'a']);
  assert.deepEqual(moveSection(sections, 'a', -1), sections);
  assert.equal(normalizeWebsite({}).sections[0].type, 'services');
  assert.deepEqual(normalizeWebsite({ sections: [] }).sections, []);
  assert.equal(normalizeSections([{ ...sections[0] }, { ...sections[0] }]).length, 2);
  assert.notEqual(normalizeSections([sections[0], sections[0]])[0].id, normalizeSections([sections[0], sections[0]])[1].id);
  assert.equal(normalizeSections(Array.from({ length: 30 }, () => sections[0])).length, 20);
});

test('history groups typing, branches after undo and bounds past snapshots', () => {
  const history = createHistory({ headline: 'Original' }, 2);
  history.record({ headline: 'A' }, { group: 'headline', time: 1000 });
  history.record({ headline: 'AB' }, { group: 'headline', time: 1100 });
  history.undo(); assert.equal(history.value.headline, 'Original');
  history.redo(); assert.equal(history.value.headline, 'AB');
  history.undo(); history.record({ headline: 'Different' });
  assert.equal(history.canRedo, false);
  history.record({ headline: 'Third' }); history.record({ headline: 'Fourth' });
  history.undo(); history.undo(); history.undo();
  assert.equal(history.value.headline, 'Different');
  const copy = history.value; copy.headline = 'Mutation';
  assert.equal(history.value.headline, 'Different');
});

test('unsafe image sources and section markup cannot enter exported HTML', () => {
  for (const source of ['javascript:alert(1)', 'data:image/svg+xml;base64,AAAA', 'http://example.com/x.png', 'https://user:password@example.com/x']) assert.equal(safeImageUrl(source), '');
  const section = createSection('image', 'image');
  section.title = '<script>bad</script>'; section.image = 'javascript:alert(1)';
  const output = renderWebsite('Site', { sections: [section], footer: '<img src=x>' });
  assert.ok(!output.includes('<script>'));
  assert.ok(!output.includes('javascript:'));
  assert.ok(output.includes('&lt;img'));
  assert.ok(output.includes('href="#image"'));
});

test('drafts recover independently from saved websites and handle unavailable storage', () => {
  const values = new Map();
  const storage = { getItem: key => values.get(key), setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
  const drafts = createDraftStorage(storage);
  assert.equal(drafts.save('site', normalizeWebsite({ headline: 'Recovered' })), true);
  assert.equal(drafts.load('site').headline, 'Recovered');
  assert.equal(drafts.load('another'), null);
  drafts.remove('site'); assert.equal(drafts.load('site'), null);
  const broken = createDraftStorage({ getItem() { throw Error(); }, setItem() { throw Error(); }, removeItem() { throw Error(); } });
  assert.equal(broken.save('site', {}), false);
  assert.equal(broken.load('site'), null);
});

test('each section renderer produces its own content in configured order', () => {
  const sections = ['contact', 'text', 'services', 'image'].map((type, index) => createSection(type, `s-${index}`));
  const output = renderWebsite('Site', { brand: 'My studio', navigationLabel: 'Contact us', footer: 'Custom footer', sections });
  assert.ok(output.indexOf('id="s-0"') < output.indexOf('id="s-1"'));
  for (const section of sections) assert.ok(output.includes(`id="${section.id}"`));
  assert.ok(output.includes('Custom footer'));
  assert.ok(output.includes('Contact us'));
});

test('saving separates the next typing group from earlier edits', () => {
  const history = createHistory({ title: 'Original' });
  history.record({ title: 'Saved' }, { group: 'title', time: 100 });
  history.checkpoint();
  history.record({ title: 'After save' }, { group: 'title', time: 150 });
  history.undo(); assert.equal(history.value.title, 'Saved');
});
