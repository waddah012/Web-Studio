export const SECTION_TYPES = ['text', 'services', 'image', 'contact'];
export const defaultSections = [
  { id: 'approach', type: 'services', title: 'Our approach', body: 'Strategy | Clear thinking gives every great experience a strong foundation.\nDesign | Thoughtful details bring your story into focus.\nDevelopment | Responsive experiences that work beautifully on every screen.', image: '', alt: '' },
];

export function safeImageUrl(value) {
  if (typeof value !== 'string') return '';
  if (/^data:image\/(png|jpeg|webp);base64,[a-z0-9+/=]+$/i.test(value) && value.length <= 1_500_000) return value;
  try {
    const url = new URL(value);
    if (url.protocol === 'https:' && !url.username && !url.password && value.length <= 2000) return url.href;
  } catch { /* An empty or invalid image is rendered as a placeholder. */ }
  return '';
}

export function normalizeSections(value) {
  if (!Array.isArray(value)) return structuredClone(defaultSections);
  const usedIds = new Set();
  return value.slice(0, 20).filter(section => section && SECTION_TYPES.includes(section.type)).map((section, index) => {
    let id = typeof section.id === 'string' && /^[a-zA-Z0-9-]{1,80}$/.test(section.id) ? section.id : `section-${index}`;
    while (usedIds.has(id)) id = `${id.slice(0, 65)}-${index}`;
    usedIds.add(id);
    return {
      id,
      type: section.type,
      title: typeof section.title === 'string' ? section.title.slice(0, 120) : 'New section',
      body: typeof section.body === 'string' ? section.body.slice(0, 2000) : '',
      image: safeImageUrl(section.image),
      alt: typeof section.alt === 'string' ? section.alt.slice(0, 180) : '',
    };
  });
}

export function createSection(type, id = crypto.randomUUID()) {
  if (!SECTION_TYPES.includes(type)) throw new Error('Unknown section type.');
  const defaults = {
    text: { title: 'About us', body: 'Tell visitors what makes your work special.' },
    services: { title: 'What we do', body: 'Design | Thoughtful experiences for your audience.\nDevelopment | Reliable websites that grow with you.' },
    image: { title: 'Featured work', body: 'A closer look at our latest project.' },
    contact: { title: 'Let’s make something great.', body: 'Have a project in mind? We would love to hear from you.' },
  };
  return { id, type, ...defaults[type], image: '', alt: '' };
}

export function moveSection(sections, id, direction) {
  const result = structuredClone(sections);
  const index = result.findIndex(section => section.id === id);
  const target = index + direction;
  if (index >= 0 && target >= 0 && target < result.length) [result[index], result[target]] = [result[target], result[index]];
  return result;
}
