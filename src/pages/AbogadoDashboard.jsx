import { useMemo, useState } from 'react'
import { Search, SlidersHorizontal, FolderKanban } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import AlertsBanner from '../components/AlertsBanner'
import ProcessCard from '../components/ProcessCard'
import ProcessDetail from '../components/ProcessDetail'
import { criticidadPeso } from '../lib/ui'
import mockData from '../data/mockData.json'

// ── Página principal del rol Abogado ──
// Ensambla: Sidebar + AlertsBanner + grid de ProcessCards + ProcessDetail.
export default function AbogadoDashboard({ onHome }) {
  const { procesos, abogadoActivo } = mockData
  const [seleccionado, setSeleccionado] = useState(null)
  const [query, setQuery] = useState('')
  const [filtroCrit, setFiltroCrit] = useState('Todas')

  const alertasCriticas = useMemo(
    () => procesos.filter((p) => p.criticidad === 'Critica').length,
    [procesos]
  )

  // Procesos filtrados + ordenados por criticidad (Crítica primero).
  const procesosVisibles = useMemo(() => {
    const q = query.trim().toLowerCase()
    return procesos
      .filter((p) => {
        const matchQuery =
          !q ||
          p.cliente.toLowerCase().includes(q) ||
          p.radicado.includes(q) ||
          p.ultimaActuacion.toLowerCase().includes(q)
        const matchCrit =
          filtroCrit === 'Todas' || p.criticidad === filtroCrit
        return matchQuery && matchCrit
      })
      .sort(
        (a, b) =>
          (criticidadPeso[b.criticidad] ?? 0) -
          (criticidadPeso[a.criticidad] ?? 0)
      )
  }, [procesos, query, filtroCrit])

  const procesoSel = procesos.find((p) => p.id === seleccionado) ?? null

  const filtros = ['Todas', 'Critica', 'Importante', 'Informativa']
  const filtroLabel = { Critica: 'Críticas', Importante: 'Importantes', Informativa: 'Informativas', Todas: 'Todas' }

  return (
    <div className="min-h-screen bg-hg-bg">
      <Sidebar
        abogado={abogadoActivo}
        alertasCriticas={alertasCriticas}
        onHome={onHome}
      />

      {/* Contenido principal (offset por sidebar) */}
      <main className="ml-[72px] md:ml-[260px] min-h-screen">
        <div className="mx-auto max-w-[1400px] px-5 py-7 md:px-8">
          {/* Encabezado */}
          <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm text-white/45">Buenos días,</p>
              <h1 className="font-sora text-2xl font-bold md:text-3xl">
                {abogadoActivo.nombre}
              </h1>
              <p className="mt-1 text-sm text-white/50">
                {procesos.length} procesos activos ·{' '}
                <span className="text-hg-red font-medium">
                  {alertasCriticas} requieren atención
                </span>
              </p>
            </div>
            <span className="rounded-xl bg-white/[0.04] px-3 py-2 text-xs text-white/50 border border-white/[0.08]">
              {abogadoActivo.tarjetaProfesional}
            </span>
          </header>

          {/* Banner de alertas */}
          <AlertsBanner procesos={procesos} onSelect={setSeleccionado} />

          {/* Barra de búsqueda + filtros */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/35"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por cliente, radicado o actuación…"
                className="hg-glass w-full rounded-xl py-2.5 pl-9 pr-3 text-sm text-white
                           placeholder:text-white/35 focus:outline-none focus:ring-1 focus:ring-hg-red/50"
              />
            </div>
            <div className="flex items-center gap-1.5 rounded-xl bg-white/[0.04] p-1 border border-white/[0.08]">
              <SlidersHorizontal size={15} className="ml-1.5 text-white/35" />
              {filtros.map((f) => (
                <button
                  key={f}
                  onClick={() => setFiltroCrit(f)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    filtroCrit === f
                      ? 'bg-hg-red text-white'
                      : 'text-white/55 hover:text-white'
                  }`}
                >
                  {filtroLabel[f]}
                </button>
              ))}
            </div>
          </div>

          {/* Layout: grid de procesos + panel de detalle */}
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_minmax(380px,440px)]">
            {/* Grid de tarjetas */}
            <div>
              {procesosVisibles.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {procesosVisibles.map((p) => (
                    <ProcessCard
                      key={p.id}
                      proceso={p}
                      seleccionado={p.id === seleccionado}
                      onSelect={setSeleccionado}
                    />
                  ))}
                </div>
              ) : (
                <div className="hg-glass flex flex-col items-center justify-center rounded-2xl py-16 text-center">
                  <FolderKanban size={28} className="text-white/25" />
                  <p className="mt-3 text-sm text-white/50">
                    No hay procesos que coincidan con la búsqueda.
                  </p>
                </div>
              )}
            </div>

            {/* Panel de detalle (sticky en escritorio) */}
            <div className="lg:sticky lg:top-7 lg:h-[calc(100vh-56px)]">
              {procesoSel ? (
                <ProcessDetail
                  proceso={procesoSel}
                  onClose={() => setSeleccionado(null)}
                />
              ) : (
                <div className="hg-glass flex h-full min-h-[300px] flex-col items-center justify-center rounded-2xl p-8 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.04] border border-white/[0.08]">
                    <FolderKanban size={22} className="text-white/40" />
                  </div>
                  <p className="mt-4 font-sora font-semibold text-white/80">
                    Selecciona un proceso
                  </p>
                  <p className="mt-1 max-w-[260px] text-sm text-white/45">
                    Abre cualquier tarjeta para ver su línea de tiempo y el
                    resumen en lenguaje claro generado por IA.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
