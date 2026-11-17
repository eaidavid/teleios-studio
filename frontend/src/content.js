// Conteúdo do site Teleios Studio — voz próxima e informal ("a gente").

export const contact = {
  whatsapp: '5515981763815',
  whatsappDisplay: '+55 15 98176-3815',
  email: 'contato@teleiosstudio.com',
};

export const whatsappLink = (text = 'Oi, Teleios! Quero conversar sobre um projeto.') =>
  `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(text)}`;

export const socialLinks = [
  { id: 'instagram', label: 'Instagram', href: 'https://instagram.com/teleiosstudio' },
  { id: 'linkedin', label: 'LinkedIn', href: 'https://linkedin.com/company/teleiosstudio' },
  { id: 'youtube', label: 'YouTube', href: 'https://youtube.com/@teleiosstudio' },
  { id: 'github', label: 'GitHub', href: 'https://github.com/teleiosstudio' },
];

export const services = [
  {
    id: 'programacao',
    number: '01',
    title: 'Programação',
    category: 'Programação',
    headline: 'O sistema que tira sua operação da planilha.',
    description:
      'Sistemas web, aplicativos e integrações feitos sob medida para o jeito que sua empresa trabalha. Código limpo, documentado e pronto para crescer junto com você.',
    deliverables: ['Sistemas web e painéis', 'Aplicativos mobile', 'Integrações e APIs', 'Sites e landing pages'],
  },
  {
    id: 'design',
    number: '02',
    title: 'Design',
    category: 'Design',
    headline: 'Uma marca que as pessoas reconhecem de longe.',
    description:
      'Identidade visual, interfaces e design system. A gente organiza como sua empresa aparece, do logo à tela do sistema, para tudo parecer parte da mesma coisa.',
    deliverables: ['Identidade visual', 'UI/UX de produto', 'Design system', 'Peças para redes'],
  },
  {
    id: 'video',
    number: '03',
    title: 'Vídeo',
    category: 'Vídeo',
    headline: 'O vídeo que explica o que você faz em 60 segundos.',
    description:
      'Institucional, motion graphics e edição. Do roteiro à entrega final, a gente transforma o que sua empresa faz numa história fácil de entender e de lembrar.',
    deliverables: ['Vídeo institucional', 'Motion graphics', 'Edição e finalização', 'Conteúdo para redes'],
  },
];

export const touchpoints = ['Sistema', 'Site', 'Marca', 'Redes sociais', 'Vídeo'];

export const projects = [
  {
    id: 'gestao-empresarial',
    title: 'Sistema de Gestão Empresarial',
    client: 'Indústria de médio porte',
    category: 'Programação',
    type: 'Sistema web',
    summary: 'Painel com estoque, pedidos e indicadores num lugar só. Acabou a planilha paralela.',
    tags: ['React', 'Node.js', 'PostgreSQL'],
    year: '2024',
    cover: 'dashboard',
    size: 'wide',
  },
  {
    id: 'techflow',
    title: 'TechFlow',
    client: 'Startup de tecnologia',
    category: 'Design',
    type: 'Identidade visual',
    summary: 'Marca completa: logo, paleta, tipografia e guia de uso para o time aplicar sozinho.',
    tags: ['Branding', 'Design system'],
    year: '2024',
    cover: 'brand',
    size: 'half',
  },
  {
    id: 'inovacorp',
    title: 'InovaCorp',
    client: 'Consultoria',
    category: 'Vídeo',
    type: 'Vídeo institucional',
    summary: 'Dois minutos apresentando missão, time e serviços, com roteiro e motion próprios.',
    tags: ['Roteiro', 'Edição', 'Motion'],
    year: '2024',
    cover: 'video',
    size: 'half',
  },
  {
    id: 'fittracker',
    title: 'FitTracker',
    client: 'Rede de academias',
    category: 'Programação',
    type: 'Aplicativo',
    summary: 'App de treino com metas, ranking entre alunos e sincronização em tempo real.',
    tags: ['React Native', 'Firebase'],
    year: '2023',
    cover: 'app',
    size: 'wide',
  },
  {
    id: 'analytics',
    title: 'Dashboard Analytics',
    client: 'Empresa de logística',
    category: 'Design',
    type: 'Interface',
    summary: 'Dados de entrega que antes ninguém lia, organizados em telas que o gestor entende em segundos.',
    tags: ['UI/UX', 'Dataviz'],
    year: '2023',
    cover: 'chart',
    size: 'half',
  },
  {
    id: 'lancamento',
    title: 'Lançamento de Produto',
    client: 'Software house',
    category: 'Vídeo',
    type: 'Motion graphics',
    summary: 'Animação explicativa de 60 segundos para apresentar um produto digital novo.',
    tags: ['After Effects', 'Motion'],
    year: '2024',
    cover: 'motion',
    size: 'half',
  },
];

export const process = [
  {
    step: '01',
    title: 'Conversa',
    description: 'A gente entende seu negócio, o problema de verdade e onde você quer chegar. Sem formulário de 40 perguntas.',
  },
  {
    step: '02',
    title: 'Plano',
    description: 'Você recebe escopo, prazo e valor claros. Dá para saber exatamente o que vai ser entregue antes de começar.',
  },
  {
    step: '03',
    title: 'Mão na massa',
    description: 'Entregas a cada etapa, com você acompanhando de perto. Ajustes acontecem no caminho, não no final.',
  },
  {
    step: '04',
    title: 'Entrega e suporte',
    description: 'Projeto pronto, testado e explicado. E a gente continua por perto depois que ele vai ao ar.',
  },
];

export const differentials = [
  { title: 'Um time só', description: 'Quem programa trabalha junto com quem desenha e quem edita. Nada se perde entre fornecedores.' },
  { title: 'Fala a sua língua', description: 'Sem jargão. Você entende o que está sendo feito e por quê.' },
  { title: 'Feito para durar', description: 'Código organizado e marca com guia de uso. Fácil de manter e de evoluir.' },
  { title: 'Entrega de verdade', description: 'Projeto finalizado, testado e no ar. Não um rascunho bonito.' },
];
