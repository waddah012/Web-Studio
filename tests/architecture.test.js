import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';

async function files(directory) {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = `${directory}/${entry.name}`;
    if (entry.isDirectory()) result.push(...await files(path));
    else if (path.endsWith('.js')) result.push(path);
  }
  return result;
}

test('browser modules resolve imports inside the shipped source tree', async () => {
  const sourceFiles = await files('src');
  const available = new Set(sourceFiles.map(path => resolve(path)));
  for (const path of sourceFiles) {
    const source = await readFile(path, 'utf8');
    for (const match of source.matchAll(/from\s+['"]([^'"]+)['"]/g)) {
      assert.ok(available.has(resolve(dirname(path), match[1])), `${path}: missing ${match[1]}`);
    }
  }
});

test('pure feature models do not depend on browser or infrastructure modules', async () => {
  for (const path of ['src/features/projects/model.js', 'src/features/editor/model.js', 'src/features/editor/templates.js', 'src/features/editor/render.js']) {
    const source = await readFile(path, 'utf8');
    assert.doesNotMatch(source, /\b(document|window|localStorage)\b|from ['"].*(infrastructure|controller|browser)/, path);
  }
});
