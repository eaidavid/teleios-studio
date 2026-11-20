// Catálogo do construtor e o "diretor de arte" que gera uma prévia a partir da direção escolhida.
// Hoje roda com regras locais; no backend, a IA (Claude) vai preencher o mesmo formato,
// escrevendo os textos com base no site/Instagram reais do cliente.
import { derivePalettes } from './colors';

export const HEROES = {
  centro: 'Centralizado',
  dividido: 'Dividido com imagem',
  gigante: 'Tipográfico gigante',
  cartoes: 'Cartões flutuantes',
  gradiente: 'Gradiente animado',
  estatisticas: 'Com números',
  imagem: 'Imagem de fundo',
};
export const FOOTERS = { cta: 'Chamada final', colunas: 'Colunas', minimo: 'Mínimo', gigante: 'Nome gigante' };
export const BLOCKS = {
  sobre: { label: 'Sobre', variants: { texto: 'Texto + destaque', dividido: 'Com imagem' } },
  servicos: { label: 'Serviços', variants: { cards: 'Cartões', lista: 'Lista numerada', destaque: 'Destaque + lista', abas: 'Linhas com ícone' } },
  processo: { label: 'Como funciona', variants: { passos: 'Passos', linha: 'Linha do tempo' } },
  antesdepois: { label: 'Antes e depois', variants: { lado: 'Lado a lado', slider: 'Comparador' } },
  numeros: { label: 'Números', variants: { linha: 'Em linha', cartoes: 'Cartões' } },
  avaliacoes: { label: 'Avaliações', variants: { cards: 'Cartões', faixa: 'Faixa rolando', destaque: 'Citação em destaque' } },
  planos: { label: 'Planos e preços', variants: { cards: 'Cartões', tabela: 'Lista' } },
  equipe: { label: 'Equipe', variants: { cards: 'Cartões', linha: 'Em linha' } },
  galeria: { label: 'Galeria', variants: { grade: 'Grade', mosaico: 'Mosaico', faixa: 'Faixa horizontal' } },
  instagram: { label: 'Instagram', variants: { grade: 'Grade de posts' } },
  chamada: { label: 'Chamada no meio', variants: { faixa: 'Faixa', cartao: 'Cartão' } },
  perguntas: { label: 'Perguntas frequentes', variants: { sanfona: 'Sanfona', lista: 'Lista aberta' } },
  localizacao: { label: 'Localização', variants: { simples: 'Simples', dividido: 'Mapa ao lado' } },
};
export const FONTS = {
  moderna: { label: 'Moderna', display: "'Sora', sans-serif", weight: 700 },
  elegante: { label: 'Elegante', display: "'Instrument Serif', serif", weight: 400, italic: true },
  neutra: { label: 'Forte', display: "'Inter', sans-serif", weight: 800 },
  tecnica: { label: 'Técnica', display: "'JetBrains Mono', monospace", weight: 500 },
};
export const RADIUS = { reto: 2, suave: 12, redondo: 26 };
export const ANIMS = { subir: 'Subir', zoom: 'Zoom', deslizar: 'Deslizar', desfocar: 'Desfocar', girar: 'Virar em 3D', cascata: 'Cascata', nenhuma: 'Sem animação' };
export const TEXTS = { palavras: 'Palavra por palavra', letras: 'Letra por letra', mascara: 'Linha subindo', desfoque: 'Surgir do desfoque', onda: 'Onda', brilho: 'Brilho', digitar: 'Digitando', nenhuma: 'Sem animação' };

export const STYLES = {
  ia: { label: 'IA escolhe', desc: 'A IA decide pelo segmento e pela identidade' },
  elegante: { label: 'Elegante', desc: 'Serifa, respiro, movimentos suaves' },
  moderna: { label: 'Moderna', desc: 'Limpa, cartões e números' },
  ousada: { label: 'Ousada', desc: 'Tipografia enorme e contraste' },
  acolhedora: { label: 'Acolhedora', desc: 'Cantos redondos e tons suaves' },
  minimalista: { label: 'Minimalista', desc: 'Pouco elemento, muita clareza' },
  luxo: { label: 'Luxo', desc: 'Escuro, sofisticado, discreto' },
};
export const MOTIONS = { ia: 'IA escolhe', sutil: 'Sutil', equilibrada: 'Equilibrada', marcante: 'Marcante' };
export const GOALS = { ia: 'IA escolhe', agendar: 'Agendar', orcamento: 'Pedir orçamento', visitar: 'Visitar a loja', comprar: 'Comprar / pedir' };

const STYLE_RULES = {
  elegante: { font: ['elegante'], radius: ['suave', 'reto'], hero: ['centro', 'imagem', 'dividido'], pal: ['clara', 'suave'], text: ['mascara', 'desfoque', 'palavras'], anim: ['desfocar', 'subir'], footer: ['cta', 'gigante'] },
  moderna: { font: ['moderna'], radius: ['suave'], hero: ['dividido', 'cartoes', 'estatisticas'], pal: ['clara', 'neutra'], text: ['palavras', 'mascara'], anim: ['subir', 'cascata'], footer: ['colunas', 'cta'] },
  ousada: { font: ['neutra', 'moderna'], radius: ['reto'], hero: ['gigante', 'gradiente'], pal: ['forte', 'escura'], text: ['letras', 'onda', 'brilho'], anim: ['zoom', 'girar', 'deslizar'], footer: ['gigante', 'cta'] },
  acolhedora: { font: ['moderna'], radius: ['redondo'], hero: ['cartoes', 'centro', 'dividido'], pal: ['suave', 'clara'], text: ['palavras', 'desfoque'], anim: ['subir', 'cascata'], footer: ['cta'] },
  minimalista: { font: ['neutra', 'tecnica'], radius: ['reto', 'suave'], hero: ['centro', 'gigante'], pal: ['neutra', 'clara'], text: ['mascara', 'nenhuma'], anim: ['subir', 'desfocar'], footer: ['minimo', 'colunas'] },
  luxo: { font: ['elegante'], radius: ['reto'], hero: ['imagem', 'gigante', 'centro'], pal: ['escura'], text: ['desfoque', 'brilho', 'mascara'], anim: ['desfocar', 'subir'], footer: ['gigante', 'minimo'] },
};
const MOTION_RULES = {
  sutil: { anim: ['subir', 'desfocar'], text: ['mascara', 'palavras', 'nenhuma'] },
  equilibrada: { anim: ['subir', 'cascata', 'zoom', 'desfocar'], text: ['palavras', 'mascara', 'desfoque'] },
  marcante: { anim: ['girar', 'zoom', 'cascata', 'deslizar'], text: ['letras', 'onda', 'brilho'] },
};
const CATEGORY_STYLE = {
  'Clínica de estética': 'elegante', Odontologia: 'acolhedora', Academia: 'ousada', Restaurante: 'acolhedora', 'Pet shop': 'acolhedora',
  Ótica: 'moderna', Advocacia: 'luxo', Barbearia: 'ousada', Fisioterapia: 'acolhedora', Imobiliária: 'moderna',
};
const CATEGORY_SECTIONS = {
  'Clínica de estética': ['sobre', 'servicos', 'antesdepois', 'avaliacoes', 'equipe', 'perguntas', 'localizacao'],
  Odontologia: ['servicos', 'antesdepois', 'processo', 'avaliacoes', 'equipe', 'perguntas', 'localizacao'],
  Academia: ['servicos', 'numeros', 'planos', 'galeria', 'avaliacoes', 'chamada', 'localizacao'],
  Restaurante: ['sobre', 'servicos', 'galeria', 'instagram', 'avaliacoes', 'localizacao'],
  'Pet shop': ['servicos', 'galeria', 'avaliacoes', 'instagram', 'perguntas', 'localizacao'],
  Ótica: ['servicos', 'galeria', 'avaliacoes', 'chamada', 'localizacao'],
  Advocacia: ['sobre', 'servicos', 'processo', 'equipe', 'perguntas', 'localizacao'],
  Barbearia: ['servicos', 'planos', 'galeria', 'instagram', 'avaliacoes', 'localizacao'],
  Fisioterapia: ['sobre', 'servicos', 'processo', 'avaliacoes', 'equipe', 'perguntas', 'localizacao'],
  Imobiliária: ['sobre', 'servicos', 'numeros', 'galeria', 'avaliacoes', 'localizacao'],
};
export const suggestSections = (lead) => CATEGORY_SECTIONS[lead.category] || ['sobre', 'servicos', 'avaliacoes', 'galeria', 'localizacao'];

const CONTENT = {
  'Clínica de estética': { services: ['Limpeza de pele', 'Harmonização facial', 'Drenagem linfática', 'Depilação a laser'], goal: 'agendar', about: 'Cuidamos da sua pele com protocolos personalizados e profissionais especializados.' },
  Odontologia: { services: ['Clareamento', 'Implantes', 'Ortodontia', 'Limpeza e prevenção'], goal: 'agendar', about: 'Tratamentos modernos, sem dor e com atendimento humano do começo ao fim.' },
  Academia: { services: ['Musculação', 'Funcional', 'Aulas coletivas', 'Avaliação física'], goal: 'visitar', about: 'Estrutura completa, professores presentes e um ambiente que te faz voltar.' },
  Restaurante: { services: ['Almoço executivo', 'Jantar à la carte', 'Delivery', 'Eventos'], goal: 'comprar', about: 'Receitas de família, ingredientes frescos e o tempo certo de cada prato.' },
  'Pet shop': { services: ['Banho e tosa', 'Consultas', 'Hotelzinho', 'Rações e acessórios'], goal: 'agendar', about: 'Cuidado de quem ama bicho, com carinho e segurança.' },
  Ótica: { services: ['Exame de vista', 'Óculos de grau', 'Óculos de sol', 'Lentes de contato'], goal: 'visitar', about: 'Armações de marca, lentes de qualidade e ajuste na hora.' },
  Advocacia: { services: ['Direito empresarial', 'Trabalhista', 'Família', 'Contratos'], goal: 'orcamento', about: 'Advocacia próxima, com linguagem clara e foco em resolver.' },
  Barbearia: { services: ['Corte', 'Barba', 'Corte + barba', 'Pigmentação'], goal: 'agendar', about: 'Corte em dia, ambiente bom e aquele café enquanto espera.' },
  Fisioterapia: { services: ['Ortopédica', 'Pilates clínico', 'RPG', 'Pós-operatório'], goal: 'agendar', about: 'Tratamento individual para você voltar a se mexer sem dor.' },
  Imobiliária: { services: ['Venda', 'Locação', 'Avaliação de imóvel', 'Administração'], goal: 'visitar', about: 'A chave certa para a sua próxima casa, com quem conhece a região.' },
};
const CTA = { agendar: 'Agendar pelo WhatsApp', orcamento: 'Pedir orçamento', visitar: 'Como chegar', comprar: 'Fazer pedido' };

const pick = (arr, seed) => arr[Math.abs(seed) % arr.length];

export function generateDesign(lead, dir, seed = Date.now()) {
  const styleKey = dir.style === 'ia' ? CATEGORY_STYLE[lead.category] || 'moderna' : dir.style;
  const sr = STYLE_RULES[styleKey];
  const mr = MOTION_RULES[dir.motion === 'ia' ? (styleKey === 'ousada' ? 'marcante' : styleKey === 'minimalista' || styleKey === 'luxo' ? 'sutil' : 'equilibrada') : dir.motion];
  const s = Math.floor(seed / 7);
  const both = (a, b) => { const x = a.filter((k) => b.includes(k)); return x.length ? x : a; };
  const palettes = derivePalettes(dir.colors);
  const palId = pick(sr.pal, s);
  const content = CONTENT[lead.category] || CONTENT['Clínica de estética'];
  const goal = dir.goal === 'ia' ? content.goal : dir.goal;
  const sections = dir.sections?.length ? dir.sections : suggestSections(lead);
  const variants = Object.fromEntries(Object.entries(BLOCKS).map(([k, b], i) => [k, pick(Object.keys(b.variants), s + i)]));
  const brief = lead.analysis?.brief;
  return {
    style: styleKey,
    headline: brief?.headline || `${lead.name}: qualidade aprovada pela cidade.`,
    sub: brief?.sub || `${lead.category} em ${lead.neighborhood}, ${lead.city}.`,
    cta: CTA[goal],
    about: content.about,
    services: content.services,
    colors: dir.colors,
    palettes,
    palette: palettes.find((p) => p.id === palId),
    font: pick(sr.font, s),
    radius: pick(sr.radius, s + 1),
    hero: dir.hero && dir.hero !== 'ia' ? dir.hero : pick(sr.hero, s + 2),
    footer: pick(sr.footer, s + 3),
    anim: pick(both(mr.anim, sr.anim), s + 4),
    text: pick(both(mr.text, sr.text), s + 5),
    order: [...sections, ...Object.keys(BLOCKS).filter((k) => !sections.includes(k))],
    on: Object.fromEntries(Object.keys(BLOCKS).map((k) => [k, sections.includes(k)])),
    variants,
    notes: dir.notes || '',
  };
}
