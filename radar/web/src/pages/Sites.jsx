import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, Reorder, motion } from 'framer-motion';
import {
  ChevronDown, Compass, Copy, Eye, EyeOff, GripVertical, LayoutTemplate, Monitor, Palette, Play, Send, Smartphone, Sparkles, Type, Wand2,
} from 'lucide-react';
import { actions, useStore } from '../data/store';
import { AskClaude } from '../components/ClaudeQueue';
import { useApp } from '../App';
import { Avatar, Segmented, ease, toast } from '../components/ui';
import Preview from '../sites/Preview';
import Wizard from '../sites/Wizard';
import { ANIMS, BLOCKS, FONTS, FOOTERS, HEROES, TEXTS, generateDesign } from '../sites/generator';

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
const Thumbs = ({ value, onChange, options, kind }) => (
  <div className="thumbs">
    {Object.entries(options).map(([k, label]) => (
      <button type="button" key={k} className={`thumb ${value === k ? 'on' : ''}`} onClick={() => onChange(k)} aria-pressed={value === k}>
        <span className={`thumb-art ${kind}-${k}`}><i /><i /><i /></span>{label}
      </button>
    ))}
  </div>
);
const Chips = ({ value, onChange, options }) => <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{Object.entries(options).map(([k, l]) => <button type="button" key={k} className={`chip ${value === k ? 'on' : ''}`} onClick={() => onChange(k)}>{l}</button>)}</div>;

export default function Sites() {
  const app = useApp();
  const leads = useStore((s) => s.leads);
  const sites = useStore((s) => s.sites);
  const [leadId, setLeadId] = useState(+app.param || leads[0]?.id);
  useEffect(() => { if (app.param) setLeadId(+app.param); }, [app.param]);
  const lead = leads.find((l) => l.id === leadId);
  const site = sites.find((s) => s.lead === leadId);
  const [mode, setMode] = useState(site ? 'edit' : 'empty'); // empty | wizard | edit
  const [device, setDevice] = useState('desk');
  const [replay, setReplay] = useState(0);
  useEffect(() => { setMode(sites.some((s) => s.lead === leadId) ? 'edit' : 'empty'); }, [leadId, sites.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const d = site?.data;
  const save = (data, extra = {}) => actions.saveSite({ ...site, lead: leadId, data, ...extra });
  const set = (patch) => save({ ...d, ...patch });
  const setAnim = (patch) => { set(patch); setReplay((r) => r + 1); };

  const create = (dir) => {
    actions.saveSite({ id: site?.id, lead: leadId, direction: dir, data: generateDesign(lead, dir) });
    setMode('edit');
    setReplay((r) => r + 1);
    toast('Prévia criada. Agora é só ajustar.');
  };
  const best = () => {
    const dir = { ...site.direction, style: 'ia', motion: 'ia', hero: 'ia' };
    const next = generateDesign(lead, dir, Date.now());
    save({ ...next, headline: d.headline, sub: d.sub, cta: d.cta, about: d.about, services: d.services, colors: d.colors });
    setReplay((r) => r + 1);
    toast('A IA escolheu uma nova combinação');
  };

  const leadPicker = (
    <label className="field" style={{ minWidth: 260 }}><span>Empresa</span>
      <select id="site-lead" className="select" value={leadId} onChange={(e) => setLeadId(+e.target.value)}>
        {leads.map((l) => <option key={l.id} value={l.id}>{sites.some((s) => s.lead === l.id) ? '● ' : ''}{l.name}</option>)}
      </select>
    </label>
  );

  return (
    <div className="page" style={{ maxWidth: mode === 'edit' ? 'none' : 1180 }}>
      <div className="page-h">
        <div><h1><strong>Sites-prévia</strong> <span className="pill violet" style={{ verticalAlign: 'middle' }}>Beta</span></h1><p>Você dá a direção, a IA cria a primeira versão e você ajusta antes de mandar para o lead.</p></div>
        {mode === 'edit' && d && (
          <div className="page-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setMode('wizard')}><Compass size={15} />Mudar direção</button>
            <button type="button" className="btn btn-ghost" onClick={best}><Wand2 size={15} />Escolha o melhor</button>
            <button type="button" className="btn btn-ghost" onClick={() => (site?.url ? navigator.clipboard?.writeText(site.url).then(() => toast('Link copiado'), () => toast('Não foi possível copiar')) : toast('O link aparece quando o Radar está no servidor'))}><Copy size={15} />Copiar link</button>
            <button type="button" className="btn btn-primary" onClick={() => { save(d, { sent: Date.now() }); toast(site?.url ? 'Marcada como enviada. Mande o link pelo WhatsApp.' : 'Prévia marcada como enviada (demonstração)'); }}><Send size={15} />Enviar ao lead</button>
          </div>
        )}
      </div>

      {lead && mode !== 'edit' && (
        <div className="card" style={{ padding: 16, display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
          <Avatar name={lead.name} size="lg" />
          <div style={{ flex: 1, minWidth: 200 }}><b style={{ font: '600 17px var(--f-display)' }}>{lead.name}</b><div className="faint">{lead.category} · {lead.neighborhood}, {lead.city}</div></div>
          {leadPicker}
        </div>
      )}

      {lead && mode === 'empty' && (
        <motion.div className="card site-empty" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="site-empty-art">{[0, 1, 2].map((i) => <motion.span key={i} animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 3, delay: i * 0.3 }} />)}</div>
          <b style={{ font: '600 20px var(--f-display)' }}>Este lead ainda não tem prévia</b>
          <p className="muted" style={{ margin: 0, maxWidth: '52ch', textAlign: 'center' }}>Diga a direção (identidade, estilo, animações e seções) e a IA monta a primeira versão. Depois você ajusta tudo no editor.</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button type="button" className="btn btn-primary" onClick={() => setMode('wizard')}><Sparkles size={15} />Montar no construtor</button>
            <AskClaude kind="previa" leads={[lead.id]} label="Pedir ao Claude" className="btn btn-ghost" />
          </div>
          <small className="faint">O Claude cria quando você disser no chat dele: “Faz os pedidos do Radar”. A prévia aparece aqui para você ajustar.</small>
        </motion.div>
      )}

      {lead && mode === 'wizard' && <Wizard lead={lead} initial={site?.direction} onCreate={create} onCancel={site ? () => setMode('edit') : () => setMode('empty')} />}

      {lead && mode === 'edit' && d && (
        <div className="builder">
          <aside className="card blocks">
            {leadPicker}
            <div className="ai-sug" style={{ marginTop: 0 }}><Sparkles size={15} /><span>Criada pela IA no estilo <b>{d.style}</b>. Tudo abaixo pode ser ajustado.</span></div>
            <Group icon={<Type size={15} />} title="Textos">
              <label className="field"><span>Título</span><input id="site-h" className="input" value={d.headline} onChange={(e) => set({ headline: e.target.value })} /></label>
              <label className="field"><span>Subtítulo</span><textarea id="site-sub" className="textarea" style={{ minHeight: 60 }} value={d.sub} onChange={(e) => set({ sub: e.target.value })} /></label>
              <label className="field"><span>Botão</span><input id="site-cta" className="input" value={d.cta} onChange={(e) => set({ cta: e.target.value })} /></label>
              <label className="field"><span>Sobre</span><textarea id="site-about" className="textarea" style={{ minHeight: 60 }} value={d.about} onChange={(e) => set({ about: e.target.value })} /></label>
              <label className="field"><span>Serviços (um por linha)</span><textarea id="site-svc" className="textarea" style={{ minHeight: 80 }} value={d.services.join('\n')} onChange={(e) => set({ services: e.target.value.split('\n').filter(Boolean) })} /></label>
            </Group>
            <Group icon={<Palette size={15} />} title="Cores e estilo">
              <div className="field"><span>Paletas da marca</span>
                <div className="pal-list">{d.palettes.map((p) => <button type="button" key={p.id} className={p.id === d.palette.id ? 'on' : ''} onClick={() => set({ palette: p })}><span style={{ background: `linear-gradient(135deg, ${p.bg} 55%, ${p.accent} 55%)` }} />{p.label}</button>)}</div>
              </div>
              <div className="field"><span>Tipografia</span><div className="font-pick">{Object.entries(FONTS).map(([k, f]) => <button type="button" key={k} className={d.font === k ? 'on' : ''} onClick={() => set({ font: k })} style={{ fontFamily: f.display, fontWeight: f.weight, fontStyle: f.italic ? 'italic' : 'normal' }}>Aa<small>{f.label}</small></button>)}</div></div>
              <div className="field"><span>Cantos</span><Chips value={d.radius} onChange={(v) => set({ radius: v })} options={{ reto: 'Retos', suave: 'Suaves', redondo: 'Redondos' }} /></div>
            </Group>
            <Group icon={<LayoutTemplate size={15} />} title="Topo"><Thumbs kind="hero" value={d.hero} onChange={(v) => setAnim({ hero: v })} options={HEROES} /></Group>
            <Group icon={<GripVertical size={15} />} title="Seções">
              <span className="faint" style={{ fontSize: 12 }}>Arraste para reordenar, ligue ou desligue e escolha o estilo de cada uma.</span>
              <Reorder.Group axis="y" values={d.order} onReorder={(order) => set({ order })} style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 6 }}>
                {d.order.map((b) => (
                  <Reorder.Item key={b} value={b} className={`block-row ${d.on[b] ? '' : 'off'}`} style={{ cursor: 'grab', flexWrap: 'wrap' }}>
                    <GripVertical size={14} className="faint" /><span className="grow">{BLOCKS[b].label}</span>
                    <button type="button" className="btn-icon sm" aria-label={d.on[b] ? `Esconder ${BLOCKS[b].label}` : `Mostrar ${BLOCKS[b].label}`} onClick={() => set({ on: { ...d.on, [b]: !d.on[b] } })}>{d.on[b] ? <Eye size={13} /> : <EyeOff size={13} />}</button>
                    {d.on[b] && Object.keys(BLOCKS[b].variants).length > 1 && (
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
            </Group>
            <Group icon={<LayoutTemplate size={15} />} title="Rodapé"><Thumbs kind="foot" value={d.footer} onChange={(v) => setAnim({ footer: v })} options={FOOTERS} /></Group>
          </aside>
          <div style={{ display: 'grid', gap: 12, minWidth: 0, position: 'sticky', top: 84, alignSelf: 'start' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span className="label">Prévia ao vivo · role para ver as animações{site.sent ? ' · enviada ao lead' : ''}</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" className="btn-icon" onClick={() => setReplay((r) => r + 1)} aria-label="Repetir animações"><Play size={15} /></button>
                <Segmented id="dev" value={device} onChange={setDevice} options={[{ value: 'desk', label: 'Computador', icon: <Monitor size={13} /> }, { value: 'mob', label: 'Celular', icon: <Smartphone size={13} /> }]} />
              </div>
            </div>
            <Preview lead={lead} d={d} mobile={device === 'mob'} replay={replay} />
          </div>
        </div>
      )}
    </div>
  );
}
