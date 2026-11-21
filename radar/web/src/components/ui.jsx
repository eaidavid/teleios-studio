import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { AnimatePresence, motion, animate } from 'framer-motion';
import { CheckCircle2, X } from 'lucide-react';
import { LOGO } from './logo-path';
import { STAGES } from '../data/seed';

export const ease = [0.2, 0.8, 0.2, 1];

export function Logo() {
  return (
    <svg viewBox={LOGO.viewBox} role="img" aria-label="Teleios">
      <path fill="currentColor" d={LOGO.d} />
      <circle className="dot" cx={LOGO.dot[0]} cy={LOGO.dot[1]} r={LOGO.dot[2]} />
    </svg>
  );
}

const AV = ['#00C48C', '#6F86C8', '#E8B04A', '#C98BE8', '#FF7A59', '#2BA3B8', '#E9EEEC'];
export function Avatar({ name = '?', size = '' }) {
  const h = [...name].reduce((a, c) => a + c.charCodeAt(0), 0);
  const ini = name.replace(/^(Clínica|Studio|Academia|Restaurante|Pet Shop|Ótica|Odonto|Barbearia|Escritório|Imobiliária|Advocacia|Fisio|Box|Espaço|Estética|Cantina|Bistrô|Pet|Sorriso|Clínica Vet)\s+/i, '').slice(0, 2);
  return <span className={`avatar ${size}`} style={{ background: AV[h % AV.length] }} aria-hidden="true">{ini}</span>;
}

export function StageChip({ stage }) {
  const s = STAGES.find((x) => x.id === stage) || STAGES[0];
  return <span className="stage-chip"><i style={{ background: s.color }} />{s.short}</span>;
}

export function ScoreRing({ value = 0, size = 38, stroke = 4, lg = false }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const color = value >= 80 ? 'var(--green)' : value >= 60 ? 'var(--warn)' : 'var(--text-3)';
  return (
    <span className={`ring ${lg ? 'lg' : ''}`} style={{ width: size, height: size }} title={`Oportunidade ${value}`}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-3)" strokeWidth={stroke} />
        <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c - (c * value) / 100 }} transition={{ duration: 1, ease }} />
      </svg>
      <b className="tnum">{value}</b>
    </span>
  );
}

export function CountUp({ to, format = (v) => Math.round(v).toLocaleString('pt-BR') }) {
  const ref = useRef(null);
  useEffect(() => {
    const ctrl = animate(0, to, { duration: 1.1, ease, onUpdate: (v) => { if (ref.current) ref.current.textContent = format(v); } });
    return () => ctrl.stop();
  }, [to]); // eslint-disable-line react-hooks/exhaustive-deps
  return <span ref={ref} className="tnum">{format(to)}</span>;
}

export function Sparkline({ data, color = 'var(--green)' }) {
  const w = 160, h = 46, max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((v, i) => [(i / (data.length - 1)) * w, h - 6 - ((v - min) / (max - min || 1)) * (h - 14)]);
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  const id = `g${color.replace(/\W/g, '')}`;
  return (
    <svg className="spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true">
      <defs><linearGradient id={id} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={color} stopOpacity=".28" /><stop offset="1" stopColor={color} stopOpacity="0" /></linearGradient></defs>
      <path d={`${d} L${w} ${h} L0 ${h} Z`} fill={`url(#${id})`} />
      <motion.path d={d} fill="none" stroke={color} strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, ease }} />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="3" fill={color} />
    </svg>
  );
}

export function Switch({ on, onChange, label }) {
  return <button type="button" className="switch" role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)} />;
}

export function Segmented({ value, onChange, options, id }) {
  return (
    <div className="seg" role="tablist">
      {options.map((o) => (
        <button key={o.value} type="button" role="tab" aria-selected={value === o.value} className={value === o.value ? 'on' : ''} onClick={() => onChange(o.value)}>
          {value === o.value && <motion.span layoutId={`seg-${id}`} className="seg-pill" transition={{ duration: 0.35, ease }} />}
          {o.icon}<span>{o.label}</span>
        </button>
      ))}
    </div>
  );
}

export function Empty({ icon, title, children, action }) {
  return (
    <div className="empty">
      <span className="empty-ic">{icon}</span>
      <b>{title}</b>
      <span>{children}</span>
      {action}
    </div>
  );
}

/* ---------- Toasts com desfazer ---------- */
let toasts = [];
const tsubs = new Set();
const emit = () => tsubs.forEach((f) => f());
export function toast(text, undo) {
  const id = Math.random();
  toasts = [...toasts, { id, text, undo }];
  emit();
  setTimeout(() => { toasts = toasts.filter((t) => t.id !== id); emit(); }, undo ? 5000 : 2600);
}
export function Toasts() {
  const list = useSyncExternalStore((f) => { tsubs.add(f); return () => tsubs.delete(f); }, () => toasts);
  return (
    <div className="toasts" role="status" aria-live="polite">
      <AnimatePresence>
        {list.map((t) => (
          <motion.div key={t.id} className="toast" initial={{ opacity: 0, y: 20, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.96 }} transition={{ duration: 0.3, ease }}>
            <CheckCircle2 size={18} />{t.text}
            {t.undo && <button type="button" onClick={() => { t.undo(); toasts = toasts.filter((x) => x.id !== t.id); emit(); }}>Desfazer</button>}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ---------- Modal e gaveta ---------- */
function useEsc(open, onClose) {
  useEffect(() => {
    if (!open) return undefined;
    const f = (e) => e.key === 'Escape' && onClose();
    addEventListener('keydown', f);
    return () => removeEventListener('keydown', f);
  }, [open, onClose]);
}

export function Modal({ open, onClose, title, children, footer }) {
  useEsc(open, onClose);
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="overlay" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.div className="modal" role="dialog" aria-modal="true" aria-label={title} initial={{ opacity: 0, x: '-50%', y: '-46%', scale: 0.97 }} animate={{ opacity: 1, x: '-50%', y: '-50%', scale: 1 }} exit={{ opacity: 0, x: '-50%', y: '-47%', scale: 0.98 }} transition={{ duration: 0.3, ease }}>
            <div className="modal-h"><h2>{title}</h2><button type="button" className="btn-icon sm" onClick={onClose} aria-label="Fechar"><X size={16} /></button></div>
            <div className="modal-b">{children}</div>
            {footer && <div className="modal-f">{footer}</div>}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function Drawer({ open, onClose, children }) {
  useEsc(open, onClose);
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="overlay" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.aside className="drawer" role="dialog" aria-modal="true" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ duration: 0.45, ease }}>
            {children}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

/* Popover simples que fecha ao clicar fora */
export function Popover({ trigger, children, align = 'left' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const f = (e) => !ref.current?.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', f);
    return () => document.removeEventListener('mousedown', f);
  }, [open]);
  return (
    <div className="pop" ref={ref}>
      {trigger(() => setOpen((o) => !o), open)}
      <AnimatePresence>
        {open && (
          <motion.div className={`pop-panel ${align}`} initial={{ opacity: 0, y: -6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.18 }}>
            {children(() => setOpen(false))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export const listAnim = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};
export const itemAnim = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease } },
};

export function ago(ts) {
  if (!ts) return '—';
  const m = Math.round((Date.now() - ts) / 6e4);
  if (m < 1) return 'agora';
  if (m < 60) return `há ${m} min`;
  const h = Math.round(m / 60);
  if (h < 24) return `há ${h} h`;
  const d = Math.round(h / 24);
  return d === 1 ? 'ontem' : `há ${d} dias`;
}
export const money = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
