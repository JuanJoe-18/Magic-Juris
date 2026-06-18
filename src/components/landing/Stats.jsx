import { useCountUp } from '../../hooks/useReveal'

// Banda de métricas con contadores animados al entrar en viewport.
const stats = [
  { value: 120, suffix: '', label: 'Procesos por abogado', desc: 'monitoreados en simultáneo' },
  { value: 3, suffix: '', label: 'Niveles de criticidad', desc: 'Crítica · Importante · Informativa' },
  { value: 4, suffix: 'h', label: 'Ventana de detección', desc: 'nueva actuación reflejada' },
  { value: 100, suffix: '%', label: 'Trazabilidad', desc: 'historial append-only auditable' },
]

function Stat({ value, suffix, label, desc }) {
  const [ref, n] = useCountUp(value)
  return (
    <div ref={ref} className="text-center">
      <p className="font-sora text-4xl font-extrabold tracking-tight md:text-5xl">
        <span className="text-gradient-hg">{n}</span>
        <span className="text-gradient-hg">{suffix}</span>
      </p>
      <p className="mt-2 text-sm font-medium text-white/80">{label}</p>
      <p className="text-xs text-white/40">{desc}</p>
    </div>
  )
}

export default function Stats() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-16 md:px-8">
      <div className="grid grid-cols-2 gap-8 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-10 md:grid-cols-4">
        {stats.map((s) => (
          <Stat key={s.label} {...s} />
        ))}
      </div>
    </section>
  )
}
