import { useEffect, useState } from 'react'
import { Mail } from 'lucide-react'
import ClienteRadicado from './ClienteRadicado'
import { auditService } from '../../services/auditService'
import { formatFecha } from '../../lib/ui'

export default function ClienteHistorialView({ procesos, proceso, onSelect }) {
  const [communications, setCommunications] = useState([])

  useEffect(() => {
    const loadCommunications = async () => {
      if (typeof proceso?.id !== 'number') {
        setCommunications([])
        return
      }
      try {
        const data = await auditService.getCommunicationsByProcess(proceso.id)
        setCommunications(data)
      } catch (error) {
        console.warn('No fue posible cargar comunicaciones del cliente.', error)
        setCommunications([])
      }
    }
    loadCommunications()
  }, [proceso?.id])

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-sora text-2xl font-bold text-white md:text-3xl">
          Historial
        </h1>
        <p className="mt-1 text-sm text-white/45">
          Revisa las comunicaciones registradas sobre tu proceso.
        </p>
      </div>

      <ClienteRadicado procesos={procesos} onSelect={onSelect} />

      <div className="rounded-[22px] border border-[#262626] bg-[#101010] p-5">
        <h3 className="font-sora text-lg font-bold uppercase tracking-wide text-white">
          Historial de correos y stubs
        </h3>
        <p className="mt-1 text-[13px] text-white/45">
          Correos o borradores generados desde el seguimiento del caso.
        </p>

        {proceso ? (
          <div className="mt-4 space-y-3">
            {communications.length > 0 ? (
              communications.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 rounded-2xl border border-[#262626] bg-[#161616] px-4 py-3"
                >
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#202020] text-white/60">
                    <Mail size={14} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      <span className="text-white/55">{formatFecha(item.created_at)}</span>
                      <span className="mx-2 text-white/30">·</span>
                      {item.channel}
                    </p>
                    <p className="mt-0.5 whitespace-pre-wrap text-[13px] text-white/55">
                      {item.message}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="mt-6 text-[15px] text-white/40">
                Este proceso aun no registra comunicaciones.
              </p>
            )}
          </div>
        ) : (
          <p className="mt-6 text-[15px] text-white/40">
            Selecciona un proceso para revisar su historial.
          </p>
        )}
      </div>
    </div>
  )
}
