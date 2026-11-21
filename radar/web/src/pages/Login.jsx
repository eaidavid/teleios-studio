import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2, Lock } from 'lucide-react';
import { login } from '../data/store';
import { Logo, ease } from '../components/ui';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr('');
    try { await login(email, password); } catch (x) { setErr(x.message); setBusy(false); }
  };
  return (
    <div className="login">
      <motion.form className="login-card card" onSubmit={submit} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}>
        <div className="brand" style={{ padding: 0 }}><Logo /><small>RADAR</small></div>
        <div style={{ display: 'grid', gap: 4 }}>
          <h1 style={{ margin: 0, fontFamily: 'var(--f-display)', fontSize: 24, letterSpacing: '-.03em' }}>Entrar</h1>
          <p className="muted" style={{ margin: 0, fontSize: 13.5 }}>Prospecção da Agência Teleios.</p>
        </div>
        <label className="field"><span>E-mail</span><input id="login-email" className="input" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
        <label className="field"><span>Senha</span><input id="login-pw" className="input" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
        {err && <div className="login-err" role="alert"><Lock size={14} />{err}</div>}
        <button type="submit" className="btn btn-primary" disabled={busy} style={{ justifyContent: 'center' }}>{busy ? <Loader2 size={15} className="spin" /> : <>Entrar<ArrowRight size={15} /></>}</button>
      </motion.form>
    </div>
  );
}
