# DESIGN.md — Teleios Studio

> Linguagem visual da nova identidade (**v2 · "Inteiro no escuro"**). Fonte de verdade para o site.
> Referência de direção aprovada pelo cliente: eversonwebdesigner.com (escuro premium, títulos com dois pesos, um único acento).
> A v1 ("Construído no Grid", base clara) foi recusada e está arquivada na prancha: https://claude.ai/artifact/JHySUJVz3u4uZwRGkbjTmT

## Leitura e dials

- **Produto:** site institucional de estúdio de programação, design e vídeo
- **Público:** donos e gestores de PMEs
- **Tema:** `calmo, preciso, completo`
- **Dials:** Criatividade = Equilibrada · Densidade = Arejada · Variação = Baixa · Movimento = Cinético
- **Restrições:** manter o verde `#00C48C` e o azul `#0B1C2D`; sem fotografia por enquanto; voz próxima e informal

## Conceito

Escuro premium com **uma única luz**: o verde Teleios. A personalidade está na tipografia, com frases enormes que começam em
peso fino e cinza e terminam em negrito branco (*"Sistema, marca e vídeo **feitos por inteiro.**"*).
Detalhe de assunto: *τέλειος* (grego, "completo, feito até o fim") aparece no cartão de dicionário da seção Sobre e no rodapé.

## Cor

| Token | Hex | Uso |
|---|---|---|
| `--bg` | `#05080C` | fundo base |
| `--bg-2` | `#080D13` | cards de projeto, painéis |
| `--surface` | `#0C121A` | inputs, superfícies internas |
| `--surface-2` | `#111923` | chips, hover de card |
| `--surface-3` | `#18222E` | detalhes, palavra gigante do rodapé |
| `--deep` | `#0B1C2D` | fundos de capa, brilhos |
| `--text` | `#E9EEEC` | texto principal, parte negrita dos títulos |
| `--text-2` | `#A3AEB0` | texto secundário, parte fina dos títulos (8,3:1) |
| `--text-3` | `#6E7A80` | só texto grande, placeholders e metadados (4,4:1) |
| `--green` | `#00C48C` | **único acento**: CTAs, sublinhado, pontos, estados ativos |
| `--green-hi` | `#2ED8A7` | hover do CTA |
| `--green-ink` | `#03221A` | texto sobre verde (7:1) |
| `--tech` / `--tech-hi` | `#1F3C88` / `#6F86C8` | apoio em ilustrações e gráficos, nunca em UI |
| `--line` / `--line-2` | branco a 8% / 14% | fios e bordas |

Regra: o verde nunca vira gradiente de texto nem fundo de seção inteira. Uma luz, usada com economia.

## Tipografia

| Papel | Fonte | Config |
|---|---|---|
| Display / títulos | Sora | parte fina 300 em `--text-2` + parte negrita 700 em `--text`; tracking −4%; lh 1.02 |
| Texto | Inter | 400/500/600, lh 1.6, ~56–65ch |
| Rótulos | JetBrains Mono | 12px, caixa alta, tracking +12%, número da seção em verde |

Escala: `xs 12` · `sm 14` · `base 16` · `md 18` · `lg 21` · `xl clamp(26–36)` · `2xl clamp(34–58)` · `3xl clamp(35–80)` · display `clamp(42–92)`.

## Layout

- Container `max 1360px`, margem lateral `clamp(16px, 4vw, 80px)`, seções com `clamp(88px, 11vw, 152px)` de respiro
- Seções com rótulo numerado à esquerda (3/12) e conteúdo à direita (9/12), refletindo a ordem real da página
- Cards: raio 28px, borda `--line`, fundo `--bg-2`; botões e chips em pílula
- Menu flutuante em pílula com fundo translúcido ao rolar; pílula branca desliza até a seção ativa (scroll-spy)
- Breakpoints: 720 · 900 · 1024

## Estrutura

Home longa: Hero → Posicionamento (01) → faixa de serviços → Projetos (02) → Serviços (03) → Processo (04) → Diferencial (05) → Sobre (06) → Contato (07).
Página `/projetos` com todos os projetos e filtro. As rotas antigas `/sobre`, `/servicos` e `/contato` redirecionam para as âncoras da home.

## Movimento (cinético)

| Momento | Comportamento |
|---|---|
| Títulos | linhas sobem por máscara (stagger 90ms) ao entrar na tela |
| Blocos | fade + subida de 28px ao entrar |
| Hero | composição de sistema, marca e vídeo com parallax pelo mouse; barras animadas; timecode correndo; playhead em loop |
| Contínuo | faixa de serviços em marquee; palavra gigante "Inteiro" desliza com o scroll |
| Destaques | sublinhado verde se desenha; linha do processo se preenche e acende os passos |
| Hover | CTA com preenchimento de baixo para cima; seta do card gira 45°; capa do projeto dá zoom leve |
| `prefers-reduced-motion` | tudo estático e visível |

Easing padrão `cubic-bezier(.2,.8,.2,1)`.

## Voz

Próxima e informal: "a gente", "bora conversar", frases curtas. Explica o resultado para o dono da empresa, não a tecnologia.
Evitar: "soluções inovadoras", "excelência técnica", "transformação digital".

## Marca

Logo definitivo: **pendente**. Provisório: quadrado verde arredondado com "T" + wordmark "**Teleios** studio" (Sora 700/300). Favicon: o mesmo "T".

## Imagens

Sem fotografia por ora. O hero usa uma composição em código, e cada projeto tem uma capa ilustrativa em CSS por tipo
(dashboard, marca, vídeo, app, gráfico, motion). **Substituir pelas imagens reais dos projetos** quando existirem (`ProjectCard.jsx`).
