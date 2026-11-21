import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bot, Clock, Database, KeyRound, Link2, MessageSquareText, RefreshCw, RotateCcw, ShieldCheck, Smartphone, Unplug, Users } from 'lucide-react';
import { actions, useStore } from '../data/store';
import { useApp } from '../App';
import { Segmented, Switch, ease, toast } from '../components/ui';

const SECTIONS = [
  { id: 'whatsapp', label: 'WhatsApp', icon: Smartphone },
  { id: 'limites', label: 'Horários e limites', icon: Clock },
  { id: 'mensagens', label: 'Mensagens', icon: MessageSquareText },
  { id: 'ia', label: 'Inteligência artificial', icon: Bot },
  { id: 'integracoes', label: 'Integrações', icon: Link2 },
  { id: 'equipe', label: 'Equipe', icon: Users },
  { id: 'dados', label: 'Dados e privacidade', icon: Database },
];
const DAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

function Row({ title, hint, children }) {
  return <div className="set-row"><div className="txt"><b>{title}</b>{hint && <small>{hint}</small>}</div>{children}</div>;
}

function FakeQR() {
  const cells = useMemo(() => Array.from({ length: 441 }, (_, i) => { const x = i % 21, y = Math.floor(i / 21); const f = (a, b) => x >= a && x < a + 7 && y >= b && y < b + 7 && (x === a || x === a + 6 || y === b || y === b + 6 || (x > a + 1 && x < a + 5 && y > b + 1 && y < b + 5)); return f(0, 0) || f(14, 0) || f(0, 14) || ((x * 7 + y * 13 + x * y) % 3 === 0 && !(x < 8 && y < 8) && !(x > 12 && y < 8) && !(x < 8 && y > 12)); }), []);
  return <div className="qr" aria-label="QR Code de exemplo">{cells.map((on, i) => <i key={i} className={on ? '' : 'w'} />)}</div>;
}

export default function Config() {
  const app = useApp();
  const st = useStore((s) => s.settings);
  const mode = useStore((s) => s.session.mode);
  const [sec, setSec] = useState(SECTIONS.some((s) => s.id === app.param) ? app.param : 'whatsapp');
  useEffect(() => { if (SECTIONS.some((s) => s.id === app.param)) setSec(app.param); }, [app.param]);
  const up = (section, data, msg = 'Configuração salva') => { actions.updateSettings(section, data); toast(msg); };

  return (
    <div className="page">
      <div className="page-h"><div><h1><strong>Configurações</strong></h1><p>Ajuste o número, o ritmo dos robôs, a IA e as integrações.</p></div></div>
      <div className="settings">
        <nav className="set-nav" aria-label="Seções">
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <button type="button" key={id} className={sec === id ? 'on' : ''} onClick={() => setSec(id)} aria-current={sec === id}>
              {sec === id && <motion.span layoutId="set-pill" className="nav-pill" transition={{ duration: 0.35, ease }} />}
              <Icon size={16} />{label}
            </button>
          ))}
        </nav>
        <AnimatePresence mode="wait">
          <motion.section key={sec} className="card set-sec" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25, ease }}>
            {sec === 'whatsapp' && (
              <>
                <h2>WhatsApp</h2><p>O número que os robôs usam. Use um chip só para isso.</p>
                <div className="wa-card">
                  {st.whatsapp.connected ? <span className="botc-ic" style={{ width: 64, height: 64, background: 'var(--green)', borderRadius: 18 }}><ShieldCheck size={28} /></span> : <FakeQR />}
                  <div style={{ display: 'grid', gap: 6 }}>
                    <b style={{ fontFamily: 'var(--f-display)', fontSize: 17 }}>{st.whatsapp.connected ? 'Conectado' : 'Escaneie com o WhatsApp do chip'}</b>
                    <span className="muted">{st.whatsapp.connected ? `${st.whatsapp.number} · aquecimento dia ${st.whatsapp.warmupDay} de ${st.whatsapp.warmupTotal}` : 'No celular: WhatsApp → Aparelhos conectados → Conectar um aparelho.'}</span>
                    <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                      {st.whatsapp.connected
                        ? <button type="button" className="btn btn-danger btn-sm" onClick={() => up('whatsapp', { connected: false }, 'Número desconectado')}><Unplug size={14} />Desconectar</button>
                        : <button type="button" className="btn btn-primary btn-sm" onClick={() => (mode === 'api' ? toast('A conexão do WhatsApp comercial entra na próxima etapa (Baileys).') : up('whatsapp', { connected: true }, 'Número conectado (demonstração)'))}><RefreshCw size={14} />Já escaneei</button>}
                    </div>
                  </div>
                </div>
                <Row title="Aquecimento de número novo" hint="Começa com 10 mensagens por dia e sobe aos poucos até o limite."><Switch on label="Aquecimento" onChange={() => toast('O aquecimento é recomendado para chip novo')} /></Row>
                <Row title="Pausar se houver bloqueio" hint="Se alguém bloquear ou denunciar, os envios param por 24 horas."><Switch on label="Pausar em bloqueio" onChange={() => toast('Mantido ligado por segurança')} /></Row>
              </>
            )}
            {sec === 'limites' && (
              <>
                <h2>Horários e limites</h2><p>O ritmo que protege o número de bloqueios.</p>
                <Row title={`Limite diário: ${st.limits.daily} mensagens`} hint="Recomendado: até 40 para números com menos de 3 meses.">
                  <input type="range" min="10" max="120" step="5" value={st.limits.daily} onChange={(e) => actions.updateSettings('limits', { daily: +e.target.value })} style={{ accentColor: 'var(--green)', width: 200 }} aria-label="Limite diário" />
                </Row>
                <Row title={`Intervalo entre envios: ${st.limits.minInterval} a ${st.limits.maxInterval} min`} hint="Varia a cada mensagem, como uma pessoa.">
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input id="lim-min" className="input" style={{ width: 70 }} type="number" min="1" value={st.limits.minInterval} onChange={(e) => actions.updateSettings('limits', { minInterval: +e.target.value })} aria-label="Intervalo mínimo" />
                    <input id="lim-max" className="input" style={{ width: 70 }} type="number" min="2" value={st.limits.maxInterval} onChange={(e) => actions.updateSettings('limits', { maxInterval: +e.target.value })} aria-label="Intervalo máximo" />
                  </div>
                </Row>
                <Row title="Horário de envio" hint="Fora desse horário, nada é enviado.">
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input id="lim-start" className="input" type="time" value={st.limits.start} onChange={(e) => actions.updateSettings('limits', { start: e.target.value })} style={{ width: 110 }} aria-label="Início" />
                    <span className="faint">até</span>
                    <input id="lim-end" className="input" type="time" value={st.limits.end} onChange={(e) => actions.updateSettings('limits', { end: e.target.value })} style={{ width: 110 }} aria-label="Fim" />
                  </div>
                </Row>
                <Row title="Dias da semana">
                  <div className="days">{DAYS.map((d, i) => { const on = st.limits.days.includes(i); return <button type="button" key={i} className={on ? 'on' : ''} aria-pressed={on} onClick={() => actions.updateSettings('limits', { days: on ? st.limits.days.filter((x) => x !== i) : [...st.limits.days, i].sort() })}>{d}</button>; })}</div>
                </Row>
                <Row title="Pular feriados nacionais"><Switch on={st.limits.skipHolidays} label="Pular feriados" onChange={(v) => up('limits', { skipHolidays: v })} /></Row>
              </>
            )}
            {sec === 'mensagens' && (
              <>
                <h2>Mensagens</h2><p>Como o time fala em nome da agência.</p>
                <Row title="Tom de voz"><Segmented id="tone" value={st.messages.tone} onChange={(v) => up('messages', { tone: v })} options={['Próximo e direto', 'Formal', 'Descontraído'].map((v) => ({ value: v, label: v }))} /></Row>
                <label className="field"><span>Assinatura</span><input id="msg-sig" className="input" value={st.messages.signature} onChange={(e) => actions.updateSettings('messages', { signature: e.target.value })} /></label>
                <label className="field"><span>Palavras que encerram o contato</span><input id="msg-opt" className="input" value={st.messages.optOut} onChange={(e) => actions.updateSettings('messages', { optOut: e.target.value })} /><small>Se a pessoa escrever uma delas, o robô para e marca "Não contatar" para sempre.</small></label>
                <Row title={`Máximo de follow-ups: ${st.messages.maxFollowups}`}><input type="range" min="0" max="5" value={st.messages.maxFollowups} onChange={(e) => actions.updateSettings('messages', { maxFollowups: +e.target.value })} style={{ accentColor: 'var(--green)', width: 160 }} aria-label="Máximo de follow-ups" /></Row>
                <Row title="Pedir aprovação em mensagens sensíveis" hint="O Redator manda para você quando não tem certeza."><Switch on={st.messages.approveSensitive} label="Aprovação" onChange={(v) => up('messages', { approveSensitive: v })} /></Row>
              </>
            )}
            {sec === 'ia' && (
              <>
                <h2>Inteligência artificial</h2><p>A IA analisa os leads, escreve as mensagens e lê as respostas.</p>
                <div className="wa-card">
                  <span className="botc-ic" style={{ width: 52, height: 52, background: st.ai.keyConfigured ? 'var(--green)' : 'var(--surface-3)', color: st.ai.keyConfigured ? 'var(--green-ink)' : 'var(--text-3)' }}><KeyRound size={22} /></span>
                  <div style={{ display: 'grid', gap: 4 }}><b>{st.ai.keyConfigured ? 'Chave da API configurada' : 'Chave da API ainda não configurada'}</b><span className="muted" style={{ fontSize: 13 }}>A chave fica guardada no servidor e nunca aparece aqui. Enquanto isso, a análise usa regras de demonstração.</span></div>
                </div>
                <Row title="Modelo"><Segmented id="model" value={st.ai.model} onChange={(v) => up('ai', { model: v })} options={['Claude Haiku', 'Claude Sonnet'].map((v) => ({ value: v, label: v }))} /></Row>
                <Row title={`Criatividade das mensagens: ${Math.round(st.ai.creativity * 100)}%`} hint="Mais baixo = mais previsível. Mais alto = mais variado."><input type="range" min="0" max="1" step="0.1" value={st.ai.creativity} onChange={(e) => actions.updateSettings('ai', { creativity: +e.target.value })} style={{ accentColor: 'var(--green)', width: 180 }} aria-label="Criatividade" /></Row>
                <Row title="Analisar assim que o lead for encontrado" hint="Gasta mais créditos da API, mas o funil já chega com nota."><Switch on={st.ai.analyzeOnFind} label="Analisar automaticamente" onChange={(v) => up('ai', { analyzeOnFind: v })} /></Row>
              </>
            )}
            {sec === 'integracoes' && (
              <>
                <h2>Integrações</h2><p>Serviços que o Radar usa por trás.</p>
                <label className="field"><span>Endereço do Caçador (scraper do Google Maps)</span><input id="int-scraper" className="input" value={st.integrations.scraperUrl} onChange={(e) => actions.updateSettings('integrations', { scraperUrl: e.target.value })} /><small>O container gosom/google-maps-scraper no seu servidor.</small></label>
                <Row title="Google Agenda" hint="Marca as calls direto na sua agenda. Em breve."><Switch on={st.integrations.calendar} label="Google Agenda" onChange={(v) => up('integrations', { calendar: v }, v ? 'Vamos conectar quando a integração estiver pronta' : 'Desligado')} /></Row>
                <label className="field"><span>Webhook de lead ganho</span><input id="int-hook" className="input" value={st.integrations.webhook} onChange={(e) => actions.updateSettings('integrations', { webhook: e.target.value })} placeholder="https://…" /><small>Avisamos outro sistema quando um lead vira cliente.</small></label>
              </>
            )}
            {sec === 'equipe' && (
              <>
                <h2>Equipe</h2><p>Quem pode entrar no Radar.</p>
                {[['David', 'Administrador', 'Você'], ['Equipe Teleios', 'Atendimento', 'Convite pendente']].map(([n, r, s]) => (
                  <div className="set-row" key={n}><div style={{ display: 'flex', gap: 12, alignItems: 'center' }}><span className="avatar" style={{ background: 'var(--surface-4)', color: 'var(--text)' }}>{n[0]}</span><div className="txt"><b>{n}</b><small>{r}</small></div></div><span className={`pill ${s === 'Você' ? 'ok' : 'warn'}`}>{s}</span></div>
                ))}
                <button type="button" className="btn btn-ghost btn-sm" style={{ justifySelf: 'start' }} onClick={() => toast('Convites chegam na próxima etapa')}><Users size={14} />Convidar pessoa</button>
              </>
            )}
            {sec === 'dados' && (
              <>
                <h2>Dados e privacidade</h2><p>Cuidados com a LGPD.</p>
                <Row title={`Guardar leads por ${st.data.retentionDays} dias`} hint="Depois disso, leads sem conversa são apagados."><input id="data-ret" className="input" type="number" style={{ width: 90 }} value={st.data.retentionDays} onChange={(e) => actions.updateSettings('data', { retentionDays: +e.target.value })} aria-label="Dias de retenção" /></Row>
                <Row title="Apagar dados de quem pedir para sair" hint="Fica só o número na lista de não contatar."><Switch on={st.data.deleteOnOptOut} label="Apagar no opt-out" onChange={(v) => up('data', { deleteOnOptOut: v })} /></Row>
                {mode === 'demo' && <Row title="Restaurar dados de demonstração" hint="Apaga tudo o que você mudou neste navegador."><button type="button" className="btn btn-danger btn-sm" onClick={() => { actions.reset(); toast('Dados de demonstração restaurados'); }}><RotateCcw size={14} />Restaurar</button></Row>}
              </>
            )}
          </motion.section>
        </AnimatePresence>
      </div>
    </div>
  );
}
