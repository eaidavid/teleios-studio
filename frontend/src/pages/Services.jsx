import React from 'react';
import { Code, Palette, Video, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Services.css';
import { services } from '../mockData';

const Services = () => {
  const serviceIcons = {
    'Programação': <Code size={40} />,
    'Design': <Palette size={40} />,
    'Vídeo': <Video size={40} />
  };

  return (
    <div className="services-page">
      {/* Hero */}
      <section className="services-hero">
        <div className="container">
          <div className="services-hero-content">
            <span className="hero-label">Nossos Serviços</span>
            <h1 className="hero-title">
              Soluções <span className="text-gradient">completas</span><br />
              para seu negócio digital
            </h1>
            <p className="hero-description">
              Da estratégia à execução, oferecemos programação,<br />
              design e vídeo com excelência técnica e criativa.
            </p>
          </div>
        </div>
      </section>

      {/* Services Detail */}
      <section className="section services-detail">
        <div className="container">
          {services.map((service, index) => (
            <div 
              key={service.id} 
              className={`service-detail-card ${index % 2 !== 0 ? 'reverse' : ''}`}
            >
              <div className="service-detail-icon">
                <div className="icon-wrapper">
                  {serviceIcons[service.title]}
                </div>
              </div>
              <div className="service-detail-content">
                <h2>{service.title}</h2>
                <p className="service-main-description">{service.description}</p>
                <p className="service-extended-description">{service.details}</p>
                
                <div className="service-benefits">
                  <h3>Benefícios:</h3>
                  <ul>
                    {service.benefits.map((benefit, idx) => (
                      <li key={idx}>
                        <CheckCircle2 size={18} />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="service-for-who">
                  <h3>Para quem é:</h3>
                  <p>{service.forWho}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="section services-cta">
        <div className="container">
          <div className="cta-card glass-card">
            <h2>Precisa de uma combinação de serviços?</h2>
            <p>
              Oferecemos pacotes personalizados que integram programação, design e vídeo<br />
              para entregar soluções digitais verdadeiramente completas.
            </p>
            <Link to="/contato" className="btn-primary btn-large">
              Solicitar Orçamento
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;
