import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Code, Palette, Video, CheckCircle2 } from 'lucide-react';
import './Home.css';
import { services, projects, differentials, workProcess } from '../mockData';

const Home = () => {
  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content fade-in-up">
            <span className="hero-label">Bem-vindo à Teleios Studio</span>
            <h1 className="hero-title">
              Criamos sistemas<br />
              <span className="text-gradient">completos e modernos</span>
            </h1>
            <p className="hero-description">
              Excelência técnica em programação, design e vídeo.<br />
              Soluções digitais que geram valor real para seu negócio.
            </p>
            <div className="hero-cta">
              <Link to="/contato" className="btn-primary">
                Iniciar Projeto
                <ArrowRight size={20} style={{ marginLeft: '0.5rem' }} />
              </Link>
              <Link to="/projetos" className="btn-secondary">
                Ver Projetos
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="section services-overview">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Nossos Serviços</h2>
            <p className="section-subtitle">
              Soluções completas para transformar suas ideias em realidade digital
            </p>
          </div>
          <div className="services-grid">
            <div className="service-card glass-card">
              <div className="service-icon">
                <Code size={32} />
              </div>
              <h3>Programação</h3>
              <p>{services[0].description}</p>
              <Link to="/servicos" className="service-link">
                Saiba mais <ArrowRight size={16} />
              </Link>
            </div>
            <div className="service-card glass-card">
              <div className="service-icon">
                <Palette size={32} />
              </div>
              <h3>Design</h3>
              <p>{services[1].description}</p>
              <Link to="/servicos" className="service-link">
                Saiba mais <ArrowRight size={16} />
              </Link>
            </div>
            <div className="service-card glass-card">
              <div className="service-icon">
                <Video size={32} />
              </div>
              <h3>Vídeo</h3>
              <p>{services[2].description}</p>
              <Link to="/servicos" className="service-link">
                Saiba mais <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Differentials */}
      <section className="section differentials">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Por que Teleios Studio?</h2>
            <p className="section-subtitle">
              Combinamos excelência técnica com visão estratégica
            </p>
          </div>
          <div className="differentials-grid">
            {differentials.map((diff) => (
              <div key={diff.id} className="differential-card">
                <CheckCircle2 size={24} className="differential-icon" />
                <h3>{diff.title}</h3>
                <p>{diff.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Work Process */}
      <section className="section work-process">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Nosso Processo</h2>
            <p className="section-subtitle">
              Metodologia clara e eficiente para garantir o sucesso do seu projeto
            </p>
          </div>
          <div className="process-grid">
            {workProcess.map((step) => (
              <div key={step.id} className="process-card glass-card">
                <div className="process-step">{step.step}</div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="section featured-projects">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Projetos em Destaque</h2>
            <p className="section-subtitle">
              Conheça alguns dos nossos trabalhos recentes
            </p>
          </div>
          <div className="projects-grid">
            {projects.slice(0, 3).map((project) => (
              <div key={project.id} className="project-card glass-card">
                <div className="project-type">{project.type}</div>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <div className="project-tech">
                  {project.tech.slice(0, 3).map((tech, idx) => (
                    <span key={idx} className="tech-tag">{tech}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link to="/projetos" className="btn-primary">
              Ver Todos os Projetos
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Pronto para transformar sua ideia em realidade?</h2>
            <p>Vamos conversar sobre seu projeto e criar algo incrível juntos.</p>
            <Link to="/contato" className="btn-primary btn-large">
              Falar com a Equipe
              <ArrowRight size={20} style={{ marginLeft: '0.5rem' }} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
