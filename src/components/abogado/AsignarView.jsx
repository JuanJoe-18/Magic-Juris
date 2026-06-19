import { useState } from 'react'
import { Plus, Send, Paperclip, FileText, Check } from 'lucide-react'
import RadicadoSearch from './RadicadoSearch'
import CasoPill from './CasoPill'

// ── Vista Asignar tareas cliente: Asignar Acción al caso ──
export default function AsignarView({ procesos, proceso, onSelect }) {
  const [asignaciones, setAsignaciones] = useState([
    { texto: 'Adjuntar pruebas', icon: Paperclip },
    { texto: 'Enviar pdf', icon: FileText },
  ])
  const [req, setReq] = useState('')
  const [enviado, setEnviado] = useState(false)

  const agregar = () => {
    const t = req.trim()
    if (!t) return
    setAsignaciones((prev) => [...prev, { texto: t, icon: Plus }])
    setReq('')
    setEnviado(true)
    setTimeout(() => setEnviado(false), 2500)
  }

  // Estado vacío: pedir radicado.
  if (!proceso) {
    return (
      <div className="space-y-5">
        <h1 className="font-sora text-2xl font-bold text-white md:text-3xl">
          Asignar Accion
        </h1>
        <RadicadoSearch
          procesos={procesos}
          onSelect={onSelect}
          placeholder="Ingrese el numero de radicado: ....."
          boton="Buscar caso"
          label="Radicado"
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="font-sora text-2xl font-bold text-white md:text-3xl">
        Historial completo del caso
      </h1>

      <CasoPill proceso={proceso} />

      <div>
        <h2 className="font-sora text-xl font-bold text-white">
          Asignaciones actuales:
        </h2>
        <div className="mt-4 space-y-3">
          {asignaciones.map((a, i) => {
            const Icon = a.icon
            return (
              <div
                key={i}
                className="flex items-center gap-2 text-lg font-semibold text-[#C79B2B]"
              >
                <Icon size={18} />
                <span>+{a.texto}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Campo de requerimiento */}
      <div className="rounded-[22px] border border-[#262626] bg-[#141414] p-5">
        <label className="block text-sm font-semibold text-white">
          Ingrese un requerimiento para su cliente (Documentacion, Reunion, Etc).
        </label>
        <p className="mt-1 text-[12px] text-white/40">
          (Se enviará un correo electronico con los detalles al correo personal de
          este.)
        </p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <textarea
            value={req}
            onChange={(e) => setReq(e.target.value)}
            rows={2}
            placeholder="Ej.: Adjuntar copia de la cédula y comprobante de pago antes del 22/06."
            className="flex-1 resize-none rounded-2xl border border-[#2C2C2C] bg-[#1A1A1A] px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-[#84120C] focus:outline-none"
          />
          <button
            onClick={agregar}
            className="inline-flex shrink-0 items-center justify-center gap-2 self-end rounded-2xl bg-[#84120C] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#A30F0A]"
          >
            <Send size={16} /> Asignar
          </button>
        </div>
        {enviado && (
          <p className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#3FA66B]">
            <Check size={15} /> Requerimiento asignado y notificado al cliente.
          </p>
        )}
      </div>
    </div>
  )
}
