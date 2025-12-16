import React from 'react';
import { Target, Lightbulb, Shield, Zap } from 'lucide-react';
import './About.css';

const About = () => {
  const values = [
    {
      icon: <Target size={32} />,
      title: "Excelência Técnica",
      description: "Buscamos a perfeição em cada linha de código, pixel e frame. Qualidade não é um diferencial, é nossa base."
    },
    {
      icon: <Lightbulb size={32} />,
      title: "Inovação Constante",
      description: "Estamos sempre à frente, explorando novas tecnologias e metodologias para entregar soluções superiores."
    },
    {
      icon: <Shield size={32} />,
      title: "Integridade",
      description: "Construimos relações baseadas em confiança, transparência e compromisso com o sucesso de cada projeto."
    },
    {
      icon: <Zap size={32} />,
      title: "Resultados Reais",
      description: "Nosso foco é gerar impacto mensurável. Tecnologia com propósito, design com estratégia."
    }
  ];

  return (
    <div className="about-page">
      {/* Hero */}
      <section className="about-hero">
        <div className="container">
          <div className="about-hero-content">
            <span className="hero-label">Sobre a Teleios Studio</span>
            <h1 className="hero-title">
              Criamos sistemas completos,<br />
              com <span className="text-gradient">excelência técnica</span><br />
              e visão de futuro
            </h1>
          </div>
        </div>
      </section>

      {/* Manifesto */}
      <section className="section manifesto">
        <div className="container">
          <div className="manifesto-content">
            <div className="manifesto-text">
              <h2 className="section-title">Nosso Manifesto</h2>
              <div className="manifesto-paragraphs">
                <p>
                  Na <strong>Teleios Studio</strong>, acreditamos que tecnologia bem feita transforma negócios e vidas. Não criamos apenas softwares, designs ou vídeos — criamos <strong>experiências completas</strong> que conectam, engajam e geram resultados.
                </p>
                <p>
                  Nosso nome vem do grego <em>Téleios</em> (Τέλειος), que significa <strong>completo, maduro, plenamente desenvolvido</strong>. Esse é o nosso compromisso: entregar soluções digitais que não apenas funcionam, mas que são <strong>técnica e esteticamente impecáveis</strong>.
                </p>
                <p>
                  Trabalhamos com empresas, startups e projetos que valorizam <strong>excelência, integridade e visão de longo prazo</strong>. Somos parceiros estratégicos que entendem que tecnologia sem propósito é apenas código.
                </p>
                <p>
                  Combinamos <strong>programação de ponta</strong>, <strong>design com propósito</strong> e <strong>storytelling visual</strong> para criar produtos digitais que se destacam no mercado e fazem diferença real.
                </p>
              </div>
            </div>
            <div className="manifesto-stats">
              <div className="stat-card glass-card">
                <div className="stat-number">100%</div>
                <div className="stat-label">Compromisso com Qualidade</div>
              </div>
              <div className="stat-card glass-card">
                <div className="stat-number">24/7</div>
                <div className="stat-label">Suporte ao Cliente</div>
              </div>
              <div className="stat-card glass-card">
                <div className="stat-number">+50</div>
                <div className="stat-label">Projetos Entregues</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section values">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Nossos Valores</h2>
            <p className="section-subtitle">
              Os princípios que guiam cada decisão e projeto na Teleios Studio
            </p>
          </div>
          <div className="values-grid">
            {values.map((value, index) => (
              <div key={index} className="value-card glass-card">
                <div className="value-icon">{value.icon}</div>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Positioning */}
      <section className="section positioning">
        <div className="container">
          <div className="positioning-content">
            <h2 className="section-title">Nosso Posicionamento</h2>
            <div className="positioning-grid">
              <div className="positioning-card">
                <h3>Para quem trabalhamos</h3>
                <ul>
                  <li>Empresas que buscam transformação digital com excelência</li>
                  <li>Startups que precisam de MVP robusto e escalável</li>
                  <li>Projetos que valorizam design, tecnologia e ética</li>
                  <li>Empreendedores que pensam a longo prazo</li>
                </ul>
              </div>
              <div className="positioning-card">
                <h3>Como trabalhamos</h3>
                <ul>
                  <li>Metodologia ágil com entregas incrementais</li>
                  <li>Comunicação transparente e constante</li>
                  <li>Foco em resultados mensuráveis</li>
                  <li>Parceria estratégica de longo prazo</li>
                </ul>
              </div>
              <div className="positioning-card">
                <h3>O que entregamos</h3>
                <ul>
                  <li>Código limpo, testado e documentado</li>
                  <li>Design systems completos e consistentes</li>
                  <li>Vídeos com storytelling profissional</li>
                  <li>Suporte pós-lançamento e evolução contínua</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
