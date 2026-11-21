// WhatsApp do número comercial (Baileys: conecta como "aparelho conectado", igual ao WhatsApp Web).
// Envio com ritmo humano: limite diário, intervalo aleatório, só em horário comercial,
// para no primeiro "não" e passa a conversa para você quando o lead responde.
import { mkdirSync } from 'node:fs';
import pino from 'pino';
import QRCode from 'qrcode';
import makeWASocket, { DisconnectReason, fetchLatestBaileysVersion, useMultiFileAuthState, Browsers } from '@whiskeysockets/baileys';
import { q, kvGet, kvSet, leadRow } from './db.js';
import { seedSettings } from '../../web/src/data/seed.js';

const AUTH_DIR = process.env.WA_AUTH_DIR || '/data/wa-auth';
const log = pino({ level: 'warn' });

const wa = { sock: null, state: 'off', qr: null, number: null, error: null, nextAt: 0 };
export const waStatus = () => ({ state: wa.state, qr: wa.qr, number: wa.number, error: wa.error, nextAt: wa.nextAt || null });

/* ---------- números ---------- */
export function toDigits(phone) {
  let d = String(phone || '').replace(/\D/g, '');
  if (d.startsWith('0')) d = d.replace(/^0+/, '');
  if (d.length === 10 || d.length === 11) d = `55${d}`;
  return d;
}
const jidDigits = (jid) => String(jid || '').split('@')[0].split(':')[0];

async function setWaSettings(patch) {
  const s = await kvGet('settings', seedSettings);
  await kvSet('settings', { ...s, whatsapp: { ...s.whatsapp, ...patch } });
}

/* ---------- conexão ---------- */
export async function connect() {
  if (wa.sock && ['connecting', 'qr', 'open'].includes(wa.state)) return waStatus();
  mkdirSync(AUTH_DIR, { recursive: true });
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
  const { version } = await fetchLatestBaileysVersion().catch(() => ({ version: undefined }));
  wa.state = 'connecting'; wa.error = null;
  const sock = makeWASocket({ version, auth: state, logger: log, browser: Browsers.ubuntu('Teleios Radar'), markOnlineOnConnect: false, syncFullHistory: false });
  wa.sock = sock;
  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('connection.update', async (u) => {
    if (u.qr) { wa.state = 'qr'; wa.qr = await QRCode.toDataURL(u.qr, { margin: 1, width: 280 }); }
    if (u.connection === 'open') {
      wa.state = 'open'; wa.qr = null;
      wa.number = jidDigits(sock.user?.id);
      await setWaSettings({ connected: true, number: `+${wa.number}` });
    }
    if (u.connection === 'close') {
      const code = u.lastDisconnect?.error?.output?.statusCode;
      wa.sock = null; wa.qr = null;
      if (code === DisconnectReason.loggedOut) {
        wa.state = 'off'; wa.number = null;
        await setWaSettings({ connected: false, number: '' });
      } else {
        wa.state = 'connecting';
        setTimeout(() => connect().catch((e) => { wa.state = 'error'; wa.error = e.message; }), 4000);
      }
    }
  });
  sock.ev.on('messages.upsert', ({ messages, type }) => {
    if (type !== 'notify') return;
    for (const m of messages) onIncoming(m).catch((e) => log.warn(e));
  });
  return waStatus();
}

export async function logout() {
  try { await wa.sock?.logout(); } catch { /* já desconectado */ }
  wa.sock = null; wa.state = 'off'; wa.qr = null; wa.number = null;
  await setWaSettings({ connected: false, number: '' });
  const { rm } = await import('node:fs/promises');
  await rm(AUTH_DIR, { recursive: true, force: true });
}

/* Ao subir o servidor: reconecta se já havia sessão salva */
export async function resume() {
  const { existsSync } = await import('node:fs');
  if (existsSync(`${AUTH_DIR}/creds.json`)) connect().catch((e) => { wa.state = 'error'; wa.error = e.message; });
  setInterval(() => tick().catch((e) => log.warn(e)), 30e3);
}

/* ---------- conversa ---------- */
async function pushMsg(lead, msg, control) {
  await q(`insert into conversations(lead_id, control, messages) values ($1, coalesce($3, 'bot'), jsonb_build_array($2::jsonb))
           on conflict (lead_id) do update set messages = conversations.messages || jsonb_build_array($2::jsonb), control = coalesce($3, conversations.control)`, [lead, msg, control ?? null]);
}

/* Descobre o JID real do número (alguns celulares antigos não têm o 9) */
async function resolveJid(phone) {
  const d = toDigits(phone);
  if (d.length < 12) throw new Error('Telefone inválido.');
  const [r] = await wa.sock.onWhatsApp(d);
  if (!r?.exists) throw new Error('Esse número não tem WhatsApp.');
  return r;
}

/* Envia agora (respostas suas dentro da conversa) */
export async function sendNow(leadId, text, by = 'Você') {
  if (wa.state !== 'open') throw new Error('WhatsApp desconectado. Conecte em Configurações.');
  const { rows } = await q('select * from leads where id = $1', [leadId]);
  if (!rows[0]) throw new Error('Lead não existe.');
  const lead = leadRow(rows[0]);
  if (lead.blocked) throw new Error(`Não enviado: ${lead.blocked}.`);
  const r = lead.waJid ? { jid: lead.waJid, lid: lead.waLid } : await resolveJid(lead.phone);
  const sent = await wa.sock.sendMessage(r.jid, { text });
  const data = { ...rows[0].data, waJid: r.jid, waLid: r.lid || lead.waLid || null, waSentJid: sent?.key?.remoteJid || null, lastContactAt: Date.now() };
  await q("update leads set data = $2, stage = case when stage = 'found' then 'sent' else stage end, updated_at = now() where id = $1", [leadId, data]);
  await pushMsg(leadId, { t: 'out', by, me: by === 'Você', text, at: Date.now() });
  return { ok: true };
}

async function findLeadByJid(m) {
  const k = m.key;
  const cands = [k.remoteJid, k.remoteJidAlt, k.senderPn, k.participant, k.participantAlt].filter(Boolean);
  for (const j of cands) {
    const { rows } = await q("select * from leads where data->>'waJid' = $1 or data->>'waLid' = $1 or data->>'waSentJid' = $1 limit 1", [j]);
    if (rows[0]) return rows[0];
  }
  for (const j of cands.filter((x) => x.endsWith('@s.whatsapp.net'))) {
    const d = jidDigits(j);
    const tail = d.slice(-8); // compara pelo final (com ou sem o 9)
    const { rows } = await q("select * from leads where regexp_replace(coalesce(data->>'phone',''), '\\D', '', 'g') like '%' || $1 limit 1", [tail]);
    if (rows[0]) return rows[0];
  }
  return null;
}

async function onIncoming(m) {
  if (m.key.fromMe || !m.message || m.key.remoteJid?.endsWith('@g.us') || m.key.remoteJid === 'status@broadcast') return;
  const text = m.message.conversation || m.message.extendedTextMessage?.text || m.message.imageMessage?.caption || (m.message.audioMessage ? '[áudio]' : m.message.imageMessage ? '[imagem]' : '[mensagem]');
  const row = await findLeadByJid(m);
  if (!row) return; // não é lead do Radar: ignora (o WhatsApp do celular continua normal)
  const settings = await kvGet('settings', seedSettings);
  const optOut = String(settings.messages?.optOut || '').split(',').map((x) => x.trim().toLowerCase()).filter(Boolean);
  const isOut = optOut.some((w) => text.toLowerCase().includes(w));
  await pushMsg(row.id, { t: 'in', text, at: Date.now(), intent: isOut ? 'sem_interesse' : undefined }, 'me');
  const data = { ...row.data, lastReplyAt: Date.now(), waLid: row.data.waLid || (m.key.remoteJid?.endsWith('@lid') ? m.key.remoteJid : null) };
  if (isOut) data.blocked = 'Pediu para não ser contatado';
  await q("update leads set data = $2, stage = case when stage in ('found','sent') then 'reply' else stage end, updated_at = now() where id = $1", [row.id, data]);
  await q("delete from outbox where lead_id = $1 and status = 'pending'", [row.id]); // não insiste depois da resposta
  await q('insert into activity(bot, text) values ($1, $2)', ['triagem', `${row.data.name} respondeu${isOut ? ' (pediu para parar)' : ''}; a conversa é sua agora`]);
}

/* ---------- fila de envio com ritmo ---------- */
function inWindow(limits, now = new Date()) {
  const br = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
  const day = br.getDay();
  const hm = br.getHours() * 60 + br.getMinutes();
  const [sh, sm] = String(limits.start || '09:00').split(':').map(Number);
  const [eh, em] = String(limits.end || '18:00').split(':').map(Number);
  return (limits.days || [1, 2, 3, 4, 5]).includes(day) && hm >= sh * 60 + sm && hm < eh * 60 + em;
}

export async function sentTodayCount() {
  const { rows } = await q("select count(*)::int as n from outbox where status = 'sent' and sent_at >= date_trunc('day', now() at time zone 'America/Sao_Paulo') at time zone 'America/Sao_Paulo'");
  return rows[0].n;
}

async function tick() {
  if (wa.state !== 'open' || Date.now() < wa.nextAt) return;
  const settings = await kvGet('settings', seedSettings);
  const limits = settings.limits || seedSettings.limits;
  if (!inWindow(limits)) return;
  if ((await sentTodayCount()) >= (limits.daily || 20)) return;
  const { rows } = await q("select * from outbox where status = 'pending' order by created_at limit 1");
  const item = rows[0];
  if (!item) return;
  try {
    await sendNow(item.lead_id, item.text, item.by || 'Redator');
    await q("update outbox set status = 'sent', sent_at = now() where id = $1", [item.id]);
  } catch (e) {
    await q("update outbox set status = 'failed', error = $2 where id = $1", [item.id, e.message]);
  }
  const min = Number(limits.minInterval) || 3; const max = Math.max(min, Number(limits.maxInterval) || 9);
  wa.nextAt = Date.now() + (min + Math.random() * (max - min)) * 60e3;
}

/* Coloca uma mensagem na fila de envio */
export async function enqueue(leadId, text, by = 'Redator') {
  const { rows } = await q("select 1 from outbox where lead_id = $1 and status = 'pending'", [leadId]);
  if (rows.length) await q("update outbox set text = $2 where lead_id = $1 and status = 'pending'", [leadId, text]);
  else await q('insert into outbox(lead_id, text, by) values ($1, $2, $3)', [leadId, text, by]);
}
