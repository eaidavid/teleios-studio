import React from 'react';
import { ArrowUpRight, Play } from 'lucide-react';
import './ProjectCard.css';

/* Capas ilustrativas em código — substituir por imagens reais dos projetos. */
const Cover = ({ type, title }) => {
  switch (type) {
    case 'dashboard':
      return (
        <div className="cv cv--dashboard">
          <div className="cv__win">
            <div className="cv__top"><i /><i /><i /></div>
            <div className="cv__grid">
              <div className="cv__stat"><small>Faturamento</small><b>R$ 482 mil</b></div>
              <div className="cv__stat"><small>Pedidos</small><b>3.918</b></div>
              <div className="cv__stat"><small>Estoque</small><b>96%</b></div>
              <svg className="cv__line" viewBox="0 0 300 90" preserveAspectRatio="none">
                <path d="M0 70 C 30 60, 50 72, 80 52 S 130 40, 160 46 S 220 18, 250 24 S 290 8, 300 6" fill="none" stroke="#00C48C" strokeWidth="2.5" />
                <path d="M0 70 C 30 60, 50 72, 80 52 S 130 40, 160 46 S 220 18, 250 24 S 290 8, 300 6 V 90 H 0 Z" fill="rgba(0,196,140,.12)" />
              </svg>
              <div className="cv__rows">{[0, 1, 2, 3].map((i) => <span key={i} />)}</div>
            </div>
          </div>
        </div>
      );
    case 'brand':
      return (
        <div className="cv cv--brand">
          <span className="cv__logo">{title.slice(0, 2)}</span>
          <div className="cv__sheet">
            <i style={{ background: '#00C48C' }} /><i style={{ background: '#1F3C88' }} /><i style={{ background: '#E9EEEC' }} />
          </div>
          <span className="cv__name">{title.toLowerCase()}</span>
        </div>
      );
    case 'video':
    case 'motion':
      return (
        <div className={`cv cv--video ${type === 'motion' ? 'is-motion' : ''}`}>
          <div className="cv__shapes"><i /><i /><i /></div>
          <span className="cv__play"><Play size={22} fill="currentColor" /></span>
          <div className="cv__tl"><span /></div>
        </div>
      );
    case 'app':
      return (
        <div className="cv cv--app">
          {[0, 1].map((n) => (
            <div className="cv__phone" key={n}>
              <div className="cv__ring" style={{ '--p': n ? 0.62 : 0.84 }}>
                <b>{n ? '62%' : '84%'}</b>
              </div>
              <div className="cv__list">{[0, 1, 2].map((i) => <span key={i} />)}</div>
            </div>
          ))}
        </div>
      );
    case 'chart':
    default:
      return (
        <div className="cv cv--chart">
          <div className="cv__donut" />
          <div className="cv__hbars">
            {[86, 64, 48, 30].map((w, i) => <span key={i} style={{ '--w': `${w}%` }} />)}
          </div>
        </div>
      );
  }
};

const ProjectCard = ({ project, index = 0 }) => (
  <article className={`pc pc--${project.size} reveal`} style={{ '--d': `${(index % 2) * 0.08}s` }}>
    <div className="pc__media">
      <Cover type={project.cover} title={project.title} />
    </div>
    <div className="pc__info">
      <div className="pc__meta">
        <span className="pc__tag">{project.category}</span>
        <span>{project.type}</span>
        <span className="pc__year">{project.year}</span>
      </div>
      <div className="pc__row">
        <div>
          <h3>{project.title}</h3>
          <p>{project.summary}</p>
        </div>
        <span className="pc__arrow" aria-hidden="true"><ArrowUpRight size={18} /></span>
      </div>
    </div>
  </article>
);

export default ProjectCard;
