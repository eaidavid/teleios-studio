// Caçador: busca empresas e enriquece com dados do site.
// Motores:
//  - google: gosom/google-maps-scraper (open source, MIT) rodando como serviço no docker-compose
//  - osm: OpenStreetMap (Overpass API), gratuito e sem limite de chave
// O ritmo é conservador de propósito: um trabalho por vez, profundidade baixa e
// nada de rodízio de proxy. Empresas repetidas são ignoradas pela chave do lugar.
import { q, leadRow, kvGet } from './db.js';
import { CATEGORIES } from '../../web/src/data/seed.js';
import { analyze } from '../../web/src/data/analysis.js';

const SCRAPER = () => process.env.SCRAPER_URL || 'http://google-maps-scraper:8080';
const UA = 'TeleiosRadar/1.0 (+https://agenciateleios.com.br)';

/* ---------- categoria do Google -> categoria do painel ---------- */
const CAT_WORDS = [
  ['Clínica de estética', ['estética', 'estetica', 'beleza', 'spa', 'depila', 'sobrancelha', 'skin']],
  ['Odontologia', ['dent', 'odonto', 'ortodont']],
  ['Academia', ['academia', 'gym', 'crossfit', 'fitness', 'pilates studio']],
  ['Restaurante', ['restaurante', 'pizzaria', 'lanchonete', 'hamburg', 'bistrô', 'bar ', 'cafeteria', 'padaria', 'comida']],
  ['Pet shop', ['pet', 'veterin', 'animal']],
  ['Ótica', ['ótica', 'otica', 'óculos']],
  ['Advocacia', ['advoga', 'advocacia', 'jurídic']],
  ['Barbearia', ['barbear', 'barber']],
  ['Fisioterapia', ['fisioter', 'pilates', 'rpg', 'quiroprax']],
  ['Imobiliária', ['imobili', 'corretor', 'imóveis']],
  ['Móveis planejados', ['planejad', 'marcenaria', 'móveis', 'moveis', 'marceneiro', 'cozinhas']],
];
export function mapCategory(raw = '', fallback) {
  const t = ` ${String(raw).toLowerCase()} `;
  for (const [cat, words] of CAT_WORDS) if (words.some((w) => t.includes(w))) return cat;
  return fallback || raw || 'Outros';
}

/* ---------- CSV simples (aspas e quebras de linha) ---------- */
function parseCsv(text) {
  const rows = []; let row = []; let cell = ''; let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; } else if (ch === '"') quoted = false; else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { row.push(cell); cell = ''; } else if (ch === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; } else if (ch !== '\r') cell += ch;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const [head, ...body] = rows;
  return body.filter((r) => r.length > 1).map((r) => Object.fromEntries(head.map((h, i) => [h.trim(), r[i]])));
}

const num = (v) => { const n = parseFloat(String(v ?? '').replace(',', '.')); return Number.isFinite(n) ? n : 0; };
const host = (url) => { try { return new URL(url.startsWith('http') ? url : `https://${url}`).hostname.replace(/^www\./, ''); } catch { return ''; } };
const firstEmail = (v) => (Array.isArray(v) ? v[0] : String(v || '').split(/[,;\s]+/)[0]) || '';

/* Nome limpo: o Google costuma colar descrição no nome ("Loja X - Móveis planejados em Y e região") */
export function cleanName(raw = '') {
  let n = String(raw).trim().replace(/\s+/g, ' ');
  n = n.split(/\s[-–|·•:]\s|\s\|\s/)[0];
  n = n.replace(/\s+(em|no|na|de)\s+[A-ZÁÉÍÓÚÂÊÔÃÕ][\wÀ-ú]+(\s[A-ZÁÉÍÓÚÂÊÔÃÕ][\wÀ-ú]+)*\s+e\s+[Rr]egi[aã]o\.?$/, '');
  const words = n.split(' ');
  // corta quando a categoria começa a se repetir ("Reffinato solução em móveis Móveis planejados…")
  for (let i = 2; i < words.length; i++) {
    if (/^(móveis|moveis|planejados|clínica|clinica|academia|restaurante|pizzaria|barbearia|ótica|otica|imobiliária|advocacia|pet|odontologia)$/i.test(words[i]) && i >= 2 && words.slice(0, i).join(' ').length > 6) {
      const head = words.slice(0, i).join(' ');
      if (new RegExp(words[i], 'i').test(head)) return head.replace(/[,.;]$/, '');
    }
  }
  return n.replace(/[,.;]$/, '').slice(0, 60);
}
const asJson = (v) => { if (!v) return null; if (typeof v === 'object') return v; try { return JSON.parse(v); } catch { return null; } };
export function photosOf(r) {
  const imgs = asJson(r.images) || [];
  const urls = imgs.map((x) => x?.image || x?.Image || x).filter((u) => typeof u === 'string' && u.startsWith('http'));
  if (r.thumbnail && String(r.thumbnail).startsWith('http')) urls.unshift(r.thumbnail);
  return [...new Set(urls)].slice(0, 12);
}
export function reviewsOf(r) {
  const list = asJson(r.user_reviews) || asJson(r.user_reviews_extended) || [];
  return list.map((x) => ({ name: x.Name || x.name || '', rating: x.Rating ?? x.rating, text: String(x.Description || x.description || '').trim().slice(0, 400) }))
    .filter((x) => x.text.length > 20).slice(0, 6);
}

/* Horário do Maps (objeto por dia) -> texto legível */
const DAYS = [['segunda-feira', 'Seg'], ['terça-feira', 'Ter'], ['quarta-feira', 'Qua'], ['quinta-feira', 'Qui'], ['sexta-feira', 'Sex'], ['sábado', 'Sáb'], ['domingo', 'Dom']];
export function formatHours(raw) {
  const obj = asJson(raw);
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return { text: typeof raw === 'string' && !raw.startsWith('{') ? raw : '', table: null };
  const norm = Object.fromEntries(Object.entries(obj).map(([k, v]) => [k.toLowerCase(), Array.isArray(v) ? v.join(', ') : String(v)]));
  const rows = DAYS.map(([k, short]) => [short, norm[k] || norm[k.replace('-feira', '')] || '']).filter(([, v]) => v);
  const groups = [];
  for (const [d, v] of rows) {
    const last = groups[groups.length - 1];
    if (last && last.v === v) last.to = d; else groups.push({ from: d, to: d, v });
  }
  const text = groups.map((g) => `${g.from === g.to ? g.from : `${g.from}–${g.to}`} ${/fechado/i.test(g.v) ? 'fechado' : g.v.replace(/:00/g, 'h').replace(/–/g, '–')}`).join(' · ');
  return { text, table: Object.fromEntries(rows) };
}

/* Relevância: só entra quem tem o ramo no NOME ou na CATEGORIA do Google (lista positiva),
   e nunca quem bate na lista negativa (aparecem nas buscas, mas não são o público). */
const INCLUDE = {
  'Móveis planejados': /marcen|planejad|m[oó]ve(l|is)|mobili|arm[aá]rio|cozinhas?\b|closet|interiores|ambientes|sob medida|mdf|carpintaria|woodshop|wood|madeira/i,
  'Clínica de estética': /est[eé]tic|beleza|spa\b|depila|harmoniza|skin|dermato|sobrancelha|micropig|laser|massag/i,
  Odontologia: /odont|dent|sorriso|orto|implant/i,
  Academia: /academia|fitness|gym|crossfit|muscula|treino|funcional|box\b|pilates/i,
  Restaurante: /restaurante|pizz|hamburg|burger|lanchonete|churrasc|cantina|bistr|caf[eé]|padaria|comida|culin|sushi|food|gastronom|self.?service|marmit/i,
  'Pet shop': /pet|veterin|animal|banho e tosa|dog|cão|cao|gato/i,
  Ótica: /[oó]tica|[oó]culos|optic|lentes/i,
  Advocacia: /advoca|advogad|jur[ií]dic|direito|law/i,
  Barbearia: /barbe|barber|cabeleir/i,
  Fisioterapia: /fisio|pilates|rpg|reabilita|quiropra|osteopat/i,
  Imobiliária: /imobili|im[oó]ve(l|is)|corretor|realty|empreendimento/i,
};
const EXCLUDE = {
  'Móveis planejados': /colch|eletro|estofad|sof[aá]s?\b|tapete|cama box|loja de departamento|material de constru|madeireira|vidra[cç]aria|imobili|evento|festa|buffet|ch[aá]cara|sal[aã]o de|espa[cç]o (para|de) |piscina|pousada|hotel|motel|igreja|escola|mercado|farm[aá]cia|auto ?pe[cç]as|oficina mec|posto|lava.?jato|fibra|vime|bambu|cadeira de escrit|office/i,
  'Clínica de estética': /farm[aá]cia|perfumaria|loja de cosm|distribuidor/i,
  Restaurante: /supermercado|distribuidora|atacad|evento|buffet infantil/i,
  Academia: /loja de suplement|suplementos/i,
  'Pet shop': /agropecu|ra[cç][aã]o atacad/i,
};
export function relevance(category, title = '', googleCategory = '') {
  const text = `${title} ${googleCategory}`;
  if (EXCLUDE[category]?.test(text)) return 'fora';
  if (INCLUDE[category] && !INCLUDE[category].test(text)) return 'fora';
  return 'ok';
}
/* Qualidade mínima (padrões ajustáveis por campanha) */
export function quality(data, c = {}) {
  const minReviews = c.minReviews ?? 5;
  const minRating = c.minRating ?? 4;
  if (c.requirePhone !== false && !String(data.phone || '').replace(/\D/g, '')) return 'sem telefone';
  if ((data.reviews || 0) < minReviews) return `menos de ${minReviews} avaliações`;
  if (data.rating && data.rating < minRating) return `nota abaixo de ${String(minRating).replace('.', ',')}`;
  return 'ok';
}

/* Linha do Google Maps -> lead */
function fromGoogle(r, campaign) {
  const addr = r.complete_address && typeof r.complete_address === 'object' ? r.complete_address : (() => { try { return JSON.parse(r.complete_address || '{}'); } catch { return {}; } })();
  // Na campanha, o segmento é o da campanha; a categoria do Google fica guardada à parte
  const category = campaign?.category || mapCategory(r.category);
  const gallery = photosOf(r);
  const hours = formatHours(r.open_hours);
  const site = String(r.website || r.web_site || '').trim();
  return {
    placeKey: r.place_id || r.cid || r.data_id || `${r.title}|${r.address}`,
    excluded: campaign?.category ? relevance(category, r.title, r.category) !== 'ok' : false,
    data: {
      name: r.title || 'Sem nome',
      brandName: cleanName(r.title || ''),
      gallery,
      reviewSamples: reviewsOf(r),
      category,
      googleCategory: r.category || '',
      contact: '',
      city: addr.city || campaign?.city || '',
      neighborhood: addr.borough || addr.neighborhood || '',
      address: r.address || '',
      phone: r.phone || '',
      whatsapp: /^\(?\d{2}\)?\s?9/.test(String(r.phone || '').replace(/^\+55\s?/, '')),
      website: host(site),
      websiteUrl: site && !/google\.|facebook\.com|instagram\.com|wa\.me|linktr\.ee/i.test(site) ? (site.startsWith('http') ? site : `https://${site}`) : '',
      instagram: /instagram\.com\/([a-z0-9_.]+)/i.test(site) ? `@${site.match(/instagram\.com\/([a-z0-9_.]+)/i)[1]}` : '',
      site: null,
      social: null,
      email: firstEmail(r.emails),
      rating: num(r.review_rating),
      reviews: Math.round(num(r.review_count)),
      unanswered: 0,
      photos: gallery.length,
      ads: false,
      hours: hours.text,
      hoursTable: hours.table,
      lat: num(r.latitude), lng: num(r.longitude),
      mapsUrl: r.link || '',
      status: r.status || '',
      priceRange: r.price_range || '',
      about: (typeof r.descriptions === 'string' ? r.descriptions : '').slice(0, 400) || (typeof r.about === 'string' ? r.about.slice(0, 400) : ''),
      tags: [], notes: [], analysis: null, blocked: '', owner: 'David',
      next: 'Na fila de abordagem',
      palette: CATEGORIES[category]?.palette || ['#F2EFE9', '#14181D', '#00C48C'],
      brand: null,
      source: 'google',
    },
  };
}

/* ---------- gosom: cria o trabalho e espera ---------- */
/* Variações de busca: o Google Maps responde diferente para cada termo */
const VARIANTS = {
  'Móveis planejados': ['móveis planejados', 'marcenaria', 'móveis sob medida', 'loja de móveis planejados', 'cozinha planejada'],
  'Clínica de estética': ['clínica de estética', 'estética facial', 'harmonização facial', 'depilação a laser', 'spa estética'],
  Odontologia: ['dentista', 'clínica odontológica', 'implante dentário', 'ortodontia'],
  Academia: ['academia', 'crossfit', 'studio de treino', 'academia de musculação'],
  Restaurante: ['restaurante', 'pizzaria', 'hamburgueria', 'self service', 'restaurante delivery'],
  'Pet shop': ['pet shop', 'banho e tosa', 'clínica veterinária', 'veterinário'],
  Ótica: ['ótica', 'óculos de grau', 'exame de vista'],
  Advocacia: ['advogado', 'escritório de advocacia', 'advogado trabalhista'],
  Barbearia: ['barbearia', 'barbeiro'],
  Fisioterapia: ['fisioterapia', 'pilates', 'clínica de fisioterapia', 'RPG fisioterapia'],
  Imobiliária: ['imobiliária', 'corretor de imóveis', 'imóveis à venda'],
};
export function keywordsFor(c) {
  const city = c.city ? ` em ${c.city}` : '';
  const base = (c.query || '').trim();
  const list = [base, ...(VARIANTS[c.category] || []).map((v) => `${v}${city}`)].filter(Boolean);
  const seen = new Set();
  return list.filter((k) => { const n = k.toLowerCase(); if (seen.has(n)) return false; seen.add(n); return true; }).slice(0, Number(c.variants) || 5);
}

/* Centro da cidade (OpenStreetMap/Nominatim), para o Maps buscar no lugar certo */
const geoCache = new Map();
export async function geocode(city) {
  if (!city) return null;
  if (geoCache.has(city)) return geoCache.get(city);
  try {
    const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=br&city=${encodeURIComponent(city)}`, { headers: { 'user-agent': UA, 'accept-language': 'pt-BR' } });
    const [hit] = await r.json();
    const g = hit ? { lat: Number(hit.lat), lon: Number(hit.lon) } : null;
    geoCache.set(city, g);
    return g;
  } catch { return null; }
}

async function gosomCreate({ keywords, lang = 'pt', depth = 10, email = true, maxTime = 1500, geo }) {
  // Versão web clássica do projeto: aceita várias palavras-chave num só trabalho
  const body = { name: keywords[0], keywords, lang, depth, email, max_time: maxTime, zoom: 13 };
  if (geo) Object.assign(body, { lat: String(geo.lat), lon: String(geo.lon), radius: 15000 });
  let res = await fetch(`${SCRAPER()}/api/v1/jobs`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  if (res.ok) { const j = await res.json(); return { id: j.id || j.job_id, api: 'jobs' }; }
  // Versão nova (POST /api/v1/scrape): uma palavra-chave por trabalho, usamos a principal
  const nb = { keyword: keywords[0], lang, max_depth: depth, email, timeout: 300 };
  if (geo) Object.assign(nb, { geo_coordinates: `${geo.lat},${geo.lon}`, zoom: 13, radius: 15 });
  res = await fetch(`${SCRAPER()}/api/v1/scrape`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(nb) });
  if (!res.ok) throw new Error(`O Caçador (Google Maps) não aceitou o trabalho: HTTP ${res.status}`);
  const j = await res.json();
  return { id: j.job_id || j.id, api: 'scrape' };
}

const distKm = (a, b) => {
  const R = 6371, t = (x) => (x * Math.PI) / 180;
  const dLat = t(b.lat - a.lat), dLon = t(b.lon - a.lon);
  return 2 * R * Math.asin(Math.sqrt(Math.sin(dLat / 2) ** 2 + Math.cos(t(a.lat)) * Math.cos(t(b.lat)) * Math.sin(dLon / 2) ** 2));
};

async function gosomWait(job, onTick) {
  const deadline = Date.now() + 40 * 60e3;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 15e3));
    const res = await fetch(`${SCRAPER()}/api/v1/jobs/${job.id}`);
    if (!res.ok) continue;
    const j = await res.json();
    const st = String(j.status || j.Status || '').toLowerCase();
    onTick?.(st);
    if (['ok', 'completed', 'done'].includes(st)) {
      if (Array.isArray(j.results)) return j.results;
      const csv = await fetch(`${SCRAPER()}/api/v1/jobs/${job.id}/download`);
      if (!csv.ok) throw new Error('Trabalho terminou, mas não foi possível baixar o resultado.');
      return parseCsv(await csv.text());
    }
    if (['failed', 'error', 'cancelled', 'discarded'].includes(st)) throw new Error(`O trabalho falhou (${st}).`);
  }
  throw new Error('O trabalho demorou demais e foi abandonado.');
}

/* ---------- OpenStreetMap (Overpass) ---------- */
const OSM_TAGS = {
  'Clínica de estética': ['shop=beauty'], Odontologia: ['amenity=dentist', 'healthcare=dentist'], Academia: ['leisure=fitness_centre'],
  Restaurante: ['amenity=restaurant'], 'Pet shop': ['shop=pet', 'amenity=veterinary'], Ótica: ['shop=optician'], Advocacia: ['office=lawyer'],
  Barbearia: ['shop=hairdresser'], Fisioterapia: ['healthcare=physiotherapist'], Imobiliária: ['office=estate_agent'], 'Móveis planejados': ['shop=furniture', 'craft=carpenter', 'shop=kitchen'],
};
async function osmSearch(category, city) {
  const tags = OSM_TAGS[category];
  if (!tags) throw new Error('Essa categoria ainda não tem mapeamento no OpenStreetMap.');
  const parts = tags.map((t) => { const [k, v] = t.split('='); return `nwr["${k}"="${v}"](area.a);`; }).join('');
  const query = `[out:json][timeout:60];area["name"="${city.replace(/"/g, '')}"]["boundary"="administrative"]->.a;(${parts});out center tags 300;`;
  const res = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', headers: { 'user-agent': UA, 'content-type': 'application/x-www-form-urlencoded' }, body: `data=${encodeURIComponent(query)}` });
  if (!res.ok) throw new Error(`OpenStreetMap respondeu HTTP ${res.status}`);
  const j = await res.json();
  return j.elements.filter((e) => e.tags?.name).map((e) => {
    const t = e.tags;
    return {
      placeKey: `osm:${e.type}/${e.id}`,
      data: {
        name: t.name, category, contact: '', city, neighborhood: t['addr:suburb'] || '',
        address: [t['addr:street'], t['addr:housenumber']].filter(Boolean).join(', '),
        phone: t.phone || t['contact:phone'] || '', whatsapp: !!(t['contact:whatsapp'] || /^\+?55\s?\d{2}\s?9/.test(t.phone || '')),
        website: host(t.website || t['contact:website'] || ''), site: null,
        instagram: t['contact:instagram'] ? `@${String(t['contact:instagram']).split('/').filter(Boolean).pop()}` : '',
        social: null, email: t.email || t['contact:email'] || '', rating: 0, reviews: 0, unanswered: 0, photos: 0, ads: false,
        hours: t.opening_hours || '', lat: e.lat ?? e.center?.lat, lng: e.lon ?? e.center?.lon,
        tags: [], notes: [], analysis: null, blocked: '', owner: 'David', next: 'Na fila de abordagem',
        palette: CATEGORIES[category]?.palette || ['#F2EFE9', '#14181D', '#00C48C'], brand: null, source: 'osm',
      },
    };
  });
}

/* ---------- leitura do site: Instagram, e-mail, celular, cores ---------- */
const HEX = /#([0-9a-f]{6})\b/gi;
function brandColors(html) {
  const meta = html.match(/<meta[^>]+name=["']theme-color["'][^>]+content=["'](#[0-9a-f]{6})/i)?.[1];
  const counts = {};
  for (const m of html.matchAll(HEX)) {
    const h = `#${m[1].toLowerCase()}`;
    const r = parseInt(h.slice(1, 3), 16), g = parseInt(h.slice(3, 5), 16), b = parseInt(h.slice(5, 7), 16);
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    if (max > 235 && min > 225) continue; // quase branco
    if (max < 30) continue; // quase preto
    if (max - min < 18) continue; // cinza
    counts[h] = (counts[h] || 0) + 1;
  }
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([h]) => h);
  return [...new Set([meta, ...top].filter(Boolean))].slice(0, 3);
}

async function fetchSite(data) {
  const h = data.website;
  const tries = [...new Set([data.websiteUrl, `https://${h}`, `https://www.${h.replace(/^www\./, '')}`, `http://${h}`].filter(Boolean))];
  for (const url of tries) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 15e3);
      const res = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36', 'accept-language': 'pt-BR,pt;q=0.9' }, redirect: 'follow', signal: ctrl.signal });
      clearTimeout(t);
      if (res.ok) return res;
    } catch { /* tenta a próxima forma do endereço */ }
  }
  return null;
}

export async function enrich(data) {
  if (!data.website) return data;
  const started = Date.now();
  try {
    const res = await fetchSite(data);
    if (!res) throw new Error('offline');
    const html = (await res.text()).slice(0, 600_000);
    const ms = Date.now() - started;
    const ig = html.match(/instagram\.com\/([a-z0-9_.]{2,30})/i)?.[1];
    const mail = html.match(/mailto:([^"'?>\s]+)/i)?.[1] || html.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i)?.[0];
    const colors = brandColors(html);
    const abs = (u) => { try { return new URL(u.replace(/&amp;/g, '&'), res.url).href; } catch { return null; } };
    const og = [...html.matchAll(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)/gi)].map((m) => abs(m[1]));
    const imgs = [...html.matchAll(/<img[^>]+(?:data-src|src)=["']([^"']+\.(?:jpe?g|webp|png)(?:\?[^"']*)?)["']/gi)].map((m) => abs(m[1]))
      .filter((u) => u && !/logo|icon|sprite|avatar|whats|favicon|banner-?pix|payment|selo|badge/i.test(u));
    const sitePhotos = [...new Set([...og, ...imgs].filter(Boolean))].slice(0, 10);
    const logo = abs(html.match(/<img[^>]+(?:src)=["']([^"']*logo[^"']*)["']/i)?.[1] || '') || null;
    return {
      ...data,
      instagram: data.instagram || (ig && !['p', 'reel', 'explore', 'accounts'].includes(ig.toLowerCase()) ? `@${ig}` : ''),
      email: data.email || (mail && !/\.(png|jpe?g|webp|svg)$/i.test(mail) ? mail : ''),
      site: {
        mobile: /<meta[^>]+name=["']viewport/i.test(html),
        speed: Math.max(10, Math.min(98, Math.round(100 - ms / 80))),
        booking: /wa\.me|api\.whatsapp|agend|booking|calendly/i.test(html),
        https: res.url.startsWith('https://'),
      },
      brand: colors.length ? { source: 'site', colors, logo } : (logo ? { ...(data.brand || {}), logo } : data.brand),
      sitePhotos,
    };
  } catch {
    return { ...data, site: { mobile: false, speed: 10, booking: false, https: false, offline: true } };
  }
}

/* ---------- execução de uma campanha ---------- */
const running = new Map(); // campaignId -> status

export function huntStatus(id) { return running.get(Number(id)) || null; }

const saveHunt = (id, patch) => q("update campaigns set data = data || $2 where id = $1", [id, patch]);

export async function hunt(campaign, { engine = 'google', log = () => {}, resumeJob = null, startedAt = null } = {}) {
  const id = Number(campaign.id);
  if (running.get(id)?.state === 'running') throw new Error('Essa campanha já está buscando.');
  if ([...running.values()].some((r) => r.state === 'running')) throw new Error('Outra busca está rodando. Uma por vez, para manter o ritmo seguro.');
  const st = { state: 'running', engine, phase: 'busca', step: 'iniciando', found: 0, added: 0, read: 0, total: 0, startedAt: startedAt || Date.now() };
  running.set(id, st);

  (async () => {
    try {
      let items;
      if (engine === 'osm') {
        st.step = 'consultando o OpenStreetMap';
        items = await osmSearch(campaign.category, campaign.city);
      } else {
        st.step = 'buscando no Google Maps';
        const geo = await geocode(campaign.city);
        const keywords = keywordsFor(campaign);
        st.keywords = keywords;
        const job = resumeJob || await gosomCreate({ keywords, depth: Number(campaign.depth) || 10, geo });
        // guarda o trabalho: se o servidor reiniciar, a busca continua de onde parou
        await saveHunt(id, { huntJob: { ...job, engine, startedAt: st.startedAt } });
        const rows = await gosomWait(job, (s) => { st.step = `Google Maps: ${s === 'working' ? 'buscando empresas' : s}`; });
        const all = rows.map((r) => fromGoogle(r, campaign));
        // tira repetidos (o mesmo lugar aparece em várias palavras-chave), fechados e quem está longe demais
        const seen = new Set();
        const radius = Number(campaign.radiusKm) || 30;
        items = all.filter((it) => {
          if (seen.has(it.placeKey)) return false; seen.add(it.placeKey);
          if (/fechado permanentemente|permanently closed/i.test(it.data.status || '')) return false;
          if (it.excluded) { st.offTopic = (st.offTopic || 0) + 1; return false; }
          if (quality(it.data, campaign) !== 'ok') { st.lowQuality = (st.lowQuality || 0) + 1; return false; }
          if (geo && it.data.lat && it.data.lng && distKm(geo, { lat: it.data.lat, lon: it.data.lng }) > radius) { st.far = (st.far || 0) + 1; return false; }
          return true;
        });
        st.raw = all.length;
      }
      st.found = items.length; st.total = items.length; st.phase = 'sites';
      const ai = await kvGet('settings', {});
      for (const [i, it] of items.entries()) {
        st.read = i + 1;
        st.step = `lendo sites (${i + 1}/${items.length})`;
        const exists = await q('select id, data from leads where place_key = $1', [it.placeKey]);
        if (exists.rows.length) {
          // já está no funil: só completa fotos, avaliações e nome limpo
          const cur = exists.rows[0].data; const add = {};
          for (const k of ['brandName', 'gallery', 'reviewSamples', 'hours', 'hoursTable', 'websiteUrl', 'about']) if (it.data[k] && (!cur[k] || !cur[k].length || (k === 'hours' && String(cur[k]).startsWith('{')))) add[k] = it.data[k];
          if (add.gallery) add.photos = add.gallery.length;
          if (cur.category !== it.data.category && campaign.category) add.category = it.data.category;
          if (Object.keys(add).length) await q('update leads set data = data || $2 where id = $1', [exists.rows[0].id, add]);
          continue;
        }
        const data = await enrich(it.data);
        if (ai?.ai?.analyzeOnFind !== false) data.analysis = analyze(data);
        data.campaign = id;
        await q('insert into leads(stage, campaign_id, place_key, data) values ($1, $2, $3, $4) on conflict (place_key) do nothing', ['found', id, it.placeKey, data]);
        st.added++;
        await new Promise((r) => setTimeout(r, 400));
      }
      st.state = 'done'; st.phase = 'fim'; st.step = 'concluído'; st.endedAt = Date.now();
      log(`achou ${st.found} empresas para "${campaign.name}"; ${st.added} novas no funil`);
    } catch (e) {
      st.state = 'error'; st.step = e.message; st.endedAt = Date.now();
      log(`não conseguiu buscar "${campaign.name}": ${e.message}`);
    }
    await saveHunt(id, { huntJob: null, lastHunt: { ...st } }).catch(() => {});
  })();
  return st;
}

/* Ao subir o servidor: retoma buscas que estavam no meio */
export async function resumeHunts(log) {
  const { rows } = await q("select * from campaigns where data->'huntJob' is not null and data->>'huntJob' <> 'null'");
  for (const r of rows) {
    const job = r.data.huntJob;
    try { await hunt({ ...r.data, id: r.id }, { engine: job.engine || 'google', resumeJob: job, startedAt: job.startedAt, log }); } catch { /* outra já rodando */ }
  }
}

export { leadRow };

/* Limpa leads já importados que estão fora do segmento ou abaixo da qualidade (só os ainda não abordados) */
export async function cleanCampaign(id, c) {
  const { rows } = await q("select id, data from leads where campaign_id = $1 and stage = 'found'", [id]);
  const removed = [];
  for (const r of rows) {
    const d = r.data;
    const why = relevance(c.category, d.name, d.googleCategory) !== 'ok' ? 'fora do segmento' : quality(d, c) !== 'ok' ? quality(d, c) : null;
    if (why) removed.push({ id: r.id, name: d.name, why });
  }
  if (removed.length) await q('delete from leads where id = any($1)', [removed.map((x) => x.id)]);
  return { removed: removed.length, detalhes: removed.slice(0, 50) };
}
