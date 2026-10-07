import { isProject, starterProjects } from '../features/projects/model.js';

export const STORAGE_KEY = 'web-studio-projects';

export function loadProjects(storage) {
  try {
    const value = JSON.parse(storage.getItem(STORAGE_KEY));
    if (Array.isArray(value) && value.every(isProject) && new Set(value.map(project => project.id)).size === value.length) return value;
  } catch { /* Fall back to the starter workspace when saved data is unavailable. */ }
  return structuredClone(starterProjects);
}

export function browserStorage() {
  try { return localStorage; }
  catch {
    return { getItem: () => null, setItem() { throw new Error('Storage unavailable'); } };
  }
}
