import React, { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import './Projects.css';
import { projects } from '../mockData';

const Projects = () => {
  const [filter, setFilter] = useState('Todos');

  const categories = ['Todos', 'Programação', 'Design', 'Vídeo'];

  const filteredProjects = filter === 'Todos' 
    ? projects 
    : projects.filter(project => project.category === filter);

  return (
    <div className="projects-page">
      {/* Hero */}
      <section className="projects-hero">
        <div className="container">
          <div className="projects-hero-content">
            <span className="hero-label">Nossos Projetos</span>
            <h1 className="hero-title">
              Conheça nosso <span className="text-gradient">portfólio</span><br />
              de projetos entregues
            </h1>
            <p className="hero-description">
              Cada projeto é uma história de sucesso construida<br />
              com excelência técnica, design e estratégia.
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="section projects-section">
        <div className="container">
          <div className="projects-filters">
            {categories.map((category) => (
              <button
                key={category}
                className={`filter-btn ${filter === category ? 'active' : ''}`}
                onClick={() => setFilter(category)}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Projects Grid */}
          <div className="projects-grid-page">
            {filteredProjects.map((project) => (
              <div key={project.id} className="project-card-page glass-card">
                <div className="project-header">
                  <div className="project-type-badge">{project.type}</div>
                  <div className="project-year">{project.year}</div>
                </div>
                
                <div className="project-content">
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                  
                  <div className="project-tech-list">
                    {project.tech.map((tech, idx) => (
                      <span key={idx} className="tech-tag-page">{tech}</span>
                    ))}
                  </div>
                </div>

                <div className="project-footer">
                  <button className="project-link-btn">
                    Ver Detalhes
                    <ExternalLink size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <div className="no-projects">
              <p>Nenhum projeto encontrado nesta categoria.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Projects;
