import { useState, useEffect } from 'react'
import { formatRadicado } from '../../lib/ui'
import { resumenNatural } from './clienteUtil'
import ClienteRadicado from './ClienteRadicado'
import { api } from '../../lib/api'
import { Loader2 } from 'lucide-react'

function Pregunta({ titulo, children }) {
  return (
    <div>
      <p className="font-sora text-lg text-white/90">{titulo}</p>
      <p className="mt-1 text-[15px] leading-relaxed text-white/55">{children}</p>
    </div>
  )
}

// ── Vista Cliente · Consultar caso admitido ──
export default function ClienteConsultaView({ procesos, proceso, onSelect }) {
  const [radicadoAmano, setRadicadoAmano] = useState('')
  const [resultadoApi, setResultadoApi] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)

  // Cuando cambian el proceso desde los "pill" rápidos
  useEffect(() => {
    if (proceso) {
      setResultadoApi(null)
      setError(null)
    }
  }, [proceso])

  const consultarExterno = async (rad) => {
    const limpio = rad.replace(/\D/g, '')
    if (limpio.length !== 23) {
      setError('El número de radicado debe tener 23 dígitos.')
      return
    }
    setCargando(true)
    setError(null)
    try {
      const d = await api.consultar(limpio)
      setResultadoApi(d)
      onSelect(null) // deseleccionar el mock para mostrar el externo
    } catch (e) {
      setError('No se pudo consultar. ¿Está encendido el backend?')
      setResultadoApi(null)
    } finally {
      setCargando(false)
    }
  }

  // Decidir de dónde vienen los datos (API real o mock)
  const isApi = !!resultadoApi
  const p = isApi ? resultadoApi.proceso : proceso
  
  // Si es API, inyectamos el resumenCliente generado por Gemini al util
  if (isApi && resultadoApi.resumenes?.cliente && p) {
    p.resumenCliente = resultadoApi.resumenes.cliente
    p.criticidad = resultadoApi.actuaciones?.[0]?.criticidad || 'Informativa'
  }

  const r = resumenNatural(p)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-sora text-2xl font-bold text-white md:text-3xl">
          Consultar caso admitido
        </h1>
        <p className="mt-1 text-sm text-white/45">
          Consulta por número de radicado y recibe un resumen claro, sin lenguaje
          técnico (Módulo E).
        </p>
      </div>

      <ClienteRadicado 
        procesos={procesos} 
        onSelect={(p) => {
          if (typeof p === 'string') {
            consultarExterno(p)
          } else {
            onSelect(p)
          }
        }} 
      />

      {error && <p className="text-[12px] text-[#C5202E]">{error}</p>}
      
      {cargando && (
        <div className="flex items-center gap-2 text-sm text-white/50">
          <Loader2 className="animate-spin" size={16} /> Consultando con IA (Módulo E)...
        </div>
      )}

      {r && !cargando && (
        <div className="rounded-[22px] border border-[#262626] bg-[#101010] p-6">
          <div className="mb-5 flex items-center gap-3">
            <h3 className="font-sora text-lg font-bold text-white">
              Resumen en lenguaje natural
            </h3>
            <span
              className="rounded-full px-3 py-1 text-[12px] font-semibold text-white"
              style={{ backgroundColor: r.urgenciaColor }}
            >
              {r.urgenciaLabel}
            </span>
            {p && (
              <span className="ml-auto hidden font-mono text-[11px] text-white/30 sm:block">
                {formatRadicado(p.radicado)}
              </span>
            )}
            {isApi && (
              <span className="ml-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400">
                Resumen Real IA (Gemini)
              </span>
            )}
          </div>

          <div className="space-y-5">
            <Pregunta titulo="¿Qué pasó?">{r.quePaso}</Pregunta>
            <Pregunta titulo="¿Qué va a pasar?">{r.queVaPasar}</Pregunta>
            <Pregunta titulo="¿Qué debo hacer?">{r.queHacer}</Pregunta>
          </div>
        </div>
      )}
    </div>
  )
}
