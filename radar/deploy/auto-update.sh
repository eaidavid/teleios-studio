#!/usr/bin/env bash
# Atualização automática do Teleios Radar (autorizada pelo David).
# A cada 5 minutos confere a branch "main" no GitHub; se houver versão nova, roda o instalador.
# Só entra no ar o que foi mesclado na main (aprovado no GitHub).
# Instalado pelo install.sh em /etc/cron.d/teleios-radar. Log: /var/log/teleios-radar-update.log
# Para desligar: rm /etc/cron.d/teleios-radar
set -uo pipefail
DIR=/opt/teleios-radar
BRANCH="$(cat "$DIR/.radar-branch" 2>/dev/null || echo main)"
exec 9>/var/lock/teleios-radar-update.lock
flock -n 9 || exit 0
cd "$DIR" || exit 0
git fetch -q origin "$BRANCH" || exit 0
[ "$(git rev-parse HEAD)" = "$(git rev-parse FETCH_HEAD)" ] && exit 0
echo "$(date '+%F %T') nova versão $(git rev-parse --short FETCH_HEAD) em $BRANCH: atualizando"
if BRANCH="$BRANCH" bash "$DIR/radar/deploy/install.sh" </dev/null >/dev/null 2>&1; then
  echo "$(date '+%F %T') atualizado"
else
  echo "$(date '+%F %T') falhou; rode o instalador à mão para ver o erro"
fi
