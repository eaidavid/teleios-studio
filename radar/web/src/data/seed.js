import { hexToHsl, hslToHex } from '../sites/colors';

// Dados de DEMONSTRAÇÃO: empresas, pessoas e números fictícios.
// Serão substituídos pelo que o Caçador (scraper) trouxer de verdade.

let s = 20261120;
const rnd = () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296);
const pick = (a) => a[Math.floor(rnd() * a.length)];
const int = (a, b) => Math.floor(a + rnd() * (b - a + 1));

export const STAGES = [
  { id: 'found', name: 'Encontradas', short: 'Encontrada', color: '#6E7A80' },
  { id: 'sent', name: 'Abordadas', short: 'Abordada', color: '#6F86C8' },
  { id: 'reply', name: 'Responderam', short: 'Respondeu', color: '#E8B04A' },
  { id: 'qual', name: 'Qualificadas', short: 'Qualificada', color: '#C98BE8' },
  { id: 'prop', name: 'Proposta', short: 'Proposta', color: '#FF7A59' },
  { id: 'won', name: 'Ganhas', short: 'Ganha', color: '#00C48C' },
];

export const CATEGORIES = {
  'Clínica de estética': { pre: ['Clínica', 'Estética', 'Espaço'], suf: ['Aurora', 'Bella Forma', 'Lumière', 'Essenza', 'Vitta', 'Pele Nova'], palette: ['#F3E4E1', '#4A1F2A', '#C86B7E'] },
  Odontologia: { pre: ['Odonto', 'Clínica', 'Sorriso'], suf: ['Pleno', 'Vida', 'Prime', 'Real', 'Integral'], palette: ['#E8F1EE', '#0F3B33', '#3FB59A'] },
  Academia: { pre: ['Academia', 'Studio', 'Box'], suf: ['Força Total', 'Move', 'Atlas', 'Pulse', 'Vértice'], palette: ['#0D0D0D', '#F4F4F0', '#D7FF3A'] },
  Restaurante: { pre: ['Restaurante', 'Cantina', 'Bistrô'], suf: ['Casa Nonna', 'Sabor da Terra', 'Fogo Lento', 'Dona Benta', 'Mar Aberto'], palette: ['#D9442B', '#FFF4E6', '#FFC94A'] },
  'Pet shop': { pre: ['Pet Shop', 'Pet', 'Clínica Vet'], suf: ['Patas & Cia', 'Amigo Fiel', 'Focinho', 'Bicho Feliz'], palette: ['#FFF3D6', '#3B2A12', '#F2A33A'] },
  Ótica: { pre: ['Ótica'], suf: ['Visão Clara', 'Olhar', 'Foco', 'Prisma'], palette: ['#EAF0FF', '#14213D', '#1F3C88'] },
  Advocacia: { pre: ['Advocacia', 'Escritório'], suf: ['Moraes & Lima', 'Prado', 'Fontes', 'Alencar'], palette: ['#14213D', '#F2E8D5', '#C9A24D'] },
  Barbearia: { pre: ['Barbearia'], suf: ['Navalha Fina', 'Old Town', 'Dom Corte', 'Bigode'], palette: ['#1A1410', '#F2E6D8', '#B8743C'] },
  Fisioterapia: { pre: ['Fisio', 'Clínica'], suf: ['Vita', 'Movimento', 'Equilíbrio', 'Postura'], palette: ['#E6F4F7', '#0B3A47', '#2BA3B8'] },
  Imobiliária: { pre: ['Imobiliária'], suf: ['Chave Certa', 'Lar Ideal', 'Horizonte', 'Teto'], palette: ['#F2EFE9', '#14181D', '#00A876'] },
};
const BAIRROS = ['Campolim', 'Centro', 'Jardim Vergueiro', 'Santa Rosália', 'Mangal', 'Éden', 'Wanel Ville', 'Trujillo', 'Além Ponte', 'Vila Hortência'];
const FIRST = ['Renata', 'Carla', 'Marcos', 'Jorge', 'Lívia', 'Diego', 'Paulo', 'Rafa', 'Sônia', 'Ana', 'Paula', 'Bruno', 'Camila', 'Felipe', 'Juliana', 'Ricardo', 'Tatiane', 'Eduardo'];
const ROLES = ['proprietária', 'sócio', 'gerente', 'dono', 'sócia', 'gestor', 'recepção'];
const TAGS = ['Premium', 'Indicação', 'Urgente', 'Recorrente', 'Grande porte', 'Sem site'];

function shift(hex, dh) {
  const [h, sat, l] = hexToHsl(hex);
  return hslToHex((h + dh + 360) % 360, sat, l);
}

function slug(t) {
  return t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/&/g, 'e').replace(/[^a-z0-9]+/g, '');
}

export function makeLead(id, overrides = {}) {
  const cat = pick(Object.keys(CATEGORIES));
  const c = CATEGORIES[cat];
  const name = `${pick(c.pre)} ${pick(c.suf)}`;
  const first = pick(FIRST);
  const hasSite = rnd() > 0.45;
  const hasIg = rnd() > 0.2;
  const rating = Math.round((4 + rnd() * 0.95) * 10) / 10;
  const reviews = int(8, 520);
  const stageRoll = rnd();
  const stage = stageRoll < 0.36 ? 'found' : stageRoll < 0.66 ? 'sent' : stageRoll < 0.79 ? 'reply' : stageRoll < 0.89 ? 'qual' : stageRoll < 0.95 ? 'prop' : 'won';
  const daysAgo = int(0, 30);
  return {
    id,
    name,
    category: cat,
    contact: `${first}, ${pick(ROLES)}`,
    city: rnd() > 0.2 ? 'Sorocaba' : pick(['Votorantim', 'Itu']),
    neighborhood: pick(BAIRROS),
    address: `Rua ${pick(['das Flores', 'XV de Novembro', 'Barão de Tatuí', 'Dr. Ugo Piza', 'Comendador Oetterer', 'Pereira da Silva'])}, ${int(40, 2100)}`,
    phone: `(15) 9${int(8100, 9899)}-${int(1000, 9999)}`,
    whatsapp: rnd() > 0.12,
    website: hasSite ? `${slug(name)}.com.br` : '',
    site: hasSite ? { mobile: rnd() > 0.4, speed: int(25, 95), booking: rnd() > 0.7, https: rnd() > 0.2 } : null,
    instagram: hasIg ? `@${slug(name).slice(0, 18)}` : '',
    social: hasIg ? { followers: int(180, 14000), lastPostDays: int(0, 140), postsPerWeek: Math.round(rnd() * 5 * 10) / 10 } : null,
    email: rnd() > 0.5 ? `contato@${slug(name)}.com.br` : '',
    rating,
    reviews,
    unanswered: int(0, 85),
    photos: int(2, 160),
    ads: rnd() > 0.7,
    hours: pick(['Seg–Sex 8h–18h', 'Seg–Sáb 9h–19h', 'Seg–Sex 9h–20h, Sáb 9h–13h', 'Ter–Dom 11h–23h']),
    stage,
    blocked: stage === 'sent' && rnd() > 0.88 ? 'Pediu para não ser contatado' : '',
    tags: rnd() > 0.55 ? [pick(TAGS)] : [],
    owner: pick(['David', 'David', 'Equipe']),
    campaign: pick([1, 1, 2, 3]),
    createdAt: Date.now() - daysAgo * 864e5 - int(0, 864e5),
    lastContactAt: stage === 'found' ? null : Date.now() - int(0, Math.max(1, daysAgo)) * 864e5,
    next: stage === 'found' ? 'Na fila de abordagem' : stage === 'won' ? 'Contrato fechado' : pick(['Follow-up amanhã', 'Responder hoje', 'Ligar às 16h', 'Enviar proposta', 'Aguardando resposta']),
    x: 0.08 + rnd() * 0.84,
    y: 0.1 + rnd() * 0.8,
    palette: c.palette,
    // Cores de marca detectadas no site/Instagram (no backend: lidas do logo e do CSS do site)
    brand: hasSite || hasIg ? { source: hasSite ? 'site' : 'instagram', colors: [shift(c.palette[2], int(-14, 14)), shift(c.palette[1], int(-10, 10))] } : null,
    notes: [],
    analysis: null,
    ...overrides,
  };
}

export function seedLeads() {
  s = 20261120;
  const used = new Set(['Clínica Aurora Estética', 'Academia Força Total', 'Ótica Visão Clara']);
  const list = Array.from({ length: 64 }, (_, i) => {
    let l = makeLead(i + 1);
    for (let k = 0; k < 6 && used.has(l.name); k++) l = { ...makeLead(i + 1), id: i + 1 };
    if (used.has(l.name)) l.name = `${l.name} ${l.neighborhood}`;
    used.add(l.name);
    return l;
  });
  // Alguns leads com cara de história, usados nas conversas
  Object.assign(list[0], { name: 'Clínica Aurora Estética', category: 'Clínica de estética', contact: 'Renata, proprietária', stage: 'reply', rating: 4.8, reviews: 213, website: '', site: null, palette: CATEGORIES['Clínica de estética'].palette, blocked: '' });
  Object.assign(list[1], { name: 'Academia Força Total', category: 'Academia', contact: 'Rafa, gestor', stage: 'reply', rating: 4.4, reviews: 322, unanswered: 64, palette: CATEGORIES.Academia.palette, blocked: '' });
  Object.assign(list[2], { name: 'Ótica Visão Clara', category: 'Ótica', contact: 'Marcos, gerente', stage: 'reply', palette: CATEGORIES['Ótica'].palette, social: { followers: 1840, lastPostDays: 47, postsPerWeek: 0.3 }, instagram: '@oticavisaoclara', blocked: '' });
  list.slice(0, 3).forEach((l) => { l.brand = { source: 'instagram', colors: [l.palette[2], l.palette[1]] }; });
  return list;
}

export const seedCampaigns = [
  { id: 1, name: 'Clínicas de estética · Sorocaba', query: 'Clínicas de estética em Sorocaba com nota acima de 4,5', city: 'Sorocaba', status: 'running', filters: ['Nota ≥ 4,5', 'Com WhatsApp'], createdAt: Date.now() - 9 * 864e5, variantA: 'Vi que vocês têm nota {nota}, mas ainda sem site…', variantB: 'Seu Instagram está parado desde {ultimo_post}…' },
  { id: 2, name: 'Academias · Sorocaba e região', query: 'Academias em Sorocaba, Itu e Votorantim', city: 'Sorocaba', status: 'running', filters: ['Com WhatsApp'], createdAt: Date.now() - 5 * 864e5, variantA: 'A {empresa} tem {avaliacoes} avaliações, mas várias sem resposta…', variantB: '' },
  { id: 3, name: 'Restaurantes sem site', query: 'Restaurantes em Sorocaba sem site', city: 'Sorocaba', status: 'paused', filters: ['Sem site'], createdAt: Date.now() - 14 * 864e5, variantA: 'Quem procura a {empresa} no Google não acha o cardápio…', variantB: '' },
];

export const seedConversations = {
  1: [
    { t: 'out', by: 'Redator', text: 'Oi, Renata! Vi que a Aurora tem nota 4,8 e 213 avaliações no Google, mas quem procura vocês não encontra um site. Já pensaram em transformar essa reputação em agendamentos?', at: Date.now() - 3 * 864e5 },
    { t: 'out', by: 'Follow-up', text: 'Renata, passei aqui de novo. Se fizer sentido, te mostro em 5 minutos como outras clínicas de Sorocaba fazem.', at: Date.now() - 864e5 },
    { t: 'in', text: 'Oi! Quanto vocês cobram para fazer um site? Estou precisando mesmo.', at: Date.now() - 2 * 36e5, intent: 'interessado' },
  ],
  2: [
    { t: 'out', by: 'Redator', text: 'Oi, Rafa! A Força Total tem 322 avaliações, mas várias sem resposta. Isso pesa na escolha de quem compara academias. Posso te mostrar como resolver?', at: Date.now() - 2 * 864e5 },
    { t: 'in', text: 'Pode me ligar depois do almoço? Por mensagem fica difícil.', at: Date.now() - 3 * 36e5, intent: 'ligacao' },
  ],
  3: [
    { t: 'out', by: 'Redator', text: 'Oi, Marcos! O Instagram da Visão Clara está parado há 47 dias. Quer que eu mande ideias de conteúdo que funcionam para ótica?', at: Date.now() - 3 * 864e5 },
    { t: 'in', text: 'Vocês já trabalharam com ótica? Queria ver exemplos.', at: Date.now() - 4 * 36e5, intent: 'duvida' },
  ],
};

export const seedBots = [
  { id: 'cacador', name: 'Caçador', role: 'Busca', color: '#00C48C', icon: 'Radar', on: true, desc: 'Procura empresas no Google Maps a partir das suas campanhas e confere quais têm WhatsApp.', rules: ['Roda às 8h, de segunda a sexta', 'Ignora quem já está no funil'], stats: '41 empresas hoje' },
  { id: 'analista', name: 'Analista', role: 'Diagnóstico', color: '#C98BE8', icon: 'ScanSearch', on: true, desc: 'Avalia site, Instagram, avaliações e anúncios de cada empresa e dá uma nota de oportunidade.', rules: ['Aponta o ponto fraco que a agência resolve', 'Gera o briefing do site-prévia'], stats: '17 análises hoje' },
  { id: 'redator', name: 'Redator', role: 'Primeiro contato', color: '#E8B04A', icon: 'PenLine', on: true, desc: 'Escreve uma mensagem por empresa, citando um fato real do negócio.', rules: ['Testa duas abordagens e fica com a melhor', 'Pede aprovação quando tem dúvida'], stats: '23 mensagens hoje' },
  { id: 'followup', name: 'Follow-up', role: 'Ritmo', color: '#6F86C8', icon: 'Repeat', on: true, desc: 'Volta a falar com quem não respondeu, no prazo certo, até 3 contatos.', rules: ['2 dias, depois 4 dias', 'Para no primeiro "não"'], stats: '9 retomadas hoje' },
  { id: 'triagem', name: 'Triagem', role: 'Respostas', color: '#FF7A59', icon: 'Inbox', on: true, desc: 'Lê cada resposta, entende a intenção e te chama na hora certa, com sugestão de resposta.', rules: ['Interessado, dúvida, pediu ligação ou sem interesse', 'Tira o robô da conversa na hora'], stats: '3 respostas quentes' },
];

export const seedSettings = {
  whatsapp: { connected: true, number: '+55 15 9••••-4821', warmupDay: 12, warmupTotal: 14 },
  limits: { daily: 40, minInterval: 3, maxInterval: 9, start: '09:00', end: '18:00', days: [1, 2, 3, 4, 5], skipHolidays: true },
  messages: { tone: 'Próximo e direto', signature: 'David, Agência Teleios', optOut: 'parar, não tenho interesse, remove, sair', maxFollowups: 3, approveSensitive: true },
  ai: { model: 'Claude Sonnet', creativity: 0.4, analyzeOnFind: true, keyConfigured: false },
  integrations: { scraperUrl: 'http://google-maps-scraper:8080', calendar: false, webhook: '' },
  data: { retentionDays: 365, deleteOnOptOut: true },
};
