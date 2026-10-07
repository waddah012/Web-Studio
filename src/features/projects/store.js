import { normalizeWebsite } from '../editor/model.js';
import { isProject } from './model.js';
import { loadProjects, STORAGE_KEY } from '../../infrastructure/project-storage.js';
export const PROJECT_TYPES = ['Website', 'Application', 'Design system'];
export function validateInput(input) {
  const name = String(input.name ?? '').trim();
  const description = String(input.description ?? '').trim();
  if (!name || name.length > 60) throw new Error('Use a project name between 1 and 60 characters.');
  if (!description || description.length > 180) throw new Error('Use a description between 1 and 180 characters.');
  if (!PROJECT_TYPES.includes(input.type)) throw new Error('Choose a supported project type.');
  return { name, description, type: input.type };
}
export function parseBackup(text) {
  const data = JSON.parse(text);
  if (!Array.isArray(data) && (!data || data.version !== 1)) throw new Error('Unsupported backup version.');
  const projects = Array.isArray(data) ? data : data.projects;
  if (!Array.isArray(projects) || projects.length > 1000 || !projects.every(isProject)) throw new Error('Choose a valid Web Studio backup with at most 1,000 projects.');
  if (new Set(projects.map(project => project.id)).size !== projects.length) throw new Error('Backup contains duplicate project identifiers.');
  return structuredClone(projects);
}
export function createProjectStore(storage, { onStorageError = () => {}, id = () => crypto.randomUUID() } = {}) {
  let projects = loadProjects(storage);
  const listeners = new Set();
  function commit(next) {
    projects = next;
    try { storage.setItem(STORAGE_KEY, JSON.stringify(projects)); }
    catch { onStorageError('Changes could not be saved. Export a backup before closing this tab.'); }
    for (const listener of listeners) listener();
  }
  return {
    getProjects: () => structuredClone(projects),
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    create(input) {
      const fields = validateInput(input);
      const project = { ...fields, id: id(), status: 'In progress', theme: ['lavender', 'peach', 'green'][projects.length % 3], symbol: '✳' };
      commit([project, ...projects]);
      return project.id;
    },
    update(projectId, input) {
      const fields = validateInput(input);
      if (!projects.some(project => project.id === projectId)) throw new Error('This project no longer exists.');
      commit(projects.map(project => project.id === projectId ? { ...project, ...fields } : project));
    },
    saveWebsite(projectId, website) {
      if (!projects.some(project => project.id === projectId)) throw new Error('This project no longer exists.');
      commit(projects.map(project => project.id === projectId ? { ...project, website: normalizeWebsite(website) } : project));
    },
    toggle(projectId) { commit(projects.map(project => project.id === projectId ? { ...project, status: project.status === 'Ready' ? 'In progress' : 'Ready' } : project)); },
    remove(projectId) { commit(projects.filter(project => project.id !== projectId)); },
    restore(text) { commit(parseBackup(text)); },
    export() { return JSON.stringify({ version: 1, projects }, null, 2); },
  };
}
