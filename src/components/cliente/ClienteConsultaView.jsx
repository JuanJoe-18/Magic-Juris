import { useEffect, useState } from 'react'
import { CheckCircle2, Clock3, Loader2, LoaderCircle } from 'lucide-react'

import { formatRadicado } from '../../lib/ui'
import { api } from '../../lib/api'
import { taskService } from '../../services/taskService'
import ClienteRadicado from './ClienteRadicado'
import { resumenNatural } from './clienteUtil'

function Pregunta({ titulo, children }) {
  return (
    <div>
      <p className="font-sora text-lg text-white/90">{titulo}</p>
      <p className="mt-1 text-[15px] leading-relaxed text-white/55">{children}</p>
    </div>
  )
}

function TaskCard({ task, onUpdate, busyTaskId }) {
  const canComplete = task.status !== 'COMPLETADA'
  const dueLabel = task.due_date || 'Sin fecha limite definida'

  return (
    <div className="rounded-2xl border border-[#262626] bg-[#161616] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-sora text-base font-bold text-white">{task.title}</p>
        <span className="rounded-full bg-[#202020] px-3 py-1 text-[11px] font-semibold text-white/75">
          {task.priority} · {task.status}
        </span>
      </div>
      <p className="mt-2 text-sm text-white/60">{task.description}</p>
      <p className="mt-2 text-[12px] text-white/40">Fecha limite: {dueLabel}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {task.status === 'PENDIENTE' && (
          <button
            onClick={() => onUpdate(task.id, 'EN_PROCESO')}
            disabled={busyTaskId === task.id}
            className="rounded-2xl border border-[#383838] px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-[#84120C] disabled:opacity-60"
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
      setErrorApi('No se pudo consultar. ¿Esta encendido el backend de IA?')
      setResultadoApi(null)
    } finally {
      setCargandoApi(false)
    }
  }

  const isApi = Boolean(resultadoApi)
  const processData = isApi ? resultadoApi?.proceso : proceso
  const summary = resumenNatural(processData)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-sora text-2xl font-bold text-white md:text-3xl">
          Consultar caso admitido
        </h1>
        <p className="mt-1 text-sm text-white/45">
          Consulta por numero de radicado y revisa las tareas que tu abogado te ha asignado.
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
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

          {errorApi && <p className="text-[12px] text-[#C5202E]">{errorApi}</p>}

          {cargandoApi && (
            <div className="flex items-center gap-2 text-sm text-white/50">
              <Loader2 className="animate-spin" size={16} /> Consultando con IA (Modulo E)...
            </div>
          )}

          {summary && !cargandoApi && (
            <div className="rounded-[22px] border border-[#262626] bg-[#101010] p-6">
              <div className="mb-5 flex items-center gap-3">
                <h3 className="font-sora text-lg font-bold text-white">
                  Resumen en lenguaje natural
                </h3>
                <span
                  className="rounded-full px-3 py-1 text-[12px] font-semibold text-white"
                  style={{ backgroundColor: summary.urgenciaColor }}
                >
                  {summary.urgenciaLabel}
                </span>
                {processData && (
                  <span className="ml-auto hidden font-mono text-[11px] text-white/30 sm:block">
                    {formatRadicado(processData.radicado)}
                  </span>
                )}
                {isApi && (
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400">
                    Resumen Real IA
                  </span>
                )}
              </div>

              <div className="space-y-5">
                <Pregunta titulo="¿Que paso?">{summary.quePaso}</Pregunta>
                <Pregunta titulo="¿Que va a pasar?">{summary.queVaPasar}</Pregunta>
                <Pregunta titulo="¿Que debo hacer?">{summary.queHacer}</Pregunta>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-[22px] border border-[#262626] bg-[#101010] p-5">
          <div className="flex items-center gap-2">
            <Clock3 size={17} className="text-white/60" />
            <h3 className="font-sora text-lg font-bold text-white">Tareas pendientes</h3>
          </div>
          <p className="mt-1 text-[13px] text-white/45">Solo ves tareas asignadas a tu usuario.</p>

          {taskMessage && <p className="mt-4 text-sm font-semibold text-[#E9D9C7]">{taskMessage}</p>}

          <div className="mt-4 space-y-3">
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
    </div>
  )
}
