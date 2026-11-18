import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import Logo from './Logo';
import { contact, hasCases, socialLinks, services, whatsappLink } from '../content';
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
              Agência de marketing para empresas que querem ser escolhidas. Marca, conteúdo, anúncios, vídeo e site num time só.
            </p>
          </div>

          <div className="footer__cols">
            <div>
              <h2 className="label">Navegação</h2>
              <ul>
                <li><Link to="/#servicos">Serviços</Link></li>
                <li><Link to="/#como-funciona">Como funciona</Link></li>
                {hasCases && <li><Link to="/cases">Cases</Link></li>}
                <li><Link to="/#faq">FAQ</Link></li>
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
                <li><a href={`mailto:${contact.email}`}>{contact.email.split('@')[0]}@<wbr />{contact.email.split('@')[1]}</a></li>
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

        <div className="footer__word" aria-hidden="true"><Logo tag={false} /></div>

        <div className="footer__bottom">
          <span>© {year} Agência Teleios</span>
          <span>τέλειος · completo</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
