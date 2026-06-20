import { useState } from 'react'
import { ShieldCheck, FileText, Scale, Send, CheckCircle2 } from 'lucide-react'

// Llamadas directas al backend
async function jsend(url, method, body) {
  const r = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!r.ok) {
    const e = await r.json().catch(() => ({}))
    throw new Error(e.error || `HTTP ${r.status}`)
  }
  return r.json()
}

export default function ClienteHabeasView({ emailUsuario }) {
  const [tipo, setTipo] = useState('acceso')
  const [enviando, setEnviando] = useState(false)
  const [exito, setExito] = useState(false)
  const [error, setError] = useState(null)

  const enviarSolicitud = async () => {
    setEnviando(true)
    setError(null)
    setExito(false)
    try {
      await jsend('/api/habeas/solicitudes', 'POST', {
        titularEmail: emailUsuario, // usamos el correo logueado o un default si no hay
        tipo,
      })
      setExito(true)
    } catch (e) {
      setError(e.message || 'Error al enviar la solicitud.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-3 font-sora text-3xl font-bold text-white">
          <ShieldCheck size={28} className="text-[#3FA66B]" /> Privacidad y Datos
        </h1>
        <p className="mt-2 text-sm text-white/60">
          Política de Tratamiento de Datos Personales (Ley 1581 de 2012)
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
        {/* Resumen de la Política */}
        <div className="space-y-5 rounded-[22px] border border-[#262626] bg-[#141414] p-6">
          <h2 className="flex items-center gap-2 font-sora text-xl font-bold text-white">
            <Scale size={20} className="text-[#C79B2B]" /> Sus Derechos (ARCO)
          </h2>
          <div className="prose prose-invert max-w-none text-sm leading-relaxed text-white/70">
            <p>
              En cumplimiento del Régimen General de Protección de Datos Personales en Colombia (Ley Estatutaria 1581 de 2012 y el Decreto Reglamentario 1377 de 2013), el bufete Hurtado Gandini Abogados garantiza la protección de sus datos.
            </p>
            <p>
              Como titular de la información, usted tiene derecho a conocer, actualizar, rectificar y solicitar la supresión de sus datos personales. Sus datos serán recolectados con la única finalidad de:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Adelantar el seguimiento de sus procesos judiciales en la Rama Judicial.</li>
              <li>Generar reportes sobre el estado de sus litigios mediante inteligencia artificial.</li>
              <li>Notificarle sobre cambios, vencimientos o decisiones en sus procesos.</li>
            </ul>
            <p className="mt-4 rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] p-4 text-[13px] text-white/50">
              <strong className="text-white/80">Nota de confidencialidad:</strong> Antes de que cualquier documento de su caso sea procesado por nuestra Inteligencia Artificial, nuestro sistema anonimiza automáticamente los nombres y datos sensibles para proteger el secreto profesional.
            </p>
          </div>
        </div>

        {/* Formulario de Solicitud ARCO */}
        <div className="rounded-[22px] border border-[#262626] bg-[#141414] p-6">
          <h3 className="flex items-center gap-2 font-sora text-lg font-bold text-white mb-1">
            <FileText size={18} /> Solicitar trámite
          </h3>
          <p className="text-[13px] text-white/50 mb-5">
            Ejerza sus derechos directamente desde el portal.
          </p>

          <div className="space-y-4">
            <div>
              <label className="text-[12px] text-white/60 mb-1.5 block">Tipo de solicitud</label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="w-full rounded-xl border border-[#2C2C2C] bg-[#1A1A1A] px-4 py-3 text-sm text-white focus:border-[#84120C] focus:outline-none"
              >
                <option value="acceso">Acceso a mi información</option>
                <option value="rectificacion">Rectificar mis datos</option>
                <option value="supresion">Eliminar mis datos (Supresión)</option>
              </select>
            </div>

            <div className="rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] p-3">
              <p className="text-[11px] text-white/40 mb-1">Se enviará la solicitud a nombre de:</p>
              <p className="text-sm font-semibold text-white truncate">{emailUsuario || 'usuario@correo.com'}</p>
            </div>

            {exito ? (
              <div className="flex flex-col items-center justify-center rounded-xl bg-[#3FA66B]/10 p-5 border border-[#3FA66B]/30 text-center">
                <CheckCircle2 size={28} className="text-[#3FA66B] mb-2" />
                <p className="text-sm font-bold text-white">¡Solicitud recibida!</p>
                <p className="text-[12px] text-white/60 mt-1">El área legal revisará su solicitud en breve.</p>
              </div>
            ) : (
              <button
                onClick={enviarSolicitud}
                disabled={enviando || !emailUsuario}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#84120C] px-5 py-3.5 text-sm font-bold text-white transition-colors hover:bg-[#A30F0A] disabled:opacity-60"
              >
                {enviando ? 'Procesando...' : <><Send size={16} /> Enviar al bufete</>}
              </button>
            )}

            {error && <p className="text-center text-[12px] text-[#C5202E] font-medium">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
