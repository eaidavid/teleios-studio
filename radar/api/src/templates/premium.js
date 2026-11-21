// Motor de páginas premium das prévias.
// O Claude define a direção (tema), escreve os textos e escolhe as seções; aqui viram uma página
// com acabamento de estúdio, animada com o Teleios Motion Kit, responsiva e com dados reais do lead.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const CSS = readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), 'premium.css'), 'utf8');

/* Fontes permitidas (todas testadas no Google Fonts) */
export const FONTS = {
  'Fraunces': ['Fraunces:ital,wght@0,300..700;1,300..700', 'serif'],
  'Instrument Serif': ['Instrument+Serif:ital@0;1', 'serif'],
  'Cormorant Garamond': ['Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400', 'serif'],
  'Playfair Display': ['Playfair+Display:ital,wght@0,400..800;1,400', 'serif'],
  'DM Serif Display': ['DM+Serif+Display:ital@0;1', 'serif'],
  'Plus Jakarta Sans': ['Plus+Jakarta+Sans:ital,wght@0,300..800;1,400', 'sans-serif'],
  'Sora': ['Sora:wght@300..700', 'sans-serif'],
  'Manrope': ['Manrope:wght@300..700', 'sans-serif'],
  'Inter': ['Inter:wght@300..700', 'sans-serif'],
  'DM Sans': ['DM+Sans:ital,wght@0,300..700;1,400', 'sans-serif'],
  'Outfit': ['Outfit:wght@300..700', 'sans-serif'],
  'Figtree': ['Figtree:wght@300..800', 'sans-serif'],
  'Work Sans': ['Work+Sans:wght@300..700', 'sans-serif'],
  'Bricolage Grotesque': ['Bricolage+Grotesque:wght@300..800', 'sans-serif'],
  'Space Grotesk': ['Space+Grotesk:wght@300..700', 'sans-serif'],
  'Archivo': ['Archivo:wght@300..800', 'sans-serif'],
  'Unbounded': ['Unbounded:wght@300..800', 'sans-serif'],
  'Syne': ['Syne:wght@400..800', 'sans-serif'],
  'JetBrains Mono': ['JetBrains+Mono:wght@400;500', 'monospace'],
};
export const MOTIFS = ['regua', 'ponto', 'linha', 'arco', 'cruz'];
export const TEXTURES = ['ripado', 'grao', 'grade', 'linhas', 'nenhuma'];
export const SECTION_TYPES = ['topo', 'numeros', 'dores', 'sobre', 'manifesto', 'cartaz', 'servicos', 'empilhados', 'galeria', 'processo', 'comparacao', 'depoimentos', 'faixa', 'faq', 'local', 'chamada', 'html'];

/* ---------- utilidades ---------- */
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// títulos aceitam <em> e <strong>
const rich = (s) => esc(s).replace(/&lt;(\/?)(em|strong|br)&gt;/g, '<$1$2>');
const has = (v) => v !== undefined && v !== null && String(v).trim() !== '';
const hex = (h) => /^#[0-9a-f]{6}$/i.test(String(h || '').trim()) ? String(h).trim() : null;
function readable(h) {
  const c = hex(h) || '#000000';
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
  return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? '#141414' : '#FFFFFF';
}
const digits = (p) => String(p || '').replace(/\D/g, '');
function waLink(phone, text) {
  let d = digits(phone);
  if (!d) return null;
  if (d.length <= 11) d = `55${d}`;
  return `https://wa.me/${d}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
}
const I = {
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  ne: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>',
  wa: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.5-.3Z"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 21s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z"/><circle cx="12" cy="9" r="2.5"/></svg>',
  phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>',
  route: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M3 11 21 3l-8 18-2-8-8-2Z"/></svg>',
  ig: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/></svg>',
};

/* ---------- tema ---------- */
function theme(t = {}, lead) {
  const pal = lead.palette || ['#F4EFE8', '#2B2118', '#B07A4A'];
  const bg = hex(t.fundo) || pal[0];
  const ink = hex(t.tinta) || pal[1];
  const accent = hex(t.acento) || pal[2];
  const display = FONTS[t.fonte_titulo] ? t.fonte_titulo : 'Plus Jakarta Sans';
  const body = FONTS[t.fonte_texto] ? t.fonte_texto : 'Inter';
  const acc = FONTS[t.fonte_destaque] ? t.fonte_destaque : null;
  const radius = { reto: [2, 2, 2], suave: [12, 20, 999], redondo: [20, 28, 999] }[t.raio] || [12, 22, 999];
  return {
    display, body, acc,
    motif: MOTIFS.includes(t.motivo) ? t.motivo : 'linha',
    texture: TEXTURES.includes(t.textura) ? t.textura : 'nenhuma',
    motion: ['sutil', 'equilibrado', 'marcante'].includes(t.movimento) ? t.movimento : 'equilibrado',
    vars: {
      '--bg': bg, '--bg-alt': hex(t.fundo_alt) || `color-mix(in srgb, ${ink} 5%, ${bg})`, '--ink': ink,
      '--ink-soft': hex(t.tinta_suave) || `color-mix(in srgb, ${ink} 62%, ${bg})`, '--accent': accent, '--on-accent': readable(accent),
      '--f-display': `'${display}', ${FONTS[display][1]}`, '--f-body': `'${body}', ${FONTS[body][1]}`,
      ...(acc ? { '--f-accent': `'${acc}', ${FONTS[acc][1]}` } : {}),
      '--w-display': String(t.peso_titulo || 300), '--w-strong': String(t.peso_forte || 600),
      '--track': t.peso_titulo >= 600 ? '-.045em' : '-.035em',
      '--r': `${radius[0]}px`, '--r-lg': `${radius[1]}px`, '--r-btn': `${radius[2]}px`, '--ease': 'cubic-bezier(.2,.8,.2,1)',
    },
  };
}

export function renderPremium(spec, lead, { agencyWa = '5515981763815' } = {}) {
  const th = theme(spec.tema, lead);
  const name = spec.marca?.nome || lead.brandName || lead.name;
  const realPhotos = [...new Set([...(spec.fotos || []), ...(lead.gallery || []), ...(lead.sitePhotos || [])].filter((u) => /^https?:\/\//.test(u || '')))];
  // Sem fotos reais suficientes, entram fotos de banco gratuito (marcadas como ilustrativas)
  const stock = realPhotos.length >= 3 ? [] : (lead.stockPhotos || []).map((p) => p.url).filter((u) => /^https?:\/\//.test(u || ''));
  const photos = [...realPhotos, ...stock];
  const illustrative = stock.length > 0;
  let pi = 0;
  const nextPhoto = () => photos.length ? photos[pi++ % photos.length] : null;
  const wa = waLink(lead.phone, spec.whatsapp_texto || `Oi! Vi o site da ${name} e quero mais informações.`);
  const motif = `<i class="motif m-${th.motif}" aria-hidden="true"></i>`;
  const split = th.motion === 'marcante' ? 'chars' : 'words';
  const rev = th.motion === 'sutil' ? 'blur' : th.motion === 'marcante' ? 'flip' : '';
  let n = 0;
  const label = (txt, num = true) => (has(txt) ? `<p class="label" data-reveal>${motif}${num ? `<span class="n">${String(++n).padStart(2, '0')}</span>` : ''}${esc(txt)}</p>` : '');
  const title = (tag, soft, strong, extra = '') => {
    if (!has(soft) && !has(strong)) return '';
    return `<${tag} data-split="${split}" ${extra}>${has(soft) ? `<span class="soft">${rich(soft)}</span> ` : ''}${has(strong) ? `<strong>${rich(strong)}</strong>` : ''}</${tag}>`;
  };
  const img = (src, alt, attrs = '') => (src ? `<img src="${esc(src)}" alt="${esc(alt || name)}" loading="lazy" ${attrs}>` : '');
  const bgCls = (s, def = '') => {
    const f = s.fundo || def;
    const cls = f === 'escuro' ? 'dark' : f === 'alt' ? 'alt' : '';
    const tx = (s.textura || (f === 'escuro' ? th.texture : 'nenhuma'));
    return `${cls} ${tx && tx !== 'nenhuma' ? `tex-${tx}` : ''}`.trim();
  };
  const ctaBtn = (c, cls = '') => {
    if (!c) return '';
    const href = c.link || wa || '#contato';
    return `<a class="btn ${cls}" href="${esc(href)}" ${href.startsWith('http') ? 'target="_blank" rel="noopener"' : ''} data-fill data-magnetic>${esc(c.texto || c)}${I.arrow}</a>`;
  };

  const svcMsg = (x) => x.mensagem || `Oi! Vi o site da ${name} e quero saber sobre ${String(x.nome || '').toLowerCase()}.`;
  const svcLink = (x) => { const h = waLink(lead.phone, svcMsg(x)); return h ? `<a class="go" href="${esc(h)}" target="_blank" rel="noopener">${esc(x.cta || 'Pedir pelo WhatsApp')}${I.arrow}</a>` : ''; };
  const trust = lead.rating ? `<p class="trust" data-reveal data-delay="0.6"><span class="stars">★★★★★</span>Nota ${Number(lead.rating).toFixed(1).replace('.', ',')} · ${lead.reviews} avaliações no Google</p>` : '';
  const sections = [];
  const menu = [];
  let heroIsPhoto = false;

  for (const s of spec.secoes || []) {
    const id = s.ancora || '';
    if (s.menu && id) menu.push([s.menu, id]);
    const idAttr = id ? ` id="${esc(id)}"` : '';
    switch (s.tipo) {
      case 'topo': {
        const v = s.variante || (photos.length ? 'foto' : 'tipografico');
        const eyebrow = has(s.rotulo) ? `<p class="eyebrow" data-reveal>${motif}${esc(s.rotulo)}</p>` : '';
        const ctas = `<div class="ctas" data-reveal data-delay="0.5">${ctaBtn(s.cta || { texto: 'Falar no WhatsApp' })}${s.cta2 ? ctaBtn(s.cta2, 'ghost') : ''}</div>${v !== 'tipografico' && v !== 'moldura' ? trust : ''}`;
        const sub = has(s.subtitulo) ? `<p class="lead" data-reveal data-delay="0.35">${rich(s.subtitulo)}</p>` : '';
        const tabs = s.abas?.length ? `<div class="hero-tabs" data-reveal data-delay="0.7">${s.abas.slice(0, 3).map((a, i) => `<span><i>0${i + 1}</i><b>${esc(a)}</b></span>`).join('')}</div>` : '';
        if (v === 'foto') {
          heroIsPhoto = true;
          const p = s.foto || nextPhoto();
          sections.push(`<header class="hero hero-photo"${idAttr}><div class="bg" data-parallax="0.12">${img(p, s.foto_alt, 'loading="eager" fetchpriority="high"')}</div><div class="wrap">${eyebrow}${title('h1', s.titulo_suave, s.titulo_forte, 'class="t-acc"')}${sub}${ctas}${tabs}</div></header>`);
        } else if (v === 'moldura') {
          const p = s.foto || nextPhoto();
          const rv = (lead.reviewSamples || []).find((r) => String(r.text || '').length > 40);
          const card = rv ? `<figure class="review-card" style="margin:0" data-reveal="right" data-delay="0.8"><span class="stars">★★★★★</span><p>“${esc(String(rv.text).replace(/\s+/g, ' ').slice(0, 150).replace(/\s+\S*$/, ''))}…”</p><figcaption class="who"><b>${esc(rv.name)}</b><span>Google</span></figcaption></figure>` : '';
          sections.push(`<header class="hero hero-frame"${idAttr}><div class="frame">${img(p, s.foto_alt, 'loading="eager" fetchpriority="high"')}<div class="inner"><div>${eyebrow}${title('h1', s.titulo_suave, s.titulo_forte, 'class="t-acc"')}${sub}${ctas}</div>${card}</div></div></header>`);
        } else if (v === 'colagem') {
          const ps = [s.foto || nextPhoto(), nextPhoto(), nextPhoto()];
          const chip = lead.rating ? `<span class="chip" data-reveal data-delay="0.9">★ <b>${Number(lead.rating).toFixed(1).replace('.', ',')}</b> · ${lead.reviews} avaliações</span>` : '';
          sections.push(`<header class="hero hero-collage ${bgCls(s)}"${idAttr}><div class="wrap"><div class="grid"><div>${eyebrow}${title('h1', s.titulo_suave, s.titulo_forte, 'class="t-acc"')}${sub}${ctas}</div><div class="collage">${ps.map((p, i) => (p ? `<figure class="c${i + 1}" data-curtain data-delay="${0.15 + i * 0.15}">${img(p, '', i === 0 ? 'loading="eager"' : '')}</figure>` : '')).join('')}${chip}</div></div></div></header>`);
        } else if (v === 'dividido') {
          const p = s.foto || nextPhoto();
          const badge = s.selo ? `<div class="badge" data-reveal="left" data-delay="0.8"><b>${esc(s.selo.numero)}</b><span>${esc(s.selo.texto)}</span></div>` : '';
          sections.push(`<header class="hero hero-split ${bgCls(s)}"${idAttr}><div class="wrap"><div class="grid"><div>${eyebrow}${title('h1', s.titulo_suave, s.titulo_forte, 'class="t-acc"')}${sub}${ctas}</div><div class="ph" data-curtain data-delay="0.2">${img(p, s.foto_alt, 'loading="eager"')}${badge}</div></div></div></header>`);
        } else {
          const facts = [lead.rating ? `Nota ${Number(lead.rating).toFixed(1).replace('.', ',')} no Google` : '', lead.neighborhood && lead.neighborhood !== lead.city ? lead.neighborhood : '', lead.city].filter(Boolean);
          sections.push(`<header class="hero hero-type ${bgCls(s)}"${idAttr}><div class="wrap">${eyebrow}${title('h1', s.titulo_suave, s.titulo_forte, 'class="t-acc"')}<div class="row"><div>${sub}</div>${ctas}</div>${facts.length ? `<p class="muted" style="margin-top:28px" data-reveal data-delay="0.6">${facts.map(esc).join(' · ')}</p>` : ''}</div></header>`);
        }
        break;
      }
      case 'numeros': {
        const items = (s.itens || []).filter((x) => has(x.valor)).slice(0, 4);
        if (!items.length) break;
        const val = (x) => {
          const m = String(x.valor).replace(',', '.').match(/^([^\d]*)([\d.]+)(.*)$/);
          return m ? `<b data-count="${m[2]}" data-prefix="${esc(x.prefixo ?? m[1])}" data-suffix="${esc(x.sufixo ?? m[3])}">${esc(x.valor)}</b>` : `<b>${esc(x.valor)}</b>`;
        };
        sections.push(`<section class="sec tight ${bgCls(s)}"${idAttr}><div class="wrap"><div class="stats" style="--n:${items.length}" data-stagger="0.1">${items.map((x) => `<div>${val(x)}<span>${esc(x.legenda)}</span></div>`).join('')}</div></div></section>`);
        break;
      }
      case 'sobre': {
        const a = s.fotos?.[0] || nextPhoto(); const b = s.fotos?.[1] || nextPhoto();
        const tag = s.selo ? `<div class="tag"><b>${esc(s.selo.numero)}</b>${esc(s.selo.texto)}</div>` : '';
        const ph = a ? `<div class="photos"><div class="a" data-curtain>${img(a)}</div>${b && b !== a ? `<div class="b" data-curtain data-delay="0.25">${img(b)}</div>` : ''}${tag}</div>` : '';
        const txt = `<div class="txt">${label(s.rotulo)}${title('h2', s.titulo_suave, s.titulo_forte, 'class="t-acc"')}<div style="margin-top:28px" data-stagger="0.1">${(s.textos || []).map((t) => `<p class="lead" data-reveal>${rich(t)}</p>`).join('')}</div>${s.link ? `<a class="link" href="${esc(s.link.href || wa || '#contato')}" data-reveal>${esc(s.link.texto)}${I.ne}</a>` : ''}</div>`;
        sections.push(`<section class="sec ${bgCls(s)}"${idAttr}><div class="wrap"><div class="about">${s.foto_direita ? txt + ph : ph + txt}</div></div></section>`);
        break;
      }
      case 'manifesto':
        sections.push(`<section class="sec ${bgCls(s)}"${idAttr}><div class="wrap">${label(s.rotulo)}<p class="manifesto" data-scrub-words>${esc(s.texto)}</p></div></section>`);
        break;
      case 'servicos': {
        const items = s.itens || [];
        const head = `<div class="head"><div>${label(s.rotulo)}${title('h2', s.titulo_suave, s.titulo_forte, 'class="t-acc"')}</div>${has(s.subtitulo) ? `<p class="lead" data-reveal>${rich(s.subtitulo)}</p>` : ''}</div>`;
        let body;
        if ((s.variante || 'indice') === 'cartoes') {
          const usePh = s.com_fotos !== false && photos.length > 0;
          body = `<div class="cards" style="--cols:${Math.min(3, items.length || 3)}" data-stagger="0.08" data-reveal-type="${rev || 'zoom'}">${items.map((x, i) => (usePh
            ? `<article class="card"><div class="ph">${img(x.foto || nextPhoto(), x.nome)}</div><div class="body"><h3>${esc(x.nome)}</h3><p>${esc(x.texto)}</p>${svcLink(x)}</div></article>`
            : `<article class="card noimg"><div class="body"><span class="big">${String(i + 1).padStart(2, '0')}</span><h3>${esc(x.nome)}</h3><p>${esc(x.texto)}</p>${svcLink(x)}</div></article>`)).join('')}</div>`;
        } else {
          body = `<div class="index" data-stagger="0.07">${items.map((x, i) => `<a href="${esc(waLink(lead.phone, svcMsg(x)) || '#contato')}" target="_blank" rel="noopener"><span class="n">${String(i + 1).padStart(2, '0')}</span><div><h3>${esc(x.nome)}</h3>${has(x.texto) ? `<p>${esc(x.texto)}</p>` : ''}</div><span class="ar">${I.ne}</span></a>`).join('')}</div>`;
        }
        sections.push(`<section class="sec ${bgCls(s)}"${idAttr}><div class="wrap">${head}${body}</div></section>`);
        break;
      }
      case 'galeria': {
        const list = (s.fotos?.length ? s.fotos.map((f) => (typeof f === 'string' ? { url: f } : f)) : photos.slice(0, s.quantidade || ((s.variante || 'trilho') === 'mosaico' ? 6 : 8)).map((url) => ({ url }))).filter((f) => f.url);
        if (!list.length) break;
        const head = `<div class="head"><div>${label(s.rotulo)}${title('h2', s.titulo_suave, s.titulo_forte, 'class="t-acc"')}</div>${s.link ? `<a class="link" href="${esc(s.link.href || lead.mapsUrl || '#')}" target="_blank" rel="noopener">${esc(s.link.texto)}${I.ne}</a>` : ''}</div>`;
        const filters = s.filtros?.length ? `<div class="filters" data-reveal>${s.filtros.map((f) => `<span>${esc(f)}</span>`).join('')}</div>` : '';
        const body = (s.variante || 'trilho') === 'mosaico'
          ? `<div class="mosaic" data-stagger="0.07">${list.map((f) => `<figure data-curtain>${img(f.url, f.legenda)}</figure>`).join('')}</div>`
          : `<div class="rail" data-reveal>${list.map((f) => `<figure>${img(f.url, f.legenda)}${has(f.legenda) ? `<figcaption>${esc(f.legenda)}</figcaption>` : ''}</figure>`).join('')}</div><div class="ruler" aria-hidden="true"></div>`;
        sections.push(`<section class="sec ${bgCls(s)}"${idAttr}><div class="wrap">${head}${filters}${body}</div></section>`);
        break;
      }
      case 'processo': {
        const steps = (s.passos || []).slice(0, 4);
        if (!steps.length) break;
        sections.push(`<section class="sec ${bgCls(s, 'escuro')}"${idAttr}><div class="wrap"><div class="head"><div>${label(s.rotulo)}${title('h2', s.titulo_suave, s.titulo_forte, 'class="t-acc"')}</div>${has(s.subtitulo) ? `<p class="lead" data-reveal>${rich(s.subtitulo)}</p>` : ''}</div><div class="steps" style="--n:${steps.length}" data-progress data-reveal>${steps.map((p, i) => `<div data-step><span class="n">${String(i + 1).padStart(2, '0')}</span><h3>${esc(p.titulo)}</h3><p>${esc(p.texto)}</p></div>`).join('')}</div></div></section>`);
        break;
      }
      case 'depoimentos': {
        const items = (s.itens?.length ? s.itens : (lead.reviewSamples || []).map((r) => ({ nome: r.name, texto: r.text, papel: 'Avaliação no Google', nota: r.rating }))).filter((x) => has(x.texto)).slice(0, 3);
        if (!items.length) break;
        const clip = (t, max) => (t.length > max ? `${t.slice(0, max).replace(/\s+\S*$/, '')}…` : t);
        const proof = lead.rating ? `<p class="lead" data-reveal><span class="stars">★★★★★</span> Nota ${Number(lead.rating).toFixed(1).replace('.', ',')} com ${lead.reviews} avaliações no Google</p>` : '';
        sections.push(`<section class="sec ${bgCls(s, 'alt')}"${idAttr}><div class="wrap"><div class="head"><div>${label(s.rotulo || 'Quem já fez')}${title('h2', s.titulo_suave, s.titulo_forte || 'O que dizem os clientes', 'class="t-acc"')}</div>${proof}</div><div class="quotes" data-stagger="0.1" data-reveal-type="${rev}">${items.map((x, i) => `<figure class="quote ${i === 0 ? 'big' : ''}" style="margin:0"><span class="q" aria-hidden="true">“</span><p>${esc(clip(String(x.texto).replace(/\s+/g, ' ').trim(), i === 0 ? 260 : 190))}</p><figcaption class="who"><span class="av">${esc(String(x.nome || '?').trim()[0] || '?')}</span><span>${esc(x.nome)}<small>${esc(x.papel || 'Cliente')}</small></span></figcaption></figure>`).join('')}</div></div></section>`);
        break;
      }
      case 'faixa': {
        const items = (s.itens || []).filter(has);
        if (!items.length) break;
        sections.push(`<section class="${bgCls(s)}"${idAttr} aria-label="${esc(items.join(', '))}"><div class="marquee" data-marquee>${items.map((x) => `<span>${esc(x)}<i class="motif m-${th.motif}"></i></span>`).join('')}</div></section>`);
        break;
      }
      case 'local': {
        const ORDER = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
        const table = lead.hoursTable ? ORDER.filter((d) => lead.hoursTable[d]).map((d) => [d, lead.hoursTable[d]]) : [];
        const mapHref = lead.mapsUrl || (lead.address ? `https://www.google.com/maps/search/${encodeURIComponent(`${name} ${lead.address}`)}` : null);
        const p = s.foto || nextPhoto();
        sections.push(`<section class="sec ${bgCls(s)}" id="${esc(id || 'contato')}"><div class="wrap"><div class="place"><div>${label(s.rotulo || 'Onde estamos')}${title('h2', s.titulo_suave || (lead.neighborhood && lead.neighborhood !== lead.city ? lead.neighborhood : 'Venha conhecer em'), s.titulo_forte || lead.city || 'nosso espaço', 'class="t-acc"')}${has(s.texto) ? `<p class="lead" style="margin-top:22px" data-reveal>${rich(s.texto)}</p>` : ''}<div class="contact-list" data-stagger="0.08">${lead.address ? `<a href="${esc(mapHref)}" target="_blank" rel="noopener">${I.pin}${esc(lead.address)}</a>` : ''}${lead.phone ? `<a href="${esc(wa || `tel:${digits(lead.phone)}`)}" target="_blank" rel="noopener">${I.phone}${esc(lead.phone)}</a>` : ''}${lead.instagram ? `<a href="https://instagram.com/${esc(lead.instagram.replace('@', ''))}" target="_blank" rel="noopener">${I.ig}${esc(lead.instagram)}</a>` : ''}</div></div><div data-reveal>${table.length ? `<table class="hours"><tbody>${table.map(([d, h]) => `<tr class="${/fechado/i.test(h) ? 'closed' : ''}"><td>${esc(d)}</td><td>${esc(h)}</td></tr>`).join('')}</tbody></table>` : ''}${p ? `<div class="map-card" style="margin-top:${table.length ? 28 : 0}px">${img(p)}${mapHref ? `<a class="pin" href="${esc(mapHref)}" target="_blank" rel="noopener"><span>Abrir no mapa</span>${I.ne}</a>` : ''}</div>` : (mapHref ? `<a class="map-card noimg tex-${th.texture !== 'nenhuma' ? th.texture : 'grade'}" href="${esc(mapHref)}" target="_blank" rel="noopener" style="margin-top:${table.length ? 28 : 0}px"><span class="mk">${I.pin}</span><span class="pin"><span>${esc(lead.address || 'Abrir no mapa')}</span>${I.ne}</span></a>` : '')}</div></div></div></section>`);
        break;
      }
      case 'chamada':
        sections.push(`<section class="sec ${bgCls(s, 'escuro')}"${idAttr}><div class="wrap final">${label(s.rotulo, false)}${title('h2', s.titulo_suave, s.titulo_forte, 'class="t-acc"')}<div class="row">${has(s.texto) ? `<p class="lead" data-reveal>${rich(s.texto)}</p>` : '<span></span>'}<div data-reveal data-delay="0.3">${ctaBtn(s.cta || { texto: 'Chamar no WhatsApp' }, 'lg')}</div></div></div></section>`);
        break;
      case 'dores': {
        const items = (s.itens || []).filter((x) => has(x.frase)).slice(0, 3);
        if (!items.length) break;
        sections.push(`<section class="sec ${bgCls(s)}"${idAttr}><div class="wrap"><div class="head"><div>${label(s.rotulo)}${title('h2', s.titulo_suave, s.titulo_forte, 'class="t-acc"')}</div>${has(s.subtitulo) ? `<p class="lead" data-reveal>${rich(s.subtitulo)}</p>` : ''}</div><div class="pains" style="--n:${items.length}" data-stagger="0.1" data-reveal-type="${rev}">${items.map((x) => `<div class="pain"><q>${esc(x.frase)}</q>${has(x.resposta) ? `<p>${esc(x.resposta)}</p>` : ''}</div>`).join('')}</div></div></section>`);
        break;
      }
      case 'cartaz': {
        const big = has(s.palavra) ? rich(s.palavra) : esc(name);
        sections.push(`<section class="sec tight ${bgCls(s)}"${idAttr}><div class="wrap"><div class="poster" style="${hex(s.cor_fundo) ? `--poster-bg:${s.cor_fundo};` : ''}${hex(s.cor_texto) ? `--poster-ink:${s.cor_texto};` : ''}" data-reveal="zoom"><div class="meta"><span>${esc(s.topo_esquerda || lead.category || '')}</span><span>${esc(s.topo_direita || lead.city || '')}</span></div>${has(s.selo) ? `<div class="stamp">${esc(s.selo)}</div>` : ''}<div class="big" data-split="${split}">${big}</div><div class="meta"><span>${esc(s.base_esquerda || (lead.rating ? `Nota ${Number(lead.rating).toFixed(1).replace('.', ',')} · ${lead.reviews} avaliações` : ''))}</span><span>${esc(s.base_direita || lead.hours || '')}</span></div></div></div></section>`);
        break;
      }
      case 'empilhados': {
        const items = (s.itens || []).slice(0, 5);
        if (!items.length) break;
        sections.push(`<section class="sec ${bgCls(s)}"${idAttr}><div class="wrap"><div class="head"><div>${label(s.rotulo)}${title('h2', s.titulo_suave, s.titulo_forte, 'class="t-acc"')}</div></div><div class="stack">${items.map((x, i) => { const p = x.foto || (s.com_fotos !== false ? nextPhoto() : null); return `<article class="${p ? '' : 'noimg'}" style="--i:${i}"><div class="txt"><span class="num">${String(i + 1).padStart(2, '0')}</span><div><h3>${esc(x.nome)}</h3>${has(x.texto) ? `<p>${esc(x.texto)}</p>` : ''}${svcLink(x)}</div></div><div class="ph ${p ? '' : `tex-${th.texture !== 'nenhuma' ? th.texture : 'linhas'} noph`}">${p ? img(p, x.nome) : `<span class="glyph" aria-hidden="true">${esc(x.simbolo || String(i + 1).padStart(2, '0'))}</span><span class="cap" aria-hidden="true">${motif}${esc(x.nome)}</span>`}</div></article>`; }).join('')}</div></div></section>`);
        break;
      }
      case 'comparacao': {
        if (!s.sem?.length || !s.com?.length) break;
        sections.push(`<section class="sec ${bgCls(s)}"${idAttr}><div class="wrap"><div class="head"><div>${label(s.rotulo)}${title('h2', s.titulo_suave, s.titulo_forte, 'class="t-acc"')}</div></div><div class="compare" data-stagger="0.12"><div class="no" data-reveal="left"><h3>${esc(s.titulo_sem || 'Do jeito comum')}</h3><ul>${s.sem.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div><div class="yes" data-reveal="right"><h3>${esc(s.titulo_com || `Com a ${name}`)}</h3><ul>${s.com.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div></div></div></section>`);
        break;
      }
      case 'faq': {
        const items = (s.itens || []).filter((x) => has(x.pergunta) && has(x.resposta)).slice(0, 8);
        if (!items.length) break;
        sections.push(`<section class="sec ${bgCls(s)}"${idAttr}><div class="wrap faq-grid"><div>${label(s.rotulo || 'Dúvidas')}${title('h2', s.titulo_suave, s.titulo_forte || 'Perguntas frequentes', 'class="t-acc"')}</div><div class="faq" data-reveal>${items.map((x, i) => `<details${i === 0 ? ' open' : ''}><summary>${esc(x.pergunta)}</summary><p>${esc(x.resposta)}</p></details>`).join('')}</div></div></section>`);
        break;
      }
      case 'html':
        if (has(s.html)) sections.push(`<section class="${bgCls(s)}"${idAttr}>${s.html}</section>`);
        break;
      default:
    }
  }

  const r = spec.rodape || {};
  const giant = r.palavra_gigante || name.split(' ')[0];
  const foot = `<footer class="foot dark ${th.texture !== 'nenhuma' ? `tex-${th.texture}` : ''}"><div class="wrap"><div class="cols"><div><p style="font:600 22px/1.1 var(--f-display);letter-spacing:-.02em;margin-bottom:12px">${esc(name)}</p><p class="soft" style="max-width:34ch">${esc(r.frase || `${lead.category || ''} em ${lead.city || ''}`)}</p></div><div><h4>Navegação</h4>${menu.map(([t, a]) => `<a href="#${esc(a)}">${esc(t)}</a>`).join('')}</div><div><h4>Contato</h4>${lead.phone ? `<a href="${esc(wa || '#')}" target="_blank" rel="noopener">${esc(lead.phone)}</a>` : ''}${lead.instagram ? `<a href="https://instagram.com/${esc(lead.instagram.replace('@', ''))}" target="_blank" rel="noopener">${esc(lead.instagram)}</a>` : ''}${lead.email ? `<a href="mailto:${esc(lead.email)}">${esc(lead.email)}</a>` : ''}</div><div><h4>Endereço</h4><span>${esc(lead.address || lead.city || '')}</span>${lead.hours ? `<span>${esc(lead.hours)}</span>` : ''}</div></div><div class="giant" data-reveal aria-hidden="true">${esc(giant)}<span class="acc">.</span></div><div class="bottom"><span>© ${new Date().getFullYear()} ${esc(name)}</span>${illustrative ? '<span>Imagens ilustrativas de bancos gratuitos</span>' : ''}<span>Site feito pela Agência Teleios</span></div></div></footer>`;

  const initials = name.replace(/[^\p{L}\p{N} ]/gu, '').split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  const logo = spec.marca?.logo_svg || (spec.marca?.logo_url ? `<img src="${esc(spec.marca.logo_url)}" alt="${esc(name)}">` : `<span class="mono" aria-hidden="true">${esc(initials)}</span>${esc(name)}`);
  const links = menu.map(([t, a]) => `<a href="#${esc(a)}">${esc(t)}</a>`).join('');
  const nav = `<div class="progress" id="prog" aria-hidden="true"></div><div class="nav ${heroIsPhoto ? 'on-photo' : ''}" id="nav"><div class="wrap"><a class="brand" href="#" aria-label="${esc(name)} — início">${logo}</a><nav aria-label="Seções">${links}</nav>${ctaBtn(spec.menu_cta || { texto: 'Orçamento' })}${menu.length ? '<button class="burger" type="button" aria-label="Abrir menu" aria-controls="sheet" aria-expanded="false" id="burger"><span></span></button>' : ''}</div></div>`
    + (menu.length ? `<div class="sheet" id="sheet" role="dialog" aria-modal="true" aria-label="Menu"><div class="top"><span style="font:600 20px var(--f-display)">${esc(name)}</span><button class="close" type="button" aria-label="Fechar menu" id="sheetClose">×</button></div><nav>${links}</nav><div class="foot-cta">${ctaBtn(spec.menu_cta || { texto: 'Falar no WhatsApp' }, 'lg')}</div></div>` : '');
  const mapsHref = lead.mapsUrl || (lead.address ? `https://www.google.com/maps/search/${encodeURIComponent(`${name} ${lead.address}`)}` : null);
  const actionbar = wa ? `<div class="actionbar" role="navigation" aria-label="Contato rápido"><a href="${esc(wa)}" target="_blank" rel="noopener">${I.wa}WhatsApp</a>${lead.phone ? `<a href="tel:+55${digits(lead.phone)}">${I.phone}Ligar</a>` : ''}${mapsHref ? `<a href="${esc(mapsHref)}" target="_blank" rel="noopener">${I.route}Rota</a>` : ''}</div>` : '';
  const agency = `https://wa.me/${agencyWa}?text=${encodeURIComponent(`Oi! Vi a prévia do site da ${name} e quero conversar.`)}`;
  const bar = `<div class="teleios-bar" id="tbar"><i></i><span>Prévia feita pela Agência Teleios para ${esc(name)}</span><a href="${agency}" target="_blank" rel="noopener">Quero este site</a><button type="button" aria-label="Fechar" onclick="this.parentNode.remove()">×</button></div>`;
  const waFloat = wa ? `<a class="wa-float" href="${esc(wa)}" target="_blank" rel="noopener" aria-label="Falar no WhatsApp">${I.wa}</a>` : '';
  const fontsUrl = `https://fonts.googleapis.com/css2?${[...new Set([th.display, th.body, th.acc].filter(Boolean))].map((f) => `family=${FONTS[f][0]}`).join('&')}&display=swap`;
  const vars = Object.entries(th.vars).map(([k, v]) => `${k}:${v}`).join(';');
  const desc = spec.descricao || `${name} · ${lead.category || ''} em ${lead.city || ''}`;

  return `<!doctype html>
<html lang="pt-BR"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(spec.titulo_pagina || `${name} · ${lead.category || ''} em ${lead.city || ''}`)}</title>
<meta name="description" content="${esc(desc)}"><meta name="robots" content="noindex">
<meta name="theme-color" content="${esc(th.vars['--bg'])}">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${fontsUrl}" rel="stylesheet">
<link rel="stylesheet" href="/kit/motion.css"><script src="/kit/motion.js" defer></script>
<style>:root{${vars}}
${CSS}
${spec.css_extra || ''}</style>
</head><body>
${nav}
<main>
${sections.join('\n')}
</main>
${foot}
${waFloat}
${actionbar}
${bar}
<script>(function(){
var n=document.getElementById('nav'),pg=document.getElementById('prog'),links=[].slice.call(document.querySelectorAll('.nav nav a'));
var secs=links.map(function(a){return document.querySelector(a.getAttribute('href'))}).filter(Boolean);
function f(){var y=scrollY,h=document.documentElement.scrollHeight-innerHeight;n.classList.toggle('scrolled',y>40);if(pg)pg.style.transform='scaleX('+(h>0?y/h:0)+')';
var cur=null;secs.forEach(function(s){if(s.getBoundingClientRect().top<innerHeight*.35)cur=s});links.forEach(function(a){a.classList.toggle('on',cur&&a.getAttribute('href')==='#'+cur.id)})}
f();addEventListener('scroll',f,{passive:true});
var b=document.getElementById('burger'),sh=document.getElementById('sheet'),c=document.getElementById('sheetClose');
function t(o){if(!sh)return;sh.classList.toggle('open',o);b&&b.setAttribute('aria-expanded',o);document.body.style.overflow=o?'hidden':'';if(o&&c)c.focus()}
b&&b.addEventListener('click',function(){t(true)});c&&c.addEventListener('click',function(){t(false)});
sh&&sh.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){t(false)})});
addEventListener('keydown',function(e){if(e.key==='Escape')t(false)});
})();</script>
</body></html>`;
}
