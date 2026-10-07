import test from 'node:test';
import assert from 'node:assert/strict';
import { createProjectStore, parseBackup } from '../src/store.js';
const input = { name: ' New project ', description: ' A useful app ', type: 'Application' };
function setup() {
  let saved = '[]';
  const storage = { getItem: () => saved, setItem: (_, value) => { saved = value; } };
  return createProjectStore(storage, { id: () => 'test-project' });
}
test('project lifecycle persists valid changes and isolates snapshots', () => {
  const store = setup();
  let notifications = 0;
  const unsubscribe = store.subscribe(() => notifications++);
  const id = store.create(input);
  assert.equal(store.getProjects()[0].name, 'New project');
  const snapshot = store.getProjects(); snapshot[0].name = 'Mutated';
  assert.equal(store.getProjects()[0].name, 'New project');
  store.update(id, { ...input, name: 'Updated' });
  store.toggle(id);
  assert.equal(store.getProjects()[0].status, 'Ready');
  assert.equal(parseBackup(store.export())[0].name, 'Updated');
  store.remove(id);
  assert.deepEqual(store.getProjects(), []);
  assert.equal(notifications, 4);
  unsubscribe(); store.restore('[]'); assert.equal(notifications, 4);
});
test('invalid writes and imports leave the workspace intact', () => {
  const store = setup(); store.create(input);
  for (const invalid of [{ ...input, name: ' ' }, { ...input, type: 'Unknown' }, { ...input, description: 'x'.repeat(181) }]) assert.throws(() => store.create(invalid));
  assert.throws(() => store.restore('{broken'));
  assert.throws(() => store.restore('[{}]'));
  const project = store.getProjects()[0];
  assert.throws(() => parseBackup(JSON.stringify([project, project])), /duplicate/);
  assert.equal(store.getProjects().length, 1);
});
test('storage failures report recovery guidance and preserve session changes', () => {
  let message;
  const store = createProjectStore({ getItem: () => '[]', setItem() { throw Error('Full'); } }, { id: () => 'id', onStorageError: value => { message = value; } });
  store.create(input);
  assert.match(message, /Export a backup/);
  assert.equal(store.getProjects().length, 1);
});
