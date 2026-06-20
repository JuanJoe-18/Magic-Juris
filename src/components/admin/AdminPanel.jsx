import { Circle, Shield, AlertCircle, Search } from 'lucide-react'
import { clase } from '../abogado/abogadoUi'
import { EstadoBars, ParticipacionDonut, ActividadLine } from './charts'

// Radicado corto estilo panel: 76001-2024-12300
function radicadoCorto(r) {
  if (!r || r.length < 23) return r
  return `${r.slice(0, 5)}-${r.slice(15, 19)}-${r.slice(18, 23)}`
}

// Abrevia el nombre del abogado: "Dra. Valentina Hurtado" → "V. Hurtado"
function abrevAbogado(nombre = '') {
  const limpio = nombre.replace(/^(Dra?\.|Dr\.|Ab\.)\s*/i, '').trim()
  const partes = limpio.split(/\s+/)
  if (partes.length < 2) return limpio
  return `${partes[0][0]}. ${partes[partes.length - 1]}`
}

// ── Tarjeta de métrica ──
function StatCard({ titulo, valor, nota, children }) {
  return (
    <div className="rounded-[22px] border border-[#262626] bg-[#141414] p-5">
      <div className="flex items-start justify-between">
        <p className="text-[13px] font-medium text-white/55">{titulo}</p>
        {children}
      </div>
      <p className="mt-2 font-sora text-4xl font-bold text-white">{valor}</p>
      <p className="mt-1 text-[12px] text-white/40">{nota}</p>
    </div>
  )
}

// ── Tabla de casos ──
export function CasosTabla({ procesos, titulo, subtitulo, limite }) {
  const filas = limite ? procesos.slice(0, limite) : procesos
  return (
    <div className="rounded-[22px] border border-[#262626] bg-[#141414] p-5">
      <h3 className="font-sora text-xl font-bold text-white">{titulo}</h3>
      {subtitulo && <p className="mt-1 text-[13px] text-white/45">{subtitulo}</p>}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead>
            <tr className="border-b border-[#2A2A2A] text-[12px] uppercase tracking-wide text-white/40">
              <th className="py-2 pr-4 font-semibold">Radicado</th>
              <th className="py-2 pr-4 font-semibold">Tipo</th>
              <th className="py-2 pr-4 font-semibold">Etapa</th>
              <th className="py-2 pr-4 font-semibold">Abogado</th>
              <th className="py-2 font-semibold">Alerta</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((p, i) => (
              <tr key={p.id} className="border-b border-[#1E1E1E] last:border-0">
                <td className="py-3 pr-4 font-mono text-white/85">
                  {radicadoCorto(p.radicado)}
                </td>
                <td className="py-3 pr-4 text-white/70">
                  {p.tipo_participacion
                    ? p.tipo_participacion[0] +
                      p.tipo_participacion.slice(1).toLowerCase()
                    : '—'}
                </td>
                <td className="py-3 pr-4 text-white/70">{p.estadoLabel}</td>
                <td className="py-3 pr-4 text-white/70">{abrevAbogado(p.abogado)}</td>
                <td className="py-3">
                  <span
                    className="inline-block h-3 w-3 rounded-full"
                    style={{ backgroundColor: clase(p.criticidad).color }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const COLORES_ETAPA = {
  Admitida: '#84120C',
  Notificación: '#A02A1E',
  Notificacion: '#A02A1E',
  Contestación: '#C79B2B',
  Contestacion: '#C79B2B',
  Pruebas: '#3E78C2',
  Sentencia: '#3FA66B',
  Registrado: '#6B7280',
}

// ── Panel principal del Administrador (calcula todo desde datos reales) ──
export default function AdminPanel({ procesos = [] }) {
  const norm = (s) => (s || '').toString().toLowerCase()
  const total = procesos.length
  const demandantes = procesos.filter((p) =>
    norm(p.tipo_participacion).includes('demandante')
  ).length
  const demandados = procesos.filter((p) =>
    norm(p.tipo_participacion).includes('demandado')
  ).length
  const requieren = procesos.filter((p) =>
    ['Admitida', 'Sentencia'].includes(p.estadoLabel)
  ).length
  const pct = (n) => (total ? Math.round((n / total) * 100) : 0)

  // Distribución por etapa (real).
  const conteoEtapa = {}
  procesos.forEach((p) => {
    const e = p.estadoLabel || 'Sin etapa'
    conteoEtapa[e] = (conteoEtapa[e] || 0) + 1
  })
  const estados = Object.entries(conteoEtapa).map(([label, value]) => ({
    label,
    value,
    color: COLORES_ETAPA[label] || '#6B7280',
  }))

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-sora text-3xl font-bold text-white md:text-4xl">
          Casos activos hasta el momento
        </h1>
        <p className="mt-1 text-sm text-white/45">
          Resumen operativo para ver cuántos procesos están activos, en qué etapa
          van y cuáles requieren seguimiento.
        </p>
      </div>

      {/* Filtros rápidos */}
      <div className="rounded-[22px] border border-[#262626] bg-[#141414] p-4">
        <p className="mb-3 text-[12px] font-semibold text-white/55">Filtros rápidos</p>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-xl border border-[#2C2C2C] bg-[#1A1A1A] px-3 py-2">
            <Search size={15} className="text-white/35" />
            <input
              placeholder="Buscar radicado / cliente"
              className="w-full bg-transparent text-sm text-white placeholder:text-white/35 focus:outline-none"
            />
          </div>
          {['Todos los procesos', 'Demandante', 'Demandado'].map((f) => (
            <button
              key={f}
              className="rounded-xl border border-[#2A2A2A] bg-[#161616] px-4 py-2 text-sm font-semibold text-white/80 transition-colors hover:bg-[#1C1C1C]"
            >
              {f}
            </button>
          ))}
          <button className="rounded-xl bg-[#84120C] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#A30F0A]">
            Actualizar datos
          </button>
        </div>
      </div>

      {/* Métricas (reales) */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard titulo="Casos activos" valor={String(total)} nota="en el catálogo" />
        <StatCard
          titulo="Demandantes"
          valor={String(demandantes)}
          nota={`${pct(demandantes)}% de la cartera`}
        >
          <Circle size={26} className="fill-[#84120C] text-[#84120C]" />
        </StatCard>
        <StatCard
          titulo="Demandados"
          valor={String(demandados)}
          nota={`${pct(demandados)}% de la cartera`}
        >
          <Shield size={26} className="text-white/80" />
        </StatCard>
        <StatCard
          titulo="Requieren atención"
          valor={String(requieren)}
          nota="Etapas con seguimiento prioritario"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#84120C]">
            <AlertCircle size={15} className="text-white" />
          </span>
        </StatCard>
      </div>

      {/* Estado + Participación */}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-[22px] border border-[#262626] bg-[#141414] p-5">
          <h3 className="font-sora text-xl font-bold text-white">
            Estado de los procesos
          </h3>
          <p className="mt-1 mb-4 text-[13px] text-white/45">
            Distribución aproximada por etapa procesal.
          </p>
          <EstadoBars data={estados} />
        </div>

        <div className="rounded-[22px] border border-[#262626] bg-[#141414] p-5">
          <h3 className="font-sora text-xl font-bold text-white">
            Tipo de participación
          </h3>
          <p className="mt-1 mb-4 text-[13px] text-white/45">
            Casos donde el cliente actúa como demandante o demandado.
          </p>
          <ParticipacionDonut
            total={total}
            segmentos={[
              { label: 'Demandante', value: demandantes, color: '#84120C' },
              { label: 'Demandado', value: demandados, color: '#3A3A3A' },
            ]}
          />
        </div>
      </div>

      {/* Casos recientes + Actividad */}
      <div className="grid gap-5 lg:grid-cols-[1fr_minmax(280px,360px)]">
        <CasosTabla
          procesos={procesos}
          titulo="Casos activos recientes"
          subtitulo="Listado operativo con etapa, responsable y nivel de urgencia."
        />
        <div className="rounded-[22px] border border-[#262626] bg-[#141414] p-5">
          <h3 className="font-sora text-xl font-bold text-white">Actividad semanal</h3>
          <p className="mt-1 mb-4 text-[13px] text-white/45">
            Actuaciones detectadas por semana.
          </p>
          <ActividadLine
            valores={[8, 14, 11, 20, 28]}
            etiquetas={['S1', 'S2', 'S3', 'S4', 'S5']}
          />
        </div>
      </div>
    </div>
  )
}
