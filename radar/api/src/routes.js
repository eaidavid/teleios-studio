// Rotas REST. Espelham as ações do painel (web/src/data/store.js).
import { randomBytes } from 'node:crypto';
import { q, leadRow, siteRow, kvGet, kvSet, requestRow } from './db.js';
import { analyze } from '../../web/src/data/analysis.js';
import { seedBots, seedSettings } from '../../web/src/data/seed.js';
import { hunt, huntStatus } from './cacador.js';

const SPLIT = ['id', 'stage', 'campaign', 'createdAt'];
const dataOf = (obj) => Object.fromEntries(Object.entries(obj).filter(([k]) => !SPLIT.includes(k)));

export const previewUrl = (slug) => `${(process.env.PREVIEW_URL || `${process.env.PUBLIC_URL || ''}/p`).replace(/\/$/, '')}/${slug}`;

export function slugify(t) {
  return String(t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/&/g, 'e').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
}
async function uniqueSlug(name) {
  const base = slugify(name) || 'previa';
  for (let i = 0; i < 20; i++) {
    const s = i ? `${base}-${randomBytes(2).toString('hex')}` : base;
    const { rows } = await q('select 1 from sites where slug = $1', [s]);
    if (!rows.length) return s;
  }
  return `${base}-${randomBytes(4).toString('hex')}`;
}

export async function getLead(id) {
  const { rows } = await q('select * from leads where id = $1', [id]);
  return rows[0] ? leadRow(rows[0]) : null;
}
export async function patchLead(id, patch) {
  const cur = await getLead(id);
  if (!cur) return null;
  const next = { ...cur, ...patch };
  const { rows } = await q('update leads set stage = $2, campaign_id = $3, data = $4, updated_at = now() where id = $1 returning *', [id, next.stage, next.campaign ?? null, dataOf(next)]);
  return leadRow(rows[0]);
}
export async function logActivity(bot, text) {
  await q('insert into activity(bot, text) values ($1, $2)', [bot, text]);
}

/* Cria ou atualiza a prévia de um lead e devolve com o link público */
export async function upsertSite({ lead, data, direction, html }) {
  const l = await getLead(lead);
  if (!l) throw new Error(`Lead ${lead} não existe.`);
  const { rows: cur } = await q('select * from sites where lead_id = $1', [lead]);
  let row;
  if (cur[0]) {
    ({ rows: [row] } = await q('update sites set data = coalesce($2, data), direction = coalesce($3, direction), html = $4, updated_at = now() where lead_id = $1 returning *', [lead, data ?? null, direction ?? null, html ?? null]));
  } else {
    const slug = await uniqueSlug(l.name);
    ({ rows: [row] } = await q('insert into sites(lead_id, slug, data, direction, html) values ($1, $2, $3, $4, $5) returning *', [lead, slug, data || {}, direction ?? null, html ?? null]));
  }
  const site = siteRow(row);
  return { ...site, url: previewUrl(site.slug) };
}

export function registerRoutes(app) {
  app.get('/api/health', async () => ({ ok: true }));

  /* Estado completo para o painel */
  app.get('/api/state', async () => {
    const [leads, campaigns, sites, convs, act, reqs] = await Promise.all([
      q('select * from leads order by created_at desc'),
      q('select * from campaigns order by created_at desc'),
      q('select * from sites'),
      q('select * from conversations'),
      q('select bot, text, extract(epoch from at) * 1000 as at from activity order by at desc limit 30'),
      q("select * from requests where status = 'pending' or done_at > now() - interval '3 days' order by created_at desc limit 200"),
    ]);
    const conversations = {}; const control = {};
    convs.rows.forEach((c) => { conversations[c.lead_id] = c.messages; control[c.lead_id] = c.control; });
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const sentToday = (await q("select count(*)::int as n from leads where (data->>'lastContactAt')::bigint >= $1", [today.getTime()])).rows[0].n;
    return {
      leads: leads.rows.map(leadRow),
      campaigns: campaigns.rows.map((r) => ({ ...r.data, id: r.id, createdAt: new Date(r.created_at).getTime(), hunt: huntStatus(r.id) })),
      sites: sites.rows.map((r) => ({ ...siteRow(r), url: previewUrl(r.slug) })),
      conversations, control,
      bots: await kvGet('bots', seedBots),
      settings: await kvGet('settings', { ...seedSettings, whatsapp: { connected: false, number: '', warmupDay: 0, warmupTotal: 14 }, ai: { ...seedSettings.ai, keyConfigured: false } }),
      approvals: await kvGet('approvals', []),
      activity: act.rows.map((a) => ({ ...a, at: Number(a.at) })),
      sentToday,
      requests: reqs.rows.map(requestRow),
    };
  });

  /* ---------- Leads ---------- */
  app.post('/api/leads', async (req) => {
    const body = req.body || {};
    const lead = { tags: [], notes: [], analysis: null, ...body };
    const { rows } = await q('insert into leads(stage, campaign_id, data) values ($1, $2, $3) returning *', [lead.stage || 'found', lead.campaign ?? null, dataOf(lead)]);
    return leadRow(rows[0]);
  });
  app.patch('/api/leads/:id', async (req, reply) => {
    const l = await patchLead(Number(req.params.id), req.body || {});
    return l || reply.code(404).send({ error: 'Lead não encontrado.' });
  });
  app.post('/api/leads/bulk', async (req) => {
    const { ids = [], op, stage, tag } = req.body || {};
    const list = ids.map(Number);
    if (op === 'delete') {
      const { rows } = await q('delete from leads where id = any($1) returning *', [list]);
      return { removed: rows.map(leadRow) };
    }
    for (const id of list) {
      const l = await getLead(id);
      if (!l) continue;
      if (op === 'move') await patchLead(id, { stage, lastContactAt: Date.now() });
      if (op === 'tag' && !l.tags?.includes(tag)) await patchLead(id, { tags: [...(l.tags || []), tag] });
    }
    return { ok: true };
  });
  app.post('/api/leads/restore', async (req) => {
    for (const l of req.body?.leads || []) {
      await q('insert into leads(id, stage, campaign_id, data, created_at) values ($1, $2, $3, $4, to_timestamp($5 / 1000.0)) on conflict (id) do nothing', [l.id, l.stage, l.campaign ?? null, dataOf(l), l.createdAt || Date.now()]);
    }
    return { ok: true };
  });
  app.post('/api/leads/:id/analyze', async (req, reply) => {
    const l = await getLead(Number(req.params.id));
    if (!l) return reply.code(404).send({ error: 'Lead não encontrado.' });
    return patchLead(l.id, { analysis: { ...analyze(l), by: 'regras' } });
  });

  /* ---------- Campanhas ---------- */
  app.post('/api/campaigns', async (req) => {
    const c = { status: 'running', ...req.body };
    delete c.id; delete c.createdAt; delete c.hunt;
    const { rows } = await q('insert into campaigns(data) values ($1) returning *', [c]);
    return { ...rows[0].data, id: rows[0].id, createdAt: new Date(rows[0].created_at).getTime() };
  });
  app.patch('/api/campaigns/:id', async (req) => {
    const c = { ...req.body }; delete c.id; delete c.createdAt; delete c.hunt;
    await q('update campaigns set data = data || $2 where id = $1', [Number(req.params.id), c]);
    return { ok: true };
  });
  app.delete('/api/campaigns/:id', async (req) => {
    await q('delete from campaigns where id = $1', [Number(req.params.id)]);
    return { ok: true };
  });
  app.post('/api/campaigns/restore', async (req) => {
    const c = req.body || {};
    await q('insert into campaigns(id, data, created_at) values ($1, $2, to_timestamp($3 / 1000.0)) on conflict (id) do nothing', [c.id, dataOf(c), c.createdAt || Date.now()]);
    return { ok: true };
  });
  app.post('/api/campaigns/:id/hunt', async (req, reply) => {
    const { rows } = await q('select * from campaigns where id = $1', [Number(req.params.id)]);
    if (!rows[0]) return reply.code(404).send({ error: 'Campanha não encontrada.' });
    try {
      return await hunt({ ...rows[0].data, id: rows[0].id }, { engine: req.body?.engine || 'google', log: (t) => logActivity('cacador', t) });
    } catch (e) { return reply.code(409).send({ error: e.message }); }
  });
  app.get('/api/campaigns/:id/hunt', async (req) => huntStatus(req.params.id) || { state: 'idle' });

  /* ---------- Conversas ---------- */
  const pushMsg = async (lead, msg, control) => {
    await q(`insert into conversations(lead_id, control, messages) values ($1, coalesce($3, 'bot'), jsonb_build_array($2::jsonb))
             on conflict (lead_id) do update set messages = conversations.messages || jsonb_build_array($2::jsonb), control = coalesce($3, conversations.control)`, [lead, msg, control ?? null]);
  };
  app.post('/api/conversations/:id/control', async (req) => {
    const who = req.body?.who;
    await pushMsg(Number(req.params.id), { sys: true, text: who === 'me' ? 'Você assumiu · o robô parou' : 'Devolvida ao robô', at: Date.now() }, who);
    return { ok: true };
  });
  app.post('/api/conversations/:id/send', async (req) => {
    // O envio real pelo WhatsApp entra na fase do Baileys; por ora registra a mensagem.
    await pushMsg(Number(req.params.id), { t: 'out', by: 'Você', me: true, text: String(req.body?.text || ''), at: Date.now() });
    return { ok: true };
  });
  app.post('/api/conversations/:id/resolve', async (req) => {
    await q("update conversations set control = 'done' where lead_id = $1", [Number(req.params.id)]);
    return { ok: true };
  });

  /* ---------- Aprovações, robôs, configurações ---------- */
  app.post('/api/approvals/:lead/approve', async (req) => {
    const list = await kvGet('approvals', []);
    await kvSet('approvals', list.filter((a) => a.lead !== Number(req.params.lead)));
    return { ok: true };
  });
  app.patch('/api/bots/:id', async (req) => {
    const bots = await kvGet('bots', seedBots);
    await kvSet('bots', bots.map((b) => (b.id === req.params.id ? { ...b, ...req.body } : b)));
    return { ok: true };
  });
  app.patch('/api/settings/:section', async (req) => {
    const s = await kvGet('settings', seedSettings);
    await kvSet('settings', { ...s, [req.params.section]: { ...s[req.params.section], ...req.body } });
    return { ok: true };
  });

  /* ---------- Fila do Claude ---------- */
  app.post('/api/requests', async (req, reply) => {
    const { kind, leads = [], payload = {} } = req.body || {};
    if (!['previa', 'analise', 'busca'].includes(kind)) return reply.code(400).send({ error: 'Tipo de pedido inválido.' });
    const out = [];
    const targets = kind === 'busca' ? [null] : leads.map(Number);
    for (const lead of targets) {
      if (!lead && payload.texto) {
        const dup = await q("select * from requests where kind = 'busca' and status = 'pending' and lower(payload->>'texto') = lower($1)", [payload.texto]);
        if (dup.rows[0]) { out.push(requestRow(dup.rows[0])); continue; }
      }
      if (lead) {
        const dup = await q("select * from requests where kind = $1 and lead_id = $2 and status = 'pending'", [kind, lead]);
        if (dup.rows[0]) { out.push(requestRow(dup.rows[0])); continue; }
      }
      const { rows } = await q('insert into requests(kind, lead_id, payload) values ($1, $2, $3) returning *', [kind, lead, payload]);
      out.push(requestRow(rows[0]));
    }
    return out;
  });
  app.delete('/api/requests/:id', async (req) => {
    await q("delete from requests where id = $1 and status = 'pending'", [Number(req.params.id)]);
    return { ok: true };
  });

  /* ---------- Sites-prévia ---------- */
  app.post('/api/sites', async (req, reply) => {
    const { lead, data, direction, html } = req.body || {};
    try { return await upsertSite({ lead: Number(lead), data, direction, html }); } catch (e) { return reply.code(400).send({ error: e.message }); }
  });
  app.post('/api/sites/:id/sent', async (req) => {
    await q('update sites set sent_at = now() where id = $1', [Number(req.params.id)]);
    return { ok: true };
  });

  /* Público: dados da prévia para a página /p/:slug */
  app.get('/api/public/sites/:slug', async (req, reply) => {
    const { rows } = await q('select s.*, l.data as lead_data, l.id as lid from sites s join leads l on l.id = s.lead_id where s.slug = $1', [req.params.slug]);
    if (!rows[0]) return reply.code(404).send({ error: 'Prévia não encontrada.' });
    const r = rows[0]; const d = r.lead_data;
    // Só o necessário para montar a página (sem notas, análise ou dados internos)
    const lead = { id: r.lid, name: d.name, category: d.category, city: d.city, neighborhood: d.neighborhood, address: d.address, phone: d.phone, instagram: d.instagram, rating: d.rating, reviews: d.reviews, hours: d.hours, palette: d.palette };
    return { lead, data: r.data };
  });
}
