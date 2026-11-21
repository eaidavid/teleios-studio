import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowDown, ArrowUp, Check, ChevronDown, ChevronLeft, ChevronRight, Download, Filter, Globe, Instagram, MessageCircle, Minus, Pencil, Plus, Search, SlidersHorizontal, Tag, Trash2, Users, X,
} from 'lucide-react';
import { actions, exportCsv, useStore } from '../data/store';
import { CATEGORIES, STAGES } from '../data/seed';
import { useApp } from '../App';
import { Avatar, Empty, Popover, ScoreRing, StageChip, ago, ease, toast } from '../components/ui';

const PRESENCE = [
  { id: 'nosite', label: 'Sem site', test: (l) => !l.website },
  { id: 'noig', label: 'Sem Instagram', test: (l) => !l.instagram },
  { id: 'igstop', label: 'Instagram parado (30+ dias)', test: (l) => l.social && l.social.lastPostDays > 30 },
  { id: 'wa', label: 'Com WhatsApp', test: (l) => l.whatsapp },
  { id: 'noads', label: 'Não anuncia', test: (l) => !l.ads },
];
const PAGE = 15;

function MultiFilter({ label, icon, options, value, onChange }) {
  const n = value.length;
  return (
    <Popover trigger={(t, open) => (
      <button type="button" className={`chip ${n ? 'on' : ''}`} onClick={t} aria-expanded={open}>{icon}{label}{n > 0 && ` · ${n}`}<ChevronDown size={13} /></button>
    )}>
      {() => (
        <>
          {options.map((o) => {
            const on = value.includes(o.id);
            return (
              <button type="button" key={o.id} className={`opt ${on ? 'on' : ''}`} onClick={() => onChange(on ? value.filter((x) => x !== o.id) : [...value, o.id])}>
                <span className="check">{on && <Check size={11} strokeWidth={3} />}</span>{o.dot && <i style={{ width: 8, height: 8, borderRadius: 9, background: o.dot }} />}{o.label}<span className="count">{o.count}</span>
              </button>
            );
          })}
          {n > 0 && <button type="button" className="opt" onClick={() => onChange([])}><X size={14} />Limpar</button>}
        </>
      )}
    </Popover>
  );
}

export default function Leads() {
  const app = useApp();
  const leads = useStore((s) => s.leads);
  const [q, setQ] = useState('');
  const [stages, setStages] = useState([]);
  const [cats, setCats] = useState([]);
  const [pres, setPres] = useState([]);
  const [minScore, setMinScore] = useState(0);
  const [sort, setSort] = useState({ key: 'score', dir: -1 });
  const [sel, setSel] = useState([]);
  const [page, setPage] = useState(0);

  const score = (l) => l.analysis?.opportunity ?? -1;
  const rows = useMemo(() => {
    const t = q.trim().toLowerCase();
    let r = leads.filter((l) => (!t || `${l.name} ${l.contact} ${l.neighborhood} ${l.category} ${l.phone}`.toLowerCase().includes(t))
      && (!stages.length || stages.includes(l.stage))
      && (!cats.length || cats.includes(l.category))
      && pres.every((p) => PRESENCE.find((x) => x.id === p).test(l))
      && (minScore === 0 || score(l) >= minScore));
    const get = { name: (l) => l.name, score, rating: (l) => l.rating, reviews: (l) => l.reviews, created: (l) => l.createdAt, stage: (l) => STAGES.findIndex((s) => s.id === l.stage) };
    r = [...r].sort((a, b) => { const x = get[sort.key](a), y = get[sort.key](b); return (x > y ? 1 : x < y ? -1 : 0) * sort.dir; });
    return r;
  }, [leads, q, stages, cats, pres, minScore, sort]);

  const pages = Math.max(1, Math.ceil(rows.length / PAGE));
  const view = rows.slice(page * PAGE, page * PAGE + PAGE);
  const allSel = view.length > 0 && view.every((l) => sel.includes(l.id));
  const someSel = view.some((l) => sel.includes(l.id));
  const activeFilters = stages.length + cats.length + pres.length + (minScore ? 1 : 0);

  const head = (key, label) => (
    <th><button type="button" onClick={() => setSort((s) => ({ key, dir: s.key === key ? -s.dir : -1 }))}>{label}{sort.key === key && (sort.dir < 0 ? <ArrowDown size={12} /> : <ArrowUp size={12} />)}</button></th>
  );
  const clear = () => { setStages([]); setCats([]); setPres([]); setMinScore(0); setQ(''); };
  const del = (ids) => {
    const undo = actions.deleteLeads(ids);
    setSel([]);
    toast(`${ids.length} ${ids.length === 1 ? 'lead excluído' : 'leads excluídos'}`, undo);
  };
  const exportNow = () => {
    const csv = exportCsv(rows);
    navigator.clipboard?.writeText(csv).then(() => toast(`${rows.length} leads copiados em CSV`), () => toast('Não foi possível copiar'));
  };

  return (
    <div className="page">
      <div className="page-h">
        <div><h1><strong>Leads</strong> <em>{rows.length}</em></h1><p>Todas as empresas que o Caçador encontrou ou que você cadastrou.</p></div>
        <div className="page-actions">
          <button type="button" className="btn btn-ghost" onClick={exportNow}><Download size={15} />Exportar CSV</button>
          <button type="button" className="btn btn-primary" onClick={() => app.newLead({})}><Plus size={15} />Novo lead</button>
        </div>
      </div>

      <div className="toolbar">
        <label className="search"><Search size={16} /><input value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} placeholder="Buscar por nome, contato, bairro…" aria-label="Buscar leads" />{q && <button type="button" className="btn-icon sm" style={{ border: 0 }} onClick={() => setQ('')} aria-label="Limpar busca"><X size={14} /></button>}</label>
        <div className="filters-row">
          <MultiFilter label="Etapa" icon={<Filter size={13} />} value={stages} onChange={(v) => { setStages(v); setPage(0); }} options={STAGES.map((s) => ({ id: s.id, label: s.name, dot: s.color, count: leads.filter((l) => l.stage === s.id).length }))} />
          <MultiFilter label="Segmento" icon={<Tag size={13} />} value={cats} onChange={(v) => { setCats(v); setPage(0); }} options={Object.keys(CATEGORIES).map((c) => ({ id: c, label: c, count: leads.filter((l) => l.category === c).length }))} />
          <MultiFilter label="Presença digital" icon={<Globe size={13} />} value={pres} onChange={(v) => { setPres(v); setPage(0); }} options={PRESENCE.map((p) => ({ id: p.id, label: p.label, count: leads.filter(p.test).length }))} />
          <Popover trigger={(t) => <button type="button" className={`chip ${minScore ? 'on' : ''}`} onClick={t}><SlidersHorizontal size={13} />Oportunidade{minScore ? ` ≥ ${minScore}` : ''}<ChevronDown size={13} /></button>}>
            {() => (
              <div className="range">
                <span className="label">Nota mínima: <b className="tnum" style={{ color: 'var(--text)' }}>{minScore}</b></span>
                <input type="range" min="0" max="95" step="5" value={minScore} onChange={(e) => { setMinScore(+e.target.value); setPage(0); }} aria-label="Nota mínima de oportunidade" />
                <div style={{ display: 'flex', gap: 6 }}>{[0, 60, 80].map((v) => <button key={v} type="button" className={`chip ${minScore === v ? 'on' : ''}`} onClick={() => setMinScore(v)}>{v ? `≥ ${v}` : 'Todas'}</button>)}</div>
              </div>
            )}
          </Popover>
          {activeFilters > 0 && <button type="button" className="link" onClick={clear}><X size={13} />Limpar filtros</button>}
        </div>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        {rows.length === 0 ? (
          <Empty icon={<Users size={22} />} title="Nenhum lead com esses filtros" action={<button type="button" className="btn btn-ghost btn-sm" onClick={clear}>Limpar filtros</button>}>Tente tirar algum filtro ou buscar por outro termo.</Empty>
        ) : (
          <>
            <div className="table-wrap">
              <table className="tbl">
                <thead>
                  <tr>
                    <th style={{ width: 44 }}><button type="button" className={`cbx ${allSel ? 'on' : someSel ? 'mixed' : ''}`} aria-label="Selecionar todos" onClick={() => setSel(allSel ? sel.filter((id) => !view.some((l) => l.id === id)) : [...new Set([...sel, ...view.map((l) => l.id)])])}>{allSel ? <Check size={12} strokeWidth={3} /> : someSel ? <Minus size={12} strokeWidth={3} /> : null}</button></th>
                    {head('name', 'Empresa')}
                    {head('score', 'Oportunidade')}
                    {head('stage', 'Etapa')}
                    <th>Presença</th>
                    {head('rating', 'Google')}
                    <th>Bairro</th>
                    {head('created', 'Entrou')}
                    <th aria-label="Ações" />
                  </tr>
                </thead>
                <tbody>
                  {view.map((l, i) => {
                    const on = sel.includes(l.id);
                    return (
                      <motion.tr key={l.id} className={on ? 'sel' : ''} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.015 }} onClick={() => app.openLead(l.id)}>
                        <td onClick={(e) => e.stopPropagation()}><button type="button" className={`cbx ${on ? 'on' : ''}`} aria-label={`Selecionar ${l.name}`} onClick={() => setSel(on ? sel.filter((x) => x !== l.id) : [...sel, l.id])}>{on && <Check size={12} strokeWidth={3} />}</button></td>
                        <td>
                          <div className="name-cell"><Avatar name={l.name} /><div style={{ minWidth: 0 }}><b>{l.name}</b><small>{l.category} · {l.contact.split(',')[0]}</small></div>
                            {l.tags.map((t) => <span key={t} className="tag">{t}</span>)}
                          </div>
                        </td>
                        <td>{l.analysis ? <ScoreRing value={l.analysis.opportunity} size={34} /> : <span className="pill">Sem análise</span>}</td>
                        <td>{l.blocked ? <span className="pill bad">Não contatar</span> : <StageChip stage={l.stage} />}</td>
                        <td>
                          <div className="presence">
                            <span className={l.website ? 'on' : 'off'} title={l.website || 'Sem site'}><Globe size={13} /></span>
                            <span className={l.instagram ? (l.social?.lastPostDays > 30 ? '' : 'on') : 'off'} title={l.instagram ? `${l.instagram} · último post há ${l.social?.lastPostDays} dias` : 'Sem Instagram'}><Instagram size={13} /></span>
                            <span className={l.whatsapp ? 'on' : 'off'} title={l.whatsapp ? 'Tem WhatsApp' : 'Sem WhatsApp'}><MessageCircle size={13} /></span>
                          </div>
                        </td>
                        <td className="tnum">★ {String(l.rating).replace('.', ',')} <span className="faint">({l.reviews})</span></td>
                        <td className="muted">{l.neighborhood}</td>
                        <td className="faint">{ago(l.createdAt)}</td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button type="button" className="btn-icon sm" aria-label={`Editar ${l.name}`} onClick={() => app.editLead(l)}><Pencil size={14} /></button>
                            <button type="button" className="btn-icon sm" aria-label={`Excluir ${l.name}`} onClick={() => del([l.id])}><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="pager">
              <span className="tnum">{page * PAGE + 1}–{Math.min(rows.length, page * PAGE + PAGE)} de {rows.length}</span>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <button type="button" className="btn-icon sm" disabled={page === 0} onClick={() => setPage(page - 1)} aria-label="Página anterior"><ChevronLeft size={15} /></button>
                <span className="tnum">{page + 1} / {pages}</span>
                <button type="button" className="btn-icon sm" disabled={page >= pages - 1} onClick={() => setPage(page + 1)} aria-label="Próxima página"><ChevronRight size={15} /></button>
              </div>
            </div>
          </>
        )}
      </div>

      <AnimatePresence>
        {sel.length > 0 && (
          <motion.div className="bulk" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} transition={{ duration: 0.3, ease }}>
            <b className="tnum">{sel.length} selecionado{sel.length > 1 ? 's' : ''}</b>
            <AskClaude kind="previa" leads={sel} label="Prévias com o Claude" />
            <AskClaude kind="analise" leads={sel} label="Analisar com o Claude" />
            <Popover align="right" trigger={(t) => <button type="button" className="btn btn-ghost btn-sm" onClick={t}>Mover para…<ChevronDown size={13} /></button>}>
              {(close) => STAGES.map((s) => <button type="button" key={s.id} className="opt" onClick={() => { actions.moveLeads(sel, s.id); toast(`${sel.length} movidos para ${s.name}`); setSel([]); close(); }}><i style={{ width: 8, height: 8, borderRadius: 9, background: s.color }} />{s.name}</button>)}
            </Popover>
            <Popover align="right" trigger={(t) => <button type="button" className="btn btn-ghost btn-sm" onClick={t}><Tag size={13} />Etiqueta</button>}>
              {(close) => ['Premium', 'Indicação', 'Urgente', 'Recorrente', 'Grande porte'].map((tg) => <button type="button" key={tg} className="opt" onClick={() => { actions.tagLeads(sel, tg); toast(`Etiqueta "${tg}" aplicada`); close(); }}>{tg}</button>)}
            </Popover>
            <button type="button" className="btn btn-danger btn-sm" onClick={() => del(sel)}><Trash2 size={13} />Excluir</button>
            <button type="button" className="btn-icon sm" onClick={() => setSel([])} aria-label="Limpar seleção"><X size={14} /></button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
