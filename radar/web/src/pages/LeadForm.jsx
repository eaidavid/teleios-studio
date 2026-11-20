import React, { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { actions } from '../data/store';
import { CATEGORIES, STAGES } from '../data/seed';
import { useApp } from '../App';
import { Modal, toast } from '../components/ui';

const EMPTY = { name: '', category: 'Clínica de estética', contact: '', phone: '', city: 'Sorocaba', neighborhood: '', website: '', instagram: '', email: '', stage: 'found', tags: [] };

/* Criar ou editar lead */
export default function LeadForm({ value, onClose }) {
  const app = useApp();
  const editing = value && value.id;
  const [f, setF] = useState(EMPTY);
  const [err, setErr] = useState({});
  useEffect(() => { if (value) { setF({ ...EMPTY, ...value }); setErr({}); } }, [value]);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const save = (e) => {
    e.preventDefault();
    const er = {};
    if (!f.name.trim()) er.name = 'Informe o nome da empresa.';
    if (f.phone && !/^[\d\s()+-]{8,}$/.test(f.phone)) er.phone = 'Use só números, espaços e parênteses.';
    setErr(er);
    if (Object.keys(er).length) return;
    const data = { ...f, tags: typeof f.tags === 'string' ? f.tags.split(',').map((t) => t.trim()).filter(Boolean) : f.tags, palette: CATEGORIES[f.category].palette };
    if (editing) { actions.updateLead(f.id, data); toast('Lead atualizado'); onClose(); }
    else { const id = actions.createLead(data); toast('Lead criado'); onClose(); setTimeout(() => app.openLead(id), 200); }
  };

  return (
    <Modal open={!!value} onClose={onClose} title={editing ? 'Editar lead' : 'Novo lead'}
      footer={<><button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button><button type="submit" form="lead-form" className="btn btn-primary"><Save size={15} />{editing ? 'Salvar alterações' : 'Criar lead'}</button></>}>
      <form id="lead-form" onSubmit={save} style={{ display: 'grid', gap: 14 }} noValidate>
        <label className="field"><span>Nome da empresa *</span><input id="lf-name" className="input" value={f.name} onChange={set('name')} aria-invalid={!!err.name} autoFocus />{err.name && <small style={{ color: 'var(--danger)' }}>{err.name}</small>}</label>
        <div className="grid-2">
          <label className="field"><span>Segmento</span><select id="lf-cat" className="select" value={f.category} onChange={set('category')}>{Object.keys(CATEGORIES).map((c) => <option key={c}>{c}</option>)}</select></label>
          <label className="field"><span>Etapa</span><select id="lf-stage" className="select" value={f.stage} onChange={set('stage')}>{STAGES.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
        </div>
        <div className="grid-2">
          <label className="field"><span>Contato</span><input id="lf-contact" className="input" value={f.contact} onChange={set('contact')} placeholder="Nome, cargo" /></label>
          <label className="field"><span>Telefone / WhatsApp</span><input id="lf-phone" className="input" value={f.phone} onChange={set('phone')} placeholder="(15) 99999-0000" aria-invalid={!!err.phone} />{err.phone && <small style={{ color: 'var(--danger)' }}>{err.phone}</small>}</label>
        </div>
        <div className="grid-2">
          <label className="field"><span>Cidade</span><input id="lf-city" className="input" value={f.city} onChange={set('city')} /></label>
          <label className="field"><span>Bairro</span><input id="lf-bairro" className="input" value={f.neighborhood} onChange={set('neighborhood')} /></label>
        </div>
        <div className="grid-2">
          <label className="field"><span>Site</span><input id="lf-site" className="input" value={f.website} onChange={set('website')} placeholder="empresa.com.br" /></label>
          <label className="field"><span>Instagram</span><input id="lf-ig" className="input" value={f.instagram} onChange={set('instagram')} placeholder="@empresa" /></label>
        </div>
        <label className="field"><span>Etiquetas</span><input id="lf-tags" className="input" value={Array.isArray(f.tags) ? f.tags.join(', ') : f.tags} onChange={set('tags')} placeholder="Premium, Indicação" /><small>Separe por vírgula.</small></label>
      </form>
    </Modal>
  );
}
