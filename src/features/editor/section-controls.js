import { SECTION_TYPES } from './sections.js';

function field(labelText, value, onInput, { multiline = false, hint = '' } = {}) {
  const label = document.createElement('label');
  label.append(document.createTextNode(labelText));
  const input = document.createElement(multiline ? 'textarea' : 'input');
  input.value = value;
  input.setAttribute('aria-label', labelText);
  input.maxLength = multiline ? 2000 : (labelText === 'Image URL' ? 2000 : labelText === 'Section title' ? 120 : 180);
  if (multiline) input.rows = 3;
  input.addEventListener('input', () => onInput(input.value));
  label.append(input);
  if (hint) {
    const small = document.createElement('small');
    small.textContent = hint;
    label.append(small);
  }
  return label;
}

export function renderSectionControls(container, sections, { update, move, remove, upload }) {
  container.replaceChildren();
  for (const [index, section] of sections.entries()) {
    const card = document.createElement('fieldset');
    card.className = 'section-control';
    card.dataset.sectionId = section.id;
    const legend = document.createElement('legend');
    legend.textContent = `${index + 1}. ${section.type[0].toUpperCase() + section.type.slice(1)} section`;
    card.append(legend);
    card.append(field('Section title', section.title, value => update(section.id, 'title', value)));
    card.append(field(section.type === 'services' ? 'Services' : 'Section content', section.body, value => update(section.id, 'body', value), {
      multiline: true,
      hint: section.type === 'services' ? 'One service per line: title | description' : '',
    }));
    if (section.type === 'image') {
      card.append(field('Image URL', section.image.startsWith('data:') ? '' : section.image, value => update(section.id, 'image', value), { hint: 'Use an HTTPS URL, or upload an image to embed it in the exported file.' }));
      card.append(field('Image description', section.alt, value => update(section.id, 'alt', value), { hint: 'Describe the image for visitors using a screen reader.' }));
      const label = document.createElement('label');
      label.textContent = section.image.startsWith('data:') ? 'Replace uploaded image' : 'Upload image';
      const file = document.createElement('input');
      file.type = 'file';
      file.accept = 'image/png,image/jpeg,image/webp';
      file.addEventListener('change', async () => {
        if (file.files[0]) await upload(section.id, file.files[0]);
        file.value = '';
      });
      label.append(file);
      card.append(label);
    }
    const actions = document.createElement('div');
    actions.className = 'section-actions';
    for (const [text, action, disabled] of [
      ['Move up', () => move(section.id, -1), index === 0],
      ['Move down', () => move(section.id, 1), index === sections.length - 1],
      ['Remove', () => remove(section.id), false],
    ]) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'tool-button';
      button.textContent = text;
      button.setAttribute('aria-label', `${text} ${section.type} section ${index + 1}`);
      button.disabled = disabled;
      button.addEventListener('click', action);
      actions.append(button);
    }
    card.append(actions);
    container.append(card);
  }
  if (!sections.length) {
    const empty = document.createElement('p');
    empty.textContent = 'No extra sections. Add one below to build out your page.';
    container.append(empty);
  }
}

export function isSectionType(value) { return SECTION_TYPES.includes(value); }
