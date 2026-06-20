import { useEffect, useState } from 'react'
import { AlarmClock, CalendarClock, Loader2, RefreshCw, ShieldAlert } from 'lucide-react'

import { api } from '../../lib/api'
import { formatRadicado } from '../../lib/ui'

// Color por criticidad (alineado al resto del sistema).
const colorCriticidad = {
  Critica: { bg: '#84120C', text: '#FFFFFF', label: 'Crítica' },
  Importante: { bg: '#C79B2B', text: '#1A1A1A', label: 'Importante' },
  Informativa: { bg: '#3A3A3A', text: '#FFFFFF', label: 'Informativa' },
}

const etiquetaTipo = {
  audiencia: 'Audiencia',
  termino: 'Vencimiento de término',
  traslado: 'Traslado',
  diligencia: 'Diligencia',
}

function textoDias(d) {
  if (d < 0) return `Vencido hace ${Math.abs(d)} día(s)`
  if (d === 0) return 'Es HOY'
  if (d === 1) return 'Mañana'
  return `En ${d} días`
}

function AlertaCard({ a }) {
  const c = colorCriticidad[a.criticidad] || colorCriticidad.Informativa
  const urgente = a.vencido || a.diasRestantes <= 3
  return (
    <div
      className="flex flex-wrap items-center justify-between gap-4 rounded-[22px] border bg-[#141414] px-5 py-4"
      style={{ borderColor: urgente ? '#84120C' : '#262626' }}
    >
      <div className="flex items-center gap-4">
        <span
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: c.bg, color: c.text }}
        >
          <CalendarClock size={20} />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white">
            {etiquetaTipo[a.tipoVencimiento] || 'Diligencia'} · {a.titulo}
          </p>
          <p className="mt-0.5 text-[12px] text-white/45">
            {a.radicado ? formatRadicado(a.radicado) : 'Sin radicado'}
            {a.despacho ? ` · ${a.despacho}` : ''}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span
          className="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide"
          style={{ backgroundColor: c.bg, color: c.text }}
        >
          {c.label}
        </span>
        <div className="text-right">
          <p
            className="font-sora text-lg font-bold leading-none"
            style={{ color: urgente ? '#F05656' : '#FFFFFF' }}
          >
            {textoDias(a.diasRestantes)}
          </p>
          <p className="mt-1 text-[11px] text-white/40">
            {new Date(a.fechaVencimiento).toLocaleDateString('es-CO')}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function AlertasView() {
  const [alertas, setAlertas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  const cargar = async () => {
    setCargando(true)
    setError(null)
    try {
      setAlertas(await api.alertasProximas())
    } catch (e) {
      setError('No se pudieron cargar las alertas. Verifica que el backend de seguimiento esté activo.')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 font-sora text-3xl font-bold text-white">
            <AlarmClock size={26} className="text-[#C79B2B]" /> Alertas proactivas
          </h1>
          <p className="mt-1 text-sm text-white/45">
            Próximos vencimientos detectados por IA. Se avisa con antelación según el nivel de criticidad.
          </p>
        </div>
        <button
          onClick={cargar}
          className="flex items-center gap-2 rounded-xl border border-[#2C2C2C] bg-[#161616] px-4 py-2 text-sm font-semibold text-white/80 transition-colors hover:border-[#454545]"
        >
          <RefreshCw size={15} /> Actualizar
        </button>
      </div>

      {error && <p className="text-[13px] font-medium text-[#C5202E]">{error}</p>}

      {cargando ? (
        <div className="flex items-center gap-2 py-10 text-sm text-white/45">
          <Loader2 className="animate-spin" size={16} /> Calculando próximos vencimientos…
        </div>
      ) : alertas.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-[24px] border border-[#262626] bg-[#121212] py-14 text-center">
          <ShieldAlert size={34} className="text-white/25" />
          <p className="text-sm text-white/50">No hay vencimientos próximos dentro de la ventana de antelación.</p>
          <p className="max-w-md text-[12px] text-white/35">
            Las alertas aparecen cuando la IA detecta una fecha futura (audiencia, término, traslado) en una
            actuación monitoreada.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {alertas.map((a) => (
            <AlertaCard key={a.actuacionId} a={a} />
          ))}
        </div>
      )}
    </div>
  )
}
