// Cores a partir da identidade do cliente: conversão, paletas derivadas e extração do logo.

export function hexToHsl(hex) {
  const h = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let hue = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    hue = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    hue *= 60;
  }
  return [Math.round(hue), Math.round(s * 100), Math.round(l * 100)];
}

export function hslToHex(h, s, l) {
  s /= 100; l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))))).toString(16).padStart(2, '0');
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const tone = (hex, { s, l, sMax = 100 }) => { const [h, s0] = hexToHsl(hex); return hslToHex(h, clamp(s ?? s0, 0, sMax), l); };

/* Paletas que respeitam a marca: tudo deriva do matiz das cores do cliente */
export function derivePalettes(colors = []) {
  const p = colors[0] || '#00C48C';
  const sec = colors[1] || (() => { const [h, s, l] = hexToHsl(p); return hslToHex((h + 28) % 360, s, l); })();
  const [, ps, pl] = hexToHsl(p);
  const accentLight = pl > 62 ? tone(p, { l: 48 }) : pl < 30 ? tone(p, { l: 42 }) : p;
  const accentDark = pl < 52 ? tone(p, { l: 62 }) : p;
  return [
    { id: 'clara', label: 'Clara', bg: tone(p, { s: Math.min(ps, 28), l: 97 }), ink: tone(p, { s: Math.min(ps, 40), l: 13 }), accent: accentLight, accent2: sec },
    { id: 'suave', label: 'Suave', bg: tone(p, { s: Math.min(ps, 40), l: 91 }), ink: tone(p, { s: Math.min(ps, 45), l: 17 }), accent: accentLight, accent2: sec },
    { id: 'escura', label: 'Escura', bg: tone(p, { s: Math.min(ps, 30), l: 8 }), ink: tone(p, { s: 12, l: 93 }), accent: accentDark, accent2: sec },
    { id: 'forte', label: 'Marca forte', bg: tone(p, { l: clamp(pl - 18, 16, 30) }), ink: tone(p, { s: 18, l: 96 }), accent: tone(sec, { l: 70 }), accent2: tone(p, { l: 80 }) },
    { id: 'neutra', label: 'Neutra', bg: '#F6F6F3', ink: '#16181B', accent: accentLight, accent2: sec },
  ];
}

/* Lê as cores principais de uma imagem (logo) direto no navegador */
export function extractColors(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const c = document.createElement('canvas');
      const w = (c.width = 80), h = (c.height = Math.max(1, Math.round((img.height / img.width) * 80)));
      const ctx = c.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(img, 0, 0, w, h);
      const data = ctx.getImageData(0, 0, w, h).data;
      const buckets = new Map();
      for (let i = 0; i < data.length; i += 4) {
        const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
        if (a < 200) continue;
        const hex = `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
        const [hh, s, l] = hexToHsl(hex);
        if (l > 93 || l < 7) continue; // ignora fundo branco/preto
        const key = `${Math.round(hh / 15)}-${Math.round(s / 25)}-${Math.round(l / 20)}`;
        const bk = buckets.get(key) || { w: 0, c: 0, r: 0, g: 0, b: 0 };
        bk.w += 1 + s / 50; bk.c += 1; bk.r += r; bk.g += g; bk.b += b;
        buckets.set(key, bk);
      }
      URL.revokeObjectURL(url);
      const sorted = [...buckets.values()].sort((a, b) => b.w - a.w)
        .map((bk) => `#${[bk.r, bk.g, bk.b].map((v) => Math.round(v / bk.c).toString(16).padStart(2, '0')).join('')}`.toUpperCase());
      // remove tons muito parecidos
      const out = [];
      sorted.forEach((hex) => {
        const [h1] = hexToHsl(hex);
        if (out.every((o) => Math.abs(hexToHsl(o)[0] - h1) > 18)) out.push(hex);
      });
      if (!out.length) reject(new Error('Não encontrei cores no logo. Tente uma imagem com fundo transparente.'));
      else resolve(out.slice(0, 3));
    };
    img.onerror = () => reject(new Error('Não consegui abrir essa imagem.'));
    img.src = url;
  });
}
