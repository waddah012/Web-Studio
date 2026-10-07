import test from 'node:test';
import assert from 'node:assert/strict';
import { filterProjects, loadProjects, starterProjects } from '../src/projects.js';
test('search is case insensitive and combines with status', () => {
  assert.equal(filterProjects(starterProjects, '  STUDIO ', 'In progress')[0].id, 'dashboard');
  assert.equal(filterProjects(starterProjects, 'portfolio', 'Ready').length, 0);
  assert.equal(filterProjects(starterProjects, '', 'Ready').length, 1);
});
test('invalid or inaccessible storage restores starter data', () => {
  for (const value of ['invalid', '{}', '[{"id":"broken"}]', 'null']) {
    assert.deepEqual(loadProjects({ getItem: () => value }), starterProjects);
  }
  assert.deepEqual(loadProjects({ getItem() { throw new Error('blocked'); } }), starterProjects);
});
test('valid saved projects and empty workspaces survive reload', () => {
  assert.deepEqual(loadProjects({ getItem: () => JSON.stringify(starterProjects.slice(0, 1)) }), starterProjects.slice(0, 1));
  assert.deepEqual(loadProjects({ getItem: () => '[]' }), []);
});
test('starter data is not mutated by workspace changes', () => {
  const loaded = loadProjects({ getItem: () => null });
  loaded[0].name = 'Changed';
  assert.equal(starterProjects[0].name, 'Personal portfolio');
});
