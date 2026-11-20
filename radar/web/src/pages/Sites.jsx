import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, Reorder, motion } from 'framer-motion';
import {
  ChevronDown, Copy, Eye, EyeOff, GripVertical, LayoutTemplate, MapPin, Monitor, Palette, Play, Save, Smartphone, Sparkles, Star, Type, Wand2,
} from 'lucide-react';
import { actions, useStore } from '../data/store';
import { useApp } from '../App';
import { Empty, Segmented, ease, toast } from '../components/ui';

/* Construtor de site-prévia. Parte do briefing da análise da IA e deixa escolher
   estilo de topo e rodapé, variação de cada seção, tipografia, cantos e animações. */

const BLOCKS = {
  'Serviços': { label: 'Serviços', variants: { cards: 'Cartões', lista: 'Lista numerada', destaque: 'Destaque + lista' } },
  'Avaliações do Google': { label: 'Avaliações', variants: { cards: 'Cartões', faixa: 'Faixa rolando', destaque: 'Citação em destaque' } },
  Galeria: { label: 'Galeria', variants: { grade: 'Grade', mosaico: 'Mosaico', faixa: 'Faixa horizontal' } },
  'Números': { label: 'Números', variants: { linha: 'Em linha', cartoes: 'Cartões' } },
  'Perguntas': { label: 'Perguntas frequentes', variants: { lista: 'Lista aberta', sanfona: 'Sanfona' } },
  'Localização e horário': { label: 'Localização', variants: { simples: 'Simples', dividido: 'Mapa ao lado' } },
};
const HEROES = {
  centro: 'Centralizado',
  dividido: 'Dividido',
  gigante: 'Tipográfico gigante',
  cartoes: 'Com cartões flutuantes',
};
const FOOTERS = { cta: 'Chamada final', colunas: 'Colunas', minimo: 'Mínimo' };
const FONTS = {
  moderna: { label: 'Moderna', display: "'Sora', sans-serif", weight: 700 },
  elegante: { label: 'Elegante', display: "'Instrument Serif', serif", weight: 400, italic: true },
  neutra: { label: 'Neutra', display: "'Inter', sans-serif", weight: 800 },
  tecnica: { label: 'Técnica', display: "'JetBrains Mono', monospace", weight: 500 },
};
const RADIUS = { reto: 2, suave: 12, redondo: 26 };
const ANIMS = { subir: 'Subir', zoom: 'Zoom', deslizar: 'Deslizar', desfocar: 'Desfocar', nenhuma: 'Sem animação' };
const TEXTS = { palavras: 'Palavra por palavra', letras: 'Letra por letra', mascara: 'Linha subindo', digitar: 'Digitando', nenhuma: 'Sem animação' };

const DEFAULTS = {
  hero: 'centro', footer: 'cta', font: 'moderna', radius: 'suave', anim: 'subir', text: 'palavras',
  variants: { 'Serviços': 'cards', 'Avaliações do Google': 'cards', Galeria: 'grade', 'Números': 'linha', Perguntas: 'sanfona', 'Localização e horário': 'simples' },
};

/* ---------- Animações da prévia ---------- */
const BLOCK_ANIM = {
  subir: { initial: { opacity: 0, y: 40 }, whileInView: { opacity: 1, y: 0 } },
  zoom: { initial: { opacity: 0, scale: 0.92 }, whileInView: { opacity: 1, scale: 1 } },
  deslizar: { initial: { opacity: 0, x: -60 }, whileInView: { opacity: 1, x: 0 } },
  desfocar: { initial: { opacity: 0, filter: 'blur(12px)' }, whileInView: { opacity: 1, filter: 'blur(0px)' } },
  nenhuma: {},
};

function Reveal({ anim, root, children, delay = 0, style, className }) {
  const a = BLOCK_ANIM[anim];
  if (!a.initial) return <div style={style} className={className}>{children}</div>;
  return (
    <motion.div className={className} style={style} initial={a.initial} whileInView={a.whileInView} viewport={{ root, once: true, amount: 0.2 }} transition={{ duration: 0.7, delay, ease }}>
      {children}
    </motion.div>
  );
}

function AnimText({ text, mode, as: Tag = 'h1', style }) {
  if (mode === 'nenhuma') return <Tag style={style}>{text}</Tag>;
  if (mode === 'digitar') {
    return (
      <Tag style={style}>
        {[...text].map((c, i) => <motion.span key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 + i * 0.035, duration: 0.01 }}>{c}</motion.span>)}
        <motion.span style={{ display: 'inline-block', width: '0.06em', height: '0.9em', background: 'currentColor', marginLeft: 4, verticalAlign: '-0.05em' }} animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} />
      </Tag>
    );
  }
  if (mode === 'mascara') {
    return <Tag style={{ ...style, overflow: 'hidden' }}><motion.span style={{ display: 'inline-block' }} initial={{ y: '110%' }} animate={{ y: 0 }} transition={{ duration: 0.9, ease }}>{text}</motion.span></Tag>;
  }
  if (mode === 'letras') {
    let n = 0;
    return (
      <Tag style={style} aria-label={text}>
        {text.split(' ').map((w, wi) => (
          <span key={wi} aria-hidden="true" style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
            {[...w].map((c) => {
              const i = n++;
              return <motion.span key={i} style={{ display: 'inline-block' }} initial={{ opacity: 0, y: 24, rotate: 6 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ delay: 0.15 + i * 0.025, duration: 0.5, ease }}>{c}</motion.span>;
            })}
            {wi < text.split(' ').length - 1 ? ' ' : ''}
          </span>
        ))}
      </Tag>
    );
  }
  const parts = text.split(' ');
  return (
    <Tag style={style} aria-label={text}>
      {parts.map((p, i) => (
        <motion.span key={i} aria-hidden="true" style={{ display: 'inline-block', whiteSpace: 'pre' }}
          initial={{ opacity: 0, y: mode === 'letras' ? 24 : 18, rotate: mode === 'letras' ? 6 : 0 }} animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ delay: 0.15 + i * (mode === 'letras' ? 0.025 : 0.07), duration: 0.5, ease }}>
          {p}{mode === 'palavras' && i < parts.length - 1 ? ' ' : ''}
        </motion.span>
      ))}
    </Tag>
  );
}

/* ---------- Prévia ---------- */
function Preview({ lead, d, mobile, replay }) {
  const root = useRef(null);
  const { bg, ink, accent } = d.palette;
  const soft = `color-mix(in srgb, ${ink} 7%, ${bg})`;
  const r = RADIUS[d.radius];
  const f = FONTS[d.font];
  const H = { fontFamily: f.display, fontWeight: f.weight, fontStyle: f.italic ? 'italic' : 'normal', letterSpacing: f.italic ? '-0.01em' : '-0.04em', margin: 0 };
  const cta = <span className="pv-cta" style={{ background: accent, color: bg, borderRadius: Math.max(r, 8) }}>{d.cta}</span>;
  const services = d.services;
  const cols = mobile ? 1 : 3;

  const hero = {
    centro: (
      <div className="pv-hero" style={{ textAlign: 'center', justifyItems: 'center', background: `radial-gradient(90% 90% at 50% 0%, color-mix(in srgb, ${accent} 24%, ${bg}), ${bg} 70%)` }}>
        <span style={{ fontSize: 12, opacity: 0.7 }}>{lead.name}</span>
        <AnimText text={d.headline} mode={d.text} style={{ ...H, fontSize: mobile ? 34 : 50, lineHeight: 1.02, maxWidth: '16ch' }} />
        <p>{d.sub}</p>{cta}
      </div>
    ),
    dividido: (
      <div className="pv-hero" style={{ gridTemplateColumns: mobile ? '1fr' : '1.1fr .9fr', alignItems: 'center', background: bg }}>
        <div style={{ display: 'grid', gap: 14 }}><span style={{ fontSize: 12, opacity: 0.7 }}>{lead.name}</span><AnimText text={d.headline} mode={d.text} style={{ ...H, fontSize: mobile ? 32 : 44, lineHeight: 1.04 }} /><p>{d.sub}</p>{cta}</div>
        <Reveal anim={d.anim} root={root} style={{ aspectRatio: '4/5', borderRadius: r, background: `linear-gradient(160deg, color-mix(in srgb, ${accent} 70%, ${bg}), color-mix(in srgb, ${ink} 30%, ${bg}))` }} />
      </div>
    ),
    gigante: (
      <div className="pv-hero" style={{ background: ink, color: bg, padding: mobile ? '40px 22px' : '64px 40px' }}>
        <AnimText text={d.headline} mode={d.text} style={{ ...H, fontSize: mobile ? 44 : 84, lineHeight: 0.92, maxWidth: 'none' }} />
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}><p style={{ maxWidth: '40ch' }}>{d.sub}</p>{cta}</div>
      </div>
    ),
    cartoes: (
      <div className="pv-hero" style={{ position: 'relative', overflow: 'hidden', background: `linear-gradient(135deg, ${bg}, color-mix(in srgb, ${accent} 18%, ${bg}))`, minHeight: 360 }}>
        <span style={{ fontSize: 12, opacity: 0.7 }}>{lead.name}</span>
        <AnimText text={d.headline} mode={d.text} style={{ ...H, fontSize: mobile ? 32 : 46, lineHeight: 1.03, maxWidth: '13ch' }} />
        <p>{d.sub}</p>{cta}
        {!mobile && [{ t: `★ ${String(lead.rating).replace('.', ',')} no Google`, x: '62%', y: 40 }, { t: `${lead.reviews} avaliações`, x: '70%', y: 150 }, { t: d.cta, x: '58%', y: 250 }].map((c, i) => (
          <motion.div key={c.t} style={{ position: 'absolute', left: c.x, top: c.y, padding: '12px 16px', borderRadius: r, background: bg, boxShadow: '0 20px 40px -20px rgba(0,0,0,.35)', fontWeight: 600, fontSize: 13 }}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: [0, -8, 0] }} transition={{ opacity: { delay: 0.4 + i * 0.15 }, y: { repeat: Infinity, duration: 4 + i, ease: 'easeInOut' } }}>{c.t}</motion.div>
        ))}
      </div>
    ),
  }[d.hero];

  const block = (b) => {
    const v = d.variants[b];
    const title = (t) => <AnimText as="h2" text={t} mode={d.text === 'digitar' ? 'mascara' : d.text} style={{ ...H, fontSize: 24 }} />;
    switch (b) {
      case 'Serviços':
        if (v === 'lista') return <div className="pv-sec">{title('O que fazemos')}{services.map((s, i) => <Reveal key={s} anim={d.anim} root={root} delay={i * 0.08} style={{ display: 'flex', gap: 16, padding: '14px 0', borderTop: `1px solid color-mix(in srgb, ${ink} 14%, ${bg})` }}><b style={{ color: accent, fontFamily: f.display }}>0{i + 1}</b><span style={{ fontWeight: 600 }}>{s}</span></Reveal>)}</div>;
        if (v === 'destaque') return <div className="pv-sec" style={{ gridTemplateColumns: mobile ? '1fr' : '1fr 1fr', alignItems: 'start' }}><Reveal anim={d.anim} root={root} style={{ padding: 24, borderRadius: r, background: accent, color: bg }}><h2 style={{ ...H, fontSize: 26 }}>{services[0]}</h2><p style={{ margin: '8px 0 0', opacity: 0.85 }}>Nosso serviço mais procurado.</p></Reveal><div style={{ display: 'grid', gap: 10 }}>{services.slice(1).map((s, i) => <Reveal key={s} anim={d.anim} root={root} delay={0.1 + i * 0.08} style={{ padding: 16, borderRadius: r, background: soft, fontWeight: 600 }}>{s}</Reveal>)}</div></div>;
        return <div className="pv-sec">{title('O que fazemos')}<div className="pv-grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>{services.map((s, i) => <Reveal key={s} anim={d.anim} root={root} delay={i * 0.1} style={{ padding: 18, borderRadius: r, background: soft }}><Sparkles size={16} color={accent} /><b style={{ display: 'block', marginTop: 10 }}>{s}</b></Reveal>)}</div></div>;
      case 'Avaliações do Google': {
        const quotes = ['Atendimento impecável, recomendo!', 'Profissionais incríveis.', 'Voltarei com certeza.', 'Melhor da região.'];
        if (v === 'faixa') return <div className="pv-sec" style={{ background: soft, overflow: 'hidden' }}>{title(`★ ${String(lead.rating).replace('.', ',')} no Google`)}<motion.div style={{ display: 'flex', gap: 12, width: 'max-content' }} animate={{ x: ['0%', '-50%'] }} transition={{ repeat: Infinity, duration: 18, ease: 'linear' }}>{[...quotes, ...quotes].map((q, i) => <div key={i} style={{ padding: '14px 18px', borderRadius: r, background: bg, whiteSpace: 'nowrap' }}><Star size={12} fill={accent} color={accent} /> “{q}”</div>)}</motion.div></div>;
        if (v === 'destaque') return <div className="pv-sec" style={{ background: soft, textAlign: 'center', justifyItems: 'center' }}><Reveal anim={d.anim} root={root}><div style={{ ...H, fontSize: mobile ? 26 : 34, maxWidth: '22ch', lineHeight: 1.15 }}>“{quotes[0]}”</div></Reveal><span style={{ opacity: 0.7 }}>★ {String(lead.rating).replace('.', ',')} · {lead.reviews} avaliações no Google</span></div>;
        return <div className="pv-sec" style={{ background: soft }}>{title(`★ ${String(lead.rating).replace('.', ',')} no Google`)}<p style={{ margin: 0, opacity: 0.75 }}>{lead.reviews} avaliações de clientes reais.</p><div className="pv-grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>{quotes.slice(0, 3).map((t, i) => <Reveal key={t} anim={d.anim} root={root} delay={i * 0.1} style={{ padding: 16, borderRadius: r, background: bg }}><Star size={12} fill={accent} color={accent} /> “{t}”</Reveal>)}</div></div>;
      }
      case 'Galeria': {
        const tiles = [0.25, 0.45, 0.15, 0.35, 0.55, 0.2];
        const tile = (o, i, st) => <Reveal key={i} anim={d.anim} root={root} delay={i * 0.06} style={{ borderRadius: r, background: `color-mix(in srgb, ${accent} ${o * 100}%, ${bg})`, ...st }} />;
        if (v === 'mosaico') return <div className="pv-sec">{title('Galeria')}<div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr 1fr' : '2fr 1fr 1fr', gridAutoRows: 90, gap: 10 }}>{tiles.slice(0, 5).map((o, i) => tile(o, i, i === 0 ? { gridRow: 'span 2' } : {}))}</div></div>;
        if (v === 'faixa') return <div className="pv-sec">{title('Galeria')}<div style={{ display: 'flex', gap: 10, overflowX: 'auto' }}>{tiles.map((o, i) => tile(o, i, { flex: '0 0 200px', height: 140 }))}</div></div>;
        return <div className="pv-sec">{title('Galeria')}<div className="pv-grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>{tiles.slice(0, 3).map((o, i) => tile(o, i, { aspectRatio: '4/3' }))}</div></div>;
      }
      case 'Números': {
        const nums = [[String(lead.rating).replace('.', ','), 'nota no Google'], [String(lead.reviews), 'avaliações'], ['+10', 'anos de casa']];
        return <div className="pv-sec"><div className="pv-grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>{nums.map(([n, l], i) => <Reveal key={l} anim={d.anim} root={root} delay={i * 0.1} style={v === 'cartoes' ? { padding: 20, borderRadius: r, background: soft } : { padding: '8px 0', borderLeft: `2px solid ${accent}`, paddingLeft: 14 }}><div style={{ ...H, fontSize: 36, color: accent }}>{n}</div><span style={{ opacity: 0.75 }}>{l}</span></Reveal>)}</div></div>;
      }
      case 'Perguntas': {
        const faq = [['Como agendar?', `Pelo WhatsApp ou ligando para ${lead.phone}.`], ['Qual o horário?', lead.hours], ['Onde fica?', `${lead.address}, ${lead.neighborhood}.`]];
        return <div className="pv-sec">{title('Perguntas frequentes')}{faq.map(([q, a], i) => (v === 'sanfona'
          ? <details key={q} open={i === 0} style={{ padding: '14px 16px', borderRadius: r, background: soft }}><summary style={{ fontWeight: 600, cursor: 'pointer' }}>{q}</summary><p style={{ margin: '8px 0 0', opacity: 0.8 }}>{a}</p></details>
          : <Reveal key={q} anim={d.anim} root={root} delay={i * 0.08}><b>{q}</b><p style={{ margin: '4px 0 0', opacity: 0.8 }}>{a}</p></Reveal>))}</div>;
      }
      case 'Localização e horário':
      default:
        return <div className="pv-sec" style={{ background: soft, gridTemplateColumns: v === 'dividido' && !mobile ? '1fr 1fr' : '1fr', alignItems: 'center' }}><div style={{ display: 'grid', gap: 8 }}>{title('Onde estamos')}<p style={{ margin: 0 }}><MapPin size={13} /> {lead.address} · {lead.neighborhood}, {lead.city}<br />{lead.hours}</p></div>{v === 'dividido' && <Reveal anim={d.anim} root={root} style={{ height: 180, borderRadius: r, background: `repeating-linear-gradient(45deg, color-mix(in srgb, ${ink} 6%, ${bg}) 0 12px, ${bg} 12px 24px)`, display: 'grid', placeItems: 'center' }}><MapPin size={28} color={accent} /></Reveal>}</div>;
    }
  };

  const footer = {
    cta: <div className="pv-sec" style={{ background: ink, color: bg, textAlign: 'center', justifyItems: 'center', padding: '48px 24px' }}><AnimText as="h2" text="Vamos conversar?" mode={d.text === 'digitar' ? 'mascara' : d.text} style={{ ...H, fontSize: mobile ? 30 : 40 }} /><p style={{ margin: 0, opacity: 0.75 }}>{lead.phone}</p><span className="pv-cta" style={{ background: accent, color: ink, borderRadius: Math.max(r, 8) }}>{d.cta}</span></div>,
    colunas: <div className="pv-sec" style={{ background: ink, color: bg, gridTemplateColumns: mobile ? '1fr' : '2fr 1fr 1fr', fontSize: 12.5 }}><div><b style={{ ...H, fontSize: 18 }}>{lead.name}</b><p style={{ margin: '6px 0 0', opacity: 0.7 }}>{lead.category} em {lead.city}</p></div><div style={{ opacity: 0.8 }}><b>Contato</b><br />{lead.phone}<br />{lead.instagram}</div><div style={{ opacity: 0.8 }}><b>Endereço</b><br />{lead.address}<br />{lead.hours}</div></div>,
    minimo: <div style={{ padding: '18px 24px', display: 'flex', justifyContent: 'space-between', fontSize: 12, borderTop: `1px solid color-mix(in srgb, ${ink} 12%, ${bg})` }}><span>© {lead.name}</span><span style={{ opacity: 0.7 }}>{lead.phone}</span></div>,
  }[d.footer];

  return (
    <motion.div className="preview-frame" layout style={{ maxWidth: mobile ? 390 : '100%', margin: '0 auto', width: '100%' }} transition={{ duration: 0.4, ease }}>
      <div className="preview-bar"><i /><i /><i /><span>{lead.name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '')}.previa.agenciateleios.com.br</span></div>
      <div ref={root} className="pv" key={replay} style={{ background: bg, color: ink, maxHeight: 680, overflowY: 'auto' }}>
        {hero}
        {d.order.filter((b) => d.on[b]).map((b) => <div key={b}>{block(b)}</div>)}
        {footer}
      </div>
    </motion.div>
  );
}

/* ---------- Controles ---------- */
function Group({ icon, title, children, open: o = true }) {
  const [open, setOpen] = useState(o);
  return (
    <div className="b-group">
      <button type="button" className="b-group-h" onClick={() => setOpen(!open)} aria-expanded={open}>{icon}<span>{title}</span><motion.span animate={{ rotate: open ? 180 : 0 }}><ChevronDown size={15} /></motion.span></button>
      <AnimatePresence initial={false}>
        {open && <motion.div className="b-group-b" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease }}><div style={{ display: 'grid', gap: 12, paddingTop: 4 }}>{children}</div></motion.div>}
      </AnimatePresence>
    </div>
  );
}

function Thumbs({ value, onChange, options, kind }) {
  return (
    <div className="thumbs">
      {Object.entries(options).map(([k, label]) => (
        <button type="button" key={k} className={`thumb ${value === k ? 'on' : ''}`} onClick={() => onChange(k)} aria-pressed={value === k}>
          <span className={`thumb-art ${kind}-${k}`}><i /><i /><i /></span>{label}
        </button>
      ))}
    </div>
  );
}

function Chips({ value, onChange, options }) {
  return <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{Object.entries(options).map(([k, label]) => <button type="button" key={k} className={`chip ${value === k ? 'on' : ''}`} onClick={() => onChange(k)}>{label}</button>)}</div>;
}

export default function Sites() {
  const app = useApp();
  const leads = useStore((s) => s.leads);
  const sites = useStore((s) => s.sites);
  const analyzed = leads.filter((l) => l.analysis);
  const [leadId, setLeadId] = useState(+app.param || analyzed[0]?.id);
  useEffect(() => { if (app.param) setLeadId(+app.param); }, [app.param]);
  const lead = leads.find((l) => l.id === leadId);
  const saved = sites.find((s) => s.lead === leadId);

  const initial = useMemo(() => {
    if (!lead?.analysis) return null;
    const b = lead.analysis.brief;
    const base = {
      ...DEFAULTS, headline: b.headline, sub: b.sub, cta: b.cta, palette: b.palette,
      order: Object.keys(BLOCKS), on: Object.fromEntries(Object.keys(BLOCKS).map((k) => [k, !['Números', 'Perguntas'].includes(k)])),
      services: ['Atendimento personalizado', 'Equipe especializada', 'Agendamento rápido'],
    };
    return saved ? { ...base, ...saved.data, variants: { ...base.variants, ...saved.data.variants }, on: { ...base.on, ...saved.data.on }, order: [...new Set([...(saved.data.order || []), ...base.order])].filter((k) => BLOCKS[k]) } : base;
  }, [leadId, lead, saved]);
  const [d, setD] = useState(initial);
  const [device, setDevice] = useState('desk');
  const [replay, setReplay] = useState(0);
  useEffect(() => setD(initial), [initial]);
  const set = (patch) => { setD((x) => ({ ...x, ...patch })); };
  const setAnim = (patch) => { set(patch); setReplay((r) => r + 1); };

  const palettes = lead ? [lead.analysis?.brief.palette, { bg: '#05080C', ink: '#E9EEEC', accent: '#00C48C' }, { bg: '#FFFFFF', ink: '#14181D', accent: '#1F3C88' }, { bg: '#F3EEE6', ink: '#2A1F14', accent: '#B8743C' }, { bg: '#0D0D0D', ink: '#F4F4F0', accent: '#D7FF3A' }, { bg: '#FDF2F4', ink: '#3A1220', accent: '#E0457B' }].filter(Boolean) : [];
  const surprise = () => {
    const pick = (o) => { const k = Object.keys(o); return k[Math.floor(Math.random() * k.length)]; };
    setAnim({ hero: pick(HEROES), footer: pick(FOOTERS), font: pick(FONTS), radius: pick(RADIUS), anim: pick(ANIMS), text: pick(TEXTS), palette: palettes[Math.floor(Math.random() * palettes.length)], variants: Object.fromEntries(Object.entries(BLOCKS).map(([k, b]) => [k, pick(b.variants)])) });
    toast('Nova combinação gerada');
  };

  return (
    <div className="page" style={{ maxWidth: 'none' }}>
      <div className="page-h">
        <div><h1><strong>Sites-prévia</strong> <span className="pill violet" style={{ verticalAlign: 'middle' }}>Beta</span></h1><p>Monte uma prévia do site da empresa a partir da análise da IA e mande o link junto da abordagem.</p></div>
        {d && <div className="page-actions">
          <button type="button" className="btn btn-ghost" onClick={surprise}><Wand2 size={15} />Surpreenda-me</button>
          <button type="button" className="btn btn-ghost" onClick={() => navigator.clipboard?.writeText(`https://previa.agenciateleios.com.br/${leadId}`).then(() => toast('Link copiado (demonstração)'), () => toast('Não foi possível copiar'))}><Copy size={15} />Copiar link</button>
          <button type="button" className="btn btn-primary" onClick={() => { actions.saveSite({ id: saved?.id, lead: leadId, data: d }); toast('Site-prévia salvo'); }}><Save size={15} />Salvar</button>
        </div>}
      </div>

      {!analyzed.length ? (
        <div className="card"><Empty icon={<LayoutTemplate size={22} />} title="Nenhum lead analisado">Analise um lead para gerar o briefing do site.</Empty></div>
      ) : (
        <div className="builder">
          <aside className="card blocks">
            <label className="field"><span>Empresa</span>
              <select id="site-lead" className="select" value={leadId} onChange={(e) => setLeadId(+e.target.value)}>
                {analyzed.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </label>
            {d && (
              <>
                <div className="ai-sug" style={{ marginTop: 0 }}><Sparkles size={15} /><span>Textos e cores vieram do <b>briefing da IA</b>. Ajuste o resto como quiser.</span></div>
                <Group icon={<Type size={15} />} title="Conteúdo">
                  <label className="field"><span>Título</span><input id="site-h" className="input" value={d.headline} onChange={(e) => set({ headline: e.target.value })} /></label>
                  <label className="field"><span>Subtítulo</span><textarea id="site-sub" className="textarea" style={{ minHeight: 64 }} value={d.sub} onChange={(e) => set({ sub: e.target.value })} /></label>
                  <label className="field"><span>Botão</span><input id="site-cta" className="input" value={d.cta} onChange={(e) => set({ cta: e.target.value })} /></label>
                </Group>
                <Group icon={<Palette size={15} />} title="Estilo">
                  <div className="field"><span>Cores</span><div className="swatches">{palettes.map((p, i) => <button type="button" key={i} aria-label={`Paleta ${i + 1}`} className={p.bg === d.palette.bg && p.accent === d.palette.accent ? 'on' : ''} style={{ background: `linear-gradient(135deg, ${p.bg} 50%, ${p.accent} 50%)` }} onClick={() => set({ palette: p })} />)}</div></div>
                  <div className="field"><span>Tipografia</span><div className="font-pick">{Object.entries(FONTS).map(([k, f]) => <button type="button" key={k} className={d.font === k ? 'on' : ''} onClick={() => set({ font: k })} style={{ fontFamily: f.display, fontWeight: f.weight, fontStyle: f.italic ? 'italic' : 'normal' }}>Aa<small>{f.label}</small></button>)}</div></div>
                  <div className="field"><span>Cantos</span><Chips value={d.radius} onChange={(v) => set({ radius: v })} options={{ reto: 'Retos', suave: 'Suaves', redondo: 'Redondos' }} /></div>
                </Group>
                <Group icon={<LayoutTemplate size={15} />} title="Topo (hero)"><Thumbs kind="hero" value={d.hero} onChange={(v) => setAnim({ hero: v })} options={HEROES} /></Group>
                <Group icon={<GripVertical size={15} />} title="Seções">
                  <span className="faint" style={{ fontSize: 12 }}>Arraste para reordenar, ligue ou desligue e escolha o estilo de cada uma.</span>
                  <Reorder.Group axis="y" values={d.order} onReorder={(order) => set({ order })} style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 6 }}>
                    {d.order.map((b) => (
                      <Reorder.Item key={b} value={b} className={`block-row ${d.on[b] ? '' : 'off'}`} style={{ cursor: 'grab', flexWrap: 'wrap' }}>
                        <GripVertical size={14} className="faint" /><span className="grow">{BLOCKS[b].label}</span>
                        <button type="button" className="btn-icon sm" aria-label={d.on[b] ? `Esconder ${BLOCKS[b].label}` : `Mostrar ${BLOCKS[b].label}`} onClick={() => set({ on: { ...d.on, [b]: !d.on[b] } })}>{d.on[b] ? <Eye size={13} /> : <EyeOff size={13} />}</button>
                        {d.on[b] && (
                          <select className="select" style={{ height: 32, fontSize: 12, flexBasis: '100%' }} value={d.variants[b]} onChange={(e) => setAnim({ variants: { ...d.variants, [b]: e.target.value } })} aria-label={`Estilo de ${BLOCKS[b].label}`} onPointerDown={(e) => e.stopPropagation()}>
                            {Object.entries(BLOCKS[b].variants).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                          </select>
                        )}
                      </Reorder.Item>
                    ))}
                  </Reorder.Group>
                </Group>
                <Group icon={<Play size={15} />} title="Animações">
                  <div className="field"><span>Entrada dos blocos</span><Chips value={d.anim} onChange={(v) => setAnim({ anim: v })} options={ANIMS} /></div>
                  <div className="field"><span>Animação das letras</span><Chips value={d.text} onChange={(v) => setAnim({ text: v })} options={TEXTS} /></div>
                  <button type="button" className="btn btn-ghost btn-sm" style={{ justifySelf: 'start' }} onClick={() => setReplay((r) => r + 1)}><Play size={13} />Ver animações de novo</button>
                </Group>
                <Group icon={<LayoutTemplate size={15} />} title="Rodapé"><Thumbs kind="foot" value={d.footer} onChange={(v) => set({ footer: v })} options={FOOTERS} /></Group>
              </>
            )}
          </aside>
          <div style={{ display: 'grid', gap: 12, minWidth: 0, position: 'sticky', top: 84, alignSelf: 'start' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span className="label">Prévia ao vivo · role para ver as animações</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" className="btn-icon" onClick={() => setReplay((r) => r + 1)} aria-label="Repetir animações"><Play size={15} /></button>
                <Segmented id="dev" value={device} onChange={setDevice} options={[{ value: 'desk', label: 'Computador', icon: <Monitor size={13} /> }, { value: 'mob', label: 'Celular', icon: <Smartphone size={13} /> }]} />
              </div>
            </div>
            {d && lead ? <Preview lead={lead} d={d} mobile={device === 'mob'} replay={replay} /> : <div className="card"><Empty icon={<LayoutTemplate size={22} />} title="Escolha uma empresa">O briefing da IA monta a primeira versão.</Empty></div>}
          </div>
        </div>
      )}
    </div>
  );
}
