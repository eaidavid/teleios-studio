// Dados oficiais de empresa (Receita Federal, base aberta e gratuita) + decisor (sócio-administrador / titular).
// - Importa só os estados de CNPJ_UFS (padrão GO), empresas ativas.
// - Cruza lead ↔ CNPJ: CNPJ no site → telefone → nome parecido na mesma cidade.
// - Fonte extra de leads: empresas ativas de um ramo (CNAE) numa cidade, mesmo fora do Maps.
// - BrasilAPI cobre consultas avulsas quando há CNPJ e a base ainda não foi importada.
// LGPD: dados públicos de registro; usamos só nome e cargo do decisor para o contato B2B e respeitamos o "não quero contato".
import { createWriteStream, mkdirSync, rmSync, existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';
import { q, kvGet, kvSet } from './db.js';

const DIR = process.env.CNPJ_DIR || '/data/cnpj';
const BASE = process.env.CNPJ_BASE_URL || 'https://arquivos.receitafederal.gov.br/dados/cnpj/dados_abertos_cnpj/';
const UFS = (process.env.CNPJ_UFS || 'GO').split(',').map((x) => x.trim().toUpperCase()).filter(Boolean);

export const CNAES = {
  'Móveis planejados': ['3101200', '4754701', '4330402', '1622699', '3102100'],
  'Clínica de estética': ['9602502'],
  Odontologia: ['8630504'],
  Academia: ['9313100'],
  Restaurante: ['5611201', '5611203'],
  'Pet shop': ['4789004', '9609208', '7500100'],
  Ótica: ['4774100'],
  Advocacia: ['6911701'],
  Barbearia: ['9602501'],
  Fisioterapia: ['8650004'],
  Imobiliária: ['6821801', '6821802'],
};
const QUALIF = { '49': 'Sócio-administrador', '65': 'Titular', '05': 'Administrador', '16': 'Presidente', '22': 'Sócio', '10': 'Diretor', '50': 'Empresário', '54': 'Fundador' };
const PRIORITY = ['49', '65', '05', '16', '10', '50', '22', '54'];
const PORTE = { '00': 'Não informado', '01': 'Microempresa', '03': 'Empresa de pequeno porte', '05': 'Demais' };

export const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/[^A-Z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
const title = (s) => String(s || '').toLowerCase().replace(/(^|\s)(\S)/g, (m, a, b) => a + b.toUpperCase()).replace(/\s(De|Da|Do|Das|Dos|E)\s/g, (m) => m.toLowerCase());
const phoneKey = (p) => { let d = String(p || '').replace(/\D/g, ''); if (d.startsWith('55') && d.length > 11) d = d.slice(2); return d.length >= 10 ? d : null; };

export const SCHEMA = `
create extension if not exists pg_trgm;
create table if not exists cnpj_estab (
  cnpj text primary key, basico text not null, fantasia text, nome_norm text, cnae text, cnae_sec text, mun_code text, municipio text,
  bairro text, endereco text, cep text, uf text, tel1 text, tel2 text, email text, abertura date, matriz boolean
);
create index if not exists cnpj_estab_basico on cnpj_estab(basico);
create index if not exists cnpj_estab_tel1 on cnpj_estab(tel1);
create index if not exists cnpj_estab_tel2 on cnpj_estab(tel2);
create index if not exists cnpj_estab_mun on cnpj_estab(municipio);
create index if not exists cnpj_estab_cnae on cnpj_estab(cnae);
create index if not exists cnpj_estab_nome_trgm on cnpj_estab using gin (nome_norm gin_trgm_ops);
create table if not exists cnpj_emp (basico text primary key, razao text, razao_norm text, natureza text, capital numeric, porte text);
create index if not exists cnpj_emp_razao_trgm on cnpj_emp using gin (razao_norm gin_trgm_ops);
create table if not exists cnpj_socio (basico text, nome text, qualif text, entrada text);
create index if not exists cnpj_socio_basico on cnpj_socio(basico);
create table if not exists cnpj_cnae (code text primary key, descr text);
`;

/* ---------- importação da base aberta ---------- */
const job = { state: 'idle' };
export const importStatus = async () => ({ ...job, last: await kvGet('cnpj:last', null), ufs: UFS });

const splitLine = (line) => line.replace(/^"|"\s*$/g, '').split('";"');

async function latestFolder() {
  const r = await fetch(BASE, { signal: AbortSignal.timeout(30000) });
  if (!r.ok) throw new Error(`Receita respondeu HTTP ${r.status} em ${BASE}`);
  const html = await r.text();
  const months = [...html.matchAll(/href="(\d{4}-\d{2})\/?"/g)].map((m) => m[1]).sort();
  if (!months.length) throw new Error('Não encontrei as pastas mensais da base do CNPJ.');
  return `${BASE}${months[months.length - 1]}/`;
}

async function download(url, file) {
  const r = await fetch(url, { signal: AbortSignal.timeout(60 * 60e3) });
  if (!r.ok) throw new Error(`Download falhou (${r.status}): ${url}`);
  await pipeline(Readable.fromWeb(r.body), createWriteStream(file));
}

async function eachLine(zipFile, onLine) {
  const child = spawn('unzip', ['-p', zipFile]);
  child.stdout.setEncoding('latin1');
  const rl = createInterface({ input: child.stdout, crlfDelay: Infinity });
  for await (const line of rl) if (line) await onLine(splitLine(line));
  await new Promise((res) => child.on('close', res));
}

async function batchInsert(table, cols, rows, conflict = 'do nothing') {
  if (!rows.length) return;
  const params = []; const values = rows.map((r) => `(${r.map((v) => { params.push(v); return `$${params.length}`; }).join(',')})`);
  await q(`insert into ${table}(${cols.join(',')}) values ${values.join(',')} on conflict ${conflict}`, params);
}

export async function importCnpj(log = () => {}) {
  if (job.state === 'running') throw new Error('A importação já está rodando.');
  Object.assign(job, { state: 'running', step: 'procurando a base mais recente', startedAt: Date.now(), estab: 0, socios: 0, error: null });
  (async () => {
    try {
      mkdirSync(DIR, { recursive: true });
      const folder = await latestFolder();
      job.folder = folder;
      await q(SCHEMA);
      await q('truncate cnpj_estab, cnpj_emp, cnpj_socio');
      const tmp = `${DIR}/tmp.zip`;
      const basicos = new Set();

      // Estabelecimentos (filtra UF e situação ativa = 02)
      for (let i = 0; i < 10; i++) {
        job.step = `estabelecimentos ${i + 1}/10: baixando`; await download(`${folder}Estabelecimentos${i}.zip`, tmp);
        job.step = `estabelecimentos ${i + 1}/10: lendo`;
        let buf = [];
        await eachLine(tmp, async (f) => {
          if (f.length < 28 || !UFS.includes(f[19]) || f[5] !== '02') return;
          const cnpj = `${f[0]}${f[1]}${f[2]}`;
          basicos.add(f[0]);
          const ab = /^\d{8}$/.test(f[10]) ? `${f[10].slice(0, 4)}-${f[10].slice(4, 6)}-${f[10].slice(6, 8)}` : null;
          buf.push([cnpj, f[0], f[4] || null, norm(f[4]), f[11], f[12] || null, f[20], null, f[17] || null, [f[13], f[14], f[15], f[16]].filter(Boolean).join(' ') || null, f[18] || null, f[19],
            f[21] && f[22] ? `${f[21]}${f[22]}`.replace(/\D/g, '') : null, f[23] && f[24] ? `${f[23]}${f[24]}`.replace(/\D/g, '') : null, (f[27] || '').toLowerCase() || null, ab, f[3] === '1']);
          if (buf.length >= 500) { const b = buf; buf = []; await batchInsert('cnpj_estab', ['cnpj', 'basico', 'fantasia', 'nome_norm', 'cnae', 'cnae_sec', 'mun_code', 'municipio', 'bairro', 'endereco', 'cep', 'uf', 'tel1', 'tel2', 'email', 'abertura', 'matriz'], b); job.estab += b.length; }
        });
        if (buf.length) { await batchInsert('cnpj_estab', ['cnpj', 'basico', 'fantasia', 'nome_norm', 'cnae', 'cnae_sec', 'mun_code', 'municipio', 'bairro', 'endereco', 'cep', 'uf', 'tel1', 'tel2', 'email', 'abertura', 'matriz'], buf); job.estab += buf.length; }
        rmSync(tmp, { force: true });
      }
      // Empresas (razão social, porte, capital)
      for (let i = 0; i < 10; i++) {
        job.step = `empresas ${i + 1}/10`; await download(`${folder}Empresas${i}.zip`, tmp);
        let buf = [];
        await eachLine(tmp, async (f) => {
          if (!basicos.has(f[0])) return;
          buf.push([f[0], f[1], norm(f[1]), f[2], Number(String(f[4] || '0').replace(',', '.')) || 0, f[5]]);
          if (buf.length >= 500) { const b = buf; buf = []; await batchInsert('cnpj_emp', ['basico', 'razao', 'razao_norm', 'natureza', 'capital', 'porte'], b); }
        });
        if (buf.length) await batchInsert('cnpj_emp', ['basico', 'razao', 'razao_norm', 'natureza', 'capital', 'porte'], buf);
        rmSync(tmp, { force: true });
      }
      // Sócios (só nome, qualificação e data de entrada)
      for (let i = 0; i < 10; i++) {
        job.step = `sócios ${i + 1}/10`; await download(`${folder}Socios${i}.zip`, tmp);
        let buf = [];
        await eachLine(tmp, async (f) => {
          if (!basicos.has(f[0]) || f[1] === '1') return; // 1 = sócio pessoa jurídica
          buf.push([f[0], title(f[2]), f[4], f[5]]);
          if (buf.length >= 1000) { const b = buf; buf = []; await batchInsert('cnpj_socio', ['basico', 'nome', 'qualif', 'entrada'], b); job.socios += b.length; }
        });
        if (buf.length) { await batchInsert('cnpj_socio', ['basico', 'nome', 'qualif', 'entrada'], buf); job.socios += buf.length; }
        rmSync(tmp, { force: true });
      }
      // Municípios e CNAEs (tabelas de nomes)
      job.step = 'municípios e atividades';
      await download(`${folder}Municipios.zip`, tmp);
      const muns = [];
      await eachLine(tmp, async (f) => { muns.push([f[0], f[1]]); });
      for (let k = 0; k < muns.length; k += 500) {
        const part = muns.slice(k, k + 500);
        const params = []; const vals = part.map(([c, n]) => { params.push(c, norm(n)); return `($${params.length - 1}, $${params.length})`; });
        await q(`update cnpj_estab e set municipio = v.n from (values ${vals.join(',')}) as v(c, n) where e.mun_code = v.c`, params);
      }
      await download(`${folder}Cnaes.zip`, tmp);
      const cn = [];
      await eachLine(tmp, async (f) => { cn.push([f[0], f[1]]); });
      for (let k = 0; k < cn.length; k += 500) await batchInsert('cnpj_cnae', ['code', 'descr'], cn.slice(k, k + 500), '(code) do update set descr = excluded.descr');
      rmSync(tmp, { force: true });
      await kvSet('cnpj:last', { at: Date.now(), folder, estab: job.estab, socios: job.socios, ufs: UFS });
      Object.assign(job, { state: 'done', step: 'concluído', endedAt: Date.now() });
      log(`base do CNPJ importada: ${job.estab.toLocaleString('pt-BR')} empresas ativas (${UFS.join(', ')})`);
    } catch (e) {
      Object.assign(job, { state: 'error', step: e.message, error: e.message, endedAt: Date.now() });
      log(`falhou ao importar a base do CNPJ: ${e.message}`);
    }
  })();
  return importStatus();
}

const baseReady = async () => {
  try { const { rows } = await q('select 1 from cnpj_estab limit 1'); return rows.length > 0; } catch { return false; }
};

/* ---------- decisor ---------- */
function pickDecisor(socios = [], razao = '', natureza = '') {
  const sorted = [...socios].sort((a, b) => PRIORITY.indexOf(String(a.qualif).padStart(2, '0')) - PRIORITY.indexOf(String(b.qualif).padStart(2, '0')));
  const s = sorted.find((x) => PRIORITY.includes(String(x.qualif).padStart(2, '0'))) || sorted[0];
  if (s) return { nome: title(s.nome), cargo: QUALIF[String(s.qualif).padStart(2, '0')] || 'Sócio', fonte: 'Receita Federal (quadro societário)' };
  // Empresário individual / MEI: o nome da pessoa está na razão social ("12.345.678 FULANO DE TAL")
  if (/^(2135|2305)/.test(String(natureza)) || /^\d[\d.]{6,}\s/.test(razao)) {
    const nome = razao.replace(/^[\d.\s-]+/, '').replace(/\s+\d+$/, '').trim();
    if (nome.split(' ').length >= 2) return { nome: title(nome), cargo: 'Titular', fonte: 'Receita Federal (empresário individual)' };
  }
  return null;
}

/* ---------- consulta ---------- */
async function fromBase(cnpj) {
  const { rows } = await q(`select e.*, m.razao, m.natureza, m.capital, m.porte, c.descr as cnae_desc
    from cnpj_estab e left join cnpj_emp m on m.basico = e.basico left join cnpj_cnae c on c.code = e.cnae where e.cnpj = $1`, [cnpj]);
  const r = rows[0];
  if (!r) return null;
  const socios = (await q('select nome, qualif from cnpj_socio where basico = $1', [r.basico])).rows;
  const abertura = r.abertura ? new Date(r.abertura) : null;
  return {
    company: {
      cnpj, razao: r.razao ? title(r.razao) : null, fantasia: r.fantasia ? title(r.fantasia) : null, cnae: r.cnae, cnaeDesc: r.cnae_desc,
      abertura: abertura ? abertura.toISOString().slice(0, 10) : null, idadeAnos: abertura ? Math.floor((Date.now() - abertura) / 3.156e10) : null,
      porte: PORTE[r.porte] || null, mei: /^\d[\d.]{6,}\s/.test(r.razao || ''), capital: Number(r.capital) || null, email: r.email,
      telefones: [r.tel1, r.tel2].filter(Boolean), endereco: r.endereco, bairro: r.bairro, municipio: r.municipio, fonte: 'Receita Federal',
    },
    decisor: pickDecisor(socios, r.razao || '', r.natureza || ''),
  };
}

async function fromBrasilApi(cnpj) {
  try {
    const r = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`, { signal: AbortSignal.timeout(15000) });
    if (!r.ok) return null;
    const j = await r.json();
    const abertura = j.data_inicio_atividade ? new Date(j.data_inicio_atividade) : null;
    const socios = (j.qsa || []).map((s) => ({ nome: s.nome_socio, qualif: String(s.codigo_qualificacao_socio || '').padStart(2, '0') }));
    return {
      company: {
        cnpj, razao: title(j.razao_social), fantasia: j.nome_fantasia ? title(j.nome_fantasia) : null, cnae: String(j.cnae_fiscal || ''), cnaeDesc: j.cnae_fiscal_descricao,
        abertura: j.data_inicio_atividade || null, idadeAnos: abertura ? Math.floor((Date.now() - abertura) / 3.156e10) : null,
        porte: j.porte || null, mei: !!j.opcao_pelo_mei, capital: Number(j.capital_social) || null, email: (j.email || '').toLowerCase() || null,
        telefones: [j.ddd_telefone_1, j.ddd_telefone_2].map((t) => String(t || '').replace(/\D/g, '')).filter(Boolean),
        situacao: j.descricao_situacao_cadastral, municipio: j.municipio, fonte: 'Receita Federal (BrasilAPI)',
      },
      decisor: pickDecisor(socios, j.razao_social || '', String(j.codigo_natureza_juridica || '')),
    };
  } catch { return null; }
}

/* Descobre o CNPJ de um lead e devolve { company, decisor, match } */
export async function lookupLead(lead) {
  const known = lead.company?.cnpj || lead.siteAudit?.cnpj;
  if (known) {
    const r = (await baseReady() && await fromBase(known)) || await fromBrasilApi(known);
    if (r) return { ...r, match: lead.company?.cnpj ? 'cnpj' : 'cnpj no site' };
  }
  if (!(await baseReady())) return null;
  const tel = phoneKey(lead.phone);
  if (tel) {
    const { rows } = await q('select cnpj from cnpj_estab where tel1 = $1 or tel2 = $1 limit 2', [tel]);
    if (rows.length === 1) { const r = await fromBase(rows[0].cnpj); if (r) return { ...r, match: 'telefone' }; }
  }
  const city = norm(lead.city);
  const name = norm(lead.brandName || lead.name);
  if (city && name.length >= 4) {
    const { rows } = await q(`select e.cnpj, greatest(similarity(e.nome_norm, $1), similarity(coalesce(m.razao_norm, ''), $1)) as sim
      from cnpj_estab e left join cnpj_emp m on m.basico = e.basico
      where e.municipio = $2 and (e.nome_norm % $1 or m.razao_norm % $1) order by sim desc limit 2`, [name, city]);
    if (rows[0] && rows[0].sim >= 0.5 && (!rows[1] || rows[0].sim - rows[1].sim > 0.08)) {
      const r = await fromBase(rows[0].cnpj); if (r) return { ...r, match: `nome (${Math.round(rows[0].sim * 100)}%)` };
    }
  }
  return null;
}

/* Fonte extra de leads: empresas ativas do ramo na cidade (fora do Maps também) */
export async function searchByCnae(category, city, limit = 300) {
  if (!(await baseReady())) throw new Error('A base do CNPJ ainda não foi importada (Configurações → Dados de empresas).');
  const codes = CNAES[category];
  if (!codes) throw new Error('Esse segmento ainda não tem atividades (CNAE) mapeadas.');
  const { rows } = await q(`select e.cnpj from cnpj_estab e where e.municipio = $1 and (e.cnae = any($2) or exists (select 1 from unnest(string_to_array(coalesce(e.cnae_sec, ''), ',')) s where s = any($2)))
    and (e.tel1 is not null or e.tel2 is not null) order by e.abertura desc nulls last limit $3`, [norm(city), codes, limit]);
  const out = [];
  for (const r of rows) { const x = await fromBase(r.cnpj); if (x) out.push(x); }
  return out;
}
