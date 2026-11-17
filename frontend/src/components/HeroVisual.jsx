import React, { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { incoming } from '../content';
import './HeroVisual.css';

const tints = ['#00C48C', '#6F86C8', '#E8A87C', '#C86B7E'];

/* Pilha de mensagens chegando: o resultado que o marketing deve gerar. */
const HeroVisual = () => {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const id = setInterval(() => setTick((t) => t + 1), 2800);
    return () => clearInterval(id);
  }, []);

  // A mais nova fica em cima; mostramos 3 por vez
  const visible = [0, 1, 2].map((k) => {
    const idx = (((tick - k) % incoming.length) + incoming.length) % incoming.length;
    return { ...incoming[idx], key: tick - k, idx, depth: k };
  });

  return (
    <div className="lead-stack" aria-hidden="true">
      <div className="lead-stack__halo" />
      <div className="lead-stack__head">
        <span className="lead-stack__live" />
        Novas conversas
      </div>
      <ul className="lead-stack__list">
        {visible.map((m) => (
          <li key={m.key} className="note" style={{ '--depth': m.depth }}>
            <span className="note__icon"><MessageCircle size={18} strokeWidth={2.2} /></span>
            <div className="note__body">
              <div className="note__top">
                <b>{m.name}</b>
                <time>{m.time}</time>
              </div>
              <p>{m.text}</p>
            </div>
            <span className="note__avatar" style={{ background: tints[m.idx % tints.length] }}>{m.name[0]}</span>
          </li>
        ))}
      </ul>
      <div className="lead-stack__chip">
        <span className="lead-stack__dot" /> Anúncio ativo · sua região
      </div>
    </div>
  );
};

export default HeroVisual;
