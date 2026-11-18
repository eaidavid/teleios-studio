import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownRight, ArrowRight, ArrowUpRight, Check, Copy, MessageCircle, Minus, Plus, X } from 'lucide-react';
import HeroVisual from '../components/HeroVisual';
import ProjectCard from '../components/ProjectCard';
import ServiceArt from '../components/ServiceArt';
import { Lines } from '../components/Effects';
import {
  audiences, comparison, contact, hasCases, extraService, faq, fitNo, fitYes, manifesto, pains, projects, services, steps, whatsappLink,
} from '../content';
import { layoutProjects } from '../lib/layout';
import './Home.css';

const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Progresso de rolagem do elemento (0 → 1) */
function useScrollProgress(ref, onProgress) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    let raf = 0;
    const update = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = (vh * 0.85 - r.top) / (r.height + vh * 0.3);
      onProgress(Math.min(1, Math.max(0, p)), el);
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
  }, [ref, onProgress]);
}

/* ---------------------------------------------------------------- Hero */
const Hero = () => (
  <section className="hero" aria-labelledby="hero-title">
    <div className="container">
      <span className="chip reveal"><span className="dot" />Agência de marketing para pequenas e médias empresas</span>

      <h1 id="hero-title" className="mix hero__title">
        <Lines
          lines={[
            <>Marketing que enche</>,
            <>
              a <em>agenda</em>
              <span className="hero__faces" aria-hidden="true">
                <i style={{ background: '#00C48C' }}>M</i>
                <i style={{ background: '#6F86C8' }}>C</i>
                <i style={{ background: '#E8A87C' }}>J</i>
                <b>+</b>
              </span>
              <strong>não só</strong>
            </>,
            <><strong>o feed.</strong></>,
          ]}
          delay={0.1}
        />
      </h1>

      <div className="hero__row">
        <div className="hero__copy">
          <p className="hero__sub reveal" style={{ '--d': '0.35s' }}>
            A Agência Teleios cuida da sua marca, do conteúdo, dos anúncios e do site com um time só. Tudo apontando para o mesmo
            lugar: <span>mais gente chamando no seu WhatsApp.</span>
          </p>
          <div className="hero__cta reveal" style={{ '--d': '0.45s' }}>
            <a className="btn btn-primary" href={whatsappLink()} target="_blank" rel="noopener noreferrer">
              Quero um diagnóstico <ArrowUpRight size={18} />
            </a>
            <Link className="btn btn-ghost" to={hasCases ? '/#cases' : '/#servicos'}>
              {hasCases ? 'Ver cases' : 'Ver serviços'} <ArrowDownRight size={18} />
            </Link>
          </div>
          <ul className="hero__trust reveal" style={{ '--d': '0.55s' }}>
            <li><Check size={15} /> Primeira conversa sem compromisso</li>
            <li><Check size={15} /> Você fala direto com quem faz</li>
          </ul>
        </div>
        <div className="hero__visual reveal" style={{ '--d': '0.3s' }}>
          <HeroVisual />
        </div>
      </div>
    </div>

    <div className="ticker" aria-hidden="true">
      <div className="marquee" style={{ '--speed': '50s' }}>
        <div className="marquee__track">
          {[0, 1].map((k) => (
            <span className="ticker__row" key={k}>
              {['Posicionamento', 'Identidade visual', 'Social media', 'Tráfego pago', 'Reels', 'Vídeo institucional', 'Landing pages', 'Sites'].map((w, i) => (
                <span key={w} className={i % 2 ? 'serif' : ''}>{w}<i>✦</i></span>
              ))}
            </span>
          ))}
        </div>
      </div>
    </div>
  </section>
);

/* ---------------------------------------------------------------- Dor */
const Pains = () => (
  <section className="section pains" aria-labelledby="pains-title">
    <div className="container">
      <div className="sec-head">
        <span className="label reveal"><b>01</b> Talvez você conheça</span>
        <h2 id="pains-title" className="mix sec-head__title">
          <Lines lines={[<>Sua empresa é boa.</>, <><strong>O digital ainda</strong></>, <><strong>não mostra <em className="g">isso.</em></strong></>]} />
        </h2>
      </div>
      <ul className="pains__grid">
        {pains.map((p, i) => (
          <li key={p.quote} className="pain reveal" style={{ '--d': `${i * 0.07}s` }}>
            <span className="pain__mark" aria-hidden="true">“</span>
            <p className="pain__quote">{p.quote}</p>
            <p className="pain__note">{p.note}</p>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

/* ---------------------------------------------------------------- Manifesto */
const Manifesto = () => {
  const ref = useRef(null);
  const words = useMemo(() => manifesto.split(' '), []);
  const onProgress = useMemo(
    () => (p, el) => {
      const n = reduced() ? words.length : Math.round(p * 1.25 * words.length);
      el.querySelectorAll('.mf__w').forEach((w, i) => w.classList.toggle('is-on', i < n));
    },
    [words.length]
  );
  useScrollProgress(ref, onProgress);

  return (
    <section className="section manifesto" ref={ref} aria-label="Manifesto">
      <div className="container">
        <span className="label"><b>02</b> No que a gente acredita</span>
        <p className="mf">
          {words.map((w, i) => (
            <span key={i} className={`mf__w ${/decoração|vende|agenda|venda/.test(w) ? 'mf__w--em' : ''}`}>{w} </span>
          ))}
        </p>
        <div className="mf__sign">
          <span className="mf__greek" lang="grc">τέλειος</span>
          <span>Teleios vem do grego e significa <em className="serif">completo</em>. É o que a gente entrega: o marketing inteiro, não um pedaço.</span>
        </div>
      </div>
    </section>
  );
};

/* ---------------------------------------------------------------- Serviços */
const Services = () => (
  <section className="section services" id="servicos" aria-labelledby="serv-title">
    <div className="container">
      <div className="sec-head">
        <span className="label reveal"><b>03</b> O que a gente faz</span>
        <h2 id="serv-title" className="mix sec-head__title">
          <Lines lines={[<>Cinco frentes.</>, <><strong>Um objetivo:</strong></>, <><strong><em className="g">vender</em> mais.</strong></>]} />
        </h2>
        <p className="lead reveal">Você contrata o que faz sentido agora. Cada frente conversa com as outras, então nada fica solto.</p>
      </div>

      <div className="stack">
        {services.map((s, i) => (
          <article key={s.id} className="svc" style={{ '--i': i }}>
            <div className="svc__text">
              <div className="svc__top">
                <span className="svc__num">{s.number}</span>
                <span className="label">{s.title}</span>
              </div>
              <h3 className="svc__outcome">{s.outcome}</h3>
              <p className="svc__desc">{s.description}</p>
              <ul className="svc__list">
                {s.deliverables.map((d) => <li key={d}>{d}</li>)}
              </ul>
            </div>
            <div className="svc__art">
              <ServiceArt type={s.art} />
            </div>
          </article>
        ))}
      </div>

      <div className="extra reveal">
        <span className="extra__tag">+ Tecnologia</span>
        <div>
          <h3>{extraService.title}</h3>
          <p>{extraService.description}</p>
        </div>
        <a className="btn btn-ghost btn-sm" href={whatsappLink('Oi, Teleios! Quero conversar sobre um sistema/automação.')} target="_blank" rel="noopener noreferrer">
          Falar sobre um sistema <ArrowUpRight size={16} />
        </a>
      </div>
    </div>
  </section>
);

/* ---------------------------------------------------------------- Como funciona */
const How = () => (
  <section className="section how" id="como-funciona" aria-labelledby="how-title">
    <div className="container">
      <div className="sec-head">
        <span className="label reveal"><b>04</b> Como funciona</span>
        <h2 id="how-title" className="mix sec-head__title">
          <Lines lines={[<>Do diagnóstico</>, <><strong>ao WhatsApp tocando</strong></>]} />
        </h2>
      </div>
      <ol className="steps reveal">
        {steps.map((s, i) => (
          <li key={s.step} className="step" style={{ '--i': i }}>
            <span className="step__dot" aria-hidden="true" />
            <span className="label">{s.step}</span>
            <h3>{s.title}</h3>
            <p>{s.description}</p>
          </li>
        ))}
      </ol>
    </div>
  </section>
);

/* ---------------------------------------------------------------- Comparação */
const Mark = ({ v }) => {
  if (v === 'yes') return <span className="cmp__m cmp__m--yes" aria-label="Sim"><Check size={16} strokeWidth={2.6} /></span>;
  if (v === 'partial') return <span className="cmp__m cmp__m--part" aria-label="Às vezes"><Minus size={16} strokeWidth={2.6} /></span>;
  return <span className="cmp__m cmp__m--no" aria-label="Não"><X size={15} strokeWidth={2.4} /></span>;
};

const Compare = () => (
  <section className="section compare" aria-labelledby="cmp-title">
    <div className="container">
      <div className="sec-head">
        <span className="label reveal"><b>05</b> Por que a Teleios</span>
        <h2 id="cmp-title" className="mix sec-head__title">
          <Lines lines={[<>Nem freelancer de post,</>, <><strong>nem agência que some.</strong></>]} />
        </h2>
      </div>
      <div className="cmp reveal" role="table" aria-label="Comparação entre Teleios e alternativas">
        <div className="cmp__row cmp__row--head" role="row">
          <span role="columnheader" className="cmp__label" />
          {comparison.columns.map((c, i) => (
            <span role="columnheader" key={c} className={i === 2 ? 'cmp__us' : ''}>
              {i === 2 ? <><img className="cmp__logo" src="/favicon.svg" alt="" />{c}</> : c}
            </span>
          ))}
        </div>
        {comparison.rows.map((r) => (
          <div className="cmp__row" role="row" key={r.label}>
            <span role="rowheader" className="cmp__label">{r.label}</span>
            {r.values.map((v, i) => (
              <span role="cell" key={i} className={i === 2 ? 'cmp__us' : ''}><Mark v={v} /></span>
            ))}
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ---------------------------------------------------------------- Cases */
const Cases = () => {
  const list = useMemo(() => layoutProjects(projects.slice(0, 4)), []);
  return (
    <section className="section cases" id="cases" aria-labelledby="cases-title">
      <div className="container">
        <div className="sec-head">
          <span className="label reveal"><b>06</b> Cases</span>
          <h2 id="cases-title" className="mix sec-head__title">
            <Lines lines={[<>Marcas que deixaram</>, <><strong>de parecer pequenas</strong></>]} />
          </h2>
          <p className="lead reveal">Cada case começou com um problema de negócio, não com um pedido de post.</p>
        </div>
        <div className="pgrid">
          {list.map((p, i) => <ProjectCard key={p.id} project={p} index={i} />)}
        </div>
        <div className="cases__more reveal">
          <Link className="btn btn-ghost" to="/cases">
            Ver todos os cases <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
};

/* ---------------------------------------------------------------- Para quem */
const Fit = () => (
  <section className="section fit" aria-labelledby="fit-title">
    <div className="container">
      <div className="sec-head">
        <span className="label reveal"><b>{hasCases ? '07' : '06'}</b> Para quem é</span>
        <h2 id="fit-title" className="mix sec-head__title">
          <Lines lines={[<>Feito para empresas</>, <><strong>que querem crescer</strong></>]} />
        </h2>
      </div>
      <ul className="fit__chips reveal">
        {audiences.map((a) => <li key={a}>{a}</li>)}
      </ul>
      <div className="fit__cols">
        <div className="fit__col fit__col--yes reveal">
          <h3>A Teleios é para você se</h3>
          <ul>{fitYes.map((t) => <li key={t}><Check size={18} />{t}</li>)}</ul>
        </div>
        <div className="fit__col fit__col--no reveal" style={{ '--d': '0.08s' }}>
          <h3>Talvez não seja se</h3>
          <ul>{fitNo.map((t) => <li key={t}><X size={18} />{t}</li>)}</ul>
        </div>
      </div>
    </div>
  </section>
);

/* ---------------------------------------------------------------- FAQ */
const Faq = () => {
  const [open, setOpen] = useState(0);
  return (
    <section className="section faq" id="faq" aria-labelledby="faq-title">
      <div className="container faq__grid">
        <div className="faq__aside">
          <span className="label reveal"><b>{hasCases ? '08' : '07'}</b> Perguntas frequentes</span>
          <h2 id="faq-title" className="mix sec-title">
            <Lines lines={[<>Antes de você</>, <><strong>perguntar</strong></>]} />
          </h2>
          <p className="lead reveal">Não achou sua dúvida? Manda no WhatsApp que a gente responde.</p>
          <a className="btn btn-ghost btn-sm reveal" href={whatsappLink('Oi, Teleios! Tenho uma dúvida.')} target="_blank" rel="noopener noreferrer">
            Tirar uma dúvida <ArrowUpRight size={16} />
          </a>
        </div>
        <div className="faq__list">
          {faq.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q} className="reveal"><div className={`qa ${isOpen ? 'is-open' : ''}`}>
                <h3>
                  <button type="button" aria-expanded={isOpen} aria-controls={`qa-${i}`} id={`qa-b-${i}`} onClick={() => setOpen(isOpen ? -1 : i)}>
                    {f.q}
                    <span className="qa__icon" aria-hidden="true"><Plus size={18} /></span>
                  </button>
                </h3>
                <div className="qa__a" id={`qa-${i}`} role="region" aria-labelledby={`qa-b-${i}`}>
                  <div><p>{f.a}</p></div>
                </div>
              </div></div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

/* ---------------------------------------------------------------- Contato */
const needs = ['Marca', 'Redes sociais', 'Anúncios', 'Vídeo', 'Site', 'Sistema', 'Ainda não sei'];

const Contact = () => {
  const [form, setForm] = useState({ nome: '', empresa: '', mensagem: '' });
  const [picked, setPicked] = useState([]);
  const [copied, setCopied] = useState(false);
  const toggle = (n) => setPicked((p) => (p.includes(n) ? p.filter((x) => x !== n) : [...p, n]));

  const submit = (e) => {
    e.preventDefault();
    const msg = [
      `Oi, Teleios! Meu nome é ${form.nome}${form.empresa ? `, da ${form.empresa}` : ''}. Quero um diagnóstico do meu marketing.`,
      picked.length ? `Tenho interesse em: ${picked.join(', ')}.` : '',
      form.mensagem,
    ].filter(Boolean).join('\n\n');
    window.open(whatsappLink(msg), '_blank', 'noopener');
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(contact.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* o e-mail continua selecionável */
    }
  };

  return (
    <section className="section contact" id="contato" aria-labelledby="contact-title">
      <div className="container">
        <div className="contact__panel">
          <div className="contact__arc" aria-hidden="true" />
          <span className="chip reveal"><span className="dot" />Diagnóstico sem compromisso</span>
          <h2 id="contact-title" className="mix contact__title">
            <Lines lines={[<>Bora fazer sua empresa</>, <>ser <em className="g">escolhida?</em></>]} />
          </h2>
          <p className="lead reveal">
            Conta onde você está e onde quer chegar. Na primeira conversa a gente já aponta onde sua empresa está
            perdendo cliente no digital.
          </p>

          <form className="cform reveal" onSubmit={submit}>
            <div className="cform__row">
              <label htmlFor="c-nome">
                <span>Seu nome</span>
                <input id="c-nome" required autoComplete="name" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Como a gente te chama?" />
              </label>
              <label htmlFor="c-empresa">
                <span>Empresa</span>
                <input id="c-empresa" autoComplete="organization" value={form.empresa} onChange={(e) => setForm({ ...form, empresa: e.target.value })} placeholder="Nome e segmento" />
              </label>
            </div>
            <fieldset>
              <legend>No que você quer ajuda?</legend>
              <div className="cform__chips">
                {needs.map((n) => (
                  <button type="button" key={n} aria-pressed={picked.includes(n)} className={`cchip ${picked.includes(n) ? 'is-on' : ''}`} onClick={() => toggle(n)}>
                    {picked.includes(n) && <Check size={14} />}{n}
                  </button>
                ))}
              </div>
            </fieldset>
            <label htmlFor="c-msg">
              <span>Qual o maior desafio hoje?</span>
              <textarea id="c-msg" rows={3} value={form.mensagem} onChange={(e) => setForm({ ...form, mensagem: e.target.value })} placeholder="Ex.: o perfil não gera contato, dependo de indicação..." />
            </label>
            <button type="submit" className="btn btn-primary cform__submit">
              <MessageCircle size={18} /> Quero meu diagnóstico
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
    <Pains />
    <Manifesto />
    <Services />
    <How />
    <Compare />
    {hasCases && <Cases />}
    <Fit />
    <Faq />
    <Contact />
  </>
);

export default Home;
