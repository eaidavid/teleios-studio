import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, MapPin, Pause, Pencil, Play, Plus, Radar, Search, Target, Trash2 } from 'lucide-react';
import { actions, useStore } from '../data/store';
import { CATEGORIES } from '../data/seed';
import { useApp } from '../App';
import { Empty, Modal, Segmented, ago, itemAnim, listAnim, toast } from '../components/ui';

const EMPTY = { name: '', query: '', city: 'Sorocaba', category: 'Clínica de estética', depth: 10, radiusKm: 30, variants: 5, filters: [], variantA: '', variantB: '' };
const FILTERS = ['Com WhatsApp', 'Nota ≥ 4,5', 'Sem site', 'Instagram parado', 'Mais de 50 avaliações'];

export default function Campanhas() {
  const app = useApp();
  const campaigns = useStore((s) => s.campaigns);
  const leads = useStore((s) => s.leads);
  const [edit, setEdit] = useState(null);
  const [status, setStatus] = useState('todas');
  const [q, setQ] = useState('');
  useEffect(() => { if (app.param === 'nova') setEdit({ ...EMPTY }); }, [app.param]);

  const list = campaigns.filter((c) => (status === 'todas' || c.status === status) && (!q || `${c.name} ${c.query}`.toLowerCase().includes(q.toLowerCase())));
  const stats = (c) => {
    const ls = leads.filter((l) => l.campaign === c.id);
    return { found: ls.length, sent: ls.filter((l) => l.stage !== 'found').length, reply: ls.filter((l) => ['reply', 'qual', 'prop', 'won'].includes(l.stage)).length, won: ls.filter((l) => l.stage === 'won').length };
  };
  const live = useStore((s) => s.session.mode === 'api');
  const huntNow = (c, engine) => actions.hunt(c.id, engine).then(() => toast(engine === 'osm' ? 'Buscando no OpenStreetMap…' : 'Caçador buscando no Google Maps…'), (e) => toast(e.message));
  const save = (e) => {
    e.preventDefault();
    if (!edit.name.trim() || !edit.query.trim()) return;
    actions.saveCampaign(edit);
    toast(edit.id ? 'Campanha atualizada' : live ? 'Campanha criada. Clique em “Buscar agora” para rodar o Caçador.' : 'Campanha criada (demonstração)');
    setEdit(null);
  };

  return (
    <div className="page">
      <div className="page-h">
        <div><h1><strong>Campanhas</strong></h1><p>Cada campanha é uma busca que o time repete todo dia, com sua própria abordagem.</p></div>
        <div className="page-actions"><button type="button" className="btn btn-primary" onClick={() => setEdit({ ...EMPTY })}><Plus size={15} />Nova campanha</button></div>
      </div>
      <div className="toolbar">
        <label className="search"><Search size={16} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar campanha" aria-label="Buscar campanha" /></label>
        <Segmented id="camp" value={status} onChange={setStatus} options={[{ value: 'todas', label: 'Todas' }, { value: 'running', label: 'Rodando' }, { value: 'paused', label: 'Pausadas' }]} />
      </div>
      {list.length === 0 ? (
        <div className="card"><Empty icon={<Target size={22} />} title="Nenhuma campanha aqui" action={<button type="button" className="btn btn-primary btn-sm" onClick={() => setEdit({ ...EMPTY })}><Plus size={14} />Criar campanha</button>}>Crie uma campanha dizendo o tipo de empresa e a cidade.</Empty></div>
      ) : (
        <motion.div className="cards" variants={listAnim} initial="hidden" animate="show">
          <AnimatePresence>
            {list.map((c) => {
              const st = stats(c);
              return (
                <motion.article key={c.id} className="card camp" variants={itemAnim} layout exit={{ opacity: 0, scale: 0.96 }}>
                  <div className="camp-h">
                    <span className="kpi-ic" style={{ background: 'rgba(0,196,140,.12)', color: 'var(--green)' }}><Target size={16} /></span>
                    <div className="grow"><a className="camp-name" href={`#campanha-${c.id}`}>{c.name}</a><span className="faint" style={{ fontSize: 12, display: 'inline-flex', gap: 4, alignItems: 'center' }}><MapPin size={11} />{c.city} · criada {ago(c.createdAt)}</span></div>
                    {c.status === 'running' ? <span className="pill ok live"><i />Rodando</span> : <span className="pill">Pausada</span>}
                  </div>
                  <q>{c.query}</q>
                  {c.filters?.length > 0 && <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{c.filters.map((f) => <span key={f} className="tag">{f}</span>)}</div>}
                  <div className="camp-stats">
                    {[['Encontradas', st.found], ['Abordadas', st.sent], ['Responderam', st.reply], ['Ganhas', st.won]].map(([k, v]) => <div key={k}><strong className="tnum">{v}</strong><small>{k}</small></div>)}
                  </div>
                  {c.hunt && c.hunt.state !== 'idle' && (
                    <div className="faint" style={{ fontSize: 12, display: 'flex', gap: 6, alignItems: 'center' }}>
                      {c.hunt.state === 'running' ? <Loader2 size={12} className="spin" /> : <Radar size={12} />}
                      {c.hunt.state === 'running' ? `${c.hunt.step}…` : c.hunt.state === 'error' ? `Falhou: ${c.hunt.step}` : `Última busca: ${c.hunt.found} achadas, ${c.hunt.added} novas`}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {live && <button type="button" className="btn btn-primary btn-sm" disabled={c.hunt?.state === 'running'} onClick={() => huntNow(c, 'google')} title="Google Maps (gosom)"><Radar size={13} />Buscar agora</button>}
                    {live && <button type="button" className="btn btn-ghost btn-sm" disabled={c.hunt?.state === 'running'} onClick={() => huntNow(c, 'osm')} title="OpenStreetMap: gratuito, menos dados">OSM</button>}
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => { actions.toggleCampaign(c.id); toast(c.status === 'running' ? 'Campanha pausada' : 'Campanha retomada'); }}>{c.status === 'running' ? <><Pause size={13} />Pausar</> : <><Play size={13} />Retomar</>}</button>
                    <a className="btn btn-ghost btn-sm" href={`#campanha-${c.id}`}><Radar size={13} />Acompanhar</a>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEdit({ ...c })}><Pencil size={13} />Editar</button>
                    <span style={{ flex: 1 }} />
                    <button type="button" className="btn-icon sm" aria-label={`Excluir ${c.name}`} onClick={() => toast('Campanha excluída', actions.deleteCampaign(c.id))}><Trash2 size={14} /></button>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? 'Editar campanha' : 'Nova campanha'}
        footer={<><button type="button" className="btn btn-ghost" onClick={() => setEdit(null)}>Cancelar</button><button type="submit" form="camp-form" className="btn btn-primary" disabled={!edit?.name?.trim() || !edit?.query?.trim()}>{edit?.id ? 'Salvar' : 'Criar campanha'}</button></>}>
        {edit && (
          <form id="camp-form" onSubmit={save} style={{ display: 'grid', gap: 14 }}>
            <label className="field"><span>Nome</span><input id="cf-name" className="input" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} placeholder="Clínicas de estética · Sorocaba" /></label>
            <label className="field"><span>O que buscar</span><textarea id="cf-q" className="textarea" value={edit.query} onChange={(e) => setEdit({ ...edit, query: e.target.value })} placeholder="Clínicas de estética em Sorocaba com nota acima de 4,5" /><small>Escreva como falaria para uma pessoa.</small></label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <label className="field"><span>Cidade</span><input id="cf-city" className="input" value={edit.city} onChange={(e) => setEdit({ ...edit, city: e.target.value })} /></label>
              <label className="field"><span>Segmento</span><select id="cf-cat" className="input" value={edit.category || ''} onChange={(e) => setEdit({ ...edit, category: e.target.value })}>{Object.keys(CATEGORIES).map((k) => <option key={k}>{k}</option>)}</select></label>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }}>
              <label className="field"><span>Profundidade</span><select id="cf-depth" className="input" value={edit.depth || 10} onChange={(e) => setEdit({ ...edit, depth: +e.target.value })}><option value={5}>Rápida</option><option value={10}>Normal</option><option value={20}>Completa</option></select></label>
              <label className="field"><span>Variações do termo</span><select id="cf-var" className="input" value={edit.variants || 5} onChange={(e) => setEdit({ ...edit, variants: +e.target.value })}><option value={1}>Só o meu termo</option><option value={3}>3</option><option value={5}>5</option></select></label>
              <label className="field"><span>Raio (km)</span><input id="cf-radius" className="input" type="number" min="3" max="200" value={edit.radiusKm || 30} onChange={(e) => setEdit({ ...edit, radiusKm: +e.target.value })} /></label>
            </div>
            <small className="faint" style={{ marginTop: -6 }}>O Caçador busca seu termo e variações do segmento (ex.: “marcenaria”, “móveis sob medida”), centrado na cidade, e descarta quem estiver fora do raio.</small>
            <div className="field"><span>Filtros</span><div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{FILTERS.map((f) => { const on = edit.filters.includes(f); return <button type="button" key={f} className={`chip ${on ? 'on' : ''}`} onClick={() => setEdit({ ...edit, filters: on ? edit.filters.filter((x) => x !== f) : [...edit.filters, f] })}>{f}</button>; })}</div></div>
            <label className="field"><span>Abordagem A</span><input id="cf-a" className="input" value={edit.variantA} onChange={(e) => setEdit({ ...edit, variantA: e.target.value })} placeholder="Vi que a {empresa} tem nota {nota}, mas…" /><small>Deixe em branco para a IA escrever. Variáveis: {'{empresa}'}, {'{nota}'}, {'{avaliacoes}'}.</small></label>
            <label className="field"><span>Abordagem B (teste A/B)</span><input id="cf-b" className="input" value={edit.variantB} onChange={(e) => setEdit({ ...edit, variantB: e.target.value })} placeholder="Opcional" /></label>
          </form>
        )}
      </Modal>
    </div>
  );
}
