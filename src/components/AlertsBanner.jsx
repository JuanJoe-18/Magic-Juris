import { AlertTriangle, Clock, ChevronRight } from 'lucide-react'
import { formatRadicado, calcularCuentaRegresiva } from '../lib/ui'

// ── Banner superior de alertas críticas del día ──
// Lista las actuaciones críticas con cuenta regresiva (simulada) al vencimiento del término.
function CuentaRegresiva({ vencimiento }) {
  const cr = calcularCuentaRegresiva(vencimiento)
  if (!cr) return null

  if (cr.vencido) {
    return (
      <span className="inline-flex items-center gap-1 font-semibold text-hg-red">
        <Clock size={13} /> Término vencido
      </span>
    )
  }
  const urgente = cr.dias <= 2
  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold tabular-nums ${
        urgente ? 'text-hg-red' : 'text-amber-400/90'
      }`}
    >
      <Clock size={13} />
      {cr.dias}d {cr.horas}h restantes
    </span>
  )
}

export default function AlertsBanner({ procesos, onSelect }) {
  // Solo procesos críticos con término por vencer.
  const criticos = procesos.filter(
    (p) => p.criticidad === 'Critica' && p.vencimientoTermino
  )

  if (criticos.length === 0) return null

  return (
    <div
      className="rounded-2xl border p-4 md:p-5"
      style={{
        borderColor: 'rgba(197,32,46,0.35)',
        background:
          'linear-gradient(180deg, rgba(197,32,46,0.10) 0%, rgba(197,32,46,0.03) 100%)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-hg-red/20 animate-pulse-critical">
          <AlertTriangle size={15} className="text-hg-red" />
        </span>
        <h2 className="font-sora text-sm font-semibold">
          Actuaciones críticas del día
        </h2>
        <span className="rounded-full bg-hg-red px-2 py-0.5 text-[11px] font-semibold text-white">
          {criticos.length}
        </span>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {criticos.map((p) => (
          <button
            key={p.id}
            onClick={() => onSelect(p.id)}
            className="group flex items-center justify-between gap-3 rounded-xl bg-black/30 px-3.5 py-2.5
                       text-left transition-colors hover:bg-black/50"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white/90">
                {p.cliente}
              </p>
              <p className="truncate text-[11px] text-white/45">
                {p.ultimaActuacion}
              </p>
              <p className="mt-0.5 font-mono text-[10px] text-white/30">
                {formatRadicado(p.radicado)}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <CuentaRegresiva vencimiento={p.vencimientoTermino} />
              <ChevronRight
                size={15}
                className="text-white/30 transition-transform group-hover:translate-x-0.5 group-hover:text-white/60"
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
