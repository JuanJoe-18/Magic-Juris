import { useMemo, useState } from 'react'
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  FileText,
  Flag,
  History,
  Mail,
  MessageCircleMore,
  UserRound,
} from 'lucide-react'

import { formatRadicado } from '../../lib/ui'
import RadicadoSearch from './RadicadoSearch'
import CorreosView from './CorreosView'

const demoClientes = [
  'Inversiones del Pacifico S.A.S.',
  'Carlos Andres Restrepo Mejia',
  'Comercializadora Andina Ltda.',
  'Maria Fernanda Ocampo Rios',
  'Distribuciones Caribe S.A.',
  'Fundacion Semilla Verde',
]

function inferirEventos(proceso) {
  const timeline = [...(proceso?.lineaTiempo || [])].sort(
    (a, b) => new Date(b.fecha) - new Date(a.fecha)
  )

  const base = timeline.map((item, index) => ({
    id: `act-${index}`,
    fecha: item.fecha,
    hora: '10:35 a. m.',
    titulo: item.titulo || 'Nueva actuacion registrada',
    descripcion: item.descripcion || 'Se registro una novedad dentro del proceso.',
    tipo: /estado/i.test(item.titulo || '') ? 'estado' : 'actuacion',
  }))

  if (base.length > 1) {
    base.splice(1, 0, {
      id: 'mail-demo',
      fecha: base[1]?.fecha || base[0].fecha,
      hora: '09:15 a. m.',
      titulo: 'Correo enviado al cliente',
      descripcion: 'Se envio al cliente el reporte de avance del caso y los documentos correspondientes.',
      tipo: 'comunicacion',
    })
  }

  if (base.length > 2) {
    base.splice(2, 0, {
      id: 'task-demo',
      fecha: base[2]?.fecha || base[0].fecha,
      hora: '04:42 p. m.',
      titulo: 'Tarea asignada',
      descripcion: 'Se asigno una tarea al cliente con fecha limite para apoyar la revision del caso.',
      tipo: 'tarea',
    })
  }

  if (base.length > 3) {
    base.splice(3, 0, {
      id: 'reply-demo',
      fecha: base[3]?.fecha || base[0].fecha,
      hora: '11:20 a. m.',
      titulo: 'Respuesta del cliente',
      descripcion: 'El cliente cargo la informacion solicitada para continuar con la revision.',
      tipo: 'respuesta',
    })
  }

  return base.slice(0, 5)
}

function badgeFor(tipo) {
  switch (tipo) {
    case 'comunicacion':
      return { label: 'COMUNICACION', className: 'bg-white/5 text-white/70 border border-white/10' }
    case 'tarea':
      return { label: 'TAREA', className: 'bg-[#7B5B10]/20 text-[#E0B84F] border border-[#7B5B10]/40' }
    case 'respuesta':
      return { label: 'RESPUESTA', className: 'bg-[#0F5A2C]/20 text-[#50C878] border border-[#0F5A2C]/40' }
    case 'estado':
      return { label: 'ESTADO', className: 'bg-[#262E8F]/20 text-[#8491FF] border border-[#262E8F]/40' }
    default:
      return { label: 'ACTUACION', className: 'bg-[#6B1010]/20 text-[#FF7A7A] border border-[#6B1010]/40' }
  }
}

function iconFor(tipo) {
  switch (tipo) {
    case 'comunicacion':
      return Mail
    case 'tarea':
      return CalendarDays
    case 'respuesta':
      return MessageCircleMore
    case 'estado':
      return Flag
    default:
      return FileText
  }
}

function TimelineItem({ item, isLast }) {
  const Icon = iconFor(item.tipo)
  const badge = badgeFor(item.tipo)

  return (
    <div className="relative flex gap-5 pb-5 last:pb-0">
      {!isLast && <span className="absolute left-[104px] top-9 h-full w-px bg-white/10" />}

      <div className="relative z-10 min-w-[88px] pt-1 text-right text-[0.92rem] text-white/58">
        <p>{item.fecha}</p>
        <p className="mt-1">{item.hora}</p>
      </div>

      <span className="relative z-10 mt-3 h-3 w-3 shrink-0 rounded-full border border-white/50 bg-[#0D0D0D]" />

      <div className="flex flex-1 items-start gap-4 rounded-[22px] border border-[#2A2A2A] bg-[#141414] px-4 py-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white/72">
          <Icon size={20} />
        </span>

        <div className="min-w-0 flex-1">
          <p className="font-sora text-[1.15rem] font-semibold text-white">{item.titulo}</p>
          <p className="mt-2 max-w-[62ch] text-[0.98rem] leading-7 text-white/60">{item.descripcion}</p>
        </div>

        <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${badge.className}`}>
          {badge.label}
        </span>
      </div>
    </div>
  )
}

function SummaryRow({ icon: Icon, label, value, badge }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white/60">
        <Icon size={16} />
      </span>
      <div className="min-w-0">
        <p className="text-[0.9rem] text-white/45">{label}</p>
        {badge ? (
          <span className="mt-1 inline-flex rounded-full bg-[#262E8F]/20 px-3 py-1 text-[11px] font-semibold text-[#94A1FF]">
            {value}
          </span>
        ) : (
          <p className="mt-1 text-[1rem] text-white/88">{value}</p>
        )}
      </div>
    </div>
  )
}

export default function HistorialView({ procesos, proceso, onSelect }) {
  const [verCorreos, setVerCorreos] = useState(false)
  const [orden, setOrden] = useState('Mas recientes')

  const eventos = useMemo(() => inferirEventos(proceso), [proceso])

  if (verCorreos && proceso) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setVerCorreos(false)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-white/60 transition-colors hover:text-white"
        >
          <ArrowRight size={16} className="rotate-180" /> Volver al historial
        </button>
        <CorreosView proceso={proceso} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sora text-[3rem] font-bold leading-none text-white">
          Historial completo del caso
        </h1>
      </div>

      <div className="space-y-4">
        <RadicadoSearch
          procesos={procesos}
          onSelect={onSelect}
          placeholder="Ingrese el numero de radicado: ......"
          boton="Buscar caso"
          label="Radicado"
        />

        <div className="flex flex-wrap gap-3">
          {demoClientes.map((cliente, index) => (
            <span
              key={cliente}
              className={`rounded-full border px-4 py-2 text-sm ${
                index === 0
                  ? 'border-[#7E120D] bg-[#7E120D]/20 text-white'
                  : 'border-white/10 bg-[#171717] text-white/70'
              }`}
            >
              {cliente}
            </span>
          ))}
        </div>
      </div>

      {proceso ? (
        <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
          <div className="rounded-[30px] border border-[#2A2A2A] bg-[#121212] p-6">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <History size={20} className="text-white/72" />
                <h3 className="font-sora text-[1.55rem] font-bold text-white">Historial del caso</h3>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm text-white/55">Ordenar por:</span>
                <button
                  onClick={() =>
                    setOrden((current) =>
                      current === 'Mas recientes' ? 'Mas antiguos' : 'Mas recientes'
                    )
                  }
                  className="rounded-full border border-white/10 bg-[#171717] px-4 py-2 text-sm font-semibold text-white/78"
                >
                  {orden}
                </button>
              </div>
            </div>

            <div>
              {eventos.map((item, index) => (
                <TimelineItem
                  key={item.id}
                  item={item}
                  isLast={index === eventos.length - 1}
                />
              ))}
            </div>
          </div>

          <div className="rounded-[30px] border border-[#2A2A2A] bg-[#121212] p-6">
            <h3 className="font-sora text-[1.7rem] font-bold text-white">Resumen del caso</h3>

            <div className="mt-6 space-y-5">
              <SummaryRow icon={CalendarDays} label="Radicado" value={formatRadicado(proceso.radicado)} />
              <SummaryRow icon={UserRound} label="Cliente" value={proceso.cliente || 'Cliente asignado'} />
              <SummaryRow
                icon={FileText}
                label="Tipo de proceso"
                value={`Verbal - ${String(proceso.jurisdiccion || 'Civil').replace(/^./, (l) => l.toUpperCase())}`}
              />
              <SummaryRow icon={Flag} label="Estado actual" value={proceso.estadoLabel || proceso.estado || 'En tramite'} badge />
              <SummaryRow icon={FileText} label="Juzgado" value={proceso.despacho || 'Juzgado del proceso'} />
              <SummaryRow
                icon={Clock3}
                label="Ultima actualizacion"
                value={`${eventos[0]?.fecha || 'Sin fecha'} - ${eventos[0]?.hora || 'Sin hora'}`}
              />
            </div>

            <button
              onClick={() => setVerCorreos(true)}
              className="mt-8 inline-flex w-full items-center justify-center gap-3 rounded-2xl border border-[#7E120D] px-5 py-4 text-[1rem] font-semibold text-white transition-colors hover:bg-[#7E120D]/10"
            >
              Ver detalle del caso <ArrowRight size={18} />
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-[30px] border border-dashed border-[#2A2A2A] bg-[#111111] px-6 py-14 text-center text-white/45">
          Busca un caso para ver el historial completo del proceso.
        </div>
      )}
    </div>
  )
}
