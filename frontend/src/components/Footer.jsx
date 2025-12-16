import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Linkedin, Youtube, Github, Mail, Phone } from 'lucide-react';
import './Footer.css';
import { socialLinks } from '../mockData';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-logo">
              <span className="logo-teleios">Teleios</span>
              <span className="logo-studio">Studio</span>
            </div>
            <p className="footer-tagline">
              Tecnologia. Design. Vídeo.
            </p>
            <p className="footer-description">
              Criamos sistemas completos, com excelência técnica e visão de futuro.
            </p>
          </div>

          <div className="footer-section">
            <h3 className="footer-title">Navegação</h3>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/sobre">Sobre</Link></li>
              <li><Link to="/servicos">Serviços</Link></li>
              <li><Link to="/projetos">Projetos</Link></li>
              <li><Link to="/contato">Contato</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3 className="footer-title">Serviços</h3>
            <ul className="footer-links">
              <li><span>Programação</span></li>
              <li><span>Design de Produto</span></li>
              <li><span>Vídeo & Motion</span></li>
              <li><span>Consultoria Técnica</span></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3 className="footer-title">Contato</h3>
            <ul className="footer-contact">
              <li>
                <Phone size={16} />
                <span>+55 15 98176-3815</span>
              </li>
              <li>
                <Mail size={16} />
                <span>contato@teleiosstudio.com</span>
              </li>
            </ul>
            <div className="footer-social">
              <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <Instagram size={20} />
              </a>
              <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <Linkedin size={20} />
              </a>
              <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                <Youtube size={20} />
              </a>
              <a href={socialLinks.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <Github size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {currentYear} Teleios Studio. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
