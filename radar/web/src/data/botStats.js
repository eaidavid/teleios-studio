// Números reais de cada robô, calculados do estado (no geral ou de uma campanha).
const REPLIED = ['reply', 'qual', 'prop', 'won'];
const DAY = 864e5;

export function pipeline(state, campaignId) {
  const leads = campaignId ? state.leads.filter((l) => l.campaign === campaignId) : state.leads;
  const ids = new Set(leads.map((l) => l.id));
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const outbox = (state.outbox || []).filter((o) => ids.has(o.lead));
  const approvals = (state.approvals || []).filter((a) => ids.has(a.lead));
  const sites = (state.sites || []).filter((s) => ids.has(s.lead));
  const contacted = leads.filter((l) => l.stage !== 'found' || l.lastContactAt);
  const replied = leads.filter((l) => REPLIED.includes(l.stage));
  const waitingFollow = leads.filter((l) => l.stage === 'sent' && l.lastContactAt && Date.now() - l.lastContactAt > 2 * DAY);
  return {
    leads,
    found: leads.length,
    foundToday: leads.filter((l) => l.createdAt >= today.getTime()).length,
    analyzed: leads.filter((l) => l.analysis).length,
    analyzedByClaude: leads.filter((l) => l.analysis?.by === 'claude').length,
    previews: sites.length,
    toApprove: approvals.length,
    queued: outbox.filter((o) => o.status === 'pending').length,
    sent: contacted.length,
    failed: outbox.filter((o) => o.status === 'failed').length,
    replied: replied.length,
    waitingFollow: waitingFollow.length,
    won: leads.filter((l) => l.stage === 'won').length,
    blocked: leads.filter((l) => l.blocked).length,
  };
}

/* Frase de status de cada robô para a tela "Time de robôs" */
export function botLine(id, p) {
  switch (id) {
    case 'cacador': return p.found ? `${p.found} empresas no funil · ${p.foundToday} hoje` : 'Nenhuma empresa ainda';
    case 'analista': return `${p.analyzed} analisadas${p.analyzedByClaude ? ` · ${p.analyzedByClaude} pelo Claude` : ''} · ${p.previews} prévias`;
    case 'construtor': return `${p.previews} prévias criadas`;
    case 'redator': return `${p.toApprove} para aprovar · ${p.queued} na fila de envio`;
    case 'followup': return p.waitingFollow ? `${p.waitingFollow} sem resposta há 2+ dias` : 'Ninguém esperando follow-up';
    case 'triagem': return `${p.replied} responderam${p.blocked ? ` · ${p.blocked} pediram para parar` : ''}`;
    default: return '';
  }
}
