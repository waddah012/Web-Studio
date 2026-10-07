import { filterProjects, loadProjects } from './projects.js';
import { projectCard } from './components.js';
let projects;
try { projects = loadProjects(localStorage); } catch { projects = loadProjects({ getItem: () => null }); }
let filter = 'All';
const find = selector => document.querySelector(selector);
let toastTimer;
function notify(message) {
  find('#toast').textContent = message;
  find('#toast').hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { find('#toast').hidden = true; }, 3500);
}
function save() {
  try { localStorage.setItem('web-studio-projects', JSON.stringify(projects)); }
  catch { notify('Changes are available this session. Browser storage is unavailable.'); }
}
function render() {
  const visible = filterProjects(projects, find('#search').value, filter);
  find('#project-grid').replaceChildren(...visible.map(project => projectCard(project, id => {
    projects = projects.map(item => item.id === id ? { ...item, status: item.status === 'Ready' ? 'In progress' : 'Ready' } : item);
    save(); render();
  })));
  find('#empty-state').hidden = visible.length > 0;
  find('#total-count').textContent = projects.length;
  find('#project-count').textContent = projects.length;
  find('#active-count').textContent = projects.filter(item => item.status === 'In progress').length;
  find('#ready-count').textContent = projects.filter(item => item.status === 'Ready').length;
}
const dialog = find('#project-dialog');
for (const selector of ['#new-project', '#start-building']) find(selector).addEventListener('click', () => dialog.showModal());
find('#close-dialog').addEventListener('click', () => dialog.close());
find('#search').addEventListener('input', render);
document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
  filter = button.dataset.filter;
  document.querySelectorAll('[data-filter]').forEach(tab => {
    tab.classList.toggle('selected', tab === button);
    tab.setAttribute('aria-pressed', String(tab === button));
  });
  render();
}));
find('#project-form').addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const name = data.get('name').trim();
  const description = data.get('description').trim();
  if (!name || !description) { notify('Enter a project name and description.'); return; }
  projects.unshift({ id: crypto.randomUUID(), name, description, type: data.get('type'), status: 'In progress', theme: ['lavender', 'peach', 'green'][projects.length % 3], symbol: '✳' });
  filter = 'All';
  find('#search').value = '';
  document.querySelectorAll('[data-filter]').forEach(tab => {
    tab.classList.toggle('selected', tab.dataset.filter === 'All');
    tab.setAttribute('aria-pressed', String(tab.dataset.filter === 'All'));
  });
  save(); render(); form.reset(); dialog.close(); notify('Project created. Let’s get building.');
});
render();
