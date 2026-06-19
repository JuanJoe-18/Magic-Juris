import { Mail } from 'lucide-react'
import { correosCliente } from './clienteUtil'
import ClienteRadicado from './ClienteRadicado'

// ── Vista Cliente · Historial de correos ──
export default function ClienteHistorialView({ procesos, proceso, onSelect }) {
  const correos = correosCliente(proceso)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-sora text-2xl font-bold text-white md:text-3xl">
          Historial
        </h1>
        <p className="mt-1 text-sm text-white/45">
          Consulta por número de radicado y recibe un resumen claro, sin lenguaje
          técnico.
        </p>
      </div>

      <ClienteRadicado procesos={procesos} onSelect={onSelect} />

      <div className="rounded-[22px] border border-[#262626] bg-[#101010] p-5">
        <h3 className="font-sora text-lg font-bold uppercase tracking-wide text-white">
          Historial de correos
        </h3>
        <p className="mt-1 text-[13px] text-white/45">
          Correos enviados desde la admisión del proceso.
        </p>

        {proceso ? (
          <div className="mt-4 space-y-3">
            {correos.map((c, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-2xl border border-[#262626] bg-[#161616] px-4 py-3"
              >
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#202020] text-white/60">
                  <Mail size={14} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">
                    <span className="text-white/55">{c.fecha}</span>
                    <span className="mx-2 text-white/30">·</span>
                    {c.titulo}
                  </p>
                  <p className="mt-0.5 text-[13px] text-white/55">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-6 text-[15px] text-white/40">
            Mostrar correos hasta el momento desde la admisión.
          </p>
        )}
      </div>
    </div>
  )
}
