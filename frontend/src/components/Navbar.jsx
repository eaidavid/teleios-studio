import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import Logo from './Logo';
import { whatsappLink } from '../content';
import './Navbar.css';

const links = [
  { id: 'servicos', label: 'Serviços' },
  { id: 'como-funciona', label: 'Como funciona' },
  { id: 'cases', label: 'Cases' },
  { id: 'faq', label: 'FAQ' },
];

const Navbar = () => {
  const { pathname } = useLocation();
  const [active, setActive] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [pill, setPill] = useState({ x: 0, w: 0, show: false });
  const listRef = useRef(null);

  // Estado "rolado" do menu
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Scroll-spy: qual seção está na tela
  useEffect(() => {
    if (pathname.startsWith('/cases')) {
      setActive('cases');
      return undefined;
    }
    const sections = links.map((l) => document.getElementById(l.id)).filter(Boolean);
    if (!sections.length) {
      setActive(null);
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    sections.forEach((s) => io.observe(s));
    const onTop = () => window.scrollY < 300 && setActive(null);
    window.addEventListener('scroll', onTop, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener('scroll', onTop);
    };
  }, [pathname]);

  // Pílula que desliza até o link ativo
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const el = active && list.querySelector(`[data-id="${active}"]`);
    if (el) setPill({ x: el.offsetLeft, w: el.offsetWidth, show: true });
    else setPill((p) => ({ ...p, show: false }));
  }, [active]);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header className={`nav ${scrolled ? 'is-scrolled' : ''} ${open ? 'is-open' : ''}`}>
      <div className="nav__bar">
        <Link to="/" className="nav__logo" onClick={() => window.scrollY > 0 && pathname === '/' && window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <Logo />
        </Link>

        <nav aria-label="Principal" className="nav__links" ref={listRef}>
          <span
            className="nav__pill"
            aria-hidden="true"
            style={{ transform: `translateX(${pill.x}px)`, width: pill.w, opacity: pill.show ? 1 : 0 }}
          />
          {links.map((l) => (
            <Link
              key={l.id}
              data-id={l.id}
              to={l.id === 'cases' && pathname.startsWith('/cases') ? '/cases' : `/#${l.id}`}
              className={`nav__link ${active === l.id ? 'is-active' : ''}`}
              aria-current={active === l.id ? 'true' : undefined}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <a className="btn btn-primary btn-sm nav__cta" href={whatsappLink()} target="_blank" rel="noopener noreferrer">
          Quero um diagnóstico <ArrowUpRight size={16} />
        </a>

        <button
          type="button"
          className="nav__toggle"
          aria-expanded={open}
          aria-controls="menu-mobile"
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          onClick={() => setOpen((o) => !o)}
        >
          <span />
          <span />
        </button>
      </div>

      <div id="menu-mobile" className="nav__sheet" hidden={!open}>
        <nav aria-label="Menu mobile">
          {links.map((l, i) => (
            <Link key={l.id} to={`/#${l.id}`} style={{ '--i': i }} onClick={() => setOpen(false)}>
              <span className="label">0{i + 1}</span>
              {l.label}
            </Link>
          ))}
        </nav>
        <a className="btn btn-primary" href={whatsappLink()} target="_blank" rel="noopener noreferrer">
          Falar no WhatsApp <ArrowUpRight size={18} />
        </a>
      </div>
    </header>
  );
};

export default Navbar;
