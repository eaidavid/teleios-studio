import React, { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, CheckCircle2, Globe, ImageUp, Instagram, Loader2, Plus, Sparkles, Wand2, X } from 'lucide-react';
import { BLOCKS, GOALS, HEROES, MOTIONS, STYLES, suggestSections } from './generator';
import { derivePalettes, extractColors } from './colors';

const ease = [0.2, 0.8, 0.2, 1];
const STEPS = ['Lendo a identidade da marca', 'Escolhendo a estrutura das seções', 'Escrevendo os textos', 'Aplicando cores e animações'];

/* Direção da prévia: o que você decide antes de a IA criar */
export default function Wizard({ lead, initial, onCreate, onCancel }) {
  const detected = lead.brand?.colors || [];
  const [colors, setColors] = useState(initial?.colors || detected);
  const [style, setStyle] = useState(initial?.style || 'ia');
  const [motion_, setMotion] = useState(initial?.motion || 'ia');
  const [hero, setHero] = useState(initial?.hero || 'ia');
  const [goal, setGoal] = useState(initial?.goal || 'ia');
  const [sections, setSections] = useState(initial?.sections || suggestSections(lead));
  const [notes, setNotes] = useState(initial?.notes || '');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(-1);
  const file = useRef(null);

  const upload = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setErr('');
    try { setColors(await extractColors(f)); } catch (x) { setErr(x.message); }
    e.target.value = '';
  };
  const create = () => {
    const dir = { colors: colors.length ? colors : ['#00C48C'], style, motion: motion_, hero, goal, sections, notes };
    setBusy(0);
    STEPS.forEach((_, i) => setTimeout(() => setBusy(i + 1), 650 * (i + 1)));
    setTimeout(() => onCreate(dir), 650 * STEPS.length + 350);
  };
  const preview = derivePalettes(colors.length ? colors : ['#00C48C']);

  if (busy >= 0) {
    return (
      <div className="card gen">
        <div className="gen-orb"><motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 6, ease: 'linear' }} /><Sparkles size={26} /></div>
        <b style={{ font: '600 20px var(--f-display)' }}>Criando a prévia de {lead.name}</b>
        <ul className="gen-steps">
          {STEPS.map((s, i) => (
            <motion.li key={s} initial={{ opacity: 0, x: -10 }} animate={{ opacity: busy >= i ? 1 : 0.35, x: 0 }} transition={{ delay: i * 0.05 }}>
              {busy > i ? <CheckCircle2 size={16} color="var(--green)" /> : busy === i ? <Loader2 size={16} className="spin" /> : <span className="gen-dot" />}{s}
            </motion.li>
          ))}
        </ul>
        <div className="gen-swatches">{preview[0] && [preview[0].bg, preview[0].accent, preview[2].bg, preview[0].accent2].map((c, i) => <motion.i key={i} style={{ background: c }} initial={{ scale: 0 }} animate={{ scale: busy >= 3 ? 1 : 0.4 }} transition={{ delay: i * 0.08 }} />)}</div>
      </div>
    );
  }

  const Opt = ({ value, set, k, label, desc }) => (
    <button type="button" className={`dir-opt ${value === k ? 'on' : ''}`} onClick={() => set(k)} aria-pressed={value === k}>
      {k === 'ia' && <Sparkles size={14} color="var(--green)" />}<b>{label}</b>{desc && <small>{desc}</small>}
    </button>
  );

  return (
    <motion.div className="dir" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease }}>
      <section className="card dir-sec">
        <h3><span className="dir-n">1</span>Identidade do cliente</h3>
        <p className="muted" style={{ margin: 0 }}>As cores da prévia saem daqui, para não fugir da marca.</p>
        <div className="dir-colors">
          {colors.map((c, i) => (
            <span key={i} className="dir-color">
              <input type="color" value={c} onChange={(e) => setColors(colors.map((x, j) => (j === i ? e.target.value.toUpperCase() : x)))} aria-label={`Cor ${i + 1}`} />
              <code>{c}</code>
              <button type="button" className="btn-icon sm" style={{ border: 0, width: 22, height: 22 }} onClick={() => setColors(colors.filter((_, j) => j !== i))} aria-label="Remover cor"><X size={12} /></button>
            </span>
          ))}
          {colors.length < 3 && <button type="button" className="chip" onClick={() => setColors([...colors, colors[0] || '#00C48C'])}><Plus size={13} />Cor</button>}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {lead.brand && <span className="pill ok">{lead.brand.source === 'site' ? <Globe /> : <Instagram />}Detectadas no {lead.brand.source === 'site' ? 'site' : 'Instagram'}</span>}
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => file.current?.click()}><ImageUp size={14} />Ler cores do logo</button>
          <input ref={file} type="file" accept="image/*" hidden onChange={upload} />
          {!colors.length && <span className="faint" style={{ fontSize: 12 }}>Sem cores detectadas: suba o logo ou escolha uma cor.</span>}
          {err && <span style={{ color: 'var(--danger)', fontSize: 12 }}>{err}</span>}
        </div>
        {colors.length > 0 && <div className="dir-pals">{preview.map((p) => <span key={p.id} title={p.label} style={{ background: `linear-gradient(135deg, ${p.bg} 55%, ${p.accent} 55%)` }} />)}<small className="faint">Paletas derivadas da marca</small></div>}
      </section>

      <section className="card dir-sec">
        <h3><span className="dir-n">2</span>Direção</h3>
        <div className="field"><span>Estilo</span><div className="dir-grid">{Object.entries(STYLES).map(([k, s]) => <Opt key={k} value={style} set={setStyle} k={k} label={s.label} desc={s.desc} />)}</div></div>
        <div className="field"><span>Animações</span><div className="dir-row">{Object.entries(MOTIONS).map(([k, l]) => <Opt key={k} value={motion_} set={setMotion} k={k} label={l} />)}</div></div>
        <div className="field"><span>Topo</span><div className="dir-row">{Object.entries({ ia: 'IA escolhe', ...HEROES }).map(([k, l]) => <Opt key={k} value={hero} set={setHero} k={k} label={l} />)}</div></div>
        <div className="field"><span>Objetivo do site</span><div className="dir-row">{Object.entries(GOALS).map(([k, l]) => <Opt key={k} value={goal} set={setGoal} k={k} label={l} />)}</div></div>
      </section>

      <section className="card dir-sec">
        <h3><span className="dir-n">3</span>Conteúdo</h3>
        <div className="field"><span>Seções (a IA já marcou as que fazem sentido para {lead.category.toLowerCase()})</span>
          <div className="dir-row">{Object.entries(BLOCKS).map(([k, b]) => { const on = sections.includes(k); return <button type="button" key={k} className={`chip ${on ? 'on' : ''}`} onClick={() => setSections(on ? sections.filter((x) => x !== k) : [...sections, k])}>{on && <Check size={12} />}{b.label}</button>; })}</div>
        </div>
        <label className="field"><span>Observações para a IA</span><textarea id="dir-notes" className="textarea" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ex.: destacar o agendamento online, público feminino 30+, evitar falar de preço" /></label>
      </section>

      <div className="dir-actions">
        {onCancel && <button type="button" className="btn btn-ghost" onClick={onCancel}>Voltar ao editor</button>}
        <button type="button" className="btn btn-primary" onClick={create}><Wand2 size={16} />Criar prévia com IA</button>
      </div>
    </motion.div>
  );
}
