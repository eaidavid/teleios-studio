import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bot, Columns3, Home, LayoutTemplate, LogOut, Map as MapIcon, Menu, MessagesSquare, Plus, Search, Settings, Target, Users,
} from 'lucide-react';
import { Logo, Toasts, ease, toast } from './components/ui';
import Login from './pages/Login';
import CommandPalette from './components/CommandPalette';
import NumberHealth from './components/NumberHealth';
import LeadDrawer from './pages/LeadDrawer';
import LeadForm from './pages/LeadForm';
import Hoje from './pages/Hoje';
import Leads from './pages/Leads';
import Conversas from './pages/Conversas';
import Funil from './pages/Funil';
import Territorio from './pages/Territorio';
import Campanhas from './pages/Campanhas';
import Sites from './pages/Sites';
import Robos from './pages/Robos';
import Config from './pages/Config';
import { boot, logout, useStore } from './data/store';

const NAV = [
  { group: 'Comercial', items: [
    { id: 'hoje', label: 'Hoje', icon: Home, el: Hoje },
    { id: 'conversas', label: 'Conversas', icon: MessagesSquare, el: Conversas, badge: true },
    { id: 'leads', label: 'Leads', icon: Users, el: Leads },
    { id: 'funil', label: 'Funil', icon: Columns3, el: Funil },
    { id: 'territorio', label: 'Território', icon: MapIcon, el: Territorio },
  ] },
  { group: 'Prospecção', items: [
    { id: 'campanhas', label: 'Campanhas', icon: Target, el: Campanhas },
    { id: 'sites', label: 'Sites-prévia', icon: LayoutTemplate, el: Sites, beta: true },
    { id: 'robos', label: 'Time de robôs', icon: Bot, el: Robos },
  ] },
  { group: 'Conta', items: [{ id: 'config', label: 'Configurações', icon: Settings, el: Config }] },
];
const ALL = NAV.flatMap((g) => g.items);

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

function useHashRoute() {
  const read = () => {
    const [view, param] = location.hash.slice(1).split('-');
    return { view: ALL.some((x) => x.id === view) ? view : 'hoje', param };
  };
  const [r, setR] = useState(read);
  useEffect(() => {
    const f = () => setR(read());
    addEventListener('hashchange', f);
    return () => removeEventListener('hashchange', f);
  }, []);
  return r;
}

export default function App() {
  const session = useStore((s) => s.session);
  useEffect(() => {
    boot();
    const f = (e) => toast(`Não foi possível salvar: ${e.detail}`);
    addEventListener('radar-error', f);
    return () => removeEventListener('radar-error', f);
  }, []);
  if (session.mode === 'loading') return <div className="boot"><Logo /></div>;
  if (session.mode === 'login') return <><Login /><Toasts /></>;
  return <Shell session={session} />;
}

function Shell({ session }) {
  const { view, param } = useHashRoute();
  const [lead, setLead] = useState(null);
  const [form, setForm] = useState(null); // null | {} (novo) | lead (editar)
  const [palette, setPalette] = useState(false);
  const [menu, setMenu] = useState(false);
  const control = useStore((s) => s.control);
  const conversations = useStore((s) => s.conversations);
  const hot = useMemo(() => Object.keys(conversations).filter((id) => control[id] === 'bot' && conversations[id].at(-1)?.t === 'in').length, [control, conversations]);

  useEffect(() => {
    const f = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPalette((p) => !p); }
    };
    addEventListener('keydown', f);
    return () => removeEventListener('keydown', f);
  }, []);
  useEffect(() => { setMenu(false); document.querySelector('.main')?.scrollTo({ top: 0 }); }, [view]);

  const app = useMemo(() => ({ openLead: setLead, newLead: (data = {}) => setForm(data), editLead: (l) => setForm(l), go: (v) => { location.hash = v; }, param }), [param]);
  const Page = ALL.find((x) => x.id === view).el;

  return (
    <Ctx.Provider value={app}>
      <div className="app">
        <aside className={`side ${menu ? 'open' : ''}`} aria-label="Menu principal">
          <a className="brand" href="#hoje"><Logo /><small>RADAR</small></a>
          {NAV.map((g) => (
            <nav key={g.group} className="nav-group" aria-label={g.group}>
              <div className="nav-title">{g.group}</div>
              {g.items.map(({ id, label, icon: Icon, badge, beta }) => (
                <a key={id} href={`#${id}`} className={`nav-link ${view === id ? 'active' : ''}`} aria-current={view === id ? 'page' : undefined}>
                  {view === id && <motion.span layoutId="nav-pill" className="nav-pill" transition={{ duration: 0.4, ease }} />}
                  <Icon size={18} strokeWidth={1.8} />{label}
                  {badge && hot > 0 && <span className="badge">{hot}</span>}
                  {beta && <span className="pill violet" style={{ marginLeft: 'auto', height: 18, fontSize: 10 }}>Beta</span>}
                </a>
              ))}
            </nav>
          ))}
          <div className="side-foot"><NumberHealth /></div>
        </aside>

        <div className="main">
          <header className="top">
            <button type="button" className="btn-icon menu-btn" onClick={() => setMenu(true)} aria-label="Abrir menu"><Menu size={18} /></button>
            <button type="button" className="search-trigger" onClick={() => setPalette(true)} aria-label="Buscar">
              <Search size={16} /><span>Buscar leads, telas ou ações</span><span className="kbd">Ctrl K</span>
            </button>
            <span className="grow" />
            {session.mode === 'demo' && <span className="demo">Dados de demonstração</span>}
            <button type="button" className="btn btn-primary btn-sm" onClick={() => setForm({})}><Plus size={15} strokeWidth={2.4} />Novo lead</button>
            <span className="avatar sm" style={{ background: 'var(--surface-4)', color: 'var(--text)' }} aria-label={session.user?.email || 'David'} title={session.user?.email}>{(session.user?.name || 'D')[0].toUpperCase()}</span>
            {session.mode === 'api' && <button type="button" className="btn-icon" onClick={logout} aria-label="Sair" title="Sair"><LogOut size={16} /></button>}
          </header>

          <AnimatePresence mode="wait">
            <motion.div key={view} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.32, ease }}>
              <Page />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <LeadDrawer id={lead} onClose={() => setLead(null)} />
      <LeadForm value={form} onClose={() => setForm(null)} />
      <CommandPalette open={palette} onClose={() => setPalette(false)} nav={ALL} />
      <Toasts />
    </Ctx.Provider>
  );
}
