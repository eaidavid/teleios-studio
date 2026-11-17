/* Distribui projetos num ritmo largo / metade / metade, sem deixar card sozinho na linha. */
export function layoutProjects(list) {
  const out = list.map((p, i) => ({ ...p, size: i % 3 === 0 ? 'wide' : 'half' }));
  const halves = out.filter((p) => p.size === 'half');
  if (halves.length % 2 === 1) halves[halves.length - 1].size = 'wide';
  return out;
}
