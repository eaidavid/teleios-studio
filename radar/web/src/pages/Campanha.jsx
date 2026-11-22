// Tela dedicada de uma campanha: progresso da busca ao vivo e o funil de robôs.
import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft, ExternalLink, Inbox, LayoutTemplate, MapPin, Pause, PenLine, Play, Radar, ScanSearch, Send, Sparkles, Star,
} from 'lucide-react';
import { actions, getState, useStore } from '../data/store';
import { pipeline } from '../data/botStats';
import { useApp } from '../App';
import { AskClaude, PHRASE } from '../components/ClaudeQueue';
import { CountUp, Empty, StageChip, ago, ease, itemAnim, listAnim, toast } from '../components/ui';

const fmtTime = (ms) => { const s = Math.max(0, Math.floor(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };

function HuntCard({ c, live }) {
  const h = c.hunt;
  const [, tick] = useState(0);
  useEffect(() => { if (h?.state !== 'running') return undefined; const t = setInterval(() => tick((x) => x + 1), 1000); return () => clearInterval(t); }, [h?.state]);
  const running = h?.state === 'running';
  const pct = running && h.phase === 'sites' && h.total ? Math.round((h.read / h.total) * 100) : null;
  const run = (engine) => actions.hunt(c.id, engine).then(() => toast('Caçador saiu para buscar'), (e) => toast(e.message));
  return (
    <section className={`card hunt ${running ? 'is-running' : ''}`}>
      <div className="hunt-top">
        <span className="hunt-radar" aria-hidden>{running && <><i /><i /><i /></>}<Radar size={20} /></span>
        <div className="grow">
          <span className="label">Caçador</span>
          <b className="hunt-title">
            {!h || h.state === 'idle' ? 'Ainda não buscou' : running ? (h.phase === 'sites' ? 'Lendo o site de cada empresa' : 'Procurando no Google Maps') : h.state === 'error' ? 'A busca falhou' : 'Busca concluída'}
          </b>
          <span className="muted" style={{ fontSize: 13 }}>
            {running ? `${h.step} · ${fmtTime(Date.now() - h.startedAt)}` : h?.state === 'error' ? h.step : h?.endedAt ? `Terminou ${ago(h.endedAt)} · levou ${fmtTime(h.endedAt - h.startedAt)}` : 'Clique em buscar para começar'}
          </span>
        </div>
        {live && !running && (
          <div style={{ display: 'flex', gap: 6 }}>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => run('google')}><Radar size={13} />{h?.state === 'done' ? 'Buscar de novo' : 'Buscar agora'}</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => run('osm')}>OSM</button>
          </div>
        )}
      </div>
      {running && (
        <div className="hunt-bar" role="progressbar" aria-valuenow={pct ?? undefined} aria-label="Progresso da busca">
          {pct == null ? <motion.span className="indet" animate={{ x: ['-40%', '140%'] }} transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }} /> : <motion.span initial={false} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, ease }} />}
        </div>
      )}
      {h && h.state !== 'idle' && (
        <div className="hunt-nums">
          <div><strong className="tnum">{h.found || 0}</strong><small>achadas no Maps</small></div>
          <div><strong className="tnum">{h.read || 0}{h.total ? `/${h.total}` : ''}</strong><small>sites lidos</small></div>
          <div><strong className="tnum">{h.added || 0}</strong><small>novas no funil</small></div>
        </div>
      )}
      {h?.keywords?.length > 0 && <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{h.keywords.map((k) => <span key={k} className="tag">{k}</span>)}</div>}
      {h?.state === 'done' && h.raw > 0 && <p className="faint" style={{ margin: 0, fontSize: 12 }}>{h.raw} resultados brutos · repetidos removidos{h.offTopic ? ` · ${h.offTopic} fora do segmento` : ''}{h.lowQuality ? ` · ${h.lowQuality} abaixo da qualidade` : ''}{h.far ? ` · ${h.far} fora do raio` : ''}</p>}
      {running && h.phase !== 'sites' && <p className="faint" style={{ margin: 0, fontSize: 12 }}>O Google Maps leva de 3 a 15 minutos, conforme o tamanho da cidade. Pode sair desta tela; a busca continua no servidor.</p>}
    </section>
  );
}

const STEPS = [
  { key: 'found', label: 'Encontradas', bot: 'Caçador', icon: Radar, color: 'var(--green)' },
  { key: 'analyzed', label: 'Analisadas', bot: 'Analista', icon: ScanSearch, color: 'var(--violet)' },
  { key: 'previews', label: 'Com prévia', bot: 'Construtor', icon: LayoutTemplate, color: '#C98BE8' },
  { key: 'written', label: 'Mensagem pronta', bot: 'Redator', icon: PenLine, color: 'var(--warn)' },
  { key: 'sent', label: 'Abordadas', bot: 'Envio', icon: Send, color: 'var(--tech)' },
  { key: 'replied', label: 'Responderam', bot: 'Triagem', icon: Inbox, color: '#FF7A59' },
];

export default function Campanha() {
  const app = useApp();
  const id = Number(app.param);
  const c = useStore((s) => s.campaigns.find((x) => x.id === id));
  const live = useStore((s) => s.session.mode === 'api');
  useStore((s) => s.leads); useStore((s) => s.outbox); useStore((s) => s.approvals); useStore((s) => s.sites);
  const sites = useStore((s) => s.sites);
  useEffect(() => actions.watchHunt(id), [id]);
  const p = pipeline(getState(), id);
  const vals = { ...p, written: p.toApprove + p.queued + p.sent };
  const [sort, setSort] = useState('opp');
  const leads = useMemo(() => [...p.leads].sort((a, b) => (sort === 'opp' ? (b.analysis?.opportunity || 0) - (a.analysis?.opportunity || 0) : (b.rating || 0) - (a.rating || 0))), [p.leads, sort]);
  const top = leads.slice(0, 10).map((l) => l.id);

  if (!c) return <div className="page"><Empty icon={<Radar size={22} />} title="Campanha não encontrada" action={<a className="btn btn-ghost btn-sm" href="#campanhas">Voltar</a>}>Ela pode ter sido excluída.</Empty></div>;
  return (
    <div className="page">
      <a href="#campanhas" className="back-link"><ArrowLeft size={14} />Campanhas</a>
      <div className="page-h">
        <div>
          <h1><strong>{c.name}</strong></h1>
          <p style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}><MapPin size={13} />{c.city}</span>
            {c.category && <span className="tag">{c.category}</span>}
            <span>“{c.query}”</span>
          </p>
        </div>
        <div className="page-actions">
          {c.status === 'running' ? <span className="pill ok live"><i />Ativa</span> : <span className="pill">Pausada</span>}
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => { actions.toggleCampaign(c.id); toast(c.status === 'running' ? 'Campanha pausada' : 'Campanha retomada'); }}>{c.status === 'running' ? <><Pause size={13} />Pausar</> : <><Play size={13} />Retomar</>}</button>
        </div>
      </div>

      <HuntCard c={c} live={live} />

      <motion.section className="flow" variants={listAnim} initial="hidden" animate="show" aria-label="Funil dos robôs">
        {STEPS.map((s, i) => {
          const v = vals[s.key] || 0;
          const base = Math.max(1, vals.found);
          return (
            <motion.div key={s.key} className="flow-step card" variants={itemAnim}>
              <span className="flow-ic" style={{ background: s.color }}><s.icon size={16} /></span>
              <span className="label">{s.bot}</span>
              <strong className="tnum"><CountUp to={v} /></strong>
              <small>{s.label}</small>
              <div className="flow-bar"><motion.span style={{ background: s.color }} initial={{ width: 0 }} animate={{ width: `${Math.min(100, (v / base) * 100)}%` }} transition={{ duration: 0.9, delay: 0.1 + i * 0.07, ease }} /></div>
              {s.key === 'written' && p.toApprove > 0 && <a className="link" href="#hoje" style={{ fontSize: 12 }}>{p.toApprove} para aprovar</a>}
              {s.key === 'sent' && p.queued > 0 && <span className="faint" style={{ fontSize: 12 }}>{p.queued} na fila</span>}
            </motion.div>
          );
        })}
      </motion.section>

      <section className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="card-h" style={{ padding: '16px 18px', flexWrap: 'wrap', gap: 10 }}>
          <h2><Star size={17} />Empresas da campanha <span className="pill">{p.found}</span></h2>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button type="button" className={`chip ${sort === 'opp' ? 'on' : ''}`} onClick={() => setSort('opp')}>Maior oportunidade</button>
            <button type="button" className={`chip ${sort === 'rating' ? 'on' : ''}`} onClick={() => setSort('rating')}>Melhor nota</button>
            {live && p.found > 0 && <button type="button" className="btn btn-ghost btn-sm" onClick={() => { if (!confirm('Remover os leads ainda não abordados que estão fora do segmento ou abaixo da qualidade mínima?')) return; actions.cleanCampaign(c.id).then((r) => toast(r.removed ? `${r.removed} leads ruins removidos` : 'Nada para limpar'), (e) => toast(e.message)); }}>Limpar leads ruins</button>}
            {top.length > 0 && <AskClaude kind="previa" leads={top} label={`Prévias das ${top.length} primeiras`} className="btn btn-primary btn-sm" />}
          </div>
        </div>
        {leads.length === 0 ? (
          <Empty icon={<Radar size={22} />} title="Nenhuma empresa ainda">Quando o Caçador terminar, as empresas aparecem aqui, já analisadas.</Empty>
        ) : (
          <div className="camp-table">
            <AnimatePresence initial={false}>
              {leads.map((l, i) => {
                const site = sites.find((x) => x.lead === l.id);
                return (
                  <motion.button type="button" key={l.id} className="camp-row" onClick={() => app.openLead(l.id)} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: Math.min(i, 12) * 0.02, ease }}>
                    <span className="tnum faint" style={{ width: 22 }}>{i + 1}</span>
                    <span className="grow" style={{ minWidth: 0, display: 'grid', textAlign: 'left' }}>
                      <b className="ellipsis">{l.name}</b>
                      <small className="faint ellipsis">{[l.neighborhood, l.website || 'sem site', l.instagram].filter(Boolean).join(' · ')}</small>
                    </span>
                    <span className="hide-sm faint tnum" style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}><Star size={12} />{l.rating ? String(l.rating).replace('.', ',') : '—'} <small>({l.reviews || 0})</small></span>
                    <span className="hide-sm tnum" style={{ width: 70 }}>{l.analysis ? <span className="opp" style={{ '--v': l.analysis.opportunity }}>{l.analysis.opportunity}</span> : <span className="faint">—</span>}</span>
                    <span className="hide-sm" style={{ width: 90 }}>{site?.url ? <a className="link" href={site.url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}><ExternalLink size={12} />Prévia</a> : <span className="faint" style={{ fontSize: 12 }}>sem prévia</span>}</span>
                    <StageChip stage={l.stage} />
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </section>
      {live && <p className="faint" style={{ fontSize: 12, display: 'flex', gap: 6, alignItems: 'center' }}><Sparkles size={12} />Peça ao Claude: “crie as prévias e prepare a mensagem das 10 melhores da campanha {c.name}” ou use o botão acima e diga “{PHRASE}”.</p>}
    </div>
  );
}
