# Webdesigner · 7. Técnica (esqueleto e snippets)

## 7.1 Esqueleto recomendado
```html
<!doctype html><html lang="pt-BR"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{Empresa} · {o que faz} em {cidade}</title>
<meta name="description" content="{frase específica}">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=...&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/kit/motion.css"><script src="/kit/motion.js" defer></script>
<style>
:root{--bg:#;--bg-alt:#;--ink:#;--ink-soft:#;--accent:#;--line:color-mix(in srgb,var(--ink) 12%,transparent);
--f-display:'...',serif;--f-body:'...',sans-serif;--r:14px;--ease:cubic-bezier(.2,.8,.2,1)}
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--bg);color:var(--ink);font:400 17px/1.6 var(--f-body);-webkit-font-smoothing:antialiased}
img{max-width:100%;display:block}a{color:inherit}
.wrap{max-width:1320px;margin:0 auto;padding-inline:clamp(20px,5vw,72px)}
section{padding-block:clamp(88px,12vw,168px)}
.label{font:600 12px/1 var(--f-body);letter-spacing:.14em;text-transform:uppercase;color:var(--ink-soft);display:flex;gap:10px;align-items:center}
h1,h2,h3{font-family:var(--f-display);margin:0;line-height:1;letter-spacing:-.035em}
h1{font-size:clamp(44px,7.4vw,104px);font-weight:300}h2{font-size:clamp(32px,4.6vw,60px);font-weight:300}
h1 strong,h2 strong{font-weight:700}.soft{color:var(--ink-soft)}em{font-style:italic}
.btn{display:inline-flex;gap:10px;align-items:center;padding:16px 26px;border-radius:999px;background:var(--accent);color:var(--bg);text-decoration:none;font-weight:600;--tm-fill:rgba(255,255,255,.18)}
.btn.ghost{background:transparent;color:inherit;border:1px solid var(--line)}
@media (max-width:720px){.cta-fixo{position:fixed;inset:auto 12px 12px;z-index:50}}
</style></head><body> ... </body></html>
```

## 7.2 Snippets de acabamento
- **Ruído/grão:** `body::after{content:'';position:fixed;inset:0;pointer-events:none;opacity:.05;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='.8' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}`
- **Ripado:** `background: repeating-linear-gradient(90deg, rgba(255,255,255,.035) 0 2px, transparent 2px 16px), var(--ink);`
- **Régua (motivo marcenaria):** `.ruler{height:10px;background:repeating-linear-gradient(90deg,var(--line) 0 1px,transparent 1px 8px),repeating-linear-gradient(90deg,var(--ink-soft) 0 1px,transparent 1px 40px);background-size:auto 6px,auto 10px;background-repeat:repeat-x;background-position:bottom}`
- **Cota:** `.cota{display:flex;align-items:center;gap:8px}.cota::before,.cota::after{content:'';flex:1;height:1px;background:currentColor;opacity:.4}`
- **Película quente em foto:** `background:linear-gradient(90deg,color-mix(in srgb,var(--ink) 88%,transparent),transparent 70%),url(FOTO) center/cover`
- **Recorte em arco:** `border-radius: 999px 999px var(--r) var(--r);`
- **Número gigante vazado:** `-webkit-text-stroke:1px var(--line);color:transparent`
- **Seção escura invertida:** `.dark{background:var(--ink);color:var(--bg)} .dark .soft{color:color-mix(in srgb,var(--bg) 60%,transparent)}`
- **Menu translúcido:** `header{position:sticky;top:0;backdrop-filter:blur(12px);background:color-mix(in srgb,var(--bg) 75%,transparent)}`
- **Logo tipográfico SVG:** `<svg viewBox="0 0 220 40" role="img" aria-label="{Empresa}"><text x="0" y="30" font-family="{display}" font-size="30" font-weight="700" letter-spacing="-1">{nome}</text><circle cx="..." cy="..." r="4" fill="var(--accent)"/></svg>`

## 7.3 Fotos reais (Google Maps)
- Junte `photos` (Maps) e `sitePhotos` (site da empresa). Use a mais nítida e representativa no topo; demais no portfólio. `object-fit:cover` com `aspect-ratio` (4/5, 3/2, 1/1).
- Fotos do Maps variam de qualidade: escolha as nítidas, recorte com `object-position`, aplique película leve na cor da tinta para unificar.
- `loading="lazy"` exceto a primeira; `alt` descritivo e honesto.

## 7.4 Performance e acessibilidade
Sem frameworks; CSS enxuto; no máximo 2 famílias de fonte com 3–4 pesos; contraste AA; foco visível (`:focus-visible{outline:2px solid var(--accent);outline-offset:3px}`);
links de WhatsApp com `target="_blank" rel="noopener"`; nenhuma rolagem horizontal em 360px.
