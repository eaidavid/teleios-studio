// Servidor do Teleios Radar: API, MCP, painel e páginas-prévia públicas.
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import fstatic from '@fastify/static';
import { migrate, q } from './db.js';
import { ensureAdmin, guard, registerAuth } from './auth.js';
import { registerRoutes } from './routes.js';
import { registerMcp } from './mcp.js';
import { resume as resumeWhatsapp } from './whatsapp.js';
import { resumeHunts } from './cacador.js';
import { logActivity } from './routes.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const DIST = process.env.WEB_DIST || path.resolve(here, '../../web/dist');

const app = Fastify({ logger: { level: process.env.LOG_LEVEL || 'info' }, bodyLimit: 4 * 1024 * 1024, trustProxy: true });
await app.register(cookie);
guard(app);
registerAuth(app);
registerRoutes(app);
registerMcp(app);

/* Página-prévia pública: HTML próprio (escrito pelo Claude) ou o construtor */
app.get('/p/:slug', async (req, reply) => {
  const { rows } = await q('select html from sites where slug = $1', [req.params.slug]);
  if (!rows[0]) return reply.code(404).type('text/html').send('<h1 style="font-family:sans-serif">Prévia não encontrada</h1>');
  reply.header('x-robots-tag', 'noindex');
  if (rows[0].html) return reply.type('text/html').header('content-security-policy', "script-src 'none'").send(rows[0].html);
  return reply.type('text/html').send(await readFile(path.join(DIST, 'previa.html'), 'utf8'));
});

if (existsSync(DIST)) {
  await app.register(fstatic, { root: DIST, index: ['index.html'] });
} else {
  app.log.warn(`Painel não encontrado em ${DIST}. Rode "npm run build" em radar/web.`);
}

await migrate();
await ensureAdmin();
await resumeWhatsapp();
resumeHunts((t) => logActivity('cacador', t)).catch(() => {});
await app.listen({ host: '0.0.0.0', port: Number(process.env.PORT) || 3000 });
