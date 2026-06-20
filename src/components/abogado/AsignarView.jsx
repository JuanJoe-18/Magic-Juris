import { useEffect, useState } from 'react'
import { AlertCircle, Check, Mail, Send } from 'lucide-react'
import RadicadoSearch from './RadicadoSearch'
import CasoPill from './CasoPill'
import { taskService } from '../../services/taskService'

const initialForm = {
  title: '',
  description: '',
  priority: 'MEDIA',
  due_date: '',
}

function TaskRow({ task }) {
  return (
    <div className="rounded-2xl border border-[#2A2A2A] bg-[#161616] px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-white">{task.title}</p>
        <span className="rounded-full bg-[#202020] px-3 py-1 text-[11px] font-semibold text-white/75">
          {task.priority} · {task.status}
        </span>
      </div>
      <p className="mt-2 text-sm text-white/60">{task.description}</p>
      <p className="mt-2 text-[12px] text-white/40">
        Fecha limite: {task.due_date || 'Sin fecha limite definida'}
      </p>
    </div>
  )
}

export default function AsignarView({ procesos, proceso, onSelect }) {
  const [form, setForm] = useState(initialForm)
  const [statusMessage, setStatusMessage] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [tasks, setTasks] = useState([])
  const [preview, setPreview] = useState(null)

  useEffect(() => {
    const loadTasks = async () => {
      if (typeof proceso?.id !== 'number') {
        setTasks([])
        return
      }
      try {
        const data = await taskService.getTasksByProcess(proceso.id)
        setTasks(data)
      } catch (err) {
        console.warn('No fue posible cargar tareas del proceso.', err)
      }
    }
    loadTasks()
  }, [proceso?.id])

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!proceso?.radicado) {
      setError('Primero selecciona un proceso por radicado.')
      return
    }

    setSubmitting(true)
    setError('')
    setStatusMessage('')

    try {
      const response = await taskService.createTask({
        radicado: proceso.radicado,
        ...form,
        due_date: form.due_date || null,
      })

      setTasks((current) => [response.task, ...current])
      setPreview({
        subject: response.email_subject,
        body: response.email_preview,
        channel: response.communication_channel,
      })
      setForm(initialForm)
      setStatusMessage('Tarea asignada y comunicacion generada correctamente.')
    } catch (err) {
      setError(err.message || 'No fue posible asignar la tarea.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!proceso) {
    return (
      <div className="space-y-5">
        <h1 className="font-sora text-2xl font-bold text-white md:text-3xl">
          Asignar tarea al cliente
        </h1>
        <RadicadoSearch
          procesos={procesos}
          onSelect={onSelect}
          placeholder="Ingrese el numero de radicado"
          boton="Buscar caso"
          label="Radicado"
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sora text-2xl font-bold text-white md:text-3xl">
          Asignar tarea al cliente
        </h1>
        <p className="mt-1 text-sm text-white/45">
          Crea una tarea sobre el proceso seleccionado y deja trazabilidad en historial,
          alertas y auditoria.
        </p>
      </div>

      <RadicadoSearch
        procesos={procesos}
        onSelect={onSelect}
        placeholder="Ingrese el numero de radicado"
        boton="Cambiar proceso"
        label="Radicado"
      />

      <CasoPill proceso={proceso} />

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <form
          onSubmit={handleSubmit}
          className="rounded-[22px] border border-[#262626] bg-[#141414] p-5"
        >
          <h2 className="font-sora text-xl font-bold text-white">
            Formulario de asignacion
          </h2>
          <div className="mt-4 grid gap-4">
            <input
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Titulo de la tarea"
              className="rounded-2xl border border-[#2C2C2C] bg-[#1A1A1A] px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-[#84120C] focus:outline-none"
              required
            />
            <textarea
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={5}
              placeholder="Descripcion clara para el cliente"
              className="resize-none rounded-2xl border border-[#2C2C2C] bg-[#1A1A1A] px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-[#84120C] focus:outline-none"
              required
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <select
                value={form.priority}
                onChange={(e) => handleChange('priority', e.target.value)}
                className="rounded-2xl border border-[#2C2C2C] bg-[#1A1A1A] px-4 py-3 text-sm text-white focus:border-[#84120C] focus:outline-none"
              >
                <option value="ALTA">ALTA</option>
                <option value="MEDIA">MEDIA</option>
                <option value="BAJA">BAJA</option>
              </select>
              <input
                type="date"
                value={form.due_date}
                onChange={(e) => handleChange('due_date', e.target.value)}
                className="rounded-2xl border border-[#2C2C2C] bg-[#1A1A1A] px-4 py-3 text-sm text-white focus:border-[#84120C] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[#84120C] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#A30F0A] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Send size={16} /> {submitting ? 'Asignando...' : 'Asignar tarea'}
          </button>

          {statusMessage && (
            <p className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#3FA66B]">
              <Check size={16} /> {statusMessage}
            </p>
          )}
          {error && (
            <p className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#E67E80]">
              <AlertCircle size={16} /> {error}
            </p>
          )}
        </form>

        <div className="space-y-5">
          <div className="rounded-[22px] border border-[#262626] bg-[#141414] p-5">
            <div className="mb-4 flex items-center gap-2">
              <Mail size={16} className="text-white/65" />
              <h2 className="font-sora text-xl font-bold text-white">
                Preview del email generado
              </h2>
            </div>
            {preview ? (
              <div className="rounded-2xl bg-[#F3E8E1] p-5 text-[#1E1E1E]">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#84120C]">
                  {preview.channel}
                </p>
                <p className="mt-2 font-sora text-lg font-bold">{preview.subject}</p>
                <pre className="mt-4 whitespace-pre-wrap font-sans text-sm leading-6">
                  {preview.body}
                </pre>
              </div>
            ) : (
              <p className="text-sm text-white/45">
                Al asignar la tarea veras aqui el email o stub guardado en historial.
              </p>
            )}
          </div>

          <div className="rounded-[22px] border border-[#262626] bg-[#141414] p-5">
            <h2 className="font-sora text-xl font-bold text-white">
              Tareas del proceso
            </h2>
            <div className="mt-4 space-y-3">
              {tasks.length > 0 ? (
                tasks.map((task) => <TaskRow key={task.id} task={task} />)
              ) : (
                <p className="text-sm text-white/45">
                  Este proceso todavia no tiene tareas registradas.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
