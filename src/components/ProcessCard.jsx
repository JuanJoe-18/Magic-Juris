import { ChevronDown, User } from 'lucide-react'
import {
  criticidadConfig,
  jurisdiccionConfig,
  formatRadicado,
} from '../lib/ui'

// ── Badge 3D de criticidad ──
// Crítica: rojo pulsante · Importante: ámbar · Informativa: azul.
function CriticidadBadge({ criticidad }) {
  const cfg = criticidadConfig[criticidad] ?? criticidadConfig.Informativa
  const isCritica = criticidad === 'Critica'
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold
                  ${isCritica ? 'animate-pulse-critical' : ''}`}
      style={{
        backgroundColor: cfg.bg,
        color: cfg.text,
        boxShadow: `0 0 12px ${cfg.ring}, inset 0 1px 0 rgba(255,255,255,0.25)`,
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-white/90" />
      {cfg.label}
    </span>
  )
}

// ── Tarjeta de proceso judicial ──
export default function ProcessCard({ proceso, seleccionado, onSelect }) {
  const jur = jurisdiccionConfig[proceso.jurisdiccion] ?? {
    label: proceso.jurisdiccion,
    icon: User,
    color: '#9CA3AF',
  }
  const JurIcon = jur.icon

  return (
    <button
      onClick={() => onSelect(proceso.id)}
      className={`hg-glass group relative flex w-full flex-col gap-4 rounded-2xl p-5 text-left
                  transition-all duration-200 hover:bg-white/[0.06]
                  ${
                    seleccionado
                      ? 'ring-1 ring-hg-red/60 bg-white/[0.06]'
                      : 'hover:-translate-y-0.5'
                  }`}
    >
      {/* Encabezado: radicado + badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-wider text-white/40">
            Radicado
          </p>
          <p className="font-sora text-sm font-semibold tracking-tight text-white/90">
            {formatRadicado(proceso.radicado)}
          </p>
        </div>
        <CriticidadBadge criticidad={proceso.criticidad} />
      </div>

      {/* Cliente */}
      <div>
        <p className="text-[11px] uppercase tracking-wider text-white/40">
          Cliente
        </p>
        <p className="truncate font-medium text-white">{proceso.cliente}</p>
      </div>

      {/* Meta: jurisdicción · estado · abogado */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/[0.04] px-2.5 py-1 text-white/70">
          <JurIcon size={13} style={{ color: jur.color }} />
          {jur.label}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/[0.04] px-2.5 py-1 text-white/70">
          <span className="font-sora font-semibold text-hg-red">
            {proceso.estado}
          </span>
          {proceso.estadoLabel}
        </span>
      </div>

      {/* Última actuación */}
      <div className="border-t border-white/[0.06] pt-3">
        <p className="text-[11px] uppercase tracking-wider text-white/40">
          Última actuación
        </p>
        <p className="text-sm text-white/80">{proceso.ultimaActuacion}</p>
      </div>

      {/* Pie: abogado + indicador de expansión */}
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-xs text-white/50">
          <User size={13} />
          {proceso.abogado}
        </span>
        <span
          className={`inline-flex items-center gap-1 text-xs font-medium transition-colors
                      ${seleccionado ? 'text-hg-red' : 'text-white/40 group-hover:text-white/70'}`}
        >
          {seleccionado ? 'Ver detalle' : 'Detalle'}
          <ChevronDown
            size={15}
            className={`transition-transform ${seleccionado ? 'rotate-180' : ''}`}
          />
        </span>
      </div>
    </button>
  )
}
