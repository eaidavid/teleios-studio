// Estado da aplicação.
// Dois modos, mesma interface de ações:
//  - "api": rodando no servidor (VPS). Lê e grava no Postgres pela API, com login.
//  - "demo": sem servidor (ex.: artifact). Dados fictícios no navegador (localStorage).
// As telas atualizam na hora (otimista) e a API confirma em segundo plano.
import { useSyncExternalStore } from 'react';
import { analyze } from './analysis';
import { makeLead, seedBots, seedCampaigns, seedConversations, seedLeads, seedSettings } from './seed';

const KEY = 'teleios-radar-v3';

function fresh() {
  const leads = seedLeads().map((l, i) => (i < 40 ? { ...l, analysis: analyze(l) } : l));
  return {
    leads,
    campaigns: seedCampaigns,
    conversations: seedConversations,
    control: { 1: 'bot', 2: 'bot', 3: 'bot' },
    bots: seedBots,
    settings: seedSettings,
    sentToday: 23,
    activity: [
      { bot: 'cacador', text: 'achou 41 empresas para "Clínicas de estética · Sorocaba"', at: Date.now() - 4 * 36e5 },
      { bot: 'analista', text: 'analisou 17 empresas; 9 com oportunidade acima de 80', at: Date.now() - 3.8 * 36e5 },
      { bot: 'redator', text: 'escreveu 23 primeiras mensagens; 2 esperam sua aprovação', at: Date.now() - 3.5 * 36e5 },
      { bot: 'followup', text: 'voltou a falar com 9 empresas que não responderam', at: Date.now() - 1.2 * 36e5 },
      { bot: 'triagem', text: 'separou 3 respostas quentes e parou o robô nessas conversas', at: Date.now() - 0.6 * 36e5 },
    ],
    approvals: [{ lead: 5 }, { lead: 9 }],
    sites: [],
    requests: [],
  };
}

const empty = () => ({ requests: [], leads: [], campaigns: [], conversations: {}, control: {}, bots: seedBots, settings: seedSettings, sentToday: 0, activity: [], approvals: [], sites: [] });

function loadLocal() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { requests: [], ...JSON.parse(raw) };
  } catch { /* sem armazenamento disponível */ }
  return fresh();
}

let state = { ...empty(), session: { mode: 'loading', user: null } };
const subs = new Set();
const isApi = () => state.session.mode === 'api';
function set(next) {
  state = typeof next === 'function' ? next(state) : next;
  if (state.session.mode === 'demo') {
    const { session, ...rest } = state;
    try { localStorage.setItem(KEY, JSON.stringify(rest)); } catch { /* ignora */ }
  }
  subs.forEach((f) => f());
}
const subscribe = (f) => { subs.add(f); return () => subs.delete(f); };
export const useStore = (sel = (s) => s) => useSyncExternalStore(subscribe, () => sel(state));
export const getState = () => state;

/* ---------- API ---------- */
async function api(path, method = 'GET', body) {
  const res = await fetch(`./api${path}`, {
    method, credentials: 'same-origin',
    headers: body ? { 'content-type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401) { set((s) => ({ ...s, session: { mode: 'login', user: null } })); throw new Error('Faça login.'); }
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j.error || `Erro ${res.status}`);
  return j;
}
/* Dispara sem travar a tela; se falhar, avisa e recarrega o estado do servidor */
function sync(path, method, body) {
  if (!isApi()) return Promise.resolve();
  return api(path, method, body).catch((e) => {
    window.dispatchEvent(new CustomEvent('radar-error', { detail: e.message }));
    refresh();
  });
}
/* Leads vindos do Caçador têm lat/lng; o mapa do painel usa x/y de 0 a 1 */
function placeOnMap(leads) {
  const geo = leads.filter((l) => Number.isFinite(l.lat) && Number.isFinite(l.lng) && l.lat);
  const [minLat, maxLat] = [Math.min(...geo.map((l) => l.lat)), Math.max(...geo.map((l) => l.lat))];
  const [minLng, maxLng] = [Math.min(...geo.map((l) => l.lng)), Math.max(...geo.map((l) => l.lng))];
  const hash = (n) => ((Math.sin(n * 9301 + 49297) * 233280) % 1 + 1) % 1;
  return leads.map((l) => {
    if (Number.isFinite(l.x)) return l;
    if (geo.includes(l) && maxLat > minLat && maxLng > minLng) {
      return { ...l, x: 0.08 + 0.84 * ((l.lng - minLng) / (maxLng - minLng)), y: 0.1 + 0.8 * (1 - (l.lat - minLat) / (maxLat - minLat)) };
    }
    return { ...l, x: 0.08 + hash(l.id) * 0.84, y: 0.1 + hash(l.id + 7) * 0.8 };
  });
}
async function refresh() {
  const s = await api('/state');
  set((cur) => ({ ...cur, ...s, leads: placeOnMap(s.leads.map((l) => ({ tags: [], notes: [], ...l }))) }));
}

export async function boot() {
  try {
    const h = await fetch('./api/health', { credentials: 'same-origin' });
    const ok = h.ok && (h.headers.get('content-type') || '').includes('json');
    if (!ok) throw new Error('sem servidor');
  } catch {
    set({ ...loadLocal(), session: { mode: 'demo', user: null } });
    return;
  }
  try {
    const user = await api('/me');
    set((s) => ({ ...s, session: { mode: 'api', user } }));
    await refresh();
  } catch { /* api() já pôs em modo login */ }
  // Traz o que o Claude e o Caçador fizeram enquanto a tela está aberta
  setInterval(() => { if (isApi() && document.visibilityState === 'visible' && Date.now() - lastEdit > 5000) refresh().catch(() => {}); }, 20000);
}

export const waApi = (method, action = '') => api(`/whatsapp${action ? `/${action}` : ''}`, method);

export async function login(email, password) {
  const user = await api('/login', 'POST', { email, password });
  set((s) => ({ ...s, session: { mode: 'api', user } }));
  await refresh();
}
export async function logout() {
  await api('/logout', 'POST').catch(() => {});
  set({ ...empty(), session: { mode: 'login', user: null } });
}

/* ---------- helpers ---------- */
const nextId = (arr) => arr.reduce((m, x) => Math.max(m, x.id), 0) + 1;
const leadById = (id) => state.leads.find((l) => l.id === id);
function patchLead(id, fn) {
  const cur = leadById(id);
  if (!cur) return;
  const patch = fn(cur);
  set((s) => ({ ...s, leads: s.leads.map((l) => (l.id === id ? { ...l, ...patch } : l)) }));
  sync(`/leads/${id}`, 'PATCH', patch);
}
const siteTimers = {};
let lastEdit = 0; // evita que a atualização automática atropele uma edição em andamento

export const actions = {
  reset() { if (!isApi()) set({ ...fresh(), session: state.session }); },
  refresh,

  // Leads
  async createLead(data) {
    if (isApi()) {
      const lead = await api('/leads', 'POST', { notes: [], analysis: null, tags: [], ...data, stage: data.stage || 'found' });
      set((s) => ({ ...s, leads: [lead, ...s.leads] }));
      return lead.id;
    }
    const id = nextId(state.leads);
    const lead = { ...makeLead(id), ...data, id, createdAt: Date.now(), notes: [], analysis: null, stage: data.stage || 'found', tags: data.tags || [] };
    set((s) => ({ ...s, leads: [lead, ...s.leads] }));
    return id;
  },
  updateLead(id, data) { patchLead(id, () => data); },
  deleteLeads(ids) {
    const removed = state.leads.filter((l) => ids.includes(l.id));
    set((s) => ({ ...s, leads: s.leads.filter((l) => !ids.includes(l.id)) }));
    sync('/leads/bulk', 'POST', { ids, op: 'delete' });
    return () => {
      set((s) => ({ ...s, leads: [...removed, ...s.leads].sort((a, b) => b.createdAt - a.createdAt) }));
      sync('/leads/restore', 'POST', { leads: removed });
    };
  },
  moveLeads(ids, stage) {
    set((s) => ({ ...s, leads: s.leads.map((l) => (ids.includes(l.id) ? { ...l, stage, lastContactAt: Date.now() } : l)) }));
    sync('/leads/bulk', 'POST', { ids, op: 'move', stage });
  },
  tagLeads(ids, tag) {
    set((s) => ({ ...s, leads: s.leads.map((l) => (ids.includes(l.id) && !l.tags.includes(tag) ? { ...l, tags: [...l.tags, tag] } : l)) }));
    sync('/leads/bulk', 'POST', { ids, op: 'tag', tag });
  },
  async analyzeLead(id) {
    if (isApi()) {
      const lead = await api(`/leads/${id}/analyze`, 'POST');
      set((s) => ({ ...s, leads: s.leads.map((l) => (l.id === id ? lead : l)) }));
      return;
    }
    await new Promise((r) => setTimeout(r, 1400));
    patchLead(id, (l) => ({ analysis: analyze(l) }));
  },
  addNote(id, text) { patchLead(id, (l) => ({ notes: [{ id: Date.now(), text, at: Date.now() }, ...(l.notes || [])] })); },
  updateNote(id, noteId, text) { patchLead(id, (l) => ({ notes: l.notes.map((n) => (n.id === noteId ? { ...n, text } : n)) })); },
  deleteNote(id, noteId) { patchLead(id, (l) => ({ notes: l.notes.filter((n) => n.id !== noteId) })); },

  // Campanhas
  async saveCampaign(c) {
    if (c.id) {
      set((s) => ({ ...s, campaigns: s.campaigns.map((x) => (x.id === c.id ? { ...x, ...c } : x)) }));
      sync(`/campaigns/${c.id}`, 'PATCH', c);
      return c.id;
    }
    if (isApi()) {
      const saved = await api('/campaigns', 'POST', { ...c, status: 'running' });
      set((s) => ({ ...s, campaigns: [saved, ...s.campaigns] }));
      return saved.id;
    }
    const id = nextId(state.campaigns.length ? state.campaigns : [{ id: 0 }]);
    set((s) => ({ ...s, campaigns: [{ ...c, id, createdAt: Date.now(), status: 'running' }, ...s.campaigns] }));
    return id;
  },
  deleteCampaign(id) {
    const removed = state.campaigns.find((c) => c.id === id);
    set((s) => ({ ...s, campaigns: s.campaigns.filter((c) => c.id !== id) }));
    sync(`/campaigns/${id}`, 'DELETE');
    return () => {
      set((s) => ({ ...s, campaigns: [removed, ...s.campaigns] }));
      sync('/campaigns/restore', 'POST', removed);
    };
  },
  toggleCampaign(id) {
    const c = state.campaigns.find((x) => x.id === id);
    const status = c?.status === 'running' ? 'paused' : 'running';
    set((s) => ({ ...s, campaigns: s.campaigns.map((x) => (x.id === id ? { ...x, status } : x)) }));
    sync(`/campaigns/${id}`, 'PATCH', { status });
  },
  /* Acompanha uma busca ao vivo (inclusive as disparadas pelo Claude) */
  watchHunt(id) {
    if (!isApi()) return () => {};
    let n = 0;
    const t = setInterval(async () => {
      try {
        const h = await api(`/campaigns/${id}/hunt`);
        set((s) => ({ ...s, campaigns: s.campaigns.map((c) => (c.id === id ? { ...c, hunt: h } : c)) }));
        if (h.state === 'running' && ++n % 3 === 0) refresh(); // traz os leads que vão entrando
        if (h.state !== 'running' && n % 6 === 0) refresh();
        n += h.state === 'running' ? 0 : 1;
      } catch { /* tenta de novo */ }
    }, 4000);
    return () => clearInterval(t);
  },
  /* Caçador: só no servidor */
  async hunt(id, engine = 'google') {
    if (!isApi()) throw new Error('A busca real roda no servidor. Aqui é só demonstração.');
    const st = await api(`/campaigns/${id}/hunt`, 'POST', { engine });
    set((s) => ({ ...s, campaigns: s.campaigns.map((c) => (c.id === id ? { ...c, hunt: st } : c)) }));
    const poll = setInterval(async () => {
      try {
        const h = await api(`/campaigns/${id}/hunt`);
        set((s) => ({ ...s, campaigns: s.campaigns.map((c) => (c.id === id ? { ...c, hunt: h } : c)) }));
        if (h.state !== 'running') { clearInterval(poll); refresh(); }
      } catch { clearInterval(poll); }
    }, 5000);
  },

  // Conversas
  setControl(id, who) {
    set((s) => ({
      ...s,
      control: { ...s.control, [id]: who },
      conversations: { ...s.conversations, [id]: [...(s.conversations[id] || []), { sys: true, text: who === 'me' ? 'Você assumiu · o robô parou' : 'Devolvida ao robô', at: Date.now() }] },
    }));
    sync(`/conversations/${id}/control`, 'POST', { who });
  },
  send(id, text) {
    set((s) => ({ ...s, conversations: { ...s.conversations, [id]: [...(s.conversations[id] || []), { t: 'out', by: 'Você', me: true, text, at: Date.now() }] } }));
    sync(`/conversations/${id}/send`, 'POST', { text });
  },
  resolve(id) {
    set((s) => ({ ...s, control: { ...s.control, [id]: 'done' } }));
    sync(`/conversations/${id}/resolve`, 'POST');
  },

  // Aprovações
  approve(lead, text) {
    set((s) => ({ ...s, approvals: s.approvals.filter((a) => a.lead !== lead) }));
    sync(`/approvals/${lead}/approve`, 'POST', text ? { text } : {}).then(() => isApi() && refresh());
  },
  rejectApproval(lead) {
    set((s) => ({ ...s, approvals: s.approvals.filter((a) => a.lead !== lead) }));
    sync(`/approvals/${lead}/reject`, 'POST');
  },

  // Robôs e configurações
  toggleBot(id) {
    const b = state.bots.find((x) => x.id === id);
    actions.updateBot(id, { on: !b?.on });
  },
  updateBot(id, data) {
    set((s) => ({ ...s, bots: s.bots.map((b) => (b.id === id ? { ...b, ...data } : b)) }));
    sync(`/bots/${id}`, 'PATCH', data);
  },
  updateSettings(section, data) {
    set((s) => ({ ...s, settings: { ...s.settings, [section]: { ...s.settings[section], ...data } } }));
    sync(`/settings/${section}`, 'PATCH', data);
  },

  // Fila do Claude: pedidos que ele atende quando você diz "faz os pedidos do Radar"
  async request(kind, leads = [], payload = {}) {
    if (isApi()) {
      const made = await api('/requests', 'POST', { kind, leads, payload });
      set((s) => ({ ...s, requests: [...made.filter((r) => !s.requests.some((x) => x.id === r.id)), ...s.requests] }));
      return made;
    }
    const base = nextId(state.requests?.length ? state.requests : [{ id: 0 }]);
    const targets = kind === 'busca' ? [null] : leads.filter((l) => !state.requests.some((r) => r.status === 'pending' && r.kind === kind && r.lead === l));
    const made = targets.map((lead, i) => ({ id: base + i, kind, lead, payload, status: 'pending', createdAt: Date.now() }));
    set((s) => ({ ...s, requests: [...made, ...(s.requests || [])] }));
    return made;
  },
  cancelRequest(id) {
    set((s) => ({ ...s, requests: s.requests.filter((r) => r.id !== id) }));
    sync(`/requests/${id}`, 'DELETE');
  },

  // Sites-prévia (uma por lead; o servidor guarda pela empresa)
  saveSite(site) {
    lastEdit = Date.now();
    const exists = state.sites.some((x) => x.lead === site.lead);
    set((s) => (exists
      ? { ...s, sites: s.sites.map((x) => (x.lead === site.lead ? { ...x, ...site } : x)) }
      : { ...s, sites: [{ ...site, id: site.id || -Date.now(), createdAt: Date.now() }, ...s.sites] }));
    if (!isApi()) return;
    clearTimeout(siteTimers[site.lead]);
    siteTimers[site.lead] = setTimeout(async () => {
      try {
        const cur = state.sites.find((x) => x.lead === site.lead);
        const saved = await api('/sites', 'POST', { lead: site.lead, data: cur.data, direction: cur.direction, html: cur.html });
        if (site.sent && !cur.sentSynced) await api(`/sites/${saved.id}/sent`, 'POST');
        set((s) => ({ ...s, sites: s.sites.map((x) => (x.lead === site.lead ? { ...x, id: saved.id, slug: saved.slug, url: saved.url, sentSynced: x.sent ? true : x.sentSynced } : x)) }));
      } catch (e) { window.dispatchEvent(new CustomEvent('radar-error', { detail: e.message })); }
    }, 700);
  },
};

export function exportCsv(leads) {
  const cols = ['name', 'category', 'contact', 'phone', 'city', 'neighborhood', 'website', 'instagram', 'rating', 'reviews', 'stage'];
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  return [cols.join(';'), ...leads.map((l) => cols.map((c) => esc(l[c])).join(';'))].join('\n');
}
