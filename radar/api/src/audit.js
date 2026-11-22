// Diagnóstico real do site de um lead: tecnologia, anúncios, rastreamento, abandono e velocidade (Google PageSpeed).
// Tudo vira fato concreto para a análise e para a primeira mensagem.

const CNPJ_RE = /\b(\d{2})\.?(\d{3})\.?(\d{3})\/?(\d{4})-?(\d{2})\b/;

export function extractCnpj(text = '') {
  const m = String(text).match(CNPJ_RE);
  if (!m) return null;
  const d = m.slice(1).join('');
  return validCnpj(d) ? d : null;
}
export function validCnpj(d) {
  if (!/^\d{14}$/.test(d) || /^(\d)\1+$/.test(d)) return false;
  const calc = (len) => {
    const w = len === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const sum = w.reduce((s, x, i) => s + x * Number(d[i]), 0);
    const r = sum % 11;
    return r < 2 ? 0 : 11 - r;
  };
  return calc(12) === Number(d[12]) && calc(13) === Number(d[13]);
}

/* Leitura do HTML: o que o site usa e o que falta */
export function auditHtml(html = '', finalUrl = '') {
  const has = (re) => re.test(html);
  const platform = has(/wp-content|wp-includes/i) ? 'WordPress' : has(/wixstatic|_wixCss|wix\.com/i) ? 'Wix' : has(/cdn\.shopify|Shopify\.theme/i) ? 'Shopify'
    : has(/squarespace/i) ? 'Squarespace' : has(/nuvemshop|lojanuvem/i) ? 'Nuvemshop' : has(/webflow/i) ? 'Webflow' : has(/elementor/i) ? 'WordPress (Elementor)' : null;
  const years = [...html.matchAll(/(?:©|&copy;|copyright)\s*(?:\d{4}\s*[-–]\s*)?(\d{4})/gi)].map((m) => Number(m[1])).filter((y) => y > 2000 && y <= new Date().getFullYear());
  const copyrightYear = years.length ? Math.max(...years) : null;
  return {
    platform,
    https: finalUrl.startsWith('https://'),
    mobileViewport: has(/<meta[^>]+name=["']viewport/i),
    metaPixel: has(/connect\.facebook\.net\/[^"']+\/fbevents\.js|fbq\(\s*['"]init/i),
    googleAds: has(/googleadservices\.com|gtag\(\s*['"]config['"]\s*,\s*['"]AW-|AW-\d{6,}/i),
    analytics: has(/gtag\/js\?id=G-|google-analytics\.com|googletagmanager\.com\/gtm\.js/i),
    whatsappButton: has(/wa\.me\/|api\.whatsapp\.com\/send|whatsapp:\/\//i),
    booking: has(/calendly|agendar|agendamento|booking|reserv/i),
    form: has(/<form[\s>]/i),
    copyrightYear,
    abandoned: copyrightYear ? new Date().getFullYear() - copyrightYear >= 3 : false,
    cnpj: extractCnpj(html.replace(/<[^>]+>/g, ' ')),
  };
}

/* Google PageSpeed Insights (oficial e gratuito; PAGESPEED_API_KEY opcional aumenta a cota) */
export async function pagespeed(url) {
  const key = process.env.PAGESPEED_API_KEY ? `&key=${process.env.PAGESPEED_API_KEY}` : '';
  try {
    const r = await fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=mobile&category=performance${key}`, { signal: AbortSignal.timeout(60000) });
    if (!r.ok) return null;
    const j = await r.json();
    const lh = j.lighthouseResult;
    if (!lh) return null;
    const a = lh.audits || {};
    return {
      score: Math.round((lh.categories?.performance?.score ?? 0) * 100),
      lcp: a['largest-contentful-paint']?.displayValue || null,
      cls: a['cumulative-layout-shift']?.displayValue || null,
      tbt: a['total-blocking-time']?.displayValue || null,
      at: Date.now(),
    };
  } catch { return null; }
}

/* Avaliações: sem resposta do dono, reclamações e elogios (quando o Caçador traz avaliações extras) */
export function reviewInsights(rawReviews = []) {
  const list = (Array.isArray(rawReviews) ? rawReviews : []).map((x) => ({
    rating: Number(x.Rating ?? x.rating ?? 0),
    text: String(x.Description ?? x.description ?? x.text ?? '').trim(),
    answered: !!(x.OwnerResponse || x.owner_response || x.Response || x.response || x.ReplyText),
    name: x.Name || x.name || '',
  })).filter((x) => x.rating);
  if (!list.length) return null;
  const answeredInfo = list.some((x) => x.answered);
  const unanswered = list.filter((x) => !x.answered).length;
  return {
    sample: list.length,
    unansweredPct: answeredInfo || list.length >= 8 ? Math.round((unanswered / list.length) * 100) : null,
    complaints: list.filter((x) => x.rating <= 3 && x.text.length > 20).slice(0, 3).map((x) => ({ rating: x.rating, text: x.text.slice(0, 240) })),
  };
}
