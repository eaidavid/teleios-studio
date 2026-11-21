# Webdesigner · 2. Tipografia e cor

## 2.1 Pares tipográficos testados (Google Fonts) — escolha pelo conceito
| Personalidade | Display | Texto | Bom para |
|---|---|---|---|
| Editorial elegante | Fraunces (opsz, 300–600, itálico) | Inter | estética, odonto premium, arquitetura |
| Luxo silencioso | Cormorant Garamond 300/500 | Manrope | advocacia, joalheria, clínica premium |
| Contemporâneo quente | Plus Jakarta Sans 300/600 | Plus Jakarta Sans | planejados, decoração, imobiliária |
| Moderno preciso | Sora 300/700 | Inter | tecnologia, ótica, fisioterapia |
| Expressivo | Bricolage Grotesque 400/800 | DM Sans | restaurante, café, pet shop moderno |
| Ousado/atlético | Archivo (expanded 800) ou Unbounded 700 | Archivo | academia, crossfit, barbearia |
| Artesanal | DM Serif Display + itálico | Work Sans | padaria, confeitaria, marcenaria artesanal |
| Técnico/indústria | Space Grotesk 500 + JetBrains Mono (rótulos) | Space Grotesk | oficina, engenharia, marcenaria industrial |
| Afetivo | Instrument Serif itálico + Outfit | Outfit | estética, floricultura, infantil |
**Evite como padrão:** Poppins, Montserrat, Roboto, Open Sans, Lato, Raleway.

## 2.2 Escala e regras
- Escala fluida: `--fs-display: clamp(44px, 7.4vw, 104px); --fs-h2: clamp(32px, 4.6vw, 60px); --fs-h3: clamp(20px, 2vw, 26px); --fs-body: 17px; --fs-small: 14px; --fs-label: 12px`.
- Títulos: `line-height: .98–1.05`, `letter-spacing: -0.02em a -0.045em` (quanto maior, mais apertado). Texto: `line-height 1.6`, largura 52–65ch.
- **Contraste de peso no mesmo título** (assinatura Teleios): parte em 300 numa cor mais suave + parte em 700 na cor forte ou acento.
  `<h1><span class="soft">Móveis planejados</span> <strong>para a sua história</strong></h1>`
- **Uma palavra em itálico serifado** para ênfase emocional (só uma por título).
- Rótulos de seção: 12px, caixa alta, `letter-spacing: .14em`, com número ("01 — Ambientes") ou ícone do motivo.
- Números grandes: fonte display peso 300, `font-variant-numeric: tabular-nums`.
- Nunca: texto justificado, mais de 2 famílias (+ mono opcional para rótulos), títulos em caixa alta longos.

## 2.3 Cor — como construir a paleta
1. **Com marca:** pegue `brand.colors`. A cor mais saturada vira acento; derive fundo (versão muito clara/quente ou muito escura) e tinta (quase preto tingido com a cor).
2. **Sem marca:** tire do **material/ofício/lugar**:
   - Marcenaria: creme `#F4EFE8`, café `#2A1C18`, caramelo `#C08A5B`, linho `#E7DECF`.
   - Estética: porcelana `#F7F2EE`, ameixa `#3A1F2B`, argila rosada `#C9877A`.
   - Odonto: branco gelo `#F3F6F5`, verde-petróleo `#0F3B3A`, menta `#5FC4A8`.
   - Academia: carvão `#0E0F0F`, cal `#F2F2EC`, ácido `#D4FF3A` ou laranja `#FF5B1F`.
   - Restaurante: papel `#FBF4E8`, tomate `#C8381F`, azeite `#6B6A2E`.
   - Pet: aveia `#F6EEDF`, cacau `#3B2A1E`, mostarda `#E1A23B`.
   - Barbearia: grafite `#16130F`, osso `#EFE6D8`, cobre `#B36A3C`.
   - Advocacia: marinho tinta `#121A2B`, papel `#F3EFE6`, latão `#B8954E`.
   - Ótica: branco `#F5F6F8`, azul-noite `#14213D`, coral `#FF6B4A`.
   - Fisioterapia: areia `#F2EEE7`, petróleo `#0B3A47`, turquesa `#2BA3B8`.
3. Tokens: `--bg --bg-alt --ink --ink-soft --accent --line` (linha = tinta a 12%). Teste contraste AA.
4. Regra de 60/30/10: fundo 60, tinta/apoio 30, acento 10. O acento marca CTA, números e o motivo — não decora tudo.
5. Seções escuras: use a tinta como fundo e o fundo como texto (inversão), mantendo o mesmo acento.
