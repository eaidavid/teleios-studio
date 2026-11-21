# Teleios Motion Kit

Inclua no `<head>`:
```html
<link rel="stylesheet" href="/kit/motion.css">
<script src="/kit/motion.js" defer></script>
```

| Atributo | Efeito |
|---|---|
| `data-reveal` (`""`, `left`, `right`, `zoom`, `blur`, `flip`) | entra ao aparecer na tela |
| `data-delay="0.2"` | atraso em segundos |
| `data-stagger="0.08"` no pai | filhos entram em cascata (`data-reveal-type` define o tipo) |
| `data-split="lines|words|chars"` | título sobe por máscara, palavra a palavra ou letra a letra (preserva `<em>`/`<strong>` no modo words) |
| `data-scrub-words` | palavras acendem conforme a rolagem (bom para manifesto) |
| `data-draw` | sublinhado se desenha (use num `<span>`) |
| `data-curtain` | imagem revela por cortina com leve zoom |
| `data-zoom` | zoom leve na imagem ao passar o mouse |
| `data-parallax="0.15"` | parallax suave |
| `data-scroll-x="0.3"` | elemento desliza na horizontal com a rolagem (palavra gigante) |
| `data-marquee` / `data-marquee="reverse"` | faixa infinita (`--tm-speed`, `--tm-gap`) |
| `data-count="4.9"` + `data-prefix` / `data-suffix` | número conta até o valor |
| `data-progress` + filhos `data-step` | linha do processo se preenche; passos ganham `.tm-lit` |
| `data-stack` | cartões grudam e empilham na rolagem |
| `data-magnetic="0.3"` | botão segue o cursor |
| `data-fill` | preenchimento de baixo para cima no hover (`--tm-fill`) |

`prefers-reduced-motion` já é respeitado: tudo aparece estático.
