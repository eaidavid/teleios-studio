// Conexão real do WhatsApp comercial (modo servidor): QR ao vivo, status e desconectar.
import React, { useEffect, useState } from 'react';
import { Loader2, QrCode, ShieldCheck, Unplug } from 'lucide-react';
import { waApi } from '../data/store';
import { toast } from './ui';

export default function WhatsAppConnect() {
  const [st, setSt] = useState(null);
  const [busy, setBusy] = useState(false);
  const load = () => waApi('GET').then(setSt).catch((e) => toast(e.message));
  useEffect(() => { load(); }, []);
  useEffect(() => {
    if (!st || !['qr', 'connecting'].includes(st.state)) return undefined;
    const t = setInterval(load, 2500);
    return () => clearInterval(t);
  }, [st?.state]); // eslint-disable-line react-hooks/exhaustive-deps

  const connect = async () => { setBusy(true); try { setSt(await waApi('POST', 'connect')); } catch (e) { toast(e.message); } setBusy(false); };
  const logout = async () => {
    if (!confirm('Desconectar o WhatsApp do Radar? O celular continua funcionando normalmente.')) return;
    await waApi('POST', 'logout'); toast('WhatsApp desconectado'); load();
  };

  if (!st) return <div className="wa-card"><Loader2 className="spin" size={20} /></div>;
  return (
    <div className="wa-card">
      {st.state === 'open'
        ? <span className="botc-ic" style={{ width: 64, height: 64, background: 'var(--green)', borderRadius: 18 }}><ShieldCheck size={28} /></span>
        : st.qr ? <img src={st.qr} alt="QR code para conectar o WhatsApp" width={170} height={170} style={{ borderRadius: 12, background: '#fff', padding: 6 }} />
          : <span className="botc-ic" style={{ width: 64, height: 64, background: 'var(--surface-3)', borderRadius: 18 }}>{st.state === 'connecting' ? <Loader2 className="spin" size={26} /> : <QrCode size={26} />}</span>}
      <div style={{ display: 'grid', gap: 6 }}>
        <b style={{ fontFamily: 'var(--f-display)', fontSize: 17 }}>
          {st.state === 'open' ? `Conectado · +${st.number}` : st.qr ? 'Escaneie com o WhatsApp comercial' : st.state === 'connecting' ? 'Conectando…' : 'Desconectado'}
        </b>
        <span className="muted">
          {st.state === 'open' ? `${st.sentToday} mensagens enviadas hoje pelo Radar. O celular continua funcionando normal.`
            : st.qr ? 'No celular: WhatsApp → Aparelhos conectados → Conectar um aparelho → aponte para o código.'
              : 'Gere o código e escaneie com o celular do número comercial.'}
        </span>
        {st.error && <span style={{ color: '#FF8A7A', fontSize: 13 }}>{st.error}</span>}
        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          {st.state === 'open'
            ? <button type="button" className="btn btn-danger btn-sm" onClick={logout}><Unplug size={14} />Desconectar</button>
            : !st.qr && <button type="button" className="btn btn-primary btn-sm" onClick={connect} disabled={busy || st.state === 'connecting'}><QrCode size={14} />Gerar código</button>}
        </div>
      </div>
    </div>
  );
}
