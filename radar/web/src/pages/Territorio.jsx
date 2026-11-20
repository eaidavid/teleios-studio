import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Flame, Layers } from 'lucide-react';
import { useStore } from '../data/store';
import { STAGES } from '../data/seed';
import { useApp } from '../App';
import { ScoreRing, ease } from '../components/ui';

const W = 1000, H = 625;

export default function Territorio() {
  const app = useApp();
  const leads = useStore((s) => s.leads);
  const [off, setOff] = useState([]);
  const [hot, setHot] = useState(false);
  const [tip, setTip] = useState(null);

  const roads = useMemo(() => {
    const r = [];
    for (let i = 0; i < 13; i++) { const y = 40 + i * 46 + ((i * 17) % 22); r.push(<path key={`h${i}`} d={`M0 ${y} C 260 ${y + ((i % 3) - 1) * 34}, 620 ${y - (i % 2) * 26}, ${W} ${y + 10}`} stroke="#0d1b27" strokeWidth={i % 4 ? 2 : 6} fill="none" />); }
    for (let i = 0; i < 17; i++) { const x = 30 + i * 58 + ((i * 13) % 24); r.push(<path key={`v${i}`} d={`M${x} 0 L ${x + ((i % 3) - 1) * 42} ${H}`} stroke="#0d1b27" strokeWidth={i % 5 ? 2 : 6} fill="none" />); }
    return r;
  }, []);

  const vis = leads.filter((l) => !off.includes(l.stage) && (!hot || (l.analysis?.opportunity ?? 0) >= 80));
  const won = leads.filter((l) => l.stage === 'won').length;

  return (
    <div className="page">
      <div className="page-h">
        <div><h1>Território · <strong>Sorocaba</strong></h1><p>Cada empresa é um ponto. A cor muda conforme a conversa avança. {won} {won === 1 ? 'empresa ganha' : 'empresas ganhas'} até agora.</p></div>
      </div>
      <div className="map-layout">
        <div className="card map">
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Mapa de empresas por etapa">
            <defs><radialGradient id="glow"><stop offset="0" stopColor="#00C48C" stopOpacity=".09" /><stop offset="1" stopColor="#00C48C" stopOpacity="0" /></radialGradient></defs>
            <rect width={W} height={H} fill="#061019" />
            <path d="M-20 520 C 200 470, 380 560, 560 500 S 900 430, 1020 470" stroke="#0a2433" strokeWidth="26" fill="none" />
            {roads}
            <circle cx={W * 0.48} cy={H * 0.5} r="260" fill="url(#glow)" />
            <AnimatePresence>
              {vis.map((l) => {
                const s = STAGES.find((x) => x.id === l.stage);
                const big = (l.analysis?.opportunity ?? 0) >= 80;
                return (
                  <motion.g key={l.id} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }} transition={{ duration: 0.4, ease }} style={{ transformOrigin: `${l.x * W}px ${l.y * H}px` }}>
                    {l.stage === 'reply' && <circle className="pin-pulse" cx={l.x * W} cy={l.y * H} r="7" fill={s.color} />}
                    <circle className="pin" cx={l.x * W} cy={l.y * H} r={big ? 8 : 6} fill={s.color} stroke="#05080C" strokeWidth="2.5"
                      onMouseEnter={() => setTip(l)} onMouseLeave={() => setTip(null)} onClick={() => app.openLead(l.id)} tabIndex={0} role="button" aria-label={l.name}
                      onKeyDown={(e) => e.key === 'Enter' && app.openLead(l.id)} />
                  </motion.g>
                );
              })}
            </AnimatePresence>
          </svg>
          <div className="map-controls">
            <button type="button" className={`chip ${hot ? 'on' : ''}`} style={{ background: hot ? undefined : 'rgba(5,8,12,.7)' }} onClick={() => setHot(!hot)}><Flame size={13} />Só oportunidades 80+</button>
            <span className="chip" style={{ background: 'rgba(5,8,12,.7)', pointerEvents: 'none' }}><Layers size={13} />{vis.length} no mapa</span>
          </div>
          <AnimatePresence>
            {tip && (
              <motion.div className="map-tip" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ left: `min(${tip.x * 100}%, calc(100% - 230px))`, top: `calc(${tip.y * 100}% + 14px)` }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>{tip.analysis && <ScoreRing value={tip.analysis.opportunity} size={34} />}<div><b>{tip.name}</b><div className="faint">{tip.category} · {tip.neighborhood}</div></div></div>
                {tip.analysis && <span className="muted">{tip.analysis.gaps[0]?.title}</span>}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="card">
          <div className="card-h"><h2>Etapas</h2><span className="label">{leads.length} empresas</span></div>
          <div className="legend">
            {STAGES.map((s) => {
              const n = leads.filter((l) => l.stage === s.id).length;
              return (
                <button type="button" key={s.id} className={off.includes(s.id) ? 'off' : ''} aria-pressed={!off.includes(s.id)} onClick={() => setOff(off.includes(s.id) ? off.filter((x) => x !== s.id) : [...off, s.id])}>
                  <i style={{ background: s.color }} /><span>{s.name}</span><b className="tnum">{n}</b>
                </button>
              );
            })}
          </div>
          <div style={{ padding: '0 18px 18px' }} className="faint">Clique numa etapa para esconder. Pontos maiores têm oportunidade acima de 80; pontos pulsando acabaram de responder.</div>
        </div>
      </div>
    </div>
  );
}
