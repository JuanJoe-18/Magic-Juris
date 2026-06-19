import { useMemo, useState } from 'react'
import {
  ChevronDown,
  ArrowDownWideNarrow,
  UserRound,
  Shield,
  FileText,
} from 'lucide-react'
import { formatRadicado, formatFecha, criticidadPeso } from '../../lib/ui'
import { clase, nombreDocumento } from './abogadoUi'
import RadicadoSearch from './RadicadoSearch'

// ── Tarjeta de una actuación (información cruda de la Rama Judicial) ──
function ActuacionCard({ act }) {
  const [abierto, setAbierto] = useState(false)
  const c = clase(act.criticidad)
  const esDemandado = ['Radicacion', 'Traslado', 'Prueba'].includes(act.tipo)
  const ParteIcon = esDemandado ? Shield : UserRound
  const doc = nombreDocumento(act)

  return (
    <div className="rounded-2xl border border-[#2A2A2A] bg-[#161616] p-4 transition-colors hover:border-[#383838]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-sora text-sm font-bold tracking-wide text-white">
            <span className="text-white/60">{act.fecha}</span>
            <span className="mx-2 text-white/30">·</span>
            {act.titulo.toUpperCase()}
          </p>
          <p className="mt-1.5 text-[13px] text-white/55">
            Anotación:{' '}
            <span className="text-white/75">
              {abierto ? act.descripcion : `${act.descripcion.slice(0, 70)}…`}
            </span>
          </p>
          <p className="mt-1 text-[12px] text-white/40">
            Documento: <span className="text-white/60">{doc}</span>
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-center gap-3">
          <span title={c.nivel}>
            <ParteIcon size={18} style={{ color: c.color }} />
          </span>
          <button
            onClick={() => setAbierto((v) => !v)}
            className="text-white/40 transition-colors hover:text-white"
            aria-label="Expandir actuación"
          >
            <ChevronDown
              size={20}
              className={`transition-transform ${abierto ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
      </div>

      {abierto && (
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[#262626] pt-3 text-[11px]">
          <span
            className="rounded-full px-2.5 py-1 font-semibold text-white"
            style={{ backgroundColor: c.color }}
          >
            {c.nivel}
          </span>
          <span className="rounded-full bg-[#202020] px-2.5 py-1 text-white/60">
            Estado {act.estado}
          </span>
          {doc !== 'Sin documento asociado' && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#202020] px-2.5 py-1 text-white/60">
              <FileText size={12} /> {doc}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

// ── Panel lateral: Guía Visual de Clasificación ──
function GuiaClasificacion() {
  const filas = [
    { nivel: 'Alta', color: '#C5202E', rango: 'De 1 a 7 dias' },
    { nivel: 'Media', color: '#C79B2B', rango: 'De 7 a 20 dias' },
    { nivel: 'Baja', color: '#3FA66B', rango: 'De 20 a 30 dias' },
  ]
  return (
    <div className="rounded-[22px] border border-[#262626] bg-[#101010] p-5">
      <p className="mb-1 flex items-center justify-end gap-1 text-[11px] font-semibold text-white/45">
        NOTA: ESTO ES URGENCIA <span className="text-white/60">↘</span>
      </p>
      <h3 className="mb-4 font-sora text-lg font-bold text-white">
        Guía Visual De Clasificacion
      </h3>

      <div className="space-y-3">
        {filas.map((f) => (
          <div key={f.nivel} className="flex items-center gap-3">
            <span
              className="w-16 rounded-full py-1 text-center text-[12px] font-bold text-white"
              style={{ backgroundColor: f.color }}
            >
              {f.nivel}
            </span>
            <span className="flex-1 rounded-xl border border-[#2A2A2A] bg-[#161616] px-3 py-1.5 text-center text-[13px] font-semibold text-white/85">
              {f.rango}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-5 flex gap-2">
        <span className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#2A2A2A] bg-[#161616] px-3 py-2 text-[12px] font-semibold text-white/80">
          <Shield size={13} /> Demandado
        </span>
        <span className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#2A2A2A] bg-[#161616] px-3 py-2 text-[12px] font-semibold text-white/80">
          <UserRound size={13} /> Demandante
        </span>
      </div>
    </div>
  )
}

// ── Vista Consulta: consulta cruda y autoclasificación de actuaciones ──
export default function ConsultaView({ procesos, proceso, onSelect }) {
  const [orden, setOrden] = useState('cronologico')
  const [menuOrden, setMenuOrden] = useState(false)

  const actuaciones = useMemo(() => {
    const lista = [...(proceso?.lineaTiempo ?? [])]
    if (orden === 'urgencia') {
      lista.sort(
        (a, b) =>
          (criticidadPeso[b.criticidad] ?? 0) - (criticidadPeso[a.criticidad] ?? 0)
      )
    } else {
      lista.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    }
    return lista
  }, [proceso, orden])

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-sora text-2xl font-bold text-white md:text-3xl">
          Consulta profesional por radicado
        </h1>
        <p className="mt-1 text-sm text-white/45">
          Vista para abogado: información cruda, clasificación de relevancia y
          reglas de notificación.
        </p>
      </div>

      <RadicadoSearch procesos={procesos} onSelect={onSelect} />

      <div className="grid gap-5 lg:grid-cols-[1fr_minmax(280px,340px)]">
        {/* Últimas actualizaciones */}
        <div className="rounded-[22px] border border-[#262626] bg-[#101010] p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="font-sora text-lg font-bold text-white">
                Ultimas Actualizaciones de sus proceso
              </h3>
              <p className="mt-1 text-[12px] text-white/40">
                Fuente: consulta Rama Judicial · Ultima fecha: 18/06/26
              </p>
            </div>

            {/* Filtro de orden */}
            <div className="relative">
              <button
                onClick={() => setMenuOrden((v) => !v)}
                className="inline-flex items-center gap-2 rounded-xl border border-[#2A2A2A] bg-[#161616] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1C1C1C]"
              >
                Filtrar <ArrowDownWideNarrow size={16} />
              </button>
              {menuOrden && (
                <div className="absolute right-0 z-10 mt-2 w-56 overflow-hidden rounded-xl border border-[#2A2A2A] bg-[#161616] shadow-xl">
                  {[
                    { id: 'cronologico', label: 'Ordenar cronologicamente' },
                    { id: 'urgencia', label: 'Ordenar por urgencia' },
                  ].map((o) => (
                    <button
                      key={o.id}
                      onClick={() => {
                        setOrden(o.id)
                        setMenuOrden(false)
                      }}
                      className={`block w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-[#202020] ${
                        orden === o.id ? 'text-white' : 'text-white/60'
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {proceso && (
            <p className="mt-3 font-mono text-[11px] text-white/30">
              {formatRadicado(proceso.radicado)} · {proceso.cliente}
            </p>
          )}

          <div className="mt-4 space-y-3">
            {actuaciones.length > 0 ? (
              actuaciones.map((act, i) => <ActuacionCard key={i} act={act} />)
            ) : (
              <div className="rounded-2xl border border-dashed border-[#2A2A2A] py-12 text-center text-sm text-white/40">
                Seleccione un radicado para consultar sus actuaciones.
              </div>
            )}
          </div>
        </div>

        <GuiaClasificacion />
      </div>
    </div>
  )
}
