# Webdesigner · 4. Coreografia de movimento (Teleios Motion Kit)

Pense em movimento como direção de cena: **entrada → leitura → ênfase → ação**.

## 4.1 Receita por intensidade
| Intensidade | Para | Título | Blocos | Assinatura |
|---|---|---|---|---|
| Sutil | advocacia, clínica premium, luxo | `data-split="words"` | `data-reveal="blur"` | `data-scrub-words` no manifesto |
| Equilibrada | planejados, odonto, ótica, imobiliária | `data-split="words"` | `data-reveal` + `data-stagger="0.08"` | `data-progress` no processo ou `data-curtain` no portfólio |
| Marcante | academia, barbearia, restaurante jovem | `data-split="chars"` | `data-reveal="flip"`/`zoom` | `data-scroll-x` palavra gigante + `data-marquee` |

## 4.2 Regras
- **Um momento assinatura** por site, colocado no meio da página (é onde a atenção cai).
- Topo: título entra primeiro (split), depois sub (`data-delay="0.35"`), depois CTAs (`0.5`), depois a foto (`data-curtain`, `0.2`).
- Cascatas de 60–90ms entre itens; nunca mais que 8 itens animando juntos.
- Durações: entradas 0,8–1,1s; hovers 0,3–0,45s; easing `cubic-bezier(.2,.8,.2,1)`.
- Números reais sempre com `data-count` (nota `4.9`, avaliações `132`).
- Hovers: CTA com `data-fill`; imagens `data-zoom`; links com seta que gira 45°.
- Não anime texto corrido longo, formulários ou o menu.
- O kit já respeita `prefers-reduced-motion`; não crie animações fora dele sem o mesmo cuidado.

## 4.3 Exemplos de marcação
```html
<p class="label" data-reveal>01 — Ambientes</p>
<h2 data-split="words"><span class="soft">Cada canto</span> <strong>com <em>propósito</em></strong></h2>
<div class="grid" data-stagger="0.08" data-reveal-type="zoom"> ...cards... </div>
<ol class="process" data-progress style="--tm-accent: var(--accent)"><li data-step>...</li></ol>
<div class="giant" data-scroll-x="0.25">Marcenaria</div>
<figure data-curtain data-zoom><img src="FOTO_REAL" alt="Cozinha planejada em MDF freijó" loading="lazy"></figure>
<a class="btn" data-fill data-magnetic href="https://wa.me/55...">Pedir orçamento</a>
```
