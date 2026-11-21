// Servidor MCP do Radar. Adicione no claude.ai como conector personalizado:
//   https://radar.agenciateleios.com.br/mcp/<MCP_TOKEN>
// O Claude lê os leads, salva análises e cria a página-prévia; o link sai na hora.
import { timingSafeEqual } from 'node:crypto';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from 'zod';
import { q, leadRow, siteRow, requestRow, completeRequests } from './db.js';
import { hunt, huntStatus } from './cacador.js';
import { enqueue, waStatus } from './whatsapp.js';
import { kvGet, kvSet } from './db.js';
import { seedSettings as defaults } from '../../web/src/data/seed.js';
import { CATEGORIES } from '../../web/src/data/seed.js';
import { getLead, patchLead, upsertSite, previewUrl, logActivity } from './routes.js';
import { STAGES } from '../../web/src/data/seed.js';
import { BLOCKS, HEROES, FOOTERS, FONTS, RADIUS, ANIMS, TEXTS, STYLES, MOTIONS, GOALS, generateDesign } from '../../web/src/sites/generator.js';
import { derivePalettes } from '../../web/src/sites/colors.js';

const text = (v) => ({ content: [{ type: 'text', text: typeof v === 'string' ? v : JSON.stringify(v, null, 2) }] });
const fail = (m) => ({ content: [{ type: 'text', text: m }], isError: true });
const STAGE_IDS = STAGES.map((s) => s.id);

const brief = (l) => ({
  id: l.id, nome: l.name, categoria: l.category, cidade: l.city, bairro: l.neighborhood, etapa: l.stage,
  nota: l.rating, avaliacoes: l.reviews, site: l.website || null, instagram: l.instagram || null,
  oportunidade: l.analysis?.opportunity ?? null,
});

function buildServer() {
  const server = new McpServer({ name: 'teleios-radar', version: '1.0.0' }, { instructions: 'Radar de prospecção da Agência Teleios. Quando o usuário pedir para fazer os pedidos/a fila do Radar, chame ver_fila e atenda cada pedido. Escreva em português do Brasil, tom próximo e direto.' });

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
    return text({ ...l, previa: rows[0] ? { ...siteRow(rows[0]), url: previewUrl(rows[0].slug) } : null });
  });

  server.registerTool('salvar_analise', {
    description: 'Grava a sua análise do lead no Radar (aparece na aba Análise). Envie só o que quiser atualizar.',
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

  server.registerTool('catalogo_construtor', {
    description: 'Mostra as opções do construtor de sites do Radar (estilos, topos, seções e variantes, rodapés, fontes, animações). Consulte antes de montar o campo "design" de criar_previa.',
    inputSchema: {},
  }, async () => text({
    estilos: STYLES, movimento: MOTIONS, objetivos: GOALS, topos: HEROES, rodapes: FOOTERS, fontes: Object.fromEntries(Object.entries(FONTS).map(([k, f]) => [k, f.label])),
    cantos: RADIUS, animacoes_de_bloco: ANIMS, animacoes_de_texto: TEXTS,
    secoes: Object.fromEntries(Object.entries(BLOCKS).map(([k, b]) => [k, { nome: b.label, variantes: b.variants }])),
    paletas: 'Geradas a partir das cores da marca: clara, suave, escura, forte, neutra. Passe "cores" e escolha "paleta".',
    dica: 'Para um site totalmente livre, envie "html" com a página completa (HTML + CSS inline, responsivo, sem scripts externos além de fontes do Google).',
  }));

  server.registerTool('criar_previa', {
    description: [
      'Cria ou atualiza o site-prévia de um lead e devolve o LINK PÚBLICO para mandar à empresa.',
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

  server.registerTool('listar_previas', {
    description: 'Lista os sites-prévia criados, com o link de cada um.',
    inputSchema: {},
  }, async () => {
    const { rows } = await q("select s.slug, s.lead_id, s.sent_at, s.updated_at, l.data->>'name' as nome from sites s join leads l on l.id = s.lead_id order by s.updated_at desc limit 100");
    return text(rows.map((r) => ({ lead_id: r.lead_id, empresa: r.nome, link: previewUrl(r.slug), enviada: !!r.sent_at })));
  });

  server.registerTool('preparar_mensagem', {
    description: [
      'Prepara a PRIMEIRA mensagem de WhatsApp para um lead (use depois de criar a prévia; inclua o link dela).',
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
      '"previa" (crie o site-prévia com criar_previa; leia ver_lead antes e use as cores da marca; siga payload.observacoes se houver),',
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
      motor: z.enum(['google', 'osm']).optional().describe('google (padrão, mais dados) ou osm (gratuito)'),
    },
  }, async ({ nome, busca, cidade, segmento, filtros = [], buscar_agora, motor = 'google' }) => {
    const { rows } = await q('insert into campaigns(data) values ($1) returning id', [{ name: nome, query: busca, city: cidade, category: segmento, filters: filtros, status: 'running', variantA: '', variantB: '' }]);
    const id = rows[0].id;
    let busca_status = 'não iniciada';
    if (buscar_agora) {
      try { await hunt({ id, name: nome, query: busca, city: cidade, category: segmento }, { engine: motor, log: (t) => logActivity('cacador', t) }); busca_status = 'rodando (leva alguns minutos; acompanhe com status_busca)'; } catch (e) { busca_status = `não iniciou: ${e.message}`; }
    }
    return text({ campanha_id: id, busca: busca_status });
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
