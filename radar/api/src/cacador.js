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

/* Linha do Google Maps -> lead */
function fromGoogle(r, campaign) {
  const addr = r.complete_address && typeof r.complete_address === 'object' ? r.complete_address : (() => { try { return JSON.parse(r.complete_address || '{}'); } catch { return {}; } })();
  const category = mapCategory(r.category, campaign?.category);
  return {
    placeKey: r.place_id || r.cid || r.data_id || `${r.title}|${r.address}`,
    data: {
      name: r.title || 'Sem nome',
      category,
      googleCategory: r.category || '',
      contact: '',
      city: addr.city || campaign?.city || '',
      neighborhood: addr.borough || addr.neighborhood || '',
      address: r.address || '',
      phone: r.phone || '',
      whatsapp: /^\(?\d{2}\)?\s?9/.test(String(r.phone || '').replace(/^\+55\s?/, '')),
      website: host(r.website || r.web_site || ''),
      site: null,
      instagram: '',
      social: null,
      email: firstEmail(r.emails),
      rating: num(r.review_rating),
      reviews: Math.round(num(r.review_count)),
      unanswered: 0,
      photos: 0,
      ads: false,
      hours: typeof r.open_hours === 'string' ? r.open_hours.slice(0, 80) : '',
      lat: num(r.latitude), lng: num(r.longitude),
      mapsUrl: r.link || '',
      tags: [], notes: [], analysis: null, blocked: '', owner: 'David',
      next: 'Na fila de abordagem',
      palette: CATEGORIES[category]?.palette || ['#F2EFE9', '#14181D', '#00C48C'],
      brand: null,
      source: 'google',
    },
  };
}

/* ---------- gosom: cria o trabalho e espera ---------- */
async function gosomCreate({ keyword, lang = 'pt', depth = 1, email = true, maxTime = 600 }) {
  // Versão web clássica do projeto
  let res = await fetch(`${SCRAPER()}/api/v1/jobs`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: keyword, keywords: [keyword], lang, depth, email, max_time: maxTime, zoom: 15 }),
  });
  if (res.ok) { const j = await res.json(); return { id: j.id || j.job_id, api: 'jobs' }; }
  // Versão nova (POST /api/v1/scrape)
  res = await fetch(`${SCRAPER()}/api/v1/scrape`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ keyword, lang, max_depth: depth, email, timeout: Math.min(maxTime, 300) }),
  });
  if (!res.ok) throw new Error(`O Caçador (Google Maps) não aceitou o trabalho: HTTP ${res.status}`);
  const j = await res.json();
  return { id: j.job_id || j.id, api: 'scrape' };
}

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

export async function enrich(data) {
  if (!data.website) return data;
  const started = Date.now();
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 12e3);
    const res = await fetch(`https://${data.website}`, { headers: { 'user-agent': UA }, redirect: 'follow', signal: ctrl.signal });
    clearTimeout(t);
    const html = (await res.text()).slice(0, 600_000);
    const ms = Date.now() - started;
    const ig = html.match(/instagram\.com\/([a-z0-9_.]{2,30})/i)?.[1];
    const mail = html.match(/mailto:([^"'?>\s]+)/i)?.[1] || html.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i)?.[0];
    const colors = brandColors(html);
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
      brand: colors.length ? { source: 'site', colors } : data.brand,
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
        const job = resumeJob || await gosomCreate({ keyword: campaign.query, depth: Number(campaign.depth) || 1 });
        // guarda o trabalho: se o servidor reiniciar, a busca continua de onde parou
        await saveHunt(id, { huntJob: { ...job, engine, startedAt: st.startedAt } });
        const rows = await gosomWait(job, (s) => { st.step = `Google Maps: ${s === 'working' ? 'buscando empresas' : s}`; });
        items = rows.map((r) => fromGoogle(r, campaign));
      }
      st.found = items.length; st.total = items.length; st.phase = 'sites';
      const ai = await kvGet('settings', {});
      for (const [i, it] of items.entries()) {
        st.read = i + 1;
        st.step = `lendo sites (${i + 1}/${items.length})`;
        const exists = await q('select 1 from leads where place_key = $1', [it.placeKey]);
        if (exists.rows.length) continue;
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
