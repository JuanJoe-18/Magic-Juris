import { ChevronDown, User, UserCheck, Users, Bot, BookOpen } from 'lucide-react'
import {
  criticidadConfig,
  jurisdiccionConfig,
  formatRadicado,
} from '../lib/ui'

// ── Badge 3D de criticidad ──
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

// ── Badge de sujeto procesal (Master Prompt) ──
const parteConfig = {
  Demandante: { label: 'Demandante', icon: UserCheck, color: '#22d3ee' },
  Demandado:  { label: 'Demandado',  icon: User,      color: '#fb923c' },
  Ambos:      { label: 'Ambos',      icon: Users,     color: '#a78bfa' },
}

function ParteBadge({ parte }) {
  if (!parte) return null
  const cfg = parteConfig[parte] || parteConfig.Ambos
  const Icon = cfg.icon
  return (
    <span
      className="inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider border"
      style={{ borderColor: `${cfg.color}40`, color: cfg.color, backgroundColor: `${cfg.color}10` }}
    >
      <Icon size={11} />
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

  // Extraer parte y motivo de la última actuación en lineaTiempo
  const ultimaAct = proceso.lineaTiempo?.[proceso.lineaTiempo.length - 1]
  const parte = ultimaAct?.parte
  const motivo = ultimaAct?.motivo
  const clasificadoPor = ultimaAct?.clasificadoPor

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

      {/* Meta: jurisdicción · estado · sujeto procesal */}
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
        <ParteBadge parte={parte} />
      </div>

      {/* Última actuación + motivo IA */}
      <div className="border-t border-white/[0.06] pt-3">
        <p className="text-[11px] uppercase tracking-wider text-white/40">
          Última actuación
        </p>
        <p className="text-sm text-white/80">{proceso.ultimaActuacion}</p>
        {motivo && (
          <div className="mt-1.5 flex items-center gap-1.5">
            {clasificadoPor === 'gemini' ? (
              <Bot size={11} className="text-emerald-400/70" />
            ) : (
              <BookOpen size={11} className="text-white/30" />
            )}
            <span className="text-[10px] text-white/40 italic">{motivo}</span>
          </div>
        )}
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
