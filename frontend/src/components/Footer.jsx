import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import Logo from './Logo';
import { contact, socialLinks, services, whatsappLink } from '../content';
import './Footer.css';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__top">
          <div className="footer__brand">
            <Logo />
            <p>
              Código, design e vídeo para empresas que querem fazer tudo direito, do começo ao fim.
            </p>
          </div>

          <div className="footer__cols">
            <div>
              <h2 className="label">Navegação</h2>
              <ul>
                <li><Link to="/#projetos">Projetos</Link></li>
                <li><Link to="/#servicos">Serviços</Link></li>
                <li><Link to="/#sobre">Sobre</Link></li>
                <li><Link to="/#contato">Contato</Link></li>
              </ul>
            </div>
            <div>
              <h2 className="label">Serviços</h2>
              <ul>
                {services.map((s) => (
                  <li key={s.id}><Link to="/#servicos">{s.title}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="label">Contato</h2>
              <ul>
                <li>
                  <a href={whatsappLink()} target="_blank" rel="noopener noreferrer">{contact.whatsappDisplay}</a>
                </li>
                <li><a href={`mailto:${contact.email}`}>{contact.email}</a></li>
              </ul>
            </div>
            <div>
              <h2 className="label">Redes</h2>
              <ul>
                {socialLinks.map((s) => (
                  <li key={s.id}>
                    <a href={s.href} target="_blank" rel="noopener noreferrer" className="footer__social">
                      {s.label} <ArrowUpRight size={14} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="footer__word" aria-hidden="true">teleios</div>

        <div className="footer__bottom">
          <span>© {year} Teleios Studio</span>
          <span>τέλειος · completo, feito até o fim</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
