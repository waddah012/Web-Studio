import { normalizeWebsite } from './model.js';
import { renderWebsite } from './render.js';
import { templates } from './templates.js';
import { createSection, moveSection, safeImageUrl } from './sections.js';
import { renderSectionControls } from './section-controls.js';
import { createHistory } from './history.js';
import { find, downloadFile } from '../../shared/browser.js';

export function mountEditor({ store, notify, drafts }) {
  const editor = find('#website-editor');
  const form = find('#website-form');
  let projectId;
  let history;
  let saved;
  let draftFailed = false;
  const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const dirty = () => history && !equal(history.value, saved);
  const project = () => store.getProjects().find(item => item.id === projectId);

  function refreshPreview() {
    const website = history.value;
    find('#website-preview').srcdoc = renderWebsite(project().name, website);
    find('#undo-edit').disabled = !history.canUndo;
    find('#redo-edit').disabled = !history.canRedo;
    find('#add-section').disabled = website.sections.length >= 20;
    find('#discard-draft').disabled = !dirty();
    find('#editor-status').textContent = dirty()
      ? (draftFailed ? 'Unsaved changes · recovery unavailable; save or export your work' : 'Unsaved changes · recovery draft stored in this browser')
      : 'All changes saved';
  }

  function persistDraft() {
    if (dirty()) {
      draftFailed = !drafts.save(projectId, history.value);
      if (draftFailed) notify('Draft recovery is unavailable. Save or export your work before closing.');
    } else drafts.remove(projectId);
  }

  function change(next, group, redraw = false) {
    history.record(normalizeWebsite(next), { group });
    persistDraft();
    if (redraw) populate();
    else refreshPreview();
  }

  function populate() {
    const website = history.value;
    for (const [key, value] of Object.entries(website)) {
      const field = form.elements.namedItem(key);
      if (field) field.value = value;
    }
    renderSectionControls(find('#section-controls'), website.sections, {
      update(id, key, value) {
        const next = history.value;
        next.sections = next.sections.map(section => section.id === id ? { ...section, [key]: value } : section);
        change(next, `${id}:${key}`);
      },
      move(id, direction) {
        const next = history.value;
        next.sections = moveSection(next.sections, id, direction);
        change(next, undefined, true);
        find('#section-controls').querySelector(`[data-section-id="${id}"] button:not(:disabled)`)?.focus();
      },
      remove(id) {
        const next = history.value;
        next.sections = next.sections.filter(section => section.id !== id);
        change(next, undefined, true);
        find('#add-section').focus();
      },
      async upload(id, file) {
        const uploadingProjectId = projectId;
        try {
          if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 1_000_000) throw new Error('Choose a PNG, JPEG, or WebP image smaller than 1 MB.');
          const image = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error('Could not read this image.'));
            reader.readAsDataURL(file);
          });
          if (!editor.open || projectId !== uploadingProjectId) return;
          if (!safeImageUrl(image)) throw new Error('Could not use this image.');
          const next = history.value;
          next.sections = next.sections.map(section => section.id === id ? { ...section, image } : section);
          change(next, undefined, true);
        } catch (error) { notify(error.message); }
      },
    });
    refreshPreview();
  }

  function requestClose() {
    if (dirty() && !window.confirm(draftFailed
      ? 'Draft recovery is unavailable. Close and lose unsaved changes? Export or save first to keep your work.'
      : 'Close the editor? Your unsaved changes will be kept as a recovery draft.')) return;
    editor.close();
  }
  find('#close-editor').addEventListener('click', requestClose);
  editor.addEventListener('close', () => {
    const card = [...document.querySelectorAll('.project-card')].find(element => element.dataset.projectId === projectId);
    card?.querySelector('.build-project')?.focus();
  });
  editor.addEventListener('cancel', event => { event.preventDefault(); requestClose(); });
  window.addEventListener('beforeunload', event => {
    if (editor.open && dirty()) { event.preventDefault(); event.returnValue = ''; }
  });
  form.addEventListener('input', event => {
    const field = event.target;
    if (!field.name || field.name === 'template' || field.type === 'file') return;
    const next = history.value;
    next[field.name] = field.value;
    change(next, field.name);
  });
  form.elements.namedItem('template').addEventListener('change', event => {
    const selected = event.target.value;
    if (window.confirm('Replace the current page with this template? You can undo this change.')) change({ ...templates[selected], template: selected }, undefined, true);
    else event.target.value = history.value.template;
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    const persisted = store.saveWebsite(projectId, history.value);
    if (persisted) { saved = history.value; history.checkpoint(); drafts.remove(projectId); }
    refreshPreview();
  });
  find('#download-website').addEventListener('click', () => {
    if (!form.reportValidity()) return;
    downloadFile('index.html', renderWebsite(project().name, history.value), 'text/html');
  });
  for (const command of ['undo', 'redo']) find(`#${command}-edit`).addEventListener('click', () => {
    history[command](); persistDraft(); populate();
  });
  editor.addEventListener('keydown', event => {
    // Native text undo stays available; shortcuts apply to page actions outside inputs.
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'z' && !event.target.matches('input,textarea,select')) {
      event.preventDefault(); history[event.shiftKey ? 'redo' : 'undo'](); persistDraft(); populate();
    }
  });
  find('#discard-draft').addEventListener('click', () => {
    if (window.confirm('Discard your unsaved draft and return to the saved website?')) {
      history = createHistory(saved); drafts.remove(projectId); populate();
    }
  });
  find('#add-section').addEventListener('click', () => {
    const next = history.value;
    if (next.sections.length >= 20) return;
    next.sections.push(createSection(find('#section-type').value));
    change(next, undefined, true);
    find('#section-controls').lastElementChild?.querySelector('input')?.focus();
  });
  for (const mode of ['desktop', 'mobile']) find(`#${mode}-preview`).addEventListener('click', () => {
    find('#website-preview').classList.toggle('mobile-preview', mode === 'mobile');
    for (const option of ['desktop', 'mobile']) find(`#${option}-preview`).setAttribute('aria-pressed', String(option === mode));
  });
  return {
    open(id) {
      projectId = id;
      saved = normalizeWebsite(project().website);
      const recovered = drafts.load(id);
      history = createHistory(saved);
      if (recovered && !equal(recovered, saved)) history.record(recovered);
      draftFailed = false;
      find('#editor-title').textContent = project().name;
      populate();
      editor.showModal();
      if (dirty()) notify('Recovered your unsaved website draft. Save it or discard it to return to the saved page.');
    },
  };
}
