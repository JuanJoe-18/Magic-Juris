import { AlarmClock, ClipboardList, History, PlusCircle, Search, Sparkles } from 'lucide-react'

const items = [
  { id: 'consulta', label: 'Consulta', icon: Search },
  { id: 'alertas', label: 'Alertas', icon: AlarmClock },
  { id: 'resumenes', label: 'Resúmenes IA', icon: Sparkles },
  { id: 'historial', label: 'Historial', icon: History },
  { id: 'asignar', label: 'Asignar tareas cliente', icon: ClipboardList },
  { id: 'registrar', label: 'Registrar Proceso', icon: PlusCircle },
]

export default function AbogadoSidebar({ vista, setVista }) {
  return (
    <aside className="flex h-full min-h-[760px] flex-col rounded-[30px] border border-[#2A2A2A] bg-[#111111] p-6 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.95)]">
      <p className="mb-5 px-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-white/40">
        Navegacion
      </p>

      <nav className="space-y-4">
        {items.map(({ id, label, icon: Icon }) => {
          const active = vista === id
          return (
            <button
              key={id}
              onClick={() => setVista(id)}
              className={`flex w-full items-center gap-3 rounded-2xl border px-5 py-4 text-left text-[1rem] font-semibold transition-all duration-150 ${
                active
                  ? 'border-[#8F1B13] bg-gradient-to-r from-[#7A120D] to-[#B4170F] text-white shadow-[0_0_18px_-8px_rgba(163,15,10,0.95)]'
                  : 'border-[#313131] bg-[#151515] text-white/88 hover:border-[#454545] hover:bg-[#191919]'
              }`}
            >
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                  active ? 'bg-black/20' : 'bg-[#1E1E1E]'
                }`}
              >
                <Icon size={19} />
              </span>
              <span>{label}</span>
            </button>
          )
        })}
      </nav>

      <div className="mt-auto pt-8">
        <div className="h-px bg-white/10" />
      </div>
    </aside>
  )
}
