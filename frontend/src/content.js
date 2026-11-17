// Conteúdo do site Teleios — agência de marketing para PMEs.
// Voz próxima e informal ("a gente"). Sem números ou depoimentos inventados:
// troque os cases e acrescente resultados reais quando tiver.

export const contact = {
  whatsapp: '5515981763815',
  whatsappDisplay: '+55 15 98176-3815',
  email: 'contato@teleiosstudio.com',
};

export const whatsappLink = (text = 'Oi, Teleios! Quero um diagnóstico do marketing da minha empresa.') =>
  `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(text)}`;

export const socialLinks = [
  { id: 'instagram', label: 'Instagram', href: 'https://instagram.com/teleiosstudio' },
  { id: 'linkedin', label: 'LinkedIn', href: 'https://linkedin.com/company/teleiosstudio' },
  { id: 'youtube', label: 'YouTube', href: 'https://youtube.com/@teleiosstudio' },
];

/* Mensagens que ilustram o resultado desejado no hero (não são depoimentos). */
export const incoming = [
  { name: 'Mariana', text: 'Oi! Vi o anúncio de vocês. Ainda tem horário essa semana?', time: '09:12' },
  { name: 'Carlos', text: 'Quero um orçamento. Vocês atendem empresa?', time: '09:47' },
  { name: 'Júlia', text: 'Minha amiga indicou o Instagram de vocês 😊', time: '10:05' },
  { name: 'Rafael', text: 'Consigo fechar ainda hoje?', time: '10:31' },
];

export const pains = [
  { quote: 'Posto todo dia e o WhatsApp não toca.', note: 'Conteúdo sem estratégia vira diário, não vitrine.' },
  { quote: 'Minha empresa é melhor que a concorrente, mas parece pior no Instagram.', note: 'O cliente julga antes de conhecer. A marca fala primeiro.' },
  { quote: 'Já paguei agência e só recebi relatório de curtida.', note: 'Curtida não paga boleto. Conversa e venda pagam.' },
  { quote: 'Dependo de indicação e nunca sei como vai ser o próximo mês.', note: 'Indicação é ótima. Só não pode ser o único canal.' },
];

export const manifesto =
  'Marketing bonito que não vende é decoração. A gente junta marca, conteúdo, anúncio e site num plano só, feito por um time só e medido pelo que importa: gente chamando, agenda cheia e venda fechada.';

export const services = [
  {
    id: 'marca',
    number: '01',
    title: 'Design e identidade visual',
    outcome: 'Pare de competir por preço.',
    description:
      'A gente define o que faz sua empresa ser a escolha certa e transforma isso em identidade visual, tom de voz e mensagem. Quando a marca é clara, o cliente entende o valor antes de perguntar quanto custa.',
    deliverables: ['Diagnóstico de posicionamento', 'Identidade visual', 'Tom de voz', 'Guia de marca'],
    art: 'brand',
  },
  {
    id: 'conteudo',
    number: '02',
    title: 'Conteúdo e redes sociais',
    outcome: 'Um perfil que faz o cliente chamar.',
    description:
      'Planejamento, roteiro, design e publicação. Cada post tem um papel: atrair, gerar confiança ou puxar a conversa. Nada de postar por postar.',
    deliverables: ['Calendário editorial', 'Posts e carrosséis', 'Reels e stories', 'Gestão do perfil'],
    art: 'feed',
  },
  {
    id: 'trafego',
    number: '03',
    title: 'Tráfego pago',
    outcome: 'Anúncio que chega em quem compra.',
    description:
      'Campanhas no Instagram, Facebook e Google para quem está procurando o que você vende, na sua região. Você acompanha quantas conversas e pedidos cada real investido trouxe.',
    deliverables: ['Meta Ads', 'Google Ads', 'Criativos para anúncio', 'Relatório de conversas e vendas'],
    art: 'ad',
  },
  {
    id: 'video',
    number: '04',
    title: 'Vídeo e motion',
    outcome: 'Mostrar vende mais que explicar.',
    description:
      'Do reels de 15 segundos ao vídeo institucional. Roteiro, captação, edição e animação pensados para prender atenção nos primeiros três segundos.',
    deliverables: ['Reels e vídeos curtos', 'Vídeo institucional', 'Motion graphics', 'Vídeo para anúncio'],
    art: 'reel',
  },
  {
    id: 'site',
    number: '05',
    title: 'Sites e landing pages',
    outcome: 'Uma página que transforma visita em contato.',
    description:
      'Site rápido, bonito no celular e escrito para vender. Landing pages para cada campanha, com o botão de WhatsApp no lugar certo.',
    deliverables: ['Site institucional', 'Landing pages', 'Página de captura', 'Integração com WhatsApp'],
    art: 'site',
  },
];

export const extraService = {
  title: 'E quando o marketing pede mais, a gente programa.',
  description:
    'Sistemas, aplicativos e automações sob medida para a operação acompanhar o crescimento. Mesmo time, sem precisar contratar outra empresa.',
};

export const steps = [
  { step: '01', title: 'Diagnóstico', description: 'A gente analisa sua marca, seu perfil, seus concorrentes e como os clientes chegam hoje. Você sai sabendo onde está perdendo venda.' },
  { step: '02', title: 'Plano de 90 dias', description: 'Metas claras, canais escolhidos e o que vai ser feito semana a semana. Você aprova antes de começar.' },
  { step: '03', title: 'Execução', description: 'Marca, conteúdo, anúncios e site saindo do mesmo time, todos apontando para o mesmo objetivo.' },
  { step: '04', title: 'Números na mesa', description: 'Todo mês: quantas conversas, quantos orçamentos, quantas vendas. E o que vamos ajustar para o próximo.' },
];

export const comparison = {
  columns: ['Freelancer de post', 'Agência tradicional', 'Teleios'],
  rows: [
    { label: 'Estratégia antes de criar qualquer post', values: ['no', 'partial', 'yes'] },
    { label: 'Marca, conteúdo, anúncio e site no mesmo time', values: ['no', 'partial', 'yes'] },
    { label: 'Relatório com conversas e vendas, não curtidas', values: ['no', 'partial', 'yes'] },
    { label: 'Você fala direto com quem faz', values: ['yes', 'no', 'yes'] },
    { label: 'Site, sistema ou automação quando precisar', values: ['no', 'no', 'yes'] },
  ],
};

// Cases do portfólio da Teleios. Troque as capas por imagens reais quando tiver
// e acrescente resultados (números) apenas se forem reais.
export const projects = [
  {
    id: 'techflow',
    title: 'TechFlow',
    category: 'Design',
    services: ['Identidade visual', 'Design system', 'Guia de marca'],
    challenge: 'Criar do zero a marca de uma startup de tecnologia: logo, design system e guia para o time aplicar sozinho.',
    palette: { bg: '#ECEBFF', ink: '#1B1464', accent: '#5B4BFF' },
    layout: 'flow',
    word: 'techflow',
    size: 'wide',
  },
  {
    id: 'analytics',
    title: 'Dashboard Analytics',
    category: 'Design',
    services: ['UI/UX', 'Design de interface', 'Dataviz'],
    challenge: 'Transformar dados complexos em telas claras, que o gestor entende em segundos.',
    palette: { bg: '#0B1C2D', ink: '#E9EEEC', accent: '#00C48C' },
    layout: 'glow',
    word: 'dados',
    size: 'half',
  },
  {
    id: 'gestao',
    title: 'Sistema de Gestão Empresarial',
    category: 'Sites e sistemas',
    services: ['Sistema web', 'Dashboard', 'Automação'],
    challenge: 'Tirar a operação da planilha: estoque, pedidos e indicadores num lugar só.',
    palette: { bg: '#F2EFE9', ink: '#14181D', accent: '#00C48C' },
    layout: 'pack',
    word: 'gestão',
    size: 'half',
  },
  {
    id: 'fittracker',
    title: 'FitTracker',
    category: 'Sites e sistemas',
    services: ['Aplicativo', 'UI/UX', 'Gamificação'],
    challenge: 'App de treino com metas, ranking e sincronização em tempo real para engajar alunos.',
    palette: { bg: '#0D0D0D', ink: '#F4F4F0', accent: '#D7FF3A' },
    layout: 'move',
    word: 'fit',
    size: 'wide',
  },
  {
    id: 'inovacorp',
    title: 'InovaCorp',
    category: 'Vídeo',
    services: ['Vídeo institucional', 'Roteiro', 'Motion'],
    challenge: 'Apresentar visão, missão e serviços da empresa em dois minutos de vídeo.',
    palette: { bg: '#14213D', ink: '#F2E8D5', accent: '#C9A24D' },
    layout: 'lex',
    word: 'Inova',
    size: 'half',
  },
  {
    id: 'lancamento',
    title: 'Lançamento de produto',
    category: 'Vídeo',
    services: ['Motion graphics', 'Animação', 'Vídeo para anúncio'],
    challenge: 'Explicar um produto digital novo em uma animação de 60 segundos.',
    palette: { bg: '#D9442B', ink: '#FFF4E6', accent: '#FFC94A' },
    layout: 'nonna',
    word: 'play',
    size: 'half',
  },
];

export const audiences = [
  'Clínicas e consultórios',
  'Escritórios e consultorias',
  'Restaurantes e food service',
  'Comércio local',
  'Academias e estúdios',
  'Indústrias e B2B',
  'Prestadores de serviço',
];

export const fitYes = [
  'Você sabe que sua empresa é boa e quer que o digital mostre isso.',
  'Você quer medir marketing em conversas e vendas.',
  'Você prefere um time só cuidando de tudo, em vez de cinco fornecedores.',
];
export const fitNo = [
  'Você procura só post barato para "não deixar o perfil parado".',
  'Você espera resultado na primeira semana sem plano.',
];

export const faq = [
  {
    q: 'Quanto custa?',
    a: 'Depende do que sua empresa precisa agora. Depois do diagnóstico você recebe uma proposta com escopo, prazo e valor fechados. Sem letra miúda.',
  },
  {
    q: 'Em quanto tempo eu vejo resultado?',
    a: 'Anúncio bem feito começa a gerar conversa nas primeiras semanas. Marca e conteúdo constroem resultado no médio prazo. No plano de 90 dias você vê o que esperar de cada frente.',
  },
  {
    q: 'Preciso aparecer em vídeo?',
    a: 'Ajuda, mas não é obrigatório. A gente encontra o formato que funciona para você, seja com você na frente da câmera, com a equipe ou só com produto e bastidores.',
  },
  {
    q: 'Já tenho designer ou social media. Vocês trabalham junto?',
    a: 'Sim. Dá para a gente entrar só com estratégia e tráfego, por exemplo, e trabalhar junto com quem já cuida do seu perfil.',
  },
  {
    q: 'Vocês fazem só o site?',
    a: 'Fazemos. E se em algum momento precisar de sistema, app ou automação, o mesmo time desenvolve.',
  },
  {
    q: 'Tem contrato de fidelidade?',
    a: 'A gente trabalha com ciclos de planejamento. Os detalhes de prazo e cancelamento ficam claros na proposta, antes de você assinar qualquer coisa.',
  },
];
