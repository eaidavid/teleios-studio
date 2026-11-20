import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Smartphone } from 'lucide-react';
import { useStore } from '../data/store';
import { ease } from './ui';

/* Saúde do número de WhatsApp: limite diário, aquecimento e bloqueios */
export default function NumberHealth() {
  const sent = useStore((s) => s.sentToday);
  const st = useStore((s) => s.settings);
  const pct = Math.min(100, (sent / st.limits.daily) * 100);
  return (
    <a href="#config-whatsapp" className="card" style={{ padding: 14, display: 'grid', gap: 10, textDecoration: 'none' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span className="kpi-ic" style={{ width: 30, height: 30, background: 'rgba(0,196,140,.12)', color: 'var(--green)' }}><Smartphone size={15} /></span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <b style={{ fontFamily: 'var(--f-display)', fontSize: 13, whiteSpace: 'nowrap' }}>Saúde do número</b>
          <div className="faint" style={{ fontSize: 11.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{st.whatsapp.connected ? st.whatsapp.number : 'Desconectado'}</div>
        </div>
        <span className="pill ok" title="Saúde boa"><ShieldCheck /></span>
      </div>
      <div className="bar"><motion.i initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, ease }} /></div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5 }} className="muted">
        <span className="tnum">{sent}/{st.limits.daily} hoje</span>
        <span>Aquecimento {st.whatsapp.warmupDay}/{st.whatsapp.warmupTotal}</span>
      </div>
    </a>
  );
}
