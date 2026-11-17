import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/* Observa todo .reveal / .lines que entrar no DOM e marca .is-in quando aparece. */
export function RevealManager() {
  const { pathname } = useLocation();

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
    );
    const scan = () =>
      document.querySelectorAll('.reveal:not(.is-in), .lines:not(.is-in)').forEach((el) => io.observe(el));
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname]);

  return null;
}

/* Rola até a âncora (/#servicos) ou para o topo ao trocar de página. */
export function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.slice(1);
      let tries = 0;
      const go = () => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        else if (tries++ < 20) requestAnimationFrame(go);
      };
      go();
    } else {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [pathname, hash]);

  return null;
}

/* Quebra um texto em linhas que sobem por máscara. */
export function Lines({ as: Tag = 'span', lines, className = '', delay = 0 }) {
  return (
    <Tag className={`lines ${className}`} style={{ '--d': `${delay}s` }}>
      {lines.map((content, i) => (
        <span className="line" key={i}>
          <span style={{ '--i': i }}>{content}</span>
        </span>
      ))}
    </Tag>
  );
}
