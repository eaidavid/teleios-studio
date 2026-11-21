// Página pública do site-prévia: /p/<slug>
import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { MotionConfig } from 'framer-motion';
import Preview from './sites/Preview';
import './styles/app.css';

function Page() {
  const slug = decodeURIComponent(location.pathname.split('/').filter(Boolean).pop() || '');
  const [state, setState] = useState(null);
  const [mobile, setMobile] = useState(() => innerWidth < 760);
  useEffect(() => {
    fetch(`/api/public/sites/${encodeURIComponent(slug)}`).then((r) => (r.ok ? r.json() : Promise.reject())).then((j) => {
      setState(j);
      document.title = `${j.lead.name} · prévia`;
    }).catch(() => setState({ error: true }));
    const on = () => setMobile(innerWidth < 760);
    addEventListener('resize', on);
    return () => removeEventListener('resize', on);
  }, [slug]);
  if (!state) return <div className="pv-load">Carregando…</div>;
  if (state.error) return <div className="pv-load">Prévia não encontrada.</div>;
  return <Preview lead={state.lead} d={state.data} mobile={mobile} standalone />;
}

createRoot(document.getElementById('root')).render(<MotionConfig reducedMotion="user"><Page /></MotionConfig>);
