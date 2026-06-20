import { useEffect, useState } from 'react'
import { Mail } from 'lucide-react'

import { auditService } from '../../services/auditService'
import { formatFecha } from '../../lib/ui'
import ClienteRadicado from './ClienteRadicado'

function HistoryCard({ item }) {
  return (
    <div className="flex items-start gap-4 rounded-[24px] border border-[#2A2A2A] bg-[#151515] px-5 py-4">
      <span className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/70">
        <Mail size={20} />
      </span>
      <div>
        <p className="text-[1.05rem] font-semibold text-white">
          {formatFecha(item.created_at)} - {item.channel === 'email_stub' ? 'Correo generado' : 'Correo enviado'}
        </p>
        <p className="mt-1 text-[1rem] leading-7 text-white/62">{item.message}</p>
      </div>
    </div>
  )
}

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
    <div className="space-y-6">
      <div>
        <h1 className="font-sora text-[3rem] font-bold leading-none text-white">Historial</h1>
        <p className="mt-4 text-[1.1rem] text-white/60">
          Consulta por numero de radicado y recibe un resumen claro, sin lenguaje tecnico.
        </p>
      </div>

      <ClienteRadicado procesos={procesos} onSelect={onSelect} />

      <div className="rounded-[30px] border border-[#2A2A2A] bg-[#121212] p-6">
        <h3 className="font-sora text-[2rem] font-bold uppercase tracking-wide text-white">
          Historial de correos
        </h3>
        <p className="mt-2 text-[1rem] text-white/55">
          Correos enviados desde la admision del proceso.
        </p>

        {proceso ? (
          <div className="mt-6 space-y-4">
            {communications.length > 0 ? (
              communications.map((item) => <HistoryCard key={item.id} item={item} />)
            ) : (
              <p className="text-[1rem] text-white/40">
                Este proceso aun no registra comunicaciones.
              </p>
            )}
          </div>
        ) : (
          <p className="mt-6 text-[1rem] text-white/40">
            Selecciona un proceso para revisar su historial.
          </p>
        )}
      </div>
    </div>
  )
}
