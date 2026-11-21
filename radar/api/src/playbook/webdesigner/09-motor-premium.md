# Webdesigner · 9. Motor premium (`montar_site`) — como entregar PRONTO PARA VENDA na primeira tentativa

O motor cuida do acabamento: grade, espaçamento, tipografia fluida, rótulos com motivo, botões, menu translúcido, faixa da Teleios,
WhatsApp flutuante, rodapé com palavra gigante e as animações do Motion Kit. **Seu trabalho é direção de arte + texto excelente.**
Uma prévia pronta para venda tem **8 a 11 seções**, com ritmo de fundos (claro → alt → escuro) e um momento assinatura.

## Tema
- Cores: siga a marca (`brand.colors`) ou tire do material/ofício (arquivo 2). `fundo` claro e quente na maioria dos casos; `tinta` quase preta tingida; `acento` com personalidade.
- Fontes (enum): escolha um par do arquivo 2. `peso_titulo` 300 para elegante; 600–800 para ousado.
- `motivo`: regua (marcenaria/arquitetura), arco (estética/odonto), ponto (moderno), linha (neutro), cruz (técnico/saúde).
- `textura`: ripado (madeira), grao (artesanal), grade (técnico), linhas (editorial).
- `movimento`: sutil | equilibrado | marcante (arquivo 4).

## Seções e campos
| tipo | campos | dica |
|---|---|---|
| `topo` | variante (`foto` \| `moldura` \| `colagem` \| `dividido` \| `tipografico`), rotulo, titulo_suave, titulo_forte, subtitulo, cta{texto}, cta2{texto,link}, foto, abas[3], selo{numero,texto} | `moldura` = foto emoldurada + cartão de avaliação real (muito premium); `colagem` = 3 fotos sobrepostas; sem fotos → `tipografico` |
| `numeros` | itens[{valor, legenda, prefixo?, sufixo?}] | só números reais (nota, nº de avaliações, anos se informado, "48h" de prazo só se dito) |
| `sobre` | rotulo, titulo_suave, titulo_forte, textos[], fotos[2], selo{numero,texto}, link{texto}, foto_direita | 2 parágrafos curtos e específicos |
| `manifesto` | rotulo, texto | 1 frase longa e verdadeira; palavras acendem com a rolagem |
| `servicos` | variante (`indice` \| `cartoes`), rotulo, titulos, subtitulo, itens[{nome, texto, foto?}], com_fotos | 4–6 itens; texto = o que muda na vida do cliente |
| `galeria` | variante (`trilho` \| `mosaico`), rotulo, titulos, filtros[], fotos[{url,legenda}], quantidade, link{texto} | sem `fotos` usa as reais do lead |
| `processo` | rotulo, titulos, subtitulo, passos[{titulo, texto}] (até 4), fundo | escuro por padrão |
| `depoimentos` | rotulo, titulos, itens? | sem itens usa as avaliações reais do Google |
| `faixa` | itens[] | serviços, ambientes ou bairros atendidos |
| `local` | rotulo, titulos, texto | horário, endereço, telefone e mapa entram sozinhos |
| `chamada` | rotulo, titulo_suave, titulo_forte, texto, cta{texto} | escura por padrão |
| `dores` | rotulo, titulos, subtitulo, itens[{frase, resposta}] (até 3) | frases na voz do cliente final ("Pedi orçamento e ninguém respondeu") + como a empresa resolve |
| `cartaz` | palavra (aceita `<em>`), topo_esquerda/direita, base_esquerda/direita, selo, cor_fundo, cor_texto | pôster tipográfico gigante — o momento assinatura quando não há foto |
| `empilhados` | rotulo, titulos, itens[{nome, texto, foto?, simbolo?}] (até 5), com_fotos | cartões que grudam e empilham na rolagem (como os serviços do site da Teleios) |
| `comparacao` | rotulo, titulos, titulo_sem, sem[], titulo_com, com[] | "do jeito comum" × "com a Empresa" — só diferenças verdadeiras |
| `faq` | rotulo, titulos, itens[{pergunta, resposta}] | dúvidas reais do segmento (prazo, medição, garantia, pagamento — só se informado; senão responda com o processo) |
| `html` | html, fundo | momento autoral seu; use `.wrap`, `.sec` e atributos do kit |
Campos comuns: `fundo` (claro\|alt\|escuro), `textura`, `ancora` + `menu` (aparece no menu), `rotulo` (vira "01 — Rótulo").

## Exemplo completo (marcenaria com fotos) — mostra DENSIDADE e cuidado com texto. Não repita tema, fontes nem ordem: cada site é único
```json
{
  "lead_id": 137,
  "conceito": "Peças feitas à mão por um casal de marceneiros: o calor da madeira e a precisão da medida.",
  "tema": { "fundo": "#F6F1EA", "fundo_alt": "#EDE4D6", "tinta": "#2A1C18", "acento": "#B9824F",
    "fonte_titulo": "Plus Jakarta Sans", "fonte_texto": "Inter", "fonte_destaque": "Instrument Serif",
    "peso_titulo": 300, "raio": "suave", "motivo": "regua", "textura": "ripado", "movimento": "equilibrado" },
  "whatsapp_texto": "Oi! Vi o site da 88 Wood Shop e quero fazer um orçamento.",
  "secoes": [
    { "tipo": "topo", "variante": "foto", "rotulo": "Marcenaria artesanal · Anápolis",
      "titulo_suave": "Madeira de verdade,", "titulo_forte": "feita à mão <em>pra sua casa</em>",
      "subtitulo": "Peças e móveis sob medida criados por um casal de marceneiros. Do desenho ao acabamento, tudo no capricho.",
      "cta": { "texto": "Pedir orçamento" }, "cta2": { "texto": "Ver peças", "link": "#pecas" },
      "abas": ["Feito à mão", "Sob medida", "Acabamento fino"] },
    { "tipo": "numeros", "itens": [ { "valor": "5,0", "legenda": "nota no Google" }, { "valor": "144", "legenda": "avaliações de clientes" }, { "valor": "100%", "legenda": "peças feitas à mão" } ] },
    { "tipo": "sobre", "rotulo": "A marcenaria", "titulo_suave": "Cada peça", "titulo_forte": "começa numa conversa",
      "textos": ["A gente escuta o que você imagina, mede o espaço e escolhe a madeira junto com você.", "Depois, cada corte, encaixe e lixa é feito à mão, no nosso ateliê em Anápolis."],
      "selo": { "numero": "144", "texto": "clientes avaliaram" }, "link": { "texto": "Conversar com a gente" } },
    { "tipo": "faixa", "itens": ["Tábuas e placas", "Mesas", "Prateleiras", "Peças decorativas", "Sob medida"] },
    { "tipo": "servicos", "variante": "cartoes", "ancora": "pecas", "menu": "Peças", "rotulo": "O que fazemos",
      "titulo_suave": "Tudo que você imaginar", "titulo_forte": "em madeira",
      "itens": [ { "nome": "Tábuas e placas", "texto": "Para servir, decorar ou presentear, com acabamento que dura." }, { "nome": "Mesas e bancos", "texto": "Do tamanho exato do seu espaço." }, { "nome": "Peças sob encomenda", "texto": "Trouxe uma ideia? A gente desenha e faz." } ] },
    { "tipo": "manifesto", "rotulo": "Nosso jeito", "texto": "Nada sai daqui sem passar pelas nossas mãos: escolher a madeira, medir duas vezes, cortar uma, lixar até ficar liso como deve ser." },
    { "tipo": "galeria", "variante": "mosaico", "ancora": "galeria", "menu": "Galeria", "rotulo": "Do ateliê", "titulo_suave": "Feito aqui,", "titulo_forte": "pensado pra durar" },
    { "tipo": "processo", "ancora": "processo", "menu": "Como funciona", "rotulo": "Como funciona", "titulo_suave": "Da ideia", "titulo_forte": "à peça pronta",
      "passos": [ { "titulo": "Conversa", "texto": "Você conta o que precisa pelo WhatsApp." }, { "titulo": "Desenho e madeira", "texto": "Definimos medidas, madeira e acabamento." }, { "titulo": "Feito à mão", "texto": "Produzimos no ateliê, com cuidado em cada detalhe." }, { "titulo": "Entrega", "texto": "Combinamos a entrega ou retirada." } ] },
    { "tipo": "depoimentos", "rotulo": "Quem já tem", "titulo_suave": "144 avaliações,", "titulo_forte": "nota 5,0" },
    { "tipo": "local", "ancora": "contato", "menu": "Contato", "rotulo": "Onde estamos" },
    { "tipo": "chamada", "rotulo": "Vamos fazer a sua?", "titulo_suave": "Conta pra gente", "titulo_forte": "o que você imaginou.", "texto": "Respondemos pelo WhatsApp, sem compromisso.", "cta": { "texto": "Pedir orçamento" } }
  ],
  "rodape": { "frase": "Marcenaria artesanal em Anápolis. Peças feitas à mão, sob medida.", "palavra_gigante": "88 Wood" }
}
```
Repare: conceito real (casal, feito à mão — tirado das avaliações), números só reais, textos específicos, ritmo de fundos,
um momento assinatura (manifesto que acende), 11 seções. **Esse é o mínimo de densidade aceitável.**

## Sem fotos reais (veja o exemplo aprovado `88-wood-shop-sem-fotos` no fim do guia)
Topo `tipografico` grande + `numeros` + `manifesto` + `servicos` em `cartoes` com `com_fotos: false` + `processo` + `depoimentos` + `local` + `chamada`,
e um bloco `html` autoral com um elemento gráfico do conceito (ex.: régua em SVG com as medidas de um móvel, carimbo, composição tipográfica).
