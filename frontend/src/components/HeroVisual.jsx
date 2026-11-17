import React, { useEffect, useRef, useState } from 'react';
import { Play } from 'lucide-react';
import './HeroVisual.css';

const code = [
  ['k', 'const'], ['t', ' pedido '], ['k', '= await'], ['t', ' api.'], ['f', 'criar'], ['t', '({'],
];

function useTimecode() {
  const [f, setF] = useState(312);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const id = setInterval(() => setF((n) => (n + 1) % (24 * 60)), 1000 / 24);
    return () => clearInterval(id);
  }, []);
  const s = Math.floor(f / 24);
  const pad = (n) => String(n).padStart(2, '0');
  return `00:00:${pad(s)}:${pad(f % 24)}`;
}

/* Composição: o sistema (programação), a marca (design) e o frame (vídeo). */
const HeroVisual = () => {
  const ref = useRef(null);
  const tc = useTimecode();

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    let raf = 0;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) / r.width;
      const y = (e.clientY - (r.top + r.height / 2)) / r.height;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty('--mx', x.toFixed(3));
        el.style.setProperty('--my', y.toFixed(3));
      });
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="hv" ref={ref} aria-hidden="true">
      <div className="hv__glow" />

      {/* Sistema */}
      <div className="hv__card hv__app" style={{ '--depth': 18 }}>
        <div className="hv__chrome">
          <i /><i /><i />
          <span>painel.suaempresa.com.br</span>
        </div>
        <div className="hv__app-body">
          <aside>
            <b className="on" /><b /><b /><b />
          </aside>
          <div className="hv__app-main">
            <div className="hv__kpis">
              <div><small>Pedidos hoje</small><strong>128</strong><em>+12%</em></div>
              <div><small>Em estoque</small><strong>4.302</strong><em>ok</em></div>
            </div>
            <div className="hv__bars">
              {[42, 58, 36, 72, 64, 88, 54, 96, 70, 82].map((h, i) => (
                <span key={i} style={{ '--h': `${h}%`, '--i': i }} />
              ))}
            </div>
            <div className="hv__code">
              {code.map(([cls, txt], i) => (
                <span key={i} className={cls}>{txt}</span>
              ))}
              <span className="hv__caret" />
            </div>
          </div>
        </div>
      </div>

      {/* Marca */}
      <div className="hv__card hv__brand" style={{ '--depth': 34 }}>
        <div className="hv__brand-mark">T</div>
        <div className="hv__brand-info">
          <small>Identidade</small>
          <div className="hv__swatches">
            <i style={{ background: '#00C48C' }} />
            <i style={{ background: '#0B1C2D' }} />
            <i style={{ background: '#1F3C88' }} />
            <i style={{ background: '#E9EEEC' }} />
          </div>
          <span className="hv__aa">Aa <b>Aa</b></span>
        </div>
      </div>

      {/* Vídeo */}
      <div className="hv__card hv__video" style={{ '--depth': 26 }}>
        <div className="hv__frame">
          <span className="hv__rec">● REC</span>
          <span className="hv__play"><Play size={18} fill="currentColor" /></span>
          <span className="hv__tc">{tc}</span>
        </div>
        <div className="hv__timeline">
          <div className="hv__track"><i style={{ '--w': '38%' }} /><i style={{ '--w': '24%' }} /><i style={{ '--w': '30%' }} /></div>
          <div className="hv__track alt"><i style={{ '--w': '20%' }} /><i style={{ '--w': '46%' }} /></div>
          <span className="hv__head" />
        </div>
      </div>
    </div>
  );
};

export default HeroVisual;
