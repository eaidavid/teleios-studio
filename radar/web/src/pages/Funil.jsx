import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Ban, Keyboard, MessageCircle, Plus, Search, X } from 'lucide-react';
import { actions, useStore } from '../data/store';
import { CATEGORIES, STAGES } from '../data/seed';
import { useApp } from '../App';
import { Avatar, ScoreRing, ago, ease, money, toast } from '../components/ui';

export default function Funil() {
  const app = useApp();
  const leads = useStore((s) => s.leads);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [hot, setHot] = useState(false);
  const [sel, setSel] = useState(null);
  const [drop, setDrop] = useState(null);

  const vis = useMemo(() => leads.filter((l) => (!q || l.name.toLowerCase().includes(q.toLowerCase())) && (!cat || l.category === cat) && (!hot || (l.analysis?.opportunity ?? 0) >= 80)), [leads, q, cat, hot]);

  const move = (id, stage) => {
    const l = leads.find((x) => x.id === id);
    if (!l || l.stage === stage) return;
    actions.moveLeads([id], stage);
    toast(`${l.name} → ${STAGES.find((s) => s.id === stage).name}`);
  };

  useEffect(() => {
    const f = (e) => {
      if (!sel || /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName)) return;
      const l = leads.find((x) => x.id === sel); if (!l) return;
      const i = STAGES.findIndex((s) => s.id === l.stage);
      if (e.key >= '1' && e.key <= '6') move(sel, STAGES[+e.key - 1].id);
      if (e.key === 'ArrowRight' && i < 5) { e.preventDefault(); move(sel, STAGES[i + 1].id); }
      if (e.key === 'ArrowLeft' && i > 0) { e.preventDefault(); move(sel, STAGES[i - 1].id); }
      if (e.key === 'Enter') app.openLead(sel);
    };
    addEventListener('keydown', f);
    return () => removeEventListener('keydown', f);
  });

  return (
    <div className="page" style={{ maxWidth: 'none' }}>
      <div className="page-h">
        <div><h1><strong>Funil</strong></h1><p>Arraste os cards ou selecione um e use as teclas <span className="kbd">1</span>–<span className="kbd">6</span> e <span className="kbd">←</span> <span className="kbd">→</span>. <span className="kbd">Enter</span> abre a ficha.</p></div>
        <div className="page-actions"><button type="button" className="btn btn-primary" onClick={() => app.newLead({})}><Plus size={15} />Novo lead</button></div>
      </div>
      <div className="toolbar">
        <label className="search"><Search size={16} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar no funil" aria-label="Buscar no funil" /></label>
        <select id="funil-cat" className="select" style={{ width: 'auto', height: 38 }} value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Segmento">
          <option value="">Todos os segmentos</option>{Object.keys(CATEGORIES).map((c) => <option key={c}>{c}</option>)}
        </select>
        <button type="button" className={`chip ${hot ? 'on' : ''}`} onClick={() => setHot(!hot)}>Oportunidade ≥ 80{hot && <X size={12} />}</button>
        <span className="faint" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12 }}><Keyboard size={14} />Atalhos ativos</span>
      </div>

      <div className="board">
        {STAGES.map((s, si) => {
          const items = vis.filter((l) => l.stage === s.id).sort((a, b) => (b.analysis?.opportunity ?? 0) - (a.analysis?.opportunity ?? 0));
          const value = items.reduce((a, l) => a + (l.analysis?.ticket.oneOff ?? 0), 0);
          return (
            <section key={s.id} className={`colk ${drop === s.id ? 'drop' : ''}`} aria-label={s.name}
              onDragOver={(e) => { e.preventDefault(); setDrop(s.id); }} onDragLeave={() => setDrop(null)}
              onDrop={(e) => { e.preventDefault(); setDrop(null); move(+e.dataTransfer.getData('text'), s.id); }}>
              <div className="colk-h"><i style={{ background: s.color }} />{s.name}<span className="n">{si + 1} · {items.length}</span></div>
              {value > 0 && <div className="colk-sum tnum">{money(value)} em potencial</div>}
              {items.slice(0, 12).map((l) => (
                <motion.button layout layoutId={`k-${l.id}`} transition={{ duration: 0.4, ease }} type="button" key={l.id}
                  className={`kc ${sel === l.id ? 'sel' : ''} ${l.blocked ? 'blocked' : ''}`} draggable
                  onDragStart={(e) => { e.dataTransfer.setData('text', String(l.id)); setSel(l.id); }}
                  onClick={() => setSel(l.id)} onDoubleClick={() => app.openLead(l.id)} aria-pressed={sel === l.id}>
                  <div className="kc-top"><Avatar name={l.name} size="sm" /><div style={{ minWidth: 0, flex: 1 }}><b>{l.name}</b><small>{l.category}</small></div>{l.analysis && <ScoreRing value={l.analysis.opportunity} size={30} stroke={3} />}</div>
                  {l.blocked
                    ? <span className="pill bad"><Ban />{l.blocked}</span>
                    : <div className="kc-foot"><span>★ {String(l.rating).replace('.', ',')}</span>{l.stage === 'reply' && <span className="pill warn"><MessageCircle />Respondeu</span>}<span className="sp" /><span>{ago(l.lastContactAt || l.createdAt)}</span></div>}
                </motion.button>
              ))}
              {items.length > 12 && <a className="link" href="#leads" style={{ padding: '4px 6px' }}>+{items.length - 12} na lista de leads</a>}
              <button type="button" className="add-card" onClick={() => app.newLead({ stage: s.id })}><Plus size={14} />Adicionar</button>
            </section>
          );
        })}
      </div>
    </div>
  );
}
