# Teleios Radar

Sistema interno de prospecção da Agência Teleios: acha empresas, analisa o digital delas com IA,
aborda pelo WhatsApp com ritmo seguro e entrega as respostas quentes para a equipe.

## Estado atual (v0.2 · interface)

`radar/web` é o painel em React (Vite) com **dados de demonstração** guardados no navegador.
Todas as telas e ações já funcionam no front; as integrações reais entram nas próximas etapas.

| Tela | O que faz |
|---|---|
| Hoje | Reunião da manhã (pedido em uma frase), respostas que precisam de você, números do dia, atividade dos robôs, aprovações e follow-ups |
| Conversas | Caixa de entrada com filtro, assumir/devolver ao robô, sugestão da IA, respostas rápidas e contexto do lead |
| Leads | Tabela com busca, filtros (etapa, segmento, presença digital, nota), ordenação, seleção em massa, criar/editar/excluir com desfazer, exportar CSV |
| Ficha do lead | Dados completos, **análise da IA** (nota por área, problemas, serviços, ticket, abordagem, briefing do site), conversa, histórico e notas |
| Funil | Kanban com arrastar, atalhos de teclado, busca e filtros |
| Território | Mapa por etapa, filtro de oportunidade e pontos que pulsam quando alguém responde |
| Campanhas | Buscas recorrentes com teste A/B; criar, editar, pausar e excluir |
| Sites-prévia (beta) | Construtor por blocos alimentado pelo briefing da IA, com prévia no computador e no celular |
| Time de robôs | Ligar, pausar e ajustar instruções de cada robô |
| Configurações | WhatsApp, horários e limites, mensagens e opt-out, IA, integrações, equipe, dados/LGPD |

Busca global: `Ctrl+K`.

## Rodar

```bash
cd radar/web
npm install
npm run dev     # desenvolvimento
npm run build   # gera radar/web/dist
```

## Próximas etapas

1. **API e banco** (Node + Postgres + Redis) substituindo `src/data/store.js`, com as mesmas ações.
2. **Caçador**: container `gosom/google-maps-scraper` no Coolify.
3. **Analista**: `src/data/analysis.js` passa a ser gerado pela API do Claude no backend, no mesmo formato.
4. **WhatsApp**: Baileys com fila de envio, limites e opt-out.
5. **Sites-prévia publicados** em `*.previa` com link para a abordagem.

## Servidor (VPS com Coolify)

Uma imagem só serve o painel, a API, o MCP e as páginas-prévia. O `docker-compose.yml` sobe três serviços:
- `radar`: painel, API e MCP, na porta 3000;
- `db`: Postgres 16;
- `google-maps-scraper`: o Caçador (gosom, MIT).

1. **DNS:** crie um registro A `radar` apontando para o IP da VPS.
2. **Coolify:** crie um novo recurso do tipo Docker Compose a partir deste repositório, com arquivo `radar/docker-compose.yml`. Use o domínio `https://radar.agenciateleios.com.br` no serviço `radar`, porta 3000.
3. **Environment Variables** (veja `.env.example`):
   - `POSTGRES_PASSWORD` e `ADMIN_PASSWORD`;
   - `MCP_TOKEN`, que você gera com `openssl rand -hex 24`.
4. **Deploy.** O primeiro acesso cria o usuário `eaidaviddev@gmail.com` com a senha de `ADMIN_PASSWORD`.

### Claude via MCP
Em claude.ai, vá em Configurações → Conectores → Adicionar conector personalizado e use a URL
`https://radar.agenciateleios.com.br/mcp/<MCP_TOKEN>`.

Ferramentas disponíveis:
- `buscar_leads`
- `ver_lead`
- `salvar_analise`
- `mover_etapa`
- `anotar`
- `catalogo_construtor`
- `criar_previa`, que devolve o link público `/p/<empresa>`
- `listar_previas`

Exemplo de pedido: *"Pegue os 5 leads sem prévia com maior oportunidade, analise cada um e crie a prévia usando as cores da marca."*

### Caçador
Em Campanhas, use **Buscar agora** para rodar no Google Maps (gosom) ou **OSM** para rodar no OpenStreetMap, que é gratuito. A busca roda uma por vez, com ritmo baixo e sem rodízio de proxy. Empresas repetidas são ignoradas. Depois da busca, o Radar visita o site de cada empresa para pegar as cores da marca, o Instagram e o e-mail, além de checar celular, velocidade e agendamento.

### Rodar localmente
```
cd radar/web && npm i && VITE_BASE=/ npx vite build
cd ../api && npm i && DATABASE_URL=postgres://... ADMIN_EMAIL=... ADMIN_PASSWORD=... MCP_TOKEN=... node src/server.js
```
Sem servidor (por exemplo, no artifact), o painel cai no modo demonstração.
