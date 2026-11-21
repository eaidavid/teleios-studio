// "MD para o Claude": tudo que o Webdesigner precisa, mastigado, num Markdown só.
import { autoSpec } from './autospec.js';

const line = (k, v) => (v !== undefined && v !== null && String(v).trim() !== '' ? `- **${k}:** ${v}\n` : '');

export function briefMd(lead, { site, direction, notes } = {}) {
  const name = lead.brandName || lead.name;
  const a = lead.analysis || {};
  const photos = [...(lead.gallery || []), ...(lead.sitePhotos || [])];
  const spec = autoSpec(lead, direction || site?.direction || {});
  let md = `# Prévia de site · ${name}\n\n`;
  md += `> Use o conector **Radar Teleios**. Passos: 1) \`guia_de_criacao({tipo:"previa"})\` 2) \`ver_lead({id:${lead.id}})\` 3) melhore o rascunho abaixo `
    + `(conceito, textos específicos, ordem e momento assinatura) 4) \`montar_site\` com \`lead_id: ${lead.id}\` 5) passe pela rubrica e me mande o link, o conceito e as notas.\n`
    + `> Meta: **pronto para venda na primeira versão**, nível do site da Agência Teleios. Nada inventado, nada genérico.\n\n`;
  md += `## Empresa\n${line('Nome', name)}${line('Nome no Google', lead.name !== name ? lead.name : '')}${line('Segmento', lead.category)}${line('Categoria no Google', lead.googleCategory)}`
    + `${line('Cidade / bairro', [lead.city, lead.neighborhood].filter(Boolean).join(' / '))}${line('Endereço', lead.address)}${line('Telefone', lead.phone)}`
    + `${line('Site atual', lead.website)}${line('Instagram', lead.instagram)}${line('Horário', lead.hours)}${line('Faixa de preço', lead.priceRange)}${line('Descrição no Google', lead.about)}`
    + `${line('Google', lead.rating ? `nota ${lead.rating} com ${lead.reviews} avaliações` : '')}${line('Cores da marca', lead.brand?.colors?.join(', '))}${line('Logo', lead.brand?.logo)}\n`;
  if (a.summary || a.gaps?.length) {
    md += `## Análise\n${line('Oportunidade', a.opportunity)}${line('Resumo', a.summary)}${line('Ângulo', a.angle)}`;
    for (const g of (a.gaps || []).slice(0, 4)) md += `- ${g.title} (${g.severity}): ${g.detail}\n`;
    md += '\n';
  }
  if (lead.reviewSamples?.length) {
    md += `## O que os clientes dizem (use para conceito, dores respondidas e depoimentos)\n`;
    for (const r of lead.reviewSamples.slice(0, 6)) md += `- **${r.name}** (${r.rating}★): "${String(r.text).replace(/\s+/g, ' ').slice(0, 280)}"\n`;
    md += '\n';
  }
  md += `## Fotos reais (${photos.length})\n${photos.length ? photos.slice(0, 14).map((u) => `- ${u}`).join('\n') : '- Nenhuma: use topo tipográfico, cartaz e empilhados com símbolo, mais um bloco html autoral.'}\n\n`;
  if (direction || site?.direction || notes) {
    const d = direction || site?.direction || {};
    md += `## Direção escolhida no Radar\n${line('Estilo', d.style)}${line('Movimento', d.motion)}${line('Topo', d.hero)}${line('Objetivo', d.goal)}${line('Seções desejadas', d.sections?.join(', '))}${line('Cores', d.colors?.join(', '))}${line('Observações', d.notes || notes)}\n`;
  }
  md += `## Rascunho do motor (ponto de partida — reescreva os textos com fatos desta empresa)\n\`\`\`json\n${JSON.stringify({ lead_id: lead.id, ...spec }, null, 2)}\n\`\`\`\n`;
  return md;
}
