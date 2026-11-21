// Fila do Claude: o que você pediu e ele ainda vai fazer.
// No chat do Claude (com o conector do Radar), diga: "faz os pedidos do Radar".
import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Copy, LayoutTemplate, Radar, ScanSearch, Sparkles, X } from 'lucide-react';
import { actions, useStore } from '../data/store';
import { ago, ease, toast } from './ui';

export const PHRASE = 'Faz os pedidos do Radar';
const KIND = {
  previa: { icon: LayoutTemplate, label: 'Site-prévia', color: 'var(--violet)' },
  analise: { icon: ScanSearch, label: 'Análise', color: 'var(--tech)' },
  busca: { icon: Radar, label: 'Busca', color: 'var(--green)' },
};
export const copyPhrase = () => navigator.clipboard?.writeText(PHRASE).then(() => toast('Frase copiada. Cole no chat do Claude.'), () => toast(`Diga ao Claude: "${PHRASE}"`));

/* Botão para mandar um pedido à fila */
export function AskClaude({ kind, leads = [], payload, label, className = 'btn btn-ghost btn-sm', onDone }) {
  const pending = useStore((s) => (s.requests || []).some((r) => r.status === 'pending' && r.kind === kind && leads.length === 1 && r.lead === leads[0]));
  const ask = () => actions.request(kind, leads, payload).then((made) => {
    toast(`${made.length > 1 ? `${made.length} pedidos` : 'Pedido'} na fila do Claude. Diga a ele: "${PHRASE}"`);
    onDone?.(made);
  }, (e) => toast(e.message));
  return (
    <button type="button" className={className} onClick={ask} disabled={pending} title="Entra na fila; o Claude faz quando você pedir no chat">
      {pending ? <><Check size={14} />Na fila do Claude</> : <><Sparkles size={14} />{label || 'Pedir ao Claude'}</>}
    </button>
  );
}

export default function ClaudeQueue({ compact }) {
  const reqs = useStore((s) => s.requests || []);
  const leads = useStore((s) => s.leads);
  const pending = reqs.filter((r) => r.status === 'pending');
  const done = reqs.filter((r) => r.status !== 'pending').slice(0, compact ? 0 : 4);
  const name = (r) => (r.kind === 'busca' ? r.payload?.texto : leads.find((l) => l.id === r.lead)?.name || `Lead ${r.lead}`);
  return (
    <section className="card cq" aria-labelledby="cq-h">
      <div className="cq-h">
        <h2 id="cq-h"><Sparkles size={17} color="var(--violet)" />Fila do Claude <span className="pill violet">{pending.length}</span></h2>
        <button type="button" className="btn btn-ghost btn-sm" onClick={copyPhrase}><Copy size={13} />Copiar pedido</button>
      </div>
      {pending.length === 0 && done.length === 0 ? (
        <p className="muted" style={{ margin: 0, fontSize: 13 }}>Nada na fila. Peça análises, prévias ou buscas e depois diga ao Claude: <b>“{PHRASE}”</b>.</p>
      ) : (
        <>
          {pending.length > 0 && <p className="muted" style={{ margin: 0, fontSize: 13 }}>Abra o Claude (com o conector do Radar) e diga: <b>“{PHRASE}”</b>. Ele faz tudo e os links aparecem aqui.</p>}
          <ul className="cq-list">
            <AnimatePresence initial={false}>
              {[...pending, ...done].map((r) => {
                const K = KIND[r.kind];
                return (
                  <motion.li key={r.id} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease }} className={r.status !== 'pending' ? 'is-done' : ''}>
                    <span className="cq-ic" style={{ background: K.color }}><K.icon size={13} /></span>
                    <div className="grow"><b>{name(r)}</b><small>{K.label} · {r.status === 'pending' ? `pedido ${ago(r.createdAt)}` : r.status === 'failed' ? 'falhou' : 'feito'}</small></div>
                    {r.status === 'pending'
                      ? <button type="button" className="btn-icon sm" aria-label="Cancelar pedido" onClick={() => actions.cancelRequest(r.id)}><X size={13} /></button>
                      : r.result?.link ? <a className="link" href={r.result.link} target="_blank" rel="noreferrer">Abrir</a> : <Check size={14} color="var(--green)" />}
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        </>
      )}
    </section>
  );
}
