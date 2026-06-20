import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Download, Mail, Search } from 'lucide-react'

import { formatFecha, formatRadicado } from '../../lib/ui'
import { auditService } from '../../services/auditService'

const channelBadge = {
  email: 'border border-white/10 bg-white/[0.04] text-white/80',
  email_stub: 'border border-[#8A5A18]/40 bg-[#8A5A18]/20 text-[#E5B764]',
  portal: 'border border-[#174A7D]/40 bg-[#174A7D]/20 text-[#6DB5FF]',
}

const stateBadge = {
  email: 'border border-[#245E2B]/40 bg-[#245E2B]/20 text-[#66C87B]',
  email_stub: 'border border-[#8A5A18]/40 bg-[#8A5A18]/20 text-[#E5B764]',
  portal: 'border border-[#245E2B]/40 bg-[#245E2B]/20 text-[#66C87B]',
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
      communications.map((item, index) => ({
        ...item,
        asunto:
          item.channel === 'email_stub'
            ? 'Resumen IA · Demanda admitida'
            : index % 2 === 0
              ? 'Alerta de actuacion relevante'
              : 'Seguimiento semanal del proceso',
      })),
    [communications]
  )

  const activo = correos[selectedIndex]

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[12px] font-medium tracking-wide text-white/55">
          Sistema de seguimiento judicial
        </p>
        <h1 className="mt-2 font-sora text-[3rem] font-bold leading-none text-white">
          Historial de comunicaciones
        </h1>
        <p className="mt-4 text-[1.1rem] text-white/60">
          Revise el historial de correos y comunicaciones enviadas al cliente con trazabilidad completa.
        </p>
      </div>

      <div className="rounded-[30px] border border-[#2A2A2A] bg-[#121212] p-5">
        <p className="mb-3 text-[1rem] font-medium text-white">Buscar por radicado, cliente o asunto</p>
        <div className="flex flex-col gap-4 xl:flex-row">
          <div className="flex flex-1 items-center gap-3 rounded-2xl border border-[#333333] bg-[#141414] px-5 py-4">
            <Search size={18} className="shrink-0 text-white/35" />
            <input
              readOnly
              value={`${proceso?.radicado || ''} / ${proceso?.cliente || 'cliente@correo.com'}`}
              className="w-full bg-transparent text-[1rem] text-white placeholder:text-white/35 focus:outline-none"
            />
          </div>

          <button className="min-w-[170px] rounded-2xl bg-gradient-to-r from-[#7E120D] to-[#B3160E] px-6 py-4 text-[1rem] font-semibold text-white">
            Filtrar
          </button>

          <button className="inline-flex min-w-[160px] items-center justify-center gap-3 rounded-2xl border border-[#3A3A3A] bg-transparent px-6 py-4 text-[1rem] font-semibold text-white/88">
            <Download size={18} /> Exportar
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="rounded-[30px] border border-[#2A2A2A] bg-[#121212] p-5">
          <h3 className="font-sora text-[2rem] font-bold text-white">Comunicaciones enviadas</h3>

          <div className="mt-5 space-y-4">
            {correos.length > 0 ? (
              correos.map((correo, index) => (
                <button
                  key={correo.id}
                  onClick={() => setSelectedIndex(index)}
                  className={`flex w-full items-start justify-between gap-4 rounded-[24px] border px-5 py-5 text-left transition-colors ${
                    index === selectedIndex
                      ? 'border-[#8F1B13] bg-[#151515]'
                      : 'border-[#2A2A2A] bg-[#151515] hover:border-[#3B3B3B]'
                  }`}
                >
                  <div className="flex gap-4">
                    <span className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/72">
                      <Mail size={20} />
                    </span>

                    <div>
                      <p className="text-[1.15rem] font-semibold text-white">{correo.asunto}</p>
                      <p className="mt-1 text-[0.96rem] text-white/55">
                        {proceso?.cliente || 'cliente@correo.com'} · Enviado {formatFecha(correo.created_at)}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                            channelBadge[correo.channel] || 'border border-white/10 bg-white/[0.04] text-white/80'
                          }`}
                        >
                          {correo.channel === 'email_stub' ? 'Correo' : 'Correo'}
                        </span>
                        <span
                          className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                            stateBadge[correo.channel] || 'border border-white/10 bg-white/[0.04] text-white/80'
                          }`}
                        >
                          {correo.channel === 'email_stub' ? 'Guardado en BD' : 'Entregado'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-2 pt-5 text-sm font-medium text-white/82">
                    Ver detalle <ArrowRight size={18} className={index === selectedIndex ? 'text-[#C5202E]' : 'text-white'} />
                  </span>
                </button>
              ))
            ) : (
              <p className="text-sm text-white/45">No hay comunicaciones registradas para este proceso.</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[30px] border border-[#2A2A2A] bg-[#121212] p-5">
            <h3 className="font-sora text-[1.8rem] font-bold text-white">Preview del correo</h3>

            {activo ? (
              <div className="mt-5 rounded-[26px] bg-[#F2F0EC] p-7 text-[#1C1C1C] shadow-xl">
                <p className="font-sora text-[2rem] font-bold">Actualizacion de su proceso</p>
                <p className="mt-4 text-[1.05rem] font-bold text-[#8A140E]">
                  Radicado {proceso ? formatRadicado(proceso.radicado) : ''}
                </p>

                <div className="mt-6 space-y-6 text-[1.05rem] leading-8 text-[#2A2A2A]">
                  <div>
                    <p className="font-semibold">Resumen IA</p>
                    <p className="mt-1 whitespace-pre-wrap">{activo.message}</p>
                  </div>

                  <div>
                    <p className="font-semibold">Proximo paso sugerido</p>
                    <p className="mt-1">
                      Por ahora no se requiere una accion inmediata de su parte. Si el abogado necesita
                      documentos adicionales, se le notificara por este medio.
                    </p>
                  </div>
                </div>

                <div className="mt-8 h-px bg-[#BDB7AF]" />
                <p className="mt-4 text-[0.96rem] text-[#55504A]">
                  Enviado automaticamente por MagicJuris para Hurtado Gandini.
                </p>
              </div>
            ) : (
              <p className="mt-5 text-sm text-white/40">Sin correos para previsualizar.</p>
            )}
          </div>

          <div className="rounded-[30px] border border-[#2A2A2A] bg-[#121212] p-5">
            <h3 className="font-sora text-[1.8rem] font-bold text-white">Metadatos de la comunicacion</h3>

            {activo ? (
              <>
                <div className="mt-5 grid grid-cols-[auto_1fr] gap-x-5 gap-y-3 text-[1rem]">
                  <span className="text-white/48">Radicado</span>
                  <span className="text-white/88">{formatRadicado(proceso.radicado)}</span>
                  <span className="text-white/48">Cliente</span>
                  <span className="text-white/88">{proceso?.cliente || 'Cliente asignado'}</span>
                  <span className="text-white/48">Tipo de mensaje</span>
                  <span className="text-white/88">{activo.asunto}</span>
                  <span className="text-white/48">Fecha de envio</span>
                  <span className="text-white/88">{formatFecha(activo.created_at)}</span>
                  <span className="text-white/48">Estado</span>
                  <span className="text-white/88">{activo.channel === 'email_stub' ? 'Guardado en BD' : 'Entregado'}</span>
                  <span className="text-white/48">Responsable</span>
                  <span className="text-white/88">Juan S Muñoz</span>
                  <span className="text-white/48">Adjuntos</span>
                  <span className="text-white/88">2 archivos</span>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <span className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white/86">
                    Correo
                  </span>
                  <span className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white/86">
                    Trazable
                  </span>
                  <span className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white/86">
                    Archivado
                  </span>
                </div>
              </>
            ) : (
              <p className="mt-5 text-sm text-white/40">Sin metadatos disponibles.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
