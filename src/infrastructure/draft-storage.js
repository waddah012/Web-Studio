import { normalizeWebsite } from '../features/editor/model.js';

export function createDraftStorage(storage) {
  const key = id => `web-studio-draft:${id}`;
  return {
    load(id) {
      try {
        const value = JSON.parse(storage.getItem(key(id)));
        return value?.version === 1 && value.website ? normalizeWebsite(value.website) : null;
      } catch { return null; }
    },
    save(id, website) {
      try {
        storage.setItem(key(id), JSON.stringify({ version: 1, updatedAt: new Date().toISOString(), website }));
        return true;
      } catch { return false; }
    },
    remove(id) {
      try { storage.removeItem(key(id)); return true; }
      catch { return false; }
    },
  };
}
