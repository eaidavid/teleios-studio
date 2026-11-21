// Análise de oportunidade de um lead.
// Hoje roda com regras locais (demonstração). No backend, o Analista vai usar a API do Claude
// para gerar o MESMO formato a partir dos dados reais coletados (site, Instagram, Google).

const SERVICES = {
  site: { name: 'Site institucional com agendamento', price: 3500 },
  landing: { name: 'Landing page de campanha', price: 1500 },
  social: { name: 'Gestão de Instagram', price: 1800, monthly: true },
  reputation: { name: 'Gestão de avaliações no Google', price: 600, monthly: true },
  ads: { name: 'Tráfego pago (Meta e Google)', price: 1500, monthly: true },
  brand: { name: 'Revisão de identidade visual', price: 2400 },
};

const clamp = (v) => Math.max(0, Math.min(100, Math.round(v)));

export function analyze(lead) {
  const gaps = [];
  // Site
  let site;
  if (!lead.website) {
    site = 95;
    gaps.push({ area: 'Site', severity: 'alta', title: 'Não tem site', detail: 'Quem pesquisa no Google não encontra uma página própria para conhecer e agendar.' });
  } else {
    site = 15;
    if (!lead.site?.mobile) { site += 40; gaps.push({ area: 'Site', severity: 'alta', title: 'Site ruim no celular', detail: 'A maioria das visitas vem do celular e o layout quebra.' }); }
    if ((lead.site?.speed ?? 80) < 50) { site += 25; gaps.push({ area: 'Site', severity: 'media', title: `Site lento (nota ${lead.site.speed}/100)`, detail: 'Páginas lentas perdem visitantes antes de carregar.' }); }
    if (!lead.site?.booking) { site += 15; gaps.push({ area: 'Site', severity: 'baixa', title: 'Sem agendamento ou botão de WhatsApp', detail: 'O visitante precisa procurar como entrar em contato.' }); }
  }
  // Redes
  let social;
  if (!lead.instagram) {
    social = 90;
    gaps.push({ area: 'Redes', severity: 'alta', title: 'Sem Instagram profissional', detail: 'O segmento decide muito pelo Instagram.' });
  } else {
    social = 20;
    const d = lead.social?.lastPostDays ?? 0;
    if (d > 30) { social += 55; gaps.push({ area: 'Redes', severity: d > 60 ? 'alta' : 'media', title: `Instagram parado há ${d} dias`, detail: 'Perfil parado passa a impressão de empresa fechada.' }); }
    else if ((lead.social?.postsPerWeek ?? 0) < 1) { social += 30; gaps.push({ area: 'Redes', severity: 'media', title: 'Posta menos de 1 vez por semana', detail: 'Pouca frequência reduz alcance e lembrança.' }); }
  }
  // Reputação
  let reputation = 20;
  if (lead.reviews < 50) { reputation += 45; gaps.push({ area: 'Reputação', severity: 'media', title: `Só ${lead.reviews} avaliações no Google`, detail: 'Concorrentes com mais avaliações aparecem antes.' }); }
  if (lead.unanswered > 40) { reputation += 35; gaps.push({ area: 'Reputação', severity: 'media', title: `${lead.unanswered}% das avaliações sem resposta`, detail: 'Responder avaliações mostra cuidado e melhora a posição no Maps.' }); }
  if (lead.photos < 15) { reputation += 15; gaps.push({ area: 'Reputação', severity: 'baixa', title: `Poucas fotos no Google (${lead.photos})`, detail: 'Fotos aumentam cliques no perfil do Maps.' }); }
  // Anúncios
  const ads = lead.ads ? 25 : 65;
  if (!lead.ads) gaps.push({ area: 'Anúncios', severity: 'baixa', title: 'Não anuncia', detail: 'Concorrentes que anunciam aparecem primeiro para quem busca na região.' });

  const strength = clamp(((lead.rating - 4) / 1) * 60 + Math.min(lead.reviews, 300) / 300 * 40);
  const opportunity = clamp((site * 0.35 + social * 0.25 + reputation * 0.2 + ads * 0.2) * (0.6 + strength / 250));

  const services = [];
  if (site >= 60) services.push(SERVICES.site);
  else if (site >= 35) services.push(SERVICES.landing);
  if (social >= 60) services.push(SERVICES.social);
  if (reputation >= 55) services.push(SERVICES.reputation);
  if (ads >= 60 && strength >= 60) services.push(SERVICES.ads);
  if (!services.length) services.push(SERVICES.brand);

  const oneOff = services.filter((x) => !x.monthly).reduce((a, x) => a + x.price, 0);
  const monthly = services.filter((x) => x.monthly).reduce((a, x) => a + x.price, 0);

  const first = String(lead.contact || '').split(',')[0].trim();
  const hi = first ? `Oi, ${first}!` : 'Oi, tudo bem?';
  const where = [lead.neighborhood, lead.city].filter(Boolean).join(', ');
  const top = gaps.sort((a, b) => ['alta', 'media', 'baixa'].indexOf(a.severity) - ['alta', 'media', 'baixa'].indexOf(b.severity))[0];
  const proof = !lead.rating ? `um bom nome em ${lead.city || 'sua região'}` : lead.reviews >= 80 ? `nota ${String(lead.rating).replace('.', ',')} e ${lead.reviews} avaliações` : `nota ${String(lead.rating).replace('.', ',')} no Google`;
  const angle = top
    ? `Elogiar a reputação (${proof}) e mostrar que "${top.title.toLowerCase()}" está fazendo ela perder clientes.`
    : `Mostrar como transformar a boa reputação (${proof}) em mais agendamentos.`;
  const message = top
    ? `${hi} Vi que a ${lead.name} tem ${proof}, mas ${top.title.charAt(0).toLowerCase() + top.title.slice(1)}. Isso costuma fazer clientes irem para o concorrente. Posso te mostrar em 5 minutos como resolver?`
    : `${hi} Vi que a ${lead.name} tem ${proof}. Posso te mostrar como transformar isso em mais agendamentos?`;

  const [bg, ink, accent] = lead.palette || ['#F2EFE9', '#14181D', '#00C48C'];
  const brief = {
    headline: briefHeadline(lead),
    sub: `${lead.category}${where ? ` em ${where}` : ''}. ${proof.charAt(0).toUpperCase() + proof.slice(1)}.`,
    cta: lead.whatsapp ? 'Agendar pelo WhatsApp' : 'Ligar agora',
    sections: ['Hero', 'Serviços', 'Avaliações do Google', 'Galeria', 'Localização e horário', 'Contato'],
    palette: { bg, ink, accent },
    tone: ['Clínica de estética', 'Odontologia', 'Fisioterapia'].includes(lead.category) ? 'Acolhedor e confiável' : lead.category === 'Academia' ? 'Energético' : 'Próximo e direto',
  };

  return {
    at: Date.now(),
    opportunity,
    strength,
    parts: { site: clamp(site), social: clamp(social), reputation: clamp(reputation), ads: clamp(ads) },
    summary: top
      ? `${lead.name} tem boa reputação (${proof}), mas ${top.title.charAt(0).toLowerCase() + top.title.slice(1)}. ${gaps.length > 1 ? `Há mais ${gaps.length - 1} ponto${gaps.length > 2 ? 's' : ''} a melhorar.` : ''}`
      : `${lead.name} já tem uma presença digital sólida. Oportunidade menor.`,
    gaps,
    services,
    ticket: { oneOff, monthly },
    angle,
    message,
    brief,
  };
}

function briefHeadline(l) {
  const map = {
    'Clínica de estética': 'Sua melhor versão começa aqui.',
    Odontologia: 'O sorriso que você adia há anos.',
    Academia: 'Treine onde o resultado aparece.',
    Restaurante: 'Comida de verdade, feita sem pressa.',
    'Pet shop': 'Cuidado de quem ama bicho.',
    Ótica: 'Enxergue bem. Fique bem.',
    Advocacia: 'Seu direito, explicado sem juridiquês.',
    Barbearia: 'Corte em dia, cabeça leve.',
    Fisioterapia: 'Volte a se mexer sem dor.',
    Imobiliária: 'A chave certa para a sua próxima casa.',
    'Móveis planejados': 'Cada centímetro da sua casa, pensado pra você.',
  };
  return map[l.category] || `${l.brandName || l.name}, perto de você em ${l.city || 'sua cidade'}.`;
}
