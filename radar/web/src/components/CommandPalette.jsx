import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, CornerDownLeft, Plus, Search, Sparkles, Target } from 'lucide-react';
import { getState, useStore } from '../data/store';
import { useApp } from '../App';
import { Avatar, ease } from './ui';

/* Busca global (Ctrl+K): leads, telas e ações */
export default function CommandPalette({ open, onClose, nav }) {
  const leads = useStore((s) => s.leads);
  const app = useApp();
  const [q, setQ] = useState('');
  const [i, setI] = useState(0);
  const ref = useRef(null);
  useEffect(() => { if (open) { setQ(''); setI(0); setTimeout(() => ref.current?.focus(), 30); } }, [open]);

  const items = useMemo(() => {
    const t = q.trim().toLowerCase();
    const acts = [
      { group: 'Ações', label: 'Criar lead', icon: <Plus size={16} />, run: () => app.newLead({}) },
      { group: 'Ações', label: 'Nova campanha de busca', icon: <Sparkles size={16} />, run: () => app.go('campanhas-nova') },
    ];
    const camps = getState().campaigns.map((c) => ({ group: 'Campanhas', label: c.name, icon: <Target size={16} />, run: () => app.go(`campanha-${c.id}`) }));
    const pages = nav.map((n) => ({ group: 'Telas', label: n.label, icon: <n.icon size={16} />, run: () => app.go(n.id) }));
    const ls = leads
      .filter((l) => !t || `${l.name} ${l.category} ${l.neighborhood} ${l.contact}`.toLowerCase().includes(t))
      .slice(0, t ? 8 : 4)
      .map((l) => ({ group: 'Leads', label: l.name, hint: `${l.category} · ${l.neighborhood}`, icon: <Avatar name={l.name} size="sm" />, run: () => app.openLead(l.id) }));
    const f = (x) => !t || x.label.toLowerCase().includes(t);
    return [...ls, ...camps.filter(f).slice(0, t ? 5 : 3), ...pages.filter(f), ...acts.filter(f)];
  }, [q, leads, nav, app]);

  const run = (it) => { onClose(); setTimeout(it.run, 60); };
  const onKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setI((x) => Math.min(items.length - 1, x + 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setI((x) => Math.max(0, x - 1)); }
    if (e.key === 'Enter' && items[i]) run(items[i]);
    if (e.key === 'Escape') onClose();
  };
  let last = '';
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="overlay" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.div className="palette" role="dialog" aria-label="Busca" initial={{ opacity: 0, x: '-50%', y: -10, scale: 0.98 }} animate={{ opacity: 1, x: '-50%', y: 0, scale: 1 }} exit={{ opacity: 0, x: '-50%', y: -6 }} transition={{ duration: 0.22, ease }}>
            <div className="palette-in"><Search size={18} /><input ref={ref} value={q} onChange={(e) => { setQ(e.target.value); setI(0); }} onKeyDown={onKey} placeholder="Buscar empresa, tela ou ação…" aria-label="Buscar" /><span className="kbd">Esc</span></div>
            <div className="palette-list">
              {items.length === 0 && <div className="empty"><b>Nada encontrado</b><span>Tente o nome da empresa, o bairro ou o segmento.</span></div>}
              {items.map((it, k) => {
                const head = it.group !== last ? (last = it.group) : null;
                return (
                  <React.Fragment key={`${it.group}-${it.label}-${k}`}>
                    {head && <div className="palette-group label">{head}</div>}
                    <button type="button" className={`palette-item ${k === i ? 'on' : ''}`} onMouseEnter={() => setI(k)} onClick={() => run(it)}>
                      {it.icon}<span>{it.label}</span>{it.hint && <small>{it.hint}</small>}{k === i && (it.hint ? null : <small><CornerDownLeft size={13} /></small>)}{k === i && !it.hint && null}
                      {k === i && it.hint && <ArrowRight size={14} style={{ color: 'var(--text-3)' }} />}
                    </button>
                  </React.Fragment>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
