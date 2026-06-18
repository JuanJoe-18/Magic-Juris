import { X, Sparkles, BadgeCheck } from 'lucide-react'
import {
  criticidadConfig,
  tipoActuacionIcon,
  jurisdiccionConfig,
  formatRadicado,
  formatFecha,
} from '../lib/ui'

// ── Panel de detalle de un proceso ──
// Línea de tiempo vertical de actuaciones + panel tipo chat con el resumen IA para el cliente.
export default function ProcessDetail({ proceso, onClose }) {
  if (!proceso) return null
  const jur = jurisdiccionConfig[proceso.jurisdiccion]

  return (
    <div className="hg-glass flex h-full flex-col rounded-2xl">
      {/* Encabezado */}
      <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] p-5">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-sora text-xs font-semibold text-hg-red">
              {proceso.estado}
            </span>
            <span className="text-xs text-white/50">{proceso.estadoLabel}</span>
            {jur && (
              <span className="rounded-md bg-white/[0.05] px-2 py-0.5 text-[11px] text-white/60">
                {jur.label}
              </span>
            )}
          </div>
          <h2 className="mt-1 truncate font-sora text-lg font-semibold">
            {proceso.cliente}
          </h2>
          <p className="font-mono text-xs text-white/45">
            {formatRadicado(proceso.radicado)}
          </p>
          <p className="mt-0.5 text-xs text-white/40">{proceso.despacho}</p>
        </div>
        <button
          onClick={onClose}
          className="shrink-0 rounded-lg p-2 text-white/50 transition-colors hover:bg-white/[0.06] hover:text-white"
          aria-label="Cerrar detalle"
        >
          <X size={18} />
        </button>
      </div>

      {/* Cuerpo scrolleable */}
      <div className="flex-1 space-y-6 overflow-y-auto p-5">
        {/* Línea de tiempo de actuaciones */}
        <section>
          <h3 className="mb-4 font-sora text-sm font-semibold text-white/80">
            Línea de tiempo de actuaciones
          </h3>
          <ol className="relative space-y-5 border-l border-white/[0.1] pl-6">
            {proceso.lineaTiempo.map((act, i) => {
              const cfg =
                criticidadConfig[act.criticidad] ?? criticidadConfig.Informativa
              const Icon = tipoActuacionIcon[act.tipo] ?? tipoActuacionIcon.Auto
              return (
                <li key={i} className="relative">
                  {/* Nodo */}
                  <span
                    className="absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full border"
                    style={{
                      backgroundColor: '#161616',
                      borderColor: cfg.dot,
                      boxShadow: `0 0 8px ${cfg.ring}`,
                    }}
                  >
                    <Icon size={12} style={{ color: cfg.dot }} />
                  </span>
                  <div className="rounded-xl bg-white/[0.03] p-3.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] uppercase tracking-wider text-white/40">
                        {formatFecha(act.fecha)}
                      </span>
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                        style={{ backgroundColor: cfg.bg, color: cfg.text }}
                      >
                        {cfg.label}
                      </span>
                    </div>
                    <p className="mt-1 font-medium text-white/90">{act.titulo}</p>
                    <p className="mt-1 text-sm leading-relaxed text-white/55">
                      {act.descripcion}
                    </p>
                  </div>
                </li>
              )
            })}
          </ol>
        </section>

        {/* Panel chat — resumen IA para el cliente */}
        <section>
          <div className="mb-3 flex items-center gap-2">
            <Sparkles size={15} className="text-hg-red" />
            <h3 className="font-sora text-sm font-semibold text-white/80">
              Resumen IA en lenguaje claro · Cliente
            </h3>
          </div>

          <div className="space-y-3 rounded-xl bg-hg-surface2/60 p-4">
            {/* Burbuja del asistente */}
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-hg-red/15 border border-hg-red/30">
                <Sparkles size={15} className="text-hg-red" />
              </div>
              <div className="rounded-2xl rounded-tl-sm bg-white/[0.05] px-4 py-3">
                <p className="text-sm leading-relaxed text-white/85">
                  {proceso.resumenCliente}
                </p>
                <div className="mt-2 flex items-center gap-1.5 text-[11px] text-white/35">
                  <BadgeCheck size={12} className="text-emerald-400/70" />
                  Generado por IA · anonimizado conforme a Ley 1581
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Resumen técnico para el abogado */}
        <section>
          <h3 className="mb-3 font-sora text-sm font-semibold text-white/80">
            Resumen técnico-jurídico · Abogado
          </h3>
          <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
            <p className="text-sm leading-relaxed text-white/70">
              {proceso.resumenAbogado}
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
