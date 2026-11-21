#!/usr/bin/env bash
# Instala ou atualiza o Teleios Radar na VPS (ao lado do Coolify).
# Uso: curl -fsSL https://raw.githubusercontent.com/eaidavid/teleios-studio/<branch>/radar/deploy/install.sh | bash
# Rodar de novo é seguro: atualiza o código e mantém senhas e banco.
set -euo pipefail

BRANCH="${BRANCH:-ccr-aa220f15-9xp90c}"
DOMAIN="${DOMAIN:-radar.agenciateleios.com.br}"
ADMIN_EMAIL="${ADMIN_EMAIL:-eaidaviddev@gmail.com}"
DIR=/opt/teleios-radar
REPO=https://github.com/eaidavid/teleios-studio.git

say() { printf '\n\033[1;32m==> %s\033[0m\n' "$*"; }

command -v git >/dev/null || { say "Instalando git"; apt-get update -qq && apt-get install -y -qq git; }
command -v docker >/dev/null || { echo "Docker não encontrado. Este servidor deveria ter o Coolify."; exit 1; }

say "Baixando o código ($BRANCH)"
if [ -d "$DIR/.git" ]; then
  git -C "$DIR" fetch -q origin "$BRANCH" && git -C "$DIR" checkout -q -B "$BRANCH" FETCH_HEAD
else
  git clone -q --depth 1 -b "$BRANCH" "$REPO" "$DIR"
fi
cd "$DIR/radar"

NEW_ENV=0
if [ ! -f .env ]; then
  say "Gerando senhas e token (ficam só neste servidor, em $DIR/radar/.env)"
  cat > .env <<ENV
POSTGRES_PASSWORD=$(openssl rand -hex 24)
ADMIN_EMAIL=$ADMIN_EMAIL
ADMIN_PASSWORD=$(openssl rand -base64 18 | tr -d '/+=' | cut -c1-16)
MCP_TOKEN=$(openssl rand -hex 24)
PUBLIC_URL=https://$DOMAIN
PREVIEW_URL=https://$DOMAIN/p
ENV
  chmod 600 .env
  NEW_ENV=1
fi

say "Ligando ao proxy do Coolify (HTTPS automático)"
CMD="$(docker inspect coolify-proxy --format '{{join .Config.Cmd " "}}' 2>/dev/null || true)"
EP_HTTPS="$(grep -oE 'entrypoints\.[a-z0-9_-]+\.address=:443' <<<"$CMD" | head -1 | cut -d. -f2)"; EP_HTTPS="${EP_HTTPS:-https}"
EP_HTTP="$(grep -oE 'entrypoints\.[a-z0-9_-]+\.address=:80\b' <<<"$CMD" | head -1 | cut -d. -f2)"; EP_HTTP="${EP_HTTP:-http}"
RESOLVER="$(grep -oE 'certificatesresolvers\.[a-z0-9_-]+\.' <<<"$CMD" | head -1 | cut -d. -f2)"; RESOLVER="${RESOLVER:-letsencrypt}"
docker network inspect coolify >/dev/null 2>&1 || docker network create coolify >/dev/null
echo "entrada https: $EP_HTTPS · http: $EP_HTTP · certificados: $RESOLVER"

cat > docker-compose.vps.yml <<YML
services:
  radar:
    networks: [default, coolify]
    labels:
      - traefik.enable=true
      - traefik.docker.network=coolify
      - traefik.http.routers.radar.rule=Host(\`$DOMAIN\`)
      - traefik.http.routers.radar.entrypoints=$EP_HTTPS
      - traefik.http.routers.radar.tls=true
      - traefik.http.routers.radar.tls.certresolver=$RESOLVER
      - traefik.http.routers.radar-http.rule=Host(\`$DOMAIN\`)
      - traefik.http.routers.radar-http.entrypoints=$EP_HTTP
      - traefik.http.routers.radar-http.middlewares=radar-https
      - traefik.http.middlewares.radar-https.redirectscheme.scheme=https
      - traefik.http.services.radar.loadbalancer.server.port=3000
networks:
  coolify:
    external: true
YML

say "Construindo e subindo (a primeira vez leva alguns minutos)"
docker compose -p teleios-radar -f docker-compose.yml -f docker-compose.vps.yml up -d --build </dev/null

say "Esperando o Radar responder"
for i in $(seq 1 60); do
  if docker compose -p teleios-radar exec -T radar wget -qO- http://localhost:3000/api/health </dev/null >/dev/null 2>&1; then OK=1; break; fi
  sleep 3
done
[ "${OK:-0}" = 1 ] || { echo "O Radar não respondeu. Veja: docker compose -p teleios-radar logs radar --tail 80"; exit 1; }

set -a; . ./.env; set +a
say "Pronto"
echo "Painel:    https://$DOMAIN"
echo "Login:     $ADMIN_EMAIL"
if [ "$NEW_ENV" = 1 ]; then
  echo "Senha:     $ADMIN_PASSWORD   (anote; troque depois em Configurações)"
else
  echo "Senha:     a mesma de antes (está em $DIR/radar/.env)"
fi
echo
echo "Conector do Claude (claude.ai → Configurações → Conectores → Adicionar conector personalizado):"
echo "           https://$DOMAIN/mcp/$MCP_TOKEN"
echo
echo "Esse link é uma senha: não compartilhe."
echo "Se o HTTPS não abrir logo, espere o DNS de '$DOMAIN' propagar; o certificado sai sozinho."
