import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, Reorder, motion } from 'framer-motion';
import { Copy, Eye, EyeOff, GripVertical, LayoutTemplate, MapPin, Monitor, Save, Smartphone, Sparkles, Star } from 'lucide-react';
import { actions, useStore } from '../data/store';
import { useApp } from '../App';
import { Empty, Segmented, ease, toast } from '../components/ui';

/* Construtor de site-prévia: monta uma página a partir do briefing da análise da IA,
   para mandar o link na abordagem. Fase beta: edição de textos, blocos, ordem e cores. */
const BLOCKS = { Hero: 'Topo', 'Serviços': 'Serviços', 'Avaliações do Google': 'Avaliações', Galeria: 'Galeria', 'Localização e horário': 'Localização', Contato: 'Contato' };

function Preview({ lead, d, mobile }) {
  const { bg, ink, accent } = d.palette;
  const soft = `color-mix(in srgb, ${ink} 7%, ${bg})`;
  const blocks = {
    Hero: <div className="pv-hero" style={{ background: `radial-gradient(120% 120% at 100% 0%, color-mix(in srgb, ${accent} 22%, ${bg}), ${bg} 60%)` }}><span style={{ fontSize: 12, opacity: 0.7 }}>{lead.name}</span><h1>{d.headline}</h1><p>{d.sub}</p><span className="pv-cta" style={{ background: accent, color: bg }}>{d.cta}</span></div>,
    'Serviços': <div className="pv-sec"><h2>O que fazemos</h2><div className="pv-grid">{d.services.map((s) => <div key={s} style={{ background: soft }}><b>{s}</b></div>)}</div></div>,
    'Avaliações do Google': <div className="pv-sec" style={{ background: soft }}><h2>★ {String(lead.rating).replace('.', ',')} no Google</h2><p style={{ margin: 0, opacity: 0.75 }}>{lead.reviews} avaliações de clientes reais.</p><div className="pv-grid">{['Atendimento impecável!', 'Recomendo de olhos fechados.', 'Voltarei com certeza.'].map((t) => <div key={t} style={{ background: bg }}><Star size={12} fill={accent} color={accent} /> “{t}”</div>)}</div></div>,
    Galeria: <div className="pv-sec"><h2>Galeria</h2><div className="pv-grid">{[0.25, 0.4, 0.15].map((o) => <div key={o} style={{ aspectRatio: '4/3', background: `color-mix(in srgb, ${accent} ${o * 100}%, ${bg})` }} />)}</div></div>,
    'Localização e horário': <div className="pv-sec" style={{ background: soft }}><h2>Onde estamos</h2><p style={{ margin: 0 }}><MapPin size={13} /> {lead.address} · {lead.neighborhood}, {lead.city}<br />{lead.hours}</p></div>,
    Contato: <div className="pv-sec" style={{ background: ink, color: bg }}><h2>Vamos conversar?</h2><span className="pv-cta" style={{ background: accent, color: ink }}>{d.cta}</span></div>,
  };
  return (
    <motion.div className="preview-frame" layout style={{ maxWidth: mobile ? 390 : '100%', margin: '0 auto', width: '100%' }} transition={{ duration: 0.4, ease }}>
      <div className="preview-bar"><i /><i /><i /><span>{lead.name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '')}.previa.teleios.app</span></div>
      <div className="pv" style={{ background: bg, color: ink, maxHeight: 640, overflowY: 'auto' }}>
        <AnimatePresence initial={false}>
          {d.order.filter((b) => d.on[b]).map((b) => <motion.div key={b} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, height: 0 }}>{blocks[b]}</motion.div>)}
        </AnimatePresence>
      </div>
    </motion.div>
  );
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
    if (saved) return saved.data;
    if (!lead?.analysis) return null;
    const b = lead.analysis.brief;
    return { headline: b.headline, sub: b.sub, cta: b.cta, palette: b.palette, order: Object.keys(BLOCKS), on: Object.fromEntries(Object.keys(BLOCKS).map((k) => [k, true])), services: lead.analysis.services.length ? ['Atendimento personalizado', 'Equipe especializada', 'Agendamento rápido'] : [] };
  }, [leadId, lead, saved]);
  const [d, setD] = useState(initial);
  const [device, setDevice] = useState('desk');
  useEffect(() => setD(initial), [initial]);

  const palettes = lead ? [lead.analysis?.brief.palette, { bg: '#05080C', ink: '#E9EEEC', accent: '#00C48C' }, { bg: '#FFFFFF', ink: '#14181D', accent: '#1F3C88' }, { bg: '#F3EEE6', ink: '#2A1F14', accent: '#B8743C' }].filter(Boolean) : [];

  return (
    <div className="page" style={{ maxWidth: 'none' }}>
      <div className="page-h">
        <div><h1><strong>Sites-prévia</strong> <span className="pill violet" style={{ verticalAlign: 'middle' }}>Beta</span></h1><p>Uma prévia do site da empresa, montada com a análise da IA, para mandar junto da abordagem.</p></div>
        {d && <div className="page-actions">
          <button type="button" className="btn btn-ghost" onClick={() => navigator.clipboard?.writeText(`https://previa.teleios.app/${leadId}`).then(() => toast('Link copiado (demonstração)'), () => toast('Não foi possível copiar'))}><Copy size={15} />Copiar link</button>
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
                <div className="ai-sug" style={{ marginTop: 0 }}><Sparkles size={15} /><span>Textos e cores vieram do <b>briefing da IA</b>. Edite à vontade.</span></div>
                <label className="field"><span>Título</span><input id="site-h" className="input" value={d.headline} onChange={(e) => setD({ ...d, headline: e.target.value })} /></label>
                <label className="field"><span>Subtítulo</span><textarea id="site-sub" className="textarea" style={{ minHeight: 64 }} value={d.sub} onChange={(e) => setD({ ...d, sub: e.target.value })} /></label>
                <label className="field"><span>Botão</span><input id="site-cta" className="input" value={d.cta} onChange={(e) => setD({ ...d, cta: e.target.value })} /></label>
                <div className="field"><span>Cores</span><div className="swatches">{palettes.map((p, i) => <button type="button" key={i} aria-label={`Paleta ${i + 1}`} className={p.bg === d.palette.bg && p.accent === d.palette.accent ? 'on' : ''} style={{ background: `linear-gradient(135deg, ${p.bg} 50%, ${p.accent} 50%)` }} onClick={() => setD({ ...d, palette: p })} />)}</div></div>
                <div className="field"><span>Blocos (arraste para reordenar)</span>
                  <Reorder.Group axis="y" values={d.order} onReorder={(order) => setD({ ...d, order })} style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 6 }}>
                    {d.order.map((b) => (
                      <Reorder.Item key={b} value={b} className={`block-row ${d.on[b] ? '' : 'off'}`} style={{ cursor: 'grab' }}>
                        <GripVertical size={14} className="faint" /><span className="grow">{BLOCKS[b]}</span>
                        <button type="button" className="btn-icon sm" aria-label={d.on[b] ? `Esconder ${BLOCKS[b]}` : `Mostrar ${BLOCKS[b]}`} onClick={() => setD({ ...d, on: { ...d.on, [b]: !d.on[b] } })}>{d.on[b] ? <Eye size={13} /> : <EyeOff size={13} />}</button>
                      </Reorder.Item>
                    ))}
                  </Reorder.Group>
                </div>
              </>
            )}
          </aside>
          <div style={{ display: 'grid', gap: 12, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span className="label">Prévia ao vivo</span>
              <Segmented id="dev" value={device} onChange={setDevice} options={[{ value: 'desk', label: 'Computador', icon: <Monitor size={13} /> }, { value: 'mob', label: 'Celular', icon: <Smartphone size={13} /> }]} />
            </div>
            {d && lead ? <Preview lead={lead} d={d} mobile={device === 'mob'} /> : <div className="card"><Empty icon={<LayoutTemplate size={22} />} title="Escolha uma empresa">O briefing da IA monta a primeira versão.</Empty></div>}
          </div>
        </div>
      )}
    </div>
  );
}
