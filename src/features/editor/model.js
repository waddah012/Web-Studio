import { normalizeSections } from './sections.js';
import { templates } from './templates.js';

export function normalizeWebsite(value = {}) {
  if (!value || typeof value !== 'object') value = {};
  const base = Object.hasOwn(templates, value.template) ? templates[value.template] : templates.studio;
  const result = { template: Object.hasOwn(templates, value.template) ? value.template : 'studio' };
  for (const key of ['headline', 'tagline', 'description', 'button', 'email', 'brand', 'navigationLabel', 'footer']) result[key] = typeof value[key] === 'string' ? value[key].slice(0, key === 'description' ? 500 : 120) : (base[key] ?? { brand: '', navigationLabel: 'Let’s talk', footer: 'Made with care.' }[key]);
  for (const key of ['accent', 'background']) result[key] = /^#[0-9a-f]{6}$/i.test(value[key]) ? value[key] : (base[key] ?? { brand: '', navigationLabel: 'Let’s talk', footer: 'Made with care.' }[key]);
  result.sections = normalizeSections(value.sections);
  return result;
}
