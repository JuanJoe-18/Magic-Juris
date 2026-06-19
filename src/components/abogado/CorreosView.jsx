import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Search } from 'lucide-react'
import { formatFecha, formatRadicado } from '../../lib/ui'
import { auditService } from '../../services/auditService'

const estadoBadge = {
  email: 'bg-[#84120C] text-white',
  email_stub: 'bg-[#7a2a2f]/60 text-white/90',
  portal: 'bg-[#202020] text-white/80',
}

export default function CorreosView({ proceso }) {
  const [communications, setCommunications] = useState([])
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    const loadCommunications = async () => {
      if (typeof proceso?.id !== 'number') {
        setCommunications([])
        return
      }
      try {
        const data = await auditService.getCommunicationsByProcess(proceso.id)
        setCommunications(data)
        setSelectedIndex(0)
      } catch (error) {
        console.warn('No fue posible cargar historial de comunicaciones.', error)
        setCommunications([])
      }
    }
    loadCommunications()
  }, [proceso?.id])

  const correos = useMemo(
    () =>
      communications.map((item) => ({
        ...item,
        asunto: item.channel === 'email_stub' ? 'Stub de tarea al cliente' : 'Comunicacion al cliente',
      })),
    [communications]
  )

  const activo = correos[selectedIndex]

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-sora text-2xl font-bold text-white md:text-3xl">
          Historial de correos
        </h1>
        <p className="mt-1 text-sm text-white/45">
          Cada comunicacion creada para el cliente queda disponible para consulta.
        </p>
      </div>

      <div className="rounded-[22px] border border-[#262626] bg-[#101010] p-5">
        <p className="mb-2 text-[12px] font-medium text-white/55">
          Buscar por radicado, canal o comunicacion registrada
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex flex-1 items-center gap-2 rounded-2xl border border-[#2C2C2C] bg-[#1A1A1A] px-4 py-3">
            <Search size={16} className="shrink-0 text-white/35" />
            <input
              readOnly
              value={proceso?.radicado || ''}
              placeholder="Radicado seleccionado"
              className="w-full bg-transparent text-sm text-white placeholder:text-white/35 focus:outline-none"
            />
          </div>
          <button className="shrink-0 rounded-2xl bg-[#84120C] px-6 py-3 text-sm font-semibold text-white">
            Historial del caso
          </button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-[22px] border border-[#262626] bg-[#101010] p-5">
          <h3 className="mb-4 font-sora text-lg font-bold text-white">
            Comunicaciones registradas
          </h3>
          <div className="space-y-3">
            {correos.length > 0 ? (
              correos.map((correo, index) => (
                <button
                  key={correo.id}
                  onClick={() => setSelectedIndex(index)}
                  className={`flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition-colors ${
                    index === selectedIndex
                      ? 'border-[#C5202E]/60 bg-[#161616]'
                      : 'border-[#2A2A2A] bg-[#161616] hover:border-[#383838]'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">
                      {correo.asunto}
                    </p>
                    <p className="mt-0.5 text-[12px] text-white/45">
                      {correo.channel} · {formatFecha(correo.created_at)}
                    </p>
                    <span
                      className={`mt-2 inline-block rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                        estadoBadge[correo.channel] ?? 'bg-[#202020] text-white/70'
                      }`}
                    >
                      {correo.channel}
                    </span>
                  </div>
                  <ArrowRight
                    size={18}
                    className={index === selectedIndex ? 'text-[#C5202E]' : 'text-white/40'}
                  />
                </button>
              ))
            ) : (
              <p className="text-sm text-white/45">
                No hay comunicaciones registradas para este proceso.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-[22px] border border-[#262626] bg-[#101010] p-5">
          <h3 className="mb-4 font-sora text-lg font-bold text-white">
            Preview del correo
          </h3>
          {activo ? (
            <div className="rounded-2xl bg-white p-6 text-[#1a1a1a] shadow-xl">
              <p className="font-sora text-lg font-bold">Actualizacion de su proceso</p>
              <p className="mt-3 text-sm font-bold text-[#84120C]">
                Radicado {proceso ? formatRadicado(proceso.radicado) : ''}
              </p>
              <pre className="mt-4 whitespace-pre-wrap font-sans text-sm leading-6 text-[#333]">
                {activo.message}
              </pre>
            </div>
          ) : (
            <p className="text-sm text-white/40">Sin correos para previsualizar.</p>
          )}
        </div>
      </div>
    </div>
  )
}
