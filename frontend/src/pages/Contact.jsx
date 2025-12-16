import React, { useState } from 'react';
import { MapPin, Phone, Mail, Send } from 'lucide-react';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    projectType: '',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Formatar mensagem para WhatsApp
    const whatsappMessage = `Olá! Meu nome é ${formData.name}%0A%0AEmail: ${formData.email}%0ATipo de Projeto: ${formData.projectType}%0A%0AMensagem:%0A${formData.message}`;
    
    // Abrir WhatsApp com mensagem pré-preenchida
    const whatsappUrl = `https://wa.me/5515981763815?text=${whatsappMessage}`;
    window.open(whatsappUrl, '_blank');
    
    // Limpar formulário
    setFormData({
      name: '',
      email: '',
      projectType: '',
      message: ''
    });
  };

  return (
    <div className="contact-page">
      {/* Hero */}
      <section className="contact-hero">
        <div className="container">
          <div className="contact-hero-content">
            <span className="hero-label">Entre em Contato</span>
            <h1 className="hero-title">
              Vamos <span className="text-gradient">criar algo</span><br />
              incrível juntos
            </h1>
            <p className="hero-description">
              Preencha o formulário abaixo e nossa equipe entrará<br />
              em contato em breve para discutir seu projeto.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Content */}
      <section className="section contact-section">
        <div className="container">
          <div className="contact-grid">
            {/* Contact Info */}
            <div className="contact-info">
              <h2>Informações de Contato</h2>
              <p className="contact-info-description">
                Estamos prontos para transformar suas ideias em realidade digital. Entre em contato e vamos conversar sobre seu projeto.
              </p>

              <div className="contact-methods">
                <div className="contact-method">
                  <div className="method-icon">
                    <Phone size={24} />
                  </div>
                  <div className="method-content">
                    <h3>Telefone / WhatsApp</h3>
                    <a href="https://wa.me/5515981763815" target="_blank" rel="noopener noreferrer">
                      +55 15 98176-3815
                    </a>
                  </div>
                </div>

                <div className="contact-method">
                  <div className="method-icon">
                    <Mail size={24} />
                  </div>
                  <div className="method-content">
                    <h3>Email</h3>
                    <a href="mailto:contato@teleiosstudio.com">
                      contato@teleiosstudio.com
                    </a>
                  </div>
                </div>

                <div className="contact-method">
                  <div className="method-icon">
                    <MapPin size={24} />
                  </div>
                  <div className="method-content">
                    <h3>Localização</h3>
                    <p>São Paulo, Brasil</p>
                  </div>
                </div>
              </div>

              <div className="availability-card glass-card">
                <h3>Horário de Atendimento</h3>
                <p>Segunda a Sexta: 9h - 18h</p>
                <p>Sábado: 9h - 13h</p>
                <p className="availability-note">
                  Respondemos todas as solicitações em até 24 horas úteis.
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="contact-form-wrapper">
              <form onSubmit={handleSubmit} className="contact-form glass-card">
                <h2>Solicitar Orçamento</h2>
                
                <div className="form-group">
                  <label htmlFor="name">Nome Completo *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Seu nome"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="seu@email.com"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="projectType">Tipo de Projeto *</label>
                  <select
                    id="projectType"
                    name="projectType"
                    value={formData.projectType}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Selecione uma opção</option>
                    <option value="Programação">Programação</option>
                    <option value="Design">Design</option>
                    <option value="Vídeo">Vídeo</option>
                    <option value="Programação + Design">Programação + Design</option>
                    <option value="Programação + Vídeo">Programação + Vídeo</option>
                    <option value="Design + Vídeo">Design + Vídeo</option>
                    <option value="Pacote Completo">Pacote Completo</option>
                    <option value="Consultoria">Consultoria</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="message">Mensagem *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="6"
                    placeholder="Conte-nos sobre seu projeto, objetivos e prazos..."
                  ></textarea>
                </div>

                <button type="submit" className="btn-primary btn-submit">
                  Enviar via WhatsApp
                  <Send size={20} />
                </button>

                <p className="form-note">
                  Ao enviar, você será redirecionado para o WhatsApp com sua mensagem pré-preenchida.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
