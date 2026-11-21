# Webdesigner · 3. Layout e catálogo de seções

## 3.1 Grade e espaço
- Container `max-width: 1320px; padding-inline: clamp(20px, 5vw, 72px)`. Grade de 12 colunas (`display:grid; grid-template-columns: repeat(12, 1fr); gap: clamp(16px, 2vw, 28px)`).
- Respiro vertical das seções: `clamp(88px, 12vw, 168px)`. Entre título e conteúdo: 40–64px.
- **Assimetria intencional:** rótulo em 3 colunas + conteúdo em 9; texto em 5 + imagem em 7; imagem que sangra até a borda.
- Espaçamentos múltiplos de 8. Raio único para o site (0, 6, 14 ou 28px conforme conceito).

## 3.2 Topos (escolha 1; nunca o genérico "foto + película preta + título centralizado")
1. **Editorial à esquerda:** título gigante em 2 pesos alinhado à esquerda, sub curto, 2 CTAs; foto real ocupando 5–6 colunas à direita com `data-curtain`.
2. **Foto plena com película quente:** foto real em tela cheia, gradiente na cor da tinta (não preto) da esquerda para a direita, título à esquerda, mini-abas numeradas (01 · 02 · 03) com barra de progresso.
3. **Tipográfico puro:** sem foto; título ocupando a largura (`font-size: 11vw`), uma palavra em itálico/acento, fio fino e dados reais abaixo (nota, bairro, horário).
4. **Palavra gigante + recorte:** nome do ofício enorme ao fundo (`data-scroll-x`), foto recortada em forma (arco, cápsula) por cima.
5. **Split com prova:** 50/50, esquerda título e CTA; direita cartão com nota do Google grande, 2 frases reais de clientes rolando (`data-marquee` vertical ou fade).
6. **Mosaico:** 3–5 fotos reais em grade irregular que entram em cascata; título sobreposto em bloco sólido.
7. **Manifesto:** frase longa de 2–3 linhas com `data-split="words"` e destaques em itálico; CTA discreto abaixo.

## 3.3 Seções (padrões de alto nível)
- **Faixa de prova:** 3–4 números reais grandes e finos com fio vertical entre eles; legendas curtas. (Sem números reais → troque por "Nota 4,9 · 132 avaliações · Bairro · Seg–Sáb".)
- **Manifesto/sobre:** um parágrafo curto em display tamanho h2 com `data-scrub-words`; ao lado, foto com selo sobreposto.
- **Serviços como índice:** lista numerada em linhas largas (01 Cozinhas ……… ↗), hover revela foto pequena que segue o cursor ou aparece à direita. Melhor que 3 cards com ícone.
- **Serviços em cartões empilhados:** `data-stack`, cada cartão com foto real, nome e 1 frase.
- **Portfólio:** filtros em pílula + carrossel horizontal com indicador temático (régua, pontos, barra); ou grade de mosaico com `data-curtain` em cascata.
- **Processo:** 3–4 passos com `data-progress` (linha que se preenche); cada passo com número grande, verbo forte e uma frase.
- **Antes/depois ou detalhe:** comparador ou zoom em detalhe de acabamento.
- **Depoimentos reais:** 1 citação grande em serifa (a melhor) + 2–3 menores; nome e fonte "Avaliação no Google".
- **Faixa infinita:** serviços ou bairros atendidos em `data-marquee`, tipografia display média, separados pelo motivo (✦ não; use o símbolo do conceito).
- **Onde estamos:** bairro e cidade grandes, horário em tabela elegante, botão "Abrir no mapa" (link Google Maps), telefone.
- **Chamada final:** frase grande (2 pesos) + botão grande magnético para WhatsApp + linha de dados (telefone, Instagram).
- **Rodapé:** nome em tamanho gigante cortado na borda (`data-scroll-x`), colunas mínimas, faixa "Prévia criada pela Agência Teleios".

## 3.4 Detalhes que dão acabamento
- Fios de 1px na cor `--line` separando blocos; números de seção; setas ↗ em links.
- Textura sutil: ruído SVG (`feTurbulence`) a 4–6% de opacidade, ou ripado `repeating-linear-gradient(90deg, rgba(255,255,255,.03) 0 2px, transparent 2px 14px)`.
- Botões em pílula ou retos (conforme raio); CTA principal com `data-fill` e `data-magnetic`; secundário com contorno.
- Menu: logo à esquerda, 3–4 âncoras, CTA à direita; fica translúcido (`backdrop-filter: blur(12px)`) ao rolar.
- Cursor e hover: imagens com `data-zoom`; links com sublinhado que cresce.
- Mobile: tudo em uma coluna, títulos ainda grandes (clamp), CTA fixo no rodapé da tela para WhatsApp.
