import { useMemo, useState } from 'react'
import { MessagesSquare, ArrowLeft } from 'lucide-react'
import RadicadoSearch from './RadicadoSearch'
import CasoPill from './CasoPill'
import CorreosView from './CorreosView'
import { clase } from './abogadoUi'

// ── Línea de tiempo vertical del estado del proceso ──
function EstadoTimeline({ proceso }) {
  // Tomamos las 3 actuaciones más recientes (la más nueva arriba).
  const nodos = useMemo(() => {
    const tl = [...(proceso?.lineaTiempo ?? [])].sort(
      (a, b) => new Date(b.fecha) - new Date(a.fecha)
    )
    return tl.slice(0, 3)
  }, [proceso])

  return (
    <div>
      <h2 className="mb-6 font-sora text-2xl font-bold text-white md:text-3xl">
        Estado del proceso:
      </h2>
      <div className="relative pl-2">
        {nodos.map((n, i) => {
          const c = clase(n.criticidad)
          const ultimo = i === nodos.length - 1
          return (
            <div key={i} className="relative flex gap-5 pb-8 last:pb-0">
              {/* Conector */}
              {!ultimo && (
                <span className="absolute left-[11px] top-6 h-full w-[2px] bg-[#3A3A3A]" />
              )}
              <span
                className="relative z-10 mt-1 h-6 w-6 shrink-0 rounded-full"
                style={{
                  backgroundColor: c.color,
                  boxShadow: `0 0 12px ${c.color}80`,
                }}
              />
              <div className="pt-0.5">
                <p className="font-sora text-lg font-bold text-white">
                  {n.titulo}
                </p>
                <p className="mt-1 text-sm text-white/45">{c.nota}</p>
                <p className="mt-0.5 text-[12px] text-white/30">{n.fecha}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Vista Historial: estado del proceso + comunicación al cliente ──
export default function HistorialView({ procesos, proceso, onSelect }) {
  const [verCorreos, setVerCorreos] = useState(false)

  // Estado vacío: pedir radicado.
  if (!proceso) {
    return (
      <div className="space-y-5">
        <h1 className="font-sora text-2xl font-bold text-white md:text-3xl">
          Historial completo del caso
        </h1>
        <RadicadoSearch
          procesos={procesos}
          onSelect={onSelect}
          placeholder="Ingrese el numero de radicado: ....."
          boton="Buscar caso"
          label="Radicado"
        />
      </div>
    )
  }

  if (verCorreos) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setVerCorreos(false)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-white/60 transition-colors hover:text-white"
        >
          <ArrowLeft size={16} /> Volver al historial
        </button>
        <CorreosView proceso={proceso} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="font-sora text-2xl font-bold text-white md:text-3xl">
        Historial completo del caso
      </h1>

      <CasoPill proceso={proceso} />

      <EstadoTimeline proceso={proceso} />

      {/* Historial de lo comunicado al cliente */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[22px] border border-[#262626] bg-[#141414] p-5">
        <div className="min-w-0">
          <h3 className="font-sora text-base font-bold text-white">
            Historial de lo comunicado al cliente
          </h3>
          <p className="mt-1 text-[13px] text-white/45">
            Cada resumen enviado por correo queda guardado en base de datos con
            fecha.
          </p>
        </div>
        <button
          onClick={() => setVerCorreos(true)}
          className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-[#84120C] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#A30F0A]"
        >
          <MessagesSquare size={16} /> Ver historial de mensajes
        </button>
      </div>
    </div>
  )
}
