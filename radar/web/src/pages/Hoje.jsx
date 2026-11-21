import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight, ArrowUpRight, Check, CheckCircle2, Inbox, Loader2, MessageCircle, PenLine, Phone, Radar, Repeat, ScanSearch, Send, Sparkles, Target, Wand2, Zap,
} from 'lucide-react';
import { actions, useStore } from '../data/store';
import { analyze } from '../data/analysis';
import { STAGES } from '../data/seed';
import { useApp } from '../App';
import ClaudeQueue, { PHRASE } from '../components/ClaudeQueue';
import { Avatar, CountUp, Empty, Sparkline, ago, ease, itemAnim, listAnim, toast } from '../components/ui';

export const BOT_ICON = { cacador: Radar, analista: ScanSearch, redator: PenLine, followup: Repeat, triagem: Inbox };
const INTENT = {
  interessado: { label: 'Interessado', cls: 'ok', icon: Sparkles, sug: 'Explicar os pacotes e propor uma call de 15 min amanhã às 10h.' },
  ligacao: { label: 'Pediu ligação', cls: 'warn', icon: Phone, sug: 'Confirmar a ligação para as 14h neste número.' },
  duvida: { label: 'Dúvida', cls: 'cool', icon: MessageCircle, sug: 'Mandar 2 cases de varejo e o link do portfólio.' },
};
export { INTENT };

const SUGGESTIONS = [
  'Restaurantes em Sorocaba com poucas avaliações no Google',
  'Escritórios de advocacia sem Instagram ativo',
  'Academias em Itu e Salto com site lento',
];

function Command() {
  const [q, setQ] = useState('Clínicas de estética em Sorocaba com nota acima de 4,5 e sem site');
  const [step, setStep] = useState(-1);
  const steps = [
    { icon: Radar, color: 'var(--green)', name: 'Caçador', title: 'Buscar no Google Maps', text: 'Empresas, telefones e WhatsApp' },
    { icon: ScanSearch, color: 'var(--violet)', name: 'Analista', title: 'Diagnóstico do digital', text: 'Site, Instagram, avaliações e anúncios' },
    { icon: PenLine, color: 'var(--warn)', name: 'Redator', title: 'Primeira mensagem', text: 'Uma por empresa, citando o ponto fraco' },
    { icon: Send, color: 'var(--tech)', name: 'Ritmo', title: 'Envio seguro', text: 'Até 40 por dia, em horário comercial' },
  ];
  const run = (e) => {
    e.preventDefault();
    if (!q.trim()) return;
    // Vai para a fila: o Claude interpreta o pedido, cria a campanha e dispara o Caçador
    actions.request('busca', [], { texto: q.trim() }).then(() => {
      setStep(0);
      toast(`Pedido na fila do Claude. Diga a ele: "${PHRASE}"`);
    }, (er) => toast(er.message));
  };
  return (
    <section className="card cmd" aria-labelledby="cmd-h">
      <span className="cmd-orb" />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <h2 id="cmd-h" style={{ margin: 0, font: '600 16px var(--f-display)', display: 'flex', gap: 10, alignItems: 'center' }}><Wand2 size={18} color="var(--green)" />Reunião da manhã</h2>
        <span className="label">Diga ao time o que buscar</span>
      </div>
      <form onSubmit={run}>
        <Sparkles size={18} />
        <input id="cmd" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Pedido para o time" placeholder="Ex.: clínicas de estética em Sorocaba sem site" />
        <button className="btn btn-primary" type="submit"><Zap size={15} />Mandar para a fila</button>
      </form>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {SUGGESTIONS.map((s) => <button key={s} type="button" className="chip" onClick={() => setQ(s)}>{s}</button>)}
      </div>
      {step >= 0 && <p className="muted" style={{ margin: 0, fontSize: 13 }}>Na fila. O Claude vai criar a campanha, rodar o Caçador e analisar as empresas quando você disser “{PHRASE}”.</p>}
    </section>
  );
}

export default function Hoje() {
  const app = useApp();
  const leads = useStore((s) => s.leads);
  const conversations = useStore((s) => s.conversations);
  const control = useStore((s) => s.control);
  const activity = useStore((s) => s.activity);
  const bots = useStore((s) => s.bots);
  const approvals = useStore((s) => s.approvals);
  const sent = useStore((s) => s.sentToday);
  const daily = useStore((s) => s.settings.limits.daily);

  const queue = useMemo(() => Object.entries(conversations)
    .filter(([id, m]) => control[id] === 'bot' && m.at(-1)?.t === 'in')
    .map(([id, m]) => ({ lead: leads.find((l) => l.id === +id), msg: m.at(-1) }))
    .filter((x) => x.lead), [conversations, control, leads]);

  const counts = STAGES.map((s) => ({ ...s, n: leads.filter((l) => l.stage === s.id).length }));
  const maxN = Math.max(...counts.map((c) => c.n));
  const open = leads.filter((l) => l.stage === 'prop').reduce((a, l) => a + (l.analysis || analyze(l)).ticket.oneOff, 0);
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  return (
    <div className="page">
      <div className="page-h">
        <div>
          <h1>{greet}, David. {queue.length ? <><strong>{queue.length} {queue.length === 1 ? 'pessoa' : 'pessoas'}</strong> <em>{queue.length === 1 ? 'quer' : 'querem'} conversar.</em></> : <strong>Tudo em dia.</strong>}</h1>
          <p>O time abordou {sent} empresas hoje. As respostas quentes estão no topo.</p>
        </div>
        <div className="page-actions"><a className="btn btn-ghost" href="#funil"><Target size={15} />Ver funil</a></div>
      </div>

      <Command />
      <ClaudeQueue />

      <motion.div className="kpis" variants={listAnim} initial="hidden" animate="show">
        {[
          { label: 'Abordadas hoje', v: sent, sub: `de ${daily} permitidas`, icon: Send, spark: [8, 14, 11, 19, 16, 21, sent], d: '+12%' },
          { label: 'Taxa de resposta', v: 9.1, f: (x) => `${x.toFixed(1).replace('.', ',')}%`, sub: 'últimos 7 dias', icon: MessageCircle, spark: [5, 6.2, 5.8, 7.4, 8.1, 8.6, 9.1], d: '+1,4 pp', color: 'var(--warn)' },
          { label: 'Conversas com você', v: Object.values(control).filter((c) => c === 'me').length + 4, sub: 'assumidas esta semana', icon: Inbox, spark: [1, 2, 2, 3, 4, 4, 5], color: 'var(--tech)' },
          { label: 'Propostas abertas', v: open, f: (x) => (x >= 1000 ? `R$ ${(x / 1000).toFixed(1).replace('.', ',')} mil` : `R$ ${Math.round(x)}`), sub: `${counts[4].n} empresas`, icon: Target, spark: [2, 3, 3, 5, 4, 6, 7], color: 'var(--hot)' },
        ].map((k) => (
          <motion.div key={k.label} className="card kpi" variants={itemAnim}>
            <div className="kpi-top"><span className="label">{k.label}</span><span className="kpi-ic"><k.icon size={16} /></span></div>
            <strong><CountUp to={k.v} format={k.f} /></strong>
            <small>{k.sub} {k.d && <span className="delta"><ArrowUpRight size={12} />{k.d}</span>}</small>
            <Sparkline data={k.spark} color={k.color} />
          </motion.div>
        ))}
      </motion.div>

      <div className="today">
        <div className="col">
          <section className="card">
            <div className="card-h"><h2><Inbox size={17} />Precisa de você {queue.length > 0 && <span className="badge">{queue.length}</span>}</h2><a className="link" href="#conversas">Abrir conversas <ArrowRight size={13} /></a></div>
            {queue.length === 0 ? (
              <Empty icon={<CheckCircle2 size={22} />} title="Ninguém esperando por você">Quando alguém responder, a conversa aparece aqui com uma sugestão de resposta.</Empty>
            ) : (
              <motion.div variants={listAnim} initial="hidden" animate="show">
                <AnimatePresence>
                  {queue.map(({ lead, msg }) => {
                    const it = INTENT[msg.intent] || INTENT.duvida;
                    return (
                      <motion.article key={lead.id} className="q" variants={itemAnim} exit={{ opacity: 0, x: 30, transition: { duration: 0.25 } }} layout>
                        <Avatar name={lead.name} />
                        <div className="q-who">
                          <b>{lead.name}</b>
                          <span className="q-meta">{lead.contact} <span className={`pill ${it.cls}`}><it.icon />{it.label}</span></span>
                          <blockquote>“{msg.text}”</blockquote>
                          <div className="ai-sug"><Sparkles size={15} /><span><b>Sugestão da IA:</b> {it.sug}</span></div>
                        </div>
                        <div className="q-acts">
                          <time>{ago(msg.at)}</time>
                          <a className="btn btn-primary btn-sm" href={`#conversas-${lead.id}`} onClick={() => actions.setControl(lead.id, 'me')}>Assumir</a>
                          <button type="button" className="btn btn-ghost btn-sm" onClick={() => app.openLead(lead.id)}>Ver lead</button>
                        </div>
                      </motion.article>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            )}
          </section>

          <section className="card">
            <div className="card-h"><h2><Zap size={17} />O que o time fez hoje</h2><a className="link" href="#robos">Time de robôs <ArrowRight size={13} /></a></div>
            <motion.ul className="feed" variants={listAnim} initial="hidden" animate="show">
              {activity.map((a) => {
                const b = bots.find((x) => x.id === a.bot); const Icon = BOT_ICON[a.bot];
                return (
                  <motion.li key={a.text} variants={itemAnim}>
                    <span className="bot-ic" style={{ background: b.color }}><Icon size={15} /></span>
                    <p><b>{b.name}</b> {a.text}</p>
                    <time>{ago(a.at)}</time>
                  </motion.li>
                );
              })}
            </motion.ul>
          </section>
        </div>

        <div className="col">
          <section className="card">
            <div className="card-h"><h2><Target size={17} />Funil agora</h2><a className="link" href="#funil">Abrir <ArrowRight size={13} /></a></div>
            <div className="funnel-mini">
              {counts.map((c, i) => (
                <div className="funnel-row" key={c.id}>
                  <span className="muted">{c.name}</span>
                  <div className="bar"><motion.i style={{ background: c.color }} initial={{ width: 0 }} animate={{ width: `${(c.n / maxN) * 100}%` }} transition={{ delay: 0.1 + i * 0.06, duration: 0.8, ease }} /></div>
                  <b className="tnum" style={{ textAlign: 'right' }}>{c.n}</b>
                </div>
              ))}
            </div>
          </section>

          <section className="card">
            <div className="card-h"><h2><PenLine size={17} />Aprovar antes de enviar {approvals.length > 0 && <span className="pill warn">{approvals.length}</span>}</h2>{approvals.length > 1 && <button type="button" className="btn btn-primary btn-sm" onClick={() => { approvals.forEach((a) => actions.approve(a.lead, document.getElementById(`apv-${a.lead}`)?.value)); toast(`${approvals.length} mensagens na fila de envio`); }}><Check size={14} />Aprovar todas</button>}</div>
            {approvals.length === 0 ? (
              <Empty icon={<Check size={22} />} title="Tudo aprovado">O Redator manda para revisão as mensagens em que fica em dúvida.</Empty>
            ) : (
              <ul className="rows">
                <AnimatePresence>
                  {approvals.map((a) => {
                    const l = leads.find((x) => x.id === a.lead);
                    if (!l) return null;
                    const msg = a.text || l.analysis?.message || `Oi! Vi que a ${l.name} tem nota ${l.rating} no Google…`;
                    return (
                      <motion.li key={a.lead} layout exit={{ opacity: 0, height: 0 }} style={{ flexDirection: 'column', alignItems: 'stretch', gap: 10 }}>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}><Avatar name={l.name} size="sm" /><b style={{ fontWeight: 600 }}>{l.name}</b></div>
                        <textarea className="textarea msg-box" style={{ fontSize: 12.5, minHeight: 92 }} defaultValue={msg} id={`apv-${a.lead}`} aria-label={`Mensagem para ${l.name}`} />
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button type="button" className="btn btn-primary btn-sm" onClick={() => { actions.approve(l.id, document.getElementById(`apv-${a.lead}`)?.value); toast('Na fila de envio, no ritmo seguro'); }}><Check size={14} />Aprovar</button>
                          <button type="button" className="btn btn-ghost btn-sm" onClick={() => app.openLead(l.id)}>Ver lead</button>
                          <button type="button" className="btn btn-ghost btn-sm" onClick={() => { actions.rejectApproval(l.id); toast('Mensagem descartada'); }}>Descartar</button>
                        </div>
                      </motion.li>
                    );
                  })}
                </AnimatePresence>
              </ul>
            )}
          </section>

          <section className="card">
            <div className="card-h"><h2><Repeat size={17} />Próximos follow-ups</h2></div>
            <ul className="rows">
              {leads.filter((l) => l.stage === 'sent' && !l.blocked).slice(0, 4).map((l, i) => (
                <li key={l.id}>
                  <span className="when"><b>{['14h', '16h', '09h', '11h'][i]}</b><small>{i < 2 ? 'hoje' : 'amanhã'}</small></span>
                  <button type="button" className="grow" style={{ background: 'none', border: 0, textAlign: 'left', padding: 0 }} onClick={() => app.openLead(l.id)}><b>{l.name}</b><small>{i + 2}º contato · {l.category}</small></button>
                  <span className={`pill ${i === 1 ? 'warn' : 'cool'}`}>{i === 1 ? 'Você' : 'Robô'}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
