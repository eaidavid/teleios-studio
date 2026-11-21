// Monta, sem IA, uma especificação premium a partir do lead e da direção escolhida no painel.
// É o ponto de partida do construtor e o rascunho que vai no "MD para o Claude".
import { CATEGORIES } from '../../../web/src/data/seed.js';

/* Tema por segmento (paleta do material/ofício, motivo e textura) */
const SEG = {
  'Móveis planejados': { fundo: '#F6F1EA', fundo_alt: '#ECE3D5', tinta: '#2A1C18', acento: '#B9824F', motivo: 'regua', textura: 'ripado' },
  'Clínica de estética': { fundo: '#F7F2EE', fundo_alt: '#EFE5DF', tinta: '#3A1F2B', acento: '#C08377', motivo: 'arco', textura: 'grao' },
  Odontologia: { fundo: '#F3F6F5', fundo_alt: '#E5EEEB', tinta: '#0F3B3A', acento: '#3FAF94', motivo: 'arco', textura: 'nenhuma' },
  Academia: { fundo: '#F2F2EC', fundo_alt: '#E6E6DE', tinta: '#0E0F0F', acento: '#E5531C', motivo: 'linha', textura: 'grade' },
  Restaurante: { fundo: '#FBF4E8', fundo_alt: '#F2E6D2', tinta: '#2B1A12', acento: '#C8381F', motivo: 'ponto', textura: 'grao' },
  'Pet shop': { fundo: '#F6EEDF', fundo_alt: '#EDE1CB', tinta: '#3B2A1E', acento: '#D9922E', motivo: 'arco', textura: 'grao' },
  Ótica: { fundo: '#F5F6F8', fundo_alt: '#E8EBF1', tinta: '#14213D', acento: '#E8603F', motivo: 'ponto', textura: 'nenhuma' },
  Advocacia: { fundo: '#F3EFE6', fundo_alt: '#E8E1D2', tinta: '#121A2B', acento: '#A8853F', motivo: 'linha', textura: 'linhas' },
  Barbearia: { fundo: '#EFE6D8', fundo_alt: '#E3D7C4', tinta: '#16130F', acento: '#B36A3C', motivo: 'linha', textura: 'ripado' },
  Fisioterapia: { fundo: '#F2EEE7', fundo_alt: '#E5E0D5', tinta: '#0B3A47', acento: '#2B9DB0', motivo: 'arco', textura: 'linhas' },
  Imobiliária: { fundo: '#F2EFE9', fundo_alt: '#E6E1D7', tinta: '#14181D', acento: '#1E8A66', motivo: 'ponto', textura: 'grade' },
};

/* Tipografia e movimento por estilo (mesmos nomes do construtor) */
const STYLE = {
  elegante: { fonte_titulo: 'Plus Jakarta Sans', fonte_texto: 'Inter', fonte_destaque: 'Instrument Serif', peso_titulo: 300, raio: 'suave', movimento: 'sutil' },
  moderna: { fonte_titulo: 'Sora', fonte_texto: 'Inter', fonte_destaque: 'Instrument Serif', peso_titulo: 300, raio: 'suave', movimento: 'equilibrado' },
  ousada: { fonte_titulo: 'Archivo', fonte_texto: 'DM Sans', peso_titulo: 700, peso_forte: 800, raio: 'reto', movimento: 'marcante' },
  acolhedora: { fonte_titulo: 'Fraunces', fonte_texto: 'Outfit', fonte_destaque: 'Fraunces', peso_titulo: 400, raio: 'redondo', movimento: 'equilibrado' },
  minimalista: { fonte_titulo: 'Manrope', fonte_texto: 'Manrope', fonte_destaque: 'Instrument Serif', peso_titulo: 300, raio: 'reto', movimento: 'sutil' },
  luxo: { fonte_titulo: 'Cormorant Garamond', fonte_texto: 'Manrope', fonte_destaque: 'Cormorant Garamond', peso_titulo: 400, raio: 'reto', movimento: 'sutil' },
};
const CATEGORY_STYLE = {
  'Clínica de estética': 'elegante', Odontologia: 'moderna', Academia: 'ousada', Restaurante: 'acolhedora', 'Pet shop': 'acolhedora',
  Ótica: 'moderna', 'Móveis planejados': 'elegante', Advocacia: 'luxo', Barbearia: 'ousada', Fisioterapia: 'moderna', Imobiliária: 'moderna',
};

/* Textos-base por segmento (o Claude reescreve com fatos do lead; o construtor usa como está) */
const COPY = {
  'Móveis planejados': {
    titulo: ['Cada centímetro da sua casa,', 'pensado <em>pra você</em>'], cta: 'Pedir orçamento',
    abas: ['Sob medida', 'Projeto 3D', 'Montagem limpa'],
    dores: [['Pedi orçamento e ninguém voltou a falar comigo.', 'Aqui o orçamento sai rápido e você fala com quem vai fazer.'], ['Medi errado e o armário não coube.', 'A medição é feita por nós, no seu espaço, antes do projeto.'], ['A montagem virou uma obra sem fim.', 'Prazo combinado e montagem limpa, sem deixar bagunça.']],
    servicos: [['Cozinhas', 'Armários, bancadas e nichos que aproveitam cada centímetro.'], ['Dormitórios e closets', 'Guarda-roupas organizados do seu jeito.'], ['Salas e painéis', 'Painel de TV, rack e estantes sob medida.'], ['Home office', 'Mesa e prateleiras na medida para trabalhar bem.'], ['Banheiros e lavanderias', 'Gabinetes e armários resistentes à umidade.']],
    processo: [['Conversa', 'Você conta o que precisa e mostra o espaço.'], ['Medição e projeto', 'Medimos tudo e desenhamos o ambiente com você.'], ['Produção', 'Fabricamos cada peça com o acabamento escolhido.'], ['Montagem', 'Instalamos no prazo e entregamos o ambiente pronto.']],
    faixa: ['Cozinhas', 'Closets', 'Dormitórios', 'Salas', 'Home office', 'Banheiros'],
    faq: [['Vocês fazem a medição?', 'Sim. A medição é o primeiro passo, feita no seu espaço, antes do projeto.'], ['Consigo ver o projeto antes?', 'Sim. Você aprova o desenho e os acabamentos antes da produção.'], ['Como peço um orçamento?', 'Pelo WhatsApp: mande as medidas aproximadas ou fotos do ambiente.']],
    servTitle: ['Do jeito que', 'a sua casa precisa'],
    manifesto: 'Móvel planejado bom é aquele que você esquece que foi planejado: tudo cabe, tudo abre, tudo fica no lugar.',
  },
  'Clínica de estética': {
    titulo: ['Sua pele,', 'no cuidado <em>certo</em>'], cta: 'Agendar avaliação', abas: ['Avaliação', 'Protocolo', 'Acompanhamento'],
    dores: [['Já gastei com tratamento que não serviu pra mim.', 'Tudo começa com uma avaliação para indicar só o que faz sentido.'], ['Tenho medo de ficar artificial.', 'O objetivo é um resultado natural, com você no controle.'], ['Nunca sei quanto vai custar no final.', 'Você sai da avaliação sabendo o plano e os valores.']],
    servicos: [['Limpeza de pele', 'Pele limpa, hidratada e preparada para os próximos cuidados.'], ['Harmonização facial', 'Realce com naturalidade, planejado para o seu rosto.'], ['Tratamentos corporais', 'Protocolos para firmeza, contorno e bem-estar.'], ['Depilação a laser', 'Menos pelos e menos irritação, com sessões rápidas.']],
    processo: [['Avaliação', 'Conversa e análise da sua pele.'], ['Plano', 'Protocolo indicado para o seu objetivo.'], ['Sessões', 'Tratamento com acompanhamento a cada etapa.'], ['Manutenção', 'Orientações para o resultado durar.']],
    faixa: ['Limpeza de pele', 'Harmonização', 'Corporal', 'Laser', 'Skincare'],
    faq: [['Preciso de avaliação antes?', 'Sim, é ela que define o tratamento certo para você.'], ['Como agendo?', 'Pelo WhatsApp, escolhendo o melhor horário.']],
    manifesto: 'Cuidar da pele não é mudar quem você é. É deixar você se reconhecer no espelho, todo dia.',
  },
};
const GENERIC = (lead) => ({
  titulo: [`${lead.category || 'Atendimento'} em ${lead.city || 'sua cidade'},`, 'do jeito <em>certo</em>'], cta: 'Falar no WhatsApp', abas: [],
  dores: [], servicos: (CATEGORIES[lead.category] ? [] : []), processo: [['Contato', 'Você fala com a gente pelo WhatsApp.'], ['Atendimento', 'Entendemos o que você precisa.'], ['Resultado', 'Entregamos com cuidado e no prazo combinado.']],
  faixa: [], faq: [], manifesto: '',
});

const splitTitle = (h) => {
  const t = String(h || '').trim();
  const i = t.indexOf(',');
  if (i > 0) return [t.slice(0, i + 1), t.slice(i + 1).trim()];
  const w = t.split(' ');
  return [w.slice(0, Math.ceil(w.length / 2)).join(' '), w.slice(Math.ceil(w.length / 2)).join(' ')];
};

export function autoSpec(lead, dir = {}) {
  const segTheme = SEG[lead.category] || { fundo: '#F4F1EC', fundo_alt: '#E9E4DB', tinta: '#17191C', acento: (lead.palette || [])[2] || '#1E8A66', motivo: 'linha', textura: 'nenhuma' };
  const styleKey = dir.style && dir.style !== 'ia' ? dir.style : CATEGORY_STYLE[lead.category] || 'moderna';
  const st = STYLE[styleKey] || STYLE.moderna;
  const brandAccent = dir.colors?.[0] || lead.brand?.colors?.[0];
  const motion = dir.motion && dir.motion !== 'ia' ? { sutil: 'sutil', equilibrada: 'equilibrado', marcante: 'marcante' }[dir.motion] : st.movimento;
  const c = COPY[lead.category] || GENERIC(lead);
  const name = lead.brandName || lead.name;
  const hasPhotos = (lead.gallery?.length || 0) + (lead.sitePhotos?.length || 0) > 0;
  const brief = lead.analysis?.brief;
  const [soft, strong] = brief?.headline ? splitTitle(brief.headline) : c.titulo;
  const proof = lead.rating ? `Nota ${Number(lead.rating).toFixed(1).replace('.', ',')} no Google, com ${lead.reviews} avaliações.` : '';
  const where = [lead.neighborhood !== lead.city ? lead.neighborhood : '', lead.city].filter(Boolean).join(', ');

  const secoes = [];
  secoes.push({ tipo: 'topo', variante: hasPhotos ? (dir.hero === 'dividido' ? 'dividido' : 'foto') : 'tipografico', rotulo: `${lead.category || ''} · ${lead.city || ''}`,
    titulo_suave: soft, titulo_forte: strong, subtitulo: [`${lead.category || ''}${where ? ` em ${where}` : ''}.`, proof].filter(Boolean).join(' '),
    cta: { texto: c.cta }, cta2: { texto: 'Como funciona', link: '#processo' }, abas: c.abas });
  const nums = [];
  if (lead.rating) nums.push({ valor: Number(lead.rating).toFixed(1).replace('.', ','), legenda: 'nota no Google' });
  if (lead.reviews) nums.push({ valor: String(lead.reviews), legenda: 'avaliações de clientes' });
  if (lead.hoursTable?.['Sáb'] && !/fechado/i.test(lead.hoursTable['Sáb'])) nums.push({ valor: 'Sáb', legenda: `também aos sábados (${lead.hoursTable['Sáb']})` });
  if (nums.length >= 2) secoes.push({ tipo: 'numeros', itens: nums });
  if (c.dores?.length) secoes.push({ tipo: 'dores', rotulo: 'Você já passou por isso?', titulo_suave: 'O que ninguém', titulo_forte: 'deveria passar', itens: c.dores.map(([frase, resposta]) => ({ frase, resposta })) });
  if (c.manifesto) secoes.push({ tipo: 'manifesto', rotulo: 'Nosso jeito', texto: c.manifesto });
  if (c.faixa?.length) secoes.push({ tipo: 'faixa', itens: c.faixa });
  if (c.servicos?.length) secoes.push({ tipo: 'empilhados', ancora: 'servicos', menu: 'Serviços', rotulo: 'O que fazemos', titulo_suave: (c.servTitle || ['Do jeito que', 'você precisa'])[0], titulo_forte: (c.servTitle || ['Do jeito que', 'você precisa'])[1], com_fotos: hasPhotos, itens: c.servicos.map(([nome, texto]) => ({ nome, texto })) });
  if (hasPhotos) secoes.push({ tipo: 'galeria', variante: 'mosaico', ancora: 'galeria', menu: 'Galeria', rotulo: 'Trabalhos', titulo_suave: 'Feito por nós,', titulo_forte: 'pra durar' });
  else secoes.push({ tipo: 'cartaz', palavra: name.split(' ').slice(0, 2).join(' '), selo: lead.rating ? `Nota ${Number(lead.rating).toFixed(1).replace('.', ',')} no Google` : lead.city });
  secoes.push({ tipo: 'processo', ancora: 'processo', menu: 'Como funciona', rotulo: 'Como funciona', titulo_suave: 'Do primeiro contato', titulo_forte: 'ao resultado', passos: c.processo.map(([titulo, texto]) => ({ titulo, texto })) });
  if (lead.reviewSamples?.length) secoes.push({ tipo: 'depoimentos', rotulo: 'Quem já fez', titulo_suave: lead.reviews ? `${lead.reviews} avaliações,` : 'Quem já fez', titulo_forte: lead.rating ? `nota ${Number(lead.rating).toFixed(1).replace('.', ',')}` : 'recomenda' });
  if (c.faq?.length) secoes.push({ tipo: 'faq', itens: c.faq.map(([pergunta, resposta]) => ({ pergunta, resposta })) });
  secoes.push({ tipo: 'local', ancora: 'contato', menu: 'Contato', rotulo: 'Onde estamos' });
  secoes.push({ tipo: 'chamada', rotulo: 'Vamos conversar?', titulo_suave: 'Conta pra gente', titulo_forte: 'o que você precisa.', texto: 'Respondemos pelo WhatsApp, sem compromisso.', cta: { texto: c.cta } });

  return {
    conceito: dir.notes || `${name}: ${lead.category || 'negócio local'} em ${lead.city || ''}, com a prova de quem já é cliente.`,
    tema: { ...segTheme, ...(brandAccent ? { acento: brandAccent } : {}), ...st, movimento: motion },
    whatsapp_texto: `Oi! Vi o site da ${name} e quero ${c.cta.toLowerCase()}.`,
    menu_cta: { texto: c.cta.split(' ')[0] === 'Pedir' ? 'Orçamento' : c.cta.split(' ')[0] },
    secoes,
    rodape: { frase: `${lead.category || ''} em ${lead.city || ''}.`, palavra_gigante: name.split(' ').slice(0, 2).join(' ') },
  };
}
