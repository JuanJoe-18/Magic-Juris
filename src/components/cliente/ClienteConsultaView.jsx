import { useEffect, useMemo, useState } from 'react'
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Loader2,
  LoaderCircle,
  Scale,
} from 'lucide-react'

import { api } from '../../lib/api'
import { formatRadicado } from '../../lib/ui'
import { taskService } from '../../services/taskService'
import ClienteRadicado from './ClienteRadicado'
import { resumenNatural } from './clienteUtil'

function SummaryRow({ icon: Icon, title, children }) {
  return (
    <div className="flex gap-4 border-b border-white/10 py-5 last:border-b-0 last:pb-0 first:pt-0">
      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white/70">
        <Icon size={22} />
      </span>
      <div>
        <p className="font-sora text-[1.08rem] font-semibold text-white">{title}</p>
        <p className="mt-1 max-w-[44ch] text-[1rem] leading-7 text-white/65">{children}</p>
      </div>
    </div>
  )
}

function MetaRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-4 border-b border-white/10 py-6 last:border-b-0 last:pb-0 first:pt-0">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-white/60">
        <Icon size={20} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[0.98rem] text-white/55">{label}</p>
      </div>
      <p className="text-right text-[1rem] font-medium text-white/88">{value}</p>
    </div>
  )
}

function TaskCard({ task, onUpdate, busyTaskId }) {
  const canComplete = task.status !== 'COMPLETADA'
  const dueLabel = task.due_date || 'Sin fecha limite definida'

  return (
    <div className="rounded-[24px] border border-[#2A2A2A] bg-[#151515] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-sora text-lg font-bold text-white">{task.title}</p>
        <span className="rounded-full bg-[#1F1F1F] px-3 py-1 text-[12px] font-semibold text-white/78">
          {task.priority} · {task.status}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-white/62">{task.description}</p>
      <p className="mt-3 text-[12px] text-white/38">Fecha limite: {dueLabel}</p>

      <div className="mt-5 flex flex-wrap gap-3">
        {task.status === 'PENDIENTE' && (
          <button
            onClick={() => onUpdate(task.id, 'EN_PROCESO')}
            disabled={busyTaskId === task.id}
            className="rounded-2xl border border-[#3A3A3A] px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-[#84120C] disabled:opacity-60"
          >
            {busyTaskId === task.id ? 'Actualizando...' : 'Marcar en proceso'}
          </button>
        )}
        {canComplete && (
          <button
            onClick={() => onUpdate(task.id, 'COMPLETADA')}
            disabled={busyTaskId === task.id}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#84120C] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#A30F0A] disabled:opacity-60"
          >
            <CheckCircle2 size={15} /> Marcar como completada
          </button>
        )}
      </div>
    </div>
  )
}

export default function ClienteConsultaView({ procesos, proceso, onSelect }) {
  const [tasks, setTasks] = useState([])
  const [loadingTasks, setLoadingTasks] = useState(true)
  const [taskMessage, setTaskMessage] = useState('')
  const [busyTaskId, setBusyTaskId] = useState(null)
  const [resultadoApi, setResultadoApi] = useState(null)
  const [cargandoApi, setCargandoApi] = useState(false)
  const [errorApi, setErrorApi] = useState(null)

  useEffect(() => {
    const loadTasks = async () => {
      setLoadingTasks(true)
      try {
        const data = await taskService.getTasks()
        setTasks(data)
      } catch (error) {
        console.warn('No fue posible cargar tareas del cliente.', error)
      } finally {
        setLoadingTasks(false)
      }
    }

    loadTasks()
  }, [])

  useEffect(() => {
    if (proceso) {
      setResultadoApi(null)
      setErrorApi(null)
    }
  }, [proceso])

  const handleTaskUpdate = async (taskId, status) => {
    setTaskMessage('')
    setBusyTaskId(taskId)
    try {
      const updated = await taskService.updateTaskStatus(taskId, status)
      setTasks((current) => current.map((task) => (task.id === taskId ? updated : task)))
      setTaskMessage(
        status === 'COMPLETADA'
          ? 'La tarea fue marcada como completada.'
          : 'La tarea fue marcada como en proceso.'
      )
    } catch (error) {
      setTaskMessage(error.message || 'No fue posible actualizar la tarea.')
    } finally {
      setBusyTaskId(null)
    }
  }

  const consultarExterno = async (radicado) => {
    const limpio = radicado.replace(/\D/g, '')
    if (limpio.length !== 23) {
      setErrorApi('El numero de radicado debe tener 23 digitos.')
      return
    }

    setCargandoApi(true)
    setErrorApi(null)
    try {
      const data = await api.consultar(limpio)
      const procesoApi = data?.proceso ? { ...data.proceso } : null
      if (procesoApi && data?.resumenes?.cliente) {
        procesoApi.resumenCliente = data.resumenes.cliente
        procesoApi.criticidad = data.actuaciones?.[0]?.criticidad || 'Informativa'
      }
      setResultadoApi({ ...data, proceso: procesoApi })
      onSelect(null)
    } catch (error) {
      setErrorApi('No se pudo consultar. Verifica que el backend de seguimiento este activo.')
      setResultadoApi(null)
    } finally {
      setCargandoApi(false)
    }
  }

  const isApi = Boolean(resultadoApi)
  const processData = isApi ? resultadoApi?.proceso : proceso
  const summary = resumenNatural(processData)

  const urgencyBadge = useMemo(() => {
    if (!summary) return null
    return {
      label: summary.urgenciaLabel,
      color: summary.urgenciaColor,
    }
  }, [summary])

  const lastUpdateDate =
    resultadoApi?.proceso?.sincronizadoEn ||
    processData?.updated_at ||
    processData?.lineaTiempo?.[0]?.fecha ||
    null

  const processState =
    processData?.estadoLabel || processData?.etapa || processData?.estado || 'En seguimiento'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sora text-[3.1rem] font-bold leading-none text-white">
          Consultar caso admitido
        </h1>
        <p className="mt-4 text-[1.1rem] text-white/60">
          Consulta por numero de radicado y recibe un resumen claro, sin lenguaje tecnico.
        </p>
      </div>

      <ClienteRadicado
        procesos={procesos}
        onSelect={(selected) => {
          if (typeof selected === 'string') {
            consultarExterno(selected)
          } else {
            onSelect(selected)
          }
        }}
      />

      {errorApi && <p className="text-[13px] font-medium text-[#C5202E]">{errorApi}</p>}

      {cargandoApi && (
        <div className="flex items-center gap-2 text-sm text-white/50">
          <Loader2 className="animate-spin" size={16} /> Consultando con IA (Modulo E)...
        </div>
      )}

      {summary && !cargandoApi && (
        <div className="grid gap-6 xl:grid-cols-[1fr_0.98fr]">
          <div className="rounded-[30px] border border-[#2A2A2A] bg-[#121212] p-7">
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <h3 className="font-sora text-[2rem] font-bold text-white">
                Resumen en lenguaje natural
              </h3>
              {urgencyBadge && (
                <span
                  className="rounded-full px-4 py-1.5 text-[0.95rem] font-semibold text-white"
                  style={{ backgroundColor: urgencyBadge.color }}
                >
                  {urgencyBadge.label}
                </span>
              )}
            </div>

            <div className="space-y-0">
              <SummaryRow icon={FileText} title="Que paso?">
                {summary.quePaso}
              </SummaryRow>
              <SummaryRow icon={CalendarDays} title="Que va a pasar?">
                {summary.queVaPasar}
              </SummaryRow>
              <SummaryRow icon={CheckCircle2} title="Que debo hacer?">
                {summary.queHacer}
              </SummaryRow>
            </div>
          </div>

          <div className="rounded-[30px] border border-[#2A2A2A] bg-[#121212] p-7">
            <h3 className="font-sora text-[2rem] font-bold text-white">Ultima actualizacion</h3>

            <div className="mt-6">
              <MetaRow
                icon={FileText}
                label="Numero de radicado"
                value={processData ? formatRadicado(processData.radicado) : 'Sin dato'}
              />
              <MetaRow icon={Scale} label="Etapa procesal" value={processState} />
              <MetaRow icon={CheckCircle2} label="Estado" value="En seguimiento" />
              <MetaRow
                icon={Clock3}
                label="Fecha de actualizacion"
                value={
                  lastUpdateDate
                    ? new Date(lastUpdateDate).toLocaleString('es-CO')
                    : 'Sin registro reciente'
                }
              />
            </div>
          </div>
        </div>
      )}

      <div className="rounded-[30px] border border-[#2A2A2A] bg-[#121212] p-6">
        <div className="flex items-center gap-3">
          <Clock3 size={20} className="text-white/60" />
          <h3 className="font-sora text-[1.6rem] font-bold text-white">Tareas pendientes</h3>
        </div>
        <p className="mt-2 text-[0.98rem] text-white/45">
          Solo ves tareas asignadas directamente a tu usuario.
        </p>

        {taskMessage && <p className="mt-4 text-sm font-semibold text-[#E9D9C7]">{taskMessage}</p>}

        <div className="mt-5 space-y-4">
          {loadingTasks ? (
            <p className="inline-flex items-center gap-2 text-sm text-white/45">
              <LoaderCircle size={15} className="animate-spin" /> Cargando tareas...
            </p>
          ) : tasks.length > 0 ? (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onUpdate={handleTaskUpdate}
                busyTaskId={busyTaskId}
              />
            ))
          ) : (
            <p className="text-sm text-white/45">No tienes tareas activas en este momento.</p>
          )}
        </div>
      </div>
    </div>
  )
}
