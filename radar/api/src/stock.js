// Fotos de banco gratuito para quando a empresa não tem fotos no Google nem no site.
// Ordem: Pexels (se PEXELS_API_KEY estiver configurada) → Openverse (CC0/domínio público, sem chave).
// As fotos entram marcadas como ilustrativas (o site mostra "Imagens ilustrativas").
import { kvGet, kvSet } from './db.js';

/* Buscas em inglês por segmento (os bancos respondem melhor em inglês); várias, para variar entre empresas */
const QUERIES = {
  'Móveis planejados': ['modern kitchen cabinets', 'walk in closet wood', 'minimalist living room wood', 'woodworking workshop', 'custom furniture interior', 'wooden kitchen interior'],
  'Clínica de estética': ['skincare spa treatment', 'facial treatment clinic', 'beauty salon interior', 'spa relaxing', 'cosmetics skincare'],
  Odontologia: ['dental clinic', 'dentist office', 'smiling woman teeth', 'dental care'],
  Academia: ['gym workout', 'fitness training weights', 'crossfit gym', 'gym interior'],
  Restaurante: ['restaurant food plate', 'restaurant interior', 'chef cooking kitchen', 'brazilian food'],
  'Pet shop': ['dog grooming', 'pet shop dog', 'veterinarian dog', 'happy dog'],
  Ótica: ['eyeglasses shop', 'optical store glasses', 'woman wearing glasses', 'eyewear'],
  Advocacia: ['law office', 'lawyer meeting', 'legal books office', 'business meeting office'],
  Barbearia: ['barbershop', 'barber haircut', 'barber shop interior', 'beard trim'],
  Fisioterapia: ['physiotherapy', 'physical therapy clinic', 'pilates studio', 'rehabilitation exercise'],
  Imobiliária: ['modern house exterior', 'apartment interior', 'real estate house', 'living room apartment'],
};
const hash = (s) => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };

async function pexels(query, page) {
  const key = process.env.PEXELS_API_KEY;
  if (!key) return null;
  const r = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=15&page=${page}&orientation=landscape`, { headers: { authorization: key }, signal: AbortSignal.timeout(10000) });
  if (!r.ok) return null;
  const j = await r.json();
  return (j.photos || []).map((p) => ({ url: p.src.large2x || p.src.large, credit: `Foto: ${p.photographer} / Pexels`, link: p.url }));
}

async function openverse(query, page) {
  const base = 'https://api.openverse.org/v1/images/';
  const params = `q=${encodeURIComponent(query)}&page_size=20&page=${page}&license=cc0,pdm&aspect_ratio=wide&category=photograph`;
  const r = await fetch(`${base}?${params}&source=stocksnap,rawpixel`, { headers: { 'user-agent': 'TeleiosRadar/1.0' }, signal: AbortSignal.timeout(12000) });
  if (!r.ok) return null;
  let rs = (await r.json()).results || [];
  if (rs.length < 6) {
    const r2 = await fetch(`${base}?${params}&source=wikimedia`, { headers: { 'user-agent': 'TeleiosRadar/1.0' }, signal: AbortSignal.timeout(12000) });
    if (r2.ok) rs = rs.concat(((await r2.json()).results || []).filter((x) => x.width && x.width <= 5000));
  }
  const archive = /library ?of ?congress|national archives|smithsonian|museum|archive|public domain review|nypl|met museum|navy|army|military|air force|marine corps|government|nasa/i;
  return rs.filter((x) => x.url && (/\.(jpe?g|webp|png)($|\?)/i.test(x.url) || /rawpixel|stocksnap/.test(x.url)) && !archive.test(`${x.creator} ${x.title}`) && !/vintage|illustration|drawing|poster|engraving|painting|antique|\b1[89]\d\d\b/i.test(x.title || ''))
    .map((x) => ({ url: x.url, credit: x.creator ? `Foto: ${x.creator}` : 'Domínio público', link: x.foreign_landing_url }));
}

/* Fotos para um lead: estáveis por empresa (cada uma recebe um conjunto diferente) */
export async function stockPhotosFor(lead, n = 8, custom) {
  const list = custom ? [custom] : (QUERIES[lead.category] || [`${lead.googleCategory || lead.category || 'local business'}`]);
  const seed = hash(`${lead.id}-${lead.name}`);
  const out = [];
  for (let k = 0; k < Math.min(list.length, 4) && out.length < n; k++) {
    const query = list[(seed + k) % list.length];
    const page = 1;
    const cacheKey = `stock:${query}:${page}`;
    let photos = await kvGet(cacheKey, null);
    if (!photos) {
      try { photos = (await pexels(query, page)) || (await openverse(query, page)) || []; } catch { photos = []; }
      if (photos.length) await kvSet(cacheKey, photos);
    }
    const start = seed % Math.max(1, photos.length);
    for (let i = 0; i < photos.length && out.length < n; i++) {
      const p = photos[(start + i) % photos.length];
      if (!out.some((o) => o.url === p.url)) out.push(p);
      if (i >= 2 && out.length >= Math.ceil(n / Math.min(list.length, 3)) * (k + 1)) break; // mistura buscas
    }
  }
  return out.slice(0, n);
}

/* Garante fotos para montar o site: usa as reais; sem reais, busca no banco e guarda no lead */
export async function ensurePhotos(lead, patchLead) {
  const real = (lead.gallery?.length || 0) + (lead.sitePhotos?.length || 0);
  if (real >= 3 || lead.stockPhotos?.length) return lead;
  const stock = await stockPhotosFor(lead, 8).catch(() => []);
  if (!stock.length) return lead;
  await patchLead(lead.id, { stockPhotos: stock });
  return { ...lead, stockPhotos: stock };
}
