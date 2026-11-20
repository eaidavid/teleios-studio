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
