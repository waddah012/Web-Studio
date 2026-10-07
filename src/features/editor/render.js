import { normalizeWebsite } from './model.js';

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
}

function renderSection(section, email, button) {
  const title = `<h2>${escapeHtml(section.title)}</h2>`;
  const body = `<p>${escapeHtml(section.body)}</p>`;
  const renderers = {
    text: () => title + body,
    services: () => title + `<div class="services">${section.body.split('\n').filter(line => line.trim()).slice(0, 12).map(line => {
      const [heading, ...description] = line.split('|');
      return `<article><h3>${escapeHtml(heading.trim())}</h3><p>${escapeHtml(description.join('|').trim())}</p></article>`;
    }).join('')}</div>`,
    image: () => title + (section.image ? `<img src="${escapeHtml(section.image)}" alt="${escapeHtml(section.alt)}" loading="lazy" referrerpolicy="no-referrer">` : '<div class="image-placeholder">Add an image to feature your work.</div>') + body,
    contact: () => title + body + `<a class="cta" href="mailto:${escapeHtml(email)}">${escapeHtml(button)} ↗</a>`,
  };
  return `<section id="${escapeHtml(section.id)}" class="page-section ${section.type}">${renderers[section.type]()}</section>`;
}

export function renderWebsite(name, input) {
  const website = normalizeWebsite(input);
  const text = key => escapeHtml(website[key]);
  const email = /^[a-z0-9._+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(website.email) ? website.email : 'hello@example.com';
  const brand = escapeHtml(website.brand || name);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="description" content="${text('description')}">
<title>${brand}</title>
<style>
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:${website.background};color:#242a24;font-family:system-ui,sans-serif}
nav,main,footer{max-width:1100px;margin:auto;padding:30px 7%}nav{display:flex;justify-content:space-between;align-items:center;gap:24px;border-bottom:1px solid #242a2415;flex-wrap:wrap}
.nav-links{display:flex;gap:20px;flex-wrap:wrap}a{color:inherit}a:focus-visible{outline:3px solid #242a24;outline-offset:5px}nav a{text-decoration:none;font-size:14px}
main{padding-top:90px;padding-bottom:90px}.tagline{font-size:12px;text-transform:uppercase;letter-spacing:3px}h1{font-size:clamp(40px,7vw,80px);line-height:1.08;letter-spacing:-3px;max-width:850px;margin:28px 0}
h2{font-size:clamp(26px,4vw,40px);letter-spacing:-1px}p{max-width:680px;line-height:1.8;color:#545e54;white-space:pre-line;overflow-wrap:anywhere}.cta{display:inline-block;padding:17px 24px;border-radius:8px;background:${website.accent};text-decoration:none;color:#242a24;font-weight:600;margin-top:20px}
.page-section{margin-top:80px;scroll-margin-top:25px}.services{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}.services article{border-top:1px solid #242a2430;padding-top:20px}.services h3{font-size:20px}img{display:block;max-width:100%;height:auto;border-radius:12px}.image-placeholder{padding:70px 25px;background:#242a2408;border:1px dashed #242a2440;border-radius:12px;text-align:center}
footer{border-top:1px solid #242a2420;display:flex;justify-content:space-between;font-size:12px;color:#667060;gap:20px;flex-wrap:wrap}h1,h2,h3{overflow-wrap:anywhere}
@media(max-width:600px){main{padding-top:55px}.services{grid-template-columns:1fr}.page-section{margin-top:50px}h1{letter-spacing:-2px}.nav-links{gap:12px}}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}
</style>
</head>
<body>
<nav aria-label="Main navigation"><strong>${brand}</strong><div class="nav-links">${website.sections.map(section => `<a href="#${escapeHtml(section.id)}">${escapeHtml(section.title)}</a>`).join('')}<a href="mailto:${escapeHtml(email)}">${text('navigationLabel')} ↗</a></div></nav>
<main><header><div class="tagline">${text('tagline')}</div><h1>${text('headline')}</h1><p>${text('description')}</p><a class="cta" href="mailto:${escapeHtml(email)}">${text('button')} ↗</a></header>
${website.sections.map(section => renderSection(section, email, website.button)).join('\n')}
</main>
<footer><span>${brand}</span><span>${text('footer')}</span></footer>
</body>
</html>`;
}
