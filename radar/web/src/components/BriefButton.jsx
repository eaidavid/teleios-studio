// "Montar MD para o Claude": copia (e baixa) o briefing mastigado do lead.
import React, { useState } from 'react';
import { FileText, Loader2 } from 'lucide-react';
import { actions, useStore } from '../data/store';
import { toast } from './ui';

export default function BriefButton({ lead, className = 'btn btn-ghost btn-sm', label = 'Montar MD para o Claude' }) {
  const live = useStore((s) => s.session.mode === 'api');
  const [busy, setBusy] = useState(false);
  if (!live) return null;
  const go = async () => {
    setBusy(true);
    try {
      const md = await actions.briefMd(lead.id);
      const slug = String(lead.brandName || lead.name).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').slice(0, 40);
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([md], { type: 'text/markdown' }));
      a.download = `previa-${slug}.md`; a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      await navigator.clipboard?.writeText(md).catch(() => {});
      toast('MD copiado e baixado. Cole no chat do Claude (com o conector do Radar).');
    } catch (e) { toast(e.message); }
    setBusy(false);
  };
  return <button type="button" className={className} onClick={go} disabled={busy} title="Briefing completo + rascunho do site, pronto para colar no Claude">{busy ? <Loader2 size={14} className="spin" /> : <FileText size={14} />}{label}</button>;
}
