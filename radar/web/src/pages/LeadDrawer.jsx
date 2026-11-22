import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BadgeDollarSign, CalendarClock, Clock, Copy, ExternalLink, Globe, Instagram, LayoutTemplate, Mail, MapPin, Megaphone, MessageCircle, MessagesSquare,
  NotebookPen, Pencil, Phone, RefreshCw, ScanSearch, Send, Sparkles, Star, Target, Trash2, User, X, Zap, Building2, Crown, Gauge,
} from 'lucide-react';
import { actions, useStore } from '../data/store';
import { AskClaude } from '../components/ClaudeQueue';
import BriefButton from '../components/BriefButton';
import { STAGES } from '../data/seed';
import { useApp } from '../App';
import { Avatar, Drawer, Empty, ScoreRing, StageChip, ago, ease, money, toast } from '../components/ui';

const TABS = [
  { id: 'geral', label: 'Visão geral', icon: User },
  { id: 'ia', label: 'Análise da IA', icon: Sparkles },
  { id: 'conversa', label: 'Conversa', icon: MessagesSquare },
  { id: 'historico', label: 'Histórico', icon: Clock },
  { id: 'notas', label: 'Notas', icon: NotebookPen },
];
const SEV = { alta: 'var(--danger)', media: 'var(--warn)', baixa: 'var(--text-3)' };
const PART = [
  { k: 'site', label: 'Site', icon: Globe },
  { k: 'social', label: 'Redes', icon: Instagram },
  { k: 'reputation', label: 'Reputação', icon: Star },
  { k: 'ads', label: 'Anúncios', icon: Megaphone },
];

function Analysis({ lead }) {
  const [busy, setBusy] = useState(false);
  const a = lead.analysis;
  const run = async () => { setBusy(true); await actions.analyzeLead(lead.id); setBusy(false); toast('Análise atualizada'); };
  const copy = (t) => navigator.clipboard?.writeText(t).then(() => toast('Mensagem copiada'), () => toast('Não foi possível copiar'));

  if (busy) {
    return (
      <div className="scan">
        <div className="scan-ring" />
        <b style={{ fontFamily: 'var(--f-display)' }}>O Analista está olhando o digital da empresa…</b>
        <span className="faint">Site, Instagram, avaliações do Google e anúncios</span>
        <div style={{ display: 'grid', gap: 8, width: '100%', marginTop: 10 }}>{[80, 60, 70].map((w) => <div key={w} className="skeleton" style={{ height: 14, width: `${w}%` }} />)}</div>
      </div>
    );
  }
  if (!a) {
    return <Empty icon={<ScanSearch size={22} />} title="Este lead ainda não foi analisado" action={<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}><button type="button" className="btn btn-primary" onClick={run}><Sparkles size={15} />Análise rápida</button><AskClaude kind="analise" leads={[lead.id]} label="Análise com o Claude" className="btn btn-ghost" /></div>}>A IA avalia site, redes, reputação e anúncios e diz qual serviço oferecer.</Empty>;
  }
  return (
    <motion.div style={{ display: 'grid', gap: 18 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="ai-hero">
        <ScoreRing value={a.opportunity} size={84} stroke={7} lg />
        <div>
          <span className="label">Oportunidade para a agência</span>
          <p style={{ color: 'var(--text)', fontSize: 14.5 }}>{a.summary}</p>
          <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
            <span className="pill ok"><BadgeDollarSign />{money(a.ticket.oneOff)} {a.ticket.monthly ? `+ ${money(a.ticket.monthly)}/mês` : ''}</span>
            <span className="pill cool">Força do negócio {a.strength}</span>
            <button type="button" className="link" onClick={run}><RefreshCw size={12} />Refazer análise</button>
            <AskClaude kind="analise" leads={[lead.id]} label="Claude analisar" className="link" />
          </div>
        </div>
      </div>

      <div className="parts">
        {PART.map(({ k, label, icon: Icon }, i) => (
          <div className="part" key={k}>
            <div className="part-top"><span style={{ display: 'flex', gap: 6, alignItems: 'center' }}><Icon size={14} />{label}</span><strong className="tnum">{a.parts[k]}</strong></div>
            <div className="bar"><motion.i style={{ background: a.parts[k] >= 70 ? 'var(--hot)' : a.parts[k] >= 45 ? 'var(--warn)' : 'var(--green)' }} initial={{ width: 0 }} animate={{ width: `${a.parts[k]}%` }} transition={{ delay: i * 0.08, duration: 0.8, ease }} /></div>
            <small className="faint" style={{ fontSize: 11 }}>{a.parts[k] >= 70 ? 'Grande oportunidade' : a.parts[k] >= 45 ? 'Pode melhorar' : 'Está ok'}</small>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gap: 10 }}>
        <span className="label">O que está faltando ({a.gaps.length})</span>
        <div className="gaps">
          {a.gaps.map((g, i) => (
            <motion.div className="gap" key={g.title} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <span className="sev" style={{ background: SEV[g.severity] }} />
              <div><b>{g.title}</b><p>{g.detail}</p></div>
              <span className="pill">{g.area}</span>
            </motion.div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gap: 10 }}>
        <span className="label">Serviços recomendados</span>
        <div className="svc-list">
          {a.services.map((s) => <div className="svc" key={s.name}><Target size={16} color="var(--green)" /><span className="grow">{s.name}</span><b className="tnum">{money(s.price)}{s.monthly ? '/mês' : ''}</b></div>)}
        </div>
      </div>

      <div style={{ display: 'grid', gap: 10 }}>
        <span className="label">Ângulo da abordagem</span>
        <p style={{ margin: 0, color: 'var(--text-2)' }}>{a.angle}</p>
        <div className="msg-box">{a.message}</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => { actions.moveLeads([lead.id], 'sent'); toast('Mensagem na fila de envio (demonstração)'); }}><Send size={14} />Enviar pelo robô</button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => copy(a.message)}><Copy size={14} />Copiar</button>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 10 }}>
        <span className="label">Briefing do site-prévia</span>
        <div className="brief">
          <div className="brief-mini" style={{ background: a.brief.palette.bg, color: a.brief.palette.ink }}>
            <span style={{ opacity: 0.7 }}>{lead.name}</span>
            <b>{a.brief.headline}</b>
            <span style={{ justifySelf: 'start', background: a.brief.palette.accent, color: a.brief.palette.bg, padding: '4px 8px', borderRadius: 99, fontWeight: 700 }}>{a.brief.cta}</span>
          </div>
          <div style={{ display: 'grid', gap: 8, alignContent: 'start' }}>
            <b style={{ fontFamily: 'var(--f-display)', fontSize: 16 }}>{a.brief.headline}</b>
            <span className="muted" style={{ fontSize: 13 }}>{a.brief.sub}</span>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{a.brief.sections.map((s) => <span key={s} className="tag">{s}</span>)}</div>
            <span className="faint" style={{ fontSize: 12 }}>Tom: {a.brief.tone}</span>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}><a className="btn btn-primary btn-sm" href={`#sites-${lead.id}`}><LayoutTemplate size={14} />Criar site-prévia</a><AskClaude kind="previa" leads={[lead.id]} label="Claude criar a prévia" /><BriefButton lead={lead} /></div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Notes({ lead }) {
  const [text, setText] = useState('');
  const [edit, setEdit] = useState(null);
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <form onSubmit={(e) => { e.preventDefault(); if (!text.trim()) return; actions.addNote(lead.id, text.trim()); setText(''); toast('Nota salva'); }} style={{ display: 'grid', gap: 8 }}>
        <textarea id="note-new" className="textarea" value={text} onChange={(e) => setText(e.target.value)} placeholder="Escreva uma nota sobre este lead…" />
        <button type="submit" className="btn btn-primary btn-sm" style={{ justifySelf: 'end' }} disabled={!text.trim()}>Salvar nota</button>
      </form>
      {lead.notes.length === 0 && <Empty icon={<NotebookPen size={22} />} title="Sem notas ainda">Anote o que conversou, objeções e próximos passos.</Empty>}
      <AnimatePresence>
        {lead.notes.map((n) => (
          <motion.div key={n.id} className="note" layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 20 }}>
            <div className="note-h"><span>{ago(n.at)}</span><span style={{ display: 'flex', gap: 4 }}>
              <button type="button" className="btn-icon sm" onClick={() => setEdit({ id: n.id, text: n.text })} aria-label="Editar nota"><Pencil size={13} /></button>
              <button type="button" className="btn-icon sm" onClick={() => { actions.deleteNote(lead.id, n.id); toast('Nota excluída'); }} aria-label="Excluir nota"><Trash2 size={13} /></button>
            </span></div>
            {edit?.id === n.id ? (
              <form onSubmit={(e) => { e.preventDefault(); actions.updateNote(lead.id, n.id, edit.text); setEdit(null); toast('Nota atualizada'); }} style={{ display: 'grid', gap: 8 }}>
                <textarea className="textarea" value={edit.text} onChange={(e) => setEdit({ ...edit, text: e.target.value })} aria-label="Editar nota" />
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}><button type="button" className="btn btn-ghost btn-sm" onClick={() => setEdit(null)}>Cancelar</button><button type="submit" className="btn btn-primary btn-sm">Salvar</button></div>
              </form>
            ) : <span>{n.text}</span>}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export default function LeadDrawer({ id, onClose }) {
  const app = useApp();
  const lead = useStore((s) => s.leads.find((l) => l.id === id));
  const conv = useStore((s) => s.conversations[id]);
  const [tab, setTab] = useState('geral');
  const [enriching, setEnriching] = useState(false);
  const live = useStore((s) => s.session.mode === 'api');
  useEffect(() => { if (id) setTab('geral'); }, [id]);

  const del = () => { const undo = actions.deleteLeads([id]); onClose(); toast('Lead excluído', undo); };

  return (
    <Drawer open={!!lead} onClose={onClose}>
      {lead && (
        <>
          <div className="drawer-h">
            <Avatar name={lead.name} size="lg" />
            <div className="grow">
              <h2>{lead.name}</h2>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                {lead.blocked ? <span className="pill bad">Não contatar</span> : <StageChip stage={lead.stage} />}
                <span className="pill">{lead.category}</span>
                {lead.tags.map((t) => <span key={t} className="tag">{t}</span>)}
                {lead.analysis && <span className="pill ok"><Sparkles />Oportunidade {lead.analysis.opportunity}</span>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button type="button" className="btn-icon" onClick={() => app.editLead(lead)} aria-label="Editar lead"><Pencil size={16} /></button>
              <button type="button" className="btn-icon" onClick={del} aria-label="Excluir lead"><Trash2 size={16} /></button>
              <button type="button" className="btn-icon" onClick={onClose} aria-label="Fechar"><X size={16} /></button>
            </div>
          </div>
          <div className="drawer-tabs" role="tablist">
            {TABS.map(({ id: t, label, icon: Icon }) => (
              <button type="button" key={t} role="tab" aria-selected={tab === t} className={`tab ${tab === t ? 'on' : ''}`} onClick={() => setTab(t)}>
                <Icon size={15} />{label}{t === 'notas' && lead.notes.length > 0 && <span className="pill" style={{ height: 18 }}>{lead.notes.length}</span>}
                {tab === t && <motion.span layoutId="tab-line" className="tab-line" transition={{ duration: 0.3, ease }} />}
              </button>
            ))}
          </div>
          <div className="drawer-body">
            <AnimatePresence mode="wait">
              <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }} style={{ display: 'grid', gap: 18 }}>
                {tab === 'geral' && (
                  <>
                    <label className="field"><span>Etapa do funil</span>
                      <select id="lead-stage" className="select" value={lead.stage} onChange={(e) => { actions.moveLeads([lead.id], e.target.value); toast(`Movido para ${STAGES.find((s) => s.id === e.target.value).name}`); }}>
                        {STAGES.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </label>
                    <dl className="dl">
                      <div><dt><Crown size={12} />Decisor</dt><dd>{lead.decisor ? <>{lead.decisor.nome} <span className="faint">· {lead.decisor.cargo}</span><div className="faint" style={{ fontSize: 12 }}>Fonte: {lead.decisor.fonte}</div></> : <span className="faint">{lead.contact || 'Não identificado'}</span>}</dd></div>
                      <div><dt><Phone size={12} />Telefone</dt><dd>{lead.phone} {lead.waValid === true ? <span className="pill ok" style={{ marginLeft: 6 }}><MessageCircle />WhatsApp confirmado</span> : lead.waValid === false ? <span className="pill bad" style={{ marginLeft: 6 }}>Sem WhatsApp</span> : lead.whatsapp ? <span className="pill" style={{ marginLeft: 6 }}><MessageCircle />Provável WhatsApp</span> : <span className="pill bad" style={{ marginLeft: 6 }}>Sem WhatsApp</span>}</dd></div>
                      {lead.company && <div><dt><Building2 size={12} />Empresa</dt><dd>{lead.company.razao || lead.company.fantasia}<div className="faint" style={{ fontSize: 12 }}>CNPJ {String(lead.company.cnpj).replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')}{lead.company.abertura ? ` · aberta em ${lead.company.abertura.split('-').reverse().join('/')}` : ''}{lead.company.porte ? ` · ${lead.company.mei ? 'MEI' : lead.company.porte}` : ''}{lead.company.cnaeDesc ? ` · ${lead.company.cnaeDesc}` : ''}</div></dd></div>}
                      <div><dt><MapPin size={12} />Endereço</dt><dd>{lead.address} · {lead.neighborhood}, {lead.city}</dd></div>
                      <div><dt><CalendarClock size={12} />Horário</dt><dd>{lead.hours}</dd></div>
                      <div><dt><Globe size={12} />Site</dt><dd>{lead.website ? <a href={`https://${lead.website}`} target="_blank" rel="noreferrer">{lead.website} <ExternalLink size={11} /></a> : <span className="faint">Não tem</span>}{lead.site && !lead.site.offline && <div className="faint" style={{ fontSize: 12 }}>{lead.pagespeed ? `PageSpeed ${lead.pagespeed.score}/100${lead.pagespeed.lcp ? ` · carrega em ${lead.pagespeed.lcp}` : ''}` : `Velocidade ${lead.site.speed}/100`}{lead.siteAudit?.platform ? ` · ${lead.siteAudit.platform}` : ''}{lead.siteAudit?.abandoned ? ` · parado desde ${lead.siteAudit.copyrightYear}` : ''}</div>}{lead.siteAudit && <div className="faint" style={{ fontSize: 12 }}>{[lead.siteAudit.metaPixel && 'Pixel do Meta', lead.siteAudit.googleAds && 'Google Ads', lead.siteAudit.analytics && 'Analytics', lead.siteAudit.whatsappButton && 'botão de WhatsApp'].filter(Boolean).join(' · ') || 'Sem Pixel, Ads, Analytics ou botão de WhatsApp'}</div>}{lead.site?.offline && <div className="faint" style={{ fontSize: 12 }}>Não abriu na verificação</div>}</dd></div>
                      <div><dt><Instagram size={12} />Instagram</dt><dd>{lead.instagram || <span className="faint">Não tem</span>}{lead.social && (lead.social.followers != null || lead.social.lastPostDays != null) && <div className="faint" style={{ fontSize: 12 }}>{lead.social.followers != null ? `${Number(lead.social.followers).toLocaleString('pt-BR')} seguidores` : ''}{lead.social.lastPostDays != null ? ` · último post há ${lead.social.lastPostDays} dias` : ''}</div>}</dd></div>
                      <div><dt><Star size={12} />Google</dt><dd>★ {String(lead.rating).replace('.', ',')} · {lead.reviews} avaliações<div className="faint" style={{ fontSize: 12 }}>{lead.reviewInsights?.unansweredPct != null ? `${lead.reviewInsights.unansweredPct}% sem resposta do dono · ` : ''}{lead.photos} fotos</div></dd></div>
                      <div><dt><Mail size={12} />E-mail</dt><dd>{lead.email || <span className="faint">Não encontrado</span>}</dd></div>
                      <div><dt><Megaphone size={12} />Anúncios</dt><dd>{lead.ads ? 'Anuncia no Google/Meta' : 'Não anuncia'}</dd></div>
                      <div><dt><Zap size={12} />Próximo passo</dt><dd>{lead.next}</dd></div>
                    </dl>
                    {live && <button type="button" className="btn btn-ghost btn-sm" style={{ justifySelf: 'start' }} disabled={enriching} onClick={() => { setEnriching(true); actions.enrichLead(lead.id).then(() => toast('Lead enriquecido: site, CNPJ, decisor e WhatsApp'), (e) => toast(e.message)).finally(() => setEnriching(false)); }}><RefreshCw size={13} className={enriching ? 'spin' : ''} />{enriching ? 'Enriquecendo…' : 'Enriquecer (site, CNPJ, decisor, WhatsApp)'}</button>}
                    {lead.analysis && (
                      <button type="button" className="ai-sug" style={{ textAlign: 'left', cursor: 'pointer' }} onClick={() => setTab('ia')}>
                        <Sparkles size={15} /><span><b>Resumo da IA:</b> {lead.analysis.summary} <span className="link">Ver análise completa</span></span>
                      </button>
                    )}
                  </>
                )}
                {tab === 'ia' && <Analysis lead={lead} />}
                {tab === 'conversa' && (conv ? (
                  <div style={{ display: 'grid', gap: 10 }}>
                    {conv.map((m, i) => (m.sys
                      ? <span key={i} className="sys" style={{ justifySelf: 'center' }}>{m.text}</span>
                      : <div key={i} className={`m ${m.t} ${m.me ? 'me' : ''}`} style={{ justifySelf: m.t === 'in' ? 'start' : 'end' }}>{m.by && <span className="by">{m.by}</span>}{m.text}<small>{ago(m.at)}</small></div>))}
                    <a className="btn btn-primary btn-sm" style={{ justifySelf: 'start' }} href={`#conversas-${lead.id}`}><MessagesSquare size={14} />Abrir em Conversas</a>
                  </div>
                ) : <Empty icon={<MessagesSquare size={22} />} title="Ainda sem conversa">Quando o robô fizer o primeiro contato, a conversa aparece aqui.</Empty>)}
                {tab === 'historico' && (
                  <ul className="timeline">
                    {[
                      { icon: Target, t: 'Encontrada pelo Caçador', d: `Campanha #${lead.campaign}`, at: lead.createdAt },
                      lead.analysis && { icon: ScanSearch, t: 'Analisada pela IA', d: `Oportunidade ${lead.analysis.opportunity}`, at: lead.analysis.at },
                      lead.lastContactAt && { icon: Send, t: 'Primeira mensagem enviada', d: 'Redator', at: lead.lastContactAt },
                      conv && { icon: MessageCircle, t: 'Respondeu no WhatsApp', d: conv.filter((m) => m.t === 'in').at(-1)?.text, at: conv.at(-1).at },
                      ...lead.notes.map((n) => ({ icon: NotebookPen, t: 'Nota adicionada', d: n.text, at: n.at })),
                    ].filter(Boolean).sort((a, b) => b.at - a.at).map((e, i) => (
                      <li key={i}><span className="tl-ic"><e.icon size={14} /></span><div><b style={{ fontWeight: 600 }}>{e.t}</b><p className="muted">{e.d}</p><small>{ago(e.at)}</small></div></li>
                    ))}
                  </ul>
                )}
                {tab === 'notas' && <Notes lead={lead} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </>
      )}
    </Drawer>
  );
}
