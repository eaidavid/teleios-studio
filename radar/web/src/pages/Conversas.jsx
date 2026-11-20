import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bot, CheckCheck, Hand, MessagesSquare, Search, Send, Sparkles, UserRound } from 'lucide-react';
import { actions, useStore } from '../data/store';
import { useApp } from '../App';
import { Avatar, Empty, ScoreRing, Segmented, StageChip, ago, ease, toast } from '../components/ui';
import { INTENT } from './Hoje';

const QUICK = ['Posso te ligar hoje às 15h?', 'Te mando alguns exemplos agora.', 'Qual o melhor horário para conversarmos?'];
const SUG = {
  interessado: 'Que bom! Temos opções desde uma página simples até o site completo com agendamento. Posso te mostrar em 15 minutos amanhã às 10h?',
  ligacao: 'Claro! Te ligo às 14h neste número, combinado?',
  duvida: 'Já sim! Vou te mandar dois exemplos de varejo agora mesmo.',
};

export default function Conversas() {
  const app = useApp();
  const conversations = useStore((s) => s.conversations);
  const control = useStore((s) => s.control);
  const leads = useStore((s) => s.leads);
  const [filter, setFilter] = useState('todas');
  const [q, setQ] = useState('');
  const ids = Object.keys(conversations).map(Number);
  const [cur, setCur] = useState(+app.param || ids[0]);
  const [text, setText] = useState('');
  const box = useRef(null);
  useEffect(() => { if (app.param) setCur(+app.param); }, [app.param]);

  const list = useMemo(() => ids
    .map((id) => ({ id, lead: leads.find((l) => l.id === id), msgs: conversations[id], who: control[id] || 'bot' }))
    .filter((t) => t.lead)
    .filter((t) => filter === 'todas' || (filter === 'espera' ? t.who === 'bot' && t.msgs.at(-1)?.t === 'in' : t.who === filter))
    .filter((t) => !q || t.lead.name.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => b.msgs.at(-1).at - a.msgs.at(-1).at), [ids, leads, conversations, control, filter, q]);

  const t = { id: cur, lead: leads.find((l) => l.id === cur), msgs: conversations[cur] || [], who: control[cur] || 'bot' };
  const lastIn = [...t.msgs].reverse().find((m) => m.t === 'in');
  const intent = lastIn ? INTENT[lastIn.intent] : null;
  useEffect(() => { box.current?.scrollTo({ top: 99999, behavior: 'smooth' }); }, [cur, t.msgs.length]);

  const take = () => { actions.setControl(cur, 'me'); toast('Conversa com você. O robô parou.'); };
  const giveBack = () => { actions.setControl(cur, 'bot'); toast('O robô volta a cuidar do ritmo'); };
  const send = (e) => { e?.preventDefault(); if (!text.trim()) return; if (t.who !== 'me') actions.setControl(cur, 'me'); actions.send(cur, text.trim()); setText(''); toast('Enviada (demonstração)'); };

  return (
    <div className="page">
      <div className="page-h"><div><h1><strong>Conversas</strong></h1><p>Quando alguém responde, o robô sai da frente. Você assume ou devolve com um clique.</p></div></div>
      <div className="card inbox">
        <div className="threads">
          <div className="threads-h">
            <label className="search" style={{ minWidth: 0, maxWidth: 'none' }}><Search size={15} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar conversa" aria-label="Buscar conversa" /></label>
            <Segmented id="conv" value={filter} onChange={setFilter} options={[{ value: 'todas', label: 'Todas' }, { value: 'espera', label: 'Esperando' }, { value: 'me', label: 'Comigo' }, { value: 'bot', label: 'Robô' }]} />
          </div>
          <div className="thread-list">
            {list.length === 0 && <Empty icon={<MessagesSquare size={20} />} title="Nada por aqui">Nenhuma conversa neste filtro.</Empty>}
            {list.map((x) => {
              const last = x.msgs.at(-1);
              const waiting = x.who === 'bot' && last.t === 'in';
              return (
                <button type="button" key={x.id} className={`th ${x.id === cur ? 'on' : ''}`} onClick={() => setCur(x.id)}>
                  <Avatar name={x.lead.name} />
                  <span style={{ minWidth: 0 }}><b>{x.lead.name}</b><small>{last.text}</small></span>
                  <span style={{ display: 'grid', justifyItems: 'end', gap: 4 }}><time>{ago(last.at)}</time>{waiting && <span className="unread" />}</span>
                </button>
              );
            })}
          </div>
        </div>

        {t.lead ? (
          <div className="chat">
            <div className="chat-h">
              <Avatar name={t.lead.name} />
              <div className="grow"><b style={{ fontFamily: 'var(--f-display)' }}>{t.lead.name}</b><div className="faint" style={{ fontSize: 12 }}>{t.lead.contact} · {t.lead.phone}</div></div>
              {intent && <span className={`pill ${intent.cls}`}><Sparkles />IA: {intent.label}</span>}
              <span className={`pill ${t.who === 'me' ? 'warn' : 'cool'}`}>{t.who === 'me' ? <><UserRound />Você no controle</> : <><Bot />Robô no controle</>}</span>
              {t.who === 'me'
                ? <button type="button" className="btn btn-ghost btn-sm" onClick={giveBack}><Bot size={14} />Devolver ao robô</button>
                : <button type="button" className="btn btn-primary btn-sm" onClick={take}><Hand size={14} />Assumir</button>}
            </div>
            <div className="msgs" ref={box}>
              <AnimatePresence initial={false}>
                {t.msgs.map((m, i) => (m.sys
                  ? <motion.span key={i} className="sys" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>{m.text}</motion.span>
                  : (
                    <motion.div key={i} className={`m ${m.t} ${m.me ? 'me' : ''}`} initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.3, ease }}>
                      {m.by && <span className="by">{m.me ? <UserRound size={11} /> : <Bot size={11} />}{m.by}</span>}
                      {m.text}
                      <small>{ago(m.at)} {m.t === 'out' && <CheckCheck size={12} style={{ verticalAlign: -2, color: 'var(--tech)' }} />}</small>
                    </motion.div>
                  )))}
              </AnimatePresence>
            </div>
            <div className="compose">
              {intent && lastIn && t.msgs.at(-1)?.t === 'in' && (
                <div className="ai-sug" style={{ marginTop: 0, alignItems: 'center' }}>
                  <Sparkles size={15} /><span style={{ flex: 1 }}><b>Sugestão:</b> {SUG[lastIn.intent]}</span>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setText(SUG[lastIn.intent])}>Usar</button>
                </div>
              )}
              <div className="quick">{QUICK.map((x) => <button type="button" key={x} className="chip" onClick={() => setText(x)}>{x}</button>)}</div>
              <form className="compose-row" onSubmit={send}>
                <textarea id="msg" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) send(e); }} placeholder={t.who === 'me' ? 'Escreva sua mensagem' : 'Escrever aqui assume a conversa'} aria-label="Mensagem" />
                <button type="submit" className="btn btn-primary" style={{ height: 46 }} disabled={!text.trim()}><Send size={15} />Enviar</button>
              </form>
            </div>
          </div>
        ) : <Empty icon={<MessagesSquare size={22} />} title="Escolha uma conversa">As respostas dos leads aparecem na lista ao lado.</Empty>}

        {t.lead && (
          <aside className="ctx">
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              {t.lead.analysis && <ScoreRing value={t.lead.analysis.opportunity} size={46} stroke={5} />}
              <div><span className="label">Oportunidade</span><div><StageChip stage={t.lead.stage} /></div></div>
            </div>
            {t.lead.analysis && <p className="muted" style={{ margin: 0, fontSize: 13 }}>{t.lead.analysis.summary}</p>}
            {t.lead.analysis && (
              <div style={{ display: 'grid', gap: 6 }}>
                <span className="label">Ofereça</span>
                {t.lead.analysis.services.slice(0, 3).map((s) => <span key={s.name} className="tag" style={{ height: 'auto', padding: '6px 8px' }}>{s.name}</span>)}
              </div>
            )}
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => app.openLead(t.lead.id)}>Abrir ficha do lead</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => { actions.moveLeads([t.lead.id], 'qual'); toast('Lead qualificado'); }}>Marcar como qualificado</button>
          </aside>
        )}
      </div>
    </div>
  );
}
