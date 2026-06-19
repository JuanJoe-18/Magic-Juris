import { formatRadicado } from '../../lib/ui'
import { resumenNatural } from './clienteUtil'
import ClienteRadicado from './ClienteRadicado'

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
  const r = resumenNatural(proceso)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-sora text-2xl font-bold text-white md:text-3xl">
          Consultar caso admitido
        </h1>
        <p className="mt-1 text-sm text-white/45">
          Consulta por número de radicado y recibe un resumen claro, sin lenguaje
          técnico.
        </p>
      </div>

      <ClienteRadicado procesos={procesos} onSelect={onSelect} />

      {r && (
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
            {proceso && (
              <span className="ml-auto hidden font-mono text-[11px] text-white/30 sm:block">
                {formatRadicado(proceso.radicado)}
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
