import { normalizeWebsite } from './model.js';
import { renderWebsite } from './render.js';
import { templates } from './templates.js';
import { find, downloadFile } from '../../shared/browser.js';

export function mountEditor({ store, notify }) {
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
    downloadFile('index.html', renderWebsite(project.name, websiteInput()), 'text/html');
  });
  for (const mode of ['desktop', 'mobile']) find(`#${mode}-preview`).addEventListener('click', () => {
    find('#website-preview').classList.toggle('mobile-preview', mode === 'mobile');
    for (const option of ['desktop', 'mobile']) find(`#${option}-preview`).setAttribute('aria-pressed', String(option === mode));
  });
  return { open: openWebsite };
}
