// Servidor MCP do Radar. Adicione no claude.ai como conector personalizado:
//   https://radar.agenciateleios.com.br/mcp/<MCP_TOKEN>
// O Claude lê os leads, salva análises e cria a página-prévia; o link sai na hora.
import { timingSafeEqual } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { seedBots } from '../../web/src/data/seed.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from 'zod';
import { q, leadRow, siteRow, requestRow, completeRequests } from './db.js';
import { hunt, huntStatus, cleanName, cleanCampaign, deepEnrich } from './cacador.js';
import { analyze as analyzeLead } from '../../web/src/data/analysis.js';
import { enqueue, waStatus } from './whatsapp.js';
import { kvGet, kvSet } from './db.js';
import { seedSettings as defaults } from '../../web/src/data/seed.js';
import { CATEGORIES } from '../../web/src/data/seed.js';
import { getLead, patchLead, upsertSite, previewUrl, logActivity, mergeBots } from './routes.js';
import { STAGES } from '../../web/src/data/seed.js';
import { BLOCKS, HEROES, FOOTERS, FONTS, RADIUS, ANIMS, TEXTS, STYLES, MOTIONS, GOALS, generateDesign } from '../../web/src/sites/generator.js';
import { derivePalettes } from '../../web/src/sites/colors.js';
import { renderPremium, FONTS as PFONTS, MOTIFS, TEXTURES, SECTION_TYPES } from './templates/premium.js';
import { briefMd } from './templates/brief.js';
import { ensurePhotos, stockPhotosFor } from './stock.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const readDoc = (f) => readFileSync(path.join(HERE, f), 'utf8');
const GUIDE_BOT = { previa: 'construtor', mensagem: 'redator', analise: 'analista' };
const GUIDE_FILE = { previa: 'playbook/criacao.md', mensagem: 'playbook/abordagem.md', analise: 'playbook/analise.md' };

const text = (v) => ({ content: [{ type: 'text', text: typeof v === 'string' ? v : JSON.stringify(v, null, 2) }] });
const fail = (m) => ({ content: [{ type: 'text', text: m }], isError: true });
const STAGE_IDS = STAGES.map((s) => s.id);

const brief = (l) => ({
  id: l.id, nome: l.name, categoria: l.category, cidade: l.city, bairro: l.neighborhood, etapa: l.stage,
  nota: l.rating, avaliacoes: l.reviews, site: l.website || null, instagram: l.instagram || null,
  oportunidade: l.analysis?.opportunity ?? null,
});

function buildServer() {
  const server = new McpServer({ name: 'teleios-radar', version: '1.0.0' }, { instructions: 'Radar de prospecção da Agência Teleios. Antes de criar prévia, escrever mensagem ou analisar, SEMPRE chame guia_de_criacao com o tipo certo e siga o padrão (nada de cara de modelo/IA; identidade autêntica; animações do Teleios Motion Kit; fotos reais; nada inventado). Quando o usuário pedir para fazer os pedidos/a fila do Radar, chame ver_fila e atenda cada pedido. Português do Brasil, tom próximo e direto.' });

  server.registerTool('guia_de_criacao', {
    description: 'LEIA ANTES (e siga à risca) de criar prévia — é o manual do robô Webdesigner, com método, tipografia, cor, layouts, coreografia, textos, playbooks por segmento, snippets e rubrica de qualidade — ou (tipo "previa"), escrever mensagem ("mensagem") ou analisar ("analise"). Traz o padrão de qualidade da Agência Teleios, as instruções que o David escreveu para cada robô no Radar e, para prévias, o kit de animações. Siga à risca.',
    inputSchema: { tipo: z.enum(['previa', 'mensagem', 'analise']) },
  }, async ({ tipo }) => {
    const bots = mergeBots(await kvGet('bots', seedBots));
    const bot = bots.find((b) => b.id === GUIDE_BOT[tipo]);
    const extra = [bot?.instructions, ...(bot?.rules || [])].filter(Boolean);
    const parts = [readDoc(GUIDE_FILE[tipo])];
    if (tipo === 'previa') {
      const { readdirSync } = await import('node:fs');
      for (const f of readdirSync(path.join(HERE, 'playbook/webdesigner')).sort()) parts.push(readDoc(`playbook/webdesigner/${f}`));
      // exemplos aprovados (especificações reais de montar_site) — a régua de qualidade
      for (const f of readdirSync(path.join(HERE, 'playbook/exemplos')).sort()) parts.push(`## Exemplo aprovado: ${f.replace('.json', '')}\n\`\`\`json\n${readDoc(`playbook/exemplos/${f}`)}\n\`\`\``);
    }
    if (extra.length) parts.push(`## Instruções do David para o robô ${bot.name} (prioridade sobre o guia)\n${extra.map((x) => `- ${x}`).join('\n')}`);
    if (tipo === 'previa') parts.push(readDoc('kit/LEIA.md'));
    return text(parts.join('\n\n---\n\n'));
  });

  server.registerTool('buscar_leads', {
    description: 'Lista empresas do funil do Radar. Filtre por texto, etapa, categoria ou cidade. Use para achar o lead antes de analisar ou criar uma prévia.',
    inputSchema: {
      busca: z.string().optional().describe('Parte do nome, categoria ou bairro'),
      etapa: z.enum(STAGE_IDS).optional().describe('found=encontradas, sent=abordadas, reply=responderam, qual=qualificadas, prop=proposta, won=ganhas'),
      categoria: z.string().optional(),
      cidade: z.string().optional(),
      sem_previa: z.boolean().optional().describe('Só leads que ainda não têm site-prévia'),
      limite: z.number().int().min(1).max(100).optional(),
    },
  }, async ({ busca, etapa, categoria, cidade, sem_previa, limite = 30 }) => {
    const cond = []; const p = [];
    if (busca) { p.push(`%${busca}%`); cond.push(`(data->>'name' ilike $${p.length} or data->>'category' ilike $${p.length} or data->>'neighborhood' ilike $${p.length})`); }
    if (etapa) { p.push(etapa); cond.push(`stage = $${p.length}`); }
    if (categoria) { p.push(`%${categoria}%`); cond.push(`data->>'category' ilike $${p.length}`); }
    if (cidade) { p.push(`%${cidade}%`); cond.push(`data->>'city' ilike $${p.length}`); }
    if (sem_previa) cond.push('not exists (select 1 from sites s where s.lead_id = leads.id)');
    p.push(limite);
    const { rows } = await q(`select * from leads ${cond.length ? `where ${cond.join(' and ')}` : ''} order by coalesce((data->'analysis'->>'opportunity')::int, 0) desc, created_at desc limit $${p.length}`, p);
    return text(rows.map((r) => brief(leadRow(r))));
  });

  server.registerTool('ver_lead', {
    description: 'Mostra tudo sobre um lead: contato, site, Instagram, avaliações, cores da marca, análise de oportunidade, notas e a prévia (se existir).',
    inputSchema: { id: z.number().int() },
  }, async ({ id }) => {
    const l = await getLead(id);
    if (!l) return fail(`Lead ${id} não existe.`);
    const { rows } = await q('select * from sites where lead_id = $1', [id]);
    const pv = rows[0] ? siteRow(rows[0]) : null;
    if (pv?.html) { pv.html_tamanho = pv.html.length; delete pv.html; }
    const { hours, ...rest } = l;
    return text({ ...rest, brandName: l.brandName || cleanName(l.name), horario: hours, previa: pv ? { ...pv, url: previewUrl(pv.slug), editar: 'Para ajustar a página em HTML, chame ver_html_previa' } : null });
  });

  server.registerTool('salvar_analise', {
    description: 'Grava a sua análise do lead no Radar (aparece na aba Análise). ANTES: chame guia_de_criacao({tipo:"analise"}). Envie só o que quiser atualizar.',
    inputSchema: {
      id: z.number().int(),
      oportunidade: z.number().int().min(0).max(100).optional().describe('0 a 100: quanto a agência pode ajudar'),
      resumo: z.string().optional(),
      lacunas: z.array(z.object({ area: z.string(), severity: z.enum(['alta', 'media', 'baixa']), title: z.string(), detail: z.string() })).optional(),
      angulo: z.string().optional().describe('O gancho da abordagem'),
      mensagem: z.string().optional().describe('Primeira mensagem de WhatsApp sugerida'),
      briefing: z.object({ headline: z.string(), sub: z.string(), cta: z.string().optional() }).partial().optional().describe('Textos para o site-prévia'),
    },
  }, async ({ id, oportunidade, resumo, lacunas, angulo, mensagem, briefing }) => {
    const l = await getLead(id);
    if (!l) return fail(`Lead ${id} não existe.`);
    const a = { ...(l.analysis || {}), by: 'claude', at: Date.now() };
    if (oportunidade != null) a.opportunity = oportunidade;
    if (resumo) a.summary = resumo;
    if (lacunas) a.gaps = lacunas;
    if (angulo) a.angle = angulo;
    if (mensagem) a.message = mensagem;
    if (briefing) a.brief = { ...(a.brief || {}), ...briefing };
    await patchLead(id, { analysis: a });
    await logActivity('analista', `Claude analisou ${l.name}`);
    await completeRequests('analise', id, { by: 'claude' });
    return text('Análise salva no Radar. Pedido de análise deste lead marcado como feito.');
  });

  server.registerTool('mover_etapa', {
    description: 'Move o lead para outra etapa do funil.',
    inputSchema: { id: z.number().int(), etapa: z.enum(STAGE_IDS) },
  }, async ({ id, etapa }) => (await patchLead(id, { stage: etapa, lastContactAt: Date.now() })) ? text('Etapa atualizada.') : fail('Lead não existe.'));

  server.registerTool('anotar', {
    description: 'Adiciona uma nota ao lead.',
    inputSchema: { id: z.number().int(), texto: z.string().min(1) },
  }, async ({ id, texto }) => {
    const l = await getLead(id);
    if (!l) return fail('Lead não existe.');
    await patchLead(id, { notes: [{ id: Date.now(), text: texto, at: Date.now(), by: 'Claude' }, ...(l.notes || [])] });
    return text('Nota adicionada.');
  });

  server.registerTool('salvar_redes', {
    description: 'Grava no lead o que você descobriu pesquisando na web (use sua busca na web): Instagram, Facebook, site e o DECISOR (dono/sócio). Informe sempre a fonte. Só dados públicos e profissionais.',
    inputSchema: {
      lead_id: z.number().int(),
      instagram: z.string().optional().describe('@usuario'), facebook: z.string().optional(), site: z.string().optional(),
      decisor: z.object({ nome: z.string(), cargo: z.string(), fonte: z.string() }).optional(),
      seguidores: z.number().int().optional(), ultimo_post_dias: z.number().int().optional(),
    },
  }, async ({ lead_id, instagram, facebook, site, decisor, seguidores, ultimo_post_dias }) => {
    const l = await getLead(lead_id);
    if (!l) return fail('Lead não existe.');
    const patch = {};
    if (instagram) patch.instagram = instagram.startsWith('@') ? instagram : `@${instagram.replace(/.*instagram\.com\//, '').replace(/\/.*/, '')}`;
    if (facebook) patch.facebook = facebook;
    if (site) patch.website = site.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    if (decisor) { patch.decisor = { ...decisor, fonte: decisor.fonte || 'pesquisa do Claude' }; if (!l.contact) patch.contact = `${decisor.nome.split(' ')[0]}, ${decisor.cargo.toLowerCase()}`; }
    if (seguidores != null || ultimo_post_dias != null) patch.social = { ...(l.social || {}), followers: seguidores ?? l.social?.followers, lastPostDays: ultimo_post_dias ?? l.social?.lastPostDays };
    const next = await patchLead(lead_id, patch);
    await patchLead(lead_id, { analysis: { ...analyzeLead(next), ...(l.analysis?.by === 'claude' ? { summary: l.analysis.summary, angle: l.analysis.angle, message: l.analysis.message, by: 'claude' } : {}) } });
    return text('Salvo no Radar.');
  });

  server.registerTool('enriquecer_lead', {
    description: 'Roda o enriquecimento completo de um lead: diagnóstico do site (plataforma, Pixel, Google Ads, abandono), nota do Google PageSpeed, CNPJ e decisor na Receita Federal e se o telefone tem WhatsApp.',
    inputSchema: { lead_id: z.number().int() },
  }, async ({ lead_id }) => {
    const l = await getLead(lead_id);
    if (!l) return fail('Lead não existe.');
    const d = await deepEnrich({ ...l, siteAudit: undefined, pagespeed: undefined, company: undefined, waValid: undefined });
    d.analysis = analyzeLead(d);
    await patchLead(lead_id, d);
    return text({ site: d.siteAudit || null, pagespeed: d.pagespeed || null, empresa: d.company || null, decisor: d.decisor || null, whatsapp: d.waValid ?? 'não conferido (WhatsApp desconectado)' });
  });

  server.registerTool('catalogo_construtor', {
    description: 'Mostra as opções do construtor de sites do Radar (estilos, topos, seções e variantes, rodapés, fontes, animações). Consulte antes de montar o campo "design" de criar_previa.',
    inputSchema: {},
  }, async () => text({
    estilos: STYLES, movimento: MOTIONS, objetivos: GOALS, topos: HEROES, rodapes: FOOTERS, fontes: Object.fromEntries(Object.entries(FONTS).map(([k, f]) => [k, f.label])),
    cantos: RADIUS, animacoes_de_bloco: ANIMS, animacoes_de_texto: TEXTS,
    secoes: Object.fromEntries(Object.entries(BLOCKS).map(([k, b]) => [k, { nome: b.label, variantes: b.variants }])),
    paletas: 'Geradas a partir das cores da marca: clara, suave, escura, forte, neutra. Passe "cores" e escolha "paleta".',
    dica: 'Prefira "html" autoral seguindo guia_de_criacao({tipo:"previa"}); o construtor é para variações rápidas.',
    kit: readDoc('kit/LEIA.md'),
  }));

  server.registerTool('montar_site', {
    description: [
      'JEITO PREFERIDO de criar a prévia: monta um site completo com acabamento de estúdio (motor premium da Teleios) a partir da sua direção de arte e dos seus textos.',
      'Antes: guia_de_criacao({tipo:"previa"}) e ver_lead. Fotos reais do lead, avaliações, horário, telefone, WhatsApp e mapa entram sozinhos.',
      'Você decide: tema (cores, fontes, motivo, textura, movimento) e a sequência de seções (tipos: ' + SECTION_TYPES.join(', ') + ').',
      'Títulos têm duas partes (titulo_suave + titulo_forte) e aceitam <em> e <strong>. Use "html" para um momento autoral próprio (com atributos do Motion Kit).',
      'Para ajustar depois, chame de novo com a especificação alterada (use ver_site para pegar a atual). Devolve o link público.',
    ].join(' '),
    inputSchema: {
      lead_id: z.number().int(),
      conceito: z.string().describe('O conceito em 1 frase (ex.: "precisão sob medida, contada por cotas e réguas")'),
      tema: z.object({
        fundo: z.string().describe('hex'), fundo_alt: z.string().optional(), tinta: z.string(), tinta_suave: z.string().optional(), acento: z.string(),
        fonte_titulo: z.enum(Object.keys(PFONTS)), fonte_texto: z.enum(Object.keys(PFONTS)), fonte_destaque: z.enum(Object.keys(PFONTS)).optional().describe('para <em> nos títulos'),
        peso_titulo: z.number().int().min(200).max(800).optional().describe('300 = fino elegante (padrão); 700+ = ousado'),
        peso_forte: z.number().int().min(400).max(900).optional(),
        raio: z.enum(['reto', 'suave', 'redondo']).optional(),
        motivo: z.enum(MOTIFS).describe('símbolo dos rótulos e faixas: regua (marcenaria), ponto, linha, arco, cruz'),
        textura: z.enum(TEXTURES).optional().describe('aplicada nas seções escuras e no rodapé'),
        movimento: z.enum(['sutil', 'equilibrado', 'marcante']).optional(),
      }),
      marca: z.object({ nome: z.string().optional(), logo_url: z.string().optional(), logo_svg: z.string().optional() }).optional(),
      secoes: z.array(z.record(z.any())).min(4).describe('Sequência de seções. Cada uma tem "tipo" e campos próprios (veja guia_de_criacao → Motor premium). Campos comuns: rotulo, titulo_suave, titulo_forte, fundo (claro|alt|escuro), textura, ancora, menu.'),
      rodape: z.object({ frase: z.string().optional(), palavra_gigante: z.string().optional() }).optional(),
      whatsapp_texto: z.string().optional().describe('mensagem pronta quando o cliente clicar no WhatsApp'),
      menu_cta: z.object({ texto: z.string() }).optional(),
      fotos: z.array(z.string()).optional().describe('URLs extras de fotos (as do lead já entram)'),
      css_extra: z.string().optional().describe('CSS extra para detalhes autorais (opcional)'),
    },
  }, async (args) => {
    const l = await getLead(args.lead_id);
    if (!l) return fail(`Lead ${args.lead_id} não existe.`);
    const { lead_id, ...spec } = args;
    const lp = await ensurePhotos(l, patchLead);
    let html;
    try { html = renderPremium(spec, lp); } catch (e) { return fail(`Não consegui montar: ${e.message}`); }
    const site = await upsertSite({ lead: lead_id, data: { premium: spec }, direction: { conceito: spec.conceito }, html });
    await logActivity('construtor', `Webdesigner montou o site de ${l.brandName || l.name}`);
    await completeRequests('previa', lead_id, { link: site.url });
    const fotos = (l.gallery?.length || 0) + (l.sitePhotos?.length || 0);
    return text({ ok: true, link: site.url, fotos_reais: fotos, fotos_de_banco: fotos >= 3 ? 0 : (lp.stockPhotos?.length || 0), aviso: fotos >= 3 ? undefined : 'Sem fotos reais suficientes: entraram fotos de banco gratuito (marcadas como ilustrativas). Use buscar_fotos para trocar por buscas mais certeiras.' });
  });

  server.registerTool('brief_do_lead', {
    description: 'Briefing mastigado de um lead para a prévia: dados, análise, avaliações reais, fotos, direção escolhida no Radar e um rascunho de especificação do montar_site para você melhorar. Use logo depois do guia_de_criacao.',
    inputSchema: { lead_id: z.number().int() },
  }, async ({ lead_id }) => {
    const l = await getLead(lead_id);
    if (!l) return fail('Lead não existe.');
    const { rows } = await q('select direction from sites where lead_id = $1', [lead_id]);
    const recent = (await q("select s.data, coalesce(l.data->>'brandName', l.data->>'name') as nome from sites s join leads l on l.id = s.lead_id where s.data ? 'premium' and s.lead_id <> $1 order by s.updated_at desc limit 5", [lead_id])).rows;
    return text(briefMd(l, { site: rows[0] ? { direction: rows[0].direction } : null, recent }));
  });

  server.registerTool('buscar_fotos', {
    description: 'Busca fotos de banco gratuito (Pexels se configurado, senão domínio público) para um lead sem fotos reais, com a busca que você escrever em INGLÊS (ex.: "walnut wood workshop hands", "bright modern kitchen white oak"). Substitui as fotos ilustrativas do lead; depois chame montar_site de novo.',
    inputSchema: { lead_id: z.number().int(), busca: z.string().min(3), quantidade: z.number().int().min(3).max(12).optional() },
  }, async ({ lead_id, busca, quantidade = 8 }) => {
    const l = await getLead(lead_id);
    if (!l) return fail('Lead não existe.');
    const photos = await stockPhotosFor(l, quantidade, busca).catch(() => []);
    if (!photos.length) return fail('Nada encontrado; tente outra busca em inglês, mais simples.');
    await patchLead(lead_id, { stockPhotos: photos });
    return text({ ok: true, fotos: photos.map((p) => p.url) });
  });

  server.registerTool('ver_site', {
    description: 'Mostra a especificação atual do site montado com montar_site (para você ajustar e chamar montar_site de novo).',
    inputSchema: { lead_id: z.number().int() },
  }, async ({ lead_id }) => {
    const { rows } = await q('select data from sites where lead_id = $1', [lead_id]);
    return rows[0]?.data?.premium ? text(rows[0].data.premium) : fail('Esse lead não tem site montado pelo motor premium.');
  });

  server.registerTool('criar_previa', {
    description: [
      'Alternativa ao montar_site (prefira montar_site). Cria/atualiza a prévia com HTML 100% autoral (use só se a ideia não couber no motor premium) ou com o construtor simples. ANTES: guia_de_criacao({tipo:"previa"}).',
      'Três jeitos: (1) só "direcao": o construtor monta tudo; (2) "design": você escolhe textos, seções e estilo (veja catalogo_construtor); (3) "html": página completa escrita por você.',
      'Use as cores da marca do lead (campo brand.colors em ver_lead) para não fugir da identidade dele.',
    ].join(' '),
    inputSchema: {
      lead_id: z.number().int(),
      direcao: z.object({
        estilo: z.string().optional(), movimento: z.string().optional(), topo: z.string().optional(), objetivo: z.string().optional(),
        secoes: z.array(z.string()).optional(), cores: z.array(z.string()).optional().describe('Hex, ex. ["#C86B7E", "#4A1F2A"]'), observacoes: z.string().optional(),
      }).optional(),
      design: z.object({
        headline: z.string(), sub: z.string(), cta: z.string(), about: z.string(), services: z.array(z.string()),
        style: z.string(), font: z.string(), radius: z.string(), hero: z.string(), footer: z.string(), anim: z.string(), text: z.string(),
        paleta: z.string().describe('clara | suave | escura | forte | neutra'),
        secoes: z.array(z.string()).describe('Seções ligadas, na ordem'),
        variants: z.record(z.string()),
      }).partial().optional(),
      html: z.string().optional().describe('Página completa. Se enviada, é ela que aparece no link.'),
    },
  }, async ({ lead_id, direcao = {}, design = {}, html }) => {
    const l = await getLead(lead_id);
    if (!l) return fail(`Lead ${lead_id} não existe.`);
    const colors = direcao.cores?.length ? direcao.cores : l.brand?.colors?.length ? l.brand.colors : [l.palette?.[2] || '#00C48C', l.palette?.[1] || '#14181D'];
    const dir = {
      style: direcao.estilo || 'ia', motion: direcao.movimento || 'ia', hero: direcao.topo || 'ia', goal: direcao.objetivo || 'ia',
      sections: direcao.secoes || design.secoes || [], colors, notes: direcao.observacoes || '', logo: null,
    };
    const base = generateDesign(l, dir);
    const { paleta, secoes, ...rest } = design;
    const data = { ...base, ...Object.fromEntries(Object.entries(rest).filter(([, v]) => v != null)) };
    if (design.variants) data.variants = { ...base.variants, ...design.variants };
    if (paleta) data.palette = derivePalettes(colors).find((p) => p.id === paleta) || base.palette;
    if (secoes?.length) {
      data.order = [...secoes, ...Object.keys(BLOCKS).filter((k) => !secoes.includes(k))];
      data.on = Object.fromEntries(Object.keys(BLOCKS).map((k) => [k, secoes.includes(k)]));
    }
    const site = await upsertSite({ lead: lead_id, data, direction: dir, html });
    await logActivity('analista', `Claude criou a prévia de ${l.name}`);
    await completeRequests('previa', lead_id, { link: site.url });
    return text({ ok: true, link: site.url, editar_no_radar: `${process.env.PUBLIC_URL || ''}/#sites-${lead_id}`, modo: html ? 'html' : 'construtor' });
  });

  server.registerTool('ver_html_previa', {
    description: 'Devolve o HTML atual da prévia de um lead (quando foi feita em HTML), para você ajustar e salvar de novo com criar_previa.',
    inputSchema: { lead_id: z.number().int() },
  }, async ({ lead_id }) => {
    const { rows } = await q('select html from sites where lead_id = $1', [lead_id]);
    return rows[0]?.html ? text(rows[0].html) : fail('Essa prévia não tem HTML (foi feita pelo construtor).');
  });

  server.registerTool('listar_previas', {
    description: 'Lista os sites-prévia criados, com o link de cada um.',
    inputSchema: {},
  }, async () => {
    const { rows } = await q("select s.slug, s.lead_id, s.sent_at, s.updated_at, l.data->>'name' as nome from sites s join leads l on l.id = s.lead_id order by s.updated_at desc limit 100");
    return text(rows.map((r) => ({ lead_id: r.lead_id, empresa: r.nome, link: previewUrl(r.slug), enviada: !!r.sent_at })));
  });

  server.registerTool('preparar_mensagem', {
    description: [
      'Prepara a PRIMEIRA mensagem de WhatsApp para um lead (use depois de criar a prévia; inclua o link dela). ANTES: chame guia_de_criacao({tipo:"mensagem"}).',
      'Por padrão vai para "Aprovar antes de enviar" no Radar; se o usuário ligou o envio direto em Configurações, entra direto na fila de envio,',
      'que respeita limite diário, intervalo aleatório e horário comercial. Escreva curto (até ~4 linhas), pessoal, citando um fato real do negócio,',
      'sem parecer propaganda, terminando com uma pergunta simples. Nunca envie para lead bloqueado.',
    ].join(' '),
    inputSchema: { lead_id: z.number().int(), texto: z.string().min(10).max(1200) },
  }, async ({ lead_id, texto }) => {
    const l = await getLead(lead_id);
    if (!l) return fail('Lead não existe.');
    if (l.blocked) return fail(`Não preparei: ${l.blocked}.`);
    if (!l.phone) return fail('Lead sem telefone.');
    const settings = await kvGet('settings', defaults);
    const direct = settings.messages?.autoSend === true;
    if (direct) {
      await enqueue(lead_id, texto, 'Claude');
    } else {
      const list = await kvGet('approvals', []);
      await kvSet('approvals', [...list.filter((a) => a.lead !== lead_id), { lead: lead_id, text: texto, by: 'Claude', at: Date.now() }]);
    }
    await logActivity('redator', `Claude escreveu a mensagem para ${l.name}`);
    const st = waStatus();
    return text({ ok: true, destino: direct ? 'fila de envio' : 'aguardando sua aprovação no Radar (tela Hoje)', whatsapp: st.state === 'open' ? 'conectado' : 'DESCONECTADO: conecte em Configurações → WhatsApp' });
  });

  server.registerTool('ver_fila', {
    description: [
      'COMECE POR AQUI quando o usuário disser "faz os pedidos do Radar", "a fila", "o que tem pra fazer" ou parecido.',
      'Lista os pedidos pendentes que ele deixou no Radar. Tipos:',
      '"analise" (analise o lead com ver_lead e grave com salvar_analise),',
      '"previa" (leia guia_de_criacao + ver_lead e monte o site com montar_site; se payload.ajuste, pegue a versão atual com ver_site e aplique payload.observacoes),',
      '"busca" (pedido em texto livre da Reunião da manhã: interprete, use criar_campanha com buscar_agora=true e depois concluir_pedido).',
      'Análise e prévia são marcadas como feitas automaticamente; busca, use concluir_pedido. No fim, devolva um resumo com os links.',
    ].join(' '),
    inputSchema: {},
  }, async () => {
    const { rows } = await q("select r.*, l.data->>'name' as nome from requests r left join leads l on l.id = r.lead_id where r.status = 'pending' order by r.created_at");
    if (!rows.length) return text('Fila vazia. Nada pendente no Radar.');
    return text(rows.map((r) => ({ ...requestRow(r), empresa: r.nome || undefined })));
  });

  server.registerTool('concluir_pedido', {
    description: 'Marca um pedido da fila como feito (ou falhou), com uma nota curta do que foi feito.',
    inputSchema: { id: z.number().int(), resultado: z.string(), falhou: z.boolean().optional() },
  }, async ({ id, resultado, falhou }) => {
    const { rowCount } = await q("update requests set status = $2, result = $3, done_at = now() where id = $1", [id, falhou ? 'failed' : 'done', { nota: resultado }]);
    return rowCount ? text('Pedido atualizado.') : fail('Pedido não encontrado.');
  });

  server.registerTool('criar_campanha', {
    description: 'Cria uma campanha de prospecção no Radar e, se pedido, já dispara o Caçador. Use para atender pedidos do tipo "busca".',
    inputSchema: {
      nome: z.string().describe('Curto, ex.: "Clínicas de estética · Sorocaba"'),
      busca: z.string().describe('Termo para o Google Maps, ex.: "clínica de estética em Sorocaba"'),
      cidade: z.string(),
      segmento: z.enum(Object.keys(CATEGORIES)).optional(),
      filtros: z.array(z.string()).optional().describe('Ex.: "Sem site", "Nota ≥ 4,5", "Com WhatsApp"'),
      buscar_agora: z.boolean().optional(),
      profundidade: z.number().int().min(3).max(30).optional().describe('Rolagem na lista do Maps: 10 normal, 20 completa'),
      raio_km: z.number().int().min(3).max(200).optional(),
      min_avaliacoes: z.number().int().min(0).max(500).optional().describe('Padrão 5. Menos que isso costuma ser negócio pequeno demais.'),
      nota_minima: z.number().min(0).max(5).optional().describe('Padrão 4,0'),
      motor: z.enum(['google', 'osm', 'cnpj']).optional().describe('google (padrão, mais dados), osm (gratuito) ou cnpj (empresas ativas do ramo na Receita Federal, inclusive fora do Maps; precisa da base importada)'),
    },
  }, async ({ nome, busca, cidade, segmento, filtros = [], buscar_agora, motor = 'google', profundidade = 10, raio_km = 30, min_avaliacoes = 5, nota_minima = 4 }) => {
    const { rows } = await q('insert into campaigns(data) values ($1) returning id', [{ name: nome, query: busca, city: cidade, category: segmento, filters: filtros, depth: profundidade, radiusKm: raio_km, variants: 5, minReviews: min_avaliacoes, minRating: nota_minima, status: 'running', variantA: '', variantB: '' }]);
    const id = rows[0].id;
    let busca_status = 'não iniciada';
    if (buscar_agora) {
      try { await hunt({ id, name: nome, query: busca, city: cidade, category: segmento, depth: profundidade, radiusKm: raio_km, variants: 5, minReviews: min_avaliacoes, minRating: nota_minima }, { engine: motor, log: (t) => logActivity('cacador', t) }); busca_status = 'rodando (leva alguns minutos; acompanhe com status_busca)'; } catch (e) { busca_status = `não iniciou: ${e.message}`; }
    }
    return text({ campanha_id: id, busca: busca_status });
  });

  server.registerTool('limpar_campanha', {
    description: 'Remove da campanha os leads ainda não abordados que estão fora do segmento (ex.: espaço de eventos numa campanha de planejados) ou abaixo da qualidade mínima (poucas avaliações, nota baixa, sem telefone).',
    inputSchema: { campanha_id: z.number().int() },
  }, async ({ campanha_id }) => {
    const { rows } = await q('select * from campaigns where id = $1', [campanha_id]);
    if (!rows[0]) return fail('Campanha não existe.');
    return text(await cleanCampaign(rows[0].id, rows[0].data));
  });

  server.registerTool('status_busca', {
    description: 'Mostra o andamento da busca do Caçador de uma campanha.',
    inputSchema: { campanha_id: z.number().int() },
  }, async ({ campanha_id }) => text(huntStatus(campanha_id) || { state: 'idle' }));

  return server;
}

function tokenOk(given) {
  const want = process.env.MCP_TOKEN || '';
  if (want.length < 24) return false; // sem token forte, o MCP fica desligado
  const a = Buffer.from(String(given)); const b = Buffer.from(want);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function registerMcp(app) {
  const handler = async (req, reply) => {
    const bearer = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    if (!tokenOk(req.params.token || bearer)) return reply.code(404).send({ error: 'Não encontrado.' });
    if (req.method !== 'POST') return reply.code(405).header('allow', 'POST').send({ jsonrpc: '2.0', error: { code: -32000, message: 'Use POST.' }, id: null });
    reply.hijack();
    const server = buildServer();
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    reply.raw.on('close', () => { transport.close(); server.close(); });
    await server.connect(transport);
    await transport.handleRequest(req.raw, reply.raw, req.body);
  };
  app.route({ method: ['GET', 'POST', 'DELETE'], url: '/mcp/:token', handler });
  app.route({ method: ['GET', 'POST', 'DELETE'], url: '/mcp', handler });
}
