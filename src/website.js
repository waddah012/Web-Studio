export const templates = {
  studio: { headline: 'Thoughtful websites. Lasting impressions.', tagline: 'Independent digital studio', description: 'We bring ambitious brands to life through strategy, design, and development.', button: 'Start a conversation', email: 'hello@example.com', accent: '#c8e69e', background: '#f6f7f0' },
  portfolio: { headline: 'Designing what comes next.', tagline: 'Designer & developer', description: 'A selection of digital experiences built with curiosity, care, and a love for the details.', button: 'Let’s work together', email: 'hello@example.com', accent: '#cfc0f0', background: '#f6f3fa' },
  product: { headline: 'Your best work starts here.', tagline: 'A simpler way to work', description: 'Bring your team, projects, and ideas together in one beautifully simple workspace.', button: 'Get in touch', email: 'hello@example.com', accent: '#f0c399', background: '#faf5ee' },
};
export function normalizeWebsite(value = {}) {
  if (!value || typeof value !== 'object') value = {};
  const base = templates[value.template] || templates.studio;
  const result = { template: Object.hasOwn(templates, value.template) ? value.template : 'studio' };
  for (const key of ['headline', 'tagline', 'description', 'button', 'email']) result[key] = typeof value[key] === 'string' ? value[key].slice(0, key === 'description' ? 500 : 120) : base[key];
  for (const key of ['accent', 'background']) result[key] = /^#[0-9a-f]{6}$/i.test(value[key]) ? value[key] : base[key];
  return result;
}
export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
}
export function renderWebsite(name, input) {
  const website = normalizeWebsite(input);
  const text = key => escapeHtml(website[key]);
  const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(website.email) ? website.email : 'hello@example.com';
  return `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="${text('description')}"><title>${escapeHtml(name)}</title><style>*{box-sizing:border-box}body{margin:0;background:${website.background};color:#242a24;font-family:system-ui,sans-serif}nav,main,footer{max-width:1100px;margin:auto;padding:30px 7%}nav{display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #242a2415}a{color:inherit}nav a{text-decoration:none;font-size:14px}main{padding-top:90px;padding-bottom:90px}.tagline{font-size:12px;text-transform:uppercase;letter-spacing:3px}h1{font-size:clamp(40px,7vw,80px);line-height:1.08;letter-spacing:-3px;max-width:850px;margin:28px 0}p{max-width:580px;line-height:1.8;color:#545e54}.cta{display:inline-block;padding:17px 24px;border-radius:8px;background:${website.accent};text-decoration:none;color:#242a24;font-weight:600;margin-top:20px}.services{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:80px}.services article{border-top:1px solid #242a2430;padding-top:20px}.services span{font-size:12px;color:#626b60}.services h2{font-size:20px}footer{border-top:1px solid #242a2420;display:flex;justify-content:space-between;font-size:12px;color:#667060}@media(max-width:600px){main{padding-top:55px}.services{grid-template-columns:1fr;margin-top:50px}h1{letter-spacing:-2px}footer{gap:20px}}</style></head><body><nav><strong>${escapeHtml(name)}</strong><a href="mailto:${escapeHtml(email)}">Let’s talk ↗</a></nav><main><div class="tagline">${text('tagline')}</div><h1>${text('headline')}</h1><p>${text('description')}</p><a class="cta" href="mailto:${escapeHtml(email)}">${text('button')} ↗</a><section class="services" aria-label="Our approach"><article><span>01 / STRATEGY</span><h2>Start with purpose.</h2><p>Clear thinking gives every great experience a strong foundation.</p></article><article><span>02 / DESIGN</span><h2>Make it meaningful.</h2><p>Thoughtful details bring your story into focus.</p></article><article><span>03 / DEVELOPMENT</span><h2>Build to last.</h2><p>Responsive experiences that work beautifully on every screen.</p></article></section></main><footer><span>${escapeHtml(name)}</span><span>Made with care.</span></footer></body></html>`;
}
