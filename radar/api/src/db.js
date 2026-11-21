// Banco de dados (Postgres). Cada coleção guarda o objeto completo em JSONB,
// com colunas de índice para o que precisa de filtro. Assim o formato do painel
// pode evoluir sem migração a cada mudança.
import pg from 'pg';

export const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 10 });
export const q = (text, params) => pool.query(text, params);

const SCHEMA = `
create table if not exists users (
  id serial primary key,
  email text unique not null,
  name text not null default '',
  password_hash text not null,
  role text not null default 'admin',
  created_at timestamptz not null default now()
);
create table if not exists sessions (
  token text primary key,
  user_id int not null references users(id) on delete cascade,
  expires_at timestamptz not null
);
create table if not exists leads (
  id serial primary key,
  stage text not null default 'found',
  campaign_id int,
  place_key text unique,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists leads_stage_idx on leads(stage);
create table if not exists campaigns (
  id serial primary key,
  data jsonb not null,
  created_at timestamptz not null default now()
);
create table if not exists sites (
  id serial primary key,
  lead_id int not null references leads(id) on delete cascade,
  slug text unique not null,
  data jsonb not null,
  direction jsonb,
  html text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists sites_lead_idx on sites(lead_id);
create table if not exists conversations (
  lead_id int primary key references leads(id) on delete cascade,
  control text not null default 'bot',
  messages jsonb not null default '[]'
);
create table if not exists kv (
  key text primary key,
  value jsonb not null
);
create table if not exists requests (
  id serial primary key,
  kind text not null,
  lead_id int references leads(id) on delete cascade,
  payload jsonb not null default '{}',
  status text not null default 'pending',
  result jsonb,
  created_at timestamptz not null default now(),
  done_at timestamptz
);
create index if not exists requests_status_idx on requests(status);
create table if not exists activity (
  id serial primary key,
  bot text not null,
  text text not null,
  at timestamptz not null default now()
);
`;

export async function migrate() {
  await q(SCHEMA);
}

/* Converte uma linha em objeto do painel */
export const leadRow = (r) => ({ ...r.data, id: r.id, stage: r.stage, campaign: r.campaign_id, createdAt: new Date(r.created_at).getTime() });
export const siteRow = (r) => ({ id: r.id, lead: r.lead_id, slug: r.slug, data: r.data, direction: r.direction, html: r.html || undefined, sent: r.sent_at ? new Date(r.sent_at).getTime() : undefined });

export async function kvGet(key, fallback) {
  const { rows } = await q('select value from kv where key = $1', [key]);
  return rows[0] ? rows[0].value : fallback;
}
export async function kvSet(key, value) {
  await q('insert into kv(key, value) values ($1, $2) on conflict (key) do update set value = excluded.value', [key, JSON.stringify(value)]);
}

export const requestRow = (r) => ({ id: r.id, kind: r.kind, lead: r.lead_id, payload: r.payload, status: r.status, result: r.result, createdAt: new Date(r.created_at).getTime(), doneAt: r.done_at ? new Date(r.done_at).getTime() : null });

/* Fecha os pedidos pendentes de um tipo para um lead (ex.: prévia criada) */
export async function completeRequests(kind, lead, result) {
  await q("update requests set status = 'done', result = $3, done_at = now() where kind = $1 and lead_id = $2 and status = 'pending'", [kind, lead, result || {}]);
}
