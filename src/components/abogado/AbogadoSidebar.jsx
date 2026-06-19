import { Search, History, ClipboardList, PlusCircle } from 'lucide-react'

// ── Sidebar de la vista del Abogado (diseño Fajardo) ──
// Tres secciones: Consulta · Historial · Asignar tareas cliente.
const items = [
  { id: 'consulta', label: 'Consulta', icon: Search },
  { id: 'historial', label: 'Historial', icon: History },
  { id: 'asignar', label: 'Asignar tareas cliente', icon: ClipboardList },
  { id: 'registrar', label: 'Registrar Proceso', icon: PlusCircle },
]

export default function AbogadoSidebar({ vista, setVista }) {
  return (
    <aside
      className="flex h-full flex-col rounded-[26px] border border-[#262626] bg-[#0F0F0F] p-5
                 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.9)]"
    >
      <p className="mb-4 px-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
        Navegación
      </p>

      <nav className="space-y-3">
        {items.map(({ id, label, icon: Icon }) => {
          const active = vista === id
          return (
            <button
              key={id}
              onClick={() => setVista(id)}
              className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-semibold
                          transition-all duration-150
                          ${
                            active
                              ? 'border-[#A30F0A]/60 bg-[#84120C] text-white shadow-[0_0_18px_-4px_rgba(163,15,10,0.7)]'
                              : 'border-[#2A2A2A] bg-[#161616] text-white/80 hover:border-[#3A3A3A] hover:bg-[#1C1C1C]'
                          }`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full
                            ${active ? 'bg-black/30' : 'bg-[#202020]'}`}
              >
                <Icon size={15} />
              </span>
              <span className="leading-tight">{label}</span>
            </button>
          )
        })}
      </nav>

      <div className="mt-auto border-t border-[#222] pt-4">
        <p className="text-[12px] font-semibold text-white/55">Solo casos admitidos</p>
        <p className="text-[12px] text-white/35">Demandante / demandado</p>
      </div>
    </aside>
  )
}
