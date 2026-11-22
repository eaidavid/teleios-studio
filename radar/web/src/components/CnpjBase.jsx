// Configurações → Dados de empresas: base aberta da Receita Federal (CNPJ, decisor, empresas por ramo).
import React, { useEffect, useState } from 'react';
import { Building2, Download, Loader2 } from 'lucide-react';
import { actions } from '../data/store';
import { toast } from './ui';

export default function CnpjBase({ live }) {
  const [st, setSt] = useState(null);
  const load = () => actions.cnpjStatus().then(setSt).catch(() => {});
  useEffect(() => { if (live) load(); }, [live]);
  useEffect(() => { if (st?.state !== 'running') return undefined; const t = setInterval(load, 5000); return () => clearInterval(t); }, [st?.state]);
  if (!live) return <><h2>Dados de empresas</h2><p>Disponível quando o Radar está no servidor.</p></>;
  const last = st?.last;
  return (
    <>
      <h2>Dados de empresas</h2>
      <p>Base aberta e gratuita da Receita Federal: CNPJ, razão social, data de abertura, porte, atividade e o <b>decisor</b> (sócio-administrador ou titular) de cada lead. Também permite buscar empresas do ramo que nem aparecem no Google Maps.</p>
      <div className="wa-card">
        <span className="botc-ic" style={{ width: 56, height: 56, background: last ? 'var(--green)' : 'var(--surface-3)', borderRadius: 16 }}>{st?.state === 'running' ? <Loader2 className="spin" size={24} /> : <Building2 size={24} />}</span>
        <div style={{ display: 'grid', gap: 6 }}>
          <b style={{ fontFamily: 'var(--f-display)', fontSize: 17 }}>{st?.state === 'running' ? 'Importando…' : last ? `${Number(last.estab).toLocaleString('pt-BR')} empresas ativas (${(last.ufs || []).join(', ')})` : 'Base ainda não importada'}</b>
          <span className="muted">{st?.state === 'running' ? `${st.step} · ${Number(st.estab || 0).toLocaleString('pt-BR')} empresas lidas` : last ? `Atualizada em ${new Date(last.at).toLocaleDateString('pt-BR')}. A Receita publica uma versão nova por mês.` : `Estados configurados: ${(st?.ufs || ['GO']).join(', ')} (variável CNPJ_UFS no servidor). A importação baixa alguns GB, roda em segundo plano e pode levar de 1 a 3 horas.`}</span>
          {st?.state === 'error' && <span style={{ color: '#FF8A7A', fontSize: 13 }}>{st.error}</span>}
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <button type="button" className="btn btn-primary btn-sm" disabled={st?.state === 'running'} onClick={() => actions.cnpjImport().then((x) => { setSt(x); toast('Importação iniciada. Pode fechar esta tela.'); }, (e) => toast(e.message))}><Download size={14} />{last ? 'Atualizar base' : 'Importar base'}</button>
          </div>
        </div>
      </div>
      <p className="faint" style={{ fontSize: 12.5 }}>Sem a base, o Radar ainda consulta o CNPJ quando ele aparece no site da empresa (via BrasilAPI). Dados públicos de registro; o decisor é usado só pelo primeiro nome no contato profissional, e quem pede para sair é bloqueado.</p>
    </>
  );
}
