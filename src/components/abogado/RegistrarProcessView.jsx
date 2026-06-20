import { useEffect, useState } from 'react'
import { PlusCircle } from 'lucide-react'

import { processService } from '../../services/processService'
import { userService } from '../../services/userService'

const jurisdicciones = [
  { value: 'civil', label: 'Civil' },
  { value: 'laboral', label: 'Laboral' },
  { value: 'administrativo', label: 'Administrativo' },
]

const participaciones = [
  { value: 'DEMANDANTE', label: 'Demandante' },
  { value: 'DEMANDADO', label: 'Demandado' },
]

const etapas = ['Apertura', 'Admitida', 'Notificacion', 'Contestacion', 'Pruebas', 'Sentencia']
const estados = ['E1', 'E2', 'E3', 'E4']

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-3 block text-[1rem] text-white/72">{label}</label>
      {children}
    </div>
  )
}

function inputClass() {
  return 'w-full rounded-2xl border border-[#333333] bg-[#141414] px-5 py-4 text-[1rem] text-white placeholder:text-white/35 focus:border-[#84120C] focus:outline-none'
}

export default function RegistrarProcessView() {
  const [radicado, setRadicado] = useState('')
  const [jurisdiccion, setJurisdiccion] = useState('civil')
  const [tipoParticipacion, setTipoParticipacion] = useState('DEMANDANTE')
  const [clienteId, setClienteId] = useState('')
  const [abogadoId, setAbogadoId] = useState('')
  const [etapa, setEtapa] = useState('Apertura')
  const [estado, setEstado] = useState('E1')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [clientes, setClientes] = useState([])
  const [abogados, setAbogados] = useState([])

  useEffect(() => {
    userService
      .getUsers()
      .then((users) => {
        if (Array.isArray(users)) {
          setClientes(users.filter((user) => user.role === 'CLIENTE'))
          setAbogados(users.filter((user) => user.role === 'ABOGADO'))
        }
      })
      .catch((err) => console.error(err))
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError(null)
    setSuccess(false)

    if (radicado.length !== 23 || !/^\d+$/.test(radicado)) {
      setError('El radicado debe tener exactamente 23 digitos numericos.')
      return
    }

    try {
      await processService.createProcess({
        radicado,
        jurisdiccion,
        tipo_participacion: tipoParticipacion,
        cliente_id: Number.parseInt(clienteId, 10),
        abogado_id: Number.parseInt(abogadoId, 10),
        etapa,
        estado,
      })

      setSuccess(true)
      setRadicado('')
      setClienteId('')
      setAbogadoId('')
      setEtapa('Apertura')
      setEstado('E1')
    } catch (err) {
      setError('Error al registrar proceso. Puede que el radicado ya exista.')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sora text-[3rem] font-bold leading-none text-white">
          Registrar Proceso Judicial
        </h1>
        <p className="mt-4 text-[1.1rem] text-white/60">
          Ingresa los datos para registrar un nuevo proceso en el sistema.
        </p>
      </div>

      <div className="rounded-[30px] border border-[#2A2A2A] bg-[#121212] p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Field label="Radicado (23 digitos)">
            <input
              type="text"
              maxLength={23}
              value={radicado}
              onChange={(e) => setRadicado(e.target.value)}
              className={inputClass()}
              required
            />
          </Field>

          <div className="grid gap-6 xl:grid-cols-2">
            <Field label="Jurisdiccion">
              <select
                value={jurisdiccion}
                onChange={(e) => setJurisdiccion(e.target.value)}
                className={inputClass()}
              >
                {jurisdicciones.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Tipo de Participacion">
              <select
                value={tipoParticipacion}
                onChange={(e) => setTipoParticipacion(e.target.value)}
                className={inputClass()}
              >
                {participaciones.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Cliente">
              <select
                value={clienteId}
                onChange={(e) => setClienteId(e.target.value)}
                className={inputClass()}
                required
              >
                <option value="">Seleccione un cliente...</option>
                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.name} ({cliente.email})
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Abogado">
              <select
                value={abogadoId}
                onChange={(e) => setAbogadoId(e.target.value)}
                className={inputClass()}
                required
              >
                <option value="">Seleccione un abogado...</option>
                {abogados.map((abogado) => (
                  <option key={abogado.id} value={abogado.id}>
                    {abogado.name} ({abogado.email})
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Etapa Inicial">
              <select value={etapa} onChange={(e) => setEtapa(e.target.value)} className={inputClass()}>
                {etapas.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Estado">
              <select value={estado} onChange={(e) => setEstado(e.target.value)} className={inputClass()}>
                {estados.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {error && <p className="text-sm font-semibold text-[#E7A9A3]">{error}</p>}
          {success && (
            <p className="text-sm font-semibold text-[#CFEBC5]">Proceso registrado correctamente.</p>
          )}

          <div className="flex justify-center pt-2">
            <button
              type="submit"
              className="inline-flex min-w-[290px] items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#7E120D] to-[#B3160E] px-8 py-4 text-[1.05rem] font-semibold text-white transition-all hover:brightness-110"
            >
              <PlusCircle size={20} /> Registrar Proceso
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
