// Animações de clique: onda saindo do ponto tocado e faíscas nas ações principais.
const SEL = '.btn, .btn-icon, .chip, .nav-link, .camp-row, .seg button';
const COLORS = ['#00C48C', '#5CF0C1', '#E8B04A', '#C98BE8', '#6F86C8', '#FF7A59'];

export function installClickFx() {
  if (typeof window === 'undefined' || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  addEventListener('pointerdown', (e) => {
    const el = e.target.closest?.(SEL);
    if (!el || el.disabled) return;
    const r = el.getBoundingClientRect();
    const size = Math.max(r.width, r.height) * 2.2;
    const dot = document.createElement('span');
    dot.className = 'ripple';
    dot.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - r.left - size / 2}px;top:${e.clientY - r.top - size / 2}px`;
    el.appendChild(dot);
    setTimeout(() => dot.remove(), 650);
  }, { passive: true });
  addEventListener('click', (e) => {
    const el = e.target.closest?.('.btn-primary');
    if (!el || el.disabled) return;
    const x = e.clientX || el.getBoundingClientRect().left + el.offsetWidth / 2;
    const y = e.clientY || el.getBoundingClientRect().top + el.offsetHeight / 2;
    for (let i = 0; i < 10; i++) {
      const s = document.createElement('span');
      const ang = (Math.PI * 2 * i) / 10 + Math.random() * 0.5;
      const dist = 28 + Math.random() * 30;
      s.className = 'spark';
      s.style.cssText = `left:${x}px;top:${y}px;background:${COLORS[i % COLORS.length]};--dx:${Math.cos(ang) * dist}px;--dy:${Math.sin(ang) * dist - 10}px;--rot:${Math.random() * 360}deg;border-radius:${i % 2 ? '50%' : '2px'}`;
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 750);
    }
  }, { passive: true });
}
