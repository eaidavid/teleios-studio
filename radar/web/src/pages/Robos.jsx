import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Inbox, PenLine, Radar, Repeat, ScanSearch, Settings2 } from 'lucide-react';
import { actions, getState, useStore } from '../data/store';
import { botLine, pipeline } from '../data/botStats';
import { Modal, Switch, itemAnim, listAnim, toast } from '../components/ui';

const ICONS = { Radar, ScanSearch, PenLine, Repeat, Inbox };

export default function Robos() {
  const bots = useStore((s) => s.bots);
  const live = useStore((s) => s.session.mode === 'api');
  useStore((s) => s.leads); useStore((s) => s.outbox); useStore((s) => s.approvals);
  const p = pipeline(getState());
  const [edit, setEdit] = useState(null);
  return (
    <div className="page">
      <div className="page-h"><div><h1>Time de <strong>robôs</strong></h1><p>Cada robô tem uma função e uma rotina. Ligue, pause ou ajuste as instruções de cada um.</p></div></div>
      <motion.div className="cards" variants={listAnim} initial="hidden" animate="show">
        {bots.map((b) => {
          const Icon = ICONS[b.icon];
          return (
            <motion.article key={b.id} className="card botc" variants={itemAnim} style={{ opacity: b.on ? 1 : 0.6 }}>
              <div className="botc-h">
                <motion.span className="botc-ic" style={{ background: b.color }} animate={b.on ? { rotate: [0, -6, 6, 0] } : {}} transition={{ duration: 0.6, delay: 0.3 }}><Icon size={20} /></motion.span>
                <div style={{ flex: 1 }}><h3>{b.name}</h3><span className="label">{b.role}</span></div>
                <Switch on={b.on} label={`Ligar ${b.name}`} onChange={() => { actions.toggleBot(b.id); toast(`${b.name} ${b.on ? 'pausado' : 'ligado'}`); }} />
              </div>
              <p>{b.desc}</p>
              <ul>{b.rules.map((r) => <li key={r}><Check size={14} />{r}</li>)}</ul>
              <div className="botc-foot">
                <span>{b.on ? <span className="live" style={{ color: 'var(--green-hi)' }}><i />{live ? botLine(b.id, p) : b.stats}</span> : 'Pausado'}</span>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEdit({ ...b, instructions: b.instructions || '' })}><Settings2 size={13} />Ajustar</button>
              </div>
            </motion.article>
          );
        })}
      </motion.div>
      <Modal open={!!edit} onClose={() => setEdit(null)} title={`Ajustar ${edit?.name || ''}`}
        footer={<><button type="button" className="btn btn-ghost" onClick={() => setEdit(null)}>Cancelar</button><button type="button" className="btn btn-primary" onClick={() => { actions.updateBot(edit.id, { desc: edit.desc, instructions: edit.instructions, rules: edit.rules }); toast('Robô atualizado'); setEdit(null); }}>Salvar</button></>}>
        {edit && (
          <>
            <label className="field"><span>O que ele faz</span><textarea id="bot-desc" className="textarea" value={edit.desc} onChange={(e) => setEdit({ ...edit, desc: e.target.value })} /></label>
            <label className="field"><span>Instruções extras</span><textarea id="bot-ins" className="textarea" value={edit.instructions} onChange={(e) => setEdit({ ...edit, instructions: e.target.value })} placeholder="Ex.: nunca falar de preço na primeira mensagem" /><small>Vai junto com o pedido para a IA.</small></label>
            <label className="field"><span>Regras (uma por linha)</span><textarea id="bot-rules" className="textarea" value={edit.rules.join('\n')} onChange={(e) => setEdit({ ...edit, rules: e.target.value.split('\n').filter(Boolean) })} /></label>
          </>
        )}
      </Modal>
    </div>
  );
}
