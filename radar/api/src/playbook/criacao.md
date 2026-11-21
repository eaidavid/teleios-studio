# Guia de criação de prévias · Agência Teleios

> **Ordem:** `guia_de_criacao` → `brief_do_lead` (dados + rascunho mastigado) → melhore → `montar_site`.
> **Como entregar:** use `montar_site` (motor premium, arquivo 9 do Webdesigner). Ele garante acabamento de estúdio; você faz a direção de arte e os textos.
> HTML 100% autoral (`criar_previa` com `html`) só quando a ideia não couber no motor. Nunca entregue uma página com menos de 8 seções.

A prévia é a primeira impressão que a Teleios causa. Ela precisa fazer o dono da empresa pensar *"fizeram isso pra mim"*,
nunca *"isso é um modelo"*. Qualidade de estúdio, feita por gente que conhece o negócio dele.

## 1. O que é "personalidade Teleios" num site de cliente
Não é copiar o visual da Teleios (escuro + verde). É copiar o **rigor**:
- **Uma ideia por site.** Antes de escrever código, defina o conceito em uma frase que nasce de algo REAL do negócio
  (o ofício, o material, o bairro, a história do nome, o que os clientes elogiam nas avaliações).
  Ex.: marcenaria → "medida exata": régua, cotas e encaixes viram o motivo gráfico do site.
- **Tipografia é a protagonista.** Títulos grandes com contraste de peso (parte fina + parte forte) ou serifa expressiva com itálico em uma palavra.
- **Uma cor de destaque, usada com economia.** Fundo, tinta e um acento. Nada de arco-íris.
- **Respiro.** Seções com bastante espaço; poucas coisas por tela, cada uma com propósito.
- **Movimento que conta algo** (veja a seção 5), não enfeite.
- **Detalhe de assunto:** um elemento que só existe porque é ESSE negócio (a palavra do ofício, uma cota de medida, o horário de funcionamento virando parte do layout, o nome do bairro em destaque).

## 2. Pesquisa antes de criar (obrigatório)
Chame `ver_lead` e use:
- `brandName` (nome limpo) para títulos. Nunca use o nome bruto do Google com descrição colada.
- `gallery`: fotos reais da empresa no Google Maps e `sitePhotos`: fotos do site da própria empresa. **Prioridade máxima.**
- `brand.logo`: logo encontrado no site (use se tiver boa qualidade; senão crie o logotipo tipográfico).
- `about`, `priceRange`: descrição e faixa de preço do Google, quando houver.
- `rating`, `reviews`, `reviewSamples`: só números e frases reais.
- `neighborhood`, `city`, `hours` (texto pronto, ex.: "Seg–Sex 08h–18h · Sáb 08h–12h") e `hoursTable`, `phone`, `instagram`, `website`, `googleCategory`.
- `brand.colors`: cores tiradas do site/Instagram do cliente.
- `analysis`: o ponto fraco que a prévia resolve (ex.: não tem site, site ruim no celular).

## 3. Identidade visual
**Se há `brand.colors`:** respeite. Derive fundo/tinta/acento delas; não fuja da identidade.
**Se não há:** crie uma IDV autêntica e diga no fim, em 1 linha, qual foi o conceito:
1. Conceito em uma frase (seção 1).
2. Paleta de 3 a 4 cores tirada do ofício/material/região (marcenaria: madeira, grafite, linho, latão; pet shop: nunca o clichê azul+amarelo genérico; clínica: evite o rosa-bebê óbvio se não fizer sentido).
3. Par tipográfico do Google Fonts com caráter, escolhido pelo conceito. Boas opções: Fraunces, Instrument Serif, DM Serif Display,
   Playfair Display, Cormorant, Bricolage Grotesque, Space Grotesk, Sora, Manrope, Archivo, Syne, Unbounded, Outfit, IBM Plex Sans/Mono, JetBrains Mono.
   **Evite** Poppins, Montserrat, Roboto e Open Sans como escolha padrão.
4. Logotipo tipográfico em SVG inline (o nome na fonte display + um detalhe ligado ao conceito). Simples e bem acabado.
5. Um motivo gráfico próprio (linha de cota, grade de marcenaria, carimbo, recorte, textura de papel) usado em 2 ou 3 lugares.

## 4. Estrutura (escolha, não preencha formulário)
5 a 7 seções que façam sentido para ESSE negócio. Seções numeradas (01, 02…) ajudam a dar ritmo.
- Topo: frase forte e específica + subtítulo com prova real + CTA de WhatsApp.
- Prova: nota e número de avaliações reais, frases reais de clientes (se houver em `reviewSamples`), anos de casa só se informado.
- O que faz: serviços com linguagem do cliente final, não lista seca.
- Como funciona: 3 a 4 passos reais do ofício (ex.: medição → projeto 3D → produção → montagem).
- Portfólio/galeria: fotos reais do Maps; se não houver, composições tipográficas/gráficas (sem fingir fotos).
- Onde fica: bairro, horários, mapa por link, telefone.
- Chamada final grande para o WhatsApp.

## 5. Movimento (use o Teleios Motion Kit, sempre)
No `<head>`: `<link rel="stylesheet" href="/kit/motion.css"><script src="/kit/motion.js" defer></script>`
(atributos em `catalogo_construtor` → `kit`). Mínimo obrigatório:
- Título do topo com `data-split="words"` (ou `chars` em estilos ousados).
- Blocos com `data-reveal` e grupos com `data-stagger`.
- Pelo menos **um momento assinatura**: palavra gigante com `data-scroll-x`, manifesto com `data-scrub-words`,
  cartões com `data-stack`, processo com `data-progress`, faixa `data-marquee` ou fotos com `data-curtain`.
- Números reais com `data-count`. Botão principal com `data-magnetic` e `data-fill`.
Não exagere: 1 momento assinatura forte vale mais que 10 efeitos.

## 6. Imagens
1. Fotos reais da empresa (`gallery` do Maps e `sitePhotos` do site) — use com `data-curtain`/`data-zoom`, `loading="lazy"`, `alt` descritivo.
2. Sem fotos: composição tipográfica, SVG/CSS ligado ao conceito, texturas sutis. Fica mais autêntico que banco de imagem.
3. Banco de imagens (Unsplash etc.) só se não houver outra saída, poucas, e com a legenda discreta "imagem ilustrativa".
   **Nunca** apresente foto de banco como trabalho do cliente.

## 7. Texto
Português do Brasil, próximo e direto, falando com o cliente final da empresa.
- Use fatos reais: bairro, nota, serviços, horários.
- **Proibido inventar:** números ("+500 clientes", "15 anos"), depoimentos, prêmios, certificações, preços.
- **Frases proibidas (soam a IA/modelo):** "Bem-vindo(a) ao/à", "soluções inovadoras", "excelência", "qualidade que a cidade aprovou",
  "transformando sonhos em realidade", "seu parceiro ideal", "venha nos conhecer", "atendimento de qualidade",
  "no mercado há", "comprometidos com", "a melhor escolha", "levando até você".
- CTA principal: WhatsApp da empresa com mensagem pronta (`https://wa.me/55DDDNUMERO?text=...`).

## 8. Técnico
- Um único HTML completo, CSS no `<style>`, responsivo de 360px a 1440px, sem rolagem horizontal.
- Scripts externos: só o Motion Kit. Fontes: Google Fonts.
- Contraste AA, `alt` nas imagens, foco visível, `prefers-reduced-motion` (o kit já trata).
- Faixa discreta no topo ou rodapé: "Prévia criada pela Agência Teleios para {Empresa}" + link "Quero este site"
  para `https://wa.me/5515981763815?text=Oi!%20Vi%20a%20pr%C3%A9via%20do%20site%20da%20{Empresa}`.

## 9. Anti-IA-slop (reprove o próprio trabalho se tiver)
- Gradiente roxo/azul genérico, glassmorphism sem motivo, brilho neon gratuito.
- Hero = foto de banco + película escura + título centralizado genérico.
- Três cartões iguais com ícone em círculo e texto de duas linhas.
- Emojis como ícones; ícones genéricos repetidos.
- Tudo centralizado; mesmo espaçamento em tudo; nenhuma hierarquia.
- Texto que serviria para qualquer empresa do segmento.

## 10. Checklist antes de `criar_previa`
- [ ] Conceito em uma frase, nascido de algo real.
- [ ] Nome limpo, sem texto do Google colado.
- [ ] Cores da marca respeitadas, ou IDV criada com motivo gráfico próprio.
- [ ] Fotos reais usadas, se existirem.
- [ ] Motion Kit incluído, com split no título e um momento assinatura.
- [ ] Nenhum número, depoimento ou fato inventado; nenhuma frase proibida.
- [ ] Funciona no celular (360px).
- [ ] Faixa "Prévia criada pela Agência Teleios" com "Quero este site".

## 11. Variedade obrigatória (nenhum site igual ao anterior)
Referências servem para calibrar **nível**, nunca para copiar forma. Cada prévia precisa ter uma combinação própria de:
conceito · paleta · par tipográfico · topo · momento assinatura · ritmo de seções.
O `brief_do_lead` traz as **últimas prévias criadas**: não repita o mesmo par de fontes, o mesmo topo nem o mesmo momento assinatura das 3 anteriores.
Pode ser mais premium (editorial, ousado, escuro) ou mais simples e direto — o que decide é o que encanta ESTE cliente final.
