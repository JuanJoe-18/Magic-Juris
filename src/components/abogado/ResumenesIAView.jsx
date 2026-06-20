import { useState, useEffect } from 'react'
import { Sparkles, Send, FileText, ArrowLeft } from 'lucide-react'
import RadicadoSearch from './RadicadoSearch'
import CasoPill from './CasoPill'

export default function ResumenesIAView({ procesos, proceso, onSelect }) {
  const [resumenAbogado, setResumenAbogado] = useState(null)
  const [resumenCliente, setResumenCliente] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [generando, setGenerando] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [email, setEmail] = useState('')
  const [aviso, setAviso] = useState(null)

  useEffect(() => {
    if (!proceso) return
    setCargando(true)
    fetch(`/api/procesos/${proceso.radicado}`)
      .then(res => res.json())
      .then(data => {
        setResumenAbogado(data.resumenes?.abogado || null)
        setResumenCliente(data.resumenes?.cliente || null)
      })
      .catch(err => console.error(err))
      .finally(() => setCargando(false))
  }, [proceso])

  const generarManualmente = () => {
    setGenerando(true)
    setAviso(null)
    fetch(`/api/procesos/${proceso?.radicado}/generar-resumen`, { method: 'POST' })
      .then(async (r) => {
        const d = await r.json().catch(() => ({}))
        if (!r.ok) throw new Error(d.error || `HTTP ${r.status}`)
        return d
      })
      .then(() => {
        setAviso('¡Resúmenes generados exitosamente! Recargando...')
        return fetch(`/api/procesos/${proceso.radicado}`)
      })
      .then(res => res.json())
      .then(data => {
        const ab = data.resumenes?.abogado || null
        const cl = data.resumenes?.cliente || null
        setResumenAbogado(ab)
        setResumenCliente(cl)
        if (!ab && !cl) {
          setAviso('La IA no pudo generar el resumen (¿límite de cuota?). Reinténtalo en un momento.')
        } else {
          setAviso('¡Resumen listo para enviar!')
        }
      })
      .catch((e) => setAviso(e.message))
      .finally(() => setGenerando(false))
  }

  const enviar = () => {
    if (!email.trim()) {
      setAviso('Ingresa el correo del cliente.')
      return
    }
    setEnviando(true)
    setAviso(null)
    fetch(`/api/procesos/${proceso?.radicado}/enviar-resumen`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), rol: 'cliente' }),
    })
      .then(async (r) => {
        const d = await r.json().catch(() => ({}))
        if (!r.ok) throw new Error(d.error || `HTTP ${r.status}`)
        return d
      })
      .then((d) =>
        setAviso(
          d.modo === 'smtp'
            ? `Correo enviado a ${email.trim()}.`
            : 'Resumen generado y registrado (modo stub: configura SMTP para enviar de verdad).'
        )
      )
      .catch((e) => setAviso(e.message))
      .finally(() => setEnviando(false))
  }

  if (!proceso) {
    return (
      <div className="space-y-5">
        <h1 className="font-sora text-2xl font-bold text-white md:text-3xl">
          Análisis de Inteligencia Artificial
        </h1>
        <p className="mt-1 text-sm text-white/45">
          Seleccione un proceso para acceder a los resúmenes jurídicos y al texto para el cliente.
        </p>
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
      <div className="flex items-center gap-3">
        <button
          onClick={() => onSelect(null)}
          className="rounded-full bg-[#161616] p-2 text-white/40 transition-colors hover:text-white"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="font-sora text-2xl font-bold text-white md:text-3xl">
            Resumen Inteligente
          </h1>
          <p className="mt-1 text-[13px] text-white/45">Visualización y envío del resumen generado por IA</p>
        </div>
      </div>

      <CasoPill proceso={proceso} />

      {cargando ? (
        <div className="rounded-2xl border border-dashed border-[#2A2A2A] py-12 text-center text-sm text-white/40">
          Cargando análisis de IA...
        </div>
      ) : (
        <div className="flex flex-col rounded-[22px] border border-[#262626] bg-[#101010] p-6 shadow-lg">
          <div className="mb-6 flex items-center justify-between border-b border-[#2A2A2A] pb-4">
            <div className="flex items-center gap-2">
              <Sparkles size={20} className="text-[#C79B2B]" />
              <h3 className="font-sora text-xl font-bold text-white">Resumen a enviar</h3>
            </div>
            <button
              onClick={generarManualmente}
              disabled={generando}
              className="inline-flex items-center gap-2 rounded-xl border border-[#C79B2B] bg-[#C79B2B]/10 px-4 py-2 text-[13px] font-semibold text-[#C79B2B] transition-colors hover:bg-[#C79B2B]/20 disabled:opacity-50"
            >
              <Sparkles size={14} /> {generando ? 'Generando...' : 'Generar resumen IA'}
            </button>
          </div>
          
          {resumenCliente ? (
            <div className="prose prose-invert max-w-none text-[15px] leading-relaxed text-white/80 mb-8 rounded-xl bg-[#161616] p-6 border border-[#1A1A1A]">
              {resumenCliente.split('\n').map((line, i) => <p key={i} className="mb-2 last:mb-0">{line}</p>)}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#2A2A2A] p-12 text-center mb-8">
              <FileText size={32} className="mb-3 text-white/20" />
              <p className="text-[15px] text-white/40">El resumen no ha sido generado aún.</p>
              <p className="text-[13px] text-white/30 mt-1">Haz clic en el botón superior para generarlo.</p>
            </div>
          )}

          {/* Área de envío */}
          <div className="rounded-xl border border-[#2C2C2C] bg-[#161616] p-5">
            <p className="mb-3 text-[14px] font-semibold text-white/80">Enviar al Cliente</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ingresa el correo del cliente..."
                className="flex-1 rounded-xl border border-[#3A3A3A] bg-[#0E0E0E] px-4 py-3 text-[14px] text-white placeholder:text-white/35 focus:border-[#84120C] focus:outline-none"
              />
              <button
                onClick={enviar}
                disabled={enviando || !resumenCliente}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#84120C] px-6 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-[#A30F0A] disabled:opacity-60"
              >
                <Send size={16} /> {enviando ? 'Enviando correo...' : 'Enviar ahora'}
              </button>
            </div>
            {aviso && (
              <p className="text-[13px] font-medium text-[#C79B2B] mt-3">
                {aviso}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
