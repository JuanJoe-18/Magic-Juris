import { X, Sparkles, BadgeCheck, Bot, BookOpen, UserCheck, User, Users, CalendarDays } from 'lucide-react'
import {
  criticidadConfig,
  tipoActuacionIcon,
  jurisdiccionConfig,
  formatRadicado,
  formatFecha,
} from '../lib/ui'

// ── Configuración visual del sujeto procesal (Master Prompt de Fajardo) ──
const parteConfig = {
  Demandante: { label: 'Demandante', icon: UserCheck, color: '#22d3ee' },
  Demandado:  { label: 'Demandado',  icon: User,      color: '#fb923c' },
  Ambos:      { label: 'Ambos',      icon: Users,     color: '#a78bfa' },
}

// ── Panel de detalle de un proceso ──
// Línea de tiempo con sujeto procesal + motivo de IA + resumen por rol.
export default function ProcessDetail({ proceso, onClose }) {
  if (!proceso) return null
  const jur = jurisdiccionConfig[proceso.jurisdiccion]

  return (
    <div className="flex h-full flex-col rounded-[22px] bg-black border border-[#3A3A3A] overflow-hidden">
      {/* Encabezado */}
      <div className="flex items-start justify-between gap-4 border-b border-[#3A3A3A] p-5 bg-[#1C1C1C]">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-sora text-xs font-semibold text-hg-red">
              {proceso.estado}
            </span>
            <span className="text-xs text-white/50">{proceso.estadoLabel}</span>
            {jur && (
              <span className="rounded-md bg-[#3A3A3A]/50 px-2 py-0.5 text-[10px] text-white/60 border border-[#3A3A3A]">
                {jur.label}
              </span>
            )}
          </div>
          <h2 className="mt-1 truncate font-sora text-lg font-semibold text-white/90">
            {proceso.cliente}
          </h2>
          <p className="font-mono text-xs text-white/45 bg-black/50 inline-block px-2 py-0.5 rounded-md mt-1 border border-[#3A3A3A]">
            {formatRadicado(proceso.radicado)}
          </p>
          <p className="mt-0.5 text-xs text-white/40">{proceso.despacho}</p>
        </div>
        <button
          onClick={onClose}
          className="shrink-0 rounded-full p-2 text-white/50 bg-[#1C1C1C] border border-[#3A3A3A] transition-colors hover:bg-[#3A3A3A] hover:text-white"
          aria-label="Cerrar detalle"
        >
          <X size={16} />
        </button>
      </div>

      {/* Cuerpo scrolleable */}
      <div className="flex-1 space-y-6 overflow-y-auto no-scrollbar p-5">
        {/* Línea de tiempo de actuaciones */}
        <section>
          <h3 className="mb-4 font-sora text-sm font-semibold text-white/80">
            Línea de tiempo de actuaciones
          </h3>
          <ol className="relative space-y-5 border-l border-[#3A3A3A] pl-6">
            {proceso.lineaTiempo.map((act, i) => {
              const cfg =
                criticidadConfig[act.criticidad] ?? criticidadConfig.Informativa
              const Icon = tipoActuacionIcon[act.tipo] ?? tipoActuacionIcon.Auto
              const parteCfg = parteConfig[act.parte] || parteConfig.Ambos
              const ParteIcon = parteCfg?.icon
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
                  <div className="rounded-xl bg-[#1C1C1C] border border-[#3A3A3A] p-3.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] uppercase tracking-wider text-white/40 flex items-center gap-1">
                        <CalendarDays size={10} />
                        {formatFecha(act.fecha)}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {/* Badge de sujeto procesal */}
                        {act.parte && (
                          <span
                            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border"
                            style={{
                              borderColor: `${parteCfg.color}40`,
                              color: parteCfg.color,
                              backgroundColor: `${parteCfg.color}10`,
                            }}
                          >
                            <ParteIcon size={9} />
                            {parteCfg.label}
                          </span>
                        )}
                        {/* Badge de criticidad */}
                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                          style={{ backgroundColor: cfg.bg, color: cfg.text }}
                        >
                          {cfg.label}
                        </span>
                      </div>
                    </div>
                    <p className="mt-1 font-medium text-white/90">{act.titulo}</p>
                    <p className="mt-1 text-sm leading-relaxed text-white/55">
                      {act.descripcion}
                    </p>
                    {/* Motivo de clasificación IA */}
                    {act.motivo && (
                      <div className="mt-2 flex items-center gap-1.5 text-[10px] text-white/35 border-t border-[#3A3A3A]/50 pt-2">
                        {act.clasificadoPor === 'gemini' ? (
                          <Bot size={10} className="text-emerald-400/70" />
                        ) : (
                          <BookOpen size={10} className="text-white/30" />
                        )}
                        <span className="italic">{act.motivo}</span>
                        <span className="ml-auto text-[9px] text-white/20">
                          {act.clasificadoPor === 'gemini' ? 'Gemini IA' : 'Reglas'}
                        </span>
                      </div>
                    )}
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

          <div className="space-y-3 rounded-xl bg-[#1C1C1C] border border-[#3A3A3A] p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-hg-red/15 border border-hg-red/30">
                <Sparkles size={15} className="text-hg-red" />
              </div>
              <div className="rounded-2xl rounded-tl-sm bg-black/40 border border-[#3A3A3A] px-4 py-3">
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
          <div className="rounded-xl border border-[#3A3A3A] bg-[#1C1C1C] p-4">
            <p className="text-sm leading-relaxed text-white/70 font-mono">
              {proceso.resumenAbogado}
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
