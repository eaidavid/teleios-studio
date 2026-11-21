import React, { useMemo, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import ProjectCard from '../components/ProjectCard';
import { Lines } from '../components/Effects';
import { projects, whatsappLink } from '../content';
import { layoutProjects } from '../lib/layout';
import './Home.css';
import './Projects.css';

const categories = ['Todos', ...Array.from(new Set(projects.map((p) => p.category)))];

const Projects = () => {
  const [cat, setCat] = useState('Todos');
  const list = useMemo(
    () => layoutProjects(cat === 'Todos' ? projects : projects.filter((p) => p.category === cat)),
    [cat]
  );

  return (
    <>
      <section className="pp-hero">
        <div className="container">
          <span className="label reveal"><b>{String(projects.length).padStart(2, '0')}</b> Cases</span>
          <h1 className="mix pp-hero__title">
            <Lines lines={[<>Empresas que hoje</>, <><strong>são <em className="g">escolhidas</em></strong></>]} delay={0.1} />
          </h1>
          <p className="lead reveal" style={{ '--d': '0.3s' }}>
            Identidade visual, interfaces, sites, sistemas e vídeo. Filtra pelo tipo de trabalho e vê como a gente
            resolveu problemas parecidos com o seu.
          </p>
        </div>
      </section>

      <section className="section pp-list" aria-label="Lista de cases">
        <div className="container">
          <div className="filters" role="tablist" aria-label="Filtrar cases">
            {categories.map((c) => {
              const count = c === 'Todos' ? projects.length : projects.filter((p) => p.category === c).length;
              return (
                <button
                  key={c}
                  type="button"
                  role="tab"
                  aria-selected={cat === c}
                  className={`filter ${cat === c ? 'is-active' : ''}`}
                  onClick={() => setCat(c)}
                >
                  {c} <sup>{count}</sup>
                </button>
              );
            })}
          </div>
          <div className="pgrid" key={cat}>
            {list.map((p, i) => (
              <ProjectCard key={p.id} project={p} index={i} />
            ))}
          </div>

          <div className="pp-cta reveal">
            <p className="mix">O próximo case pode ser <strong>o seu.</strong></p>
            <a className="btn btn-primary" href={whatsappLink('Oi, Teleios! Vi os cases e quero um diagnóstico do meu marketing.')} target="_blank" rel="noopener noreferrer">
              Quero um diagnóstico <ArrowUpRight size={18} />
            </a>
          </div>
        </div>
      </section>
    </>
  );
};

export default Projects;
