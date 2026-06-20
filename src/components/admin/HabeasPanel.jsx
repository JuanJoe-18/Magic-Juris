import { useEffect, useState } from 'react'
import {
  ShieldCheck,
  FileSearch,
  Check,
  Loader2,
  UserRound,
} from 'lucide-react'

// Llamadas directas al backend de IA (Node, vía proxy /api).
async function jget(url) {
  const r = await fetch(url)
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  return r.json()
}
async function jsend(url, method, body) {
  const r = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!r.ok) {
    const e = await r.json().catch(() => ({}))
    throw new Error(e.error || `HTTP ${r.status}`)
  }
  return r.json()
}

const TIPOS = [
  { id: 'acceso', label: 'Acceso' },
  { id: 'rectificacion', label: 'Rectificación' },
  { id: 'supresion', label: 'Supresión' },
]

const estadoColor = {
  pendiente: '#C79B2B',
  resuelta: '#3FA66B',
}

// ── Panel Habeas Data (Ley 1581) — Módulo H · RF-35/36/38 ──
export default function HabeasPanel() {
  const [solicitudes, setSolicitudes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [email, setEmail] = useState('')
  const [tipo, setTipo] = useState('acceso')
  const [enviando, setEnviando] = useState(false)
  const [aviso, setAviso] = useState(null)
  const [busyId, setBusyId] = useState(null)

  const [radicado, setRadicado] = useState('')
  const [tratamiento, setTratamiento] = useState(null)
  const [errorTrat, setErrorTrat] = useState(null)

  const cargar = async () => {
    setCargando(true)
    try {
      setSolicitudes(await jget('/api/habeas/solicitudes'))
    } catch {
      setSolicitudes([])
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  const crear = async () => {
    if (!email.trim()) {
      setAviso('Ingresa el correo del titular.')
      return
    }
    setEnviando(true)
    setAviso(null)
    try {
      await jsend('/api/habeas/solicitudes', 'POST', { titularEmail: email.trim(), tipo })
      setEmail('')
      setAviso('Solicitud registrada.')
      await cargar()
    } catch (e) {
      setAviso(e.message || 'No se pudo registrar.')
    } finally {
      setEnviando(false)
    }
  }

  const resolver = async (id) => {
    setBusyId(id)
    try {
      await jsend(`/api/habeas/solicitudes/${id}/resolver`, 'PATCH')
      await cargar()
    } catch {
      /* noop */
    } finally {
      setBusyId(null)
    }
  }

  const consultarTratamiento = async () => {
    const limpio = radicado.replace(/\D/g, '')
    setErrorTrat(null)
    setTratamiento(null)
    if (limpio.length !== 23) {
      setErrorTrat('El radicado debe tener 23 dígitos.')
      return
    }
    try {
      const d = await jget(`/api/habeas/proceso/${limpio}`)
      setTratamiento(d.tratamiento || { vacio: true })
    } catch (e) {
      setErrorTrat(e.message || 'No se pudo consultar.')
    }
  }

  const guardarTratamiento = async () => {
    const limpio = radicado.replace(/\D/g, '')
    try {
      setEnviando(true)
      const d = await jsend(`/api/habeas/proceso/${limpio}`, 'POST', {
        finalidad: tratamiento.finalidad || '',
        baseLegitimacion: tratamiento.baseLegitimacion || 'poder',
      })
      setTratamiento(d.tratamiento)
      setAviso('Tratamiento de datos registrado.')
    } catch (e) {
      setErrorTrat(e.message || 'Error guardando.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="flex items-center gap-2 font-sora text-3xl font-bold text-white">
          <ShieldCheck size={26} className="text-[#3FA66B]" /> Habeas Data
        </h1>
        <p className="mt-1 text-sm text-white/45">
          Atención de derechos ARCO y registro de la base legal del tratamiento (Ley 1581 de 2012).
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_minmax(320px,400px)]">
        {/* Solicitudes ARCO (RF-36) */}
        <div className="rounded-[22px] border border-[#262626] bg-[#141414] p-5">
          <h3 className="font-sora text-xl font-bold text-white">
            Solicitudes de derechos (ARCO)
          </h3>
          <p className="mb-4 mt-1 text-[13px] text-white/45">
            Acceso, rectificación y supresión de datos de los titulares (RF-36).
          </p>

          {/* Formulario */}
          <div className="flex flex-col gap-3 rounded-2xl border border-[#262626] bg-[#101010] p-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="mb-1 block text-[12px] text-white/55">Correo del titular</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="titular@correo.com"
                className="w-full rounded-xl border border-[#2C2C2C] bg-[#1A1A1A] px-3 py-2 text-sm text-white placeholder:text-white/35 focus:border-[#84120C] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-[12px] text-white/55">Tipo</label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="rounded-xl border border-[#2C2C2C] bg-[#1A1A1A] px-3 py-2 text-sm text-white focus:border-[#84120C] focus:outline-none"
              >
                {TIPOS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={crear}
              disabled={enviando}
              className="rounded-xl bg-[#84120C] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#A30F0A] disabled:opacity-60"
            >
              {enviando ? 'Registrando…' : 'Registrar'}
            </button>
          </div>
          {aviso && <p className="mt-2 text-[12px] text-white/55">{aviso}</p>}

          {/* Listado */}
          <div className="mt-4 space-y-2">
            {cargando ? (
              <div className="flex items-center gap-2 py-6 text-sm text-white/45">
                <Loader2 className="animate-spin" size={16} /> Cargando solicitudes…
              </div>
            ) : solicitudes.length === 0 ? (
              <p className="py-6 text-sm text-white/40">Aún no hay solicitudes registradas.</p>
            ) : (
              solicitudes.map((s) => (
                <div
                  key={s.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#262626] bg-[#161616] px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#202020]">
                      <UserRound size={15} className="text-white/60" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {s.titular?.nombre || s.titular?.email}
                      </p>
                      <p className="text-[12px] capitalize text-white/45">
                        {s.tipo} · {new Date(s.creadoEn).toLocaleDateString('es-CO')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize text-white"
                      style={{ backgroundColor: estadoColor[s.estado] || '#3A3A3A' }}
                    >
                      {s.estado}
                    </span>
                    {s.estado !== 'resuelta' && (
                      <button
                        onClick={() => resolver(s.id)}
                        disabled={busyId === s.id}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#2A2A2A] bg-[#1C1C1C] px-3 py-1.5 text-[12px] font-semibold text-white/80 transition-colors hover:text-white disabled:opacity-60"
                      >
                        <Check size={13} /> Resolver
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Finalidad / base de legitimación (RF-35/38) */}
        <div className="rounded-[22px] border border-[#262626] bg-[#141414] p-5">
          <h3 className="flex items-center gap-2 font-sora text-xl font-bold text-white">
            <FileSearch size={18} /> Base legal por proceso
          </h3>
          <p className="mb-4 mt-1 text-[13px] text-white/45">
            Finalidad declarada y base de legitimación (RF-35 / RF-38).
          </p>

          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={radicado}
              onChange={(e) => setRadicado(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && consultarTratamiento()}
              placeholder="Radicado (23 dígitos)"
              className="flex-1 rounded-xl border border-[#2C2C2C] bg-[#1A1A1A] px-3 py-2 text-sm text-white placeholder:text-white/35 focus:border-[#84120C] focus:outline-none"
            />
            <button
              onClick={consultarTratamiento}
              className="rounded-xl bg-[#84120C] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#A30F0A]"
            >
              Consultar
            </button>
          </div>
          {errorTrat && <p className="mt-2 text-[12px] text-[#C5202E]">{errorTrat}</p>}

          {tratamiento && (
            <div className="mt-4 space-y-4 rounded-2xl border border-[#262626] bg-[#101010] p-4">
              {tratamiento.vacio && (
                <p className="text-sm text-[#C79B2B] mb-2 font-semibold">
                  Este proceso no tiene base de legitimación. Por favor regístrela.
                </p>
              )}
              
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] uppercase tracking-wide text-white/40 block mb-1">Finalidad</label>
                  <input 
                    className="w-full rounded-xl border border-[#2C2C2C] bg-[#1A1A1A] px-3 py-2 text-sm text-white focus:border-[#84120C] focus:outline-none"
                    placeholder="Ej: Seguimiento judicial, reportes al cliente..."
                    value={tratamiento.finalidad || ''}
                    onChange={(e) => setTratamiento({...tratamiento, finalidad: e.target.value, vacio: false})}
                  />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wide text-white/40 block mb-1">Base de legitimación</label>
                  <select 
                    className="w-full rounded-xl border border-[#2C2C2C] bg-[#1A1A1A] px-3 py-2 text-sm text-white focus:border-[#84120C] focus:outline-none"
                    value={tratamiento.baseLegitimacion || 'poder'}
                    onChange={(e) => setTratamiento({...tratamiento, baseLegitimacion: e.target.value, vacio: false})}
                  >
                    <option value="poder">Poder Judicial</option>
                    <option value="consentimiento">Consentimiento Expreso</option>
                    <option value="contrato">Ejecución de Contrato</option>
                  </select>
                </div>
                
                <button
                  onClick={guardarTratamiento}
                  disabled={enviando}
                  className="w-full rounded-xl bg-[#161616] border border-[#2A2A2A] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#202020] disabled:opacity-60"
                >
                  {enviando ? 'Guardando...' : 'Guardar Base Legal'}
                </button>
              </div>
            </div>
          )}

          <p className="mt-4 text-[11px] leading-relaxed text-white/35">
            Minimización (RF-37): solo se almacenan metadatos del proceso; los datos de
            terceros se anonimizan antes de enviarse a la IA (RF-25).
          </p>
        </div>
      </div>
    </div>
  )
}
