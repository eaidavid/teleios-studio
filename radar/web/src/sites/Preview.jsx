import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Heart, MapPin, Quote, Sparkles, Star } from 'lucide-react';
import { FONTS, RADIUS } from './generator';

const ease = [0.2, 0.8, 0.2, 1];
const BLOCK_ANIM = {
  subir: { initial: { opacity: 0, y: 40 }, whileInView: { opacity: 1, y: 0 } },
  zoom: { initial: { opacity: 0, scale: 0.9 }, whileInView: { opacity: 1, scale: 1 } },
  deslizar: { initial: { opacity: 0, x: -60 }, whileInView: { opacity: 1, x: 0 } },
  desfocar: { initial: { opacity: 0, filter: 'blur(14px)' }, whileInView: { opacity: 1, filter: 'blur(0px)' } },
  girar: { initial: { opacity: 0, rotateX: 55, y: 30, transformPerspective: 900 }, whileInView: { opacity: 1, rotateX: 0, y: 0 } },
  cascata: { initial: { opacity: 0, y: 26, scale: 0.97 }, whileInView: { opacity: 1, y: 0, scale: 1 } },
  nenhuma: {},
};

function R({ a, root, delay = 0, style, className, children }) {
  const x = BLOCK_ANIM[a];
  if (!x.initial) return <div style={style} className={className}>{children}</div>;
  const d = a === 'cascata' ? delay * 1.8 : delay;
  return <motion.div className={className} style={style} initial={x.initial} whileInView={x.whileInView} viewport={{ root, once: true, amount: 0.15 }} transition={{ duration: 0.7, delay: d, ease }}>{children}</motion.div>;
}

export function AnimText({ text, mode, as: Tag = 'h1', style, accent }) {
  const words = text.split(' ');
  if (mode === 'nenhuma') return <Tag style={style}>{text}</Tag>;
  if (mode === 'digitar') {
    return (
      <Tag style={style}>
        {[...text].map((c, i) => <motion.span key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 + i * 0.035, duration: 0.01 }}>{c}</motion.span>)}
        <motion.span style={{ display: 'inline-block', width: '0.06em', height: '0.9em', background: 'currentColor', marginLeft: 4, verticalAlign: '-0.05em' }} animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} />
      </Tag>
    );
  }
  if (mode === 'mascara') return <Tag style={{ ...style, overflow: 'hidden', paddingBottom: '0.08em' }}><motion.span style={{ display: 'inline-block' }} initial={{ y: '110%' }} animate={{ y: 0 }} transition={{ duration: 0.9, ease }}>{text}</motion.span></Tag>;
  if (mode === 'brilho') {
    return (
      <Tag style={style}>
        <motion.span style={{ backgroundImage: `linear-gradient(100deg, currentColor 0%, currentColor 40%, ${accent} 50%, currentColor 60%, currentColor 100%)`, backgroundSize: '250% 100%', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          initial={{ backgroundPosition: '100% 0', opacity: 0 }} animate={{ backgroundPosition: ['100% 0', '-50% 0'], opacity: 1 }} transition={{ backgroundPosition: { duration: 2.6, repeat: Infinity, repeatDelay: 1.2 }, opacity: { duration: 0.6 } }}>{text}</motion.span>
      </Tag>
    );
  }
  if (mode === 'letras' || mode === 'onda') {
    let n = 0;
    return (
      <Tag style={style} aria-label={text}>
        {words.map((w, wi) => (
          <span key={wi} aria-hidden="true" style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
            {[...w].map((c) => {
              const i = n++;
              return mode === 'onda'
                ? <motion.span key={i} style={{ display: 'inline-block' }} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: [30, -10, 0] }} transition={{ delay: 0.1 + i * 0.04, duration: 0.7, ease: 'easeOut' }}>{c}</motion.span>
                : <motion.span key={i} style={{ display: 'inline-block' }} initial={{ opacity: 0, y: 24, rotate: 6 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ delay: 0.15 + i * 0.025, duration: 0.5, ease }}>{c}</motion.span>;
            })}
            {wi < words.length - 1 ? ' ' : ''}
          </span>
        ))}
      </Tag>
    );
  }
  const blur = mode === 'desfoque';
  return (
    <Tag style={style} aria-label={text}>
      {words.map((p, i) => (
        <motion.span key={i} aria-hidden="true" style={{ display: 'inline-block', whiteSpace: 'pre' }}
          initial={blur ? { opacity: 0, filter: 'blur(10px)' } : { opacity: 0, y: 18 }} animate={blur ? { opacity: 1, filter: 'blur(0px)' } : { opacity: 1, y: 0 }}
          transition={{ delay: 0.15 + i * (blur ? 0.1 : 0.07), duration: blur ? 0.8 : 0.5, ease }}>
          {p}{i < words.length - 1 ? ' ' : ''}
        </motion.span>
      ))}
    </Tag>
  );
}

function Compare({ r, a, b, accent }) {
  const [x, setX] = useState(50);
  return (
    <div style={{ position: 'relative', aspectRatio: '16/8', borderRadius: r, overflow: 'hidden', background: a }}>
      <div style={{ position: 'absolute', inset: 0, background: b, clipPath: `inset(0 0 0 ${x}%)` }} />
      <span style={{ position: 'absolute', left: 12, top: 10, fontSize: 11, fontWeight: 700 }}>ANTES</span>
      <span style={{ position: 'absolute', right: 12, top: 10, fontSize: 11, fontWeight: 700 }}>DEPOIS</span>
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${x}%`, width: 3, background: accent }} />
      <input type="range" min="5" max="95" value={x} onChange={(e) => setX(+e.target.value)} aria-label="Comparar antes e depois" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'ew-resize' }} />
    </div>
  );
}

export default function Preview({ lead, d, mobile, replay }) {
  const root = useRef(null);
  const { bg, ink, accent } = d.palette;
  const accent2 = d.palette.accent2 || accent;
  const mix = (c, p) => `color-mix(in srgb, ${c} ${p}%, ${bg})`;
  const soft = mix(ink, 6);
  const line = mix(ink, 14);
  const r = RADIUS[d.radius];
  const f = FONTS[d.font];
  const a = d.anim;
  const H = { fontFamily: f.display, fontWeight: f.weight, fontStyle: f.italic ? 'italic' : 'normal', letterSpacing: f.italic ? '-0.01em' : '-0.035em', margin: 0, lineHeight: 1.04 };
  const cols = mobile ? 1 : 3;
  const btn = (inv) => <span className="pv-cta" style={{ background: inv ? bg : accent, color: inv ? ink : readable(accent), borderRadius: Math.max(r, 8) }}>{d.cta} <ArrowRight size={13} style={{ verticalAlign: -2 }} /></span>;
  const T = (t, st = {}) => <AnimText as="h2" text={t} mode={['digitar', 'onda', 'letras'].includes(d.text) ? 'mascara' : d.text} accent={accent} style={{ ...H, fontSize: mobile ? 24 : 30, ...st }} />;
  const eyebrow = (t) => <span style={{ fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: accent, fontWeight: 700 }}>{t}</span>;
  const img = (o, st = {}) => ({ borderRadius: r, background: `linear-gradient(150deg, ${mix(accent, o)}, ${mix(accent2, o * 0.6)})`, ...st });
  const big = mobile ? 34 : 52;

  const heroes = {
    centro: <div className="pv-hero" style={{ textAlign: 'center', justifyItems: 'center', background: `radial-gradient(90% 90% at 50% 0%, ${mix(accent, 22)}, ${bg} 70%)` }}>{eyebrow(lead.name)}<AnimText text={d.headline} mode={d.text} accent={accent} style={{ ...H, fontSize: big, maxWidth: '16ch' }} /><p>{d.sub}</p>{btn()}</div>,
    dividido: <div className="pv-hero" style={{ gridTemplateColumns: mobile ? '1fr' : '1.1fr .9fr', alignItems: 'center' }}><div style={{ display: 'grid', gap: 14 }}>{eyebrow(lead.name)}<AnimText text={d.headline} mode={d.text} accent={accent} style={{ ...H, fontSize: big - 6 }} /><p>{d.sub}</p>{btn()}</div><R a={a} root={root} style={img(70, { aspectRatio: '4/5' })} /></div>,
    gigante: <div className="pv-hero" style={{ background: ink, color: bg, padding: mobile ? '40px 22px' : '64px 40px' }}><AnimText text={d.headline} mode={d.text} accent={accent} style={{ ...H, fontSize: mobile ? 44 : 84, lineHeight: 0.92 }} /><div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}><p style={{ maxWidth: '40ch' }}>{d.sub}</p>{btn(true)}</div></div>,
    cartoes: (
      <div className="pv-hero" style={{ position: 'relative', overflow: 'hidden', background: `linear-gradient(135deg, ${bg}, ${mix(accent, 18)})`, minHeight: 360 }}>
        {eyebrow(lead.name)}<AnimText text={d.headline} mode={d.text} accent={accent} style={{ ...H, fontSize: big - 6, maxWidth: '13ch' }} /><p>{d.sub}</p>{btn()}
        {!mobile && [{ t: `★ ${fmt(lead.rating)} no Google`, x: '62%', y: 40 }, { t: `${lead.reviews} avaliações`, x: '70%', y: 150 }, { t: d.services[0], x: '58%', y: 250 }].map((c, i) => (
          <motion.div key={c.t} style={{ position: 'absolute', left: c.x, top: c.y, padding: '12px 16px', borderRadius: r, background: bg, boxShadow: '0 20px 40px -20px rgba(0,0,0,.35)', fontWeight: 600, fontSize: 13 }}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: [0, -8, 0] }} transition={{ opacity: { delay: 0.4 + i * 0.15 }, y: { repeat: Infinity, duration: 4 + i, ease: 'easeInOut' } }}>{c.t}</motion.div>
        ))}
      </div>
    ),
    gradiente: (
      <div className="pv-hero" style={{ position: 'relative', overflow: 'hidden', background: bg, minHeight: 360, alignContent: 'center' }}>
        {[accent, accent2, mix(accent, 60)].map((c, i) => (
          <motion.span key={i} style={{ position: 'absolute', width: 340, height: 340, borderRadius: '50%', background: c, filter: 'blur(70px)', opacity: 0.45, left: `${[10, 50, 30][i]}%`, top: `${[-20, 10, 40][i]}%` }}
            animate={{ x: [0, 60, -40, 0], y: [0, -40, 30, 0] }} transition={{ repeat: Infinity, duration: 12 + i * 3, ease: 'easeInOut' }} />
        ))}
        <div style={{ position: 'relative', display: 'grid', gap: 14, justifyItems: 'start' }}>{eyebrow(lead.name)}<AnimText text={d.headline} mode={d.text} accent={accent} style={{ ...H, fontSize: big + 4, maxWidth: '14ch' }} /><p>{d.sub}</p>{btn()}</div>
      </div>
    ),
    estatisticas: (
      <div className="pv-hero" style={{ background: `linear-gradient(180deg, ${mix(accent, 10)}, ${bg})` }}>
        {eyebrow(lead.name)}<AnimText text={d.headline} mode={d.text} accent={accent} style={{ ...H, fontSize: big, maxWidth: '18ch' }} /><p>{d.sub}</p>{btn()}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${mobile ? 2 : 3}, 1fr)`, gap: 12, marginTop: 18 }}>
          {[[fmt(lead.rating), 'nota no Google'], [lead.reviews, 'avaliações'], ['+10', 'anos de casa']].map(([n, l], i) => <R key={l} a={a} root={root} delay={0.2 + i * 0.1} style={{ borderTop: `2px solid ${accent}`, paddingTop: 10 }}><div style={{ ...H, fontSize: 30 }}>{n}</div><span style={{ opacity: 0.7, fontSize: 12 }}>{l}</span></R>)}
        </div>
      </div>
    ),
    imagem: (
      <div className="pv-hero" style={{ position: 'relative', minHeight: 380, alignContent: 'end', color: '#fff', background: `linear-gradient(180deg, transparent 30%, rgba(0,0,0,.65)), linear-gradient(135deg, ${mix(accent, 75)}, ${mix(accent2, 55)})` }}>
        {eyebrow(lead.name)}<AnimText text={d.headline} mode={d.text} accent={accent} style={{ ...H, fontSize: big, maxWidth: '15ch', color: '#fff' }} /><p style={{ color: '#fff' }}>{d.sub}</p>{btn()}
      </div>
    ),
  };

  const block = (k) => {
    const v = d.variants[k];
    const quotes = ['Atendimento impecável, recomendo!', 'Profissionais incríveis.', 'Voltarei com certeza.', 'Melhor da região.'];
    switch (k) {
      case 'sobre':
        return v === 'dividido'
          ? <div className="pv-sec" style={{ gridTemplateColumns: mobile ? '1fr' : '1fr 1fr', alignItems: 'center' }}><R a={a} root={root} style={img(55, { aspectRatio: '5/4' })} /><div style={{ display: 'grid', gap: 10 }}>{eyebrow('Sobre nós')}{T(`Conheça a ${lead.name}`)}<p style={{ margin: 0, opacity: 0.8 }}>{d.about}</p></div></div>
          : <div className="pv-sec">{eyebrow('Sobre nós')}<R a={a} root={root}><p style={{ ...H, fontSize: mobile ? 22 : 30, lineHeight: 1.25, maxWidth: '28ch' }}>{d.about}</p></R></div>;
      case 'servicos':
        if (v === 'lista') return <div className="pv-sec">{T('O que fazemos')}{d.services.map((s, i) => <R key={s} a={a} root={root} delay={i * 0.08} style={{ display: 'flex', gap: 16, padding: '14px 0', borderTop: `1px solid ${line}` }}><b style={{ color: accent, fontFamily: f.display }}>0{i + 1}</b><span style={{ fontWeight: 600 }}>{s}</span></R>)}</div>;
        if (v === 'destaque') return <div className="pv-sec" style={{ gridTemplateColumns: mobile ? '1fr' : '1fr 1fr', alignItems: 'start' }}><R a={a} root={root} style={{ padding: 24, borderRadius: r, background: accent, color: readable(accent) }}><h3 style={{ ...H, fontSize: 26 }}>{d.services[0]}</h3><p style={{ margin: '8px 0 0', opacity: 0.85 }}>O mais procurado.</p></R><div style={{ display: 'grid', gap: 10 }}>{d.services.slice(1).map((s, i) => <R key={s} a={a} root={root} delay={0.1 + i * 0.08} style={{ padding: 16, borderRadius: r, background: soft, fontWeight: 600 }}>{s}</R>)}</div></div>;
        if (v === 'abas') return <div className="pv-sec">{T('O que fazemos')}<div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 1fr', gap: 10 }}>{d.services.map((s, i) => <R key={s} a={a} root={root} delay={i * 0.07} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 14, borderRadius: r, border: `1px solid ${line}` }}><span style={{ width: 34, height: 34, borderRadius: Math.min(r, 10), display: 'grid', placeItems: 'center', background: mix(accent, 18), color: accent }}><Sparkles size={15} /></span><b>{s}</b></R>)}</div></div>;
        return <div className="pv-sec">{T('O que fazemos')}<div className="pv-grid" style={{ gridTemplateColumns: `repeat(${mobile ? 1 : 2}, 1fr)` }}>{d.services.map((s, i) => <R key={s} a={a} root={root} delay={i * 0.1} style={{ padding: 18, borderRadius: r, background: soft }}><Sparkles size={16} color={accent} /><b style={{ display: 'block', marginTop: 10 }}>{s}</b></R>)}</div></div>;
      case 'processo': {
        const steps = ['Você chama no WhatsApp', 'Conversamos sobre o que precisa', 'Agendamos o melhor horário', 'Cuidamos de tudo'];
        return v === 'linha'
          ? <div className="pv-sec">{T('Como funciona')}{steps.map((s, i) => <R key={s} a={a} root={root} delay={i * 0.1} style={{ display: 'grid', gridTemplateColumns: '28px 1fr', gap: 12, alignItems: 'start' }}><span style={{ width: 28, height: 28, borderRadius: 99, background: accent, color: readable(accent), display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 700 }}>{i + 1}</span><span style={{ paddingTop: 4, fontWeight: 600 }}>{s}</span></R>)}</div>
          : <div className="pv-sec">{T('Como funciona')}<div className="pv-grid" style={{ gridTemplateColumns: `repeat(${mobile ? 1 : 4}, 1fr)` }}>{steps.map((s, i) => <R key={s} a={a} root={root} delay={i * 0.1} style={{ padding: 16, borderRadius: r, background: soft }}><div style={{ ...H, fontSize: 28, color: accent }}>0{i + 1}</div><span style={{ fontWeight: 600, fontSize: 13 }}>{s}</span></R>)}</div></div>;
      }
      case 'antesdepois':
        return <div className="pv-sec">{T('Antes e depois')}{v === 'slider' ? <Compare r={r} a={mix(ink, 22)} b={mix(accent, 55)} accent={accent} /> : <div className="pv-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>{[[mix(ink, 20), 'Antes'], [mix(accent, 55), 'Depois']].map(([c, l], i) => <R key={l} a={a} root={root} delay={i * 0.1} style={{ aspectRatio: '4/5', borderRadius: r, background: c, display: 'grid', alignItems: 'end', padding: 12, fontWeight: 700, fontSize: 12 }}>{l}</R>)}</div>}</div>;
      case 'numeros': {
        const nums = [[fmt(lead.rating), 'nota no Google'], [String(lead.reviews), 'avaliações'], ['+10', 'anos de casa']];
        return <div className="pv-sec"><div className="pv-grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>{nums.map(([n, l], i) => <R key={l} a={a} root={root} delay={i * 0.1} style={v === 'cartoes' ? { padding: 20, borderRadius: r, background: soft } : { borderLeft: `2px solid ${accent}`, paddingLeft: 14 }}><div style={{ ...H, fontSize: 38, color: accent }}>{n}</div><span style={{ opacity: 0.75 }}>{l}</span></R>)}</div></div>;
      }
      case 'avaliacoes':
        if (v === 'faixa') return <div className="pv-sec" style={{ background: soft, overflow: 'hidden' }}>{T(`★ ${fmt(lead.rating)} no Google`)}<motion.div style={{ display: 'flex', gap: 12, width: 'max-content' }} animate={{ x: ['0%', '-50%'] }} transition={{ repeat: Infinity, duration: 18, ease: 'linear' }}>{[...quotes, ...quotes].map((q, i) => <div key={i} style={{ padding: '14px 18px', borderRadius: r, background: bg, whiteSpace: 'nowrap' }}><Star size={12} fill={accent} color={accent} /> “{q}”</div>)}</motion.div></div>;
        if (v === 'destaque') return <div className="pv-sec" style={{ background: soft, textAlign: 'center', justifyItems: 'center' }}><Quote size={26} color={accent} /><R a={a} root={root}><div style={{ ...H, fontSize: mobile ? 26 : 34, maxWidth: '22ch', lineHeight: 1.15 }}>“{quotes[0]}”</div></R><span style={{ opacity: 0.7 }}>★ {fmt(lead.rating)} · {lead.reviews} avaliações no Google</span></div>;
        return <div className="pv-sec" style={{ background: soft }}>{T(`★ ${fmt(lead.rating)} no Google`)}<p style={{ margin: 0, opacity: 0.75 }}>{lead.reviews} avaliações de clientes reais.</p><div className="pv-grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>{quotes.slice(0, 3).map((t, i) => <R key={t} a={a} root={root} delay={i * 0.1} style={{ padding: 16, borderRadius: r, background: bg }}><Star size={12} fill={accent} color={accent} /> “{t}”</R>)}</div></div>;
      case 'planos': {
        const plans = [['Essencial', 'R$ 99'], ['Completo', 'R$ 179'], ['Premium', 'R$ 259']];
        return v === 'tabela'
          ? <div className="pv-sec">{T('Planos')}{plans.map(([n, p], i) => <R key={n} a={a} root={root} delay={i * 0.08} style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderTop: `1px solid ${line}` }}><b>{n}</b><span style={{ ...H, fontSize: 18 }}>{p}<small style={{ fontSize: 11, opacity: 0.6 }}>/mês</small></span></R>)}</div>
          : <div className="pv-sec">{T('Planos')}<div className="pv-grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>{plans.map(([n, p], i) => <R key={n} a={a} root={root} delay={i * 0.1} style={{ padding: 18, borderRadius: r, background: i === 1 ? accent : soft, color: i === 1 ? readable(accent) : ink, display: 'grid', gap: 8 }}><b>{n}</b><div style={{ ...H, fontSize: 30 }}>{p}<small style={{ fontSize: 11, opacity: 0.7 }}>/mês</small></div>{['Avaliação inicial', 'Acompanhamento'].map((x) => <span key={x} style={{ fontSize: 12 }}><Check size={12} /> {x}</span>)}</R>)}</div></div>;
      }
      case 'equipe': {
        const team = [['Dra. Ana', 'Responsável técnica'], ['Carlos', 'Especialista'], ['Júlia', 'Atendimento']];
        return <div className="pv-sec">{T('Quem cuida de você')}<div className="pv-grid" style={{ gridTemplateColumns: `repeat(${v === 'linha' && !mobile ? 3 : cols}, 1fr)` }}>{team.map(([n, rl], i) => <R key={n} a={a} root={root} delay={i * 0.1} style={{ display: v === 'linha' ? 'flex' : 'grid', gap: 10, alignItems: 'center' }}><span style={img(40 + i * 10, { aspectRatio: v === 'linha' ? '1' : '1', width: v === 'linha' ? 52 : '100%', borderRadius: v === 'linha' ? 99 : r })} /><div><b>{n}</b><div style={{ fontSize: 12, opacity: 0.7 }}>{rl}</div></div></R>)}</div></div>;
      }
      case 'galeria': {
        const tiles = [55, 35, 70, 45, 60, 30];
        if (v === 'mosaico') return <div className="pv-sec">{T('Galeria')}<div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr 1fr' : '2fr 1fr 1fr', gridAutoRows: 90, gap: 10 }}>{tiles.slice(0, 5).map((o, i) => <R key={i} a={a} root={root} delay={i * 0.06} style={img(o, i === 0 ? { gridRow: 'span 2' } : {})} />)}</div></div>;
        if (v === 'faixa') return <div className="pv-sec">{T('Galeria')}<div style={{ display: 'flex', gap: 10, overflowX: 'auto' }}>{tiles.map((o, i) => <R key={i} a={a} root={root} delay={i * 0.06} style={img(o, { flex: '0 0 200px', height: 140 })} />)}</div></div>;
        return <div className="pv-sec">{T('Galeria')}<div className="pv-grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>{tiles.slice(0, 3).map((o, i) => <R key={i} a={a} root={root} delay={i * 0.08} style={img(o, { aspectRatio: '4/3' })} />)}</div></div>;
      }
      case 'instagram':
        return <div className="pv-sec">{T(lead.instagram || '@instagram')}<div className="pv-grid" style={{ gridTemplateColumns: `repeat(${mobile ? 3 : 6}, 1fr)`, gap: 6 }}>{[50, 30, 65, 40, 55, 25].map((o, i) => <R key={i} a={a} root={root} delay={i * 0.05} style={img(o, { aspectRatio: '1', borderRadius: Math.min(r, 8), display: 'grid', placeItems: 'center' })}><Heart size={14} color={bg} /></R>)}</div></div>;
      case 'chamada':
        return v === 'cartao'
          ? <div className="pv-sec"><R a={a} root={root} style={{ padding: mobile ? 22 : 34, borderRadius: r, background: `linear-gradient(135deg, ${accent}, ${mix(accent2, 70)})`, color: readable(accent), display: 'grid', gap: 12, justifyItems: 'start' }}><h3 style={{ ...H, fontSize: mobile ? 24 : 32 }}>Pronta para começar?</h3>{btn(true)}</R></div>
          : <div className="pv-sec" style={{ background: accent, color: readable(accent), gridTemplateColumns: mobile ? '1fr' : '1fr auto', alignItems: 'center' }}><h3 style={{ ...H, fontSize: mobile ? 24 : 30 }}>Seu horário está esperando.</h3>{btn(true)}</div>;
      case 'perguntas': {
        const faq = [['Como agendar?', `Pelo WhatsApp ou ligando para ${lead.phone}.`], ['Qual o horário?', lead.hours], ['Onde fica?', `${lead.address}, ${lead.neighborhood}.`]];
        return <div className="pv-sec">{T('Perguntas frequentes')}{faq.map(([q, an], i) => (v === 'sanfona'
          ? <details key={q} open={i === 0} style={{ padding: '14px 16px', borderRadius: r, background: soft }}><summary style={{ fontWeight: 600, cursor: 'pointer' }}>{q}</summary><p style={{ margin: '8px 0 0', opacity: 0.8 }}>{an}</p></details>
          : <R key={q} a={a} root={root} delay={i * 0.08}><b>{q}</b><p style={{ margin: '4px 0 0', opacity: 0.8 }}>{an}</p></R>))}</div>;
      }
      case 'localizacao':
      default:
        return <div className="pv-sec" style={{ background: soft, gridTemplateColumns: v === 'dividido' && !mobile ? '1fr 1fr' : '1fr', alignItems: 'center' }}><div style={{ display: 'grid', gap: 8 }}>{T('Onde estamos')}<p style={{ margin: 0 }}><MapPin size={13} /> {lead.address} · {lead.neighborhood}, {lead.city}<br />{lead.hours}</p></div>{v === 'dividido' && <R a={a} root={root} style={{ height: 180, borderRadius: r, background: `repeating-linear-gradient(45deg, ${mix(ink, 6)} 0 12px, ${bg} 12px 24px)`, display: 'grid', placeItems: 'center' }}><MapPin size={28} color={accent} /></R>}</div>;
    }
  };

  const footers = {
    cta: <div className="pv-sec" style={{ background: ink, color: bg, textAlign: 'center', justifyItems: 'center', padding: '48px 24px' }}><AnimText as="h2" text="Vamos conversar?" mode={d.text === 'digitar' ? 'mascara' : d.text} accent={accent} style={{ ...H, fontSize: mobile ? 30 : 40 }} /><p style={{ margin: 0, opacity: 0.75 }}>{lead.phone}</p>{btn()}</div>,
    colunas: <div className="pv-sec" style={{ background: ink, color: bg, gridTemplateColumns: mobile ? '1fr' : '2fr 1fr 1fr', fontSize: 12.5 }}><div><b style={{ ...H, fontSize: 18 }}>{lead.name}</b><p style={{ margin: '6px 0 0', opacity: 0.7 }}>{lead.category} em {lead.city}</p></div><div style={{ opacity: 0.8 }}><b>Contato</b><br />{lead.phone}<br />{lead.instagram}</div><div style={{ opacity: 0.8 }}><b>Endereço</b><br />{lead.address}<br />{lead.hours}</div></div>,
    minimo: <div style={{ padding: '18px 24px', display: 'flex', justifyContent: 'space-between', fontSize: 12, borderTop: `1px solid ${line}` }}><span>© {lead.name}</span><span style={{ opacity: 0.7 }}>{lead.phone}</span></div>,
    gigante: <div style={{ background: ink, color: bg, padding: '28px 24px 10px', overflow: 'hidden' }}><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, opacity: 0.75, flexWrap: 'wrap', gap: 8 }}><span>{lead.phone}</span><span>{lead.address}</span></div><R a={a} root={root}><div style={{ ...H, fontSize: mobile ? 46 : 96, lineHeight: 0.9, marginTop: 18, whiteSpace: 'nowrap' }}>{lead.name.split(' ').slice(-1)[0]}<span style={{ color: accent }}>.</span></div></R></div>,
  };

  return (
    <motion.div className="preview-frame" layout style={{ maxWidth: mobile ? 390 : '100%', margin: '0 auto', width: '100%' }} transition={{ duration: 0.4, ease }}>
      <div className="preview-bar"><i /><i /><i /><span>{slug(lead.name)}.previa.agenciateleios.com.br</span></div>
      <div ref={root} className="pv" key={replay} style={{ background: bg, color: ink, maxHeight: 700, overflowY: 'auto' }}>
        {heroes[d.hero]}
        {d.order.filter((b) => d.on[b]).map((b) => <div key={b}>{block(b)}</div>)}
        {footers[d.footer]}
      </div>
    </motion.div>
  );
}

const fmt = (n) => String(n).replace('.', ',');
const slug = (t) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '');
function readable(hex) {
  const h = hex.replace('#', '');
  if (h.length !== 6) return '#fff';
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? '#14181D' : '#FFFFFF';
}
