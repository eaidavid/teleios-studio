import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import './ProjectCard.css';

/* Capa em estilo pôster com a paleta do cliente. Substituir por imagens reais do case. */
const Poster = ({ project }) => {
  const { palette, layout, word } = project;
  return (
    <div
      className={`poster poster--${layout}`}
      style={{ '--p-bg': palette.bg, '--p-ink': palette.ink, '--p-ac': palette.accent }}
      aria-hidden="true"
    >
      <span className="poster__shape" />
      <span className="poster__shape poster__shape--2" />
      <span className="poster__word">{word}</span>
      <span className="poster__meta">{project.services[0]}</span>
    </div>
  );
};

const ProjectCard = ({ project, index = 0 }) => (
  <article className={`pc pc--${project.size} reveal`} style={{ '--d': `${(index % 2) * 0.08}s` }}>
    <div className="pc__media">
      <Poster project={project} />
      <span className="pc__view" aria-hidden="true">Ver case <ArrowUpRight size={16} /></span>
    </div>
    <div className="pc__info">
      <div className="pc__row">
        <div className="pc__text">
          <div className="pc__meta">
            <span className="pc__tag">{project.category}</span>
            {project.services.slice(0, 3).map((s) => (
              <span key={s}>{s}</span>
            ))}
          </div>
          <h3>{project.title}</h3>
          <p><span>Desafio:</span> {project.challenge}</p>
        </div>
        <span className="pc__arrow" aria-hidden="true"><ArrowUpRight size={18} /></span>
      </div>
    </div>
  </article>
);

export default ProjectCard;
