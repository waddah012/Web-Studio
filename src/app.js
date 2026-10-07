import { normalizeWebsite, renderWebsite, templates } from './website.js';
import { filterProjects } from './projects.js';
import { projectCard } from './components.js';
import { createProjectStore, parseBackup } from './store.js';
const find = selector => document.querySelector(selector);
let toastTimer;
function notify(message) {
  find('#toast').textContent = message;
  find('#toast').hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { find('#toast').hidden = true; }, 6000);
}
let storage;
try { storage = localStorage; } catch { storage = { getItem: () => null, setItem() { throw new Error('Storage unavailable'); } }; }
const store = createProjectStore(storage, { onStorageError: notify });
let filter = 'All';
let editingId = null;
const dialog = find('#project-dialog');
const form = find('#project-form');
function setFilter(next) {
  filter = next;
  document.querySelectorAll('[data-filter]').forEach(tab => {
    tab.classList.toggle('selected', tab.dataset.filter === filter);
    tab.setAttribute('aria-pressed', String(tab.dataset.filter === filter));
  });
}
function openProject(projectId = null) {
  editingId = projectId;
  form.reset();
  find('#form-error').hidden = true;
  find('#delete-project').hidden = !projectId;
  find('#dialog-title').textContent = projectId ? 'Edit your project' : 'Start something new';
  find('#save-project').textContent = projectId ? 'Save changes ↗' : 'Create project ↗';
  if (projectId) {
    const project = store.getProjects().find(item => item.id === projectId);
    for (const field of ['name', 'description', 'type']) form.elements.namedItem(field).value = project[field];
  }
  dialog.showModal();
}
function render() {
  const projects = store.getProjects();
  const visible = filterProjects(projects, find('#search').value, filter);
  if (find('#sort-projects').value === 'name') visible.sort((a, b) => a.name.localeCompare(b.name));
  find('#project-grid').replaceChildren(...visible.map(project => projectCard(project, id => {
    store.toggle(id);
    const replacement = [...document.querySelectorAll('.project-action')].find(button => button.getAttribute('aria-label').endsWith(`: ${project.name}`));
    replacement?.focus();
  }, openProject, openWebsite)));
  find('#empty-state').hidden = visible.length > 0;
  find('#total-count').textContent = projects.length;
  find('#project-count').textContent = projects.length;
  find('#active-count').textContent = projects.filter(item => item.status === 'In progress').length;
  find('#ready-count').textContent = projects.filter(item => item.status === 'Ready').length;
}
store.subscribe(render);
for (const selector of ['#new-project', '#start-building']) find(selector).addEventListener('click', () => openProject());
find('#close-dialog').addEventListener('click', () => dialog.close());
find('#search').addEventListener('input', render);
find('#sort-projects').addEventListener('change', render);
document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => { setFilter(button.dataset.filter); render(); }));
form.addEventListener('submit', event => {
  event.preventDefault();
  try {
    const input = Object.fromEntries(new FormData(form));
    if (editingId) store.update(editingId, input);
    else { setFilter('All'); find('#search').value = ''; store.create(input); }
    dialog.close();
  } catch (error) { find('#form-error').textContent = error.message; find('#form-error').hidden = false; }
});
find('#delete-project').addEventListener('click', () => {
  if (window.confirm('Delete this project? Export a backup first if you want to keep a copy.')) { store.remove(editingId); dialog.close(); }
});
find('#export-projects').addEventListener('click', () => {
  const url = URL.createObjectURL(new Blob([store.export()], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url; link.download = 'web-studio-backup.json'; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
find('#import-projects').addEventListener('click', () => find('#backup-file').click());
find('#backup-file').addEventListener('change', async event => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    if (file.size > 2_000_000) throw new Error('Choose a backup smaller than 2 MB.');
    const text = await file.text();
    parseBackup(text);
    if (window.confirm('Replace this workspace with the imported backup? Export your current projects first to keep them.')) {
      setFilter('All'); find('#search').value = ''; store.restore(text);
    }
  } catch (error) { notify(error.message); }
  finally { event.target.value = ''; }
});
const editor = find('#website-editor');
const websiteForm = find('#website-form');
let websiteProjectId;
function websiteInput() { return normalizeWebsite(Object.fromEntries(new FormData(websiteForm))); }
function updatePreview() {
  const project = store.getProjects().find(item => item.id === websiteProjectId);
  find('#website-preview').srcdoc = renderWebsite(project.name, websiteInput());
  find('#editor-status').textContent = 'Preview updated · save to keep your changes';
}
function populateWebsite(value) {
  const website = normalizeWebsite(value);
  for (const [key, content] of Object.entries(website)) websiteForm.elements.namedItem(key).value = content;
  updatePreview();
}
function openWebsite(id) {
  websiteProjectId = id;
  const project = store.getProjects().find(item => item.id === id);
  find('#editor-title').textContent = project.name;
  populateWebsite(project.website);
  editor.showModal();
}
find('#close-editor').addEventListener('click', () => editor.close());
websiteForm.addEventListener('input', updatePreview);
websiteForm.elements.namedItem('template').addEventListener('change', event => {
  if (window.confirm('Replace the page content with this template?')) populateWebsite({ ...templates[event.target.value], template: event.target.value });
});
websiteForm.addEventListener('submit', event => {
  event.preventDefault();
  store.saveWebsite(websiteProjectId, websiteInput());
  find('#editor-status').textContent = 'Website saved in this workspace';
});
find('#download-website').addEventListener('click', () => {
  if (!websiteForm.reportValidity()) return;
  const project = store.getProjects().find(item => item.id === websiteProjectId);
  const url = URL.createObjectURL(new Blob([renderWebsite(project.name, websiteInput())], { type: 'text/html' }));
  const link = document.createElement('a'); link.href = url; link.download = 'index.html'; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
for (const mode of ['desktop', 'mobile']) find(`#${mode}-preview`).addEventListener('click', () => {
  find('#website-preview').classList.toggle('mobile-preview', mode === 'mobile');
  for (const option of ['desktop', 'mobile']) find(`#${option}-preview`).setAttribute('aria-pressed', String(option === mode));
});
render();
