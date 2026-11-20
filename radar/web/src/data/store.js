// Estado da aplicação. Nesta fase fica no navegador (localStorage).
// A interface das ações é a mesma que a API do backend vai expor depois.
import { useSyncExternalStore } from 'react';
import { analyze } from './analysis';
import { makeLead, seedBots, seedCampaigns, seedConversations, seedLeads, seedSettings } from './seed';

const KEY = 'teleios-radar-v2';

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
  };
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* sem armazenamento disponível */ }
  return fresh();
}

let state = load();
const subs = new Set();
function set(next) {
  state = typeof next === 'function' ? next(state) : next;
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignora */ }
  subs.forEach((f) => f());
}
const subscribe = (f) => { subs.add(f); return () => subs.delete(f); };
export const useStore = (sel = (s) => s) => useSyncExternalStore(subscribe, () => sel(state));
export const getState = () => state;

const nextId = (arr) => arr.reduce((m, x) => Math.max(m, x.id), 0) + 1;
const patchLead = (id, fn) => set((s) => ({ ...s, leads: s.leads.map((l) => (l.id === id ? { ...l, ...fn(l) } : l)) }));

export const actions = {
  reset() { set(fresh()); },

  // Leads
  createLead(data) {
    const id = nextId(state.leads);
    const base = makeLead(id);
    const lead = { ...base, ...data, id, createdAt: Date.now(), notes: [], analysis: null, stage: data.stage || 'found', tags: data.tags || [] };
    set((s) => ({ ...s, leads: [lead, ...s.leads] }));
    return id;
  },
  updateLead(id, data) { patchLead(id, () => data); },
  deleteLeads(ids) {
    const removed = state.leads.filter((l) => ids.includes(l.id));
    set((s) => ({ ...s, leads: s.leads.filter((l) => !ids.includes(l.id)) }));
    return () => set((s) => ({ ...s, leads: [...removed, ...s.leads].sort((a, b) => b.createdAt - a.createdAt) }));
  },
  moveLeads(ids, stage) {
    set((s) => ({ ...s, leads: s.leads.map((l) => (ids.includes(l.id) ? { ...l, stage, lastContactAt: Date.now() } : l)) }));
  },
  tagLeads(ids, tag) {
    set((s) => ({ ...s, leads: s.leads.map((l) => (ids.includes(l.id) && !l.tags.includes(tag) ? { ...l, tags: [...l.tags, tag] } : l)) }));
  },
  analyzeLead(id) {
    return new Promise((res) => setTimeout(() => {
      patchLead(id, (l) => ({ analysis: analyze(l) }));
      res();
    }, 1400));
  },
  addNote(id, text) { patchLead(id, (l) => ({ notes: [{ id: Date.now(), text, at: Date.now() }, ...l.notes] })); },
  updateNote(id, noteId, text) { patchLead(id, (l) => ({ notes: l.notes.map((n) => (n.id === noteId ? { ...n, text } : n)) })); },
  deleteNote(id, noteId) { patchLead(id, (l) => ({ notes: l.notes.filter((n) => n.id !== noteId) })); },

  // Campanhas
  saveCampaign(c) {
    set((s) => (c.id
      ? { ...s, campaigns: s.campaigns.map((x) => (x.id === c.id ? { ...x, ...c } : x)) }
      : { ...s, campaigns: [{ ...c, id: nextId(s.campaigns), createdAt: Date.now(), status: 'running' }, ...s.campaigns] }));
  },
  deleteCampaign(id) {
    const removed = state.campaigns.find((c) => c.id === id);
    set((s) => ({ ...s, campaigns: s.campaigns.filter((c) => c.id !== id) }));
    return () => set((s) => ({ ...s, campaigns: [removed, ...s.campaigns] }));
  },
  toggleCampaign(id) { set((s) => ({ ...s, campaigns: s.campaigns.map((c) => (c.id === id ? { ...c, status: c.status === 'running' ? 'paused' : 'running' } : c)) })); },

  // Conversas
  setControl(id, who) {
    set((s) => ({
      ...s,
      control: { ...s.control, [id]: who },
      conversations: { ...s.conversations, [id]: [...(s.conversations[id] || []), { sys: true, text: who === 'me' ? 'Você assumiu · o robô parou' : 'Devolvida ao robô', at: Date.now() }] },
    }));
  },
  send(id, text) {
    set((s) => ({ ...s, conversations: { ...s.conversations, [id]: [...(s.conversations[id] || []), { t: 'out', by: 'Você', me: true, text, at: Date.now() }] } }));
  },
  resolve(id) { set((s) => ({ ...s, control: { ...s.control, [id]: 'done' } })); },

  // Aprovações
  approve(lead) { set((s) => ({ ...s, approvals: s.approvals.filter((a) => a.lead !== lead), sentToday: s.sentToday + 1 })); },

  // Robôs e configurações
  toggleBot(id) { set((s) => ({ ...s, bots: s.bots.map((b) => (b.id === id ? { ...b, on: !b.on } : b)) })); },
  updateBot(id, data) { set((s) => ({ ...s, bots: s.bots.map((b) => (b.id === id ? { ...b, ...data } : b)) })); },
  updateSettings(section, data) { set((s) => ({ ...s, settings: { ...s.settings, [section]: { ...s.settings[section], ...data } } })); },

  // Sites-prévia
  saveSite(site) {
    set((s) => (site.id
      ? { ...s, sites: s.sites.map((x) => (x.id === site.id ? site : x)) }
      : { ...s, sites: [{ ...site, id: nextId(s.sites.length ? s.sites : [{ id: 0 }]), createdAt: Date.now() }, ...s.sites] }));
  },
};

export function exportCsv(leads) {
  const cols = ['name', 'category', 'contact', 'phone', 'city', 'neighborhood', 'website', 'instagram', 'rating', 'reviews', 'stage'];
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  return [cols.join(';'), ...leads.map((l) => cols.map((c) => esc(l[c])).join(';'))].join('\n');
}
