import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownRight, ArrowRight, ArrowUpRight, Check, Copy, MessageCircle } from 'lucide-react';
import HeroVisual from '../components/HeroVisual';
import ProjectCard from '../components/ProjectCard';
import { Lines } from '../components/Effects';
import { contact, differentials, process, projects, services, touchpoints, whatsappLink } from '../content';
import { layoutProjects } from '../lib/layout';
import './Home.css';

/* Progresso de rolagem de um elemento (0 → 1) em --p */
function useScrollVar(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    let raf = 0;
    const update = () => {
      const r = el.getBoundingClientRect();
      const p = 1 - (r.bottom / (window.innerHeight + r.height));
      el.style.setProperty('--p', Math.min(1, Math.max(0, p)).toFixed(4));
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [ref]);
}

const categories = ['Todos', ...services.map((s) => s.category)];

const Hero = () => (
  <section className="hero" aria-labelledby="hero-title">
    <div className="container hero__grid">
      <div className="hero__copy">
        <span className="chip reveal"><span className="dot" />Estúdio de código, design e vídeo</span>
        <h1 id="hero-title" className="mix hero__title">
          <Lines
            lines={[
              <>Sistema, marca</>,
              <>e vídeo <strong>feitos</strong></>,
              <><strong>por inteiro.</strong></>,
            ]}
            delay={0.1}
          />
        </h1>
        <p className="lead reveal" style={{ '--d': '0.35s' }}>
          A gente desenvolve o sistema que organiza sua operação, a marca que faz você ser lembrado e o vídeo
          que explica o que você faz. Mesmo time, do começo ao fim.
        </p>
        <div className="hero__cta reveal" style={{ '--d': '0.45s' }}>
          <a className="btn btn-primary" href={whatsappLink()} target="_blank" rel="noopener noreferrer">
            Bora conversar <ArrowUpRight size={18} />
          </a>
          <Link className="btn btn-ghost" to="/#projetos">
            Ver projetos <ArrowDownRight size={18} />
          </Link>
        </div>
      </div>
      <div className="hero__visual">
        <HeroVisual />
      </div>
    </div>

    <div className="container">
      <ul className="hero__services">
        {services.map((s, i) => (
          <li key={s.id} className="reveal" style={{ '--d': `${0.5 + i * 0.08}s` }}>
            <Link to="/#servicos">
              <span className="label">{s.number}</span>
              <span className="hero__service-name">{s.title}</span>
              <ArrowDownRight size={18} />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

const Positioning = () => (
  <section className="section positioning" id="posicionamento" aria-labelledby="pos-title">
    <div className="container split">
      <span className="label reveal"><b>01</b> Posicionamento</span>
      <div className="split__main">
        <h2 id="pos-title" className="mix pos__title">
          <Lines
            lines={[
              <>Site bonito sozinho</>,
              <>não resolve. <strong>O que</strong></>,
              <><strong>resolve é tudo</strong></>,
              <><strong className="u">funcionando junto.</strong></>,
            ]}
          />
        </h2>

        <ol className="touch reveal" aria-label="Pontos de contato da sua empresa">
          {touchpoints.map((t, i) => (
            <li key={t} style={{ "--i": i }}><b>{t}</b></li>
          ))}
        </ol>

        <div className="pos__text">
          <p className="reveal">
            Quando o sistema é de um fornecedor, a marca de outro e o vídeo de um terceiro, nada conversa. O cliente
            percebe, mesmo sem saber explicar.
          </p>
          <p className="reveal" style={{ '--d': '0.1s' }}>
            Na Teleios, quem programa trabalha do lado de quem desenha e de quem edita. O resultado é uma empresa que
            parece uma coisa só e funciona como uma coisa só, em todo lugar onde aparece.
          </p>
        </div>
      </div>
    </div>
  </section>
);

const Band = () => {
  const words = ['Sistemas web', 'Aplicativos', 'Identidade visual', 'UI/UX', 'Vídeo institucional', 'Motion', 'Integrações', 'Landing pages'];
  const row = (
    <span className="band__row">
      {words.map((w) => (
        <span key={w}>{w}<i aria-hidden="true">✦</i></span>
      ))}
    </span>
  );
  return (
    <div className="band" aria-hidden="true">
      <div className="marquee" style={{ '--speed': '48s' }}>
        <div className="marquee__track">{row}{row}</div>
      </div>
    </div>
  );
};

const Projects = () => {
  const [cat, setCat] = useState('Todos');
  const list = useMemo(() => {
    const filtered = cat === 'Todos' ? projects.slice(0, 4) : projects.filter((p) => p.category === cat);
    return layoutProjects(filtered);
  }, [cat]);

  return (
    <section className="section projects" id="projetos" aria-labelledby="proj-title">
      <div className="container">
        <div className="sec-head">
          <span className="label reveal"><b>02</b> Projetos</span>
          <h2 id="proj-title" className="mix sec-head__title">
            <Lines lines={[<>Projetos <strong>selecionados</strong></>]} />
          </h2>
          <p className="lead reveal">
            Cada projeto começou com um problema diferente. Aqui você vê o que foi feito e o que mudou para quem contratou.
          </p>
        </div>

        <div className="filters reveal" role="tablist" aria-label="Filtrar projetos">
          {categories.map((c) => {
            const count = c === 'Todos' ? projects.length : projects.filter((p) => p.category === c).length;
            return (
              <button
                key={c}
                type="button"
                role="tab"
                aria-selected={cat === c}
                className={`filter ${cat === c ? 'is-active' : ''}`}
                onClick={() => setCat(c)}
              >
                {c} <sup>{count}</sup>
              </button>
            );
          })}
        </div>

        <div className="pgrid" key={cat}>
          {list.map((p, i) => (
            <ProjectCard key={p.id} project={p} index={i} />
          ))}
        </div>

        <div className="projects__more reveal">
          <Link className="btn btn-ghost" to="/projetos">
            Ver todos os projetos <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
};

const Services = () => (
  <section className="section services" id="servicos" aria-labelledby="serv-title">
    <div className="container services__grid">
      <div className="services__aside">
        <span className="label reveal"><b>03</b> Serviços</span>
        <h2 id="serv-title" className="mix sec-title">
          <Lines lines={[<>No que a gente</>, <><strong>pode te ajudar</strong></>]} />
        </h2>
        <p className="lead reveal">
          Três frentes que funcionam sozinhas ou juntas. Você contrata o que precisa agora e o resto conversa com o que
          já existe.
        </p>
        <a className="btn btn-primary reveal" href={whatsappLink('Oi, Teleios! Quero saber mais sobre os serviços.')} target="_blank" rel="noopener noreferrer">
          Pedir orçamento <ArrowUpRight size={18} />
        </a>
      </div>

      <div className="services__list">
        {services.map((s) => (
          <article key={s.id} className="svc reveal">
            <span className="svc__num">{s.number}</span>
            <div className="svc__body">
              <h3 className="svc__title">{s.title}</h3>
              <p className="svc__headline">{s.headline}</p>
              <p className="svc__desc">{s.description}</p>
              <ul className="svc__list">
                {s.deliverables.map((d) => (
                  <li key={d}><Check size={14} />{d}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </div>
  </section>
);

const Process = () => (
  <section className="section process" aria-labelledby="proc-title">
    <div className="container">
      <div className="sec-head">
        <span className="label reveal"><b>04</b> Processo</span>
        <h2 id="proc-title" className="mix sec-head__title">
          <Lines lines={[<>Como a gente <strong>trabalha</strong></>]} />
        </h2>
      </div>
      <ol className="steps reveal">
        {process.map((p, i) => (
          <li key={p.step} className="step" style={{ '--i': i }}>
            <span className="step__dot" aria-hidden="true" />
            <span className="label">{p.step}</span>
            <h3>{p.title}</h3>
            <p>{p.description}</p>
          </li>
        ))}
      </ol>
    </div>
  </section>
);

const Differential = () => {
  const ref = useRef(null);
  useScrollVar(ref);
  return (
    <section className="section diff" ref={ref} aria-labelledby="diff-title">
      <div className="diff__word" aria-hidden="true">Inteiro</div>
      <div className="container diff__grid">
        <div>
          <span className="label reveal"><b>05</b> Diferencial</span>
          <h2 id="diff-title" className="mix diff__title">
            <Lines
              lines={[
                <>Ninguém precisa de</>,
                <>mais um fornecedor.</>,
                <><strong>Precisa de quem</strong></>,
                <><strong className="u">entrega.</strong></>,
              ]}
            />
          </h2>
        </div>
        <ul className="diff__list">
          {differentials.map((d, i) => (
            <li key={d.title} className="reveal" style={{ '--d': `${i * 0.06}s` }}>
              <h3>{d.title}</h3>
              <p>{d.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

const About = () => (
  <section className="section about" id="sobre" aria-labelledby="about-title">
    <div className="container about__grid">
      <figure className="word-card reveal" aria-label="Significado de teleios">
        <div className="word-card__top">
          <span className="label">Grego antigo</span>
          <span className="label">adj.</span>
        </div>
        <div className="word-card__greek" lang="grc">τέλειος</div>
        <div className="word-card__pron">/ té·lei·os /</div>
        <ol className="word-card__defs">
          <li>completo, que não falta nada;</li>
          <li>que chegou ao fim que se propôs;</li>
          <li>maduro, bem acabado.</li>
        </ol>
        <div className="word-card__glow" aria-hidden="true" />
      </figure>

      <div className="about__copy">
        <span className="label reveal"><b>06</b> Sobre</span>
        <h2 id="about-title" className="about__title reveal">Por que a gente se chama Teleios</h2>
        <p className="about__lead reveal">
          Teleios vem do grego e quer dizer completo. Foi o nome que escolhemos porque é exatamente o que a gente
          promete: projeto feito até o fim.
        </p>
        <p className="about__text reveal">
          Somos um estúdio pequeno de propósito. Cada projeto passa pelas mãos de quem programa, de quem desenha e de
          quem edita, conversando desde o primeiro dia. Atendemos empresas que querem sair do improviso e ter uma
          presença digital que funciona de verdade.
        </p>
        <hr />
        <p className="about__note reveal">A gente não quer só deixar sua empresa diferente.</p>
        <p className="mix about__quote reveal">
          Quer deixar ela <strong>completa.</strong>
        </p>
        <Link className="btn btn-ghost reveal" to="/#contato">
          Conhecer a equipe numa conversa <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  </section>
);

const needs = ['Sistema ou app', 'Marca', 'Site', 'Vídeo', 'Ainda não sei'];

const Contact = () => {
  const [form, setForm] = useState({ nome: '', empresa: '', mensagem: '' });
  const [picked, setPicked] = useState([]);
  const [copied, setCopied] = useState(false);

  const toggle = (n) => setPicked((p) => (p.includes(n) ? p.filter((x) => x !== n) : [...p, n]));

  const submit = (e) => {
    e.preventDefault();
    const msg = [
      `Oi, Teleios! Meu nome é ${form.nome || '...'}${form.empresa ? `, da ${form.empresa}` : ''}.`,
      picked.length ? `Preciso de: ${picked.join(', ')}.` : '',
      form.mensagem,
    ]
      .filter(Boolean)
      .join('\n\n');
    window.open(whatsappLink(msg), '_blank', 'noopener');
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(contact.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* sem permissão de clipboard: o e-mail continua selecionável */
    }
  };

  return (
    <section className="section contact" id="contato" aria-labelledby="contact-title">
      <div className="container">
        <div className="contact__panel">
          <div className="contact__arc" aria-hidden="true" />
          <span className="chip reveal"><span className="dot" />Contato</span>
          <h2 id="contact-title" className="mix contact__title">
            <Lines lines={[<>Bora tirar seu</>, <>projeto <strong>do papel?</strong></>]} />
          </h2>
          <p className="lead reveal">
            Conta pra gente o que você precisa. A primeira conversa é sem compromisso, e você sai dela sabendo qual
            caminho faz mais sentido.
          </p>

          <form className="cform reveal" onSubmit={submit}>
            <div className="cform__row">
              <label htmlFor="c-nome">
                <span>Seu nome</span>
                <input id="c-nome" required autoComplete="name" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Como a gente te chama?" />
              </label>
              <label htmlFor="c-empresa">
                <span>Empresa</span>
                <input id="c-empresa" autoComplete="organization" value={form.empresa} onChange={(e) => setForm({ ...form, empresa: e.target.value })} placeholder="Opcional" />
              </label>
            </div>
            <fieldset>
              <legend>O que você precisa?</legend>
              <div className="cform__chips">
                {needs.map((n) => (
                  <button type="button" key={n} aria-pressed={picked.includes(n)} className={`cchip ${picked.includes(n) ? 'is-on' : ''}`} onClick={() => toggle(n)}>
                    {picked.includes(n) && <Check size={14} />}{n}
                  </button>
                ))}
              </div>
            </fieldset>
            <label htmlFor="c-msg">
              <span>Conta um pouco mais</span>
              <textarea id="c-msg" rows={3} value={form.mensagem} onChange={(e) => setForm({ ...form, mensagem: e.target.value })} placeholder="Qual o problema que você quer resolver?" />
            </label>
            <button type="submit" className="btn btn-primary cform__submit">
              <MessageCircle size={18} /> Enviar pelo WhatsApp
            </button>
            <p className="cform__hint">Abre o WhatsApp com sua mensagem pronta. É só apertar enviar.</p>
          </form>

          <div className="contact__alt reveal">
            <span>Prefere e-mail?</span>
            <a href={`mailto:${contact.email}`}>{contact.email}</a>
            <button type="button" className="copy" onClick={copy} aria-label="Copiar e-mail">
              {copied ? <Check size={15} /> : <Copy size={15} />}
            </button>
            <span className="sr-only" aria-live="polite">{copied ? 'E-mail copiado' : ''}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

const Home = () => (
  <>
    <Hero />
    <Positioning />
    <Band />
    <Projects />
    <Services />
    <Process />
    <Differential />
    <About />
    <Contact />
  </>
);

export default Home;
