import { useMemo, useState } from 'react'
import { ArrowRight, Search } from 'lucide-react'
import { formatFecha, formatRadicado } from '../../lib/ui'

// Construye un historial de correos sintético a partir del proceso.
function construirCorreos(proceso) {
  if (!proceso) return []
  const tl = [...(proceso.lineaTiempo ?? [])].sort(
    (a, b) => new Date(b.fecha) - new Date(a.fecha)
  )
  const ultima = tl[0]
  const previa = tl[1]
  return [
    {
      id: 'AI-SUM-00042',
      asunto: `Resumen IA · ${ultima?.titulo ?? 'Actualización'}`,
      email: 'cliente@correo.com',
      fecha: ultima ? formatFecha(ultima.fecha) : '',
      estado: 'Entregado',
      resumen: proceso.resumenCliente,
      destacado: true,
    },
    {
      id: 'AI-SUM-00038',
      asunto: 'Resumen semanal de actuaciones',
      email: 'cliente@correo.com',
      fecha: previa ? formatFecha(previa.fecha) : '',
      estado: 'Entregado',
      resumen:
        previa?.descripcion ??
        'Resumen consolidado de las actuaciones de la semana en lenguaje claro.',
    },
    {
      id: 'AI-SUM-00031',
      asunto: 'Alerta de actuación relevante',
      email: 'cliente@correo.com',
      fecha: tl[2] ? formatFecha(tl[2].fecha) : '',
      estado: 'Guardado en BD',
      resumen:
        tl[2]?.descripcion ??
        'Notificación de una actuación relevante registrada en el expediente.',
    },
  ]
}

const estadoBadge = {
  Entregado: 'bg-[#84120C] text-white',
  'Guardado en BD': 'bg-[#7a2a2f]/60 text-white/80',
}

// ── Vista: Historial de correos e historial de resúmenes IA ──
export default function CorreosView({ proceso }) {
  const correos = useMemo(() => construirCorreos(proceso), [proceso])
  const [sel, setSel] = useState(0)
  const activo = correos[sel]

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-sora text-2xl font-bold text-white md:text-3xl">
          Historial de correos
        </h1>
        <p className="mt-1 text-sm text-white/45">
          El cliente recibe por correo el resumen de IA previamente guardado en la
          base de datos.
        </p>
      </div>

      {/* Buscador */}
      <div className="rounded-[22px] border border-[#262626] bg-[#101010] p-5">
        <p className="mb-2 text-[12px] font-medium text-white/55">
          Buscar por radicado, correo o ID resumen
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex flex-1 items-center gap-2 rounded-2xl border border-[#2C2C2C] bg-[#1A1A1A] px-4 py-3">
            <Search size={16} className="shrink-0 text-white/35" />
            <input
              placeholder="AI-SUM-00042 / cliente@correo.com"
              className="w-full bg-transparent text-sm text-white placeholder:text-white/35 focus:outline-none"
            />
          </div>
          <button className="shrink-0 rounded-2xl bg-[#84120C] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#A30F0A]">
            Filtrar
          </button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Correos enviados */}
        <div className="rounded-[22px] border border-[#262626] bg-[#101010] p-5">
          <h3 className="mb-4 font-sora text-lg font-bold text-white">
            Correos enviados
          </h3>
          <div className="space-y-3">
            {correos.map((c, i) => (
              <button
                key={c.id}
                onClick={() => setSel(i)}
                className={`flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition-colors
                  ${
                    i === sel
                      ? 'border-[#C5202E]/60 bg-[#161616]'
                      : 'border-[#2A2A2A] bg-[#161616] hover:border-[#383838]'
                  }`}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">
                    {c.asunto}
                  </p>
                  <p className="mt-0.5 text-[12px] text-white/45">
                    {c.email} · Enviado {c.fecha}
                  </p>
                  <span
                    className={`mt-2 inline-block rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                      estadoBadge[c.estado] ?? 'bg-[#202020] text-white/70'
                    }`}
                  >
                    {c.estado}
                  </span>
                </div>
                <ArrowRight
                  size={18}
                  className={i === sel ? 'text-[#C5202E]' : 'text-white/40'}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Preview del correo */}
        <div className="rounded-[22px] border border-[#262626] bg-[#101010] p-5">
          <h3 className="mb-4 font-sora text-lg font-bold text-white">
            Preview del correo
          </h3>
          {activo ? (
            <div className="rounded-2xl bg-white p-6 text-[#1a1a1a] shadow-xl">
              <p className="font-sora text-lg font-bold">
                Actualización de su proceso
              </p>
              <p className="mt-3 text-sm font-bold text-[#84120C]">
                Radicado {proceso ? formatRadicado(proceso.radicado) : ''}
              </p>
              <p className="mt-3 font-semibold">Resumen IA</p>
              <p className="mt-1 text-sm leading-relaxed text-[#333]">
                {activo.resumen}
              </p>
            </div>
          ) : (
            <p className="text-sm text-white/40">Sin correos para previsualizar.</p>
          )}
        </div>
      </div>
    </div>
  )
}
