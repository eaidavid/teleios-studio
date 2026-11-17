import React, { useMemo, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import ProjectCard from '../components/ProjectCard';
import { Lines } from '../components/Effects';
import { projects, services, whatsappLink } from '../content';
import { layoutProjects } from '../lib/layout';
import './Home.css';
import './Projects.css';

const categories = ['Todos', ...services.map((s) => s.category)];

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
          <span className="label reveal"><b>{String(projects.length).padStart(2, '0')}</b> Projetos</span>
          <h1 className="mix pp-hero__title">
            <Lines lines={[<>Tudo que a gente</>, <><strong>já colocou no ar</strong></>]} delay={0.1} />
          </h1>
          <p className="lead reveal" style={{ '--d': '0.3s' }}>
            Sistemas, marcas e vídeos para empresas de vários tamanhos. Filtra pelo que você precisa e vê como a gente
            resolveu problemas parecidos com o seu.
          </p>
        </div>
      </section>

      <section className="section pp-list" aria-label="Lista de projetos">
        <div className="container">
          <div className="filters" role="tablist" aria-label="Filtrar projetos">
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
            <p className="mix">Seu projeto pode ser <strong>o próximo daqui.</strong></p>
            <a className="btn btn-primary" href={whatsappLink('Oi, Teleios! Vi os projetos e quero conversar sobre o meu.')} target="_blank" rel="noopener noreferrer">
              Bora conversar <ArrowUpRight size={18} />
            </a>
          </div>
        </div>
      </section>
    </>
  );
};

export default Projects;
