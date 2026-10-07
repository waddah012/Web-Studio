import { filterProjects } from './model.js';
import { projectCard } from './card.js';
import { parseBackup } from './store.js';
import { find, downloadFile } from '../../shared/browser.js';

export function mountWorkspace({ store, notify, onOpenWebsite }) {
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
    }, openProject, onOpenWebsite)));
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
    downloadFile('web-studio-backup.json', store.export(), 'application/json');
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
  render();
}
